import dbConnect from '@/lib/mongodb';
import Resource from '@/models/Resource';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await dbConnect();
  const { error, status } = requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const resources = await Resource.find({ status: 'pending' }).populate('uploadedBy', 'name').sort({ createdAt: -1 });
    const formatted = resources.map(r => ({
      ...r.toObject(),
      id: r._id.toString(),
      uploaderName: r.uploadedBy?.name || 'Unknown',
    }));
    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
