import React, { useState, useEffect } from 'react';
import { Clock, Download, Edit2, Check, X, ShieldAlert, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TimeTable = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [showAddClassModal, setShowAddClassModal] = useState(false);

  const periods = [
    { id: 1, label: 'Period 1', time: '09:15AM to 10:05AM' },
    { id: 2, label: 'Period 2', time: '10:05AM to 10:55AM' },
    { id: 3, label: 'Period 3', time: '11:05AM to 11:55AM' },
    { id: 4, label: 'Period 4', time: '11:55AM to 12:45PM' },
    { id: 5, label: 'Period 5', time: '01:45PM to 02:35PM' },
    { id: 6, label: 'Period 6', time: '02:35PM to 03:25PM' },
    { id: 7, label: 'Period 7', time: '03:25PM to 04:15PM' },
  ];

  const initialSchedule = {
    'Monday': Array(7).fill({ subject: '', teacher: '' }),
    'Tuesday': Array(7).fill({ subject: '', teacher: '' }),
    'Wednesday': Array(7).fill({ subject: '', teacher: '' }),
    'Thursday': Array(7).fill({ subject: '', teacher: '' }),
    'Friday': Array(7).fill({ subject: '', teacher: '' }),
    'Saturday': Array(7).fill({ subject: '', teacher: '' }),
  };

  const [schedule, setSchedule] = useState(initialSchedule);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/timetable/classes`);
      setClasses(response.data);
      if (response.data.length > 0 && !selectedClass) {
        setSelectedClass(response.data[0]);
      } else if (response.data.length === 0) {
        if(isAdmin) setSelectedClass('III-B.Tech-CSE');
      }
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  };

  const fetchTimetable = async (className) => {
    if (!className) return;
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/timetable?className=${className}`);
      if (response.data) {
        setSchedule(response.data);
      } else {
        setSchedule(initialSchedule);
      }
    } catch (err) {
      console.error("Failed to fetch timetable:", err);
      setSchedule(initialSchedule);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable(selectedClass);
    }
  }, [selectedClass]);

  const handleCellChange = (day, periodIndex, field, value) => {
    const newSchedule = JSON.parse(JSON.stringify(schedule));
    newSchedule[day][periodIndex][field] = value;
    setSchedule(newSchedule);
  };

  const saveTimetable = async () => {
    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/timetable`, 
        { className: selectedClass, data: schedule }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
      fetchClasses();
      alert("Timetable saved successfully!");
    } catch (err) {
      alert("Failed to save changes: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    if (classes.includes(newClassName)) {
      alert("Class already exists");
      return;
    }
    setSelectedClass(newClassName);
    setSchedule(initialSchedule);
    setIsEditing(true);
    setShowAddClassModal(false);
    setNewClassName('');
  };

  if (loading && !isEditing && classes.length > 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Loader2 className="animate-spin" size={40} /></div>;
  }

  return (
    <div className="timetable-page animate-slide-up" style={{ padding: '20px' }}>
      <header className="page-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Institutional Schedule</span>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>Class Time Table</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: '600' }}>Selected Class:</span>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                minWidth: '200px'
              }}
            >
              {classes.length === 0 && !isAdmin && <option>No classes available</option>}
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
              {isAdmin && !classes.includes(selectedClass) && selectedClass && <option value={selectedClass}>{selectedClass} (Draft)</option>}
            </select>
            {isAdmin && (
              <button 
                onClick={() => setShowAddClassModal(true)}
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#334155' }}
              >
                + New Class
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          {isAdmin && selectedClass && (
            <button
              onClick={() => isEditing ? saveTimetable() : setIsEditing(true)}
              disabled={loading}
              className="btn-primary"
              style={{ background: isEditing ? '#22c55e' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? <Check size={18} /> : <Edit2 size={18} />)}
              {isEditing ? 'Save Changes' : 'Edit Schedule'}
            </button>
          )}
          <button
            className="btn-primary"
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#334155' }}
          >
            <Download size={18} /> Export
          </button>
        </div>
      </header>

      {showAddClassModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-card animate-fade-in" style={{ width: '90%', maxWidth: '400px', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Add New Class Timetable</h3>
              <X onClick={() => setShowAddClassModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="text" 
                placeholder="e.g. IV-B.Tech-CSE-A" 
                className="input-field"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
              />
              <button onClick={handleAddClass} className="btn-primary">Create Empty Timetable</button>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '15px', borderRadius: '12px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', color: '#d97706' }}>
          <ShieldAlert size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Admin Mode: You are currently modifying the institutional record. Click "Save" to persist changes to the database.</span>
        </div>
      )}

      <div style={{
        overflowX: 'auto',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        background: 'white',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr>
              <th style={{ background: '#f97316', color: 'white', padding: '20px', border: '1px solid rgba(0,0,0,0.1)', width: '120px' }}>Day</th>
              {periods.map(p => (
                <th key={p.id} style={{ background: '#f97316', color: 'white', padding: '15px', border: '1px solid rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>{p.label}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '600', opacity: 0.9 }}>{p.time}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(schedule).map(day => (
              <tr key={day}>
                <td style={{ background: '#f97316', color: 'white', padding: '20px', fontWeight: '800', border: '1px solid rgba(0,0,0,0.1)', textAlign: 'center' }}>
                  {day}
                </td>
                {schedule[day].map((cell, idx) => (
                  <td key={idx} style={{ padding: '12px', border: '1px solid #e2e8f0', verticalAlign: 'top', minHeight: '120px', background: cell.subject ? 'transparent' : '#f8fafc' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <textarea
                          value={cell.subject}
                          onChange={(e) => handleCellChange(day, idx, 'subject', e.target.value)}
                          placeholder="Subject"
                          style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px', fontSize: '0.75rem', height: '40px' }}
                        />
                        <textarea
                          value={cell.teacher}
                          onChange={(e) => handleCellChange(day, idx, 'teacher', e.target.value)}
                          placeholder="Teacher"
                          style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px', fontSize: '0.7rem', fontStyle: 'italic' }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.85rem', marginBottom: '12px', lineHeight: 1.3 }}>
                          {cell.subject || '-'}
                        </div>
                        {cell.teacher && (
                          <div style={{
                            fontSize: '0.65rem',
                            color: '#64748b',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            paddingTop: '8px',
                            borderTop: '1px solid #f1f5f9',
                            marginTop: 'auto'
                          }}>
                            {cell.teacher}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          .sidebar, .btn-primary, header span, .chatbot-container { display: none !important; }
          .main-content { margin: 0 !important; padding: 0 !important; }
          table { border: 2px solid black !important; }
          th { background: #f59e0b !important; -webkit-print-color-adjust: exact; }
          .timetable-page { padding: 0 !important; }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TimeTable;

