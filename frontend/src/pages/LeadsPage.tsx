import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Lead, LeadStatus } from '../types/crm';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Plus, Search, Filter, Phone, Mail, Sparkles, Building2, MapPin, 
  Calendar, CheckCircle2, UserCheck, ArrowRight, Bot, Trash2,
  SlidersHorizontal, Download, RefreshCw
} from 'lucide-react';
import { QuickCreateModal } from '../components/layout/QuickCreateModal';
import { LeadDetailModal } from '../components/modals/LeadDetailModal';

export const LeadsPage: React.FC = () => {
  const { leads, updateLead, deleteLead, loading, refreshAll } = useCRM();
  const { canManageLeads, canDeleteRecords } = usePermissions();
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

  const exportLeadsCSV = () => {
    const headers = "ID,First Name,Last Name,Company,Email,Phone,City,Status,Score,Value,Assigned To\n";
    const rows = filteredLeads.map(l => 
      `"${l.id}","${l.first_name}","${l.last_name}","${l.company}","${l.email}","${l.phone}","${l.city}","${l.status}",${l.lead_score},${l.lead_value},"${l.assigned_to}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
            Capture, qualify and convert potential Indian enterprise customers with Explainable AI Lead Scoring.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={exportLeadsCSV} 
            className="btn btn-secondary" 
            title="Export filtered leads to CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          {canManageLeads && (
            <button onClick={() => setCreateOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Add Lead</span>
            </button>
          )}
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
            <option value="Converted">Converted</option>
            <option value="Unqualified">Unqualified</option>
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
            <option value="Delhi">Delhi</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Chennai">Chennai</option>
            <option value="Ahmedabad">Ahmedabad</option>
          </select>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setViewMode('Table')}
            className={`btn btn-sm ${viewMode === 'Table' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('Cards')}
            className={`btn btn-sm ${viewMode === 'Cards' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Card Grid
          </button>
        </div>
      </div>

      {/* Leads Content */}
      {loading ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p>Loading enterprise lead database...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Building2 size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>No matching leads found</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Try clearing your search query or filters to view all leads.</p>
        </div>
      ) : viewMode === 'Table' ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead Name & Company</th>
                <th>Contact Info</th>
                <th>Location</th>
                <th>Source</th>
                <th>AI Score</th>
                <th>Lead Value</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(l => (
                <tr 
                  key={l.id} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedLead(l)}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--primary-light)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 700
                      }}>
                        {l.first_name[0]}{l.last_name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {l.first_name} {l.last_name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {l.company} • {l.job_title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12.5px' }}>{l.email}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{l.phone}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px' }}>{l.city}, {l.state}</span>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{l.source}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        background: l.lead_score >= 80 ? 'rgba(5, 150, 105, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                        color: l.lead_score >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800
                      }}>
                        {l.lead_score}
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: '13.5px' }}>₹{l.lead_value.toLocaleString()}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px' }}>{l.assigned_to}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      l.status === 'Qualified' ? 'badge-low' :
                      l.status === 'Proposal' ? 'badge-normal' :
                      l.status === 'Converted' ? 'badge-low' : 'badge-neutral'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedLead(l)}
                      >
                        Inspect 360
                      </button>
                      {canDeleteRecords && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => deleteLead(l.id)}
                          style={{ color: 'var(--accent-rose)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {filteredLeads.map(l => (
            <div 
              key={l.id} 
              className="card" 
              style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}
              onClick={() => setSelectedLead(l)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    {l.first_name[0]}{l.last_name[0]}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 700 }}>{l.first_name} {l.last_name}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{l.company}</p>
                  </div>
                </div>

                <div style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: l.lead_score >= 80 ? 'rgba(5, 150, 105, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                  color: l.lead_score >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  {l.lead_score} AI Score
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} color="var(--text-muted)" /> {l.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} color="var(--text-muted)" /> {l.city}, {l.state}
                </div>
              </div>

              <div style={{
                marginTop: 'auto',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Estimated Value</span>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>₹{l.lead_value.toLocaleString()}</div>
                </div>
                <span className={`badge ${
                  l.status === 'Qualified' ? 'badge-low' :
                  l.status === 'Proposal' ? 'badge-normal' :
                  l.status === 'Converted' ? 'badge-low' : 'badge-neutral'
                }`}>
                  {l.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Create Modal */}
      <QuickCreateModal
        isOpen={createOpen}
        defaultType="lead"
        onClose={() => setCreateOpen(false)}
      />

      {/* Lead Customer 360 Slide-in Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
};
