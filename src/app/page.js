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
    { icon: QrCode, title: 'Smart Attendance', desc: 'Multi-factor verification with QR scanning, geolocation, and facial recognition.', path: '/attendance', color: '#4a7c59', gradient: 'linear-gradient(135deg, #4a7c59, #689f7d)' },
    { icon: BookOpen, title: 'Resource Nexus', desc: 'Upload, share, and discover academic materials with admin approval workflows.', path: '/resources', color: '#606c38', gradient: 'linear-gradient(135deg, #606c38, #8f9779)' },
    { icon: Star, title: 'Faculty Intel', desc: 'Anonymous faculty feedback system with real-time analytics and insights.', path: '/feedback', color: '#dda15e', gradient: 'linear-gradient(135deg, #dda15e, #e9c46a)' },
    { icon: AlertCircle, title: 'Grievance Portal', desc: 'Secure anonymous complaint system with tracking and resolution pipeline.', path: '/complaints', color: '#b05b4c', gradient: 'linear-gradient(135deg, #b05b4c, #c87a6b)' },
    { icon: Calendar, title: 'Event Calendar', desc: 'Comprehensive academic, cultural, and campus event management system.', path: '/calendar', color: '#9a5a3a', gradient: 'linear-gradient(135deg, #9a5a3a, #b07d62)' },
    { icon: Clock, title: 'Time Table', desc: 'View and manage institutional class schedules and period timings.', path: '/timetable', color: '#bc6c25', gradient: 'linear-gradient(135deg, #bc6c25, #dda15e)' },
  ];

  const adminModules = [
    { icon: Users, title: 'Student Registry', desc: 'Complete student management with provisioning and access control.', path: '/manage-students', color: '#31572c', gradient: 'linear-gradient(135deg, #31572c, #4f772d)' },
    { icon: BarChart2, title: 'Analytics Matrix', desc: 'Real-time campus analytics, attendance trends, and performance metrics.', path: '/dashboard', color: '#2b5c5f', gradient: 'linear-gradient(135deg, #2b5c5f, #4a8285)' },
  ];

  return (
    <div className="landing-container">
      <div className="hero-section">
        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '600px', height: '600px', background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)', pointerEvents: 'none', opacity: 0.3 }} />

        <div className="hero-badge">
          <Zap size={14} /> Campus Management Automated & Intelligent
        </div>

        <h1 className="page-title hero-title">
          College 360 Platform
        </h1>
        <p className="hero-subtitle">
          Next-generation campus intelligence. Every module connected. Every action secured. Welcome to the future of education management.
        </p>

        <div className="hero-ctas">
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              <Layout size={20} /> Enter Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-primary">
                Access Portal <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="btn-secondary">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="feature-badges">
        {[
          { icon: Shield, label: 'Secure', sublabel: 'JWT Protected' },
          { icon: Cpu, label: 'AI Powered', sublabel: 'Gemini Core' },
          { icon: Globe, label: 'Real-Time', sublabel: 'Live Sync' },
          { icon: Eye, label: 'Monitored', sublabel: 'Full Audit' },
        ].map((item, i) => (
          <div key={i} className="feature-badge">
            <div className="feature-icon">
              <item.icon size={20} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.label}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.sublabel}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="modules-section">
        <h2 className="section-title">System Modules</h2>
        <div className="modules-grid">
          {modules.map((mod, i) => (
            <Link key={i} href={mod.path} className="module-link">
              <div className="glass-card module-card">
                <div className="module-glow" style={{ background: mod.gradient }} />
                <div className="module-header">
                  <div className="module-icon-wrapper" style={{ background: mod.gradient }}>
                    <mod.icon size={24} />
                  </div>
                  <h3 className="module-title">{mod.title}</h3>
                </div>
                <p className="module-desc">{mod.desc}</p>
                <div className="module-arrow">
                  Launch Module <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="modules-section admin-section">
          <h2 className="section-title">Admin Control Center</h2>
          <div className="modules-grid">
            {adminModules.map((mod, i) => (
              <Link key={i} href={mod.path} className="module-link">
                <div className="glass-card module-card">
                  <div className="module-glow" style={{ background: mod.gradient }} />
                  <div className="module-header">
                    <div className="module-icon-wrapper" style={{ background: mod.gradient }}>
                      <mod.icon size={24} />
                    </div>
                    <h3 className="module-title">{mod.title}</h3>
                  </div>
                  <p className="module-desc">{mod.desc}</p>
                  <div className="module-arrow">
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
