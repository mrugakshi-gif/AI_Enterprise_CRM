import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Contact } from '../types/crm';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Plus, Search, Mail, Phone, MapPin, Building2, UserSquare2, 
  Bot, Download, RefreshCw 
} from 'lucide-react';
import { ContactDetailModal } from '../components/modals/ContactDetailModal';

export const ContactsPage: React.FC = () => {
  const { contacts, createContact, loading } = useCRM();
  const { canManageContacts } = usePermissions();
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
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.designation && c.designation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createContact(formData);
    setModalOpen(false);
    setFormData({ name: '', company: '', designation: '', email: '', phone: '+91 ', city: 'Mumbai', state: 'Maharashtra', owner: 'Amit Sharma' });
  };

  const exportContactsCSV = () => {
    const headers = "ID,Name,Company,Designation,Email,Phone,City,State,Owner,Last Contact\n";
    const rows = filteredContacts.map(c => 
      `"${c.id}","${c.name}","${c.company}","${c.designation}","${c.email}","${c.phone}","${c.city}","${c.state}","${c.owner}","${c.last_contact}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
          <button onClick={exportContactsCSV} className="btn btn-secondary" title="Export contacts to CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          {canManageContacts && (
            <button onClick={() => setModalOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Add Contact</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
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
      {loading ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p>Loading customer contacts...</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No contacts found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Try adjusting your search query.</p>
        </div>
      ) : (
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
                <th>Account Owner</th>
                <th>Last Contact</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map(con => (
                <tr key={con.id} onClick={() => setSelectedContact(con)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={con.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                        alt={con.name}
                        style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: 700 }}>{con.name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{con.company}</td>
                  <td>{con.designation}</td>
                  <td>{con.email}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{con.phone}</td>
                  <td>{con.city}</td>
                  <td>{con.owner}</td>
                  <td><span className="badge badge-neutral">{con.last_contact}</span></td>
                  <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedContact(con)}>
                      Inspect 360
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Contact Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add Customer Contact</h3>
              <button onClick={() => setModalOpen(false)} className="btn-ghost btn-icon">✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                <input required className="input-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Company</label>
                  <input required className="input-control" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Designation</label>
                  <input required className="input-control" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
                  <input required type="email" className="input-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone</label>
                  <input required className="input-control" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact 360 Detail Modal */}
      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  );
};
