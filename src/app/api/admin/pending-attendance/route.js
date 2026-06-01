import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await dbConnect();
  const { error, status } = requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const records = await Attendance.find().populate('userId', 'name studentId').sort({ date: -1 });
    const formatted = records.map(r => ({
      id: r._id.toString(),
      userId: r.userId?._id?.toString(),
      name: r.userId?.name || 'Unknown',
      studentId: r.userId?.studentId || 'N/A',
      date: r.date,
      status: r.status,
      verified: r.verified,
    }));
    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
