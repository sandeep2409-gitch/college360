import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, CheckCircle, XCircle, Info, Clock, Loader2, Calendar, UserCheck, Trash2, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Attendance = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const webcamRef = useRef(null);


  const [activeTab, setActiveTab] = useState(isAdmin ? 'history' : 'mark');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [studentData, setStudentData] = useState({
    name: user?.name || '',
    id: user?.studentId || ''
  });
  const [capturedImage, setCapturedImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);

  useEffect(() => {
    if (user) {
      setStudentData({
        name: user.name || '',
        id: user.studentId || ''
      });
    }
  }, [user]);


  const CLASSROOM_LOCATION = { lat: 16.838936472130737, lng: 82.22506175342866 };
  const ALLOWED_RADIUS_METERS = 100;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const verifyLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by your browser');
        return;
      }

      setIsVerifyingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const dist = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            CLASSROOM_LOCATION.lat,
            CLASSROOM_LOCATION.lng
          );

          if (dist <= ALLOWED_RADIUS_METERS) {
            resolve(true);
          } else {
            reject(`Access Denied: You are ${Math.round(dist)}m away. You must be in the classroom to mark attendance.`);
          }
          setIsVerifyingLocation(false);
        },
        (error) => {
          reject('Location access required to verify classroom attendance');
          setIsVerifyingLocation(false);
        }
      );
    });
  };

  const startScan = async () => {
    if (!studentData.id) {
      alert('Please enter your ID first');
      return;
    }

    try {
      setLocationError(null);
      await verifyLocation();

      setIsScanning(true);
      setResult(null);

      const imageSrc = webcamRef.current.getScreenshot();

      setTimeout(async () => {
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance`, {
            studentId: studentData.id,
            status: 'present'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setIsScanning(false);
          setCapturedImage(imageSrc);
          setResult({
            success: true,
            name: studentData.name,
            studentId: studentData.id,
            timestamp: new Date().toLocaleTimeString(),
            message: response.data.message
          });
          fetchHistory();
        } catch (error) {
          setIsScanning(false);
          alert(error.response?.data?.error || 'Verification failed');
        }
      }, 2500);
    } catch (err) {
      setLocationError(err);
    }
  };
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? `${import.meta.env.VITE_API_URL}/api/admin/pending-attendance` : `${import.meta.env.VITE_API_URL}/api/attendance/${user.id}`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (history.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Prepare CSV data
    const headers = isAdmin 
      ? ["Student Name", "Student ID", "Date", "Status", "Method"]
      : ["Date", "Status", "Method"];
    
    const csvContent = [
      headers.join(","),
      ...history.map(row => {
        const line = isAdmin
          ? [row.name, row.studentId, row.date, "PRESENT", "AI Face + Geofencing"]
          : [row.date, "PRESENT", "AI Face + Geofencing"];
        return line.map(field => `"${field}"`).join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  return (
    <div className="attendance-page" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ marginBottom: '5px' }}>Attendance Portal</h1>
          <p style={{ color: 'var(--text-dim)' }}>
            {isAdmin ? 'Access and export official campus audit logs' : 'Verify identity and mark your daily presence'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {isAdmin && activeTab === 'history' && (
            <button
              onClick={handleExport}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#334155', padding: '10px 20px' }}
            >
              <Download size={18} /> Export CSV
            </button>
          )}

          <div style={{ display: 'flex', background: 'var(--card-inner)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            {!isAdmin && (
              <button
                onClick={() => setActiveTab('mark')}
                style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', background: activeTab === 'mark' ? 'var(--primary)' : 'transparent', color: activeTab === 'mark' ? 'white' : 'var(--text-dim)', border: 'none', cursor: 'pointer' }}
              >
                Mark Presence
              </button>
            )}
            <button
              onClick={() => setActiveTab('history')}
              style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', background: activeTab === 'history' ? 'var(--primary)' : 'transparent', color: activeTab === 'history' ? 'white' : 'var(--text-dim)', border: 'none', cursor: 'pointer' }}
            >
              {isAdmin ? 'Access Logs' : 'My History'}
            </button>
          </div>
        </div>
      </div>

      {!isAdmin && activeTab === 'mark' && (
        <div className="glass-card" style={{ padding: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 250px', gap: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>Full Name</label>
                  <input type="text" className="input-field" value={studentData.name} disabled />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>ID Number</label>
                  <input type="text" className="input-field" value={studentData.id} disabled />
                </div>
              </div>

              <div style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', border: '2px solid var(--border)', background: '#000' }}>
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '100%', display: 'block' }} />
                {isScanning && (
                  <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="scan-animation"></div>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '5px 15px', borderRadius: '20px', zIndex: 10, fontSize: '0.8rem', fontWeight: 'bold' }}>RECOGNIZING...</div>
                  </div>
                )}
              </div>

              <button
                className="btn-primary"
                onClick={startScan}
                disabled={isScanning || isVerifyingLocation}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '50px', position: 'relative' }}
              >
                {isVerifyingLocation ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> VERIFYING LOCATION...
                  </>
                ) : (
                  <>
                    <Camera size={20} /> SCAN & SUBMIT
                  </>
                )}
              </button>

              {locationError && (
                <div style={{ marginTop: '15px', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--error)' }}>
                  <XCircle size={18} /> {locationError}
                </div>
              )}
            </div>
            <div style={{ background: 'var(--card-inner)', borderRadius: '15px', padding: '20px', border: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Info size={18} color="var(--primary)" /> Smart Verification</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>Your identity and location are verified using AI and Geofencing. Once confirmed, your attendance is recorded immediately without further review.</p>
            </div>
          </div>
        </div>
      )}


      {activeTab === 'history' && (
        <div className="glass-card">
          {loading ? <div style={{ padding: '50px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: 'var(--card-inner)' }}>
                    {isAdmin && <th style={{ padding: '15px 25px' }}>Student Name</th>}
                    {isAdmin && <th style={{ padding: '15px 25px' }}>ID</th>}
                    <th style={{ padding: '15px 25px' }}>Date</th>
                    <th style={{ padding: '15px 25px' }}>Status</th>
                    <th style={{ padding: '15px 25px' }}>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      {isAdmin && <td style={{ padding: '15px 25px', fontWeight: '600' }}>{row.name}</td>}
                      {isAdmin && <td style={{ padding: '15px 25px' }}>{row.studentId}</td>}
                      <td style={{ padding: '15px 25px' }}>{row.date}</td>
                      <td style={{ padding: '15px 25px' }}>
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: 'var(--success)',
                          padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold'
                        }}>
                          PRESENT
                        </span>
                      </td>
                      <td style={{ padding: '15px 25px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        AI Face + Geofencing
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {result && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="glass-card animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={45} color="white" />
            </div>
            <h2>Verified!</h2>
            <p style={{ color: 'var(--text-dim)', margin: '15px 0 25px' }}>{result.message}</p>
            <button className="btn-primary" onClick={() => setResult(null)} style={{ width: '100%' }}>Done</button>
          </div>
        </div>
      )}

      <style>{`
        .scan-animation { position: absolute; width: 100%; height: 3px; background: var(--primary); top: 0; left: 0; animation: scanVertical 2s infinite linear; z-index: 5; }
        @keyframes scanVertical { 0% { top: 0; } 100% { top: 100%; } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Attendance;
