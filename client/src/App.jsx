import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, LogOut, User, Sun, Moon } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Resources from './pages/Resources';
import Feedback from './pages/Feedback';
import Complaints from './pages/Complaints';
import Login from './pages/Login';
import Register from './pages/Register';
import ManageStudents from './pages/ManageStudents';
import EventCalendar from './pages/EventCalendar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layout size={28} /> College 360
          </h2>
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        {user && user.role === 'admin' && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
        {user && <Link to="/calendar" className="nav-link">Calendar</Link>}
        {user && <Link to="/attendance" className="nav-link">Attendance</Link>}
        {user && <Link to="/resources" className="nav-link">Resources</Link>}
        {user && <Link to="/feedback" className="nav-link">Faculty</Link>}
        {user && <Link to="/complaints" className="nav-link">Grievance</Link>}
      </div>
      <div className="nav-auth">
        <button 
          onClick={toggleTheme}
          style={{ 
            background: 'var(--bg-card)', 
            color: 'var(--text-main)', 
            padding: '10px', 
            borderRadius: '50%', 
            marginRight: '20px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} /> {user.name}
            </span>
            <button 
              className="btn-primary" 
              onClick={() => { logout(); navigate('/login'); }}
              style={{ padding: '8px 16px', background: 'var(--error)', boxShadow: 'none' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <Link to="/login"><button className="btn-primary">Login</button></Link>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Navbar />

            <main style={{ paddingTop: '100px', minHeight: '100vh', padding: '100px 5% 50px' }}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/complaints" element={<Complaints />} />
                <Route path="/manage-students" element={<ManageStudents />} />
                <Route path="/calendar" element={<EventCalendar />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
