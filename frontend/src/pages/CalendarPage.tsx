import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { CalendarEvent } from '../types/crm';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { events, createEvent } = useCRM();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    event_type: 'Demo',
    date: '2026-08-19',
    time: '11:00 AM',
    duration: '45 mins',
    customer_name: '',
    location: 'Google Meet: meet.google.com/nex-crm-call',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEvent({
      ...formData,
      attendees: ['Amit Sharma', formData.customer_name]
    });
    setModalOpen(false);
    setFormData({ title: '', event_type: 'Demo', date: '2026-08-19', time: '11:00 AM', duration: '45 mins', customer_name: '', location: 'Google Meet', description: '' });
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Meeting & Demo Calendar
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Schedule and coordinate product demos, contract negotiations, and executive reviews.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Create Event</span>
        </button>
      </div>

      {/* Calendar View Container */}
      <div className="card" style={{ padding: '24px' }}>
        {/* Calendar Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>August 2026 (IST)</h2>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-secondary btn-sm"><ChevronLeft size={14} /></button>
            <button className="btn btn-secondary btn-sm">Today</button>
            <button className="btn btn-secondary btn-sm"><ChevronRight size={14} /></button>
          </div>
        </div>

        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px', textAlign: 'center' }}>
          {daysOfWeek.map(d => (
            <div key={d} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Calendar Days Matrix (Aug 2026) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {Array.from({ length: 31 }, (_, i) => {
            const dayNum = i + 1;
            const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            const isToday = dayNum === 17;

            return (
              <div
                key={dayNum}
                style={{
                  minHeight: '100px',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: isToday ? 'var(--primary-light)' : 'var(--bg-muted)',
                  border: isToday ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--accent-blue)' : 'inherit' }}>
                  {dayNum} {isToday && '• Today'}
                </div>

                {dayEvents.map(evt => (
                  <div
                    key={evt.id}
                    style={{
                      padding: '4px 6px',
                      borderRadius: '4px',
                      backgroundColor: evt.event_type === 'Demo' ? '#2563EB' : '#7C3AED',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 600,
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={`${evt.time} - ${evt.title} (${evt.customer_name})`}
                  >
                    {evt.time} {evt.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Upcoming Scheduled Events</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {events.map(evt => (
            <div
              key={evt.id}
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary">{evt.event_type}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{evt.duration}</span>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 700, marginTop: '8px' }}>{evt.title}</h4>
              <div style={{ fontSize: '12.5px', color: 'var(--accent-blue)', fontWeight: 600, marginTop: '2px' }}>
                {evt.customer_name}
              </div>

              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} /> <span>{evt.date} at {evt.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} /> <span>{evt.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Schedule Meeting / Demo</h3>
              <button onClick={() => setModalOpen(false)} className="btn-ghost btn-icon">✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input required placeholder="Event Title *" className="input-control" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <input required placeholder="Client / Account *" className="input-control" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input type="date" className="input-control" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                <input placeholder="Time (e.g. 02:30 PM)" className="input-control" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
              </div>
              <input placeholder="Location / Google Meet Link" className="input-control" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
