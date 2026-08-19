export type UserRole = "ADMIN" | "SALES_MANAGER" | "SALES_EXECUTIVE" | "SUPPORT_AGENT";

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Unqualified" | "Converted";

export type DealStage = "Contacted" | "Qualified" | "Proposal Sent" | "Negotiation" | "Deal Closed";

export type TaskStatus = "Backlog" | "In progress" | "Validation" | "Done";

export type Priority = "Urgent" | "High" | "Normal" | "Medium" | "Low";

export type ActivityType = "Call" | "Email" | "Meeting" | "Note" | "Task" | "Follow-up";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string;
  status: string;
  last_active: string;
}

export interface LeadScoreFactor {
  factor: string;
  score: number;
  max: number;
  detail: string;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  company_id?: string;
  contact_id?: string;
  job_title: string;
  industry: string;
  city: string;
  state: string;
  source: string;
  status: LeadStatus;
  lead_score: number;
  lead_value: number;
  assigned_to: string;
  expected_closing?: string;
  notes?: string;
  created_at: string;
  last_contact?: string;
  ai_summary?: string;
  ai_reasons?: string[];
  ai_recommended_action?: string;
  ai_score_factors?: LeadScoreFactor[];
  deal_ids?: string[];
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  company_id?: string;
  designation: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: string;
  owner: string;
  last_contact: string;
  created_at: string;
  ai_summary?: string;
  avatar?: string;
  deal_ids?: string[];
  lead_ids?: string[];
  engagement_score?: number;
  lead_score?: number;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  city: string;
  state: string;
  gstin: string;
  pan: string;
  contacts_count: number;
  active_deals_count: number;
  total_revenue: number;
  customer_status: string;
  customer_since: string;
  customer_health: number;
  churn_risk: "Low" | "Medium" | "High";
  churn_probability: number;
  ai_recommendation?: string;
  website?: string;
  employees?: string;
  contact_ids?: string[];
  deal_ids?: string[];
  lead_ids?: string[];
}

export interface Deal {
  id: string;
  company_name: string;
  company_id?: string;
  deal_name: string;
  description: string;
  deal_value: number;
  stage: DealStage;
  expected_close_date: string;
  owner: string;
  priority: Priority;
  probability: number;
  win_factors?: string[];
  risk_factor?: string;
  risk_factors?: string[];
  ai_recommendation?: string;
  created_at: string;
  last_updated: string;
  contact_name?: string;
  contact_id?: string;
  days_in_stage?: number;
  lead_id?: string;
}

export interface Task {
  id: string; // MDS-39
  title: string;
  customer_name: string;
  sub_title?: string;
  status: TaskStatus;
  priority: Priority;
  due_date: string;
  assigned_to: string;
  assigned_avatar?: string;
  comments_count: number;
  created_date: string;
  description?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  related_company_id?: string;
  related_contact_id?: string;
  is_ai_generated?: boolean;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  customer_name: string;
  company_id?: string;
  contact_id?: string;
  deal_id?: string;
  time: string;
  date: string;
  performed_by: string;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  event_type: string;
  date: string;
  time: string;
  duration: string;
  customer_name: string;
  company_id?: string;
  contact_id?: string;
  deal_id?: string;
  attendees: string[];
  location?: string;
  description?: string;
}

export interface DocumentChunk {
  chunk_id: string;
  document_id: string;
  document_name: string;
  text: string;
  page_number?: number;
  token_count: number;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  file_type: string;
  uploaded_by: string;
  upload_date: string;
  chunks_count: number;
  status: string;
  file_size: string;
  content_summary?: string;
  chunks?: DocumentChunk[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "alert" | "info" | "warning" | "success";
  timestamp: string;
  is_read: boolean;
  action_link?: string;
  action_label?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user_name: string;
  user_role: string;
  action: string;
  entity: string;
  entity_id?: string;
  details: string;
  before_value?: string;
  after_value?: string;
}

export interface DashboardData {
  kpis: {
    total_customers: number;
    total_customers_trend: string;
    active_leads: number;
    active_leads_trend: string;
    pipeline_value_inr: number;
    pipeline_value_formatted: string;
    pipeline_trend: string;
    won_revenue_inr: number;
    won_revenue_formatted: string;
    won_revenue_trend: string;
    success_rate: number;
    tasks_in_progress: number;
  };
  pipeline_stages: Record<string, number>;
  pipeline_values: Record<string, number>;
  revenue_chart: { month: string; value: number; deals: number }[];
  lead_sources: { source: string; leads: number; qualified: number; conversion: string }[];
  recent_activities: Activity[];
  tasks_overview: Task[];
  ai_insights: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    lead_id?: string;
    deal_id?: string;
    company_id?: string;
    action_type: string;
    action_label: string;
  }>;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  confidence?: number;
  sources?: Array<{
    title: string;
    page?: number;
    category?: string;
    snippet?: string;
    score?: number;
  }>;
  crm_records?: Array<{
    type: string;
    id: string;
    title: string;
    subtitle: string;
    value: string;
    badge: string;
  }>;
  recommended_action?: {
    type: string;
    label: string;
    payload: any;
  };
}

export interface AIInsightsData {
  lead_scoring: Array<{
    id: string;
    lead_name: string;
    company: string;
    score: number;
    probability: string;
    reasons: string[];
    recommended_action: string;
    value: string;
  }>;
  deal_predictions: Array<{
    id: string;
    deal_name: string;
    company_name: string;
    deal_value_raw?: number;
    deal_value_formatted: string;
    win_probability: number;
    expected_revenue: string;
    risk_factor?: string;
    ai_recommendation?: string;
    owner: string;
  }>;
  churn_predictions: Array<{
    id: string;
    company_name: string;
    city: string;
    churn_risk: "Low" | "Medium" | "High";
    churn_probability: number;
    health_score: number;
    reasons: string[];
    recommendation: string;
  }>;
  next_best_actions: Array<{
    id: string;
    company_name: string;
    context: string;
    recommended_action: string;
    rationale: string;
    action_type: string;
    action_label: string;
    payload: any;
  }>;
}

export interface ReportItem {
  id: string;
  title: string;
  category: string;
  description: string;
  metrics: Record<string, string>;
  generated_date: string;
  export_format: string;
}
