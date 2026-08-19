import React, { useState, useEffect } from 'react';
import { Company, Deal, Contact, Task, Activity } from '../../types/crm';
import { useCRM } from '../../context/CRMContext';
import { api } from '../../services/api';
import { 
  X, Building2, User, Phone, Mail, MapPin, Calendar, 
  TrendingUp, AlertTriangle, ShieldCheck, Plus, Sparkles, CheckCircle2 
} from 'lucide-react';

interface CompanyDetailModalProps {
  company: Company;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ company, onClose, onNavigate }) => {
  const { createTask, logActivity } = useCRM();
  const [data360, setData360] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'deals' | 'activity'>('overview');

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
            activities: [],
            tasks: [],
            metrics: {
              pipeline_value: 0,
              won_value: company.total_revenue,
              open_deals: company.active_deals_count,
              total_contacts: company.contacts_count,
              open_tasks: 0
            },
            health_factors: [
              company.churn_risk === 'High' ? 'High churn risk detected' : 'Stable platform usage'
            ]
          });
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [company.id]);

  const metrics = data360?.metrics || {
    pipeline_value: 0,
    won_value: company.total_revenue,
    open_deals: company.active_deals_count,
    total_contacts: company.contacts_count,
    open_tasks: 0
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
                <MapPin size={13} /> {company.city}, {company.state} • GSTIN: {company.gstin || 'Unregistered'} • Industry: {company.industry}
              </p>
            </div>
          </div>

          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Headers */}
        <div style={{
          display: 'flex',
          gap: '20px',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-muted)'
        }}>
          {[
            { id: 'overview', label: 'Company 360 Overview' },
            { id: 'contacts', label: `Contacts (${data360?.contacts?.length || company.contacts_count})` },
            { id: 'deals', label: `Deals (${data360?.deals?.length || company.active_deals_count})` },
            { id: 'activity', label: 'Timeline & Health' }
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
                    AI Account Intelligence & Health
                  </h4>
                  <p style={{ fontSize: '13px', marginTop: '2px', color: 'var(--text-primary)' }}>
                    {company.ai_recommendation || "Maintain active quarterly relationship cadence."}
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
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Revenue</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
                    ₹{company.total_revenue.toLocaleString()}
                  </div>
                </div>

                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Customer Health</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: company.customer_health >= 75 ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: '4px' }}>
                    {company.customer_health}/100
                  </div>
                </div>

                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Deals</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
                    {metrics.open_deals}
                  </div>
                </div>

                <div className="card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Customer Since</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '6px' }}>
                    {company.customer_since}
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="card" style={{ padding: '16px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Corporate Details</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px', fontSize: '13px' }}>
                  <div><span style={{ color: 'var(--text-secondary)' }}>GSTIN:</span> <strong>{company.gstin || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>PAN:</span> <strong>{company.pan || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Website:</span> <a href={company.website || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)' }}>{company.website || 'N/A'}</a></div>
                  <div><span style={{ color: 'var(--text-secondary)' }}>Company Size:</span> <strong>{company.employees || '50-100'} Employees</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACTS */}
          {activeTab === 'contacts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data360?.contacts?.length > 0 ? (
                data360.contacts.map((con: Contact) => (
                  <div key={con.id} className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={con.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} alt={con.name} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)' }} />
                      <div>
                        <strong style={{ fontSize: '14px' }}>{con.name}</strong>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{con.designation} • {con.email}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{con.phone}</span>
                  </div>
                ))
              ) : (
                <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No contacts linked to this company yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEALS */}
          {activeTab === 'deals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data360?.deals?.length > 0 ? (
                data360.deals.map((d: Deal) => (
                  <div key={d.id} className="card" style={{ padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ fontSize: '14px' }}>{d.deal_name}</strong>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        Stage: <span className="badge badge-accent">{d.stage}</span> • Win Prob: {d.probability}% • Owner: {d.owner}
                      </p>
                    </div>
                    <strong style={{ fontSize: '15px' }}>₹{d.deal_value.toLocaleString()}</strong>
                  </div>
                ))
              ) : (
                <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No active or past deals for this company.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TIMELINE & HEALTH */}
          {activeTab === 'activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ padding: '16px', background: 'var(--bg-muted)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Health Indicators</h4>
                <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {(data360?.health_factors || ["Stable usage patterns", "No active escalation tickets"]).map((hf: string, i: number) => (
                    <li key={i}>{hf}</li>
                  ))}
                </ul>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Recent Activities</h4>
              {data360?.activities?.length > 0 ? (
                data360.activities.map((a: Activity) => (
                  <div key={a.id} className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ fontSize: '13px' }}>{a.type}: {a.title}</strong>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{a.notes}</p>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.date}</span>
                  </div>
                ))
              ) : (
                <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No activity records logged.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
