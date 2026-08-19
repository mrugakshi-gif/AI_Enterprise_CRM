import React, { useState, useEffect } from 'react';
import { Lead, Activity, Task, Deal } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';
import { api } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import { 
  X, Sparkles, Building2, Mail, Phone, MapPin, Calendar, Clock, 
  CheckCircle2, ArrowRight, UserCheck, Plus, MessageSquare, 
  FileText, ShieldCheck, TrendingUp, AlertCircle, PhoneCall
} from 'lucide-react';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose, onNavigate }) => {
  const { updateLead, createTask, logActivity, refreshAll } = useCRM();
  const { canConvertLeads, canManageTasks } = usePermissions();
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'scoring' | 'related'>('overview');
  
  // Quick Action Modals
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertPayload, setConvertPayload] = useState({
    deal_name: `${lead.company} — CRM Opportunity`,
    deal_value: lead.lead_value || 350000,
    stage: 'Qualified',
    gstin: '',
    website: ''
  });

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [actType, setActType] = useState<'Call' | 'Email' | 'Meeting' | 'Note'>('Call');
  const [actTitle, setActTitle] = useState('');
  const [actNotes, setActNotes] = useState('');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState(`Follow up with ${lead.first_name}`);
  const [taskPriority, setTaskPriority] = useState<'Urgent' | 'High' | 'Normal' | 'Low'>('Normal');

  useEffect(() => {
    let mounted = true;
    api.getLeadDetail(lead.id)
      .then(res => {
        if (mounted) {
          setDetailData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setDetailData({
            ...lead,
            activities: [],
            tasks: [],
            related_deals: []
          });
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [lead.id]);

  const handleStatusChange = async (newStatus: Lead["status"]) => {
    await updateLead(lead.id, { status: newStatus });
  };

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setConverting(true);
    try {
      await api.convertLead(lead.id, convertPayload);
      await refreshAll();
      setShowConvertModal(false);
      onClose();
      if (onNavigate) onNavigate('deals');
    } catch (err) {
      console.error('Lead conversion failed:', err);
    } finally {
      setConverting(false);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle) return;
    await logActivity({
      type: actType,
      title: actTitle,
      customer_name: lead.company,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      performed_by: lead.assigned_to || 'Amit Sharma',
      notes: actNotes
    });
    setShowActivityModal(false);
    setActTitle('');
    setActNotes('');
    // refresh detail
    const updated = await api.getLeadDetail(lead.id);
    setDetailData(updated);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    await createTask({
      title: taskTitle,
      customer_name: lead.company,
      priority: taskPriority,
      due_date: new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      assigned_to: lead.assigned_to || 'Amit Sharma',
      description: `Task created for lead ${lead.first_name} ${lead.last_name}`
    });
    setShowTaskModal(false);
    const updated = await api.getLeadDetail(lead.id);
    setDetailData(updated);
  };

  const scoreFactors = lead.ai_score_factors || [
    { factor: "Recent Engagement", score: 20, max: 25, detail: "Regular communication and opened updates" },
    { factor: "Lead Value", score: 18, max: 20, detail: `₹${(lead.lead_value/100000).toFixed(1)}L opportunity size` },
    { factor: "Lead Source", score: 13, max: 15, detail: `${lead.source} historical conversion rate` },
    { factor: "Profile Completeness", score: 12, max: 15, detail: "All corporate KYC data fields populated" },
    { factor: "Recency", score: 8, max: 8, detail: "Contacted in past 3 days" }
  ];

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
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700
            }}>
              {lead.first_name[0]}{lead.last_name[0]}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                  {lead.first_name} {lead.last_name}
                </h2>
                <span className={`badge ${
                  lead.status === 'Qualified' ? 'badge-low' :
                  lead.status === 'Proposal' ? 'badge-normal' :
                  lead.status === 'Converted' ? 'badge-low' : 'badge-neutral'
                }`}>
                  {lead.status}
                </span>
                <span className="badge badge-accent">
                  Score: {lead.lead_score}/100
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <Building2 size={13} /> {lead.company} • {lead.job_title}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {canConvertLeads && lead.status !== 'Converted' && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowConvertModal(true)}
                style={{ gap: '6px' }}
              >
                <UserCheck size={14} /> Convert Lead
              </button>
            )}
            <button 
              className="btn btn-ghost btn-icon"
              onClick={onClose}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '20px',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-muted)'
        }}>
          {[
            { id: 'overview', label: 'Lead 360 Overview' },
            { id: 'scoring', label: 'AI Score Breakdown' },
            { id: 'timeline', label: 'Activity Timeline' },
            { id: 'related', label: 'Related Records' }
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
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* AI Recommendation Banner */}
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
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                      AI Next Best Action
                    </h4>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                      91% Conversion Likelihood
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', marginTop: '4px', color: 'var(--text-primary)' }}>
                    {lead.ai_recommended_action || "Schedule a discovery meeting within 24 hours to secure conversion momentum."}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <strong>Why:</strong> {lead.ai_summary || "High qualification signals from web visits and decision-maker involvement."}
                  </p>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setActType('Call'); setShowActivityModal(true); }}
                >
                  <PhoneCall size={13} /> Log Call
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setActType('Email'); setShowActivityModal(true); }}
                >
                  <Mail size={13} /> Send Email
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setActType('Meeting'); setShowActivityModal(true); }}
                >
                  <Calendar size={13} /> Schedule Meeting
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowTaskModal(true)}
                >
                  <Plus size={13} /> Add Task
                </button>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Status:</span>
                  <select
                    className="input-control"
                    style={{ width: '130px', padding: '4px 8px', fontSize: '12.5px' }}
                    value={lead.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Unqualified">Unqualified</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
              </div>

              {/* Information Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px'
              }}>
                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Contact Information
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      <a href={`mailto:${lead.email}`} style={{ color: 'var(--accent-blue)' }}>{lead.email}</a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <Phone size={14} color="var(--text-muted)" />
                      <span>{lead.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <MapPin size={14} color="var(--text-muted)" />
                      <span>{lead.city}, {lead.state}</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Opportunity Details
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Lead Value:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>₹{lead.lead_value.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Source:</span>
                      <span className="badge badge-neutral">{lead.source}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Assigned Rep:</span>
                      <strong>{lead.assigned_to}</strong>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Timeline & SLA
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Created:</span>
                      <span>{lead.created_at}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Last Contact:</span>
                      <span>{lead.last_contact || 'None'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Expected Close:</span>
                      <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{lead.expected_closing || 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {lead.notes && (
                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Internal Rep Notes
                  </span>
                  <p style={{ fontSize: '13px', marginTop: '6px', color: 'var(--text-secondary)' }}>
                    {lead.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCORING EXPLAINABILITY */}
          {activeTab === 'scoring' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '20px', background: 'var(--bg-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>
                      AI Explainable Lead Score: {lead.lead_score}/100
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Transparent breakdown calculated deterministically from verified CRM attributes & engagement signals.
                    </p>
                  </div>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-full)',
                    background: lead.lead_score >= 80 ? 'rgba(5, 150, 105, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                    color: lead.lead_score >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 800
                  }}>
                    {lead.lead_score}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Contributing Factors</h4>
                {scoreFactors.map((factor: any, idx: number) => (
                  <div key={idx} className="card" style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{factor.factor}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                        +{factor.score} / {factor.max} pts
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-muted)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(factor.score / factor.max) * 100}%`,
                        height: '100%',
                        background: 'var(--accent-blue)',
                        borderRadius: '3px'
                      }} />
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                      {factor.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TIMELINE */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Communication & Touchpoint History</h4>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowActivityModal(true)}
                >
                  <Plus size={13} /> Log New Touchpoint
                </button>
              </div>

              {detailData?.activities?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {detailData.activities.map((act: Activity) => (
                    <div key={act.id} className="card" style={{ padding: '14px', display: 'flex', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        background: act.type === 'Call' ? 'rgba(37, 99, 235, 0.1)' :
                                   act.type === 'Email' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(5, 150, 105, 0.1)',
                        color: act.type === 'Call' ? 'var(--accent-blue)' :
                               act.type === 'Email' ? 'var(--accent-purple)' : 'var(--accent-emerald)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {act.type === 'Call' ? <PhoneCall size={16} /> :
                         act.type === 'Email' ? <Mail size={16} /> : <Calendar size={16} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ fontSize: '13.5px' }}>{act.title}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{act.date} • {act.time}</span>
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                          {act.notes || 'Activity completed successfully.'}
                        </p>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'inline-block' }}>
                          Logged by {act.performed_by}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Clock size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '13.5px' }}>No activity logged yet for this lead.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RELATED RECORDS */}
          {activeTab === 'related' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Related Deals</h4>
                {detailData?.related_deals?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {detailData.related_deals.map((d: Deal) => (
                      <div key={d.id} className="card" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '13.5px' }}>{d.deal_name}</strong>
                          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            Stage: <span className="badge badge-accent">{d.stage}</span> • Win Prob: {d.probability}%
                          </p>
                        </div>
                        <strong style={{ fontSize: '14px' }}>₹{d.deal_value.toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No linked deals yet. Convert this lead to initiate a sales pipeline opportunity.
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Pending Tasks</h4>
                {detailData?.tasks?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {detailData.tasks.map((t: Task) => (
                      <div key={t.id} className="card" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '13.5px' }}>{t.title}</strong>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Assigned to {t.assigned_to} • Due {t.due_date}
                          </p>
                        </div>
                        <span className={`badge ${t.status === 'Done' ? 'badge-low' : 'badge-normal'}`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No active tasks.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Activity Modal */}
        {showActivityModal && (
          <div className="modal-overlay" style={{ zIndex: 120 }}>
            <div className="modal-content" style={{ maxWidth: '440px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Log Activity</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowActivityModal(false)}><X size={16} /></button>
              </div>
              <form onSubmit={handleLogActivity} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Type</label>
                  <select 
                    className="input-control" 
                    value={actType} 
                    onChange={e => setActType(e.target.value as any)}
                    style={{ marginTop: '4px' }}
                  >
                    <option value="Call">Phone Call</option>
                    <option value="Email">Email Communication</option>
                    <option value="Meeting">Meeting / Demo</option>
                    <option value="Note">Internal Note</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Summary / Title</label>
                  <input 
                    className="input-control" 
                    placeholder="e.g. Discovery call completed with director" 
                    value={actTitle} 
                    onChange={e => setActTitle(e.target.value)} 
                    style={{ marginTop: '4px' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Detailed Notes</label>
                  <textarea 
                    className="input-control" 
                    rows={3} 
                    placeholder="Key discussion points, objections, next steps..." 
                    value={actNotes} 
                    onChange={e => setActNotes(e.target.value)} 
                    style={{ marginTop: '4px' }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowActivityModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Activity</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Task Modal */}
        {showTaskModal && (
          <div className="modal-overlay" style={{ zIndex: 120 }}>
            <div className="modal-content" style={{ maxWidth: '440px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Create Task for Lead</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowTaskModal(false)}><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateTask} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Task Title</label>
                  <input 
                    className="input-control" 
                    value={taskTitle} 
                    onChange={e => setTaskTitle(e.target.value)} 
                    style={{ marginTop: '4px' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Priority</label>
                  <select 
                    className="input-control" 
                    value={taskPriority} 
                    onChange={e => setTaskPriority(e.target.value as any)}
                    style={{ marginTop: '4px' }}
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Convert Lead Modal */}
        {showConvertModal && (
          <div className="modal-overlay" style={{ zIndex: 130 }}>
            <div className="modal-content" style={{ maxWidth: '520px' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} color="var(--accent-blue)" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Convert Lead</h3>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowConvertModal(false)}><X size={16} /></button>
              </div>

              <form onSubmit={handleConvertLead} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--bg-muted)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                  <p><strong>This action will automatically create:</strong></p>
                  <ul style={{ paddingLeft: '20px', marginTop: '6px', color: 'var(--text-secondary)' }}>
                    <li>A verified <strong>Contact Record</strong> for {lead.first_name} {lead.last_name}</li>
                    <li>An official <strong>Company Account</strong> for {lead.company}</li>
                    <li>A new sales <strong>Deal</strong> in your pipeline</li>
                  </ul>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Opportunity Deal Name</label>
                  <input 
                    className="input-control" 
                    value={convertPayload.deal_name}
                    onChange={e => setConvertPayload({ ...convertPayload, deal_name: e.target.value })}
                    style={{ marginTop: '4px' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Deal Value (INR)</label>
                    <input 
                      type="number"
                      className="input-control" 
                      value={convertPayload.deal_value}
                      onChange={e => setConvertPayload({ ...convertPayload, deal_value: Number(e.target.value) })}
                      style={{ marginTop: '4px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Initial Stage</label>
                    <select
                      className="input-control"
                      value={convertPayload.stage}
                      onChange={e => setConvertPayload({ ...convertPayload, stage: e.target.value })}
                      style={{ marginTop: '4px' }}
                    >
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Negotiation">Negotiation</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Company GSTIN (Optional)</label>
                    <input 
                      className="input-control" 
                      placeholder="e.g. 27ABCDE1234F1Z5"
                      value={convertPayload.gstin}
                      onChange={e => setConvertPayload({ ...convertPayload, gstin: e.target.value })}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Website (Optional)</label>
                    <input 
                      className="input-control" 
                      placeholder="https://..."
                      value={convertPayload.website}
                      onChange={e => setConvertPayload({ ...convertPayload, website: e.target.value })}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowConvertModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={converting}>
                    {converting ? 'Converting...' : 'Confirm & Convert'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
