import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LogIn, UserPlus, Shield, User, Loader2 } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/login', {
        identifier,
        password,
        role
      });
      login(response.data.user);
      navigate(role === 'admin' ? '/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-dim)' }}>Login to access your dashboard</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button
            className={`btn-role ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: role === 'student' ? 'var(--primary)' : 'var(--card-inner)', border: '1px solid var(--border)', color: role === 'student' ? 'white' : 'var(--text-main)' }}
          >
            <User size={18} /> Student
          </button>
          <button
            className={`btn-role ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: role === 'admin' ? 'var(--primary)' : 'var(--card-inner)', border: '1px solid var(--border)', color: role === 'admin' ? 'white' : 'var(--text-main)' }}
          >
            <Shield size={18} /> Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Email or Student ID</label>
            <input
              type="text"
              className="input-field"
              placeholder="name@college.edu or ID"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn-primary" type="submit" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <LogIn size={20} /> Login
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', color: 'var(--text-dim)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
