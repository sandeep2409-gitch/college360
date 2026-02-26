import dbConnect from '@/lib/mongodb';
import Resource from '@/models/Resource';
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET() {
  await dbConnect();
  try {
    const resources = await Resource.find({ status: 'approved' }).sort({ createdAt: -1 });
    return NextResponse.json(resources);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  const { error, status, user } = requireAuth(request);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const formData = await request.formData();
    const title = formData.get('title');
    const category = formData.get('category');
    const file = formData.get('file');

    let fileUrl = '';
    let fileSize = '0 MB';
    let fileType = 'PDF';

    if (file && file.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const filename = `${Date.now()}-${file.name}`;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(path.join(uploadsDir, filename), buffer);

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      fileUrl = `${baseUrl}/uploads/${filename}`;
      fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      fileType = path.extname(file.name).substring(1).toUpperCase();
    }

    const resourceStatus = user.role === 'admin' ? 'approved' : 'pending';

    const resource = await Resource.create({
      title,
      category,
      fileUrl,
      uploadedBy: user.id,
      status: resourceStatus,
    });

    return NextResponse.json({
      id: resource._id.toString(),
      fileUrl,
      size: fileSize,
      type: fileType,
      status: resourceStatus,
      date: new Date().toISOString().split('T')[0],
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
