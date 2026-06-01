import dbConnect from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await dbConnect();
  const { error, status } = requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    return NextResponse.json(complaints);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
