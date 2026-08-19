import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Company } from '../types/crm';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Plus, Search, Building2, MapPin, Shield, Sparkles, TrendingUp, 
  AlertTriangle, ArrowRight, Download, RefreshCw 
} from 'lucide-react';
import { QuickCreateModal } from '../components/layout/QuickCreateModal';
import { CompanyDetailModal } from '../components/modals/CompanyDetailModal';

export const CompaniesPage: React.FC = () => {
  const { companies, deals, contacts, createTask, loading } = useCRM();
  const { canManageCompanies } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const exportCompaniesCSV = () => {
    const headers = "ID,Name,Industry,City,State,GSTIN,Total Revenue,Status,Health,Churn Risk\n";
    const rows = filteredCompanies.map(c => 
      `"${c.id}","${c.name}","${c.industry}","${c.city}","${c.state}","${c.gstin}",${c.total_revenue},"${c.customer_status}",${c.customer_health},"${c.churn_risk}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `companies-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Companies & Accounts
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Manage Indian enterprise customer accounts, GSTIN verification, revenue and customer health scores.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={exportCompaniesCSV} className="btn btn-secondary" title="Export companies to CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          {canManageCompanies && (
            <button onClick={() => setCreateOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Add Company</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <input
            type="text"
            placeholder="Search company, GSTIN, city..."
            className="input-control"
            style={{ paddingLeft: '32px', fontSize: '13px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p>Loading company accounts...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Building2 size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No companies found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
          {filteredCompanies.map(comp => {
            const compDeals = deals.filter(d => d.company_name === comp.name || d.company_id === comp.id);
            const compContacts = contacts.filter(c => c.company === comp.name || c.company_id === comp.id);

            return (
              <div
                key={comp.id}
                onClick={() => setSelectedCompany(comp)}
                className="card"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s'
                }}
              >
                <div>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{comp.name}</h3>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {comp.city}, {comp.state}
                      </div>
                    </div>
                    <span className={`badge ${comp.customer_status === 'Customer' ? 'badge-low' : 'badge-primary'}`}>
                      {comp.customer_status}
                    </span>
                  </div>

                  {/* Tags & GSTIN */}
                  <div style={{ marginTop: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="badge badge-neutral">{comp.industry}</span>
                    {comp.gstin && (
                      <span className="badge badge-neutral" style={{ fontFamily: 'monospace' }}>GSTIN: {comp.gstin}</span>
                    )}
                  </div>

                  {/* Metrics Bar */}
                  <div style={{
                    marginTop: '16px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-muted)',
                    textAlign: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Revenue</span>
                      <div style={{ fontSize: '13px', fontWeight: 800 }}>₹{(comp.total_revenue / 100000).toFixed(1)}L</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Contacts</span>
                      <div style={{ fontSize: '13px', fontWeight: 800 }}>{compContacts.length || comp.contacts_count}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Deals</span>
                      <div style={{ fontSize: '13px', fontWeight: 800 }}>{compDeals.length || comp.active_deals_count}</div>
                    </div>
                  </div>

                  {/* Churn Risk */}
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)'
                  }}>
                    <span>Customer Health:</span>
                    <span style={{
                      fontWeight: 700,
                      color: comp.customer_health >= 75 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                    }}>
                      {comp.customer_health}/100 ({comp.churn_risk} Risk)
                    </span>
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Inspect Company 360 <ArrowRight size={13} />
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Since {comp.customer_since}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Create Modal */}
      <QuickCreateModal
        isOpen={createOpen}
        defaultType="company"
        onClose={() => setCreateOpen(false)}
      />

      {/* Company 360 Detail Modal */}
      {selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
};
