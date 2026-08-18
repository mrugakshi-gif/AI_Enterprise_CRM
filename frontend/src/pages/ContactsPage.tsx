import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Contact } from '../types/crm';
import { Plus, Search, Mail, Phone, MapPin, Building2, UserSquare2, Bot } from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const { contacts, createContact } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    designation: '',
    email: '',
    phone: '+91 ',
    city: 'Mumbai',
    state: 'Maharashtra',
    owner: 'Amit Sharma'
  });

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createContact(formData);
    setModalOpen(false);
    setFormData({ name: '', company: '', designation: '', email: '', phone: '+91 ', city: 'Mumbai', state: 'Maharashtra', owner: 'Amit Sharma' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Customer Contacts
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Directory of verified decision makers, CTOs, VPs, and enterprise stakeholders across India.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            placeholder="Search contacts, company, email..."
            className="input-control"
            style={{ paddingLeft: '32px', fontSize: '13px' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Contact Name</th>
              <th>Company</th>
              <th>Designation</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Owner</th>
              <th>Last Contact</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(con => (
              <tr key={con.id} onClick={() => setSelectedContact(con)} style={{ cursor: 'pointer' }}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={con.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={con.name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontWeight: 700 }}>{con.name}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>{con.company}</td>
                <td>{con.designation}</td>
                <td>{con.email}</td>
                <td>{con.phone}</td>
                <td>{con.city}, {con.state}</td>
                <td>{con.owner}</td>
                <td>{con.last_contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedContact && (
        <div className="modal-overlay" onClick={() => setSelectedContact(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img
                  src={selectedContact.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={selectedContact.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{selectedContact.name}</h2>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedContact.designation} at {selectedContact.company}</div>
                </div>
              </div>
              <button onClick={() => setSelectedContact(null)} className="btn-ghost btn-icon">✕</button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-muted)',
                fontSize: '13px',
                lineHeight: 1.4
              }}>
                🤖 <strong>AI Relationship Summary:</strong> {selectedContact.ai_summary || 'High value decision maker involved in active pipeline opportunities.'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <strong>{selectedContact.email}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <strong>{selectedContact.phone}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Location:</span> <strong>{selectedContact.city}, {selectedContact.state}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Account Owner:</span> <strong>{selectedContact.owner}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add Customer Contact</h3>
              <button onClick={() => setModalOpen(false)} className="btn-ghost btn-icon">✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input required placeholder="Full Name *" className="input-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <input required placeholder="Company *" className="input-control" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
              <input required placeholder="Designation / Role *" className="input-control" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
              <input required type="email" placeholder="Email Address *" className="input-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              <input required placeholder="Phone (+91 XXXXX XXXXX) *" className="input-control" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input placeholder="City" className="input-control" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                <input placeholder="State" className="input-control" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
