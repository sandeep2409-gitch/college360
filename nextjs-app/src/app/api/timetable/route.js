import dbConnect from '@/lib/mongodb';
import Timetable from '@/models/Timetable';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const className = searchParams.get('className');

  try {
    if (className) {
      const tt = await Timetable.findOne({ className });
      return NextResponse.json(tt ? tt.data : null);
    } else {
      const tt = await Timetable.findOne();
      return NextResponse.json(tt ? { data: tt.data, className: tt.className } : null);
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  const { error, status } = requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  const { className, data } = await request.json();
  if (!className || !data) {
    return NextResponse.json({ error: 'Class name and data are required' }, { status: 400 });
  }

  try {
    await Timetable.findOneAndUpdate(
      { className },
      { className, data },
      { upsert: true, new: true }
    );
    return NextResponse.json({ message: 'Timetable updated successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
