import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { DocumentItem } from '../types/crm';
import { 
  FileText, Upload, Plus, CheckCircle2, Search, Trash2, 
  Eye, Sparkles, Layers, ShieldCheck, ArrowRight, BookOpen
} from 'lucide-react';
import { api } from '../services/api';

export const KnowledgeBasePage: React.FC = () => {
  const { documents, uploadDocument, deleteDocument } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocChunks, setSelectedDocChunks] = useState<{ name: string; chunks: any[] } | null>(null);
  
  // Pipeline Stepper Simulation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'Sales',
    content: ''
  });

  const pipelineSteps = [
    "Uploading Document",
    "Extracting Text Content",
    "Recursive Semantic Chunking",
    "Generating Vector Embeddings",
    "Indexing in Vector Store",
    "Completed ✓"
  ];

  const filteredDocs = documents.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setCurrentStep(0);

    for (let step = 0; step < pipelineSteps.length; step++) {
      setCurrentStep(step);
      await new Promise(r => setTimeout(r, 400));
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
      setSelectedDocChunks({ name: doc.name, chunks: data.chunks || [] });
    } catch (e) {
      setSelectedDocChunks({ name: doc.name, chunks: doc.chunks || [] });
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

        <button onClick={() => setUploadModalOpen(true)} className="btn btn-primary">
          <Upload size={16} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* RAG Pipeline Explainer Banner */}
      <div className="card" style={{
        padding: '18px 24px',
        backgroundColor: 'var(--bg-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>RAG Document Processing Architecture</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Document Text → Semantic Chunking → Vector Embeddings → Cosine Similarity Index → Grounded Citations
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-card)' }}>PDF</span>
          <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-card)' }}>DOCX</span>
          <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-card)' }}>TXT</span>
          <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-card)' }}>CSV</span>
        </div>
      </div>

      {/* Documents Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Category</th>
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Chunks Vectorized</th>
              <th>Size</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map(doc => (
              <tr key={doc.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--primary-light)' }}>
                      <FileText size={16} color="var(--accent-blue)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{doc.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{doc.content_summary}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-neutral">{doc.category}</span>
                </td>
                <td>{doc.uploaded_by}</td>
                <td>{doc.upload_date}</td>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>
                    {doc.chunks_count} chunks
                  </span>
                </td>
                <td>{doc.file_size}</td>
                <td>
                  <span className="badge badge-low" style={{ fontWeight: 600 }}>
                    {doc.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleViewChunks(doc)}
                      className="btn btn-secondary btn-sm"
                      title="Inspect vector chunks"
                    >
                      <Eye size={13} />
                      <span>Chunks</span>
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="btn-ghost btn-icon"
                      style={{ color: '#EF4444' }}
                      title="Delete document"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload & Pipeline Processing Modal */}
      {uploadModalOpen && (
        <div className="modal-overlay" onClick={() => !isProcessing && setUploadModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Upload Knowledge Base Document</h3>
              {!isProcessing && (
                <button onClick={() => setUploadModalOpen(false)} className="btn-ghost btn-icon">✕</button>
              )}
            </div>

            {isProcessing ? (
              /* Visual Pipeline Stepper */
              <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, textAlign: 'center' }}>
                  Processing & Vectorizing Document into RAG Engine...
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pipelineSteps.map((step, idx) => {
                    const isDone = idx < currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div
                        key={step}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: isCurrent ? 'var(--primary-light)' : 'var(--bg-muted)',
                          border: isCurrent ? '1px solid var(--accent-blue)' : '1px solid transparent'
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={18} color="#10B981" />
                        ) : isCurrent ? (
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '2px solid var(--accent-blue)',
                            borderTopColor: 'transparent',
                            animation: 'spin 1s linear infinite'
                          }} />
                        ) : (
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--text-muted)' }} />
                        )}
                        <span style={{ fontSize: '13.5px', fontWeight: isCurrent ? 700 : 500 }}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Document Title *</label>
                  <input
                    required
                    placeholder="e.g. Enterprise Pricing & Discount Policy 2026.pdf"
                    className="input-control"
                    style={{ marginTop: '4px' }}
                    value={uploadForm.name}
                    onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
                  <select
                    className="input-control"
                    style={{ marginTop: '4px' }}
                    value={uploadForm.category}
                    onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
                  >
                    <option value="Sales">Sales & Pricing Policies</option>
                    <option value="Support">Customer Support & SLAs</option>
                    <option value="Operations">Operations & Indian KYC Checklist</option>
                    <option value="Compliance">GST & Tax Compliance</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Document Text Content (to be chunked & vectorized) *
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Paste official company terms, approved discount matrix, customer support SLA timelines, or refund rules for AI retrieval..."
                    className="input-control"
                    style={{ marginTop: '4px', resize: 'vertical' }}
                    value={uploadForm.content}
                    onChange={e => setUploadForm({ ...uploadForm, content: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setUploadModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Upload size={15} />
                    <span>Start RAG Indexing</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Chunk Viewer Modal */}
      {selectedDocChunks && (
        <div className="modal-overlay" onClick={() => setSelectedDocChunks(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Vectorized Chunks Inspector</h3>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{selectedDocChunks.name}</div>
              </div>
              <button onClick={() => setSelectedDocChunks(null)} className="btn-ghost btn-icon">✕</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
              {selectedDocChunks.chunks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No chunk details available.
                </div>
              ) : (
                selectedDocChunks.chunks.map((chunk, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-muted)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      <span><strong>Chunk #{idx + 1}</strong> ({chunk.chunk_id || `chk-${idx+1}`})</span>
                      <span>Page {chunk.page_number || 1} • {chunk.token_count || 45} tokens</span>
                    </div>
                    <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                      "{chunk.text}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
