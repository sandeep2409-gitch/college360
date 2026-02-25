import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, CheckCircle, Clock, Loader2, Calendar, MapPin, Camera, Star, BookOpen, Send, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    totalResources: 0,
    pendingComplaints: 0,
    trendData: []
  });
  const [studentStats, setStudentStats] = useState({
    attendancePercentage: 0,
    daysPresent: 0,
    totalDays: 0,
    pendingDays: 0,
    recentHistory: [],
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const response = await axios.get('http://localhost:5001/api/admin/stats');
        setStats(response.data);
      } else {
        const response = await axios.get(`http://localhost:5001/api/attendance/${user.id}`);
        const total = response.data.length;
        
        setStudentStats({
          attendancePercentage: total > 0 ? 100 : 0, // Placeholder for actual rate if we had total sessions
          daysPresent: total,
          totalDays: total,
          recentHistory: response.data.slice(0, 5),
          chartData: [
            { name: 'Verified Presence', value: total, color: '#10b981' }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ background: `${color}15`, padding: '15px', borderRadius: '12px' }}>
        <Icon style={{ color }} size={24} />
      </div>
      <div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{label}</p>
        <h2 style={{ fontSize: '1.5rem' }}>{value}</h2>
      </div>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="student-dashboard">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ marginBottom: '5px' }}>Welcome back, {user?.name}!</h1>
          <p style={{ color: 'var(--text-dim)' }}>Your identity and location are being verified in real-time.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <StatCard icon={CheckCircle} label="Total Presence" value={studentStats.daysPresent} color="#10b981" />
              <StatCard icon={ShieldCheck} label="System Status" value="Secure" color="#6366f1" />
            </div>
            
            <div className="glass-card" style={{ 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={20} color="var(--primary)" /> Smart Portal
              </h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Mark your daily attendance instantly via AI face recognition and geofencing.
              </p>
              <Link to="/attendance">
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 25px' }}>
                  <Camera size={18} /> Open Attendance Portal
                </button>
              </Link>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>Verification Summary</h4>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentStats.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {studentStats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                <span>Verified: {studentStats.daysPresent} Days</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="glass-card">
            <h4 style={{ marginBottom: '15px' }}>Academic Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/resources" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>• Study Resources Hub</Link>
              <Link to="/calendar" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>• Campus Event Calendar</Link>
              <Link to="/feedback" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>• Faculty Feedback Form</Link>
            </div>
          </div>
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px', fontSize: '1rem' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {studentStats.recentHistory.map((log, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--card-inner)', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <span>{log.date}</span>
                  <span style={{ color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle size={14} /> VERIFIED
                  </span>
                </div>
              ))}
              {studentStats.recentHistory.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No recent logs found.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '10px 20px', borderRadius: '8px' }}>Export Report</button>
          <button className="btn-primary">Generate Batch ID</button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents.toLocaleString()} color="#6366f1" />
        <StatCard icon={CheckCircle} label="Present Today" value={`${stats.presentToday}%`} color="#10b981" />
        <StatCard icon={FileText} label="Total Resources" value={stats.totalResources.toLocaleString()} color="#8b5cf6" />
        <StatCard icon={Clock} label="Pending Complaints" value={stats.pendingComplaints} color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ height: '400px' }}>
          <h3 style={{ marginBottom: '20px' }}>Attendance Trends</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={stats.trendData}>
              <defs>
                <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="name" stroke="var(--text-dim)" />
              <YAxis stroke="var(--text-dim)" />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
              />
              <Area type="monotone" dataKey="attendance" stroke="#6366f1" fillOpacity={1} fill="url(#colorAttend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ height: '400px' }}>
          <h3 style={{ marginBottom: '20px' }}>Faculty Feedback Rating</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={stats.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="name" stroke="var(--text-dim)" />
              <YAxis stroke="var(--text-dim)" domain={[0, 5]} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--tooltip-text)' }}
              />
              <Line type="monotone" dataKey="feedback" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '20px' }}>System Management</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--card-inner)', border: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: '10px' }}>Student Admissions</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '15px' }}>Register new students, assign IDs, and manage student enrollments.</p>
            <button 
              onClick={() => window.location.href='/manage-students'}
              style={{ color: 'var(--primary)', background: 'transparent', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              Manage Students →
            </button>
          </div>
          <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--card-inner)', border: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: '10px' }}>Attendance Hub</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '15px' }}>Access master logs, AI verification scanner, and override history.</p>
            <Link to="/attendance" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Open Master Portal →</Link>
          </div>
          <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--card-inner)', border: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: '10px' }}>Campus Events</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '15px' }}>Schedule exams, cultural fests, and holidays on the official calendar.</p>
            <button 
              onClick={() => window.location.href='/calendar'}
              style={{ color: 'var(--primary)', background: 'transparent', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              Update Calendar →
            </button>
          </div>
          <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--card-inner)', border: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: '10px' }}>Anonymous Grievances</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '15px' }}>Review student reports and feedback while maintaining privacy.</p>
            <Link to="/complaints" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Review Reports →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
