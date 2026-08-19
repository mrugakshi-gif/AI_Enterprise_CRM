import React, { useState, useEffect } from 'react';
import { Contact, Deal, Task, Activity } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';
import { api } from '../../services/api';
import { 
  X, User, Building2, Phone, Mail, MapPin, Calendar, 
  TrendingUp, Plus, Sparkles, CheckCircle2, Clock 
} from 'lucide-react';

interface ContactDetailModalProps {
  contact: Contact;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ contact, onClose, onNavigate }) => {
  const { createTask, logActivity } = useCRM();
  const [data360, setData360] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'activity' | 'tasks'>('overview');

  useEffect(() => {
    let mounted = true;
    api.getContact360(contact.id)
      .then(res => {
        if (mounted) {
          setData360(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setData360({
            ...contact,
            deals: [],
            activities: [],
            tasks: [],
            crm_metrics: {
              deal_value_formatted: '₹0.0 L',
              open_tasks: 0,
              total_activities: 0,
              active_deals: 0,
              engagement_score: 75,
              lead_score: 70
            }
          });
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [contact.id]);

  const metrics = data360?.crm_metrics || {
    deal_value_formatted: '₹0.0 L',
    open_tasks: 0,
    total_activities: 0,
    active_deals: 0,
    engagement_score: 75,
    lead_score: 70
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '920px', 
          width: '95vw', 
          maxHeight: '92vh', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src={contact.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
              alt={contact.name} 
              style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)' }} 
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                  {contact.name}
                </h2>
                <span className="badge badge-low">{contact.status}</span>
                <span className="badge badge-accent">Engagement: {metrics.engagement_score}%</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <Building2 size={13} /> {contact.designation} at <strong>{contact.company}</strong> • Owner: {contact.owner}
              </p>
            </div>
          </div>

          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '20px',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-muted)'
        }}>
          {[
            { id: 'overview', label: 'Contact 360' },
            { id: 'deals', label: `Associated Deals (${data360?.deals?.length || 0})` },
            { id: 'activity', label: `Activity History (${data360?.activities?.length || 0})` },
            { id: 'tasks', label: `Open Tasks (${data360?.tasks?.length || 0})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 0',
                border: 'none',
                background: 'none',
                fontSize: '13.5px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* AI Summary */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <Sparkles size={20} color="var(--accent-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                    AI Stakeholder Summary
                  </h4>
                  <p style={{ fontSize: '13px', marginTop: '2px', color: 'var(--text-primary)' }}>
                    {contact.ai_summary || "Key decision maker for account procurement and integration sign-off."}
                  </p>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '14px'
              }}>
                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Pipeline</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
                    {metrics.deal_value_formatted}
                  </div>
                </div>

                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Engagement Score</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
                    {metrics.engagement_score}%
                  </div>
                </div>

                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Associated Deals</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
                    {metrics.active_deals}
                  </div>
                </div>

                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Last Contacted</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '6px' }}>
                    {contact.last_contact}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Direct Contact Details</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px', fontSize: '13px' }}>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Email:</span> <a href={`mailto:${contact.email}`} style={{ color: 'var(--accent-blue)' }}>{contact.email}</a></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Phone:</span> <strong>{contact.phone}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Location:</span> <strong>{contact.city}, {contact.state}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Account Created:</span> <strong>{contact.created_at}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEALS */}
          {activeTab === 'deals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data360?.deals?.length > 0 ? (
                data360.deals.map((d: Deal) => (
                  <div key={d.id} className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ fontSize: '14px' }}>{d.deal_name}</strong>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        Stage: <span className="badge badge-accent">{d.stage}</span> • Win Prob: {d.probability}% • Close: {d.expected_close_date}
                      </p>
                    </div>
                    <strong style={{ fontSize: '15px' }}>₹{d.deal_value.toLocaleString()}</strong>
                  </div>
                ))
              ) : (
                <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No deals linked to this contact.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACTIVITIES */}
          {activeTab === 'activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data360?.activities?.length > 0 ? (
                data360.activities.map((a: Activity) => (
                  <div key={a.id} className="card" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ fontSize: '13.5px' }}>{a.type}: {a.title}</strong>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>{a.notes}</p>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Performed by {a.performed_by}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.date}</span>
                  </div>
                ))
              ) : (
                <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No activity history.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TASKS */}
          {activeTab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data360?.tasks?.length > 0 ? (
                data360.tasks.map((t: Task) => (
                  <div key={t.id} className="card" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '13.5px' }}>{t.title}</strong>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Due {t.due_date} • Assigned to {t.assigned_to}
                      </p>
                    </div>
                    <span className={`badge ${t.status === 'Done' ? 'badge-low' : 'badge-normal'}`}>
                      {t.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No open tasks for this contact.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
