import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Deal, DealStage } from '../types/crm';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Plus, Search, Sparkles, Download, RefreshCw, X,
  CheckCircle2, XCircle, Trophy, AlertCircle
} from 'lucide-react';
import { QuickCreateModal } from '../components/layout/QuickCreateModal';
import { DealDetailModal } from '../components/modals/DealDetailModal';
import { api } from '../services/api';

const ACTIVE_STAGES: DealStage[] = ["Contacted", "Qualified", "Proposal Sent", "Negotiation"];
const CLOSED_STAGES: DealStage[] = ["Closed Won", "Closed Lost"];

const LOST_REASONS = ["Price", "Competitor", "Budget", "Timing", "No Response", "Product Fit", "Other"];

const STAGE_COLORS: Record<string, string> = {
  "Contacted":    "#6366F1",
  "Qualified":    "#3B82F6",
  "Proposal Sent":"#F59E0B",
  "Negotiation":  "#EF4444",
  "Closed Won":   "#10B981",
  "Closed Lost":  "#6B7280",
};

export const DealsPage: React.FC = () => {
  const { deals, updateDealStage, loading } = useCRM();
  const { canManageDeals } = usePermissions();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('All');
  const [stageFilter, setStageFilter] = useState<'active' | 'closed' | 'all'>('active');
  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'Kanban' | 'List'>('Kanban');

  // Lost Reason modal state
  const [lostModal, setLostModal] = useState<{ dealId: string; dealName: string } | null>(null);
  const [selectedLostReason, setSelectedLostReason] = useState('');
  const [lostSubmitting, setLostSubmitting] = useState(false);

  const filteredDeals = deals.filter(d => {
    const matchesSearch = d.deal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOwner = selectedOwner === 'All' || d.owner === selectedOwner;
    const isActive = ACTIVE_STAGES.includes(d.stage);
    const isClosed = CLOSED_STAGES.includes(d.stage) || d.stage === 'Deal Closed';
    const matchesStageFilter =
      stageFilter === 'all' ? true :
      stageFilter === 'active' ? isActive :
      isClosed;
    return matchesSearch && matchesOwner && matchesStageFilter;
  });

  const visibleStages = stageFilter === 'closed'
    ? CLOSED_STAGES
    : stageFilter === 'all'
    ? [...ACTIVE_STAGES, ...CLOSED_STAGES]
    : ACTIVE_STAGES;

  const getStageTotal = (stage: DealStage) => {
    const stageDeals = filteredDeals.filter(d => d.stage === stage);
    const count = stageDeals.length;
    const value = stageDeals.reduce((sum, d) => sum + d.deal_value, 0);
    return { count, valueFormatted: `₹${(value / 100000).toFixed(1)}L` };
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = async (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    if (!canManageDeals) return;
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    if (stage === 'Closed Lost') {
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        setLostModal({ dealId, dealName: deal.deal_name });
        setSelectedLostReason('');
      }
    } else {
      await updateDealStage(dealId, stage);
    }
  };

  const handleConfirmLost = async () => {
    if (!lostModal || !selectedLostReason) return;
    setLostSubmitting(true);
    try {
      await api.updateDeal(lostModal.dealId, {
        stage: 'Closed Lost',
        lost_reason: selectedLostReason,
      } as any);
      await updateDealStage(lostModal.dealId, 'Closed Lost');
      setLostModal(null);
    } catch {
      // optimistic fallback
      await updateDealStage(lostModal.dealId, 'Closed Lost');
      setLostModal(null);
    } finally {
      setLostSubmitting(false);
    }
  };

  const exportDealsCSV = () => {
    const headers = "ID,Deal Name,Company,Value,Stage,Probability,Close Date,Owner,Priority,Lost Reason\n";
    const rows = filteredDeals.map(d =>
      `"${d.id}","${d.deal_name}","${d.company_name}",${d.deal_value},"${d.stage}",${d.probability},"${d.expected_close_date}","${d.owner}","${d.priority}","${(d as any).lost_reason || ''}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deals-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Summary stats
  const activePipeline = deals.filter(d => ACTIVE_STAGES.includes(d.stage)).reduce((s, d) => s + d.deal_value, 0);
  const wonDeals = deals.filter(d => d.stage === 'Closed Won' || d.stage === 'Deal Closed');
  const lostDeals = deals.filter(d => d.stage === 'Closed Lost');
  const winRate = wonDeals.length + lostDeals.length > 0
    ? Math.round(wonDeals.length / (wonDeals.length + lostDeals.length) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Deals &amp; Pipeline
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Track and accelerate enterprise sales opportunities with AI Win Probability and Risk Analysis.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={exportDealsCSV} className="btn btn-secondary" title="Export deals to CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          {canManageDeals && (
            <button onClick={() => setCreateOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Add Deal</span>
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Active Pipeline', value: `₹${(activePipeline/100000).toFixed(1)}L`, icon: <Sparkles size={16} color="#6366F1" />, color: '#6366F1' },
          { label: 'Won Revenue', value: `₹${(wonDeals.reduce((s,d)=>s+d.deal_value,0)/100000).toFixed(1)}L`, icon: <Trophy size={16} color="#10B981" />, color: '#10B981' },
          { label: 'Lost Deals', value: lostDeals.length.toString(), icon: <XCircle size={16} color="#6B7280" />, color: '#6B7280' },
          { label: 'Win Rate', value: `${winRate}%`, icon: <CheckCircle2 size={16} color="#3B82F6" />, color: '#3B82F6' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800 }}>{k.value}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '1px' }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <input
              type="text"
              placeholder="Search deals or accounts..."
              className="input-control"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          </div>

          <select
            className="input-control"
            style={{ width: '150px', fontSize: '13px' }}
            value={selectedOwner}
            onChange={e => setSelectedOwner(e.target.value)}
          >
            <option value="All">All Owners</option>
            <option value="Amit Sharma">Amit Sharma</option>
            <option value="Priya Patil">Priya Patil</option>
            <option value="Rohan Joshi">Rohan Joshi</option>
          </select>

          {/* Stage filter toggle */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-muted)', padding: '3px', borderRadius: '8px' }}>
            {(['active', 'closed', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStageFilter(f)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: stageFilter === f ? 'var(--bg-card)' : 'transparent',
                  color: stageFilter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: stageFilter === f ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {f === 'active' ? 'Active' : f === 'closed' ? 'Closed' : 'All'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {(['Kanban', 'List'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`btn btn-sm ${viewMode === mode ? 'btn-primary' : 'btn-secondary'}`}
            >
              {mode === 'Kanban' ? 'Kanban Board' : 'List View'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      {loading ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p>Loading sales pipeline...</p>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No deals found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Try adjusting search or filters.</p>
        </div>
      ) : viewMode === 'Kanban' ? (

        /* ── KANBAN BOARD ── */
        <div className="kanban-board">
          {visibleStages.map(stage => {
            const { count, valueFormatted } = getStageTotal(stage);
            const stageDeals = filteredDeals.filter(d => d.stage === stage);
            const color = STAGE_COLORS[stage] || '#6366F1';
            const isClosed = CLOSED_STAGES.includes(stage);

            return (
              <div
                key={stage}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, stage)}
                style={{ opacity: isClosed ? 0.9 : 1 }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '12px', paddingBottom: '10px',
                  borderBottom: `2px solid ${color}40`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{stage}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '1px 7px',
                      borderRadius: '10px', background: `${color}20`, color
                    }}>{count}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {valueFormatted}
                  </span>
                </div>

                {/* Cards */}
                <div className="kanban-cards-container">
                  {stageDeals.map(deal => (
                    <div
                      key={deal.id}
                      draggable={canManageDeals && !isClosed}
                      onDragStart={e => e.dataTransfer.setData('text/plain', deal.id)}
                      onClick={() => setSelectedDeal(deal)}
                      className="deal-card"
                      style={{ cursor: 'pointer', borderLeft: `3px solid ${color}` }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.3, flex: 1 }}>
                          {deal.deal_name}
                        </h4>
                        <span className={`badge ${
                          deal.priority === 'Urgent' ? 'badge-urgent' :
                          deal.priority === 'High' ? 'badge-high' : 'badge-normal'
                        }`} style={{ marginLeft: '6px', flexShrink: 0 }}>
                          {deal.priority}
                        </span>
                      </div>

                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                        {deal.company_name}
                      </p>

                      {/* Lost reason badge */}
                      {stage === 'Closed Lost' && (deal as any).lost_reason && (
                        <div style={{ marginTop: '6px' }}>
                          <span style={{
                            fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                            background: 'rgba(107,114,128,0.12)', color: '#6B7280', fontWeight: 600
                          }}>
                            Lost: {(deal as any).lost_reason}
                          </span>
                        </div>
                      )}

                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)'
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: 800 }}>
                          ₹{deal.deal_value.toLocaleString()}
                        </div>
                        {!isClosed && (
                          <div style={{ fontSize: '11.5px', fontWeight: 700, color: deal.probability >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={12} /> {deal.probability}% Win
                          </div>
                        )}
                        {stage === 'Closed Won' && (
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> Won
                          </span>
                        )}
                        {stage === 'Closed Lost' && (
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={12} /> Lost
                          </span>
                        )}
                      </div>

                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginTop: '6px', fontSize: '11.5px', color: 'var(--text-muted)'
                      }}>
                        <span>{deal.owner}</span>
                        <span>{deal.expected_close_date}</span>
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                      {isClosed ? `No ${stage} deals` : 'Drop deals here'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      ) : (

        /* ── LIST VIEW ── */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Deal Name &amp; Account</th>
                <th>Stage</th>
                <th>Deal Value</th>
                <th>Win Probability</th>
                <th>Target Close</th>
                <th>Owner</th>
                <th>Priority</th>
                <th>Lost Reason</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map(d => {
                const color = STAGE_COLORS[d.stage] || '#6366F1';
                return (
                  <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDeal(d)}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{d.deal_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{d.company_name}</div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11.5px', fontWeight: 700, padding: '2px 9px', borderRadius: '10px',
                        background: `${color}18`, color
                      }}>{d.stage}</span>
                    </td>
                    <td><strong>₹{d.deal_value.toLocaleString()}</strong></td>
                    <td>
                      <span style={{ fontWeight: 700, color: d.probability >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                        {d.probability}%
                      </span>
                    </td>
                    <td><span style={{ fontSize: '13px' }}>{d.expected_close_date}</span></td>
                    <td><span style={{ fontSize: '13px' }}>{d.owner}</span></td>
                    <td>
                      <span className={`badge ${d.priority === 'Urgent' ? 'badge-urgent' : 'badge-normal'}`}>
                        {d.priority}
                      </span>
                    </td>
                    <td>
                      {(d as any).lost_reason ? (
                        <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
                          {(d as any).lost_reason}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDeal(d)}>
                        View 360
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Lost Reason Modal ── */}
      {lostModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.55)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: '440px', padding: '28px',
            borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(107,114,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={18} color="#6B7280" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Mark Deal as Lost</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {lostModal.dealName}
                  </p>
                </div>
              </div>
              <button className="btn-ghost btn-icon" onClick={() => setLostModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Primary reason for loss <span style={{ color: 'var(--accent-red)' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {LOST_REASONS.map(reason => (
                  <button
                    key={reason}
                    onClick={() => setSelectedLostReason(reason)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: selectedLostReason === reason
                        ? '2px solid #6B7280'
                        : '2px solid var(--border-color)',
                      background: selectedLostReason === reason
                        ? 'rgba(107,114,128,0.12)'
                        : 'var(--bg-muted)',
                      color: selectedLostReason === reason ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: selectedLostReason === reason ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setLostModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{
                  flex: 1,
                  background: '#6B7280', color: '#fff',
                  opacity: selectedLostReason ? 1 : 0.5,
                  cursor: selectedLostReason ? 'pointer' : 'not-allowed',
                }}
                disabled={!selectedLostReason || lostSubmitting}
                onClick={handleConfirmLost}
              >
                {lostSubmitting ? 'Saving...' : 'Confirm Lost'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Create Modal */}
      <QuickCreateModal
        isOpen={createOpen}
        defaultType="deal"
        onClose={() => setCreateOpen(false)}
      />

      {/* Deal Workspace 360 Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  );
};
