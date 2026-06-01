'use client';
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, MapPin, Clock, Trash2, Edit2, X, Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function EventCalendarPage() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({ title: '', date: '', location: '', description: '', type: 'academic' });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent._id || editingEvent.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/events', formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchEvents();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Error saving event');
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/api/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchEvents();
      } catch (error) {
        alert('Error deleting event');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', date: '', location: '', description: '', type: 'academic' });
    setEditingEvent(null);
  };

  const openEditModal = (event) => {
    if (!isAdmin) return;
    setEditingEvent(event);
    setFormData({ title: event.title, date: event.date, location: event.location || '', description: event.description || '', type: event.type || 'academic' });
    setShowModal(true);
  };

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  const renderCalendarDays = () => {
    const totalDays = daysInMonth(currentMonth);
    const startDay = firstDayOfMonth(currentMonth);
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    for (let day = 1; day <= totalDays; day++) {
      const dateString = `${year}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateString);
      const isToday = new Date().toISOString().split('T')[0] === dateString;
      days.push(
        <div key={day} className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}>
          <span className="day-number">{day}</span>
          <div className="day-events">
            {dayEvents.map(e => (
              <div key={e._id || e.id} className={`event-dot ${e.type}`} title={e.title}></div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="events-calendar-page animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ marginBottom: '5px' }}>College Events Calendar</h1>
          <p style={{ color: 'var(--text-dim)' }}>
            {isAdmin ? 'Manage schedules, holidays, and campus activities' : 'View upcoming events and important dates'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Plus size={18} /> Create Event
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        <div className="glass-card" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{monthName} {year}</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={prevMonth} className="calendar-nav-btn"><ChevronLeft size={20} /></button>
              <button onClick={nextMonth} className="calendar-nav-btn"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="calendar-header-day">{d}</div>
            ))}
            {renderCalendarDays()}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '25px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--primary)" /> Event Timeline
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '550px', overflowY: 'auto', paddingRight: '10px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="animate-spin" /></div>
            ) : events.length > 0 ? (
              events.map(event => (
                <div key={event._id || event.id} className="event-item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className={`event-badge ${event.type}`}>{event.type}</span>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => openEditModal(event)} className="event-action-btn edit"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(event._id || event.id)} className="event-action-btn delete"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '10px' }}>{event.title}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CalendarIcon size={14} /> {event.date}</div>
                    {event.location && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {event.location}</div>}
                  </div>
                  {event.description && !isAdmin && (
                    <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-main)' }}>{event.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px' }}>No events scheduled yet.</p>
            )}
          </div>
        </div>
      </div>

      {isAdmin && showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '30px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>{editingEvent ? 'Update Event' : 'Schedule New Event'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'var(--text-dim)', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="input-label">Event Title</label>
                <input type="text" className="input-field" placeholder="e.g. Annual Symposium 2024" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label className="input-label">Date</label>
                  <input type="date" className="input-field" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="input-label">Category</label>
                  <select className="input-field" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="academic">Academic</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Location</label>
                <input type="text" className="input-field" placeholder="e.g. Main Auditorium" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Brief Description</label>
                <textarea className="input-field" style={{ height: '80px', resize: 'none' }} placeholder="Event details..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <Check size={18} /> {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
