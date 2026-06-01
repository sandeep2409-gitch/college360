'use client';
import React, { useState, useEffect } from 'react';
import { AlertCircle, Send, Loader2, CheckCircle, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

export default function ComplaintsPage() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isAdmin) fetchComplaints();
    else setLoading(false);
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('/api/admin/complaints', { headers: { Authorization: `Bearer ${token}` } });
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/complaints', formData);
      setSubmitted(true);
      setFormData({ title: '', description: '' });
    } catch (err) {
      alert('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.put(`/api/admin/complaints/${id}/resolve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchComplaints();
    } catch (err) {
      alert('Failed to resolve');
    }
  };

  if (isAdmin) {
    return (
      <div className="animate-slide-up">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ marginBottom: '5px' }}>Complaint Management</h1>
          <p style={{ color: 'var(--text-dim)' }}>Track and resolve student grievances</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>
        ) : (
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: 'var(--card-inner)' }}>
                  <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600' }}>Issue</th>
                  <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600' }}>Description</th>
                  <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length > 0 ? complaints.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '15px 25px', fontWeight: '600' }}>{c.title}</td>
                    <td style={{ padding: '15px 25px', color: 'var(--text-dim)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</td>
                    <td style={{ padding: '15px 25px' }}>
                      <span style={{
                        background: c.status === 'resolved' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: c.status === 'resolved' ? '#10b981' : '#f59e0b',
                        padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px 25px', textAlign: 'right' }}>
                      {c.status === 'pending' && (
                        <button onClick={() => handleResolve(c._id)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                          <CheckCircle size={14} /> Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No complaints filed.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="animate-slide-up" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '60px' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Shield size={36} color="white" />
          </div>
          <h2 style={{ marginBottom: '10px' }}>Complaint Filed</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Your anonymous complaint has been submitted for review.</p>
          <button className="btn-primary" onClick={() => setSubmitted(false)}>File Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ maxWidth: '550px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Grievance Portal</h1>
        <p style={{ color: 'var(--text-dim)' }}>File anonymous complaints securely</p>
      </div>

      <div className="glass-card" style={{ padding: '36px' }}>
        <div style={{ background: 'rgba(99,102,241,0.05)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={20} color="var(--primary)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>All complaints are anonymous and encrypted</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="input-label">Issue Title</label>
            <input type="text" className="input-field" placeholder="Brief title of the issue" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea className="input-field" style={{ height: '120px', resize: 'none' }} placeholder="Describe the issue in detail..." required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <button className="btn-primary" type="submit" disabled={submitting} style={{ width: '100%', padding: '16px' }}>
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {submitting ? 'Submitting...' : 'File Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
}
