import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { NextResponse } from 'next/server';

export async function POST(request) {
  await dbConnect();
  const { facultyName, rating, comment } = await request.json();

  try {
    await Feedback.create({ facultyName, rating, comment });
    return NextResponse.json({ message: 'Feedback submitted anonymously' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
