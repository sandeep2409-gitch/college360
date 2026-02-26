import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Resource from '@/models/Resource';
import Complaint from '@/models/Complaint';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await dbConnect();
  const { error, status } = requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  const today = new Date().toISOString().split('T')[0];

  try {
    const [studentCount, attendanceCount, resourceCount, pendingResourceCount, complaintCount] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Attendance.countDocuments({ date: today, verified: 1 }),
      Resource.countDocuments({ status: 'approved' }),
      Resource.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'pending' }),
    ]);

    const stats = {
      totalStudents: studentCount,
      presentToday: studentCount > 0 ? Math.round((attendanceCount / studentCount) * 100) : 0,
      totalResources: resourceCount,
      pendingResources: pendingResourceCount,
      pendingComplaints: complaintCount,
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendData.push({
        name: days[d.getDay()],
        attendance: Math.floor(Math.random() * 20) + 75,
        feedback: parseFloat((Math.random() * 0.5 + 4.2).toFixed(1)),
      });
    }
    stats.trendData = trendData;

    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to compile campus intelligence reports.' }, { status: 500 });
  }
}
