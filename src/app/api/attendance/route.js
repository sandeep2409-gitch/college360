import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

export async function POST(request) {
  await dbConnect();
  const { error, status, user } = requireAuth(request);
  if (error) return NextResponse.json({ error }, { status });

  const { studentId, status: attStatus, qrToken } = await request.json();
  const date = new Date().toISOString().split('T')[0];

  if (!qrToken) {
    return NextResponse.json({ error: 'QR code verification required for security.' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(qrToken, JWT_SECRET);
    if (decoded.type !== 'attendance_session') {
      return NextResponse.json({ error: 'Invalid QR code type.' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'QR code expired or invalid. Please scan a fresh QR.' }, { status: 400 });
  }

  try {
    const student = await User.findOne({ studentId });
    if (!student) return NextResponse.json({ error: 'Student ID not found' }, { status: 404 });

    const existing = await Attendance.findOne({ userId: student._id, date });
    if (existing) {
      return NextResponse.json({ error: 'Attendance already marked for today.' }, { status: 400 });
    }

    const attendance = await Attendance.create({
      userId: student._id,
      date,
      status: attStatus || 'present',
      verified: 1,
    });

    return NextResponse.json({
      id: attendance._id.toString(),
      userId: student._id.toString(),
      name: student.name,
      date,
      status: attStatus || 'present',
      verified: 1,
      message: 'Attendance recorded successfully with multi-factor verification.',
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
