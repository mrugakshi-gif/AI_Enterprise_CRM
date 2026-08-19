import React, { useState, useEffect } from 'react';
import { Company, Deal, Contact, Task, Activity } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { 
  X, Building2, User, Phone, Mail, MapPin, Calendar, 
  TrendingUp, AlertTriangle, ShieldCheck, Plus, Sparkles, CheckCircle2,
  Clock, FileText, CheckSquare, MessageSquare, PhoneCall, Video, ArrowRight
} from 'lucide-react';

interface CompanyDetailModalProps {
  company: Company;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ company, onClose, onNavigate }) => {
  const { createTask, logActivity, createEvent } = useCRM();
  const { addToast } = useToast();
  const [data360, setData360] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'deals' | 'timeline' | 'tasks'>('overview');

  // Quick Action State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<any>('Normal');

  useEffect(() => {
    let mounted = true;
    api.getCompany360(company.id)
      .then(res => {
        if (mounted) {
          setData360(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setData360({
            ...company,
            contacts: [],
            deals: [],
            leads: [],
            activities: [],
            tasks: [],
            timeline: [],
            metrics: {
              pipeline_value: 0,
              won_value: company.total_revenue,
              open_deals: company.active_deals_count,
              total_contacts: company.contacts_count,
              open_tasks: 0
            },
            health_factors: [
              company.churn_risk === 'High' ? 'High churn risk detected' : 'Consistent platform engagement'
            ]
          });
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [company.id]);

  const handleCreateQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await createTask({
        title: newTaskTitle,
        customer_name: company.name,
        company_id: company.id,
        status: 'In progress',
        priority: newTaskPriority,
        due_date: '25 Aug 2026',
        assigned_to: company.account_owner || 'Amit Sharma',
        description: `Task created from Customer 360 view for ${company.name}`
      });
      addToast('Task created successfully in database!', 'success');
      setNewTaskTitle('');
      setShowTaskForm(false);
      // Refresh 360 data
      const refreshed = await api.getCompany360(company.id);
      setData360(refreshed);
    } catch (err: any) {
      addToast(err?.message || 'Failed to create task', 'error');
    }
  };

  const metrics = data360?.metrics || {
    pipeline_value: 0,
    won_value: company.total_revenue,
    open_deals: company.active_deals_count,
    total_contacts: company.contacts_count,
    open_tasks: 0
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'Meeting':
        return <Video size={14} color="#8B5CF6" />;
      case 'Call':
        return <PhoneCall size={14} color="#10B981" />;
      case 'Email':
        return <Mail size={14} color="#3B82F6" />;
      case 'Deal':
        return <TrendingUp size={14} color="#F59E0B" />;
      case 'Stage Change':
        return <Sparkles size={14} color="#EC4899" />;
      case 'Task':
        return <CheckSquare size={14} color="#059669" />;
      default:
        return <MessageSquare size={14} color="#6B7280" />;
    }
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
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
                  {company.name}
                </h2>
                <span className={`badge ${
                  company.customer_status === 'Customer' ? 'badge-low' : 'badge-neutral'
                }`}>
                  {company.customer_status}
                </span>
                <span className={`badge ${
                  company.churn_risk === 'High' ? 'badge-urgent' :
                  company.churn_risk === 'Medium' ? 'badge-normal' : 'badge-low'
                }`}>
                  {company.churn_risk} Churn Risk
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <MapPin size={13} /> {company.city}, {company.state} • GSTIN: {company.gstin || 'Unregistered'} • Industry: {company.industry} • Owner: {company.account_owner || 'Amit Sharma'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowTaskForm(!showTaskForm)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Plus size={14} /> Quick Task
            </button>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Task Form inline dropdown */}
        {showTaskForm && (
          <form onSubmit={handleCreateQuickTask} style={{
            background: 'var(--bg-muted)',
            padding: '12px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder={`Add an action task for ${company.name}...`}
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              style={{ flex: 1, height: '36px', fontSize: '13px' }}
              autoFocus
            />
            <select 
              className="form-control" 
              value={newTaskPriority} 
              onChange={e => setNewTaskPriority(e.target.value)}
              style={{ width: '110px', height: '36px', fontSize: '13px' }}
            >
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
            <button type="submit" className="btn btn-primary btn-sm">Add Task</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowTaskForm(false)}>Cancel</button>
          </form>
        )}

        {/* Tab Headers */}
        <div style={{
          display: 'flex',
          gap: '20px',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-muted)'
        }}>
          {[
            { id: 'overview', label: 'Customer 360 Overview' },
            { id: 'contacts', label: `Contacts (${data360?.contacts?.length || company.contacts_count})` },
            { id: 'deals', label: `Deals (${data360?.deals?.length || company.active_deals_count})` },
            { id: 'timeline', label: `Chronological Timeline (${data360?.timeline?.length || data360?.activities?.length || 0})` },
            { id: 'tasks', label: `Tasks (${data360?.tasks?.length || 0})` }
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

        {/* Tab Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* AI Recommendation */}
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
                    AI Account Strategy & Next Action
                  </h4>
                  <p style={{ fontSize: '13px', marginTop: '4px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {company.ai_recommendation || "Initiate scheduled quarterly touchpoint to maintain high satisfaction telemetry."}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                <div className="stat-card" style={{ padding: '14px' }}>
                  <span className="stat-label">Pipeline Value</span>
                  <div className="stat-value" style={{ fontSize: '18px', color: 'var(--accent-blue)' }}>
                    ₹{(metrics.pipeline_value / 100000).toFixed(1)} L
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{metrics.open_deals} active deal(s)</span>
                </div>
                <div className="stat-card" style={{ padding: '14px' }}>
                  <span className="stat-label">Won / Total Revenue</span>
                  <div className="stat-value" style={{ fontSize: '18px', color: '#10B981' }}>
                    ₹{(company.total_revenue / 100000).toFixed(1)} L
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Lifetime collections</span>
                </div>
                <div className="stat-card" style={{ padding: '14px' }}>
                  <span className="stat-label">Customer Health Score</span>
                  <div className="stat-value" style={{ fontSize: '18px', color: company.customer_health >= 80 ? '#10B981' : company.customer_health >= 60 ? '#F59E0B' : '#EF4444' }}>
                    {company.customer_health}/100
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{company.churn_probability}% churn probability</span>
                </div>
                <div className="stat-card" style={{ padding: '14px' }}>
                  <span className="stat-label">Key Stakeholders</span>
                  <div className="stat-value" style={{ fontSize: '18px' }}>
                    {data360?.contacts?.length || company.contacts_count}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Decision makers</span>
                </div>
              </div>

              {/* Account Details & Health Factors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Profile Card */}
                <div className="card" style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                    Company Profile & Compliance
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>GSTIN (Verified):</span>
                      <span style={{ fontWeight: 600 }}>{company.gstin}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>PAN Number:</span>
                      <span style={{ fontWeight: 600 }}>{company.pan}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Organization Size:</span>
                      <span style={{ fontWeight: 500 }}>{company.employees || '50-200'} employees</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Website:</span>
                      <a href={company.website || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
                        {company.website || 'N/A'}
                      </a>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Customer Since:</span>
                      <span>{company.customer_since || '12 Jan 2025'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Account Owner:</span>
                      <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{company.account_owner || 'Amit Sharma'}</span>
                    </div>
                  </div>
                </div>

                {/* Health Breakdown */}
                <div className="card" style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="var(--accent-blue)" /> Health Score Signals & Factors
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(data360?.health_factors || []).map((factor: string, idx: number) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12.5px',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: factor.includes('(-') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                        color: factor.includes('(-') ? '#EF4444' : '#059669'
                      }}>
                        {factor.includes('(-') ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACTS */}
          {activeTab === 'contacts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Decision Makers & Key Contacts at {company.name}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {(data360?.contacts || []).map((con: Contact) => (
                  <div key={con.id} className="card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar avatar-sm" style={{ background: 'var(--accent-blue)', color: '#fff', fontWeight: 600 }}>
                        {con.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{con.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{con.designation}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} /> {con.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={12} /> {con.phone}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DEALS */}
          {activeTab === 'deals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(data360?.deals || []).map((deal: Deal) => (
                <div key={deal.id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600 }}>{deal.deal_name}</span>
                      <span className="badge badge-normal">{deal.stage}</span>
                      {deal.risk_score && deal.risk_score >= 65 && (
                        <span className="badge badge-urgent">Risk: {deal.risk_score}/100</span>
                      )}
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Owner: {deal.owner} • Close Date: {deal.expected_close_date} • Probability: {deal.probability}%
                    </p>
                    {deal.ai_recommendation && (
                      <p style={{ fontSize: '12px', color: 'var(--accent-blue)', marginTop: '6px', fontStyle: 'italic' }}>
                        AI: {deal.ai_recommendation}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                      ₹{(deal.deal_value / 100000).toFixed(1)} L
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Priority: {deal.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: CHRONOLOGICAL TIMELINE */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Unified Event Stream (Deals Created, Stage Changes, Meetings, Calls, Notes, Tasks)
              </div>
              <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(data360?.timeline || data360?.activities || []).map((item: any, idx: number) => (
                  <div key={item.id || idx} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-32px',
                      top: '2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'var(--bg-card)',
                      border: '2px solid var(--accent-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getTimelineIcon(item.type)}
                    </div>
                    <div className="card" style={{ padding: '12px 16px', background: 'var(--bg-card)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{item.title}</span>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{item.date} • {item.time || '12:00 PM'}</span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        {item.notes || item.description || "Activity recorded in CRM."}
                      </p>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                        Logged by: <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.actor || item.performed_by || 'User'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TASKS */}
          {activeTab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(data360?.tasks || []).map((task: Task) => (
                <div key={task.id} className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckSquare size={16} color={task.status === 'Done' ? '#10B981' : 'var(--accent-blue)'} />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{task.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Due: {task.due_date} • Assigned to: {task.assigned_to}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${task.priority === 'Urgent' ? 'badge-urgent' : 'badge-normal'}`}>
                      {task.priority}
                    </span>
                    <span className="badge badge-neutral">{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
