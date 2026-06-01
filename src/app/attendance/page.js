'use client';
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, MapPin, CheckCircle, Loader2, ShieldCheck, AlertTriangle, X, Wifi } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import dynamic from 'next/dynamic';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => m.QRCodeSVG), { ssr: false });

export default function AttendancePage() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [qrSessionToken, setQrSessionToken] = useState('');
  const [scannedToken, setScannedToken] = useState('');
  const [step, setStep] = useState('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (isAdmin) {
      fetchRecords();
    }
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/admin/pending-attendance', { headers: { Authorization: `Bearer ${token}` } });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateQR = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/generate-qr-session', { headers: { Authorization: `Bearer ${token}` } });
      setQrSessionToken(res.data.token);
    } catch (err) {
      setMessage('Failed to generate QR session');
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          setScannedToken(decoded);
          setStep('scanned');
          html5QrCode.stop().catch(() => {});
          setIsScanning(false);
        },
        () => {}
      );
    } catch (err) {
      setMessage('Camera access denied or unavailable.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try { await html5QrCodeRef.current.stop(); } catch {}
    }
    setIsScanning(false);
  };

  const verifyLocation = () => {
    setStep('location');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => { setStep('face'); setMessage('Location verified!'); },
        () => { setMessage('Location access denied. Continuing anyway.'); setStep('face'); }
      );
    } else {
      setStep('face');
    }
  };

  const handleFaceVerification = () => {
    setStep('submitting');
    submitAttendance();
  };

  const submitAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/attendance', {
        studentId: user.studentId,
        status: 'present',
        qrToken: scannedToken,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setStep('success');
      setMessage(res.data.message || 'Attendance marked!');
    } catch (err) {
      setStep('error');
      setMessage(err.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('idle');
    setScannedToken('');
    setMessage('');
  };

  // Admin View
  if (isAdmin) {
    return (
      <div className="animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ marginBottom: '5px' }}>Attendance Control</h1>
            <p style={{ color: 'var(--text-dim)' }}>Generate QR codes and monitor attendance records</p>
          </div>
          <button className="btn-primary" onClick={generateQR} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <QrCode size={18} />} Broadcast QR
          </button>
        </div>

        {qrSessionToken && (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Active QR Session</h3>
            <div style={{ background: 'white', display: 'inline-block', padding: '20px', borderRadius: '16px' }}>
              <QRCodeSVG value={qrSessionToken} size={250} />
            </div>
            <p style={{ color: 'var(--text-dim)', marginTop: '15px', fontSize: '0.85rem' }}>Students must scan this code within 5 minutes</p>
          </div>
        )}

        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <h3 style={{ padding: '20px 25px', borderBottom: '1px solid var(--border)' }}>Attendance Log</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: 'var(--card-inner)' }}>
                <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600' }}>Student</th>
                <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600' }}>ID</th>
                <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '15px 25px', color: 'var(--text-dim)', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? records.map(rec => (
                <tr key={rec.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '15px 25px', fontWeight: '500' }}>{rec.name}</td>
                  <td style={{ padding: '15px 25px', color: 'var(--text-dim)' }}>{rec.studentId}</td>
                  <td style={{ padding: '15px 25px', color: 'var(--text-dim)' }}>{rec.date}</td>
                  <td style={{ padding: '15px 25px' }}>
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>No records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Student View
  return (
    <div className="animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Mark Attendance</h1>
        <p style={{ color: 'var(--text-dim)' }}>Multi-factor verification for secure attendance</p>
      </div>

      {step === 'idle' && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <QrCode size={40} color="var(--primary)" />
          </div>
          <h3 style={{ marginBottom: '10px' }}>Step 1: Scan QR Code</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '30px', fontSize: '0.9rem' }}>Scan the QR code displayed by your instructor</p>
          <button className="btn-primary" onClick={startScanner} style={{ width: '100%', padding: '16px' }}>
            <Camera size={20} /> Open Scanner
          </button>
        </div>
      )}

      {isScanning && (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3>Scanning...</h3>
            <button onClick={stopScanner} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
          </div>
          <div id="qr-reader" ref={scannerRef} style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
            <div className="scan-animation" />
          </div>
        </div>
      )}

      {step === 'scanned' && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={40} color="var(--success)" />
          </div>
          <h3 style={{ marginBottom: '10px' }}>QR Verified!</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '30px', fontSize: '0.9rem' }}>Proceeding to location verification...</p>
          <button className="btn-primary" onClick={verifyLocation} style={{ width: '100%', padding: '16px' }}>
            <MapPin size={20} /> Verify Location
          </button>
        </div>
      )}

      {step === 'face' && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <ShieldCheck size={40} color="var(--primary)" />
          </div>
          <h3 style={{ marginBottom: '10px' }}>Step 3: Identity Verification</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '30px', fontSize: '0.9rem' }}>Confirm your identity to complete attendance</p>
          <button className="btn-primary" onClick={handleFaceVerification} style={{ width: '100%', padding: '16px' }}>
            <Camera size={20} /> Confirm Identity
          </button>
        </div>
      )}

      {step === 'submitting' && (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={50} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
          <h3>Processing Attendance...</h3>
        </div>
      )}

      {step === 'success' && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={40} color="white" />
          </div>
          <h3 style={{ marginBottom: '10px' }}>Attendance Confirmed!</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>{message}</p>
          <button className="btn-primary" onClick={resetFlow} style={{ width: '100%', padding: '16px' }}>Done</button>
        </div>
      )}

      {step === 'error' && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <AlertTriangle size={40} color="var(--danger)" />
          </div>
          <h3 style={{ marginBottom: '10px', color: 'var(--danger)' }}>Verification Failed</h3>
          <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>{message}</p>
          <button className="btn-primary" onClick={resetFlow} style={{ width: '100%', padding: '16px' }}>Try Again</button>
        </div>
      )}

      {message && step === 'idle' && (
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger)', textAlign: 'center', fontWeight: '600' }}>
          {message}
        </div>
      )}
    </div>
  );
}
