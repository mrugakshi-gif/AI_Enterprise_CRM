import { 
  User, Lead, Contact, Company, Deal, Task, Activity, CalendarEvent, 
  DocumentItem, NotificationItem, AuditLogItem, DashboardData, AIInsightsData, ReportItem 
} from '../types/crm';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const saved = localStorage.getItem('nexora_user');
  if (saved) {
    try {
      const u = JSON.parse(saved);
      return {
        'X-User-Id': u.id || 'usr-1',
        'X-User-Role': u.role || 'ADMIN'
      };
    } catch {
      // ignore
    }
  }
  return { 'X-User-Role': 'ADMIN', 'X-User-Id': 'usr-1' };
}

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const authHeaders = getAuthHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options?.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      throw new Error(errBody?.detail || `API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call to ${endpoint} failed:`, err);
    throw err;
  }
}

export const api = {
  // Auth & RBAC
  login: (email: string, password: string, role_override?: string) => 
    fetchJSON<{ success: boolean; token: string; user: User; permissions: string[] }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role_override })
    }),
  
  switchRole: (user_id: string, role: string) =>
    fetchJSON<{ success: boolean; user: User; permissions: string[] }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ user_id, role })
    }),

  getMe: () => fetchJSON<User>('/auth/me'),

  // Dashboard
  getDashboard: (params?: { time_range?: string; team?: string; salesperson?: string; industry?: string }) => {
    const query = new URLSearchParams();
    if (params?.time_range) query.append('time_range', params.time_range);
    if (params?.team && params.team !== 'All') query.append('team', params.team);
    if (params?.salesperson && params.salesperson !== 'All') query.append('salesperson', params.salesperson);
    if (params?.industry && params.industry !== 'All') query.append('industry', params.industry);
    const qs = query.toString();
    return fetchJSON<DashboardData>(`/crm/dashboard${qs ? `?${qs}` : ''}`);
  },

  // Leads with filtering
  getLeads: (params?: { status?: string; source?: string; owner?: string; min_score?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.source && params.source !== 'All') query.append('source', params.source);
    if (params?.owner && params.owner !== 'All') query.append('owner', params.owner);
    if (params?.min_score !== undefined) query.append('min_score', String(params.min_score));
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return fetchJSON<Lead[]>(`/crm/leads${qs ? `?${qs}` : ''}`);
  },
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

  // Contacts with filtering
  getContacts: (params?: { company?: string; owner?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.company && params.company !== 'All') query.append('company', params.company);
    if (params?.owner && params.owner !== 'All') query.append('owner', params.owner);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return fetchJSON<Contact[]>(`/crm/contacts${qs ? `?${qs}` : ''}`);
  },
  getContactById: (id: string) => fetchJSON<Contact>(`/crm/contacts/${id}`),
  getContact360: (id: string) => fetchJSON<any>(`/crm/contacts/${id}/360`),
  createContact: (data: Partial<Contact>) => fetchJSON<Contact>('/crm/contacts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Companies with filtering & Customer 360
  getCompanies: (params?: { industry?: string; owner?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.industry && params.industry !== 'All') query.append('industry', params.industry);
    if (params?.owner && params.owner !== 'All') query.append('owner', params.owner);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return fetchJSON<Company[]>(`/crm/companies${qs ? `?${qs}` : ''}`);
  },
  getCompanyById: (id: string) => fetchJSON<Company>(`/crm/companies/${id}`),
  getCompany360: (id: string) => fetchJSON<any>(`/crm/companies/${id}/360`),
  createCompany: (data: Partial<Company>) => fetchJSON<Company>('/crm/companies', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Deals with filtering
  getDeals: (params?: { stage?: string; owner?: string; priority?: string; min_value?: number; max_value?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.stage && params.stage !== 'All') query.append('stage', params.stage);
    if (params?.owner && params.owner !== 'All') query.append('owner', params.owner);
    if (params?.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params?.min_value !== undefined) query.append('min_value', String(params.min_value));
    if (params?.max_value !== undefined) query.append('max_value', String(params.max_value));
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return fetchJSON<Deal[]>(`/crm/deals${qs ? `?${qs}` : ''}`);
  },
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
  getTasks: (params?: { status?: string; assigned_to?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.assigned_to && params.assigned_to !== 'All') query.append('assigned_to', params.assigned_to);
    const qs = query.toString();
    return fetchJSON<Task[]>(`/crm/tasks${qs ? `?${qs}` : ''}`);
  },
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
  getActivities: (params?: { type?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'All') query.append('type', params.type);
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    return fetchJSON<Activity[]>(`/crm/activities${qs ? `?${qs}` : ''}`);
  },
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
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => fetchJSON<CalendarEvent>(`/crm/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteEvent: (id: string) => fetchJSON<{ success: boolean }>(`/crm/events/${id}`, { method: 'DELETE' }),

  // Knowledge Base (RAG)
  getDocuments: () => fetchJSON<DocumentItem[]>('/knowledge/documents'),
  getDocumentChunks: (id: string) => fetchJSON<{ document_name: string; category: string; chunks_count: number; chunks: any[] }>(`/knowledge/documents/${id}/chunks`),
  uploadDocument: (name: string, category: string, uploaded_by: string, content?: string, access_roles?: string) => {
    const authHeaders = getAuthHeaders();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('uploaded_by', uploaded_by);
    if (content) formData.append('content', content);
    if (access_roles) formData.append('access_roles', access_roles);
    return fetch(`${API_BASE}/knowledge/upload`, {
      method: 'POST',
      headers: authHeaders,
      body: formData
    }).then(async r => {
      if (!r.ok) {
        const err = await r.json().catch(() => null);
        throw new Error(err?.detail || `Upload failed: ${r.statusText}`);
      }
      return r.json();
    });
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
  getTeams: () => fetchJSON<any[]>('/admin/teams'),
  createUser: (data: Partial<User>) => fetchJSON<User>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getPermissions: () => fetchJSON<any>('/admin/permissions'),
  getAuditLogs: (params?: { user_name?: string; action?: string; severity?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.user_name && params.user_name !== 'All') query.append('user_name', params.user_name);
    if (params?.action && params.action !== 'All') query.append('action', params.action);
    if (params?.severity && params.severity !== 'All') query.append('severity', params.severity);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return fetchJSON<AuditLogItem[]>(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
  },
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
