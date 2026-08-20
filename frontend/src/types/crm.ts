export type UserRole = "SUPER_ADMIN" | "ADMIN" | "SALES_MANAGER" | "SALES_EXECUTIVE" | "SUPPORT_AGENT" | "VIEWER";

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Unqualified" | "Converted";

export type DealStage = "Contacted" | "Qualified" | "Proposal Sent" | "Negotiation" | "Deal Closed" | "Closed Won" | "Closed Lost";

export type TaskStatus = "Backlog" | "In progress" | "Validation" | "Done";

export type Priority = "Urgent" | "High" | "Normal" | "Medium" | "Low";

export type ActivityType = "Call" | "Email" | "Meeting" | "Note" | "Task" | "Follow-up" | "Stage Change";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  team?: string;
  phone?: string;
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
  ai_positive_factors?: string[];
  ai_risk_factors?: string[];
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
  department?: string;
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
  account_owner?: string;
  contact_ids?: string[];
  deal_ids?: string[];
  lead_ids?: string[];
}

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  time: string;
  actor: string;
  notes?: string;
  is_milestone?: boolean;
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
  risk_score?: number;
  days_in_stage?: number;
  days_since_last_activity?: number;
  win_factors?: string[];
  risk_factor?: string;
  ai_recommendation?: string;
  ai_evidence_reasons?: string[];
  created_at?: string;
  last_updated?: string;
  contact_name?: string;
  contact_id?: string;
  lost_reason?: string;
}

export interface Task {
  id: string;
  title: string;
  customer_name: string;
  company_id?: string;
  deal_id?: string;
  sub_title?: string;
  status: TaskStatus;
  priority: Priority;
  due_date: string;
  assigned_to: string;
  assigned_avatar?: string;
  comments_count: number;
  created_date: string;
  description?: string;
  is_ai_generated?: boolean;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  customer_name: string;
  company_id?: string;
  deal_id?: string;
  time: string;
  date: string;
  performed_by: string;
  notes?: string;
  is_key_milestone?: boolean;
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
  deal_id?: string;
  attendees: string[];
  location?: string;
  description?: string;
  assigned_to?: string;
}

export interface DocumentChunk {
  chunk_id: string;
  document_id: string;
  document_name: string;
  text: string;
  page_number: number;
  token_count: number;
  embedding_preview?: number[];
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
  access_roles?: string[];
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
  user_id?: string;
  user_name: string;
  user_role: string;
  action: string;
  entity: string;
  entity_id?: string;
  details: string;
  before_value?: string;
  after_value?: string;
  ip_address?: string;
  severity?: string;
}

