import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { DocumentItem } from '../types/crm';
import { usePermissions } from '../hooks/usePermissions';
import { 
  FileText, Upload, Plus, CheckCircle2, Search, Trash2, 
  Eye, Sparkles, Layers, ShieldCheck, ArrowRight, BookOpen,
  Clock, RefreshCw, X, Database
} from 'lucide-react';
import { api } from '../services/api';

export const KnowledgeBasePage: React.FC = () => {
  const { documents, uploadDocument, deleteDocument, loading } = useCRM();
  const { canManageKnowledgeBase, canDeleteRecords } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocChunks, setSelectedDocChunks] = useState<{ name: string; category?: string; chunks: any[] } | null>(null);
  
  // Pipeline Stepper Simulation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'Sales',
    content: ''
  });

  const pipelineSteps = [
    "Uploading Document Buffer",
    "Extracting Text & Metadata",
    "Recursive Semantic Chunking",
    "Generating Vector Embeddings",
    "Indexing in RAG Store",
    "Vector Store Ready ✓"
  ];

  const filteredDocs = documents.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name) return;
    setIsProcessing(true);
    setCurrentStep(0);

    for (let step = 0; step < pipelineSteps.length; step++) {
      setCurrentStep(step);
      await new Promise(r => setTimeout(r, 350));
    }

    await uploadDocument(
      uploadForm.name.endsWith('.pdf') ? uploadForm.name : `${uploadForm.name}.pdf`,
      uploadForm.category,
      'Admin',
      uploadForm.content
    );

    setIsProcessing(false);
    setUploadModalOpen(false);
    setUploadForm({ name: '', category: 'Sales', content: '' });
  };

  const handleViewChunks = async (doc: DocumentItem) => {
    try {
      const data = await api.getDocumentChunks(doc.id);
      setSelectedDocChunks({ name: doc.name, category: doc.category, chunks: data.chunks || [] });
    } catch (e) {
      setSelectedDocChunks({ name: doc.name, category: doc.category, chunks: doc.chunks || [] });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Company Knowledge Base (RAG)
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Upload and manage internal enterprise documentation, pricing matrices, SLAs, and KYC policies used by the AI assistant.
          </p>
        </div>

        {canManageKnowledgeBase && (
          <button onClick={() => setUploadModalOpen(true)} className="btn btn-primary">
            <Upload size={16} />
            <span>Upload & Vectorize Document</span>
          </button>
        )}
      </div>

      {/* RAG Pipeline Explainer Banner */}
      <div className="card" style={{
        padding: '18px 24px',
        backgroundColor: 'var(--bg-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Database size={24} color="var(--accent-blue)" />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Active RAG Vector Store</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              {documents.reduce((acc, d) => acc + (d.chunks_count || 0), 0)} indexed text chunks • In-Memory TF-IDF & Cosine Similarity Embeddings
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-low">Vector Store Active</span>
          <span className="badge badge-neutral">Top-K: 3</span>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <input
            type="text"
            placeholder="Search documents by title or category..."
            className="input-control"
            style={{ paddingLeft: '32px', fontSize: '13px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p>Loading knowledge documents...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No documents found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Upload a policy or sales document to populate the knowledge base.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="card"
              style={{
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--accent-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={20} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{doc.name}</h3>
                    <span className="badge badge-low">{doc.status || "Indexed ✓"}</span>
                    <span className="badge badge-neutral">{doc.category}</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    {doc.content_summary || "Internal enterprise operating guideline for staff and sales execution."}
                  </p>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                    <span>Uploaded by: <strong>{doc.uploaded_by}</strong> ({doc.upload_date})</span>
                    <span>Size: {doc.file_size}</span>
                    <span>Vector Chunks: <strong>{doc.chunks_count}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleViewChunks(doc)}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <Eye size={13} />
                  <span>Inspect Chunks</span>
                </button>
                {canDeleteRecords && (
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--accent-rose)' }}
                    title="Remove from knowledge base"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} color="var(--accent-blue)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Upload & Vectorize Document</h3>
              </div>
              <button onClick={() => setUploadModalOpen(false)} className="btn btn-ghost btn-icon" disabled={isProcessing}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isProcessing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 0' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>
                    Document Vectorization Pipeline
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pipelineSteps.map((step, idx) => {
                      const isDone = idx < currentStep;
                      const isCurrent = idx === currentStep;
                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: isCurrent ? 'rgba(37, 99, 235, 0.08)' : (isDone ? 'rgba(5, 150, 105, 0.08)' : 'var(--bg-muted)'),
                            border: isCurrent ? '1px solid var(--accent-blue)' : '1px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '13px'
                          }}
                        >
                          {isDone ? (
                            <CheckCircle2 size={16} color="var(--accent-emerald)" />
                          ) : isCurrent ? (
                            <RefreshCw size={16} color="var(--accent-blue)" style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--text-muted)' }} />
                          )}
                          <span style={{ fontWeight: isCurrent ? 700 : (isDone ? 600 : 400), color: isCurrent ? 'var(--accent-blue)' : (isDone ? 'var(--text-primary)' : 'var(--text-muted)') }}>
                            Step {idx + 1}: {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Document Title</label>
                    <input
                      required
                      className="input-control"
                      placeholder="e.g. Enterprise Security Policy & SOC2 Guidelines"
                      value={uploadForm.name}
                      onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                      style={{ marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Category</label>
                    <select
                      className="input-control"
                      value={uploadForm.category}
                      onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
                      style={{ marginTop: '4px' }}
                    >
                      <option value="Sales">Sales & Pricing</option>
                      <option value="Support">Support & SLA</option>
                      <option value="Operations">Operations & KYC</option>
                      <option value="Legal">Legal & Compliance</option>
                      <option value="Engineering">Engineering & APIs</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600 }}>Document Content / Text</label>
                    <textarea
                      required
                      rows={5}
                      className="input-control"
                      placeholder="Paste the document text to be chunked, embedded, and indexed into the RAG vector store..."
                      value={uploadForm.content}
                      onChange={e => setUploadForm({ ...uploadForm, content: e.target.value })}
                      style={{ marginTop: '4px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                    <button type="button" onClick={() => setUploadModalOpen(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Run Ingestion & Vectorize
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Chunk Viewer Modal */}
      {selectedDocChunks && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{selectedDocChunks.name}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  {selectedDocChunks.chunks.length} vectorized chunks in RAG embedding space
                </p>
              </div>
              <button onClick={() => setSelectedDocChunks(null)} className="btn btn-ghost btn-icon">
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px', maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {selectedDocChunks.chunks.map((chunk, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-muted)',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    lineHeight: 1.6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    <span>Chunk #{i + 1} (Page {chunk.page_number || 1})</span>
                    <span>Tokens: {chunk.token_count || 45}</span>
                  </div>
                  <p style={{ color: 'var(--text-primary)' }}>{chunk.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
