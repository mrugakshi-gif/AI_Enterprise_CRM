import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Deal, DealStage, Priority } from '../types/crm';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Plus, Search, Filter, MoreVertical, Calendar, MessageSquare, 
  Paperclip, ArrowRight, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, Mail, Bot,
  Download, RefreshCw, LayoutGrid, List
} from 'lucide-react';
import { QuickCreateModal } from '../components/layout/QuickCreateModal';
import { DealDetailModal } from '../components/modals/DealDetailModal';

export const DealsPage: React.FC = () => {
  const { deals, updateDealStage, updateDeal, createTask, loading } = useCRM();
  const { canManageDeals } = usePermissions();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>('deal-1');
  const [viewMode, setViewMode] = useState<'Kanban' | 'List'>('Kanban');

  const stages: DealStage[] = ["Contacted", "Qualified", "Proposal Sent", "Negotiation", "Deal Closed"];

  const filteredDeals = deals.filter(d => {
    const matchesSearch = d.deal_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOwner = selectedOwner === 'All' || d.owner === selectedOwner;
    return matchesSearch && matchesOwner;
  });

  const getStageTotal = (stage: DealStage) => {
    const stageDeals = filteredDeals.filter(d => d.stage === stage);
    const count = stageDeals.length;
    const value = stageDeals.reduce((sum, d) => sum + d.deal_value, 0);
    return { count, valueFormatted: `₹${(value / 100000).toFixed(1)} L` };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId && canManageDeals) {
      await updateDealStage(dealId, stage);
    }
  };

  const exportDealsCSV = () => {
    const headers = "ID,Deal Name,Company,Value,Stage,Probability,Close Date,Owner,Priority\n";
    const rows = filteredDeals.map(d => 
      `"${d.id}","${d.deal_name}","${d.company_name}",${d.deal_value},"${d.stage}",${d.probability},"${d.expected_close_date}","${d.owner}","${d.priority}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deals-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Deals & Pipeline
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Track and accelerate enterprise sales opportunities across stages with AI Win Probability and Risk Analysis.
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

      {/* Filter Bar */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{ position: 'relative', width: '260px' }}>
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
            style={{ width: '160px', fontSize: '13px' }}
            value={selectedOwner}
            onChange={e => setSelectedOwner(e.target.value)}
          >
            <option value="All">All Owners</option>
            <option value="Amit Sharma">Amit Sharma</option>
            <option value="Priya Patil">Priya Patil</option>
            <option value="Rohan Joshi">Rohan Joshi</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setViewMode('Kanban')}
            className={`btn btn-sm ${viewMode === 'Kanban' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setViewMode('List')}
            className={`btn btn-sm ${viewMode === 'List' ? 'btn-primary' : 'btn-secondary'}`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Main Deals Content */}
      {loading ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p>Loading sales pipeline...</p>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No deals found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Try resetting your search query.</p>
        </div>
      ) : viewMode === 'Kanban' ? (
        /* KANBAN BOARD */
        <div className="kanban-board">
          {stages.map(stage => {
            const { count, valueFormatted } = getStageTotal(stage);
            const stageDeals = filteredDeals.filter(d => d.stage === stage);

            return (
              <div
                key={stage}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, stage)}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700 }}>{stage}</span>
                    <span className="badge badge-neutral">{count}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {valueFormatted}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="kanban-cards-container">
                  {stageDeals.map(deal => {
                    const isDark = activeCardId === deal.id;

                    return (
                      <div
                        key={deal.id}
                        draggable={canManageDeals}
                        onDragStart={e => e.dataTransfer.setData('text/plain', deal.id)}
                        onClick={() => setSelectedDeal(deal)}
                        className={`deal-card ${isDark ? 'active-dark' : ''}`}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Header: Name & Priority */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ fontSize: '13.5px', fontWeight: 700, lineHeight: 1.3 }}>
                            {deal.deal_name}
                          </h4>
                          <span className={`badge ${
                            deal.priority === 'Urgent' ? 'badge-urgent' :
                            deal.priority === 'High' ? 'badge-high' : 'badge-normal'
                          }`}>
                            {deal.priority}
                          </span>
                        </div>

                        <p style={{ fontSize: '12px', color: isDark ? '#A1A1AA' : 'var(--text-secondary)', marginTop: '4px' }}>
                          {deal.company_name}
                        </p>

                        {/* Value & Win Probability */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '10px',
                          paddingTop: '8px',
                          borderTop: isDark ? '1px solid #27272A' : '1px solid var(--border-subtle)'
                        }}>
                          <div style={{ fontSize: '14px', fontWeight: 800 }}>
                            ₹{deal.deal_value.toLocaleString()}
                          </div>

                          <div style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: deal.probability >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Sparkles size={12} /> {deal.probability}% Win
                          </div>
                        </div>

                        {/* Footer: Owner and Close date */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '8px',
                          fontSize: '11.5px',
                          color: isDark ? '#71717A' : 'var(--text-muted)'
                        }}>
                          <span>{deal.owner}</span>
                          <span>Close: {deal.expected_close_date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Deal Name & Account</th>
                <th>Stage</th>
                <th>Deal Value</th>
                <th>Win Probability</th>
                <th>Target Close</th>
                <th>Owner</th>
                <th>Priority</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map(d => (
                <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDeal(d)}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{d.deal_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{d.company_name}</div>
                  </td>
                  <td><span className="badge badge-accent">{d.stage}</span></td>
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
                  <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDeal(d)}>
                      Workspace 360
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
