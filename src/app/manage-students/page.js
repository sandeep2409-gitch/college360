'use client';
import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Mail, User, Trash2, Shield, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

export default function ManageStudentsPage() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', studentId: '' });
  const [successData, setSuccessData] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/students', { headers: { Authorization: `Bearer ${token}` } });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchStudents(); }, [token]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/admin/students', newStudent, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 201) {
        setStudents([response.data, ...students]);
        setSuccessData({ ...newStudent });
        setNewStudent({ name: '', email: '', password: '', studentId: '' });
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`/api/admin/students/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setStudents(students.filter(s => s.id !== id));
      } catch (error) {
        alert('Failed to delete student');
      }
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ marginBottom: '5px' }}>Student Management</h1>
          <p style={{ color: 'var(--text-dim)' }}>Add, view, and manage university students</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserPlus size={18} /> Add New Student
        </button>
      </div>

      <div className="glass-card" style={{ padding: '20px', marginBottom: '30px' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-dim)' }} size={18} />
          <input type="text" placeholder="Search students by name or email..." className="input-field" style={{ paddingLeft: '45px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>
      ) : (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: 'var(--card-inner)' }}>
                <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600' }}>Student Details</th>
                <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600' }}>Student ID</th>
                <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600' }}>Email Address</th>
                <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? filteredStudents.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '15px 25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: 'var(--primary)', color: 'white', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {student.name?.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '500' }}>{student.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '15px 25px', color: 'var(--text-dim)' }}>{student.studentId}</td>
                  <td style={{ padding: '15px 25px', color: 'var(--text-dim)' }}>{student.email}</td>
                  <td style={{ padding: '15px 25px' }}>
                    <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {student.role}
                    </span>
                  </td>
                  <td style={{ padding: '15px 25px', textAlign: 'right' }}>
                    <button onClick={() => handleDeleteStudent(student.id)} style={{ color: 'var(--error)', background: 'transparent', padding: '8px', borderRadius: '8px', cursor: 'pointer', border: 'none' }} title="Delete Student">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No students found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

       {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '32px', border: '1px solid var(--border)' }}>
            {successData ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: 'var(--success)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Check size={32} color="white" />
                </div>
                <h3 style={{ marginBottom: '10px' }}>Student Provisioned</h3>
                <p style={{ color: 'var(--text-dim)', marginBottom: '25px', fontSize: '0.9rem' }}>The account is live. Share these credentials with {successData.name}:</p>
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'left', marginBottom: '30px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '800' }}>Login Identifier</p>
                    <p style={{ fontWeight: '600' }}>{successData.studentId} <span style={{ color: 'var(--text-dim)', fontWeight: '400' }}>or</span> {successData.email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '800' }}>Access Password</p>
                    <p style={{ fontWeight: '600' }}>{successData.password}</p>
                  </div>
                </div>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => { setShowAddModal(false); setSuccessData(null); }}>
                  Return to Registry
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '1.5rem' }}>Add New Student</h3>
                  <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', color: 'var(--text-dim)', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                </div>
                <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-dim)' }} />
                      <input type="text" className="input-field" placeholder="Enter full name" style={{ paddingLeft: '45px' }} required value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-dim)' }} />
                      <input type="email" className="input-field" placeholder="student@college.edu" style={{ paddingLeft: '45px' }} required value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Student ID</label>
                    <div style={{ position: 'relative' }}>
                      <Shield size={18} style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-dim)' }} />
                      <input type="text" className="input-field" placeholder="e.g. CS-2024-001" style={{ paddingLeft: '45px' }} required value={newStudent.studentId} onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Default Password</label>
                    <div style={{ position: 'relative' }}>
                      <Shield size={18} style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-dim)' }} />
                      <input type="password" className="input-field" placeholder="Assign a password" style={{ paddingLeft: '45px' }} required value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                    <button className="btn-primary" type="submit" disabled={isSubmitting} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                      {isSubmitting ? 'Adding...' : 'Confirm Add'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
