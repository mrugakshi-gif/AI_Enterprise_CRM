import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/crm';
import { ShieldCheck, KeyRound, Check, X, Sparkles } from 'lucide-react';

export const RolesPermissionsPage: React.FC = () => {
  const { role: currentActiveRole, switchRole } = useAuth();

  const roleDefinitions = [
    {
      role: 'ADMIN' as UserRole,
      title: 'System Administrator (Executive)',
      desc: 'Full unconstrained access to all CRM records, financial metrics, RAG knowledge store, audit trails, and system config.',
      users: ['Kabir Mehta']
    },
    {
      role: 'SALES_MANAGER' as UserRole,
      title: 'Sales Manager',
      desc: 'Pipeline supervision, discount approvals, team member reporting, and customer contract negotiations.',
      users: ['Priya Patil']
    },
    {
      role: 'SALES_EXECUTIVE' as UserRole,
      title: 'Sales Executive (Representative)',
      desc: 'Frontline sales representative handling assigned leads, active customer deals, tasks, follow-up calls, and email generation.',
      users: ['Amit Sharma', 'Rohan Joshi']
    },
    {
      role: 'SUPPORT_AGENT' as UserRole,
      title: 'Customer Support & Success Agent',
      desc: 'Client onboarding, customer health telemetry monitoring, support activity logging, and policy knowledge base lookups.',
      users: ['Sneha Kulkarni']
    }
  ];

  const permissionsMatrix = [
    { feature: 'Executive Dashboard & Financials', admin: true, manager: true, exec: true, support: true },
    { feature: 'Manage & Convert Leads', admin: true, manager: true, exec: true, support: false },
    { feature: 'Create & Update Deals / Pipeline', admin: true, manager: true, exec: true, support: false },
    { feature: 'View Full Company 360 & GSTIN Profiles', admin: true, manager: true, exec: true, support: true },
    { feature: 'Upload & Manage RAG Documents', admin: true, manager: false, exec: false, support: false },
    { feature: 'Use AI Knowledge Assistant', admin: true, manager: true, exec: true, support: true },
    { feature: 'Export Financial & Sales Reports', admin: true, manager: true, exec: false, support: false },
    { feature: 'Manage Users & Permissions Matrix', admin: true, manager: false, exec: false, support: false },
    { feature: 'Inspect Enterprise Audit Logs', admin: true, manager: false, exec: false, support: false }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Role-Based Access Control (RBAC)
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Enforce granular security policies across Admin, Sales Manager, Sales Representative, and Customer Support roles.
        </p>
      </div>

      {/* Role Switcher Sandbox Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {roleDefinitions.map(r => {
          const isActive = currentActiveRole === r.role;
          return (
            <div
              key={r.role}
              className="card"
              style={{
                padding: '20px',
                border: isActive ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-card)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-primary">{r.role}</span>
                  {isActive && <span className="badge badge-low">Active Now</span>}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, marginTop: '8px' }}>{r.title}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                  {r.desc}
                </p>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Assigned Users: <strong>{r.users.join(', ')}</strong>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => switchRole(r.role)}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%' }}
                >
                  {isActive ? 'Current Active Role' : `Switch to ${r.role}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix Table */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>
          Permissions & Capability Matrix
        </h2>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>CRM Feature / Capability</th>
                <th style={{ textAlign: 'center' }}>ADMIN</th>
                <th style={{ textAlign: 'center' }}>SALES MANAGER</th>
                <th style={{ textAlign: 'center' }}>SALES EXEC</th>
                <th style={{ textAlign: 'center' }}>SUPPORT AGENT</th>
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.feature}</td>
                  <td style={{ textAlign: 'center' }}>
                    {row.admin ? <Check size={18} color="#10B981" style={{ margin: '0 auto' }} /> : <X size={18} color="#EF4444" style={{ margin: '0 auto' }} />}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.manager ? <Check size={18} color="#10B981" style={{ margin: '0 auto' }} /> : <X size={18} color="#EF4444" style={{ margin: '0 auto' }} />}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.exec ? <Check size={18} color="#10B981" style={{ margin: '0 auto' }} /> : <X size={18} color="#EF4444" style={{ margin: '0 auto' }} />}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.support ? <Check size={18} color="#10B981" style={{ margin: '0 auto' }} /> : <X size={18} color="#EF4444" style={{ margin: '0 auto' }} />}
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
