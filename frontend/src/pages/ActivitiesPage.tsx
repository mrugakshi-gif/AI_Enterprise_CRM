import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { ActivityType } from '../types/crm';
import { Plus, Search, Filter, Phone, Mail, Calendar, FileText, CheckSquare, Clock } from 'lucide-react';

export const ActivitiesPage: React.FC = () => {
  const { activities, logActivity } = useCRM();
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Call' as ActivityType,
    title: '',
    customer_name: '',
    time: '10:30 AM',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' '),
    performed_by: 'Amit Sharma',
    notes: ''
  });

  const filteredActs = activities.filter(a => {
    const matchesType = selectedType === 'All' || a.type === selectedType;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.customer_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logActivity(formData);
    setModalOpen(false);
    setFormData({ type: 'Call', title: '', customer_name: '', time: '10:30 AM', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' '), performed_by: 'Amit Sharma', notes: '' });
  };

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'Call': return <Phone size={15} color="#2563EB" />;
      case 'Email': return <Mail size={15} color="#7C3AED" />;
      case 'Meeting': return <Calendar size={15} color="#059669" />;
      case 'Note': return <FileText size={15} color="#D97706" />;
      case 'Task': return <CheckSquare size={15} color="#DC2626" />;
      default: return <Clock size={15} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Activity Timeline & Log
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Real-time feed of all customer calls, demos, emails, and follow-ups across the sales team.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Log Activity</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            placeholder="Search activity, client..."
            className="input-control"
            style={{ paddingLeft: '32px', fontSize: '13px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
        </div>

        <select
          className="input-control"
          style={{ width: '160px', fontSize: '13px' }}
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Call">📞 Calls</option>
          <option value="Email">📧 Emails</option>
          <option value="Meeting">📅 Meetings / Demos</option>
          <option value="Note">📝 Notes</option>
        </select>
      </div>

      {/* Timeline List */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
          {filteredActs.map((act, idx) => (
            <div key={act.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getIcon(act.type)}
              </div>

              <div style={{
                flex: 1,
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{act.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{act.date} • {act.time}</div>
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--accent-blue)', fontWeight: 600, marginTop: '2px' }}>
                  {act.customer_name}
                </div>

                {act.notes && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
                    {act.notes}
                  </p>
                )}

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Logged by <strong>{act.performed_by}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Activity Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Log Customer Activity</h3>
              <button onClick={() => setModalOpen(false)} className="btn-ghost btn-icon">✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Activity Type</label>
                <select className="input-control" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as ActivityType })}>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting / Demo</option>
                  <option value="Note">Internal Note</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Title / Subject *</label>
                <input required className="input-control" placeholder="e.g. Discovery call with CTO" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Customer / Company *</label>
                <input required className="input-control" placeholder="TechNova Solutions" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Notes</label>
                <textarea rows={3} className="input-control" placeholder="Key takeaways and next steps..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
