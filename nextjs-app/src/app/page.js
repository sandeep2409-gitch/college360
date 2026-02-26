'use client';
import React from 'react';
import Link from 'next/link';
import {
  QrCode, BookOpen, Star, AlertCircle, Calendar, Users, Shield, Zap,
  Cpu, Eye, Globe, BarChart2, ChevronRight, ArrowRight, Layout, Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const modules = [
    { icon: QrCode, title: 'Smart Attendance', desc: 'Multi-factor verification with QR scanning, geolocation, and facial recognition.', path: '/attendance', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    { icon: BookOpen, title: 'Resource Nexus', desc: 'Upload, share, and discover academic materials with admin approval workflows.', path: '/resources', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
    { icon: Star, title: 'Faculty Intel', desc: 'Anonymous faculty feedback system with real-time analytics and insights.', path: '/feedback', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
    { icon: AlertCircle, title: 'Grievance Portal', desc: 'Secure anonymous complaint system with tracking and resolution pipeline.', path: '/complaints', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #f87171)' },
    { icon: Calendar, title: 'Event Calendar', desc: 'Comprehensive academic, cultural, and campus event management system.', path: '/calendar', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
    { icon: Clock, title: 'Time Table', desc: 'View and manage institutional class schedules and period timings.', path: '/timetable', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #fb923c)' },
  ];

  const adminModules = [
    { icon: Users, title: 'Student Registry', desc: 'Complete student management with provisioning and access control.', path: '/manage-students', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
    { icon: BarChart2, title: 'Analytics Matrix', desc: 'Real-time campus analytics, attendance trends, and performance metrics.', path: '/dashboard', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', pointerEvents: 'none', opacity: 0.3 }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--card-inner)', border: '1px solid var(--border)', borderRadius: '100px', padding: '8px 20px', marginBottom: '24px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          <Zap size={14} /> Campus Management Automated & Intelligent
        </div>

        <h1 className="page-title" style={{ fontSize: '4rem', marginBottom: '15px', maxWidth: '800px', margin: '0 auto 15px' }}>
          College 360 Platform
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.8 }}>
          Next-generation campus intelligence. Every module connected. Every action secured. Welcome to the future of education management.
        </p>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          {user ? (
            <Link href="/dashboard" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1rem', textDecoration: 'none' }}>
              <Layout size={20} /> Enter Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1rem', textDecoration: 'none' }}>
                Access Portal <ArrowRight size={18} />
              </Link>
              <Link href="/register" style={{ padding: '16px 32px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', marginBottom: '80px' }}>
        {[
          { icon: Shield, label: 'Secure', sublabel: 'JWT Protected' },
          { icon: Cpu, label: 'AI Powered', sublabel: 'Gemini Core' },
          { icon: Globe, label: 'Real-Time', sublabel: 'Live Sync' },
          { icon: Eye, label: 'Monitored', sublabel: 'Full Audit' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: 'var(--card-inner)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <item.icon size={20} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.label}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.sublabel}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>System Modules</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {modules.map((mod, i) => (
            <Link key={i} href={mod.path} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card module-card" style={{ padding: '32px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: mod.gradient, borderRadius: '50%', opacity: 0.1 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ background: mod.gradient, padding: '14px', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <mod.icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem' }}>{mod.title}</h3>
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>{mod.desc}</p>
                <div className="module-arrow" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', opacity: 0, transform: 'translateX(-10px)', transition: 'all 0.3s ease' }}>
                  Launch Module <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Admin Control Center</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
            {adminModules.map((mod, i) => (
              <Link key={i} href={mod.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="glass-card module-card" style={{ padding: '32px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: mod.gradient, borderRadius: '50%', opacity: 0.1 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ background: mod.gradient, padding: '14px', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <mod.icon size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem' }}>{mod.title}</h3>
                  </div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>{mod.desc}</p>
                  <div className="module-arrow" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', opacity: 0, transform: 'translateX(-10px)', transition: 'all 0.3s ease' }}>
                    Access Panel <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
