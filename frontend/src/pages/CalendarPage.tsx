import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { CalendarEvent } from '../types/crm';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users,
  X, Video, PhoneCall, Building2, CheckCircle2 
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { events, createEvent, companies, contacts } = useCRM();
  const { canManageDeals } = usePermissions();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    event_type: 'Demo',
    date: '2026-08-20',
    time: '11:00 AM',
    duration: '45 mins',
    customer_name: 'TechNova Solutions',
    location: 'Google Meet: meet.google.com/nex-crm-call',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    await createEvent({
      ...formData,
      attendees: ['Amit Sharma', formData.customer_name]
    });
    setModalOpen(false);
    setFormData({ title: '', event_type: 'Demo', date: '2026-08-20', time: '11:00 AM', duration: '45 mins', customer_name: 'TechNova Solutions', location: 'Google Meet: meet.google.com/nex-crm-call', description: '' });
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
            Schedule and coordinate product demos, contract negotiations, and customer success touchpoints across India.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Schedule Event</span>
        </button>
      </div>

      {/* Calendar View Container */}
      <div className="card" style={{ padding: '24px' }}>
        {/* Calendar Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>August 2026 (IST Timezone)</h2>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-secondary btn-sm"><ChevronLeft size={14} /></button>
            <button className="btn btn-secondary btn-sm">Today (17 Aug)</button>
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
                  minHeight: '110px',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: isToday ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-muted)',
                  border: isToday ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-color)',
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
                    onClick={() => setSelectedEvent(evt)}
                    style={{
                      padding: '4px 6px',
                      borderRadius: '4px',
                      backgroundColor: evt.event_type === 'Demo' ? 'rgba(124, 58, 237, 0.12)' :
                                      evt.event_type === 'Meeting' ? 'rgba(37, 99, 235, 0.12)' : 'rgba(5, 150, 105, 0.12)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1px'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {evt.time} {evt.title}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                      {evt.customer_name}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Schedule Meeting or Demo</h3>
              <button onClick={() => setModalOpen(false)} className="btn-ghost btn-icon">✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Event Title</label>
                <input required className="input-control" placeholder="e.g. Enterprise Security Architecture Q&A" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Event Type</label>
                  <select className="input-control" value={formData.event_type} onChange={e => setFormData({ ...formData, event_type: e.target.value })}>
                    <option value="Demo">Product Demo</option>
                    <option value="Meeting">Executive Meeting</option>
                    <option value="Call">Qualifying Call</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Account / Client</label>
                  <select className="input-control" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })}>
                    {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Date (Aug 2026)</label>
                  <input type="date" className="input-control" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Time (IST)</label>
                  <input className="input-control" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Meeting Link / Location</label>
                <input className="input-control" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule & Notify</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Inspection Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-accent">{selectedEvent.event_type}</span>
              <button onClick={() => setSelectedEvent(null)} className="btn btn-ghost btn-icon"><X size={16} /></button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{selectedEvent.title}</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Account:</strong> {selectedEvent.customer_name}</div>
                <div><strong>Date & Time:</strong> {selectedEvent.date} at {selectedEvent.time} ({selectedEvent.duration})</div>
                <div><strong>Location:</strong> {selectedEvent.location}</div>
                {selectedEvent.description && <div><strong>Agenda:</strong> {selectedEvent.description}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
