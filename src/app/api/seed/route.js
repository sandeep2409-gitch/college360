import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    const adminEmail = 'admin@college.edu';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      return NextResponse.json({ message: 'Default admin created: admin@college.edu / admin123' });
    }
    return NextResponse.json({ message: 'Admin already exists' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
