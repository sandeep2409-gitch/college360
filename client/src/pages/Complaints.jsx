import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Circle, Clock, Plus, Send, Loader2, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock },
    'in-progress': { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', icon: Circle },
    resolved: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle2 },
  };
  const { color, bg, icon: Icon } = styles[status] || styles.pending;
  return (
    <span style={{ 
      color, background: bg, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', 
      textTransform: 'uppercase', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px'
    }}>
      <Icon size={12} /> {status}
    </span>
  );
};

const Complaints = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [showForm, setShowForm] = useState(!isAdmin);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Infrastructure' });
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const fetchComplaints = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/admin/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/admin/complaints/${id}/resolve`);
      fetchComplaints(); // Refresh the list
    } catch (error) {
      console.error('Error resolving complaint:', error);
      alert('Failed to update complaint status.');
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5001/api/complaints', formData);
      setSubmittedSuccess(true);
      setFormData({ title: '', description: '', category: 'Infrastructure' });
      setTimeout(() => setSubmittedSuccess(false), 5000);
    } catch (error) {
      alert('Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ background: 'var(--success)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
          <ShieldCheck size={40} color="white" />
        </div>
        <h2 style={{ marginBottom: '15px' }}>Complaint Filed Anonymously</h2>
        <p style={{ color: 'var(--text-dim)', maxWidth: '500px', margin: '0 auto 25px' }}>
          Your report has been successfully submitted to the administration. Your identity has NOT been recorded to ensure your protection.
        </p>
        <button className="btn-primary" onClick={() => setSubmittedSuccess(false)}>File Another Report</button>
      </div>
    );
  }

  return (
    <div className="complaints-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ marginBottom: '5px' }}>Complaint Portal</h1>
          <p style={{ color: 'var(--text-dim)' }}>
            {isAdmin ? 'Manage and track anonymous student reports' : 'Securely report issues without sharing your identity'}
          </p>
        </div>
        {isAdmin && (
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(!showForm)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Plus size={18} /> {showForm ? 'View All Reports' : 'File Internal Report'}
          </button>
        )}
      </div>

      {!showForm && isAdmin ? (
        <div className="glass-card">
          <h3 style={{ marginBottom: '25px' }}>Anonymous Reports Queue</h3>
          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
          ) : complaints.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '15px', color: 'var(--text-dim)', fontWeight: '500' }}>ID</th>
                    <th style={{ padding: '15px', color: 'var(--text-dim)', fontWeight: '500' }}>Subject</th>
                    <th style={{ padding: '15px', color: 'var(--text-dim)', fontWeight: '500' }}>Status</th>
                    <th style={{ padding: '15px', color: 'var(--text-dim)', fontWeight: '500' }}>Management</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(complaint => (
                    <tr key={complaint.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '15px', fontFamily: 'monospace', color: 'var(--primary)' }}>#ANON-{complaint.id}</td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '600' }}>{complaint.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>{complaint.description}</div>
                      </td>
                      <td style={{ padding: '15px' }}><StatusBadge status={complaint.status} /></td>
                      <td style={{ padding: '15px' }}>
                        {complaint.status !== 'resolved' && (
                          <button 
                            onClick={() => handleResolve(complaint.id)}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.7rem', background: 'var(--success)', border: 'none' }}
                          >
                            <CheckCircle2 size={14} /> Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '50px' }}>No reports in the queue.</p>
          )}
        </div>
      ) : (
        <div className="glass-card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle color="var(--primary)" size={20} /> New Anonymous Report
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Nature of Complaint</label>
              <select 
                className="input-field" 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Infrastructure</option>
                <option>Academic</option>
                <option>Administrative</option>
                <option>Others</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Subject Line</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Brief summary of the issue" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Detailed Description</label>
              <textarea 
                className="input-field" 
                rows="6" 
                placeholder="Provide all relevant details. Remember, you remain anonymous." 
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button 
                type="submit"
                className="btn-primary" 
                disabled={isSubmitting}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {isSubmitting ? 'Submitting...' : 'Submit Anonymous Report'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAdmin && (
        <div style={{ marginTop: '40px', padding: '25px', background: 'var(--card-inner)', borderRadius: '16px', border: '1px dashed var(--error)', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <AlertCircle color="var(--error)" size={32} />
          <div>
            <h4 style={{ color: 'var(--error)', marginBottom: '4px' }}>Emergency Contact</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
              For urgent security or medical emergencies, please call the campus helpline at <strong>+1 (555) 999-0000</strong> immediately.
            </p>
          </div>
        </div>
      )}
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Complaints;
