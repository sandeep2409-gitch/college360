import dbConnect from '@/lib/mongodb';
import Resource from '@/models/Resource';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  await dbConnect();
  const { error, status } = requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  try {
    await Resource.findByIdAndUpdate(id, { status: 'approved' });
    return NextResponse.json({ message: 'Resource approved' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
