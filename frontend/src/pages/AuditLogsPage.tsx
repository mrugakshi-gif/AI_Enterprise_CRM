import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { AuditLogItem } from '../types/crm';
import { History, Search, ShieldCheck, Filter } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(log => 
    log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Enterprise Audit Logs & Compliance Trail
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Immutable record of CRM entity modifications, pipeline stage transitions, and AI RAG document uploads.
        </p>
      </div>

      <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
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
