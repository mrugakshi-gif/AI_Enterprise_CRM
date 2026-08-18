import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCRM } from '../context/CRMContext';
import { 
  Users, TrendingUp, DollarSign, Award, ArrowUpRight, ArrowDownRight, 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Clock, Plus, Calendar, KanbanSquare
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { dashboard, leads, deals, tasks, activities, createTask } = useCRM();
  const [dismissedInsights, setDismissedInsights] = React.useState<string[]>([]);

  const kpis = dashboard?.kpis || {
    total_customers: 1284,
    total_customers_trend: "+12.4%",
    active_leads: leads.length || 246,
    active_leads_trend: "+8.2%",
    pipeline_value_inr: 4280000,
    pipeline_value_formatted: "₹42.8 L",
    pipeline_trend: "+15.7%",
    won_revenue_inr: 1860000,
    won_revenue_formatted: "₹18.6 L",
    won_revenue_trend: "+11.3%",
    success_rate: 68,
    tasks_in_progress: 53
  };

  const aiInsights = (dashboard?.ai_insights || []).filter(ins => !dismissedInsights.includes(ins.id));

  const handleAction = async (ins: any) => {
    if (ins.action_type === 'create_task') {
      await createTask({
        title: `AI Action: ${ins.title}`,
        customer_name: ins.description.includes('TechNova') ? 'TechNova Solutions' : 'Enterprise Account',
        priority: 'Urgent',
        due_date: '18 Aug 2026',
        assigned_to: user?.name || 'Amit Sharma'
      });
      onNavigate('tasks');
    } else if (ins.action_type === 'generate_email' || ins.deal_id) {
      onNavigate('deals');
    } else if (ins.company_id) {
      onNavigate('companies');
    } else {
      onNavigate('leads');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Greeting & IST Date */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Good morning, {user?.name.split(' ')[0] || 'Kabir'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Here's what's happening across your customer operations today.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-secondary)'
        }}>
          <Calendar size={14} color="var(--accent-blue)" />
          <span>17 August 2026 • IST (Asia/Kolkata)</span>
        </div>
      </div>

      {/* Hero Analytics & Radial Gauge Banner (Screenshot 1 Visual Style) */}
      <div className="card" style={{
        padding: '24px 28px',
        backgroundColor: 'var(--bg-accent-banner)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        alignItems: 'center',
        border: '1px solid var(--border-color)'
      }}>
        {/* Metric Sparklines: New Customers */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            New Customers (This Week)
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '60px' }}>
            {[
              { day: 'Mon', val: 7 },
              { day: 'Tue', val: 10 },
              { day: 'Wed', val: 8 },
              { day: 'Thu', val: 4 },
              { day: 'Fri', val: 9 }
            ].map((bar, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '18px',
                  height: `${bar.val * 5}px`,
                  backgroundColor: i % 2 === 0 ? '#0F172A' : '#94A3B8',
                  borderRadius: '3px',
                  transition: 'height 0.3s ease'
                }} />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Radial Arc / Gauge: Deal Success Rate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="3.2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#0F172A"
                strokeWidth="3.2"
                strokeDasharray="68, 100"
              />
            </svg>
            <div style={{ position: 'absolute', fontSize: '16px', fontWeight: 800 }}>
              68%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>Successful Deals</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>+4.2% vs last quarter</div>
          </div>
        </div>

        {/* KPI Count: Tasks in progress */}
        <div 
          onClick={() => onNavigate('tasks')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>
              {tasks.filter(t => t.status !== 'Done').length || 53}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Tasks in progress
            </div>
          </div>
          <ArrowRight size={18} color="var(--text-muted)" />
        </div>

        {/* Total Won Collections (₹ INR) */}
        <div 
          onClick={() => onNavigate('deals')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ fontSize: '26px', fontWeight: 800, lineHeight: 1 }}>
              ₹ 18.60 L
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Prepayments from clients (Aug)
            </div>
          </div>
          <ArrowRight size={18} color="var(--text-muted)" />
        </div>
      </div>

      {/* Standard 4 KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              TOTAL CUSTOMERS
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--primary-light)' }}>
              <Users size={16} color="var(--accent-blue)" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px' }}>
            {kpis.total_customers.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '12.5px', color: '#059669', fontWeight: 600 }}>
            <ArrowUpRight size={14} />
            <span>{kpis.total_customers_trend}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>from last month</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              ACTIVE LEADS
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--primary-light)' }}>
              <TrendingUp size={16} color="#7C3AED" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px' }}>
            {kpis.active_leads}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '12.5px', color: '#059669', fontWeight: 600 }}>
            <ArrowUpRight size={14} />
            <span>{kpis.active_leads_trend}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>inbound growth</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              PIPELINE VALUE
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--primary-light)' }}>
              <DollarSign size={16} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px' }}>
            {kpis.pipeline_value_formatted}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '12.5px', color: '#059669', fontWeight: 600 }}>
            <ArrowUpRight size={14} />
            <span>{kpis.pipeline_trend}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>weighted value</span>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              WON REVENUE
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--primary-light)' }}>
              <Award size={16} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px' }}>
            {kpis.won_revenue_formatted}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '12.5px', color: '#059669', fontWeight: 600 }}>
            <ArrowUpRight size={14} />
            <span>{kpis.won_revenue_trend}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>FY 2026-27</span>
          </div>
        </div>
      </div>

      {/* AI Business Insights Section */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Sparkles size={16} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>AI Business Insights & Actions</h3>
          </div>
          <button
            onClick={() => onNavigate('ai-insights')}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--accent-blue)', fontWeight: 600 }}
          >
            View all predictions →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {aiInsights.map(ins => (
            <div
              key={ins.id}
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span className={`badge ${
                  ins.type.includes('RISK') ? 'badge-urgent' : 
                  ins.type.includes('HIGH') ? 'badge-high' : 'badge-low'
                }`} style={{ fontSize: '11px', marginBottom: '8px' }}>
                  {ins.type}
                </span>
                <h4 style={{ fontSize: '13.5px', fontWeight: 600, marginTop: '6px', marginBottom: '4px' }}>
                  {ins.title}
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {ins.description}
                </p>
              </div>

              <div style={{
                marginTop: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <button
                  onClick={() => handleAction(ins)}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  {ins.action_label}
                </button>
                <button
                  onClick={() => setDismissedInsights(prev => [...prev, ins.id])}
                  className="btn-ghost"
                  style={{ border: 'none', fontSize: '11.5px', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Grid: Sales Pipeline Visual Funnel & Monthly Revenue Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Sales Pipeline Funnel */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Sales Pipeline Breakdown</h3>
            <button onClick={() => onNavigate('deals')} className="btn btn-ghost btn-sm">
              Open Kanban →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { stage: 'Contacted', count: 12, value: '₹14.2 L', pct: '28%' },
              { stage: 'Qualified', count: 17, value: '₹21.8 L', pct: '42%' },
              { stage: 'Proposal Sent', count: 13, value: '₹18.6 L', pct: '58%' },
              { stage: 'Negotiation', count: 8, value: '₹16.4 L', pct: '75%' },
              { stage: 'Deal Closed (Won)', count: 12, value: '₹24.8 L', pct: '100%' }
            ].map(row => (
              <div key={row.stage} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{row.stage}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong>{row.count} deals</strong> ({row.value})
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-muted)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: row.pct,
                    background: row.stage.includes('Closed') ? '#059669' : 'linear-gradient(90deg, #2563EB, #7C3AED)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue Trend in ₹ Lakhs */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Monthly Revenue (₹ Lakhs)</h3>
            <span className="badge badge-low">+28% YoY</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', padding: '10px 0 4px' }}>
            {[
              { month: 'April', val: 8.2, height: '40%' },
              { month: 'May', val: 10.4, height: '52%' },
              { month: 'June', val: 12.8, height: '65%' },
              { month: 'July', val: 15.2, height: '78%' },
              { month: 'August', val: 18.6, height: '95%' }
            ].map(m => (
              <div key={m.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>₹{m.val}L</span>
                <div style={{
                  width: '36px',
                  height: m.height,
                  background: 'linear-gradient(180deg, #0F172A 0%, #334155 100%)',
                  borderRadius: '6px 6px 0 0'
                }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Lead Performance & Recent Activity Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '20px' }}>
        {/* Lead Performance Table */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Lead Channel Efficiency</h3>
            <button onClick={() => onNavigate('leads')} className="btn btn-ghost btn-sm">
              All Leads →
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Leads</th>
                  <th>Qualified</th>
                  <th>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard?.lead_sources || [
                  { source: 'Website', leads: 42, qualified: 34, conversion: '80.9%' },
                  { source: 'LinkedIn', leads: 38, qualified: 28, conversion: '73.6%' },
                  { source: 'Referral', leads: 29, qualified: 26, conversion: '89.6%' },
                  { source: 'Google Ads', leads: 35, qualified: 21, conversion: '60.0%' }
                ]).map(s => (
                  <tr key={s.source}>
                    <td style={{ fontWeight: 600 }}>{s.source}</td>
                    <td>{s.leads}</td>
                    <td>{s.qualified}</td>
                    <td>
                      <span className="badge badge-low">{s.conversion}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent CRM Activities */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Recent Activities & Follow-ups</h3>
            <button onClick={() => onNavigate('activities')} className="btn btn-ghost btn-sm">
              View Log →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.slice(0, 4).map(act => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-muted)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>
                    {act.type === 'Call' ? '📞' : act.type === 'Email' ? '📧' : act.type === 'Meeting' ? '📅' : '📝'}
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{act.title}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {act.customer_name} • by {act.performed_by}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>
                  {act.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
