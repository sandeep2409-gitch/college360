'use client';
import React, { useState } from 'react';
import { User, Mail, Lock, Shield, Loader2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', studentId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/register', formData);
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '70px', height: '70px', background: 'var(--primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px var(--primary-glow)' }}>
            <UserPlus size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Join College 360</h1>
          <p style={{ color: 'var(--text-dim)' }}>Create your campus identity</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '15px', top: '14px', color: 'var(--text-dim)' }} />
              <input type="text" className="input-field" placeholder="Your full name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ paddingLeft: '45px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '15px', top: '14px', color: 'var(--text-dim)' }} />
              <input type="email" className="input-field" placeholder="you@college.edu" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ paddingLeft: '45px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Access Level</label>
            <select className="input-field" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {formData.role === 'student' && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Student ID</label>
              <div style={{ position: 'relative' }}>
                <Shield size={18} style={{ position: 'absolute', left: '15px', top: '14px', color: 'var(--text-dim)' }} />
                <input type="text" className="input-field" placeholder="CS-2024-001" required value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} style={{ paddingLeft: '45px' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '15px', top: '14px', color: 'var(--text-dim)' }} />
              <input type="password" className="input-field" placeholder="Create a strong password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ paddingLeft: '45px' }} />
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '16px', marginTop: '10px' }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Already have access?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
