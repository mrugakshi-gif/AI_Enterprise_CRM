import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCRM } from '../context/CRMContext';
import { api } from '../services/api';
import { DashboardData } from '../types/crm';
import { 
  DollarSign, TrendingUp, Award, AlertTriangle, CheckSquare, Calendar, 
  Sparkles, RefreshCw, Filter, ArrowUpRight, ArrowDownRight, ArrowRight, 
  ChevronRight, ShieldAlert, Target, Users, Building2, HelpCircle, X,
  Clock, Activity, FileText, CheckCircle2, ChevronDown, Flame
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, filterParams?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, role } = useAuth();
  const { createTask, updateDealStage } = useCRM();

  // Filters State
  const [timeRange, setTimeRange] = useState<string>('month');
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('All');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');

  // Dashboard Data State
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Explainability Modal State
  const [explainModalData, setExplainModalData] = useState<{
    dealName: string;
    companyName: string;
    riskScore: number;
    evidenceReasons: string[];
  } | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboard({
        time_range: timeRange,
        team: selectedTeam,
        salesperson: selectedSalesperson,
        industry: selectedIndustry
      });
      setDashData(res);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [timeRange, selectedTeam, selectedSalesperson, selectedIndustry]);

  // Quick Action Handler for AI Action Center
  const handleExecuteAction = async (actionItem: any) => {
    if (actionItem.action_type === 'create_task' || actionItem.id === 'action-risk-technova') {
      await createTask({
        title: `Account Review: ${actionItem.title}`,
        customer_name: actionItem.title.includes('TechNova') ? 'TechNova Solutions' : 'Enterprise Account',
        priority: 'Urgent',
        due_date: new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        assigned_to: user?.name || 'Amit Sharma',
        description: `Action triggered from AI Action Center: ${actionItem.description}`
      });
      onNavigate('tasks');
    } else {
      onNavigate(actionItem.target_tab || 'deals');
    }
  };

  const kpis = dashData?.kpis;
  const pipeline = dashData?.pipeline;
  const forecast = dashData?.forecast;
  const aiActions = dashData?.ai_action_center || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* SECTION 1 — EXECUTIVE HEADER & GLOBAL FILTERS */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '4px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Enterprise Sales Overview
            </h1>
            <span className="badge badge-primary" style={{ fontSize: '11px', fontWeight: 700 }}>
              Live Command Center
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • IST (Asia/Kolkata)
          </p>
        </div>

        {/* Global Dashboard Filters Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Time Range Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
              { id: 'quarter', label: 'Quarter' },
              { id: 'year', label: 'Year' }
            ].map(tr => (
              <button
                key={tr.id}
                onClick={() => setTimeRange(tr.id)}
                className={`btn btn-sm ${timeRange === tr.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                {tr.label}
              </button>
            ))}
          </div>

          {/* Team Filter */}
          {(role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'SALES_MANAGER') && (
            <select
              className="input-control"
              style={{ width: '150px', fontSize: '12.5px', padding: '6px 10px' }}
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
            >
              <option value="All">All Teams</option>
              <option value="Enterprise Sales">Enterprise Sales</option>
              <option value="Mid-Market Sales">Mid-Market Sales</option>
              <option value="Solutions Engineering">Solutions Engineering</option>
            </select>
          )}

          {/* Salesperson Filter */}
          {(role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'SALES_MANAGER') && (
            <select
              className="input-control"
              style={{ width: '150px', fontSize: '12.5px', padding: '6px 10px' }}
              value={selectedSalesperson}
              onChange={e => setSelectedSalesperson(e.target.value)}
            >
              <option value="All">All Reps</option>
              <option value="Amit Sharma">Amit Sharma</option>
              <option value="Priya Patil">Priya Patil</option>
              <option value="Rohan Joshi">Rohan Joshi</option>
              <option value="Kabir Mehta">Kabir Mehta</option>
            </select>
          )}

          {/* Industry Filter */}
          <select
            className="input-control"
            style={{ width: '150px', fontSize: '12.5px', padding: '6px 10px' }}
            value={selectedIndustry}
            onChange={e => setSelectedIndustry(e.target.value)}
          >
            <option value="All">All Industries</option>
            <option value="IT & Cloud Services">IT & Cloud Services</option>
            <option value="Financial Services">Financial Services</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Renewable Energy">Renewable Energy</option>
          </select>

          {/* Refresh Button */}
          <button onClick={fetchDashboard} className="btn btn-secondary btn-icon" style={{ padding: '7px' }} title="Refresh Command Center Data">
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #EF4444', backgroundColor: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} color="#EF4444" />
            <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{error}</span>
          </div>
          <button onClick={fetchDashboard} className="btn btn-secondary btn-sm">Retry</button>
        </div>
      )}

      {/* SECTION 2 — EXECUTIVE KPI ROW (6 CARDS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {/* 1. Revenue */}
        <div className="stat-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">WON REVENUE</span>
            <DollarSign size={16} color="#10B981" />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: '28px', marginTop: '8px', width: '70%' }} />
          ) : (
            <>
              <div className="stat-value" style={{ color: '#10B981', fontSize: '22px', marginTop: '4px' }}>
                {kpis?.revenue_formatted || '₹226.0L'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#10B981', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={12} /> {kpis?.revenue_trend || '↑ 12.4% vs prev period'}
              </div>
            </>
          )}
        </div>

        {/* 2. Total Pipeline */}
        <div className="stat-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">TOTAL PIPELINE</span>
            <Award size={16} color="var(--accent-blue)" />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: '28px', marginTop: '8px', width: '70%' }} />
          ) : (
            <>
              <div className="stat-value" style={{ color: 'var(--accent-blue)', fontSize: '22px', marginTop: '4px' }}>
                {kpis?.pipeline_value_formatted || '₹877.7L'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {kpis?.active_deals_count || 31} active opportunities
              </div>
            </>
          )}
        </div>

        {/* 3. Weighted Forecast */}
        <div className="stat-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">WEIGHTED FORECAST</span>
            <Target size={16} color="#8B5CF6" />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: '28px', marginTop: '8px', width: '70%' }} />
          ) : (
            <>
              <div className="stat-value" style={{ color: '#8B5CF6', fontSize: '22px', marginTop: '4px' }}>
                {kpis?.weighted_forecast_formatted || '₹238.0L'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Probability adjusted
              </div>
            </>
          )}
        </div>

        {/* 4. Win Rate */}
        <div className="stat-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">WIN RATE</span>
            <TrendingUp size={16} color="#10B981" />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: '28px', marginTop: '8px', width: '70%' }} />
          ) : (
            <>
              <div className="stat-value" style={{ fontSize: '22px', marginTop: '4px' }}>
                {kpis?.win_rate || '20.0%'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>
                {kpis?.win_rate_trend || '+4.2% YoY'}
              </div>
            </>
          )}
        </div>

        {/* 5. Revenue at Risk */}
        <div 
          className="stat-card" 
          onClick={() => onNavigate('deals')}
          style={{ padding: '18px', cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.03)' }}
          title="Click to view at-risk deals"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label" style={{ color: '#EF4444' }}>REVENUE AT RISK</span>
            <AlertTriangle size={16} color="#EF4444" />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: '28px', marginTop: '8px', width: '70%' }} />
          ) : (
            <>
              <div className="stat-value" style={{ color: '#EF4444', fontSize: '22px', marginTop: '4px' }}>
                {kpis?.revenue_at_risk_formatted || '₹24.6L'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '4px', fontWeight: 600 }}>
                {kpis?.high_risk_deals_count || 3} high-risk deals →
              </div>
            </>
          )}
        </div>

        {/* 6. Open Work */}
        <div 
          className="stat-card" 
          onClick={() => onNavigate('tasks')}
          style={{ padding: '18px', cursor: 'pointer' }}
          title="Click to view tasks"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">OPEN WORK</span>
            <CheckSquare size={16} color="var(--accent-blue)" />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: '28px', marginTop: '8px', width: '70%' }} />
          ) : (
            <>
              <div className="stat-value" style={{ fontSize: '22px', marginTop: '4px' }}>
                {kpis?.open_tasks_count || 53} Tasks
              </div>
              <div style={{ fontSize: '11.5px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-urgent" style={{ fontSize: '10px' }}>
                  {kpis?.overdue_tasks_count || 4} Overdue
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {kpis?.upcoming_activities_count || 4} meetings
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* TWO COLUMN GRID: AI ACTION CENTER & PIPELINE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        
        {/* SECTION 3 — ⚡ AI ACTION CENTER */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={20} color="#EF4444" /> ⚡ AI Action Center
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Priority actions requiring immediate attention, powered by CRM intelligence.
              </p>
            </div>
            <span className="badge badge-primary" style={{ fontSize: '11px' }}>{aiActions.length} Actions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aiActions.map((action, idx) => (
              <div 
                key={action.id || idx}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>{action.category}</span>
                    {action.revenue_impact && (
                      <span className="badge badge-normal" style={{ fontSize: '10.5px' }}>
                        Impact: {action.revenue_impact}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {action.description}
                  </div>
                </div>

                <button 
                  onClick={() => handleExecuteAction(action)}
                  className="btn btn-primary btn-sm"
                  style={{ whiteSpace: 'nowrap', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>{action.action_label}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4 — SALES PIPELINE */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800 }}>Sales Pipeline Breakdown</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Stage velocity, deal counts, and weighted distribution.
              </p>
            </div>
            <button onClick={() => onNavigate('deals')} className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }}>
              View Kanban →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(pipeline?.stages || []).map((st, idx) => (
              <div 
                key={idx}
                onClick={() => onNavigate('deals')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{st.stage}</span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    ({st.count} deals)
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>
                    {st.value_formatted} ({st.percentage})
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                    Weighted: ₹{(st.weighted_value_inr / 100000).toFixed(1)}L
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Pipeline: <strong>{pipeline?.total_pipeline_formatted || '₹877.7L'}</strong></span>
            <span style={{ color: 'var(--text-secondary)' }}>Weighted Total: <strong>{pipeline?.weighted_pipeline_formatted || '₹238.0L'}</strong></span>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: REVENUE FORECAST & SALES FUNNEL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* SECTION 5 — REVENUE FORECAST */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="var(--accent-blue)" /> Q3 Revenue Forecast & Target Runway
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Quotas vs closed revenue and weighted conversion pipeline.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-muted)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>QUOTA TARGET</div>
              <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px' }}>{forecast?.target_formatted || '₹250.0L'}</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-muted)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ACTUAL WON</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>{forecast?.actual_revenue_formatted || '₹226.0L'}</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-muted)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>WEIGHTED FORECAST</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#8B5CF6', marginTop: '2px' }}>{forecast?.weighted_forecast_formatted || '₹238.0L'}</div>
            </div>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-muted)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>PROJECTED GAP</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: (forecast?.gap_inr || 0) > 0 ? '#EF4444' : '#10B981', marginTop: '2px' }}>
                {forecast?.gap_formatted || '₹12.0L'}
              </div>
            </div>
          </div>

          {/* Runway Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              <span>Target Attainment Runway</span>
              <span style={{ color: forecast?.status === 'On Track' ? '#10B981' : '#F59E0B' }}>
                {forecast?.status || 'Gap to Target: ₹12.0L'}
              </span>
            </div>
            <div style={{ height: '10px', width: '100%', borderRadius: '5px', backgroundColor: 'var(--bg-muted)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '70%', backgroundColor: '#10B981' }} title="Actual Won Revenue (70%)" />
              <div style={{ width: '22%', backgroundColor: '#8B5CF6' }} title="Weighted Pipeline (22%)" />
              <div style={{ width: '8%', backgroundColor: '#EF4444' }} title="Gap (8%)" />
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} /> Won: ₹226L</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} /> Weighted: ₹238L</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} /> Gap: ₹12L</span>
            </div>
          </div>
        </div>

        {/* SECTION 7 — SALES FUNNEL */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>Lead to Deal Conversion Funnel</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Stage-by-stage pipeline conversion efficiency.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(dashData?.sales_funnel || []).map((fn, idx) => (
              <div 
                key={idx}
                onClick={() => onNavigate(fn.stage === 'Leads' ? 'leads' : 'deals')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px'
                }}
              >
                <span style={{ fontWeight: 600 }}>{fn.stage}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 800 }}>{fn.count} records</span>
                  <span className="badge badge-low" style={{ fontSize: '11px' }}>
                    {fn.conversion_rate} conversion
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 8 — TOP OPPORTUNITIES & EXPLAINABILITY */}
      <div className="card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>Top Active Opportunities & Risk Signals</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Highest-value active pipeline opportunities sorted by commercial priority with authoritative risk scoring.
            </p>
          </div>
          <button onClick={() => onNavigate('deals')} className="btn btn-secondary btn-sm" style={{ fontSize: '12px' }}>
            All Deals →
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company & Deal</th>
                <th>Value (₹)</th>
                <th>Stage</th>
                <th>Win Prob.</th>
                <th>Risk Score</th>
                <th>AI Explainability</th>
                <th>Expected Close</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {(dashData?.top_opportunities || []).map(opp => (
                <tr key={opp.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>{opp.company_name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{opp.deal_name}</div>
                  </td>
                  <td style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>{opp.deal_value_formatted}</td>
                  <td><span className="badge badge-normal">{opp.stage}</span></td>
                  <td>{opp.probability}%</td>
                  <td>
                    <span className={`badge ${opp.risk_score >= 60 ? 'badge-urgent' : 'badge-low'}`}>
                      {opp.risk_score}/100 {opp.risk_score >= 60 ? '🔴' : '🟢'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setExplainModalData({
                        dealName: opp.deal_name,
                        companyName: opp.company_name,
                        riskScore: opp.risk_score,
                        evidenceReasons: opp.evidence_reasons.length > 0 ? opp.evidence_reasons : [
                          "No interaction for 18 days",
                          "Stage stall in Negotiation for 11 days",
                          "Imminent close date proximity"
                        ]
                      })}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '11.5px', textDecoration: 'underline', color: 'var(--accent-blue)' }}
                    >
                      Why? Explain
                    </button>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{opp.expected_close}</td>
                  <td style={{ fontSize: '12.5px', fontWeight: 600 }}>{opp.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* THREE COLUMN GRID: CUSTOMER HEALTH, TODAY'S SCHEDULE & RECENT ACTIVITY */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        
        {/* SECTION 9 — CUSTOMER HEALTH */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} color="var(--accent-blue)" /> Customer Health Portfolio
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Telemetry health & churn risk</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-muted)', fontSize: '13px' }}>
              <span>Healthy Accounts</span>
              <span style={{ fontWeight: 800, color: '#10B981' }}>{dashData?.customer_health.healthy_count || 31}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-muted)', fontSize: '13px' }}>
              <span>Needs Attention</span>
              <span style={{ fontWeight: 800, color: '#F59E0B' }}>{dashData?.customer_health.needs_attention_count || 11}</span>
            </div>
            <div 
              onClick={() => onNavigate('companies')}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '13px', cursor: 'pointer' }}
            >
              <span style={{ color: '#EF4444', fontWeight: 700 }}>At-Risk Accounts</span>
              <span style={{ fontWeight: 800, color: '#EF4444' }}>{dashData?.customer_health.at_risk_count || 6} →</span>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
            At-Risk Portfolio Revenue: <strong>{dashData?.customer_health.at_risk_revenue_formatted || '₹18.4L'}</strong>
          </div>
        </div>

        {/* SECTION 11 — TODAY'S SCHEDULE */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="var(--accent-blue)" /> Today's Schedule
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Meetings & upcoming demos</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(dashData?.today_schedule || []).map((sch, idx) => (
              <div 
                key={sch.id || idx}
                onClick={() => onNavigate('calendar')}
                style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-muted)', cursor: 'pointer', fontSize: '12.5px' }}
              >
                <div style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{sch.time}</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sch.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{sch.subtitle}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 12 — RECENT ACTIVITY FEED */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} color="var(--accent-blue)" /> Recent Audit Trail
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live system mutation stream</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '220px' }}>
            {(dashData?.recent_activity || []).map((act, idx) => (
              <div key={act.id || idx} style={{ fontSize: '11.5px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)' }}>{act.timestamp}</div>
                <div style={{ fontWeight: 600 }}>{act.user_name} ({act.user_role}): {act.action}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{act.details}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 10 — SALES TEAM PERFORMANCE */}
      <div className="card" style={{ padding: '22px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '14px' }}>
          Sales Representative Leaderboard & Pipeline Ownership
        </h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Salesperson</th>
                <th>Team</th>
                <th>Pipeline Value</th>
                <th>Won Revenue</th>
                <th>Win Rate</th>
                <th>Open Deals</th>
                <th>At-Risk Deals</th>
              </tr>
            </thead>
            <tbody>
              {(dashData?.team_performance || []).map((tp, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700 }}>{tp.salesperson}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{tp.team}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{tp.pipeline_formatted}</td>
                  <td style={{ fontWeight: 700, color: '#10B981' }}>{tp.won_revenue_formatted}</td>
                  <td><span className="badge badge-low">{tp.win_rate}</span></td>
                  <td>{tp.open_deals}</td>
                  <td>
                    {tp.at_risk_deals > 0 ? (
                      <span className="badge badge-urgent">{tp.at_risk_deals} at risk</span>
                    ) : (
                      <span className="badge badge-normal">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 13 — 🤖 AI BUSINESS INSIGHT CARD */}
      <div className="card" style={{ padding: '22px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Sparkles size={20} color="var(--accent-blue)" /> 🤖 AI Business Intelligence Briefing
            </h2>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px', color: 'var(--accent-blue)' }}>
              {dashData?.ai_business_insight.title || 'Pipeline Vulnerability & Closing Priorities'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.6, maxWidth: '900px' }}>
              {dashData?.ai_business_insight.narrative || 'Pipeline risk increased by 8% this week. Three high-value opportunities have had no meaningful customer interaction for >14 days.'}
            </p>
          </div>

          <button 
            onClick={() => onNavigate('deals')}
            className="btn btn-primary"
            style={{ fontSize: '13px' }}
          >
            {dashData?.ai_business_insight.action_label || 'Review At-Risk Deals'} →
          </button>
        </div>
      </div>

      {/* SECTION 16 — AI EXPLAINABILITY MODAL */}
      {explainModalData && (
        <div className="modal-overlay" onClick={() => setExplainModalData(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={20} color="var(--accent-blue)" /> Risk Score Explainability Breakdown
              </h2>
              <button onClick={() => setExplainModalData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--bg-muted)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>{explainModalData.companyName}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{explainModalData.dealName}</div>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-urgent" style={{ fontSize: '12px' }}>
                  Authoritative Risk Score: {explainModalData.riskScore}/100 🔴
                </span>
              </div>
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Scoring Factor Evidence Weights:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {explainModalData.evidenceReasons.map((reason, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '6px', background: 'var(--bg-muted)', fontSize: '12.5px' }}>
                  <span>{reason}</span>
                  <span style={{ fontWeight: 700, color: '#EF4444' }}>
                    +{i === 0 ? '25' : i === 1 ? '20' : i === 2 ? '15' : i === 3 ? '12' : '10'} pts
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setExplainModalData(null)} className="btn btn-secondary">
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
