import { requireAdmin, signToken } from '@/lib/auth';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

export async function GET(request) {
  const { error, status } = requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  const sessionId = Math.random().toString(36).substring(7);
  const token = jwt.sign(
    { sessionId, type: 'attendance_session', iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: '5m' }
  );

  return NextResponse.json({ token, sessionId });
}
