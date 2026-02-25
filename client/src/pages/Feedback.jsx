import React, { useState } from 'react';
import { Star, MessageSquare, User, Send, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const faculty = [
  { id: 1, name: 'AI HOD', subject: 'Artificial Intelligence & Data Science', rating: 4.8 },
  { id: 2, name: 'ECE HOD', subject: 'Electronics & Communication Engineering', rating: 4.9 },
  { id: 3, name: 'CSE HOD', subject: 'Computer Science & Engineering', rating: 4.7 },
  { id: 4, name: 'MECH HOD', subject: 'Mechanical Engineering', rating: 4.6 },
];

const Feedback = () => {
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedFaculty || rating === 0) {
      alert('Please select faculty and provide a rating.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5001/api/feedback', {
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
                  background: selectedFaculty?.id === f.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedFaculty?.id === f.id ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <h4 style={{ color: selectedFaculty?.id === f.id ? 'var(--primary)' : 'white' }}>{f.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                    <Star size={14} fill="#fbbf24" /> <span>{f.rating}</span>
                  </div>
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
                <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Rating</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={28} 
                      onClick={() => setRating(star)}
                      style={{ 
                        cursor: 'pointer',
                        color: star <= rating ? '#fbbf24' : 'var(--text-dim)',
                        fill: star <= rating ? '#fbbf24' : 'none'
                      }} 
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
