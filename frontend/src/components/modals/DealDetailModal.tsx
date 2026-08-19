import React, { useState, useEffect } from 'react';
import { Deal, Activity, Task, DealStage } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';
import { api } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import { 
  X, Sparkles, Building2, User, DollarSign, Calendar, Clock, 
  CheckCircle2, ArrowRight, AlertTriangle, Plus, Mail, MessageSquare, 
  ShieldCheck, TrendingUp, AlertCircle, FileText, Check
} from 'lucide-react';

interface DealDetailModalProps {
  deal: Deal;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({ deal, onClose, onNavigate }) => {
  const { updateDealStage, updateDeal, createTask, logActivity, refreshAll } = useCRM();
  const { canManageDeals } = usePermissions();
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workspace' | 'intelligence' | 'timeline' | 'tasks'>('workspace');

  // Quick Action States
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [generatingEmail, setGeneratingEmail] = useState(false);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState(`Closing Action: ${deal.deal_name}`);

  const stages: DealStage[] = ["Contacted", "Qualified", "Proposal Sent", "Negotiation", "Deal Closed"];

  useEffect(() => {
    let mounted = true;
    api.getDealDetail(deal.id)
      .then(res => {
        if (mounted) {
          setDetailData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setDetailData({
            ...deal,
            timeline: [],
            tasks: [],
            ai_intelligence: {
              win_probability: deal.probability || 50,
              risk_level: deal.probability < 50 ? 'High' : 'Low',
              risk_factors: deal.risk_factor ? [deal.risk_factor] : [],
              win_factors: deal.win_factors || [],
              next_best_action: deal.ai_recommendation || 'Continue engagement'
            }
          });
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [deal.id]);

  const handleStageClick = async (stage: DealStage) => {
    if (!canManageDeals) return;
    await updateDealStage(deal.id, stage);
    const updated = await api.getDealDetail(deal.id);
    setDetailData(updated);
  };

  const handleGenerateROI = async () => {
    setGeneratingEmail(true);
    try {
      const res = await api.generateEmail(deal.contact_name || 'Team', deal.company_name, 'ROI Proposition');
      setEmailSubject(res.subject);
      setEmailBody(res.body);
      setEmailModalOpen(true);
    } catch (e) {
      setEmailSubject(`Projected ROI & Terms — ${deal.deal_name}`);
      setEmailBody(`Dear ${deal.contact_name || 'Team'},\n\nRegarding our proposal for ${deal.deal_name} (₹${deal.deal_value.toLocaleString()}), we are ready to offer free implementation training.\n\nBest regards,\n${deal.owner}`);
      setEmailModalOpen(true);
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    await createTask({
      title: taskTitle,
      customer_name: deal.company_name,
      sub_title: deal.deal_name,
      priority: 'Urgent',
      due_date: new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      assigned_to: deal.owner,
      description: `Action item for deal ${deal.deal_name}`
    });
    setShowTaskModal(false);
    const updated = await api.getDealDetail(deal.id);
    setDetailData(updated);
  };

  const currentStageIndex = stages.indexOf(deal.stage);
  const intel = detailData?.ai_intelligence || {
    win_probability: deal.probability,
    risk_level: deal.probability < 50 ? 'High' : 'Low',
    risk_factors: deal.risk_factor ? [deal.risk_factor] : ["No major blockers identified"],
    win_factors: deal.win_factors || ["Decision maker engaged"],
    next_best_action: deal.ai_recommendation || "Send contract proposal"
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '960px', 
          width: '95vw', 
          maxHeight: '92vh', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Top Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                {deal.deal_name}
              </h2>
              <span className={`badge ${
                deal.stage === 'Deal Closed' ? 'badge-low' :
                deal.priority === 'Urgent' ? 'badge-urgent' : 'badge-normal'
              }`}>
                {deal.priority} Priority
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <Building2 size={13} /> {deal.company_name} • Contact: {deal.contact_name || 'Primary Sponsor'} • Owner: {deal.owner}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Opportunity Value</span>
              <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)' }}>
                ₹{deal.deal_value.toLocaleString()}
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stage Chevron Progress Bar */}
        <div style={{
          padding: '12px 24px',
          background: 'var(--bg-muted)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <button
                key={stage}
                onClick={() => handleStageClick(stage)}
                disabled={!canManageDeals}
                style={{
                  flex: 1,
                  minWidth: '130px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: isCurrent ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  background: isCurrent ? 'var(--accent-blue)' : (isCompleted ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-card)'),
                  color: isCurrent ? '#FFFFFF' : (isCompleted ? 'var(--accent-emerald)' : 'var(--text-secondary)'),
                  fontSize: '12.5px',
                  fontWeight: isCurrent ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: canManageDeals ? 'pointer' : 'default',
                  transition: 'all 0.15s'
                }}
              >
                {isCompleted && <Check size={13} />}
                {stage}
              </button>
            );
          })}
        </div>

        {/* Tab Header */}
        <div style={{
          display: 'flex',
          gap: '20px',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-card)'
        }}>
          {[
            { id: 'workspace', label: 'Deal Overview' },
            { id: 'intelligence', label: 'AI Intelligence & Risks' },
            { id: 'timeline', label: 'Deal Activity Timeline' },
            { id: 'tasks', label: 'Tasks & Milestones' }
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

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: WORKSPACE */}
          {activeTab === 'workspace' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Quick AI Action Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Sparkles size={20} color="var(--accent-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                      AI Deal Acceleration Recommendation
                    </h4>
                    <p style={{ fontSize: '13px', marginTop: '2px', color: 'var(--text-primary)' }}>
                      {deal.ai_recommendation || "Send custom proposal with enterprise SLA guarantee."}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleGenerateROI}
                    disabled={generatingEmail}
                  >
                    <Mail size={13} /> {generatingEmail ? 'Generating...' : 'Generate ROI Email'}
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowTaskModal(true)}
                  >
                    <Plus size={13} /> Add Task
                  </button>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Win Probability</span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: deal.probability >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: '4px' }}>
                    {deal.probability}%
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Based on stage and touchpoints</span>
                </div>

                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Expected Close Date</span>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>
                    {deal.expected_close_date}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Target Fiscal Q2</span>
                </div>

                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Stage Velocity</span>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>
                    {detailData?.days_in_stage || 5} Days in Stage
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--accent-emerald)' }}>On track (Avg: 8 days)</span>
                </div>
              </div>

              {/* Description */}
              <div className="card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Deal Scope & Requirements</span>
                <p style={{ fontSize: '13.5px', marginTop: '6px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {deal.description}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: AI INTELLIGENCE */}
          {activeTab === 'intelligence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                {/* Win Factors */}
                <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-emerald)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <TrendingUp size={16} color="var(--accent-emerald)" />
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Identified Win Factors</h4>
                  </div>
                  <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {(deal.win_factors && deal.win_factors.length > 0 ? deal.win_factors : [
                      "Executive sponsor actively attending demos",
                      "Budget approved in current quarter",
                      "GST and compliance capabilities verified"
                    ]).map((wf, idx) => (
                      <li key={idx}><strong>{wf}</strong></li>
                    ))}
                  </ul>
                </div>

                {/* Risk Factors */}
                <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-rose)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <AlertTriangle size={16} color="var(--accent-rose)" />
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Potential Deal Risks</h4>
                  </div>
                  <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {(detailData?.ai_intelligence?.risk_factors && detailData.ai_intelligence.risk_factors.length > 0 ? detailData.ai_intelligence.risk_factors : [
                      deal.risk_factor || "Pricing objection detected on implementation SLA",
                      "Competitor presence in RFP shortlist"
                    ]).map((rf: string, idx: number) => (
                      <li key={idx}><strong>{rf}</strong></li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Forecast Card */}
              <div className="card" style={{ padding: '18px', background: 'var(--bg-muted)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>Weighted Pipeline Contribution</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Nominal Value: ₹{deal.deal_value.toLocaleString()} × {deal.probability}% Win Probability
                  </span>
                  <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--accent-blue)' }}>
                    ₹{(deal.deal_value * deal.probability / 100).toLocaleString()} (Weighted)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TIMELINE */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Chronological Deal Engagements</h4>
              {detailData?.timeline?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {detailData.timeline.map((item: any, idx: number) => (
                    <div key={idx} className="card" style={{ padding: '14px', display: 'flex', gap: '12px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--accent-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Clock size={15} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ fontSize: '13px' }}>{item.title}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.date}</span>
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {item.notes || 'Activity completed.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No historical touchpoints logged for this deal.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TASKS */}
          {activeTab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Action Items & Follow-ups</h4>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowTaskModal(true)}>
                  <Plus size={13} /> Add Task
                </button>
              </div>

              {detailData?.tasks?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {detailData.tasks.map((t: Task) => (
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
                  ))}
                </div>
              ) : (
                <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No open tasks for this deal.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Email Modal */}
        {emailModalOpen && (
          <div className="modal-overlay" style={{ zIndex: 130 }}>
            <div className="modal-content" style={{ maxWidth: '560px' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--accent-blue)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>AI Generated Client Email</h3>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => setEmailModalOpen(false)}><X size={16} /></button>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Subject</label>
                  <input 
                    className="input-control" 
                    value={emailSubject} 
                    onChange={e => setEmailSubject(e.target.value)} 
                    style={{ marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Body</label>
                  <textarea 
                    className="input-control" 
                    rows={8}
                    value={emailBody} 
                    onChange={e => setEmailBody(e.target.value)} 
                    style={{ marginTop: '4px', fontFamily: 'monospace', fontSize: '12.5px' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button className="btn btn-secondary" onClick={() => setEmailModalOpen(false)}>Close</button>
                  <button className="btn btn-primary" onClick={() => {
                    logActivity({
                      type: 'Email',
                      title: `Sent Email: ${emailSubject}`,
                      customer_name: deal.company_name,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                      performed_by: deal.owner,
                      notes: emailBody
                    });
                    setEmailModalOpen(false);
                  }}>
                    Send & Log in CRM
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Modal */}
        {showTaskModal && (
          <div className="modal-overlay" style={{ zIndex: 130 }}>
            <div className="modal-content" style={{ maxWidth: '440px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Create Task for Deal</h3>
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
