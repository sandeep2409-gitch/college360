import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, CheckCircle, Clock, Loader2, Calendar, MapPin, Camera, Star, BookOpen, Send, ShieldCheck, ChevronRight, AlertCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, token } = useAuth();
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
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (isAdmin) {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, config);
        setStats(prev => ({ ...prev, ...response.data }));
      } else {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/${user.id}`, config);
        const history = Array.isArray(response.data) ? response.data : [];
        const total = history.length;

        setStudentStats({
          attendancePercentage: total > 0 ? 100 : 0,
          daysPresent: total,
          totalDays: total,
          recentHistory: history.slice(0, 5),
          chartData: [
            { name: 'Verified Presence', value: total, color: '#10b981' }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError("Failed to sync with campus network. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) fetchData();
  }, [user?.id, isAdmin, token]);

  const StatCard = ({ icon: Icon, label, value, color }) => {

    const isVar = typeof color === 'string' && color.startsWith('var');
    const dynamicBadgeColor = isVar ? `${color.replace(')', '-glow)')}` : `${color}20`;

    return (
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
        <div style={{
          background: isVar ? `rgba(99, 102, 241, 0.1)` : dynamicBadgeColor,
          padding: '16px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon style={{ color: isVar ? color : color }} size={26} />
        </div>
        <div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>{label}</p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{value}</h2>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={48} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: '600' }}>Syncing Campus Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }} className="glass-card">
          <AlertCircle size={56} color="var(--danger)" style={{ marginBottom: '24px' }} />
          <h2 style={{ marginBottom: '12px' }}>Network Outage</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '32px', lineHeight: '1.6' }}>The dashboard couldn't synchronize with the university intelligence grid.</p>
          <button onClick={fetchData} className="btn-primary" style={{ width: '100%', padding: '16px' }}>
            Try Re-establishing Uplink
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="student-dashboard animate-slide-up" style={{ padding: '0 5%' }}>
        <header className="page-header" style={{ marginBottom: '48px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              <ShieldCheck size={14} /> System Verified
            </div>
            <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Welcome, {user?.name}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <button onClick={fetchData} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', color: 'var(--text-main)' }}>
                <Clock size={18} />
             </button>
             <Link to="/attendance">
                <button className="btn-primary"><Camera size={18} /> Record Entry</button>
             </Link>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <StatCard icon={CheckCircle} label="Attendance" value={`${studentStats.daysPresent} Days`} color="var(--success)" />
              <StatCard icon={Star} label="Academic Standing" value="8.4 GPA" color="var(--warning)" />
            </div>

            <div className="glass-card" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'var(--primary-glow)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.5 }}></div>
              <div style={{ background: 'white', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <MapPin size={22} color="var(--primary)" />
              </div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>Geofencing Active</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '28px', lineHeight: '1.6' }}>
                Your position is being verified via campus Wi-Fi nodes for automatic attendance marking.
              </p>
              <button disabled className="btn-primary" style={{ width: '100%', opacity: 0.8, cursor: 'default', background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'none' }}>
                Verification in Progress
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '32px' }}>
            <h4 style={{ marginBottom: '24px', fontSize: '1rem', color: 'var(--text-dim)', fontWeight: '600' }}>Compliance Rating</h4>
            <div style={{ flex: 1, minHeight: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentStats.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {studentStats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--success)' }}>{studentStats.attendancePercentage}%</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Presence Score</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <h4 style={{ marginBottom: '24px', fontSize: '1.1rem', fontWeight: '700' }}>Academic Hub</h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { to: '/timetable', label: 'Academic Schedule (Time Table)', icon: Clock, color: '#f59e0b', desc: 'View today\'s class lineup' },
                { to: '/resources', label: 'E-Library & Courseware', icon: BookOpen, color: '#6366f1', desc: 'Access study materials' },
                { to: '/calendar', label: 'University Schedule', icon: Calendar, color: '#3b82f6', desc: 'Upcoming exam dates' },
                { to: '/profile', label: 'My Digital Identity', icon: User, color: '#10b981', desc: 'View personal records' }
              ].map((link, idx) => (
                <Link key={idx} to={link.to} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  textDecoration: 'none',
                  color: 'var(--text-main)',
                  padding: '16px',
                  background: 'var(--card-inner)',
                  borderRadius: '16px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  border: '1px solid var(--border-light)',
                  transition: 'all 0.3s'
                }} className="hover-trigger">
                  <div style={{ background: `${link.color}20`, padding: '10px', borderRadius: '12px', color: link.color }}>
                    <link.icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem' }}>{link.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '400' }}>{link.desc}</div>
                  </div>
                  <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                </Link>
              ))}
            </nav>
          </div>

          <div className="glass-card" style={{ padding: '32px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Next Milestone</h4>
                <Link to="/calendar" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '800' }}>VIEW CALENDAR</Link>
             </div>
             
             <div style={{ background: 'var(--card-inner)', border: '1px solid var(--primary-glow)', borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: 'var(--primary-glow)', borderRadius: '50%', filter: 'blur(20px)', opacity: 0.3 }}></div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '16px', textAlign: 'center', minWidth: '60px', border: '1px solid var(--border)' }}>
                        <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)' }}>28</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase' }}>FEB</span>
                    </div>
                    <div>
                        <h5 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>Mid-Term Assessment</h5>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Main Hall • 09:30 AM</p>
                    </div>
                </div>
             </div>

             <div style={{ marginTop: '24px' }}>
               <h4 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: '700', opacity: 0.8 }}>Recent Activity</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {(studentStats.recentHistory || []).slice(0, 3).map((log, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></div>
                        <span style={{ color: 'var(--text-dim)' }}>Authenticated at Main Entrance</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.date}</span>
                    </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-slide-up" style={{ padding: '0 5%' }}>
      <header className="page-header" style={{ marginBottom: '48px' }}>
        <div>
          <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
            Campus Command Center
          </div>
          <h1 className="page-title" style={{ fontSize: '2.75rem' }}>University Audit</h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={fetchData} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', boxShadow: 'none' }}>
            <Clock size={18} /> Refresh Grid
          </button>
          <Link to="/manage-students">
            <button className="btn-primary"><Users size={18} /> Provision Student</button>
          </Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px', marginBottom: '48px' }}>
        <StatCard icon={Users} label="Active Students" value={(stats?.totalStudents || 0).toLocaleString()} color="var(--primary)" />
        <StatCard icon={CheckCircle} label="Today's Presence" value={`${stats?.presentToday || 0}%`} color="var(--success)" />
        <StatCard icon={BookOpen} label="Learning Assets" value={(stats?.totalResources || 0).toLocaleString()} color="#8b5cf6" />
        <StatCard icon={Clock} label="Pending Reviews" value={stats?.pendingComplaints || 0} color="var(--warning)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px', marginBottom: '48px' }}>
        <div className="glass-card" style={{ height: '450px', display: 'flex', flexDirection: 'column', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Engagement Velocity</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>7-Day campus participation index</p>
            </div>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>LIVE ANALYTICS</div>
          </div>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trendData || []}>
                <defs>
                  <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: '600' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: '600' }} />
                <Tooltip
                  cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }}
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', padding: '12px 16px' }}
                />
                <Area type="monotone" dataKey="attendance" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorAttend)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ height: '450px', display: 'flex', flexDirection: 'column', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Sentiment Pulse</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Student feedback satisfaction average</p>
            </div>
             <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>POSITIVE TREND</div>
          </div>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: '600' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: '600' }} domain={[4, 5]} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', padding: '12px 16px' }}
                />
                <Line type="monotone" dataKey="feedback" stroke="var(--success)" strokeWidth={5} dot={{ r: 6, fill: 'var(--success)', strokeWidth: 0 }} activeDot={{ r: 9, stroke: 'white', strokeWidth: 2 }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '40px' }}>
        <h3 style={{ marginBottom: '32px', fontSize: '1.5rem', fontWeight: '800' }}>Campus Operations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { title: 'Student Management', desc: 'Registry control, ID issuance and role audit.', to: '/manage-students', label: 'Student CRM', icon: Users, color: '#6366f1' },
            { title: 'Security & Access', desc: 'Facial recognition logs and attendance overrides.', to: '/attendance', label: 'Monitor Grid', icon: ShieldCheck, color: '#10b981' },
            { title: 'Academic Planning', desc: 'Course scheduling and institutional milestones.', to: '/calendar', label: 'Planner', icon: Calendar, color: '#f59e0b' },
            { title: 'Curriculum & Schedule', desc: 'Manage official class time tables and teacher assignments.', to: '/timetable', label: 'Edit Timetable', icon: Clock, color: '#f97316' },
            { title: 'Resolution Desk', desc: 'Direct channel for student complaint triage.', to: '/complaints', label: 'Complaints', icon: MessageSquare, color: '#ef4444' }
          ].map((module, i) => (
            <div key={i} style={{ padding: '32px', borderRadius: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', transition: 'all 0.3s' }} className="hover-card">
              <div style={{ background: `${module.color}15`, width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: module.color }}>
                <module.icon size={24} />
              </div>
              <h4 style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: '700' }}>{module.title}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '28px', lineHeight: '1.6' }}>{module.desc}</p>
              <Link to={module.to} style={{
                color: module.color,
                textDecoration: 'none',
                fontWeight: '800',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                letterSpacing: '0.02em'
              }}>
                {module.label} <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
