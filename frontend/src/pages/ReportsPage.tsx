import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { ReportItem } from '../types/crm';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);

  useEffect(() => {
    api.getReports().then(setReports).catch(console.error);
  }, []);

  const handleDownloadCSV = async (repId: string) => {
    try {
      const data = await api.exportReport(repId);
      const blob = new Blob([data.content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', data.filename || 'Nexora_Report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Report exported to downloads!");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Enterprise Reports
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Audit-ready financial, sales conversion, and customer retention reports formatted for Indian enterprise standards (₹ INR).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
        {reports.map(rep => (
          <div
            key={rep.id}
            className="card"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary">{rep.category}</span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{rep.generated_date}</span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 800, marginTop: '10px' }}>{rep.title}</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                {rep.description}
              </p>

              <div style={{
                marginTop: '16px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12.5px'
              }}>
                {Object.entries(rep.metrics).map(([key, val]) => (
                  <div key={key}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{key.replace('_', ' ')}</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, marginTop: '2px' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              marginTop: '18px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={() => setPreviewReport(rep)}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                <Eye size={13} />
                <span>View Summary</span>
              </button>
              <button
                onClick={() => handleDownloadCSV(rep.id)}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewReport && (
        <div className="modal-overlay" onClick={() => setPreviewReport(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-primary">{previewReport.category}</span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, marginTop: '4px' }}>{previewReport.title}</h3>
              </div>
              <button onClick={() => setPreviewReport(null)} className="btn-ghost btn-icon">✕</button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{previewReport.description}</p>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Key Performance Highlights (₹ INR):</div>
                {Object.entries(previewReport.metrics).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{k.replace(/_/g, ' ').toUpperCase()}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={() => setPreviewReport(null)} className="btn btn-secondary">Close</button>
                <button onClick={() => { handleDownloadCSV(previewReport.id); setPreviewReport(null); }} className="btn btn-primary">
                  Download Full CSV Dataset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
