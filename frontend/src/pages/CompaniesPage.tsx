import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Company } from '../types/crm';
import { Plus, Search, Building2, MapPin, Shield, Sparkles, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { QuickCreateModal } from '../components/layout/QuickCreateModal';

export const CompaniesPage: React.FC = () => {
  const { companies, deals, contacts, createTask } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.gstin.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <button onClick={() => setCreateOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Company</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
        {filteredCompanies.map(comp => {
          const compDeals = deals.filter(d => d.company_name === comp.name);
          const compContacts = contacts.filter(c => c.company === comp.name);

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
                justifyContent: 'space-between'
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
                  <span className="badge badge-neutral" style={{ fontFamily: 'monospace' }}>GSTIN: {comp.gstin}</span>
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
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Revenue</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '2px' }}>
                      ₹{(comp.total_revenue / 100000).toFixed(1)} L
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deals</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '2px' }}>
                      {compDeals.length || comp.active_deals_count}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Health</div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      marginTop: '2px',
                      color: comp.customer_health >= 80 ? '#10B981' : comp.customer_health >= 60 ? '#F59E0B' : '#EF4444'
                    }}>
                      {comp.customer_health}/100
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Footer */}
              <div style={{
                marginTop: '14px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.4
              }}>
                💡 <strong>AI Note:</strong> {comp.ai_recommendation || 'Account engagement is stable.'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Company 360 Detail Modal */}
      {selectedCompany && (
        <div className="modal-overlay" onClick={() => setSelectedCompany(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{selectedCompany.name}</h2>
                  <span className="badge badge-low">{selectedCompany.customer_status}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedCompany.industry} • {selectedCompany.city}, {selectedCompany.state} • GSTIN: <code>{selectedCompany.gstin}</code>
                </div>
              </div>
              <button onClick={() => setSelectedCompany(null)} className="btn-ghost btn-icon">✕</button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Health and Churn Prediction */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: selectedCompany.churn_risk === 'High' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: selectedCompany.churn_risk === 'High' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>
                    Customer Health Score: {selectedCompany.customer_health}/100
                  </span>
                  <span className={`badge ${selectedCompany.churn_risk === 'High' ? 'badge-urgent' : 'badge-low'}`}>
                    Churn Risk: {selectedCompany.churn_risk} ({selectedCompany.churn_probability}%)
                  </span>
                </div>
                <p style={{ fontSize: '13px', marginTop: '6px', lineHeight: 1.4 }}>
                  {selectedCompany.ai_recommendation}
                </p>
                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={async () => {
                      await createTask({
                        title: `Account Action: ${selectedCompany.name}`,
                        customer_name: selectedCompany.name,
                        priority: 'Urgent',
                        due_date: '22 Aug 2026',
                        assigned_to: 'Amit Sharma'
                      });
                      setSelectedCompany(null);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Schedule Retention / Renewal Task
                  </button>
                </div>
              </div>

              {/* Company Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>PAN:</span> <strong>{selectedCompany.pan}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Customer Since:</span> <strong>{selectedCompany.customer_since}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Lifetime Revenue:</span> <strong>₹{selectedCompany.total_revenue.toLocaleString('en-IN')}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Employees:</span> <strong>{selectedCompany.employees}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <QuickCreateModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultType="company"
      />
    </div>
  );
};
