import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Send, CheckCircle, Loader2, Award, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const faculty = [
  { id: 1, name: 'Probability and Statistics', subject: 'Core Mathematics'},
  { id: 2, name: 'Machine Learning', subject: 'Artificial Intelligence'},
  { id: 3, name: 'DBMS', subject: 'Database Systems'},
  { id: 4, name: 'Optimization Techniques', subject: 'Computational Logic'},
  { id: 5, name: 'DLCO', subject: 'Digital Logic & Computer Org'},
  { id: 6, name: 'AI and ML Lab', subject: 'Practical Laboratory'},
  { id: 7, name: 'DBMS Lab', subject: 'Practical Laboratory'},
  { id: 8, name: 'FSD Lab', subject: 'Full Stack Development Lab'},
];

const Feedback = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminFeedback();
    }
  }, [isAdmin]);

  const fetchAdminFeedback = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbackList(response.data);
    } catch (error) {
      console.error('Error fetching admin feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminFeedback();
    } catch (error) {
      alert('Failed to delete feedback');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFaculty || rating === 0) {
      alert('Please select faculty and provide a rating.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/feedback`, {
        facultyName: selectedFaculty.name,
        rating,
        comment
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setComment('');
        setSelectedFaculty(null);
      }, 3000);
    } catch (error) {
      alert('Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="feedback-page animate-slide-up">
        <header className="page-header">
          <div>
            <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Faculty Quality Audit</span>
            <h1 className="page-title">Student Submissions</h1>
          </div>
          <div className="glass-card" style={{ padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={20} color="var(--warning)" />
            <span style={{ fontWeight: '700' }}>Overall Rating: 4.75</span>
          </div>
        </header>

        <div className="glass-card">
          <h3 style={{ marginBottom: '25px' }}>Student Feedback Records</h3>
          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
          ) : feedbackList.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {feedbackList.map(item => (
                <div key={item.id} style={{
                  padding: '20px',
                  background: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1rem' }}>{item.facultyName}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                      <Star size={14} fill="var(--warning)" color="var(--warning)" />
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--warning)' }}>{item.rating || 0}/5</span>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '5px' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', fontStyle: 'italic' }}>
                    "{item.comment || 'No comment provided.'}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Anonymous Submission</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No feedback submissions recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center' }}>
        <div style={{ background: 'var(--success)', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
          <CheckCircle size={48} color="white" />
        </div>
        <h2 style={{ marginBottom: '10px' }}>Feedback Submitted Anonymously!</h2>
        <p style={{ color: 'var(--text-dim)' }}>Thank you for helping us improve our faculty standards.</p>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <h1 style={{ marginBottom: '10px' }}>Faculty Feedback</h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Your identity is not recorded. All submissions are 100% anonymous.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px' }}>Select Faculty</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {faculty.map(f => (
              <div
                key={f.id}
                onClick={() => setSelectedFaculty(f)}
                style={{
                  padding: '15px',
                  borderRadius: '12px',
                  background: selectedFaculty?.id === f.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--card-inner)',
                  border: `1px solid ${selectedFaculty?.id === f.id ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <h4 style={{ color: selectedFaculty?.id === f.id ? 'var(--primary)' : 'var(--text-main)' }}>{f.name}</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{f.subject}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '20px' }}>Submit Feedback</h3>
          {selectedFaculty ? (
            <div className="animate-fade-in">
              <p style={{ marginBottom: '20px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                Providing feedback for <strong>{selectedFaculty.name}</strong>.
              </p>

              <div style={{ marginBottom: '25px' }}>
                <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Quality of Interaction</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      onClick={() => setRating(star)}
                      fill={rating >= star ? 'var(--warning)' : 'transparent'}
                      color={rating >= star ? 'var(--warning)' : 'var(--text-muted)'}
                      style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Additional Comments</p>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Share your experience anonymously..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>

              <button
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                onClick={handleSubmit}
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {isSubmitting ? 'Submitting...' : 'Submit Anonymous Feedback'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
              <User size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
              <p>Please select a faculty member to provide feedback.</p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Feedback;
