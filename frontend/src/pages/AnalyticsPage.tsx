import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { BarChart3, TrendingUp, Users, DollarSign, Award, PieChart, ShieldCheck } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { dashboard } = useCRM();
  const [activeTab, setActiveTab] = useState<'Sales' | 'Leads' | 'Customers' | 'Revenue' | 'Employees'>('Sales');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Executive Analytics & BI
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Detailed visibility into pipeline velocity, acquisition unit economics, and rep performance in ₹ INR.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div style={{
        display: 'flex',
        gap: '6px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '8px'
      }}>
        {(['Sales', 'Leads', 'Customers', 'Revenue', 'Employees'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'var(--text-inverse)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 700 : 500,
              fontSize: '13.5px',
              cursor: 'pointer'
            }}
          >
            {tab} Analytics
          </button>
        ))}
      </div>

      {/* Sales Tab */}
      {activeTab === 'Sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PIPELINE</div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>₹42.8 Lakhs</div>
              <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>+15.7% Q3 Target</div>
            </div>
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>WIN RATE</div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>68.4%</div>
              <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>+4.2% YoY</div>
            </div>
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>AVG DEAL SIZE</div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>₹3.85 Lakhs</div>
              <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>Across 14 Deals</div>
            </div>
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>AVG SALES CYCLE</div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>18 Days</div>
              <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px' }}>4 days faster with AI</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Deals Stage Velocity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Contacted → Qualified', days: '3.2 days', rate: '82%' },
                  { name: 'Qualified → Proposal', days: '4.8 days', rate: '76%' },
                  { name: 'Proposal → Negotiation', days: '5.5 days', rate: '68%' },
                  { name: 'Negotiation → Won', days: '4.5 days', rate: '88%' }
                ].map((st, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '6px', background: 'var(--bg-muted)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600 }}>{st.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{st.days} (Conversion: <strong>{st.rate}</strong>)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Revenue by Industry</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { ind: 'IT Services & SaaS', rev: '₹18.4 L (42%)' },
                  { ind: 'Financial Services', rev: '₹12.5 L (28%)' },
                  { ind: 'Renewable Energy', rev: '₹9.2 L (21%)' },
                  { ind: 'Logistics & Supply', rev: '₹4.1 L (9%)' }
                ].map((ind, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '6px', background: 'var(--bg-muted)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600 }}>{ind.ind}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{ind.rev}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leads Tab */}
      {activeTab === 'Leads' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Lead Acquisition Performance by Source</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Channel Source</th>
                  <th>Total Inbound Leads</th>
                  <th>Qualified Leads</th>
                  <th>Conversion Rate</th>
                  <th>Customer Acquisition Cost (CAC)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { source: 'Website Organic', leads: 42, qual: 34, rate: '80.9%', cac: '₹4,200' },
                  { source: 'LinkedIn Inbound', leads: 38, qual: 28, rate: '73.6%', cac: '₹6,800' },
                  { source: 'Client Referrals', leads: 29, qual: 26, rate: '89.6%', cac: '₹1,500' },
                  { source: 'Google Search Ads', leads: 35, qual: 21, rate: '60.0%', cac: '₹9,400' },
                  { source: 'Partner Network', leads: 18, qual: 15, rate: '83.3%', cac: '₹3,600' }
                ].map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{s.source}</td>
                    <td>{s.leads}</td>
                    <td>{s.qual}</td>
                    <td><span className="badge badge-low">{s.rate}</span></td>
                    <td style={{ fontWeight: 600 }}>{s.cac}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'Revenue' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Fiscal Year 2026-27 Revenue Runway (₹ Lakhs)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--bg-muted)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Q1 Actuals</div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>₹31.4 L</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--bg-muted)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Q2 Actuals (Aug)</div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: '#10B981' }}>₹48.6 L</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--bg-muted)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Q3 Target</div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: 'var(--accent-blue)' }}>₹65.0 L</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--bg-muted)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Annual Forecast</div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>₹2.4 Crore</div>
            </div>
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {(activeTab === 'Employees' || activeTab === 'Customers') && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Sales Executive Leaderboard</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Executive Name</th>
                  <th>Deals Closed</th>
                  <th>Revenue Generated</th>
                  <th>Win Rate</th>
                  <th>Calls & Demos</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Amit Sharma', closed: 14, rev: '₹12.8 L', win: '68.0%', calls: 142 },
                  { name: 'Priya Patil', closed: 11, rev: '₹8.4 L', win: '62.5%', calls: 118 },
                  { name: 'Rohan Joshi', closed: 7, rev: '₹4.2 L', win: '51.2%', calls: 86 }
                ].map((rep, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{rep.name}</td>
                    <td>{rep.closed}</td>
                    <td style={{ fontWeight: 700, color: '#059669' }}>{rep.rev}</td>
                    <td><span className="badge badge-low">{rep.win}</span></td>
                    <td>{rep.calls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
