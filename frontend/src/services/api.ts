import { 
  User, Lead, Contact, Company, Deal, Task, Activity, CalendarEvent, 
  DocumentItem, NotificationItem, AuditLogItem, DashboardData, AIInsightsData, ReportItem 
} from '../types/crm';

const API_BASE = '/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call to ${endpoint} failed, utilizing local state sync:`, err);
    throw err;
  }
}

export const api = {
  // Auth & RBAC
  login: (email: string, password: string, role_override?: string) => 
    fetchJSON<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role_override })
    }),
  
  switchRole: (user_id: string, role: string) =>
    fetchJSON<{ success: boolean; user: User }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ user_id, role })
    }),

  // Dashboard
  getDashboard: () => fetchJSON<DashboardData>('/crm/dashboard'),

  // Leads
  getLeads: () => fetchJSON<Lead[]>('/crm/leads'),
  getLeadById: (id: string) => fetchJSON<Lead>(`/crm/leads/${id}`),
  getLeadDetail: (id: string) => fetchJSON<any>(`/crm/leads/${id}/detail`),
  createLead: (data: Partial<Lead>) => fetchJSON<Lead>('/crm/leads', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateLead: (id: string, updates: Partial<Lead>) => fetchJSON<Lead>(`/crm/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteLead: (id: string) => fetchJSON<{ success: boolean }>(`/crm/leads/${id}`, { method: 'DELETE' }),
  convertLead: (id: string, payload: any) => fetchJSON<{ success: boolean; contact: Contact; company: Company; deal: Deal }>(`/crm/leads/${id}/convert`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Contacts
  getContacts: () => fetchJSON<Contact[]>('/crm/contacts'),
  getContactById: (id: string) => fetchJSON<Contact>(`/crm/contacts/${id}`),
  getContact360: (id: string) => fetchJSON<any>(`/crm/contacts/${id}/360`),
  createContact: (data: Partial<Contact>) => fetchJSON<Contact>('/crm/contacts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Companies
  getCompanies: () => fetchJSON<Company[]>('/crm/companies'),
  getCompanyById: (id: string) => fetchJSON<Company>(`/crm/companies/${id}`),
  getCompany360: (id: string) => fetchJSON<any>(`/crm/companies/${id}/360`),
  createCompany: (data: Partial<Company>) => fetchJSON<Company>('/crm/companies', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Deals
  getDeals: () => fetchJSON<Deal[]>('/crm/deals'),
  getDealById: (id: string) => fetchJSON<Deal>(`/crm/deals/${id}`),
  getDealDetail: (id: string) => fetchJSON<any>(`/crm/deals/${id}/detail`),
  createDeal: (data: Partial<Deal>) => fetchJSON<Deal>('/crm/deals', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateDeal: (id: string, updates: Partial<Deal>) => fetchJSON<Deal>(`/crm/deals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteDeal: (id: string) => fetchJSON<{ success: boolean }>(`/crm/deals/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => fetchJSON<Task[]>('/crm/tasks'),
  createTask: (data: Partial<Task>) => fetchJSON<Task>('/crm/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTask: (id: string, updates: Partial<Task>) => fetchJSON<Task>(`/crm/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteTask: (id: string) => fetchJSON<{ success: boolean }>(`/crm/tasks/${id}`, { method: 'DELETE' }),

  // Activities
  getActivities: () => fetchJSON<Activity[]>('/crm/activities'),
  logActivity: (data: Partial<Activity>) => fetchJSON<Activity>('/crm/activities', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Calendar
  getEvents: () => fetchJSON<CalendarEvent[]>('/crm/events'),
  createEvent: (data: Partial<CalendarEvent>) => fetchJSON<CalendarEvent>('/crm/events', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Knowledge Base (RAG)
  getDocuments: () => fetchJSON<DocumentItem[]>('/knowledge/documents'),
  getDocumentChunks: (id: string) => fetchJSON<{ document_name: string; category: string; chunks_count: number; chunks: any[] }>(`/knowledge/documents/${id}/chunks`),
  uploadDocument: (name: string, category: string, uploaded_by: string, content?: string) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('uploaded_by', uploaded_by);
    if (content) formData.append('content', content);
    return fetch(`${API_BASE}/knowledge/upload`, {
      method: 'POST',
      body: formData
    }).then(r => r.json());
  },
  deleteDocument: (id: string) => fetchJSON<{ success: boolean }>(`/knowledge/documents/${id}`, { method: 'DELETE' }),

  // AI Assistant & Predictions
  chatAI: (query: string, user_role: string = 'ADMIN') => fetchJSON<any>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ query, user_role })
  }),
  getAIInsights: () => fetchJSON<AIInsightsData>('/ai/insights'),
  generateEmail: (recipient_name: string, company_name: string, purpose: string, context?: string) =>
    fetchJSON<{ subject: string; body: string }>('/ai/generate-email', {
      method: 'POST',
      body: JSON.stringify({ recipient_name, company_name, purpose, context })
    }),

  // Reports
  getReports: () => fetchJSON<ReportItem[]>('/reports/list'),
  exportReport: (id: string) => fetchJSON<{ filename: string; content: string }>(`/reports/export/${id}`),

  // Admin & System
  getUsers: () => fetchJSON<User[]>('/admin/users'),
  getPermissions: () => fetchJSON<any>('/admin/permissions'),
  getAuditLogs: () => fetchJSON<AuditLogItem[]>('/admin/audit-logs'),
  getNotifications: () => fetchJSON<NotificationItem[]>('/admin/notifications'),
  markNotificationRead: (id: string) => fetchJSON<{ success: boolean }>(`/admin/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => fetchJSON<{ success: boolean }>('/admin/notifications/mark-all-read', { method: 'POST' }),
  getSettings: () => fetchJSON<any>('/admin/settings'),
  updateSettings: (updates: any) => fetchJSON<any>('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  globalSearch: (q: string) => fetchJSON<any>(`/admin/search?q=${encodeURIComponent(q)}`)
};
