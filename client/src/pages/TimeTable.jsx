import React, { useState, useEffect } from 'react';
import { Clock, Download, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TimeTable = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isEditing, setIsEditing] = useState(false);

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
    'Monday': [
      { subject: 'Machine Learning', teacher: 'KOPPULA DENNIS' },
      { subject: 'Probability and Statistics', teacher: 'SAHERA BEGAM' },
      { subject: 'Soft Skills', teacher: '' },
      { subject: 'Soft Skills', teacher: '' },
      { subject: 'Digital Logical and Computer Organization', teacher: 'DIVILI V BRAHMA NARESH KUMAR' },
      { subject: 'Machine Learning', teacher: 'KOPPULA DENNIS' },
      { subject: 'Design Thinking & Innovation', teacher: '' },
    ],
    'Tuesday': [
      { subject: 'Machine Learning', teacher: 'KOPPULA DENNIS' },
      { subject: 'Data Base Management Systems', teacher: 'POLAVARAPU BABY NAVYA' },
      { subject: 'CRT', teacher: '' },
      { subject: 'CRT', teacher: '' },
      { subject: 'Probability and Statistics', teacher: 'SAHERA BEGAM' },
      { subject: 'Digital Logical and Computer Organization', teacher: 'DIVILI V BRAHMA NARESH KUMAR' },
      { subject: 'Data Base Management Systems', teacher: 'POLAVARAPU BABY NAVYA' },
    ],
    'Wednesday': [
      { subject: 'Data Base Management Systems', teacher: 'POLAVARAPU BABY NAVYA' },
      { subject: 'Probability and Statistics', teacher: 'SAHERA BEGAM' },
      { subject: 'Optimization Techniques', teacher: '' },
      { subject: 'Optimization Techniques', teacher: '' },
      { subject: 'Full Stack Development-1', teacher: 'PERNEEDI CHAKRADHARA RAO' },
      { subject: 'Full Stack Development-1', teacher: 'PERNEEDI CHAKRADHARA RAO' },
      { subject: 'Full Stack Development-1', teacher: 'PERNEEDI CHAKRADHARA RAO' },
    ],
    'Thursday': [
      { subject: 'Digital Logical and Computer Organization', teacher: 'DIVILI V BRAHMA NARESH KUMAR' },
      { subject: 'Data Base Management Systems', teacher: 'POLAVARAPU BABY NAVYA' },
      { subject: 'Optimization Techniques', teacher: '' },
      { subject: 'Optimization Techniques', teacher: '' },
      { subject: 'DBMS LAB', teacher: 'POLAVARAPU BABY NAVYA' },
      { subject: 'DBMS LAB', teacher: 'POLAVARAPU BABY NAVYA' },
      { subject: 'DBMS LAB', teacher: 'POLAVARAPU BABY NAVYA' },
    ],
    'Friday': [
      { subject: 'Probability and Statistics', teacher: 'SAHERA BEGAM' },
      { subject: 'AI and ML LAB', teacher: 'KOPPULA DENNIS' },
      { subject: 'AI and ML LAB', teacher: 'KOPPULA DENNIS' },
      { subject: 'AI and ML LAB', teacher: 'KOPPULA DENNIS' },
      { subject: 'Probability and Statistics', teacher: 'SAHERA BEGAM' },
      { subject: 'Optimization Techniques', teacher: '' },
      { subject: 'Optimization Techniques', teacher: '' },
    ],
    'Saturday': [
      { subject: 'Probability and Statistics', teacher: 'SAHERA BEGAM' },
      { subject: 'Machine Learning', teacher: 'KOPPULA DENNIS' },
      { subject: 'Digital Logical and Computer Organization', teacher: 'DIVILI V BRAHMA NARESH KUMAR' },
      { subject: 'Design Thinking & Innovation', teacher: '' },
      { subject: 'Data Base Management Systems', teacher: 'POLAVARAPU BABY NAVYA' },
      { subject: 'Machine Learning', teacher: 'KOPPULA DENNIS' },
      { subject: 'Digital Logical and Computer Organization', teacher: 'DIVILI V BRAHMA NARESH KUMAR' },
    ],
  };

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('college_timetable');
    return saved ? JSON.parse(saved) : initialSchedule;
  });

  const handleCellChange = (day, periodIndex, field, value) => {
    const newSchedule = { ...schedule };
    newSchedule[day][periodIndex][field] = value;
    setSchedule(newSchedule);
  };

  const saveTimetable = () => {
    localStorage.setItem('college_timetable', JSON.stringify(schedule));
    setIsEditing(false);
  };

  return (
    <div className="timetable-page animate-slide-up" style={{ padding: '20px' }}>
      <header className="page-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Institutional Schedule</span>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>Class Time Table</h1>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          {isAdmin && (
            <button
              onClick={() => isEditing ? saveTimetable() : setIsEditing(true)}
              className="btn-primary"
              style={{ background: isEditing ? 'var(--success)' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
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

      {isEditing && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '15px', borderRadius: '12px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', color: '#d97706' }}>
          <ShieldAlert size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Admin Mode: You are currently modifying the institutional record. Click "Save" to persist changes.</span>
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
      `}</style>
    </div>
  );
};

export default TimeTable;
