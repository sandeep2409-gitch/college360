'use client';
import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Award, Calendar, Clock, BookOpen, Camera, Edit2, LogOut, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ attendance: 0, resources: 0, complaints: 0 });
  const [loading, setLoading] = useState(true);

  const fetchProfileStats = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const attRes = await axios.get(`/api/attendance/${user.id}`, config);
      const attendanceCount = Array.isArray(attRes.data) ? attRes.data.length : 0;
      setStats({ attendance: attendanceCount, resources: user.role === 'admin' ? 'All' : '5+', complaints: 0 });
    } catch (error) {
      console.error("Error fetching profile stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProfileStats();
  }, [user, token]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const StatItem = ({ icon: Icon, label, value, color }) => (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
      <div style={{ background: `${color}15`, padding: '12px', borderRadius: '12px', color: color }}>
        <Icon size={24} />
      </div>
      <div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px', fontWeight: '600' }}>{label}</p>
        <h4 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{value}</h4>
      </div>
    </div>
  );

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>;
  }

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div className="glass-card" style={{ padding: '40px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'var(--primary-glow)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px', position: 'relative', zIndex: 2 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '4px solid var(--primary)', padding: '5px', background: 'var(--bg-card)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--card-inner)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={80} color="var(--primary)" />
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--primary)', padding: '10px', borderRadius: '50%', color: 'white', border: '4px solid var(--bg-card)', cursor: 'pointer' }}>
              <Camera size={18} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{user?.name}</h1>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '5px 15px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {user?.role}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} /> ID: {user?.studentId || 'N/A'}
                  </span>
                </div>
              </div>
              <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                <Edit2 size={16} /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <StatItem icon={Calendar} label="Days Present" value={stats.attendance} color="#10b981" />
        <StatItem icon={BookOpen} label="Shared Assets" value={stats.resources} color="#6366f1" />
        <StatItem icon={Clock} label="Pending Tasks" value="3" color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><Shield size={22} color="var(--primary)" /> Academic Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Official Email</span>
              <span style={{ fontWeight: '600' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Department</span>
              <span style={{ fontWeight: '600' }}>Computer Science</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Joining Date</span>
              <span style={{ fontWeight: '600' }}>Aug 2023</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Current Semester</span>
              <span style={{ fontWeight: '600' }}>Spring 2024</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><Settings size={22} color="var(--primary)" /> Grid Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--card-inner)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Two-Factor Auth</span>
              <div style={{ width: '40px', height: '22px', background: 'var(--success)', borderRadius: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', right: '2px', top: '2px', width: '18px', height: '18px', background: 'white', borderRadius: '50%' }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--card-inner)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Email Notifications</span>
              <div style={{ width: '40px', height: '22px', background: 'var(--border)', borderRadius: '20px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '2px', top: '2px', width: '18px', height: '18px', background: 'white', borderRadius: '50%' }}></div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '16px', border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', transition: '0.3s' }}>
              <LogOut size={20} /> Terminate Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