export interface DashboardData {
  filters?: {
    time_range?: string;
    team?: string;
    salesperson?: string;
    industry?: string;
  };
  kpis: {
    revenue_inr: number;
    revenue_formatted: string;
    revenue_trend: string;
    pipeline_value_inr: number;
    pipeline_value_formatted: string;
    active_deals_count: number;
    weighted_forecast_inr: number;
    weighted_forecast_formatted: string;
    win_rate: string;
    win_rate_trend: string;
    revenue_at_risk_inr: number;
    revenue_at_risk_formatted: string;
    high_risk_deals_count: number;
    risk_percentage_of_pipeline?: string;
    open_tasks_count: number;
    overdue_tasks_count: number;
    upcoming_activities_count: number;

    date_range_label?: string;
    time_range?: string;
    
    // Backward compatibility fields
    total_customers?: number;
    total_customers_trend?: string;
    active_leads?: number;
    active_leads_trend?: string;
    pipeline_trend?: string;
    won_revenue_inr?: number;
    won_revenue_formatted?: string;
    won_revenue_trend?: string;
    total_tasks_open?: number;
  };
  date_range_label?: string;
  time_range?: string;
  ai_action_center: {
    id: string;
    category: string;
    title: string;
    description: string;
    revenue_impact?: string;
    action_type: string;
    action_label: string;
    target_id: string;
    target_tab: string;
  }[];
  pipeline: {
    stages: {
      stage: string;
      count: number;
      value_inr: number;
      value_formatted: string;
      weighted_value_inr: number;
      percentage: string;
    }[];
    total_pipeline_formatted: string;
    weighted_pipeline_formatted: string;
  };
  forecast: {
    target_inr: number;
    target_formatted: string;
    actual_revenue_inr: number;
    actual_revenue_formatted: string;
    weighted_forecast_inr: number;
    weighted_forecast_formatted: string;
    total_projected_inr?: number;
    total_projected_formatted?: string;
    gap_inr?: number;
    gap_formatted?: string;
    gap_or_surplus_inr?: number;
    gap_or_surplus_formatted?: string;
    status: string;
    status_text?: string;
  };
  revenue_trend: {
    period: string;
    actual_inr: number;
    actual_formatted: string;
    prev_period_inr: number;
    forecast_inr: number;
  }[];
  sales_funnel: {
    stage: string;
    count: number;
    conversion_rate: string;
  }[];
  top_opportunities: {
    id: string;
    company_name: string;
    deal_name: string;
    deal_value: number;
    deal_value_formatted: string;
    stage: string;
    probability: number;
    risk_score: number;
    risk_level: string;
    evidence_reasons: string[];
    expected_close: string;
    owner: string;
  }[];
  customer_health: {
    healthy_count: number;
    needs_attention_count: number;
    at_risk_count: number;
    at_risk_revenue_inr: number;
    at_risk_revenue_formatted: string;
  };
  team_performance: {
    salesperson: string;
    team: string;
    pipeline_inr: number;
    pipeline_formatted: string;
    won_revenue_inr: number;
    won_revenue_formatted: string;
    win_rate: string;
    open_deals: number;
    at_risk_deals: number;
  }[];
  today_schedule: {
    id: string;
    time: string;
    title: string;
    subtitle: string;
    type: string;
    priority: string;
  }[];
  recent_activity: {
    id: string;
    timestamp: string;
    user_name: string;
    user_role: string;
    action: string;
    entity: string;
    details: string;
  }[];
  ai_business_insight: {
    title: string;
    narrative: string;
    highlight_deals: string[];
    action_type: string;
    action_label: string;
  };
  stage_distribution?: {
    counts: Record<string, number>;
    values: Record<string, number>;
  };
  revenue_chart?: { month: string; value: number; deals: number }[];
  lead_sources?: { source: string; leads: number; qualified: number; conversion: string }[];
  ai_insights?: any[];
}

export interface AIInsightsData {
  lead_scoring: {
    id: string;
    lead_name: string;
    company: string;
    score: number;
    probability: string;
    reasons: string[];
    positive_factors?: string[];
    risk_factors?: string[];
    recommended_action: string;
    value: string;
  }[];
  deal_predictions: {
    id: string;
    deal_name: string;
    company_name: string;
    deal_value_raw: number;
    deal_value_formatted: string;
    win_probability: number;
    risk_score: number;
    risk_level: string;
    evidence_reasons: string[];
    ai_interpretation: string;
    recommended_action: string;
    action_payload?: any;
    owner: string;
  }[];
  churn_predictions: {
    id: string;
    company_name: string;
    city: string;
    churn_risk: string;
    churn_probability: number;
    health_score: number;
    reasons: string[];
    recommendation: string;
  }[];
  next_best_actions: {
    id: string;
    company_name: string;
    context: string;
    recommended_action: string;
    rationale: string;
    action_type: string;
    action_label: string;
    payload?: any;
  }[];
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

// ── Intelligent Task Priority Engine Types ─────────────────────────────────

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MINIMAL';

export interface ScoreBreakdownFactor {
  factor: string;
  contribution: number;
  reason: string;
}

export interface TaskPriority {
  task_id: string;
  priority_score: number;
  priority_level: PriorityLevel;
  priority_color: string;
  priority_icon: string;
  score_breakdown: ScoreBreakdownFactor[];
  revenue_impact_inr: number;
  revenue_impact_formatted: string;
  deal_name?: string;
  company_name?: string;
  risk_score?: number;
  risk_evidence?: string[];
  recommended_action?: string;
  ai_recommended_deadline?: string;
}

export interface EnrichedTask extends Task, TaskPriority {}

export interface TaskPriorityQueueResponse {
  tasks: EnrichedTask[];
  summary: Record<PriorityLevel, number>;
}

export interface WeekDaySummary {
  day_name: string;
  day_label: string;
  date_iso: string;
  is_today: boolean;
  event_count: number;
  activity_count: number;
  total: number;
}

export interface UpcomingActivity {
  id: string;
  title: string;
  event_type: string;
  date: string;
  time: string;
  customer_name: string;
  location?: string;
  deal_value_formatted?: string;
  risk_score?: number;
}

