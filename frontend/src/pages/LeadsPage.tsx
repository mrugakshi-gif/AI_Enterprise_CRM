import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Lead, LeadStatus } from '../types/crm';
import { 
  Plus, Search, Filter, Phone, Mail, Sparkles, Building2, MapPin, 
  Calendar, CheckCircle2, UserCheck, ArrowRight, Bot, Trash2
} from 'lucide-react';
import { QuickCreateModal } from '../components/layout/QuickCreateModal';

export const LeadsPage: React.FC = () => {
  const { leads, updateLead, deleteLead, createTask } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'Table' | 'Cards'>('Table');

  const filteredLeads = leads.filter(l => {
    const matchesSearch = `${l.first_name} ${l.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || l.status === selectedStatus;
    const matchesCity = selectedCity === 'All' || l.city === selectedCity;
    return matchesSearch && matchesStatus && matchesCity;
  });

  const handleCreateTaskForLead = async (lead: Lead) => {
    await createTask({
      title: `Discovery Follow-up: ${lead.first_name} ${lead.last_name}`,
      customer_name: lead.company,
      priority: 'Urgent',
      due_date: '19 Aug 2026',
      assigned_to: lead.assigned_to
    });
    alert(`Task created for ${lead.assigned_to}!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header with Title and Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Leads & Prospecting
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Capture, qualify and convert potential Indian enterprise customers with AI Lead Scoring.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setCreateOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              placeholder="Search leads, company, email..."
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
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Proposal">Proposal</option>
          </select>

          <select
            className="input-control"
            style={{ width: '140px', fontSize: '13px' }}
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
          >
            <option value="All">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Pune">Pune</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Delhi">Delhi</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Chennai">Chennai</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-muted)', padding: '2px', borderRadius: '6px' }}>
          <button
            onClick={() => setViewMode('Table')}
            className={`btn-sm ${viewMode === 'Table' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ border: 'none' }}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('Cards')}
            className={`btn-sm ${viewMode === 'Cards' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ border: 'none' }}
          >
            Cards
          </button>
        </div>
      </div>

      {/* Leads Content (Table View) */}
      {viewMode === 'Table' ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Company</th>
                <th>Source</th>
                <th>Status</th>
                <th>AI Score</th>
                <th>Value (₹)</th>
                <th>Owner</th>
                <th>City</th>
                <th>Last Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id} onClick={() => setSelectedLead(lead)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{lead.first_name} {lead.last_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.job_title}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{lead.company}</td>
                  <td>
                    <span className="badge badge-neutral">{lead.source}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      lead.status === 'Qualified' ? 'badge-low' : 
                      lead.status === 'Proposal' ? 'badge-high' : 'badge-primary'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 800,
                      color: lead.lead_score >= 80 ? '#10B981' : lead.lead_score >= 60 ? '#F59E0B' : '#64748B'
                    }}>
                      <Sparkles size={13} />
                      {lead.lead_score}/100
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    ₹{lead.lead_value.toLocaleString('en-IN')}
                  </td>
                  <td>{lead.assigned_to.split(' ')[0]}</td>
                  <td>{lead.city}</td>
                  <td>{lead.last_contact || '16 Aug 2026'}</td>
                  <td>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleCreateTaskForLead(lead);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      + Task
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredLeads.map(lead => (
            <div
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className="card"
              style={{ padding: '18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{lead.first_name} {lead.last_name}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.job_title} • {lead.company}</div>
                  </div>
                  <span className="badge badge-low" style={{ fontWeight: 700 }}>
                    ✨ {lead.lead_score}%
                  </span>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={13} /> <span>{lead.industry} ({lead.city})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} /> <span>{lead.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} /> <span>{lead.phone}</span>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>₹{lead.lead_value.toLocaleString('en-IN')}</span>
                <span className="badge badge-primary">{lead.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <div className="modal-overlay" onClick={() => setSelectedLead(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{selectedLead.first_name} {selectedLead.last_name}</h2>
                  <span className="badge badge-low">{selectedLead.status}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedLead.job_title} at <strong>{selectedLead.company}</strong> ({selectedLead.city}, {selectedLead.state})
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="btn-ghost btn-icon">✕</button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* AI Lead Scoring Box */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(37, 99, 235, 0.06)',
                border: '1px solid rgba(37, 99, 235, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} color="var(--accent-blue)" />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                      AI Lead Score: {selectedLead.lead_score}/100
                    </span>
                  </div>
                  <span className="badge badge-low">High Conversion Probability</span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {selectedLead.ai_summary || 'High engagement verified across pricing portal visits, email opens, and senior decision-maker participation.'}
                </p>

                <div style={{ marginTop: '10px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  <strong>Key Factors:</strong> Multiple interactions, Requested pricing, Visited product page, Decision maker authority.
                </div>

                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '12.5px',
                  border: '1px solid var(--border-color)'
                }}>
                  💡 <strong>Recommended Action:</strong> {selectedLead.ai_recommended_action || 'Schedule product demonstration within 24 hours.'}
                </div>

                <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      handleCreateTaskForLead(selectedLead);
                      setSelectedLead(null);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Create Follow-up Task
                  </button>
                  <button
                    onClick={() => {
                      alert(`Email drafted and dispatched to ${selectedLead.email}`);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Generate Email
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Email:</span>{' '}
                  <strong>{selectedLead.email}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Phone:</span>{' '}
                  <strong>{selectedLead.phone}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Lead Value:</span>{' '}
                  <strong style={{ color: '#059669' }}>₹{selectedLead.lead_value.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned To:</span>{' '}
                  <strong>{selectedLead.assigned_to}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Source:</span>{' '}
                  <span className="badge badge-neutral">{selectedLead.source}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Expected Closing:</span>{' '}
                  <strong>{selectedLead.expected_closing || '30 Sep 2026'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <QuickCreateModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultType="lead"
      />
    </div>
  );
};
