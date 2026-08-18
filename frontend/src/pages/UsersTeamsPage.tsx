import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types/crm';
import { api } from '../services/api';
import { Users, Plus, Shield, Mail, CheckCircle2 } from 'lucide-react';

export const UsersTeamsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'SALES_EXECUTIVE',
    department: 'Sales'
  });

  useEffect(() => {
    api.getUsers().then(setUsers).catch(console.error);
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await api.getUsers(); // sync
    const createdUser: User = {
      id: `usr-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as any,
      department: newUser.department,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      status: "Active",
      last_active: "Just now"
    };
    setUsers(prev => [...prev, createdUser]);
    setModalOpen(false);
    setNewUser({ name: '', email: '', role: 'SALES_EXECUTIVE', department: 'Sales' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Users & Teams Directory
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Manage Indian enterprise team members, departments, access credentials, and active presence.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Team Member</span>
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email</th>
              <th>Assigned Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={u.avatar}
                      alt={u.name}
                      style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>ID: {u.id}</div>
                    </div>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className="badge badge-primary" style={{ fontWeight: 600 }}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td>{u.department}</td>
                <td>
                  <span className="badge badge-low">{u.status}</span>
                </td>
                <td>{u.last_active}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add Team Member</h3>
              <button onClick={() => setModalOpen(false)} className="btn-ghost btn-icon">✕</button>
            </div>
            <form onSubmit={handleAddUser} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input required placeholder="Full Name *" className="input-control" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
              <input required type="email" placeholder="Work Email *" className="input-control" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
              <select className="input-control" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                <option value="ADMIN">System Admin</option>
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="SALES_EXECUTIVE">Sales Executive</option>
                <option value="SUPPORT_AGENT">Customer Support Agent</option>
              </select>
              <input placeholder="Department (e.g. Sales)" className="input-control" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
