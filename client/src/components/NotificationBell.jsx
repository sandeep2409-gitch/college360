import React, { useState } from 'react';
import { Bell, ShieldCheck, Info, Check, Trash2, X, AlertCircle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
  const { notifications, markAllAsRead, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return <ShieldCheck size={18} color="var(--success)" />;
      case 'info': return <Info size={18} color="var(--primary)" />;
      case 'error': return <AlertCircle size={18} color="var(--error)" />;
      default: return <Info size={18} color="var(--primary)" />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: 'var(--card-inner)', border: '1px solid var(--border)', padding: '12px', borderRadius: '12px', color: 'var(--text-main)', cursor: 'pointer', position: 'relative' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '800', border: '2px solid var(--bg-surface)' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000 }} />
          <div className="glass-card animate-scale-up" style={{ position: 'absolute', top: '60px', right: '0', width: '380px', maxHeight: '500px', display: 'flex', flexDirection: 'column', zIndex: 1001, padding: '24px', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Campus Alerts</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={markAllAsRead} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', cursor: 'pointer' }}>READ ALL</button>
                <button onClick={clearNotifications} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                   <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
                  <Bell size={40} style={{ margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '0.9rem' }}>Grid is quiet. No incoming alerts.</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} style={{ display: 'flex', gap: '16px', padding: '16px', background: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', border: notif.read ? '1px solid var(--border)' : '1px solid var(--primary-glow)', position: 'relative' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '12px', height: 'fit-content' }}>
                      {getTypeIcon(notif.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>{notif.title}</h4>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="btn-primary" 
              style={{ width: '100%', marginTop: '20px', padding: '12px', fontSize: '0.85rem' }}
            >
              CLOSE UPLINK
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
