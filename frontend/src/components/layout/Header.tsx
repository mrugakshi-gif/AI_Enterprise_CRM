import React, { useState } from 'react';
import { 
  Search, Bell, Plus, Menu, ChevronRight, HelpCircle, 
  Sparkles, CheckCircle2, ChevronDown, UserPlus, FileUp, Kanban
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCRM } from '../../context/CRMContext';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationsPopover } from './NotificationsPopover';
import { QuickCreateModal } from './QuickCreateModal';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  mobileOpen,
  setMobileOpen
}) => {
  const { user, role } = useAuth();
  const { unreadNotifsCount } = useCRM();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [createType, setCreateType] = useState<'lead' | 'deal' | 'task' | 'company' | 'document'>('lead');

  // Dynamic breadcrumb mapping
  const getBreadcrumb = () => {
    switch (currentTab) {
      case 'dashboard': return { category: 'Overview', title: 'Executive Dashboard' };
      case 'leads': return { category: 'Sales', title: 'Leads & Prospecting' };
      case 'contacts': return { category: 'Directory', title: 'Customer Contacts' };
      case 'companies': return { category: 'Accounts', title: 'Companies & Organizations' };
      case 'deals': return { category: 'Pipeline', title: 'Deals Kanban Board' };
      case 'activities': return { category: 'Operations', title: 'Activity Timeline' };
      case 'tasks': return { category: 'Tasks', title: 'Tasks report' };
      case 'calendar': return { category: 'Schedule', title: 'Meeting & Demo Calendar' };
      case 'analytics': return { category: 'Insights', title: 'Business Analytics' };
      case 'ai-insights': return { category: 'Intelligence', title: 'AI Business Intelligence' };
      case 'reports': return { category: 'Reports', title: 'Enterprise Reports' };
      case 'knowledge': return { category: 'RAG Knowledge', title: 'Company Knowledge Base' };
      case 'ai-assistant': return { category: 'Assistant', title: 'AI Knowledge Assistant' };
      case 'users': return { category: 'Admin', title: 'Users & Teams' };
      case 'roles': return { category: 'Admin', title: 'Roles & RBAC Matrix' };
      case 'audit-logs': return { category: 'Admin', title: 'Enterprise Audit Logs' };
      case 'settings': return { category: 'System', title: 'Company Settings' };
      default: return { category: 'CRM', title: 'Nexora Platform' };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <>
      <header className="header">
        {/* Left Section: Mobile Menu & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn-ghost btn-icon"
            style={{ display: 'none' }} // Visible on mobile via CSS
          >
            <Menu size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{breadcrumb.category}</span>
            <ChevronRight size={14} color="var(--text-muted)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{breadcrumb.title}</span>
          </div>
        </div>

        {/* Center Section: Global Search Bar */}
        <div style={{ flex: 1, maxWidth: '420px', margin: '0 24px' }}>
          <div
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '7px 12px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '13.5px',
              transition: 'border-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={16} />
              <span>Search across Nexora CRM...</span>
            </div>
            <kbd style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)'
            }}>
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section: Team Avatars, Notifications, Quick Create */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Team Member Avatars Stack (Reference Screenshot 2 style) */}
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '4px' }}>
            {[
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
              "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150"
            ].map((imgUrl, i) => (
              <img
                key={i}
                src={imgUrl}
                alt="Team"
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  border: '2px solid var(--bg-card)',
                  marginLeft: i === 0 ? 0 : '-8px',
                  objectFit: 'cover'
                }}
              />
            ))}
          </div>

          {/* Notifications Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifsOpen(!notifsOpen)}
              className="btn-ghost btn-icon"
              style={{ position: 'relative' }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotifsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#EF4444',
                  borderRadius: '50%',
                  border: '2px solid var(--bg-header)'
                }} />
              )}
            </button>

            {notifsOpen && (
              <NotificationsPopover
                onClose={() => setNotifsOpen(false)}
                onNavigate={setCurrentTab}
              />
            )}
          </div>

          {/* Global Create Button with dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Plus size={15} />
              <span>Create</span>
              <ChevronDown size={13} />
            </button>

            {createDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '190px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 60,
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {[
                  { type: 'lead', label: 'New Lead', icon: UserPlus },
                  { type: 'deal', label: 'New Deal', icon: Kanban },
                  { type: 'task', label: 'New Task', icon: CheckCircle2 },
                  { type: 'document', label: 'Upload Document', icon: FileUp }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => {
                        setCreateType(item.type as any);
                        setCreateDropdownOpen(false);
                        setCreateModalOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Icon size={15} color="var(--text-secondary)" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={setCurrentTab}
      />

      <QuickCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultType={createType}
      />
    </>
  );
};
