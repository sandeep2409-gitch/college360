import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Shield, Mail, Lock, UserCheck, Loader2 } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
  });
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/register', { 
        ...formData, 
        role 
      });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-dim)' }}>Join the next-gen college ecosystem</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button 
            onClick={() => setRole('student')}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: role === 'student' ? 'var(--primary)' : 'var(--card-inner)', border: '1px solid var(--border)', color: role === 'student' ? 'white' : 'var(--text-main)' }}
          >
            <User size={18} /> Student
          </button>
          <button 
            onClick={() => setRole('admin')}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: role === 'admin' ? 'var(--primary)' : 'var(--card-inner)', border: '1px solid var(--border)', color: role === 'admin' ? 'white' : 'var(--text-main)' }}
          >
            <Shield size={18} /> Admin
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', border: '1px solid var(--error)', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '15px', top: '42px', color: 'var(--text-dim)' }} />
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="John Doe" 
              style={{ paddingLeft: '45px' }}
              required 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '15px', top: '42px', color: 'var(--text-dim)' }} />
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="name@college.edu" 
              style={{ paddingLeft: '45px' }}
              required 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {role === 'student' && (
            <div style={{ position: 'relative' }}>
              <UserCheck size={18} style={{ position: 'absolute', left: '15px', top: '42px', color: 'var(--text-dim)' }} />
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Student ID</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="CS-2024-001" 
                style={{ paddingLeft: '45px' }}
                required 
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '15px', top: '42px', color: 'var(--text-dim)' }} />
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              style={{ paddingLeft: '45px' }}
              required 
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', color: 'var(--text-dim)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
