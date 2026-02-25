import React from 'react';
import { Camera, BookOpen, MessageSquare, AlertCircle, Calendar, Shield, ArrowRight, Layout, CheckCircle, UserPlus, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Attendance',
      desc: 'AI Facial Recognition & Geofencing presence marking.',
      icon: Camera,
      path: '/attendance',
      color: '#6366f1',
      protected: true
    },
    {
      title: 'Digital Library',
      desc: 'Access and share curated academic resources and notes.',
      icon: BookOpen,
      path: '/resources',
      color: '#8b5cf6',
      protected: true
    },
    {
      title: 'Faculty Feedback',
      desc: 'Evaluate teaching standards via anonymous submissions.',
      icon: MessageSquare,
      path: '/feedback',
      color: '#10b981',
      protected: true
    },
    {
      title: 'Complaint Portal',
      desc: 'Report campus issues securely with identity protection.',
      icon: AlertCircle,
      path: '/complaints',
      color: '#f43f5e',
      protected: true
    },
    {
      title: 'Event Calendar',
      desc: 'Track exams, cultural fests, and campus holidays.',
      icon: Calendar,
      path: '/calendar',
      color: '#f59e0b',
      protected: true
    },
    {
      title: 'Time Table',
      desc: 'View your weekly academic schedule and classroom locations.',
      icon: Clock,
      path: '/timetable',
      color: '#f59e0b',
      protected: true
    },
    {
      title: 'Add Students',
      desc: 'Onboard new students to the university database.',
      icon: UserPlus,
      path: '/manage-students',
      color: '#ec4899',
      protected: true,
      adminOnly: true
    },
    {
      title: 'Admin Dashboard',
      desc: 'Master controls for campus data and student management.',
      icon: Shield,
      path: '/dashboard',
      color: '#6366f1',
      protected: true,
      adminOnly: true
    }
  ];

  const handleModuleClick = (path, isProtected, isAdminOnly) => {
    if (isProtected && !user) {
      navigate('/login');
      return;
    }
    if (isAdminOnly && user?.role !== 'admin') {
      alert('Access restricted to Administrators only.');
      return;
    }
    navigate(path);
  };

  return (
    <div className="landing-page" style={{ paddingBottom: '100px', maxWidth: '1400px', margin: '0 auto', padding: '0 5%' }}>
      {}
      <header style={{
        textAlign: 'center',
        padding: '120px 0 100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div className="badge animate-fade-in" style={{
          background: 'rgba(99, 102, 241, 0.1)',
          color: 'var(--primary)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          padding: '8px 16px',
          borderRadius: '50px',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '25px'
        }}>
          ✨ Next-Gen Campus Operating System
        </div>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          lineHeight: 1.1,
          marginBottom: '20px',
          maxWidth: '900px',
          fontWeight: '800',
          letterSpacing: '-0.02em'
        }}>
          Campus management system
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-dim)',
          maxWidth: '750px',
          margin: '0 auto 50px',
          lineHeight: 1.6
        }}>
          <span style={{
            display: 'block',
            fontSize: '1.8rem',
            fontWeight: '700',
            background: 'linear-gradient(to right, var(--primary), #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '10px'
          }}>
            Automated & Intelligent.
          </span>
          This campus management system provides a unified, AI-powered interface for all university services.
        </p>

        {user?.role === 'admin' && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            <Link to="/manage-students" style={{ textDecoration: 'none' }}>
              <button
                className="btn-primary"
                style={{
                  padding: '16px 40px',
                  fontSize: '1rem',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  boxShadow: '0 8px 30px rgba(236, 72, 153, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <UserPlus size={20} /> Manage Students
              </button>
            </Link>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  padding: '16px 40px',
                  fontSize: '1rem',
                  borderRadius: '16px',
                  background: 'transparent',
                  border: '2px solid var(--border)',
                  color: 'var(--text-main)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Shield size={20} /> Admin Panel
              </button>
            </Link>
          </div>
        )}

        {!user && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button
                className="btn-primary"
                style={{
                  padding: '16px 40px',
                  fontSize: '1rem',
                  borderRadius: '16px',
                  boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)'
                }}
              >
                Sign In
              </button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  padding: '16px 40px',
                  fontSize: '1rem',
                  borderRadius: '16px',
                  background: 'transparent',
                  border: '2px solid var(--border)',
                  color: 'var(--text-main)',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.background = 'var(--bg-card)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.background = 'transparent';
                }}
              >
                Join Campus
              </button>
            </Link>
          </div>
        )}
      </header>

      {}
      <section>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>System Modules</h2>
            <p style={{ color: 'var(--text-dim)' }}>Quick access to core campus utilities</p>
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '10px 20px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600' }}>
              <CheckCircle size={18} /> Logged in: {user.name}
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {modules.map((mod, i) => (
            <div
              key={i}
              className="glass-card module-card"
              onClick={() => handleModuleClick(mod.path, mod.protected, mod.adminOnly)}
              style={{
                padding: '32px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                display: mod.adminOnly && user?.role !== 'admin' ? 'none' : 'block'
              }}
            >
              <div style={{
                background: `${mod.color}15`,
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                border: `1px solid ${mod.color}30`
              }}>
                <mod.icon size={28} color={mod.color} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', fontWeight: '700' }}>{mod.title}</h3>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, fontSize: '0.95rem' }}>{mod.desc}</p>

              <div className="module-arrow" style={{
                position: 'absolute',
                bottom: '32px',
                right: '32px',
                color: mod.color,
                opacity: 0,
                transform: 'translateX(-10px)',
                transition: 'all 0.3s'
              }}>
                <ArrowRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .module-card:hover {
          transform: translateY(-8px);
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.05);
        }
        .module-card:hover .module-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Landing;
