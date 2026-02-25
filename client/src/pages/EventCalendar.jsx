import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, MapPin, Clock, Trash2, Edit2, X, Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EventCalendar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    type: 'academic'
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      if (editingEvent) {
        await axios.put(`http://localhost:5001/api/events/${editingEvent.id}`, formData);
      } else {
        await axios.post('http://localhost:5001/api/events', formData);
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
        await axios.delete(`http://localhost:5001/api/events/${id}`);
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
    setFormData({
      title: event.title,
      date: event.date,
      location: event.location || '',
      description: event.description || '',
      type: event.type || 'academic'
    });
    setShowModal(true);
  };

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));

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
              <div key={e.id} className={`event-dot ${e.type}`} title={e.title}></div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="events-calendar-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ marginBottom: '5px' }}>College Events Calendar</h1>
          <p style={{ color: 'var(--text-dim)' }}>
            {isAdmin ? 'Manage schedules, holidays, and campus activities' : 'View upcoming events and important dates'}
          </p>
        </div>
        {isAdmin && (
          <button
            className="btn-primary"
            onClick={() => { resetForm(); setShowModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
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
          <div className="event-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '550px', overflowY: 'auto', paddingRight: '10px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="animate-spin" /></div>
            ) : events.length > 0 ? (
              events.map(event => (
                <div key={event.id} className="event-item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className={`event-badge ${event.type}`}>{event.type}</span>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => openEditModal(event)} className="event-action-btn edit"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(event.id)} className="event-action-btn delete"><Trash2 size={14} /></button>
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>{editingEvent ? 'Update Event' : 'Schedule New Event'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'var(--text-dim)' }}><X size={24} /></button>
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

      <style>{`
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
        .calendar-header-day { text-align: center; font-weight: 600; color: var(--text-dim); padding: 10px 0; font-size: 0.9rem; }
        .calendar-day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 10px; border-radius: 12px; background: var(--card-inner); border: 1px solid var(--border); position: relative; transition: all 0.2s ease; }
        .calendar-day.empty { background: transparent; border: none; }
        .calendar-day.today { border-color: var(--primary); background: rgba(99, 102, 241, 0.05); }
        .calendar-day.today .day-number { color: var(--primary); font-weight: bold; }
        .calendar-day.has-events { cursor: pointer; }
        .calendar-day:hover:not(.empty) { transform: translateY(-2px); border-color: var(--primary); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .day-number { font-size: 1rem; color: var(--text-main); }
        .day-events { display: flex; gap: 4px; margin-top: 5px; flex-wrap: wrap; justify-content: center; }
        .event-dot { width: 6px; height: 6px; borderRadius: 50%; }
        .event-dot.academic { background: #6366f1; }
        .event-dot.cultural { background: #ec4899; }
        .event-dot.sports { background: #10b981; }
        .event-dot.holiday { background: #f59e0b; }
        .calendar-nav-btn { background: var(--card-inner); border: 1px solid var(--border); padding: 8px; border-radius: 10px; color: var(--text-main); cursor: pointer; }
        .calendar-nav-btn:hover { border-color: var(--primary); color: var(--primary); }
        .event-item-card { background: var(--card-inner); border: 1px solid var(--border); padding: 15px; borderRadius: 12px; border-left: 4px solid var(--primary); transition: all 0.2s ease; }
        .event-item-card:hover { border-color: var(--primary); transform: translateX(5px); }
        .event-badge { font-size: 0.7rem; font-weight: bold; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; }
        .event-badge.academic { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
        .event-badge.cultural { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
        .event-badge.sports { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .event-badge.holiday { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .event-action-btn { background: transparent; border: 1px solid var(--border); padding: 5px; border-radius: 6px; color: var(--text-dim); display: flex; align-items: center; justify-content: center; }
        .event-action-btn.edit:hover { color: var(--primary); border-color: var(--primary); }
        .event-action-btn.delete:hover { color: var(--error); border-color: var(--error); }
        .btn-secondary { background: transparent; border: 1px solid var(--border); padding: 12px; borderRadius: 8px; color: var(--text-main); font-weight: 600; cursor: pointer; }
        .input-label { display: block; margin-bottom: 8px; font-size: 0.9rem; color: var(--text-dim); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default EventCalendar;
