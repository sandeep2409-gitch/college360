import dbConnect from '@/lib/mongodb';
import Resource from '@/models/Resource';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { unlinkSync, existsSync } from 'fs';
import path from 'path';

export async function PUT(request, { params }) {
  await dbConnect();
  const { error, status } = requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  try {
    const resource = await Resource.findById(id);
    if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });

    if (resource.fileUrl) {
      const filename = path.basename(resource.fileUrl);
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
      if (existsSync(filePath)) unlinkSync(filePath);
    }

    await Resource.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Resource rejected and deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
