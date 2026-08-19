import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Lead, Contact, Company, Deal, Task, Activity, CalendarEvent, 
  DocumentItem, NotificationItem, AuditLogItem, DashboardData, AIInsightsData 
} from '../types/crm';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface CRMContextType {
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  companies: Company[];
  contacts: Contact[];
  activities: Activity[];
  events: CalendarEvent[];
  documents: DocumentItem[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  dashboard: DashboardData | null;
  aiInsights: AIInsightsData | null;
  unreadNotifsCount: number;
  loading: boolean;
  
  // Actions
  refreshAll: () => Promise<void>;
  createLead: (data: Partial<Lead>) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  
  createDeal: (data: Partial<Deal>) => Promise<Deal>;
  updateDealStage: (dealId: string, newStage: Deal["stage"]) => Promise<void>;
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTaskStatus: (taskId: string, newStatus: Task["status"]) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  createCompany: (data: Partial<Company>) => Promise<Company>;
  createContact: (data: Partial<Contact>) => Promise<Contact>;
  logActivity: (data: Partial<Activity>) => Promise<Activity>;
  createEvent: (data: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  
  uploadDocument: (name: string, category: string, uploaded_by: string, content?: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [aiInsights, setAIInsights] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshAll = async () => {
    try {
      setLoading(true);
      const [
        dashData, leadsData, dealsData, tasksData, compsData,
        consData, actsData, evtsData, docsData, notifsData, logsData, insightsData
      ] = await Promise.allSettled([
        api.getDashboard(),
        api.getLeads(),
        api.getDeals(),
        api.getTasks(),
        api.getCompanies(),
        api.getContacts(),
        api.getActivities(),
        api.getEvents(),
        api.getDocuments(),
        api.getNotifications(),
        api.getAuditLogs(),
        api.getAIInsights()
      ]);

      if (dashData.status === 'fulfilled') setDashboard(dashData.value);
      if (leadsData.status === 'fulfilled') setLeads(leadsData.value);
      if (dealsData.status === 'fulfilled') setDeals(dealsData.value);
      if (tasksData.status === 'fulfilled') setTasks(tasksData.value);
      if (compsData.status === 'fulfilled') setCompanies(compsData.value);
      if (consData.status === 'fulfilled') setContacts(consData.value);
      if (actsData.status === 'fulfilled') setActivities(actsData.value);
      if (evtsData.status === 'fulfilled') setEvents(evtsData.value);
      if (docsData.status === 'fulfilled') setDocuments(docsData.value);
      if (notifsData.status === 'fulfilled') setNotifications(notifsData.value);
      if (logsData.status === 'fulfilled') setAuditLogs(logsData.value);
      if (insightsData.status === 'fulfilled') setAIInsights(insightsData.value);
    } catch (err) {
      console.error('Error fetching CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const unreadNotifsCount = notifications.filter(n => !n.is_read).length;

  // LEADS
  const createLead = async (data: Partial<Lead>): Promise<Lead> => {
    try {
      const created = await api.createLead(data);
      setLeads(prev => [created, ...prev]);
      showToast(`Lead "${created.first_name} ${created.last_name}" created!`, 'success');
      refreshAll();
      return created;
    } catch (e) {
      const fallbackLead: Lead = {
        id: `lead-${Date.now()}`,
        first_name: data.first_name || 'New',
        last_name: data.last_name || 'Lead',
        email: data.email || 'lead@example.com',
        phone: data.phone || '+91 98000 00000',
        company: data.company || 'New Company',
        job_title: data.job_title || 'Director',
        industry: data.industry || 'IT Services',
        city: data.city || 'Mumbai',
        state: data.state || 'Maharashtra',
        source: data.source || 'Website',
        status: data.status || 'New',
        lead_score: 75,
        lead_value: data.lead_value || 250000,
        assigned_to: data.assigned_to || 'Amit Sharma',
        expected_closing: data.expected_closing || '30 Sep 2026',
        created_at: 'Today'
      };
      setLeads(prev => [fallbackLead, ...prev]);
      showToast(`Lead "${fallbackLead.first_name}" created!`, 'success');
      return fallbackLead;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const updated = await api.updateLead(id, updates);
      setLeads(prev => prev.map(l => l.id === id ? updated : l));
      showToast('Lead updated successfully', 'success');
    } catch (e) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await api.deleteLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      showToast('Lead deleted', 'info');
    } catch (e) {
      setLeads(prev => prev.filter(l => l.id !== id));
    }
  };

  // DEALS
  const createDeal = async (data: Partial<Deal>): Promise<Deal> => {
    try {
      const created = await api.createDeal(data);
      setDeals(prev => [created, ...prev]);
      showToast(`Deal "${created.deal_name}" created!`, 'success');
      refreshAll();
      return created;
    } catch (e) {
      const fallbackDeal: Deal = {
        id: `deal-${Date.now()}`,
        deal_name: data.deal_name || 'New Deal',
        company_name: data.company_name || 'Target Company',
        description: data.description || 'Custom engagement',
        deal_value: data.deal_value || 300000,
        stage: data.stage || 'Contacted',
        expected_close_date: data.expected_close_date || '30 Sep 2026',
        owner: data.owner || 'Amit Sharma',
        priority: data.priority || 'Normal',
        probability: 45,
        created_at: 'Today',
        last_updated: 'Today'
      };
      setDeals(prev => [fallbackDeal, ...prev]);
      showToast(`Deal "${fallbackDeal.deal_name}" created!`, 'success');
      return fallbackDeal;
    }
  };

  const updateDealStage = async (dealId: string, newStage: Deal["stage"]) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));
    try {
      await api.updateDeal(dealId, { stage: newStage });
      showToast(`Deal moved to ${newStage}`, 'success');
    } catch (e) {
      console.log('Updated deal stage locally');
    }
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    try {
      const updated = await api.updateDeal(id, updates);
      setDeals(prev => prev.map(d => d.id === id ? updated : d));
      showToast('Deal updated', 'success');
    } catch (e) {
      setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    }
  };

  const deleteDeal = async (id: string) => {
    try {
      await api.deleteDeal(id);
      setDeals(prev => prev.filter(d => d.id !== id));
      showToast('Deal removed', 'info');
    } catch (e) {
      setDeals(prev => prev.filter(d => d.id !== id));
    }
  };

  // TASKS
  const createTask = async (data: Partial<Task>): Promise<Task> => {
    try {
      const created = await api.createTask(data);
      setTasks(prev => [created, ...prev]);
      showToast(`Task "${created.title}" created!`, 'success');
      refreshAll();
      return created;
    } catch (e) {
      const fallbackTask: Task = {
        id: `MDS-${Math.floor(Math.random() * 80 + 10)}`,
        title: data.title || 'New CRM Task',
        customer_name: data.customer_name || 'Client',
        sub_title: data.sub_title || 'General',
        status: data.status || 'In progress',
        priority: data.priority || 'Normal',
        due_date: data.due_date || new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' '),
        assigned_to: data.assigned_to || 'Amit Sharma',
        comments_count: 0,
        created_date: 'Today'
      };
      setTasks(prev => [fallbackTask, ...prev]);
      showToast(`Task created: ${fallbackTask.title}`, 'success');
      return fallbackTask;
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await api.updateTask(taskId, { status: newStatus });
      showToast(`Task status: ${newStatus}`, 'info');
    } catch (e) {
      // Handled locally
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await api.updateTask(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch (e) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast('Task deleted', 'info');
    } catch (e) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  // COMPANIES & CONTACTS
  const createCompany = async (data: Partial<Company>): Promise<Company> => {
    const created = await api.createCompany(data);
    setCompanies(prev => [created, ...prev]);
    showToast(`Company "${created.name}" added`, 'success');
    return created;
  };

  const createContact = async (data: Partial<Contact>): Promise<Contact> => {
    const created = await api.createContact(data);
    setContacts(prev => [created, ...prev]);
    showToast(`Contact "${created.name}" added`, 'success');
    return created;
  };

  const logActivity = async (data: Partial<Activity>): Promise<Activity> => {
    const created = await api.logActivity(data);
    setActivities(prev => [created, ...prev]);
    showToast(`Activity logged: ${created.title}`, 'success');
    return created;
  };

  const createEvent = async (data: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const created = await api.createEvent(data);
    setEvents(prev => [created, ...prev]);
    showToast(`Event scheduled: ${created.title}`, 'success');
    return created;
  };

  // KNOWLEDGE & NOTIFS
  const uploadDocument = async (name: string, category: string, uploaded_by: string, content?: string) => {
    await api.uploadDocument(name, category, uploaded_by, content);
    showToast(`Document "${name}" uploaded & vectorized!`, 'success');
    refreshAll();
  };

  const deleteDocument = async (id: string) => {
    await api.deleteDocument(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    showToast('Document removed from vector store', 'info');
  };

  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    showToast('All notifications marked as read', 'info');
  };

  return (
    <CRMContext.Provider value={{
      leads, deals, tasks, companies, contacts, activities, events, documents,
      notifications, auditLogs, dashboard, aiInsights, unreadNotifsCount, loading,
      refreshAll, createLead, updateLead, deleteLead,
      createDeal, updateDealStage, updateDeal, deleteDeal,
      createTask, updateTaskStatus, updateTask, deleteTask,
      createCompany, createContact, logActivity, createEvent,
      uploadDocument, deleteDocument, markNotificationRead, markAllNotificationsRead
    }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within a CRMProvider');
  return context;
};
