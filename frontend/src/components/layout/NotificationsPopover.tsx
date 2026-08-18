import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { CheckCheck, Bell, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

interface NotificationsPopoverProps {
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ onClose, onNavigate }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useCRM();

  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      width: '360px',
      maxHeight: '480px',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={16} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>Notifications</span>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '10px',
            backgroundColor: 'var(--accent-blue)',
            color: '#FFFFFF'
          }}>
            {notifications.filter(n => !n.is_read).length} new
          </span>
        </div>

        <button
          onClick={markAllNotificationsRead}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '12px',
            color: 'var(--accent-blue)',
            cursor: 'pointer',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <CheckCheck size={14} />
          Mark all read
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No notifications available
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.action_link) {
                  const targetTab = notif.action_link.replace('/', '');
                  onNavigate(targetTab);
                  onClose();
                }
              }}
              style={{
                padding: '12px 16px',
                display: 'flex',
                gap: '12px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: notif.is_read ? 'transparent' : 'var(--primary-light)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {notif.type === 'alert' && <AlertTriangle size={16} color="#DC2626" />}
                {notif.type === 'warning' && <AlertTriangle size={16} color="#D97706" />}
                {notif.type === 'info' && <Info size={16} color="#2563EB" />}
                {notif.type === 'success' && <CheckCircle2 size={16} color="#059669" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{notif.title}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notif.timestamp}</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                  {notif.message}
                </p>
                {notif.action_label && (
                  <span style={{
                    display: 'inline-block',
                    marginTop: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'var(--accent-blue)'
                  }}>
                    {notif.action_label} →
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
