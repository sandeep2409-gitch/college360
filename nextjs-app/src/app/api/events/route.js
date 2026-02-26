import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    const events = await Event.find().sort({ date: 1 });
    return NextResponse.json(events);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  const { error, status } = requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  const { title, date, location, description, type } = await request.json();

  try {
    const event = await Event.create({ title, date, location, description, type });
    return NextResponse.json({
      id: event._id.toString(),
      title, date, location, description, type
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
