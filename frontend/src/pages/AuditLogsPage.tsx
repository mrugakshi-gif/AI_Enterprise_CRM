import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { AuditLogItem } from '../types/crm';
import { History, Search, ShieldCheck, Filter, Download } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedAction, setSelectedAction] = useState<string>('All');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || log.user_role === selectedRole;
    const matchesAction = selectedAction === 'All' || log.action.toLowerCase().includes(selectedAction.toLowerCase());
    return matchesSearch && matchesRole && matchesAction;
  });

  const exportAuditCSV = () => {
    const headers = "ID,Timestamp,User,Role,Action,Target Entity,Details\n";
    const rows = filteredLogs.map(l => 
      `"${l.id}","${l.timestamp}","${l.user_name}","${l.user_role}","${l.action}","${l.entity}","${l.details}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Enterprise Audit Logs & Compliance Trail
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Immutable record of CRM entity modifications, pipeline stage transitions, and AI RAG document uploads.
          </p>
        </div>

        <button onClick={exportAuditCSV} className="btn btn-secondary btn-sm" title="Export audit trail to CSV">
          <Download size={14} />
          <span>Export Audit Trail</span>
        </button>
      </div>

      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <input
            type="text"
            placeholder="Search audit trail by user, action, entity..."
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
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SALES_MANAGER">SALES_MANAGER</option>
          <option value="SALES_EXECUTIVE">SALES_EXECUTIVE</option>
          <option value="SUPPORT_AGENT">SUPPORT_AGENT</option>
        </select>

        <select
          className="input-control"
          style={{ width: '180px', fontSize: '13px' }}
          value={selectedAction}
          onChange={e => setSelectedAction(e.target.value)}
        >
          <option value="All">All Action Types</option>
          <option value="Lead">Lead Actions</option>
          <option value="Deal">Deal Actions</option>
          <option value="Task">Task Actions</option>
          <option value="Document">Knowledge Base</option>
          <option value="Settings">Settings / Admin</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp (IST)</th>
              <th>User & Role</th>
              <th>Action</th>
              <th>Target Entity</th>
              <th>Detailed Modification Trail</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td style={{ fontSize: '12.5px', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                <td>
                  <div style={{ fontWeight: 700 }}>{log.user_name}</div>
                  <span className="badge badge-primary" style={{ fontSize: '10.5px' }}>{log.user_role}</span>
                </td>
                <td>
                  <span className="badge badge-low" style={{ fontWeight: 600 }}>{log.action}</span>
                </td>
                <td style={{ fontWeight: 600 }}>{log.entity}</td>
                <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
