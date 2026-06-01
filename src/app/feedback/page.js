'use client';
import React, { useState, useEffect } from 'react';
import { Star, Send, Loader2, MessageSquare, Trash2, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

export default function FeedbackPage() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({ facultyName: '', comment: '' });
  const [submitted, setSubmitted] = useState(false);

  const facultyList = ['Dr. Ramesh Kumar', 'Prof. Anita Sharma', 'Dr. Vijay Prakash', 'Prof. Sunita Reddy', 'Dr. Anil Gupta'];

  useEffect(() => {
    if (isAdmin) fetchFeedback();
    else setLoading(false);
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await axios.get('/api/admin/feedback', { headers: { Authorization: `Bearer ${token}` } });
      setFeedbackList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a rating');
    setSubmitting(true);
    try {
      await axios.post('/api/feedback', { ...formData, rating });
      setSubmitted(true);
      setFormData({ facultyName: '', comment: '' });
      setRating(0);
    } catch (err) {
      alert('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await axios.delete(`/api/admin/feedback/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchFeedback();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (isAdmin) {
    return (
      <div className="animate-slide-up">
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ marginBottom: '5px' }}>Faculty Feedback Dashboard</h1>
          <p style={{ color: 'var(--text-dim)' }}>Review anonymous student feedback</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>
        ) : feedbackList.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {feedbackList.map((fb) => (
              <div key={fb._id} className="glass-card" style={{ padding: '28px', position: 'relative' }}>
                <button onClick={() => handleDelete(fb._id)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(99,102,241,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem' }}>{fb.facultyName}</h4>
                    <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={14} fill={s <= fb.rating ? '#f59e0b' : 'none'} color={s <= fb.rating ? '#f59e0b' : 'var(--text-muted)'} />
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>{fb.comment || 'No comment provided'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <MessageSquare size={50} style={{ margin: '0 auto 15px', opacity: 0.3, color: 'var(--text-dim)' }} />
            <p style={{ color: 'var(--text-dim)' }}>No feedback received yet</p>
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
            <Send size={36} color="white" />
          </div>
          <h2 style={{ marginBottom: '10px' }}>Feedback Submitted!</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Your anonymous feedback has been recorded securely.</p>
          <button className="btn-primary" onClick={() => setSubmitted(false)}>Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ maxWidth: '550px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Faculty Feedback</h1>
        <p style={{ color: 'var(--text-dim)' }}>Submit anonymous feedback for your professors</p>
      </div>

      <div className="glass-card" style={{ padding: '36px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label className="input-label">Select Faculty</label>
            <select className="input-field" value={formData.facultyName} onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })} required>
              <option value="">Choose a faculty member</option>
              {facultyList.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="input-label">Rating</label>
            <div style={{ display: 'flex', gap: '8px', padding: '10px 0' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', transform: (hoverRating >= s || rating >= s) ? 'scale(1.2)' : 'scale(1)' }}
                >
                  <Star size={32} fill={s <= (hoverRating || rating) ? '#f59e0b' : 'none'} color={s <= (hoverRating || rating) ? '#f59e0b' : 'var(--text-muted)'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Comments (Optional)</label>
            <textarea className="input-field" style={{ height: '100px', resize: 'none' }} placeholder="Share your experience..." value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} />
          </div>

          <button className="btn-primary" type="submit" disabled={submitting} style={{ width: '100%', padding: '16px' }}>
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
