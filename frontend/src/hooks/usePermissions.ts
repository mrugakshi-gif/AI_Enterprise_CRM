import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/crm';

export interface Permissions {
  canManageLeads: boolean;
  canManageDeals: boolean;
  canManageTasks: boolean;
  canManageCompanies: boolean;
  canManageContacts: boolean;
  canManageKnowledgeBase: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
  canEditSettings: boolean;
  canViewReports: boolean;
  canViewAnalytics: boolean;
  canUseAIAssistant: boolean;
  canConvertLeads: boolean;
  canDeleteRecords: boolean;
}

export const usePermissions = (): Permissions & { role: UserRole } => {
  const { role } = useAuth();

  switch (role) {
    case 'ADMIN':
      return {
        role,
        canManageLeads: true,
        canManageDeals: true,
        canManageTasks: true,
        canManageCompanies: true,
        canManageContacts: true,
        canManageKnowledgeBase: true,
        canManageUsers: true,
        canViewAuditLogs: true,
        canEditSettings: true,
        canViewReports: true,
        canViewAnalytics: true,
        canUseAIAssistant: true,
        canConvertLeads: true,
        canDeleteRecords: true,
      };

    case 'SALES_MANAGER':
      return {
        role,
        canManageLeads: true,
        canManageDeals: true,
        canManageTasks: true,
        canManageCompanies: true,
        canManageContacts: true,
        canManageKnowledgeBase: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canEditSettings: false,
        canViewReports: true,
        canViewAnalytics: true,
        canUseAIAssistant: true,
        canConvertLeads: true,
        canDeleteRecords: false,
      };

    case 'SALES_EXECUTIVE':
      return {
        role,
        canManageLeads: true,
        canManageDeals: true,
        canManageTasks: true,
        canManageCompanies: false,
        canManageContacts: true,
        canManageKnowledgeBase: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canEditSettings: false,
        canViewReports: false,
        canViewAnalytics: false,
        canUseAIAssistant: true,
        canConvertLeads: true,
        canDeleteRecords: false,
      };

    case 'SUPPORT_AGENT':
      return {
        role,
        canManageLeads: false,
        canManageDeals: false,
        canManageTasks: true,
        canManageCompanies: false,
        canManageContacts: false,
        canManageKnowledgeBase: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canEditSettings: false,
        canViewReports: false,
        canViewAnalytics: false,
        canUseAIAssistant: true,
        canConvertLeads: false,
        canDeleteRecords: false,
      };

    default:
      return {
        role: 'ADMIN',
        canManageLeads: true,
        canManageDeals: true,
        canManageTasks: true,
        canManageCompanies: true,
        canManageContacts: true,
        canManageKnowledgeBase: true,
        canManageUsers: true,
        canViewAuditLogs: true,
        canEditSettings: true,
        canViewReports: true,
        canViewAnalytics: true,
        canUseAIAssistant: true,
        canConvertLeads: true,
        canDeleteRecords: true,
      };
  }
};
