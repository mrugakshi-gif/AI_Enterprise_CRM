import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types/crm';
import { api } from '../services/api';
import { Users, Plus, Shield, Mail, CheckCircle2, Phone, Briefcase } from 'lucide-react';

export const UsersTeamsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'SALES_EXECUTIVE',
    department: 'Sales',
    team: 'Enterprise Sales',
    phone: '+91 98200 99999'
  });

  useEffect(() => {
    api.getUsers().then(setUsers).catch(console.error);
    api.getTeams().then(setTeams).catch(() => {
      setTeams([
        { id: "team-1", name: "Executive Leadership", manager: "Kabir Mehta", members_count: 3, department: "Management" },
        { id: "team-2", name: "Enterprise Sales", manager: "Priya Patil", members_count: 5, department: "Sales" },
        { id: "team-3", name: "Mid-Market Sales", manager: "Ananya Deshmukh", members_count: 5, department: "Sales" },
        { id: "team-4", name: "Solutions Engineering", manager: "Priya Patil", members_count: 3, department: "Technical Sales" },
        { id: "team-5", name: "Customer Success", manager: "Sneha Kulkarni", members_count: 4, department: "Customer Support" }
      ]);
    });
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as any,
        department: newUser.department,
        team: newUser.team,
        phone: newUser.phone
      });
      setUsers(prev => [...prev, created]);
      setModalOpen(false);
      setNewUser({ name: '', email: '', role: 'SALES_EXECUTIVE', department: 'Sales', team: 'Enterprise Sales', phone: '+91 98200 99999' });
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} color="var(--accent-blue)" /> Users & Teams Directory ({users.length} Active Members)
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Enterprise organization structure across 5 functional departments and 6 RBAC security tiers.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* 5 Enterprise Teams Grid */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
          Functional Teams ({teams.length})
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {teams.map(t => (
            <div key={t.id} className="card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{t.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{t.department}</div>
              <div style={{ marginTop: '10px', fontSize: '12.5px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Lead: <strong>{t.manager}</strong></span>
                <span className="badge badge-normal">{t.members_count} members</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
          Team Members Directory
        </h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>Team & Department</th>
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
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{u.phone || 'ID: ' + u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge badge-primary" style={{ fontWeight: 600 }}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{u.team || u.department}</td>
                  <td>
                    <span className="badge badge-low">{u.status}</span>
                  </td>
                  <td>{u.last_active}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Add Team Member</h2>
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  required
                  className="input-control"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>Email Address</label>
                <input
                  type="email"
                  required
                  className="input-control"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Role</label>
                  <select
                    className="input-control"
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SALES_MANAGER">SALES_MANAGER</option>
                    <option value="SALES_EXECUTIVE">SALES_EXECUTIVE</option>
                    <option value="SUPPORT_AGENT">SUPPORT_AGENT</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Team</label>
                  <select
                    className="input-control"
                    value={newUser.team}
                    onChange={e => setNewUser({ ...newUser, team: e.target.value })}
                  >
                    <option value="Enterprise Sales">Enterprise Sales</option>
                    <option value="Mid-Market Sales">Mid-Market Sales</option>
                    <option value="Solutions Engineering">Solutions Engineering</option>
                    <option value="Customer Success">Customer Success</option>
                    <option value="Executive Leadership">Executive Leadership</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
