import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  await dbConnect();
  const { name, email, password, role, studentId } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      studentId: studentId || undefined,
    });

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
      }
    }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) {
      const field = err.keyPattern?.email ? 'Email' : 'Student ID';
      return NextResponse.json({ error: `${field} already exists` }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
