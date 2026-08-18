import React, { useState, useEffect } from 'react';
import { Search, X, Users, KanbanSquare, Building2, UserSquare2, CheckSquare, FileText, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    leads: any[];
    deals: any[];
    companies: any[];
    contacts: any[];
    tasks: any[];
    documents: any[];
  }>({ leads: [], deals: [], companies: [], contacts: [], tasks: [], documents: [] });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'f')) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ leads: [], deals: [], companies: [], contacts: [], tasks: [], documents: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.globalSearch(query);
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.leads.length + results.deals.length + results.companies.length + results.contacts.length + results.tasks.length + results.documents.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '680px', borderRadius: '16px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <Search size={20} color="var(--text-muted)" />
          <input
            autoFocus
            type="text"
            placeholder="Search leads, deals, companies, contacts, tasks, or documents... (e.g. 'TechNova', 'Rahul', 'MDS')"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '15px',
              color: 'var(--text-primary)'
            }}
          />
          <kbd style={{
            fontSize: '11px',
            padding: '3px 6px',
            borderRadius: '4px',
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)'
          }}>
            ESC
          </kbd>
          <button onClick={onClose} className="btn-ghost btn-icon" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '16px 20px' }}>
          {!query.trim() ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Quick Search across Nexora CRM</div>
              <div style={{ fontSize: '12.5px' }}>Type Indian company names, customer contacts, GSTIN numbers, or document topics.</div>
            </div>
          ) : totalResults === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matches found for "{query}".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Deals */}
              {results.deals.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <KanbanSquare size={13} /> DEALS
                  </div>
                  {results.deals.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => { onNavigate('deals'); onClose(); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginBottom: '6px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.subtitle} • {item.meta}</div>
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Leads */}
              {results.leads.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={13} /> LEADS
                  </div>
                  {results.leads.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => { onNavigate('leads'); onClose(); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginBottom: '6px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.subtitle} • {item.meta}</div>
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Companies */}
              {results.companies.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={13} /> COMPANIES
                  </div>
                  {results.companies.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => { onNavigate('companies'); onClose(); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginBottom: '6px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.subtitle} • {item.meta}</div>
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckSquare size={13} /> TASKS
                  </div>
                  {results.tasks.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => { onNavigate('tasks'); onClose(); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginBottom: '6px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.subtitle} • {item.meta}</div>
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Knowledge Base */}
              {results.documents.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={13} /> KNOWLEDGE BASE
                  </div>
                  {results.documents.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => { onNavigate('knowledge'); onClose(); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        marginBottom: '6px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.subtitle} • {item.meta}</div>
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
