import React, { useState } from 'react';
import { X, Plus, Users, KanbanSquare, CheckSquare, Building2, BookOpen } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { LeadStatus, DealStage, TaskStatus, Priority } from '../../types/crm';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'lead' | 'deal' | 'task' | 'company' | 'document';
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'lead'
}) => {
  const { createLead, createDeal, createTask, createCompany, uploadDocument } = useCRM();
  const [activeTab, setActiveTab] = useState<'lead' | 'deal' | 'task' | 'company' | 'document'>(defaultType);

  // Form states
  const [leadData, setLeadData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '+91 ',
    company: '',
    job_title: '',
    industry: 'IT Services',
    city: 'Mumbai',
    state: 'Maharashtra',
    source: 'Website',
    lead_value: 350000,
    assigned_to: 'Amit Sharma',
    notes: ''
  });

  const [dealData, setDealData] = useState({
    deal_name: '',
    company_name: '',
    deal_value: 400000,
    stage: 'Contacted' as DealStage,
    expected_close_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' '),
    owner: 'Amit Sharma',
    priority: 'Normal' as Priority,
    description: ''
  });

  const [taskData, setTaskData] = useState({
    title: '',
    customer_name: '',
    priority: 'Normal' as Priority,
    status: 'In progress' as TaskStatus,
    due_date: new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' '),
    assigned_to: 'Amit Sharma',
    description: ''
  });

  const [companyData, setCompanyData] = useState({
    name: '',
    industry: 'IT Services',
    city: 'Bengaluru',
    state: 'Karnataka',
    gstin: '29ABCDE1234F1Z5',
    pan: 'ABCDE1234F',
    total_revenue: 500000
  });

  const [docData, setDocData] = useState({
    name: '',
    category: 'Sales',
    content: ''
  });

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (activeTab === 'lead') {
        await createLead({
          ...leadData,
          status: 'New'
        });
      } else if (activeTab === 'deal') {
        await createDeal(dealData);
      } else if (activeTab === 'task') {
        await createTask(taskData);
      } else if (activeTab === 'company') {
        await createCompany(companyData);
      } else if (activeTab === 'document') {
        await uploadDocument(
          docData.name.endsWith('.pdf') ? docData.name : `${docData.name}.pdf`,
          docData.category,
          'Admin',
          docData.content
        );
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        style={{ maxWidth: '640px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Quick Create</h3>
          <button onClick={onClose} className="btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '12px 24px',
          backgroundColor: 'var(--bg-muted)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {[
            { id: 'lead', label: 'Lead', icon: Users },
            { id: 'deal', label: 'Deal', icon: KanbanSquare },
            { id: 'task', label: 'Task', icon: CheckSquare },
            { id: 'company', label: 'Company', icon: Building2 },
            { id: 'document', label: 'Doc / RAG', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: active ? 'var(--bg-card)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: active ? 'var(--shadow-xs)' : 'none'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {activeTab === 'lead' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>First Name *</label>
                <input
                  required
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  placeholder="e.g. Rahul"
                  value={leadData.first_name}
                  onChange={e => setLeadData({ ...leadData, first_name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Name *</label>
                <input
                  required
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  placeholder="e.g. Sharma"
                  value={leadData.last_name}
                  onChange={e => setLeadData({ ...leadData, last_name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email *</label>
                <input
                  required
                  type="email"
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  placeholder="rahul@company.in"
                  value={leadData.email}
                  onChange={e => setLeadData({ ...leadData, email: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone (Indian) *</label>
                <input
                  required
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  placeholder="+91 98765 43210"
                  value={leadData.phone}
                  onChange={e => setLeadData({ ...leadData, phone: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Company *</label>
                <input
                  required
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  placeholder="TechNova Solutions"
                  value={leadData.company}
                  onChange={e => setLeadData({ ...leadData, company: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Estimated Value (₹) *</label>
                <input
                  required
                  type="number"
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={leadData.lead_value}
                  onChange={e => setLeadData({ ...leadData, lead_value: Number(e.target.value) })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>City</label>
                <input
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  placeholder="Mumbai"
                  value={leadData.city}
                  onChange={e => setLeadData({ ...leadData, city: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Lead Source</label>
                <select
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={leadData.source}
                  onChange={e => setLeadData({ ...leadData, source: e.target.value })}
                >
                  <option value="Website">Website</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Referral">Referral</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Partner">Partner</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'deal' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Deal Name *</label>
                <input
                  required
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  placeholder="Enterprise CRM Implementation"
                  value={dealData.deal_name}
                  onChange={e => setDealData({ ...dealData, deal_name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Company *</label>
                <input
                  required
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  placeholder="TechNova Solutions"
                  value={dealData.company_name}
                  onChange={e => setDealData({ ...dealData, company_name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Deal Value (₹ INR) *</label>
                <input
                  required
                  type="number"
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={dealData.deal_value}
                  onChange={e => setDealData({ ...dealData, deal_value: Number(e.target.value) })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Stage</label>
                <select
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={dealData.stage}
                  onChange={e => setDealData({ ...dealData, stage: e.target.value as DealStage })}
                >
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Deal Closed">Deal Closed</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Owner</label>
                <input
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={dealData.owner}
                  onChange={e => setDealData({ ...dealData, owner: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'task' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Task Title *</label>
                <input
                  required
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  placeholder="e.g. Follow up with TechNova on contract SLA"
                  value={taskData.title}
                  onChange={e => setTaskData({ ...taskData, title: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Client / Company *</label>
                <input
                  required
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  placeholder="TechNova Solutions"
                  value={taskData.customer_name}
                  onChange={e => setTaskData({ ...taskData, customer_name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Priority</label>
                <select
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={taskData.priority}
                  onChange={e => setTaskData({ ...taskData, priority: e.target.value as Priority })}
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Due Date</label>
                <input
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={taskData.due_date}
                  onChange={e => setTaskData({ ...taskData, due_date: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Assignee</label>
                <input
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={taskData.assigned_to}
                  onChange={e => setTaskData({ ...taskData, assigned_to: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Company Name *</label>
                <input
                  required
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  placeholder="e.g. GreenGrid Energy Solutions"
                  value={companyData.name}
                  onChange={e => setCompanyData({ ...companyData, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Industry</label>
                <input
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={companyData.industry}
                  onChange={e => setCompanyData({ ...companyData, industry: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>GSTIN (India)</label>
                <input
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={companyData.gstin}
                  onChange={e => setCompanyData({ ...companyData, gstin: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>City</label>
                <input
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={companyData.city}
                  onChange={e => setCompanyData({ ...companyData, city: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>State</label>
                <input
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={companyData.state}
                  onChange={e => setCompanyData({ ...companyData, state: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === 'document' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Document Title *</label>
                <input
                  required
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  placeholder="e.g. Enterprise Service Level Agreement 2026.pdf"
                  value={docData.name}
                  onChange={e => setDocData({ ...docData, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
                <select
                  className="input-control"
                  style={{ marginTop: '4px' }}
                  value={docData.category}
                  onChange={e => setDocData({ ...docData, category: e.target.value })}
                >
                  <option value="Sales">Sales Policy</option>
                  <option value="Support">Customer Support & SLA</option>
                  <option value="Operations">Operations & Compliance</option>
                  <option value="Legal">Legal & KYC</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Document Content / Policy Text (for RAG Vectorization) *</label>
                <textarea
                  required
                  className="input-control"
                  style={{ marginTop: '4px', minHeight: '90px', resize: 'vertical' }}
                  placeholder="Enter policy terms, discount guidelines, SLA requirements, or product features to be indexed into the AI Knowledge Assistant..."
                  value={docData.content}
                  onChange={e => setDocData({ ...docData, content: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <Plus size={16} />
              <span>{submitting ? 'Creating...' : `Create ${activeTab.toUpperCase()}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
