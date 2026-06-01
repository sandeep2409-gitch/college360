import dbConnect from '@/lib/mongodb';
import Timetable from '@/models/Timetable';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    const timetables = await Timetable.find().select('className');
    return NextResponse.json(timetables.map(t => t.className));
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
