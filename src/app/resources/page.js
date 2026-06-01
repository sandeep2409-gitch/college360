'use client';
import React, { useState, useEffect } from 'react';
import { Upload, Search, Download, Trash2, Loader2, CheckCircle, XCircle, FileText, BookOpen, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

export default function ResourcesPage() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [resources, setResources] = useState([]);
  const [pendingResources, setPendingResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', category: 'notes', file: null });

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/resources');
      setResources(res.data);
      if (isAdmin) {
        const pending = await axios.get('/api/admin/resources/pending', { headers: { Authorization: `Bearer ${token}` } });
        setPendingResources(pending.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('category', uploadData.category);
    formData.append('file', uploadData.file);

    try {
      await axios.post('/api/resources', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setShowUpload(false);
      setUploadData({ title: '', category: 'notes', file: null });
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/admin/resources/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchResources();
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/admin/resources/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchResources();
    } catch (err) {
      alert('Failed to reject');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this resource?')) {
      try {
        await axios.delete(`/api/resources/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchResources();
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const filtered = resources.filter(r =>
    (filterCategory === 'all' || r.category === filterCategory) &&
    (r.title?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'notes': return '#6366f1';
      case 'syllabus': return '#10b981';
      case 'paper': return '#f59e0b';
      case 'assignment': return '#ec4899';
      default: return '#6366f1';
    }
  };

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ marginBottom: '5px' }}>Resource Library</h1>
          <p style={{ color: 'var(--text-dim)' }}>Browse and share academic materials</p>
        </div>
        <button className="btn-primary" onClick={() => setShowUpload(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Upload size={18} /> Upload Resource
        </button>
      </div>

      <div className="glass-card" style={{ padding: '20px', marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-dim)' }} size={18} />
          <input type="text" placeholder="Search resources..." className="input-field" style={{ paddingLeft: '45px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="input-field" style={{ width: '180px' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="notes">Notes</option>
          <option value="syllabus">Syllabus</option>
          <option value="paper">Papers</option>
          <option value="assignment">Assignments</option>
        </select>
      </div>

      {isAdmin && pendingResources.length > 0 && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '30px', borderLeft: '4px solid var(--warning)' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--warning)' }}>Pending Approvals ({pendingResources.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingResources.map(r => (
              <div key={r._id || r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--card-inner)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontWeight: '600' }}>{r.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>by {r.uploaderName}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleApprove(r._id || r.id)} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button onClick={() => handleReject(r._id || r.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}><Loader2 className="animate-spin" size={40} color="var(--primary)" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filtered.length > 0 ? filtered.map(r => (
            <div key={r._id} className="glass-card" style={{ padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: `${getCategoryColor(r.category)}20`, padding: '12px', borderRadius: '12px', color: getCategoryColor(r.category) }}>
                  <FileText size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>{r.title}</h4>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: getCategoryColor(r.category) }}>{r.category}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {r.fileUrl && (
                  <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', textDecoration: 'none' }}>
                    <Download size={16} /> Download
                  </a>
                )}
                {(isAdmin || user?.id === r.uploadedBy?.toString()) && (
                  <button onClick={() => handleDelete(r._id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>
              <BookOpen size={50} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
              <p>No resources found</p>
            </div>
          )}
        </div>
      )}

      {showUpload && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '32px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>Upload Resource</h3>
              <button onClick={() => setShowUpload(false)} style={{ background: 'transparent', color: 'var(--text-dim)', border: 'none', cursor: 'pointer' }}><XCircle size={24} /></button>
            </div>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="input-label">Title</label>
                <input type="text" className="input-field" placeholder="Resource title" required value={uploadData.title} onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })} />
              </div>
              <div>
                <label className="input-label">Category</label>
                <select className="input-field" value={uploadData.category} onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}>
                  <option value="notes">Notes</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="paper">Previous Papers</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
              <div>
                <label className="input-label">File</label>
                <input type="file" className="input-field" onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })} required />
              </div>
              <button className="btn-primary" type="submit" disabled={uploading} style={{ width: '100%', padding: '14px' }}>
                {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                {uploading ? 'Uploading...' : 'Submit Resource'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
