import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Deal, DealStage, Priority } from '../types/crm';
import { 
  Plus, Search, Filter, MoreVertical, Calendar, MessageSquare, 
  Paperclip, ArrowRight, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, Mail, Bot
} from 'lucide-react';
import { QuickCreateModal } from '../components/layout/QuickCreateModal';

export const DealsPage: React.FC = () => {
  const { deals, updateDealStage, updateDeal, createTask } = useCRM();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>('deal-1'); // Dark card highlight (Screenshot 1 style)
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState({ subject: '', body: '' });

  const stages: DealStage[] = ["Contacted", "Qualified", "Proposal Sent", "Negotiation", "Deal Closed"];

  const filteredDeals = deals.filter(d => {
    const matchesSearch = d.deal_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOwner = selectedOwner === 'All' || d.owner === selectedOwner;
    return matchesSearch && matchesOwner;
  });

  // Calculate totals per stage
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
    if (dealId) {
      await updateDealStage(dealId, stage);
    }
  };

  const handleGenerateEmail = (deal: Deal) => {
    setGeneratedEmail({
      subject: `Following up on ${deal.deal_name} — Nexora CRM Proposal`,
      body: `Dear ${deal.contact_name || 'Team'},\n\nI wanted to follow up regarding our recent proposal for ${deal.deal_name} (Value: ₹${deal.deal_value.toLocaleString()}).\n\nOur team is prepared to include enterprise SLA onboarding and dedicated account management. Would you be available for a brief 15-minute call this week to finalize terms?\n\nWarm regards,\n${deal.owner}\nNexora CRM`
    });
    setEmailModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner with Search, Filters & Add Deal */}
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
            Track and accelerate enterprise sales opportunities across stages with AI Win Probability.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search deals or accounts..."
              className="input-control"
              style={{ width: '240px', paddingLeft: '32px', fontSize: '13px' }}
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

          <button onClick={() => setCreateOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container (Screenshot 1 & 2 inspired) */}
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
                padding: '0 4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700 }}>{stage}</h3>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}>
                    {count} ⇅
                  </span>
                </div>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {valueFormatted}
                </span>
              </div>

              {/* Cards List */}
              <div className="kanban-cards-container">
                {stageDeals.map(deal => {
                  const isDarkCard = activeCardId === deal.id;

                  return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={e => e.dataTransfer.setData('text/plain', deal.id)}
                      onClick={() => {
                        setSelectedDeal(deal);
                        setActiveCardId(deal.id);
                      }}
                      className={`deal-card ${isDarkCard ? 'active-dark' : ''}`}
                    >
                      {/* Card Header: Company & Action Menu */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.2 }}>
                            {deal.company_name}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: isDarkCard ? '#A1A1AA' : 'var(--text-muted)',
                            marginTop: '2px',
                            fontWeight: 500
                          }}>
                            {deal.deal_name}
                          </div>
                        </div>

                        <button
                          onClick={e => { e.stopPropagation(); setSelectedDeal(deal); }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isDarkCard ? '#D4D4D8' : 'var(--text-muted)',
                            padding: '2px'
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>

                      {/* Description */}
                      <p style={{
                        fontSize: '12px',
                        color: isDarkCard ? '#D4D4D8' : 'var(--text-secondary)',
                        margin: '8px 0',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {deal.description}
                      </p>

                      {/* Value & Win Probability Tag */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        margin: '10px 0',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        backgroundColor: isDarkCard ? 'rgba(255,255,255,0.08)' : 'var(--bg-muted)'
                      }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 800 }}>
                          ₹{deal.deal_value.toLocaleString('en-IN')}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: deal.probability >= 75 ? '#10B981' : deal.probability >= 50 ? '#F59E0B' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Sparkles size={12} /> {deal.probability}% Win Prob
                        </span>
                      </div>

                      {/* Footer: Date, Comments & Owner */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11.5px',
                        color: isDarkCard ? '#A1A1AA' : 'var(--text-muted)',
                        paddingTop: '6px',
                        borderTop: isDarkCard ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border-subtle)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          <span>{deal.expected_close_date}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <MessageSquare size={12} /> 2
                          </span>
                          <span style={{ fontWeight: 600, color: isDarkCard ? '#F4F4F5' : 'var(--text-primary)' }}>
                            {deal.owner.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Detail Drawer / Modal */}
      {selectedDeal && (
        <div className="modal-overlay" onClick={() => setSelectedDeal(null)}>
          <div 
            className="modal-content"
            style={{ maxWidth: '720px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--accent-blue)', fontWeight: 600 }}>
                  {selectedDeal.company_name}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>
                  {selectedDeal.deal_name}
                </h2>
                <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: '#059669' }}>
                  ₹{selectedDeal.deal_value.toLocaleString('en-IN')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleGenerateEmail(selectedDeal)}
                  className="btn btn-secondary btn-sm"
                >
                  <Mail size={14} />
                  <span>Draft Email</span>
                </button>
                <button onClick={() => setSelectedDeal(null)} className="btn-ghost btn-icon">
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Stage Progress Pills */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  PIPELINE STAGE
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {stages.map(s => {
                    const active = selectedDeal.stage === s;
                    return (
                      <button
                        key={s}
                        onClick={async () => {
                          await updateDealStage(selectedDeal.id, s);
                          setSelectedDeal({ ...selectedDeal, stage: s });
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: active ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                          backgroundColor: active ? 'var(--primary-light)' : 'var(--bg-muted)',
                          color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                          fontSize: '12.5px',
                          fontWeight: active ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Deal Analysis Box */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(124, 58, 237, 0.06)',
                border: '1px solid rgba(124, 58, 237, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={16} color="#7C3AED" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#7C3AED' }}>
                    AI Win Probability: {selectedDeal.probability}%
                  </span>
                </div>

                <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                  <strong>Key Factors:</strong> {selectedDeal.win_factors?.join(', ') || 'High engagement & decision maker involved.'}
                </div>

                {selectedDeal.risk_factor && (
                  <div style={{
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    color: '#DC2626'
                  }}>
                    <AlertCircle size={14} />
                    <span><strong>Risk:</strong> {selectedDeal.risk_factor}</span>
                  </div>
                )}

                {selectedDeal.ai_recommendation && (
                  <div style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-card)',
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)'
                  }}>
                    💡 <strong>AI Recommendation:</strong> {selectedDeal.ai_recommendation}
                  </div>
                )}

                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={async () => {
                      await createTask({
                        title: `Follow up: ${selectedDeal.deal_name}`,
                        customer_name: selectedDeal.company_name,
                        priority: 'Urgent',
                        due_date: '20 Aug 2026',
                        assigned_to: selectedDeal.owner
                      });
                      setSelectedDeal(null);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Create Follow-up Task
                  </button>
                  <button
                    onClick={() => handleGenerateEmail(selectedDeal)}
                    className="btn btn-secondary btn-sm"
                  >
                    Generate Email
                  </button>
                </div>
              </div>

              {/* Deal Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Account:</span>{' '}
                  <strong>{selectedDeal.company_name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Expected Close:</span>{' '}
                  <strong>{selectedDeal.expected_close_date}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Owner:</span>{' '}
                  <strong>{selectedDeal.owner}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Priority:</span>{' '}
                  <span className={`badge badge-${selectedDeal.priority.toLowerCase()}`}>
                    {selectedDeal.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draft Email Modal */}
      {emailModalOpen && (
        <div className="modal-overlay" onClick={() => setEmailModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>AI Drafted Follow-up Email</h3>
              <button onClick={() => setEmailModalOpen(false)} className="btn-ghost btn-icon">✕</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Subject</label>
                <input className="input-control" value={generatedEmail.subject} onChange={e => setGeneratedEmail({ ...generatedEmail, subject: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Body</label>
                <textarea className="input-control" rows={8} value={generatedEmail.body} onChange={e => setGeneratedEmail({ ...generatedEmail, body: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => setEmailModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button onClick={() => { alert("Email dispatched via Nexora SMTP relay!"); setEmailModalOpen(false); }} className="btn btn-primary">Send Email</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <QuickCreateModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultType="deal"
      />
    </div>
  );
};
