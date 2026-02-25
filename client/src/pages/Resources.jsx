import React, { useState, useEffect } from 'react';
import { Search, Download, FileText, Filter, Upload, X, Check, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Resources = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [newResource, setNewResource] = useState({
    title: '',
    category: 'Computer Science'
  });

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/resources');
      // For backend resources, we might need to simulate type/size if not stored
      const data = response.data.map(r => ({
        ...r,
        type: r.fileUrl ? r.fileUrl.split('.').pop().toUpperCase() : 'PDF',
        size: '1.2 MB',
        date: new Date().toISOString().split('T')[0]
      }));
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', newResource.title);
      formData.append('category', newResource.category);
      formData.append('userId', user?.id || 1);
      formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:5001/api/resources/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 201) {
        const resourceToAdd = {
          id: response.data.id,
          title: newResource.title,
          category: newResource.category,
          type: response.data.type,
          size: response.data.size,
          date: response.data.date,
          fileUrl: response.data.fileUrl
        };

        setResources([resourceToAdd, ...resources]);
        setShowUploadModal(false);
        setNewResource({ title: '', category: 'Computer Science' });
        setSelectedFile(null);
        alert('Resource uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      alert('Download link not available for this resource.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await axios.delete(`http://localhost:5001/api/resources/${id}`);
        setResources(resources.filter(r => r.id !== id));
        alert('Resource deleted successfully!');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete resource.');
      }
    }
  };

  return (
    <div className="resources-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Resource Sharing</h1>
        <button 
          className="btn-primary" 
          onClick={() => setShowUploadModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <Upload size={18} /> Upload Resource
        </button>
      </div>

      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-card animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Upload New Resource</h3>
              <X onClick={() => setShowUploadModal(false)} style={{ cursor: 'pointer' }} />
            </div>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={newResource.title}
                  onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                  placeholder="e.g. Advanced Calculus Notes"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Category</label>
                <select 
                  className="input-field"
                  value={newResource.category}
                  onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                >
                  <option>Computer Science</option>
                  <option>Humanities</option>
                  <option>Physics</option>
                  <option>Economics</option>
                  <option>Chemistry</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Select File</label>
                <input 
                  type="file" 
                  className="input-field" 
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{ padding: '8px' }}
                />
              </div>
              <button className="btn-primary" type="submit" disabled={isUploading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                {isUploading ? 'Uploading...' : 'Confirm Upload'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '15px', top: '14px', color: 'var(--text-dim)' }} size={20} />
          <input 
            type="text" 
            placeholder="Search resources by title, subject, or tag..." 
            className="input-field" 
            style={{ paddingLeft: '45px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'white', padding: '0 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={20} /> Filter
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          {resources.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase())).map(res => (
            <div key={res.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '10px' }}>
                  <FileText color="var(--primary)" />
                </div>
                <div>
                  <h4 style={{ marginBottom: '4px' }}>{res.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    {res.category} • {res.type} • {res.size} • {res.date}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => handleDelete(res.id)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    title="Delete Resource"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button 
                  onClick={() => handleDownload(res.fileUrl)}
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Resources;
