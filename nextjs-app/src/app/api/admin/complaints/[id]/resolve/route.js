import dbConnect from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  await dbConnect();
  const { error, status } = requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  try {
    await Complaint.findByIdAndUpdate(id, { status: 'resolved' });
    return NextResponse.json({ message: 'Complaint resolved' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
