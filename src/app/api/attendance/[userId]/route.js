import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  await dbConnect();
  const { error, status, user } = requireAuth(request);
  if (error) return NextResponse.json({ error }, { status });

  const { userId } = await params;

  if (user.role !== 'admin' && user.id !== userId) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const records = await Attendance.find({ userId }).sort({ date: -1 });
    return NextResponse.json(records);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
