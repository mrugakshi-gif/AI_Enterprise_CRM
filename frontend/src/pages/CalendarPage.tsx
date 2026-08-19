import React, { useState, useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import { CalendarEvent } from '../types/crm';
import {
  Plus, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon,
  Video, Monitor, Terminal, PhoneCall, Building2, Clock, MapPin, Users
} from 'lucide-react';
import {
  getToday, formatDateISO, formatMonthYear, formatDateIST, formatTime12h,
  formatDayMonthShort, formatWeekdayDate, getRelativeDateLabel, formatTimeRange,
  addMonths, getMonthMatrix, DAYS_MON_FIRST, CalendarDayCell, parseDateString
} from '../utils/dateUtils';

export const CalendarPage: React.FC = () => {
  const { events, createEvent, companies } = useCRM();

  const today = getToday();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const todayISO = formatDateISO(today);

  const getDefaultFormData = () => ({
    title: '',
    event_type: 'Meeting',
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
      attendees: ['Amit Sharma', formData.customer_name || 'Client Attendee']
    });
    setModalOpen(false);
    setFormData(getDefaultFormData());
  };

  const handlePrev = () => setCurrentMonth(prev => addMonths(prev, -1));
  const handleNext = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));

  const openScheduleModal = (prefillDate?: string) => {
    setFormData({
      ...getDefaultFormData(),
      date: prefillDate || todayISO
    });
    setModalOpen(true);
  };

  const cells: CalendarDayCell[] = getMonthMatrix(currentMonth);

  // Helper for event styling based on type
  const getEventStyle = (eventType: string) => {
    switch (eventType) {
      case 'Presentation':
        return {
          bg: 'rgba(124, 58, 237, 0.09)',
          border: 'rgba(124, 58, 237, 0.28)',
          text: '#7C3AED',
          badgeClass: 'badge-purple'
        };
      case 'Technical':
        return {
          bg: 'rgba(5, 150, 105, 0.09)',
          border: 'rgba(5, 150, 105, 0.28)',
          text: '#059669',
          badgeClass: 'badge-emerald'
        };
      case 'Demo':
        return {
          bg: 'rgba(124, 58, 237, 0.09)',
          border: 'rgba(124, 58, 237, 0.28)',
          text: '#7C3AED',
          badgeClass: 'badge-purple'
        };
      case 'Call':
        return {
          bg: 'rgba(217, 119, 6, 0.09)',
          border: 'rgba(217, 119, 6, 0.28)',
          text: '#D97706',
          badgeClass: 'badge-warning'
        };
      case 'Meeting':
      default:
        return {
          bg: 'rgba(37, 99, 235, 0.09)',
          border: 'rgba(37, 99, 235, 0.28)',
          text: '#2563EB',
          badgeClass: 'badge-blue'
        };
    }
  };

  const getEventIcon = (eventType: string, size = 16) => {
    switch (eventType) {
      case 'Presentation':
        return <Monitor size={size} />;
      case 'Technical':
        return <Terminal size={size} />;
      case 'Call':
        return <PhoneCall size={size} />;
      case 'Demo':
      case 'Meeting':
      default:
        return <Video size={size} />;
    }
  };

  // Sort upcoming events chronologically from today onward
  const upcomingEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => {
        const da = parseDateString(a.date).getTime();
        const db = parseDateString(b.date).getTime();
        return da - db;
      });
  }, [events]);

  const displayedUpcoming = showAllUpcoming ? upcomingEvents : upcomingEvents.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      
      {/* Top Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Meeting & Demo Calendar
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Schedule and coordinate product demos, contract negotiations, and customer success touchpoints across India.
          </p>
        </div>

        <button onClick={() => openScheduleModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} />
          <span>Schedule Event</span>
        </button>
      </div>

      {/* 1. Monthly Calendar Card */}
      <div
        className="card"
        style={{
          padding: '24px',
          borderRadius: '14px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Calendar Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {formatMonthYear(currentMonth)} (IST Timezone)
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handlePrev}
              title="Previous Month"
              style={{ padding: '6px 10px', minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleToday}
              style={{ fontWeight: 600, padding: '6px 14px', fontSize: '13px' }}
            >
              Today ({formatDayMonthShort(today)})
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleNext}
              title="Next Month"
              style={{ padding: '6px 10px', minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Weekday Header — 7 equal columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: '8px',
            marginBottom: '10px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {DAYS_MON_FIRST.map(d => (
            <div
              key={d}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                padding: '4px 8px',
                textAlign: 'left',
                boxSizing: 'border-box',
                minWidth: 0
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Monthly 7-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: '8px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {cells.map((cell, idx) => {
            const dayEvents = events.filter(e => e.date === cell.dateStr);
            const isHighlighted = cell.isToday;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (cell.isCurrentMonth) {
                    openScheduleModal(cell.dateStr);
                  }
                }}
                style={{
                  minHeight: '105px',
                  maxHeight: '135px',
                  padding: '8px',
                  borderRadius: '10px',
                  backgroundColor: isHighlighted
                    ? 'rgba(37, 99, 235, 0.05)'
                    : cell.isCurrentMonth
                    ? 'var(--bg-muted)'
                    : 'transparent',
                  border: isHighlighted
                    ? '1.5px solid var(--accent-blue)'
                    : cell.isCurrentMonth
                    ? '1px solid var(--border-color)'
                    : '1px solid transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  cursor: cell.isCurrentMonth ? 'pointer' : 'default',
                  opacity: cell.isCurrentMonth ? 1 : 0.35,
                  transition: 'background-color 0.15s, border-color 0.15s',
                  boxSizing: 'border-box',
                  minWidth: 0,
                  width: '100%',
                  overflow: 'hidden'
                }}
              >
                {/* Date Header */}
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: isHighlighted ? 800 : 600,
                    color: isHighlighted ? 'var(--accent-blue)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minWidth: 0
                  }}
                >
                  <span>{cell.dayNum}</span>
                  {isHighlighted && (
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                      • Today
                    </span>
                  )}
                </div>

                {/* Event Cards inside cell */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', minWidth: 0, width: '100%' }}>
                  {dayEvents.slice(0, 2).map(evt => {
                    const style = getEventStyle(evt.event_type);
                    return (
                      <div
                        key={evt.id}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        style={{
                          padding: '4px 6px',
                          borderRadius: '6px',
                          backgroundColor: style.bg,
                          border: `1px solid ${style.border}`,
                          color: style.text,
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1px',
                          minWidth: 0,
                          width: '100%',
                          boxSizing: 'border-box',
                          transition: 'opacity 0.15s'
                        }}
                        title={`${evt.time} - ${evt.title} (${evt.customer_name})`}
                      >
                        <div style={{ fontWeight: 700, fontSize: '10px', opacity: 0.9, lineHeight: 1.2 }}>
                          {evt.time}
                        </div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minWidth: 0,
                            width: '100%',
                            lineHeight: 1.25
                          }}
                        >
                          {evt.title}
                        </div>
                        {evt.customer_name && (
                          <div
                            style={{
                              color: 'var(--text-secondary)',
                              fontSize: '9.5px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              minWidth: 0,
                              width: '100%'
                            }}
                          >
                            {evt.customer_name}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {dayEvents.length > 2 && (
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedEvent(dayEvents[2]);
                      }}
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: 'var(--accent-blue)',
                        padding: '2px 4px',
                        cursor: 'pointer'
                      }}
                    >
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Upcoming Scheduled Events Section */}
      <div
        className="card"
        style={{
          padding: '24px',
          borderRadius: '14px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Upcoming Scheduled Events
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Upcoming meetings, client product presentations, and architectural reviews
            </p>
          </div>
          <button
            onClick={() => setShowAllUpcoming(prev => !prev)}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600, fontSize: '12.5px' }}
          >
            {showAllUpcoming ? 'Show Less' : `View All (${upcomingEvents.length})`}
          </button>
        </div>

        {/* Events List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayedUpcoming.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No upcoming scheduled events found. Click "Schedule Event" above to create one.
            </div>
          ) : (
            displayedUpcoming.map(evt => {
              const style = getEventStyle(evt.event_type);
              const relativeLabel = getRelativeDateLabel(evt.date);
              const weekdayDateStr = formatWeekdayDate(evt.date);
              const timeRangeStr = formatTimeRange(evt.time, evt.duration);

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-app)',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, transform 0.1s',
                    flexWrap: 'wrap',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                >
                  {/* Left: Icon + Title & Company */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px', flex: '1 1 240px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: style.bg,
                        border: `1px solid ${style.border}`,
                        color: style.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {getEventIcon(evt.event_type, 18)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {evt.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Building2 size={12} color="var(--text-muted)" />
                        <span>{evt.customer_name || 'General Account'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Left: Date Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '130px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                      {relativeLabel}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {weekdayDateStr}
                    </div>
                  </div>

                  {/* Middle Right: Time Section */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '150px' }}>
                    <Clock size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {timeRangeStr}
                    </span>
                  </div>

                  {/* Right: Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        backgroundColor: style.bg,
                        border: `1px solid ${style.border}`,
                        color: style.text
                      }}
                    >
                      {evt.event_type}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={18} color="var(--accent-blue)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Schedule Event or Demo</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="btn-ghost btn-icon">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Event Title *</label>
                <input
                  required
                  className="input-control"
                  placeholder="e.g. Executive Architecture Review & Pricing"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Event Type</label>
                  <select
                    className="input-control"
                    value={formData.event_type}
                    onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                  >
                    <option value="Meeting">Executive Meeting</option>
                    <option value="Presentation">Presentation</option>
                    <option value="Technical">Technical Review</option>
                    <option value="Demo">Product Demo</option>
                    <option value="Call">Qualifying Call</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Account / Client</label>
                  <select
                    className="input-control"
                    value={formData.customer_name}
                    onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                  >
                    <option value="">Select company…</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Date (IST)</label>
                  <input
                    type="date"
                    required
                    className="input-control"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Start Time (IST)</label>
                  <input
                    className="input-control"
                    placeholder="11:00 AM"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Duration</label>
                  <select
                    className="input-control"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  >
                    <option value="15 mins">15 mins</option>
                    <option value="30 mins">30 mins</option>
                    <option value="45 mins">45 mins</option>
                    <option value="60 mins">60 mins</option>
                    <option value="90 mins">90 mins</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Location / Link</label>
                  <input
                    className="input-control"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Agenda & Notes</label>
                <textarea
                  className="input-control"
                  rows={2}
                  placeholder="Key discussion topics and objectives..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save & Schedule
                </button>
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
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  ...getEventStyle(selectedEvent.event_type)
                }}
              >
                {selectedEvent.event_type}
              </span>
              <button onClick={() => setSelectedEvent(null)} className="btn btn-ghost btn-icon">
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {selectedEvent.title}
              </h3>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={15} color="var(--text-muted)" />
                  <span><strong>Account:</strong> {selectedEvent.customer_name || 'Not specified'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarIcon size={15} color="var(--text-muted)" />
                  <span><strong>Date:</strong> {formatWeekdayDate(selectedEvent.date)} ({getRelativeDateLabel(selectedEvent.date)})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={15} color="var(--text-muted)" />
                  <span><strong>Time:</strong> {formatTimeRange(selectedEvent.time, selectedEvent.duration)}</span>
                </div>
                {selectedEvent.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={15} color="var(--text-muted)" />
                    <span><strong>Location:</strong> {selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={15} color="var(--text-muted)" />
                    <span><strong>Attendees:</strong> {selectedEvent.attendees.join(', ')}</span>
                  </div>
                )}
                {selectedEvent.description && (
                  <div style={{ marginTop: '6px', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-muted)', fontSize: '12.5px' }}>
                    <strong>Agenda:</strong> {selectedEvent.description}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={() => setSelectedEvent(null)} className="btn btn-secondary btn-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
