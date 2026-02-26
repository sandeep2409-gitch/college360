import dbConnect from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await dbConnect();
  const { error, status } = requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const feedbackList = await Feedback.find().sort({ createdAt: -1 });
    return NextResponse.json(feedbackList);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
