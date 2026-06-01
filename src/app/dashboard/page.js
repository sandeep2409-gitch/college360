'use client';
import React, { useState, useEffect } from 'react';
import { Users, BookOpen, AlertCircle, TrendingUp, Calendar, Loader2, BarChart2, Clock, QrCode } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        if (isAdmin) {
          const res = await axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
          setStats(res.data);
        } else {
          const res = await axios.get(`/api/attendance/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
          setAttendanceRecords(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, user]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>;
  }

  if (isAdmin && stats) {
    return (
      <div className="animate-slide-up">
        <div style={{ marginBottom: '40px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administrator</span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '5px' }}>Campus Intelligence</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: '5px' }}>Real-time metrics and analytics overview</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {[
            { icon: Users, label: 'Total Students', value: stats.totalStudents, color: '#31572c', gradient: 'linear-gradient(135deg, #31572c, #4f772d)' },
            { icon: QrCode, label: 'Present Today', value: `${stats.presentToday}%`, color: '#4a7c59', gradient: 'linear-gradient(135deg, #4a7c59, #689f7d)' },
            { icon: BookOpen, label: 'Resources', value: stats.totalResources, color: '#dda15e', gradient: 'linear-gradient(135deg, #dda15e, #e9c46a)' },
            { icon: AlertCircle, label: 'Pending Issues', value: stats.pendingComplaints, color: '#b05b4c', gradient: 'linear-gradient(135deg, #b05b4c, #c87a6b)' },
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '80px', height: '80px', background: stat.gradient, borderRadius: '50%', opacity: 0.1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: stat.gradient, padding: '14px', borderRadius: '16px', color: 'white' }}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>{stat.label}</p>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{stat.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stats.trendData && (
          <div className="glass-card" style={{ padding: '32px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>Weekly Attendance Trend</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>7-day campus attendance overview</p>
              </div>
              <TrendingUp size={24} color="var(--primary)" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)' }} />
                <Line type="monotone" dataKey="attendance" stroke="#4a7c59" strokeWidth={3} dot={{ fill: '#4a7c59', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  // Student Dashboard
  const attendancePercentage = attendanceRecords.length > 0 ? Math.min(100, Math.round((attendanceRecords.length / 30) * 100)) : 0;

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: '40px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Student Portal</span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '5px' }}>Welcome, {user?.name}</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '5px' }}>Your personalized campus overview</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {[
          { icon: Calendar, label: 'Days Present', value: attendanceRecords.length, color: '#4a7c59' },
          { icon: BarChart2, label: 'Attendance %', value: `${attendancePercentage}%`, color: '#31572c' },
          { icon: Clock, label: 'This Month', value: attendanceRecords.filter(r => r.date?.startsWith(new Date().toISOString().slice(0, 7))).length, color: '#dda15e' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: `${stat.color}20`, padding: '14px', borderRadius: '16px', color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: '600', marginBottom: '4px' }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        <h3 style={{ marginBottom: '20px' }}>Recent Attendance Records</h3>
        {attendanceRecords.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {attendanceRecords.slice(0, 10).map((rec, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--card-inner)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontWeight: '600' }}>{rec.date}</span>
                <span style={{ color: 'var(--success)', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem' }}>{rec.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '30px' }}>No attendance records yet.</p>
        )}
      </div>
    </div>
  );
}
