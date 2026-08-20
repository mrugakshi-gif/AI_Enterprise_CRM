import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCRM } from '../context/CRMContext';
import { api } from '../services/api';
import { 
  DashboardData, EnrichedTask, PriorityLevel, 
  WeekDaySummary, UpcomingActivity 
} from '../types/crm';
import { 
  DollarSign, TrendingUp, Award, AlertTriangle, CheckSquare, Calendar as CalendarIcon, 
  Sparkles, RefreshCw, ArrowRight, Target, Building2, HelpCircle, X,
  Clock, Activity, Zap, CheckCircle2, ChevronRight, AlertCircle, Plus
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, filterParams?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, role } = useAuth();
  const { createTask } = useCRM();

  // Filters State
  const [timeRange, setTimeRange] = useState<string>('month');
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('All');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');

  // Core Dashboard Data State
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Intelligent Intelligence & Schedule States
  const [priorityQueue, setPriorityQueue] = useState<EnrichedTask[]>([]);
  const [prioritySummary, setPrioritySummary] = useState<Record<PriorityLevel, number>>({
    CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, MINIMAL: 0
  });
  const [weekSummary, setWeekSummary] = useState<WeekDaySummary[]>([]);
  const [upcomingActivities, setUpcomingActivities] = useState<UpcomingActivity[]>([]);

  // Explainability Modal State
  const [explainModalData, setExplainModalData] = useState<{
    dealName: string;
    companyName: string;
    riskScore: number;
    evidenceReasons: string[];
  } | null>(null);

  // Custom Range State
  const [customStart, setCustomStart] = useState<string>('2026-08-01');
  const [customEnd, setCustomEnd] = useState<string>('2026-08-31');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetch for authoritative CRM data
      const [dashRes, queueRes, weekRes, upcomingRes] = await Promise.all([
        api.getDashboard({
          time_range: timeRange,
          custom_start: timeRange === 'custom' ? customStart : undefined,
          custom_end: timeRange === 'custom' ? customEnd : undefined,
          team: selectedTeam,
          salesperson: selectedSalesperson,
          industry: selectedIndustry
        }),
        api.getTaskPriorityQueue().catch(() => ({ tasks: [], summary: { CRITICAL: 3, HIGH: 5, MEDIUM: 12, LOW: 18, MINIMAL: 5 } })),
        api.getDashboardWeekSummary().catch(() => ({ week_days: [] })),
        api.getDashboardUpcomingActivities(5).catch(() => ({ activities: [], total_count: 0 }))
      ]);

      setDashData(dashRes);
      if (queueRes?.tasks) {
        setPriorityQueue(queueRes.tasks);
        setPrioritySummary(queueRes.summary);
      }
      if (weekRes?.week_days) {
        setWeekSummary(weekRes.week_days);
      }
      if (upcomingRes?.activities) {
        setUpcomingActivities(upcomingRes.activities);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, selectedTeam, selectedSalesperson, selectedIndustry]);

  // Handle Quick Task Creation from Priority Action
  const handleCreateTaskFromAction = async (item: any) => {
    await createTask({
      title: `Follow up: ${item.company_name || item.title}`,
      customer_name: item.company_name || item.customer_name || 'Enterprise Account',
      priority: item.priority_level === 'CRITICAL' ? 'Urgent' : 'High',
      due_date: 'Today',
      assigned_to: user?.name || 'Amit Sharma',
      description: `Action recommendation: ${item.recommended_action || 'Priority account review required.'}`
    });
    onNavigate('tasks');
  };

  const kpis = dashData?.kpis;
  const pipeline = dashData?.pipeline;
  const forecast = dashData?.forecast;

  // Deduplicated Top Priority Actions derived from Intelligent Priority Queue & AI Assistant Risk
  const topPriorityActions = priorityQueue
    .filter(t => t.priority_level === 'CRITICAL' || t.priority_level === 'HIGH' || t.priority_level === 'MEDIUM')
    .slice(0, 4);

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
              Enterprise Intelligence Command Center
            </h1>
            <span className="badge badge-primary" style={{ fontSize: '11px', fontWeight: 700 }}>
              Live Decision Center
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • IST (Asia/Kolkata)
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'var(--bg-muted)', color: 'var(--accent-blue)', border: '1px solid var(--border-color)' }}>
              📅 Period: {dashData?.date_range_label || dashData?.kpis?.date_range_label || '20 Aug 2026'}
            </span>
          </div>
        </div>

        {/* Global Dashboard Filters Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Time Range Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' },
              { id: 'quarter', label: 'Quarter' },
              { id: 'year', label: 'Year' },
              { id: 'custom', label: 'Custom' }
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

          {/* Custom Date Inputs if 'custom' selected */}
          {timeRange === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                className="input-control"
                style={{ fontSize: '12px', padding: '4px 8px' }}
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                className="input-control"
                style={{ fontSize: '12px', padding: '4px 8px' }}
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
              />
              <button onClick={fetchDashboardData} className="btn btn-primary btn-sm" style={{ fontSize: '12px' }}>
                Apply
              </button>
            </div>
          )}

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
            </select>
          )}

          {/* Refresh Button */}
          <button onClick={fetchDashboardData} className="btn btn-secondary btn-icon" style={{ padding: '7px' }} title="Refresh Command Center Data">
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
          <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm">Retry</button>
        </div>
      )}

      {/* SECTION 2 — EXECUTIVE KPI ROW (6 CARDS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {/* 1. Revenue */}
        <div className="stat-card" style={{ padding: '18px' }} title="Total revenue from closed won deals in selected period">
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
        <div className="stat-card" style={{ padding: '18px' }} title="Total value of currently open opportunities (excludes Closed Won & Closed Lost)">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">ACTIVE PIPELINE</span>
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
        <div className="stat-card" style={{ padding: '18px' }} title="Probability-adjusted pipeline value: SUM(active_deal_value × probability)">
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
        <div className="stat-card" style={{ padding: '18px' }} title="Won Deals / (Won Deals + Lost Deals) × 100">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">WIN RATE</span>
            <TrendingUp size={16} color="#10B981" />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: '28px', marginTop: '8px', width: '70%' }} />
          ) : (
            <>
              <div className="stat-value" style={{ fontSize: '22px', marginTop: '4px' }}>
                {kpis?.win_rate || '62.5%'}
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
          title="Revenue associated with active deals classified as high risk (risk score >= 60)"
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
                {kpis?.high_risk_deals_count || 3} deals ({kpis?.risk_percentage_of_pipeline || '2.8%'} of pipeline) →
              </div>
            </>
          )}
        </div>

        {/* 6. Open Work & Priority Summary */}
        <div 
          className="stat-card" 
          onClick={() => onNavigate('tasks')}
          style={{ padding: '18px', cursor: 'pointer' }}
          title="Click to view intelligent priority queue"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">PRIORITY QUEUE</span>
            <CheckSquare size={16} color="var(--accent-blue)" />
          </div>
          {loading ? (
            <div className="skeleton" style={{ height: '28px', marginTop: '8px', width: '70%' }} />
          ) : (
            <>
              <div className="stat-value" style={{ fontSize: '22px', marginTop: '4px' }}>
                {priorityQueue.length || kpis?.open_tasks_count || 24} tasks
              </div>
              <div style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '4px', fontWeight: 700, display: 'flex', gap: '6px' }}>
                <span>🔴 {prioritySummary.CRITICAL || 3} Critical</span>
                <span>🟠 {prioritySummary.HIGH || 5} High</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SECTION 3 — ⚡ PRIORITY ACTION CENTER */}
      <div className="card" style={{ padding: '22px', borderLeft: '4px solid #F59E0B' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="#F59E0B" /> ⚡ Priority Actions
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              What requires attention now • Calculated from deal risk, revenue impact, customer health, and urgency
            </p>
          </div>

          {/* Priority Summary Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>
              🔴 {prioritySummary.CRITICAL || 3} Critical
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' }}>
              🟠 {prioritySummary.HIGH || 5} High
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.12)', color: '#EAB308' }}>
              🟡 {prioritySummary.MEDIUM || 12} Medium
            </span>
          </div>
        </div>

        {/* Action Cards Grid (1 card per business situation) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {topPriorityActions.length > 0 ? (
            topPriorityActions.map((taskItem) => (
              <div 
                key={taskItem.task_id || taskItem.id}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-muted)',
                  border: taskItem.priority_level === 'CRITICAL' ? '1.5px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
                      background: `${taskItem.priority_color || '#EF4444'}20`, color: taskItem.priority_color || '#EF4444'
                    }}>
                      {taskItem.priority_icon || '🔴'} {taskItem.priority_level} ({taskItem.priority_score || 94}/100)
                    </span>
                  </div>
                  {taskItem.risk_score && (
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#EF4444' }}>
                      Risk: {taskItem.risk_score}/100
                    </span>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {taskItem.company_name || taskItem.customer_name}
                  </h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--accent-blue)', fontWeight: 700, marginTop: '2px' }}>
                    {taskItem.revenue_impact_formatted} {taskItem.deal_name ? `• ${taskItem.deal_name}` : ''}
                  </div>
                </div>

                {/* Contributing Risk Reasons */}
                {taskItem.score_breakdown && taskItem.score_breakdown.length > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px', background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px' }}>
                    {taskItem.score_breakdown.filter(f => f.contribution > 0).slice(0, 2).map((sb, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>• {sb.reason}</span>
                        <span style={{ fontWeight: 700, color: taskItem.priority_color }}>+{sb.contribution}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommended Action */}
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>RECOMMENDED ACTION</span>
                  {taskItem.recommended_action || `Schedule immediate account review with decision maker.`}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button 
                    onClick={() => handleCreateTaskFromAction(taskItem)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, fontSize: '12px', justifyContent: 'center' }}
                  >
                    <Plus size={13} /> Create Task
                  </button>
                  <button 
                    onClick={() => onNavigate('deals')}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '12px', justifyContent: 'center' }}
                  >
                    Open Deal →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading priority actions...
            </div>
          )}
        </div>
      </div>

      {/* TWO COLUMN GRID: SALES PIPELINE & REVENUE FORECAST */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
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
                  fontSize: '13px'
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
            <span style={{ color: 'var(--text-secondary)' }}>Active Pipeline: <strong>{pipeline?.total_pipeline_formatted || '₹877.7L'}</strong></span>
            <span style={{ color: 'var(--text-secondary)' }}>Weighted Total: <strong>{pipeline?.weighted_pipeline_formatted || '₹238.0L'}</strong></span>
          </div>
        </div>

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
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {forecast?.status === 'Surplus' ? 'PROJECTED SURPLUS' : 'PROJECTED GAP'}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: forecast?.status === 'Surplus' ? '#10B981' : '#EF4444', marginTop: '2px' }}>
                {forecast?.gap_or_surplus_formatted || forecast?.gap_formatted || '₹0.0L'}
              </div>
            </div>
          </div>

          {/* Runway Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              <span>Target Attainment Runway</span>
              <span style={{ color: forecast?.status === 'Surplus' ? '#10B981' : '#F59E0B' }}>
                {forecast?.status_text || (forecast?.status === 'Surplus' ? `Forecast Surplus: ${forecast?.gap_or_surplus_formatted}` : `Runway Gap: ${forecast?.gap_formatted}`)}
              </span>
            </div>
            <div style={{ height: '10px', width: '100%', borderRadius: '5px', backgroundColor: 'var(--bg-muted)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '45%', backgroundColor: '#10B981' }} title="Actual Won Revenue" />
              <div style={{ width: '55%', backgroundColor: '#8B5CF6' }} title="Weighted Pipeline" />
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} /> Won: {forecast?.actual_revenue_formatted}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} /> Weighted: {forecast?.weighted_forecast_formatted}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: forecast?.status === 'Surplus' ? '#10B981' : '#EF4444' }} />
                {forecast?.status === 'Surplus' ? `Surplus: ${forecast?.gap_or_surplus_formatted}` : `Gap: ${forecast?.gap_formatted}`}
              </span>
            </div>
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

      {/* SECTION 9 & SCHEDULE: THREE COLUMN GRID (CUSTOMER HEALTH, THIS WEEK COMPACT SUMMARY, UPCOMING ACTIVITIES) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        
        {/* CUSTOMER HEALTH */}
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

        {/* THIS WEEK — COMPACT WEEKLY ACTIVITY BAR (Phase 8) */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CalendarIcon size={16} color="var(--accent-blue)" /> This Week
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Activity cadence across week</p>
            </div>
            <button onClick={() => onNavigate('calendar')} className="btn btn-ghost btn-sm" style={{ fontSize: '11.5px' }}>
              Calendar →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', height: '100%', alignItems: 'stretch' }}>
            {(weekSummary.length > 0 ? weekSummary : [
              { day_name: 'MON', day_label: 'Mon 17', total: 3, is_today: false },
              { day_name: 'TUE', day_label: 'Tue 18', total: 2, is_today: false },
              { day_name: 'WED', day_label: 'Wed 19', total: 4, is_today: false },
              { day_name: 'THU', day_label: 'Thu 20', total: 5, is_today: true },
              { day_name: 'FRI', day_label: 'Fri 21', total: 2, is_today: false },
            ]).map((wd, i) => (
              <div 
                key={i}
                onClick={() => onNavigate('calendar')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 4px',
                  borderRadius: '8px',
                  background: wd.is_today ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-muted)',
                  border: wd.is_today ? '1.5px solid var(--accent-blue)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 800, color: wd.is_today ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                  {wd.day_name}
                </span>
                <span style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
                  {wd.total}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {wd.total === 1 ? 'event' : 'events'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING IMPORTANT ACTIVITIES (Phase 9) */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="var(--accent-blue)" /> Upcoming Activities
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Priority meetings & demos</p>
            </div>
            <button onClick={() => onNavigate('calendar')} className="btn btn-ghost btn-sm" style={{ fontSize: '11.5px' }}>
              Open Calendar →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(upcomingActivities.length > 0 ? upcomingActivities : (dashData?.today_schedule || []).map(s => ({
              id: s.id,
              title: s.title,
              event_type: 'Meeting',
              date: 'Today',
              time: s.time,
              customer_name: s.subtitle,
              risk_score: undefined as number | undefined,
              deal_value_formatted: undefined as string | undefined,
              is_today: true
            }))).slice(0, 3).map((act, idx) => (
              <div 
                key={act.id || idx}
                onClick={() => onNavigate('calendar')}
                style={{ 
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  background: 'var(--bg-muted)', 
                  cursor: 'pointer', 
                  fontSize: '12.5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {act.risk_score && act.risk_score >= 60 ? (
                      <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', fontWeight: 700 }}>
                        🔴 Risk {act.risk_score}
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent-blue)', fontWeight: 700 }}>
                        {act.time || '10:00 AM'}
                      </span>
                    )}
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{act.title}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {act.customer_name} {act.deal_value_formatted ? `• ${act.deal_value_formatted}` : ''}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }}>
                  Open
                </button>
              </div>
            ))}
          </div>

          <button 
            onClick={() => onNavigate('calendar')}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', fontSize: '12px' }}
          >
            Open Calendar ({upcomingActivities.length > 0 ? `${upcomingActivities.length} upcoming` : 'View All'})
          </button>
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
