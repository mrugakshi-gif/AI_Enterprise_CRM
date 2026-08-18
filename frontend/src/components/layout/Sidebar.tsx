import React from 'react';
import { 
  LayoutDashboard, Users, UserSquare2, Building2, KanbanSquare, 
  Activity, CheckSquare, Calendar, BarChart3, Sparkles, FileText, 
  BookOpen, Bot, ShieldAlert, KeyRound, History, Settings, 
  HelpCircle, ChevronLeft, ChevronRight, Moon, Sun, LogOut, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCRM } from '../../context/CRMContext';
import { UserRole } from '../../types/crm';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  perm: boolean;
  badge?: string | number;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { user, role, switchRole, logout, hasPermission } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { tasks, aiInsights, documents } = useCRM();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const pendingTasksCount = tasks.filter(t => t.status !== 'Done').length;

  const navSections: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: true },
        { id: 'leads', label: 'Leads', icon: Users, perm: hasPermission('manage_leads') || hasPermission('view_assigned_leads') },
        { id: 'contacts', label: 'Contacts', icon: UserSquare2, perm: hasPermission('view_contacts') || hasPermission('manage_contacts') },
        { id: 'companies', label: 'Companies', icon: Building2, perm: hasPermission('view_companies') || hasPermission('manage_companies') },
        { id: 'deals', label: 'Deals', icon: KanbanSquare, perm: hasPermission('manage_deals') || hasPermission('manage_assigned_deals') },
        { id: 'activities', label: 'Activities', icon: Activity, perm: true },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined, perm: true },
        { id: 'calendar', label: 'Calendar', icon: Calendar, perm: true },
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3, perm: role !== 'SUPPORT_AGENT' },
        { id: 'ai-insights', label: 'AI Insights', icon: Sparkles, badge: 'AI', badgeColor: '#7C3AED', perm: true },
        { id: 'reports', label: 'Reports', icon: FileText, perm: role !== 'SUPPORT_AGENT' && role !== 'SALES_EXECUTIVE' },
      ]
    },
    {
      title: 'KNOWLEDGE',
      items: [
        { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, badge: documents.length, perm: true },
        { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, badge: 'Grounded', badgeColor: '#2563EB', perm: true },
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'users', label: 'Users & Teams', icon: Users, perm: role === 'ADMIN' || role === 'SALES_MANAGER' },
        { id: 'roles', label: 'Roles & Permissions', icon: KeyRound, perm: role === 'ADMIN' },
        { id: 'audit-logs', label: 'Audit Logs', icon: History, perm: role === 'ADMIN' },
        { id: 'settings', label: 'Settings', icon: Settings, perm: true },
      ]
    }
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileOpen(false);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 18px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div 
          onClick={() => handleNavClick('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0F172A 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '16px',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
          }}>
            N
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                NEXORA
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                ENTERPRISE CRM
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-ghost btn-icon"
          style={{ padding: '6px', display: 'flex' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <div style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
        {navSections.map(sec => {
          const visibleItems = sec.items.filter(item => item.perm);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sec.title} style={{ marginBottom: '20px' }}>
              {!collapsed && (
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  padding: '4px 12px 6px',
                  textTransform: 'uppercase'
                }}>
                  {sec.title}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const active = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'space-between',
                        padding: collapsed ? '10px 0' : '9px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: active ? (isDark ? '#1E293B' : '#F1F5F9') : 'transparent',
                        color: active ? (isDark ? '#FFFFFF' : '#0F172A') : 'var(--text-secondary)',
                        fontWeight: active ? 600 : 500,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                      title={collapsed ? item.label : undefined}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={18} color={active ? (isDark ? '#60A5FA' : '#2563EB') : 'currentColor'} />
                        {!collapsed && <span>{item.label}</span>}
                      </div>

                      {!collapsed && item.badge !== undefined && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: item.badgeColor ? item.badgeColor : 'var(--border-color)',
                          color: item.badgeColor ? '#FFFFFF' : 'var(--text-secondary)'
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Switcher & User Profile Footer */}
      <div style={{
        padding: '14px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)'
      }}>
        {/* Quick Role Switcher */}
        {!collapsed && (
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              ACTIVE ROLE (RBAC)
            </div>
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-muted)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <span>{role.replace('_', ' ')}</span>
              <ChevronDown size={14} />
            </button>

            {roleMenuOpen && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: '6px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                zIndex: 50
              }}>
                {(['ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'SUPPORT_AGENT'] as UserRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setRoleMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: r === role ? 700 : 500,
                      backgroundColor: r === role ? 'var(--primary-light)' : 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={user?.name || "User"}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            {!collapsed && (
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Kabir Mehta'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {user?.department || 'Executive'}
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={toggleTheme}
                className="btn-ghost btn-icon"
                style={{ padding: '6px' }}
                title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
              >
                {isDark ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} />}
              </button>
              <button
                onClick={logout}
                className="btn-ghost btn-icon"
                style={{ padding: '6px' }}
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
