import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  await dbConnect();
  const { error, status } = requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  try {
    await Feedback.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
