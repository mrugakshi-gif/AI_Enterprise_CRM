import React from 'react';
import { useCRM } from '../context/CRMContext';
import { 
  Sparkles, TrendingUp, AlertTriangle, CheckCircle2, 
  ArrowRight, ShieldCheck, Plus, Mail, Calendar, DollarSign
} from 'lucide-react';

interface AIInsightsPageProps {
  onNavigate: (tab: string) => void;
}

export const AIInsightsPage: React.FC<AIInsightsPageProps> = ({ onNavigate }) => {
  const { aiInsights, createTask } = useCRM();

  const handleCreateTask = async (action: any) => {
    await createTask({
      title: action.payload?.title || `AI Recommendation: ${action.company_name}`,
      customer_name: action.company_name,
      priority: 'Urgent',
      due_date: '21 Aug 2026',
      assigned_to: 'Amit Sharma'
    });
    alert(`Task created for ${action.company_name}!`);
    onNavigate('tasks');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: '#7C3AED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Sparkles size={16} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            AI Business Intelligence & Predictive Analytics
          </h1>
        </div>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Real-time machine learning predictions for Lead Conversion, Deal Win Probability, Churn Prevention, and Next-Best-Action guidance.
        </p>
      </div>

      {/* Section 1: Next Best Action Cards */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sparkles size={16} color="#7C3AED" />
          <h2 style={{ fontSize: '17px', fontWeight: 800 }}>Next Best Action Recommendations</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {(aiInsights?.next_best_actions || [
            {
              id: 'nba-1',
              company_name: 'TechNova Solutions',
              context: 'Executive proposal under active review (12 opens detected).',
              recommended_action: 'Schedule a product demonstration & closing call within 24 hours.',
              rationale: 'High executive engagement + pricing review + decision maker Rahul Sharma active.',
              action_label: 'Create Closing Task',
              payload: { title: 'Closing meeting with TechNova Sales Director', customer_name: 'TechNova Solutions' }
            },
            {
              id: 'nba-2',
              company_name: 'FinEdge Systems',
              context: 'Pricing objection detected regarding annual prepayment terms.',
              recommended_action: 'Offer customized annual-plan pricing with complimentary onboarding instead of discounting base price.',
              rationale: 'Protects gross margin while satisfying VP of Operations budget parameters.',
              action_label: 'Generate ROI Proposal',
              payload: { title: 'Draft ROI Proposal for FinEdge', customer_name: 'FinEdge Systems' }
            },
            {
              id: 'nba-3',
              company_name: 'Global Solutions Ltd',
              context: 'Customer health dropped to 42/100; zero telemetry logged in 28 days.',
              recommended_action: 'Initiate executive sponsor retention intervention.',
              rationale: '81% churn probability unless immediate customer success check-in is conducted.',
              action_label: 'Schedule Retention Check-in',
              payload: { title: 'Customer Retention Review - Global Solutions', customer_name: 'Global Solutions Ltd' }
            }
          ]).map((nba: any) => (
            <div
              key={nba.id}
              style={{
                padding: '16px 18px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800 }}>{nba.company_name}</h3>
                  <span className="badge badge-low">Actionable</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {nba.context}
                </div>

                <div style={{
                  margin: '12px 0',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '13px',
                  lineHeight: 1.4,
                  border: '1px solid var(--border-color)'
                }}>
                  🎯 <strong>Recommended:</strong> {nba.recommended_action}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Why:</strong> {nba.rationale}
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => handleCreateTask(nba)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Plus size={14} />
                  <span>{nba.action_label}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Lead Scoring & Deal Predictions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Lead Scoring */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800 }}>AI Lead Scoring</h2>
            <span className="badge badge-primary">Dynamic Rank</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(aiInsights?.lead_scoring || []).slice(0, 4).map((ls: any) => (
              <div
                key={ls.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{ls.company}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ls.lead_name} • {ls.value}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {ls.reasons?.slice(0, 2).join(' • ')}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: ls.score >= 80 ? '#10B981' : ls.score >= 60 ? '#F59E0B' : '#64748B'
                  }}>
                    {ls.score}%
                  </div>
                  <span className="badge badge-low" style={{ fontSize: '10px' }}>{ls.probability}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deal Win Predictions */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800 }}>Deal Win Predictions</h2>
            <span className="badge badge-low">Forecast Weighted</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(aiInsights?.deal_predictions || []).slice(0, 4).map((dp: any) => (
              <div
                key={dp.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{dp.company_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dp.deal_name}</div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                    Expected: {dp.expected_revenue} (Total: {dp.deal_value_formatted})
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#7C3AED' }}>
                    {dp.win_probability}%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Probability</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Churn Risk Prediction */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800 }}>Customer Churn Risk & Retention Models</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Telemetry analysis based on logins, open tickets, and contract renewal timeline.</p>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer / Account</th>
                <th>Location</th>
                <th>Health Score</th>
                <th>Churn Risk</th>
                <th>Telemetry Signals</th>
                <th>AI Intervention Plan</th>
              </tr>
            </thead>
            <tbody>
              {(aiInsights?.churn_predictions || []).map((cp: any) => (
                <tr key={cp.id}>
                  <td style={{ fontWeight: 700 }}>{cp.company_name}</td>
                  <td>{cp.city}</td>
                  <td>
                    <span style={{
                      fontWeight: 800,
                      color: cp.health_score >= 80 ? '#10B981' : cp.health_score >= 60 ? '#F59E0B' : '#EF4444'
                    }}>
                      {cp.health_score}/100
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${cp.churn_risk === 'High' ? 'badge-urgent' : cp.churn_risk === 'Medium' ? 'badge-high' : 'badge-low'}`}>
                      {cp.churn_risk} ({cp.churn_probability}%)
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>
                    {cp.reasons?.join(', ')}
                  </td>
                  <td style={{ fontSize: '12.5px', fontWeight: 500 }}>
                    {cp.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
