import dbConnect from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { NextResponse } from 'next/server';

export async function POST(request) {
  await dbConnect();
  const { title, description } = await request.json();

  try {
    await Complaint.create({ title, description, status: 'pending' });
    return NextResponse.json({ message: 'Complaint filed anonymously' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
