import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { useToast } from '../context/ToastContext';
import { 
  Sparkles, TrendingUp, AlertTriangle, CheckCircle2, 
  ArrowRight, ShieldCheck, Plus, Mail, Calendar, DollarSign,
  UserCheck, Building2, Flame, Layers, Clock, ShieldAlert, CheckSquare
} from 'lucide-react';

interface AIInsightsPageProps {
  onNavigate: (tab: string) => void;
}

export const AIInsightsPage: React.FC<AIInsightsPageProps> = ({ onNavigate }) => {
  const { aiInsights, createTask, leads, deals, companies } = useCRM();
  const { addToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<'all' | 'nba' | 'deals' | 'leads' | 'churn'>('all');
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);

  const handleExecuteAction = async (action: any) => {
    setExecutingActionId(action.id);
    try {
      const payload = action.payload || {};
      await createTask({
        title: payload.title || `Follow-up: ${action.company_name}`,
        customer_name: action.company_name,
        company_id: payload.company_id,
        deal_id: payload.deal_id,
        priority: payload.priority || 'Urgent',
        due_date: payload.due_date || '22 Aug 2026',
        assigned_to: payload.assigned_to || 'Amit Sharma',
        description: `Next Best Action executed from AI Insights: ${action.recommended_action || action.context}`,
        is_ai_generated: true
      });
      addToast(`Action executed! Task created in database for ${action.company_name}.`, 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to execute action', 'error');
    } finally {
      setExecutingActionId(null);
    }
  };

  const nextBestActions = aiInsights?.next_best_actions || [
    {
      id: 'nba-technova',
      company_name: 'TechNova Solutions',
      context: '₹8.4L active opportunity in Negotiation stage. No interaction for 18 days.',
      recommended_action: 'Schedule an account review within 48 hours.',
      rationale: 'Deal has remained in Negotiation for 11 days with 72% win probability and approaching close date.',
      action_type: 'create_task',
      action_label: 'Create Account Review Task',
      payload: {
        title: 'Account Review with TechNova Solutions CTO',
        customer_name: 'TechNova Solutions',
        company_id: 'comp-1',
        deal_id: 'deal-1',
        priority: 'Urgent',
        due_date: '22 Aug 2026',
        assigned_to: 'Amit Sharma'
      }
    },
    {
      id: 'nba-finedge',
      company_name: 'FinEdge Systems',
      context: 'Pricing objection detected regarding annual prepayment terms.',
      recommended_action: 'Offer customized annual-plan pricing with complimentary onboarding instead of discounting base price.',
      rationale: 'Protects 78% software gross margin while satisfying VP of Operations budget parameters.',
      action_type: 'create_task',
      action_label: 'Create Pricing Review Task',
      payload: {
        title: 'Prepare Annual Prepayment ROI Proposal for FinEdge',
        customer_name: 'FinEdge Systems',
        company_id: 'comp-2',
        priority: 'Normal',
        due_date: '24 Aug 2026',
        assigned_to: 'Priya Patil'
      }
    },
    {
      id: 'nba-bharat',
      company_name: 'Bharat Logistics Corp',
      context: 'Fleet tracking module utilization down 12% in past 30 days.',
      recommended_action: 'Schedule Technical Account Review & Operations Training.',
      rationale: 'Proactive intervention prevents potential churn on ₹24.0L annual contract.',
      action_type: 'create_task',
      action_label: 'Create Training Task',
      payload: {
        title: 'Technical Account Review & Training - Bharat Logistics',
        customer_name: 'Bharat Logistics Corp',
        company_id: 'comp-3',
        priority: 'High',
        due_date: '23 Aug 2026',
        assigned_to: 'Amit Sharma'
      }
    }
  ];

  const dealPredictions = aiInsights?.deal_predictions || deals.map(d => ({
    id: d.id,
    deal_name: d.deal_name,
    company_name: d.company_name,
    deal_value_formatted: `₹${(d.deal_value/100000).toFixed(1)} L`,
    win_probability: d.probability,
    risk_score: d.risk_score || 30,
    risk_level: (d.risk_score || 30) >= 65 ? 'High Risk' : 'Normal',
    evidence_reasons: d.ai_evidence_reasons || [
      `Deal active in ${d.stage}`,
      `Win probability ${d.probability}%`
    ],
    ai_interpretation: `Calculated health assessment based on ${d.stage} stage velocity.`,
    recommended_action: d.ai_recommendation || `Follow up with ${d.company_name} team.`,
    owner: d.owner
  }));

  const leadScoring = aiInsights?.lead_scoring || leads.map(l => ({
    id: l.id,
    lead_name: `${l.first_name} ${l.last_name}`,
    company: l.company,
    score: l.lead_score,
    probability: l.lead_score >= 80 ? 'High probability' : 'Medium probability',
    reasons: l.ai_positive_factors || l.ai_reasons || ["Recent activity", "Budget matched"],
    positive_factors: l.ai_positive_factors || ["Source fit", "Industry match"],
    risk_factors: l.ai_risk_factors || [],
    recommended_action: l.ai_recommended_action || "Schedule follow-up call",
    value: `₹${l.lead_value.toLocaleString()}`
  }));

  const churnPredictions = aiInsights?.churn_predictions || companies.map(c => ({
    id: c.id,
    company_name: c.name,
    city: c.city,
    churn_risk: c.churn_risk,
    churn_probability: c.churn_probability,
    health_score: c.customer_health,
    reasons: [
      `Health Score: ${c.customer_health}/100`,
      c.churn_risk === 'High' ? 'Critical support escalation pending' : 'Regular platform engagement',
      'Contract renewal approaching'
    ],
    recommendation: c.ai_recommendation || 'Conduct quarterly review'
  }));

  return (
    <div className="page-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color="var(--accent-blue)" /> Explainable AI Insights & Intelligence
          </h1>
          <p className="page-subtitle">
            Evidence-backed scoring, deal risk telemetry, and executable Next Best Actions grounded in real CRM records.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate('assistant')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={15} /> Company Knowledge Assistant
          </button>
        </div>
      </div>

      {/* Distinction Banner: Facts vs Scores vs AI Interpretation vs Actions */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px'
      }}>
        <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
            1. Detected Facts
          </div>
          <p style={{ fontSize: '12.5px', marginTop: '4px', color: 'var(--text-primary)' }}>
            Database records: Inactivity days, stage age, close date, communication logs.
          </p>
        </div>
        <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#F59E0B', letterSpacing: '0.5px' }}>
            2. Calculated Scores
          </div>
          <p style={{ fontSize: '12.5px', marginTop: '4px', color: 'var(--text-primary)' }}>
            Deterministic 0–100 Lead & Deal Risk algorithms computed from business signals.
          </p>
        </div>
        <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-blue)', letterSpacing: '0.5px' }}>
            3. AI Reasoning
          </div>
          <p style={{ fontSize: '12.5px', marginTop: '4px', color: 'var(--text-primary)' }}>
            Synthesis of why risk emerged and what specific factors contribute to the score.
          </p>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#10B981', letterSpacing: '0.5px' }}>
            4. Executable Action
          </div>
          <p style={{ fontSize: '12.5px', marginTop: '4px', color: 'var(--text-primary)' }}>
            1-Click triggers that immediately insert verified tasks/meetings into CRM database.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { id: 'all', label: 'All Insights' },
          { id: 'nba', label: `Next Best Actions (${nextBestActions.length})` },
          { id: 'deals', label: `Deal Risk Analysis (${dealPredictions.length})` },
          { id: 'leads', label: `Lead Scoring (${leadScoring.length})` },
          { id: 'churn', label: `Customer Health & Churn (${churnPredictions.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`btn ${activeCategory === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '13px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: NEXT BEST ACTIONS */}
      {(activeCategory === 'all' || activeCategory === 'nba') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={18} color="#EF4444" /> Next Best Action Engine
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {nextBestActions.map((action: any) => (
              <div key={action.id} className="card" style={{
                padding: '18px',
                border: action.company_name === 'TechNova Solutions' ? '2px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={16} color="var(--accent-blue)" />
                      <span style={{ fontSize: '15px', fontWeight: 700 }}>{action.company_name}</span>
                    </div>
                    <span className="badge badge-urgent">Priority Action</span>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                    <div style={{ background: 'var(--bg-muted)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Detected Context: </span>
                      <span>{action.context}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>Recommendation: </span>
                      <span style={{ fontWeight: 500 }}>{action.recommended_action}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '12px' }}>
                      Rationale: {action.rationale}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleExecuteAction(action)}
                  disabled={executingActionId === action.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
                >
                  <CheckSquare size={14} />
                  {executingActionId === action.id ? 'Creating Task in DB...' : (action.action_label || 'Create Follow-up Task')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: DEAL RISK ANALYSIS (EXPLAINABLE DEAL SCORING) */}
      {(activeCategory === 'all' || activeCategory === 'deals') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#F59E0B" /> Explainable Deal Risk & Health Telemetry
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dealPredictions.map((deal: any) => (
              <div key={deal.id} className="card" style={{
                padding: '16px 20px',
                borderLeft: deal.risk_score >= 65 ? '4px solid #EF4444' : (deal.risk_score >= 40 ? '4px solid #F59E0B' : '4px solid #10B981'),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>{deal.company_name}</span>
                    <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>— {deal.deal_name}</span>
                    <span className={`badge ${deal.risk_score >= 65 ? 'badge-urgent' : deal.risk_score >= 40 ? 'badge-normal' : 'badge-low'}`}>
                      Risk Score: {deal.risk_score}/100
                    </span>
                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Detected Evidence & Reasons:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {(deal.evidence_reasons || []).map((reason: string, rIdx: number) => (
                        <li key={rIdx}>{reason}</li>
                      ))}
                    </ul>
                    <div style={{ fontSize: '12.5px', marginTop: '6px', color: 'var(--accent-blue)', fontWeight: 500 }}>
                      Recommended Action: {deal.recommended_action}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {deal.deal_value_formatted}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Win Probability: {deal.win_probability}% • Owner: {deal.owner}
                  </span>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleExecuteAction({
                      id: `deal-act-${deal.id}`,
                      company_name: deal.company_name,
                      recommended_action: deal.recommended_action,
                      payload: {
                        title: `Follow-up: ${deal.deal_name}`,
                        customer_name: deal.company_name,
                        priority: deal.risk_score >= 65 ? 'Urgent' : 'Normal',
                        assigned_to: deal.owner
                      }
                    })}
                  >
                    Schedule Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: LEAD SCORING */}
      {(activeCategory === 'all' || activeCategory === 'leads') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#10B981" /> Explainable Lead Scoring (0–100)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {leadScoring.slice(0, 12).map((lead: any) => (
              <div key={lead.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{lead.lead_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lead.company}</div>
                    </div>
                    <span className={`badge ${lead.score >= 80 ? 'badge-low' : lead.score >= 60 ? 'badge-normal' : 'badge-neutral'}`}>
                      Score: {lead.score}/100
                    </span>
                  </div>

                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Positive Signals:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {(lead.reasons || []).slice(0, 3).map((r: string, idx: number) => (
                        <span key={idx} style={{ fontSize: '11.5px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={11} /> {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{lead.value}</span>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => onNavigate('leads')}
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    View Lead <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
