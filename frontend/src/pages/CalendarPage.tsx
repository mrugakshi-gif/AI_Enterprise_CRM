import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { CalendarEvent } from '../types/crm';
import { usePermissions } from '../hooks/usePermissions';
import {
  Plus, ChevronLeft, ChevronRight, X, Video, PhoneCall, Building2
} from 'lucide-react';
import {
  getToday, formatDateISO, formatMonthYear, formatDateIST, formatTime12h,
  addMonths, getMonthMatrix, DAYS_MON_FIRST, CalendarDayCell
} from '../utils/dateUtils';

export const CalendarPage: React.FC = () => {
  const { events, createEvent, companies } = useCRM();
  const { canManageDeals } = usePermissions();

  const today = getToday();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const todayISO = formatDateISO(today);

  const getDefaultFormData = () => ({
    title: '',
    event_type: 'Demo',
    date: todayISO,
    time: formatTime12h(today),
    duration: '45 mins',
    customer_name: '',
    location: 'Google Meet: meet.google.com/nex-crm-call',
    description: ''
  });

  const [formData, setFormData] = useState(getDefaultFormData());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    await createEvent({
      ...formData,
      attendees: ['Amit Sharma', formData.customer_name]
    });
    setModalOpen(false);
    setFormData(getDefaultFormData());
  };

  const handlePrev = () => setCurrentMonth(prev => addMonths(prev, -1));
  const handleNext = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));

  const openScheduleModal = () => {
    setFormData(getDefaultFormData());
    setModalOpen(true);
  };

  const cells: CalendarDayCell[] = getMonthMatrix(currentMonth);

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

        <button onClick={openScheduleModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Schedule Event</span>
        </button>
      </div>

      {/* Calendar View Container */}
      <div className="card" style={{ padding: '24px' }}>
        {/* Calendar Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{formatMonthYear(currentMonth)} (IST Timezone)</h2>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrev}><ChevronLeft size={14} /></button>
            <button className="btn btn-secondary btn-sm" onClick={handleToday}>Today ({formatDateIST(today).slice(0, 6).trim()})</button>
            <button className="btn btn-secondary btn-sm" onClick={handleNext}><ChevronRight size={14} /></button>
          </div>
        </div>

        {/* Days Header — Monday first */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px', textAlign: 'center' }}>
          {DAYS_MON_FIRST.map(d => (
            <div key={d} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {cells.map((cell, idx) => {
            const dayEvents = events.filter(e => e.date === cell.dateStr);
            return (
              <div
                key={idx}
                onClick={() => {
                  if (cell.isCurrentMonth) {
                    setFormData(prev => ({ ...prev, date: cell.dateStr }));
                    setModalOpen(true);
                  }
                }}
                style={{
                  minHeight: '90px',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: cell.isToday
                    ? 'rgba(37, 99, 235, 0.07)'
                    : cell.isCurrentMonth ? 'var(--bg-muted)' : 'transparent',
                  border: cell.isToday
                    ? '1.5px solid var(--accent-blue)'
                    : cell.isCurrentMonth ? '1px solid var(--border-color)' : '1px solid transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  cursor: cell.isCurrentMonth ? 'pointer' : 'default',
                  opacity: cell.isCurrentMonth ? 1 : 0.35,
                  transition: 'background 0.15s'
                }}
              >
                <div style={{
                  fontSize: '12px',
                  fontWeight: cell.isToday ? 800 : 600,
                  color: cell.isToday ? 'var(--accent-blue)' : 'inherit'
                }}>
                  {cell.dayNum} {cell.isToday && '• Today'}
                </div>

                {dayEvents.map(evt => (
                  <div
                    key={evt.id}
                    onClick={e => { e.stopPropagation(); setSelectedEvent(evt); }}
                    style={{
                      padding: '3px 6px',
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
                    <option value="">Select company…</option>
                    {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Date</label>
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

      {/* Event Details Modal */}
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
                <div><strong>Date & Time:</strong> {formatDateIST(selectedEvent.date)} at {selectedEvent.time} ({selectedEvent.duration})</div>
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
