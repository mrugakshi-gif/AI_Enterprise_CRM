import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/crm';
import { ShieldCheck, KeyRound, Check, X, Sparkles, Lock, Eye } from 'lucide-react';

export const RolesPermissionsPage: React.FC = () => {
  const { role: currentActiveRole, switchRole } = useAuth();

  const roleDefinitions = [
    {
      role: 'SUPER_ADMIN' as UserRole,
      title: 'Super Administrator',
      desc: 'Master administrative authority over all CRM data, security policies, AI configurations, and audit systems.',
      users: ['Kabir Mehta (CEO)']
    },
    {
      role: 'ADMIN' as UserRole,
      title: 'System Administrator',
      desc: 'Enterprise administrator managing team assignments, settings, policy documents, and operational permissions.',
      users: ['Aditya Verma']
    },
    {
      role: 'SALES_MANAGER' as UserRole,
      title: 'Sales Manager',
      desc: 'Pipeline supervision, discount authorizations up to 20%, team quotas, and revenue forecasting analytics.',
      users: ['Priya Patil', 'Ananya Deshmukh']
    },
    {
      role: 'SALES_EXECUTIVE' as UserRole,
      title: 'Sales Executive',
      desc: 'Frontline sales representative managing assigned leads, active deals, follow-up calls, tasks, and discount quotes up to 15%.',
      users: ['Amit Sharma', 'Rohan Joshi', 'Vikram Malhotra', 'Neha Singhania']
    },
    {
      role: 'SUPPORT_AGENT' as UserRole,
      title: 'Customer Support Agent',
      desc: 'Customer onboarding, health score monitoring, support ticket activities, and policy knowledge queries.',
      users: ['Sneha Kulkarni', 'Pooja Hegde', 'Divya Menon']
    },
    {
      role: 'VIEWER' as UserRole,
      title: 'Read-Only Viewer',
      desc: 'Strict read-only access for compliance auditors, investors, and board members. All mutation actions are blocked.',
      users: ['Rhea Kapoor (Auditor)']
    }
  ];

  const permissionsMatrix = [
    { feature: 'Executive Dashboard & Metrics', superAdmin: true, admin: true, manager: true, exec: true, support: true, viewer: true },
    { feature: 'Manage & Convert Leads', superAdmin: true, admin: true, manager: true, exec: true, support: false, viewer: false },
    { feature: 'Create & Update Deals / Pipeline', superAdmin: true, admin: true, manager: true, exec: true, support: false, viewer: false },
    { feature: 'Customer 360 & GST Profiles', superAdmin: true, admin: true, manager: true, exec: true, support: true, viewer: true },
    { feature: 'Upload & Index RAG Policy Documents', superAdmin: true, admin: true, manager: false, exec: false, support: false, viewer: false },
    { feature: 'Use AI Knowledge Assistant', superAdmin: true, admin: true, manager: true, exec: true, support: true, viewer: true },
    { feature: 'Export Financial & Sales Reports', superAdmin: true, admin: true, manager: true, exec: false, support: false, viewer: true },
    { feature: 'Manage Users & Permissions Matrix', superAdmin: true, admin: true, manager: false, exec: false, support: false, viewer: false },
    { feature: 'Inspect Enterprise Audit Trail', superAdmin: true, admin: true, manager: false, exec: false, support: false, viewer: true }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KeyRound size={24} color="var(--accent-blue)" /> Enterprise Role-Based Access Control (RBAC)
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Backend-enforced security policies across 6 enterprise tiers with instant sandbox testing.
        </p>
      </div>

      {/* Role Switcher Sandbox Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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
                  Assigned Team: <strong>{r.users.join(', ')}</strong>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => switchRole(r.role)}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%' }}
                >
                  {isActive ? 'Current Active Role' : `Switch Role to ${r.role}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix Table */}
      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#10B981" /> 6-Tier RBAC Permission Enforcement Matrix
        </h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>CRM Feature / Capability</th>
                <th style={{ textAlign: 'center' }}>Super Admin</th>
                <th style={{ textAlign: 'center' }}>Admin</th>
                <th style={{ textAlign: 'center' }}>Sales Manager</th>
                <th style={{ textAlign: 'center' }}>Sales Executive</th>
                <th style={{ textAlign: 'center' }}>Support Agent</th>
                <th style={{ textAlign: 'center' }}>Viewer</th>
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, fontSize: '13px' }}>{p.feature}</td>
                  <td style={{ textAlign: 'center' }}>{p.superAdmin ? <Check size={16} color="#10B981" /> : <X size={16} color="#EF4444" />}</td>
                  <td style={{ textAlign: 'center' }}>{p.admin ? <Check size={16} color="#10B981" /> : <X size={16} color="#EF4444" />}</td>
                  <td style={{ textAlign: 'center' }}>{p.manager ? <Check size={16} color="#10B981" /> : <X size={16} color="#EF4444" />}</td>
                  <td style={{ textAlign: 'center' }}>{p.exec ? <Check size={16} color="#10B981" /> : <X size={16} color="#EF4444" />}</td>
                  <td style={{ textAlign: 'center' }}>{p.support ? <Check size={16} color="#10B981" /> : <X size={16} color="#EF4444" />}</td>
                  <td style={{ textAlign: 'center' }}>{p.viewer ? <Check size={16} color="#10B981" /> : <X size={16} color="#EF4444" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
