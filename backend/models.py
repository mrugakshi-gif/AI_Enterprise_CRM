from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    SALES_MANAGER = "SALES_MANAGER"
    SALES_EXECUTIVE = "SALES_EXECUTIVE"
    SUPPORT_AGENT = "SUPPORT_AGENT"

class LeadStatus(str, Enum):
    NEW = "New"
    CONTACTED = "Contacted"
    QUALIFIED = "Qualified"
    PROPOSAL = "Proposal"
    UNQUALIFIED = "Unqualified"
    CONVERTED = "Converted"

class DealStage(str, Enum):
    CONTACTED = "Contacted"
    QUALIFIED = "Qualified"
    PROPOSAL_SENT = "Proposal Sent"
    NEGOTIATION = "Negotiation"
    DEAL_CLOSED = "Deal Closed"

class TaskStatus(str, Enum):
    BACKLOG = "Backlog"
    IN_PROGRESS = "In progress"
    VALIDATION = "Validation"
    DONE = "Done"

class Priority(str, Enum):
    URGENT = "Urgent"
    HIGH = "High"
    NORMAL = "Normal"
    MEDIUM = "Medium"
    LOW = "Low"

class ActivityType(str, Enum):
    CALL = "Call"
    EMAIL = "Email"
    MEETING = "Meeting"
    NOTE = "Note"
    TASK = "Task"
    FOLLOW_UP = "Follow-up"

class User(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    department: str
    avatar: str
    status: str = "Active"
    last_active: str = "Just now"

class Lead(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: str
    company: str
    job_title: str
    industry: str
    city: str
    state: str
    source: str
    status: LeadStatus
    lead_score: int = 50
    lead_value: float = 0.0
    assigned_to: str
    expected_closing: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now().strftime("%d %b %Y"))
    last_contact: Optional[str] = "16 Aug 2026"
    ai_summary: Optional[str] = None
    ai_reasons: Optional[List[str]] = []
    ai_recommended_action: Optional[str] = None

class Contact(BaseModel):
    id: str
    name: str
    company: str
    designation: str
    email: str
    phone: str
    city: str
    state: str
    status: str = "Active"
    owner: str
    last_contact: str = "15 Aug 2026"
    created_at: str = "10 Jan 2026"
    ai_summary: Optional[str] = None
    avatar: Optional[str] = None

class Company(BaseModel):
    id: str
    name: str
    industry: str
    city: str
    state: str
    gstin: str
    pan: str
    contacts_count: int = 1
    active_deals_count: int = 1
    total_revenue: float = 0.0
    customer_status: str = "Customer"
    customer_since: str = "12 May 2025"
    customer_health: int = 85
    churn_risk: str = "Low"
    churn_probability: int = 12
    ai_recommendation: Optional[str] = None
    website: Optional[str] = None
    employees: Optional[str] = "50-200"

class Deal(BaseModel):
    id: str
    company_name: str
    deal_name: str
    description: str
    deal_value: float  # In INR
    stage: DealStage
    expected_close_date: str
    owner: str
    priority: Priority
    probability: int = 50
    win_factors: Optional[List[str]] = []
    risk_factor: Optional[str] = None
    ai_recommendation: Optional[str] = None
    created_at: str = "01 Aug 2026"
    last_updated: str = "16 Aug 2026"
    contact_name: Optional[str] = None

class Task(BaseModel):
    id: str  # MDS-39
    title: str
    customer_name: str
    sub_title: Optional[str] = None
    status: TaskStatus
    priority: Priority
    due_date: str
    assigned_to: str
    assigned_avatar: Optional[str] = None
    comments_count: int = 0
    created_date: str = "14 Aug 2026"
    description: Optional[str] = None

class Activity(BaseModel):
    id: str
    type: ActivityType
    title: str
    customer_name: str
    time: str
    date: str
    performed_by: str
    notes: Optional[str] = None

class CalendarEvent(BaseModel):
    id: str
    title: str
    event_type: str  # Demo, Meeting, Call, Deadline
    date: str
    time: str
    duration: str
    customer_name: str
    attendees: List[str] = []
    location: Optional[str] = "Google Meet"
    description: Optional[str] = None

class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    document_name: str
    text: str
    page_number: Optional[int] = 1
    token_count: int = 150
    embedding_preview: Optional[List[float]] = []

class DocumentItem(BaseModel):
    id: str
    name: str
    category: str
    file_type: str
    uploaded_by: str
    upload_date: str
    chunks_count: int
    status: str = "Indexed ✓"
    file_size: str = "1.2 MB"
    content_summary: Optional[str] = None
    chunks: Optional[List[DocumentChunk]] = []

class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    type: str  # alert, info, warning, success
    timestamp: str
    is_read: bool = False
    action_link: Optional[str] = None
    action_label: Optional[str] = None

class AuditLogItem(BaseModel):
    id: str
    timestamp: str
    user_name: str
    user_role: str
    action: str
    entity: str
    details: str

class AIChatQuery(BaseModel):
    query: str
    user_role: Optional[str] = "ADMIN"
    context_filters: Optional[Dict[str, Any]] = None

class AIChatResponse(BaseModel):
    answer: str
    confidence: float
    sources: List[Dict[str, Any]]
    crm_records: Optional[List[Dict[str, Any]]] = []
    recommended_action: Optional[Dict[str, Any]] = None

class CreateLeadRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    company: str
    job_title: str
    industry: str
    city: str
    state: str
    source: str
    status: LeadStatus = LeadStatus.NEW
    lead_value: float = 0.0
    assigned_to: str
    expected_closing: Optional[str] = None
    notes: Optional[str] = None

class CreateDealRequest(BaseModel):
    company_name: str
    deal_name: str
    description: str
    deal_value: float
    stage: DealStage = DealStage.CONTACTED
    expected_close_date: str
    owner: str
    priority: Priority = Priority.NORMAL
    contact_name: Optional[str] = None

class CreateTaskRequest(BaseModel):
    title: str
    customer_name: str
    sub_title: Optional[str] = None
    status: TaskStatus = TaskStatus.BACKLOG
    priority: Priority = Priority.NORMAL
    due_date: str
    assigned_to: str
    description: Optional[str] = None

class CreateActivityRequest(BaseModel):
    type: ActivityType
    title: str
    customer_name: str
    time: str
    date: str
    performed_by: str
    notes: Optional[str] = None

class CreateEventRequest(BaseModel):
    title: str
    event_type: str
    date: str
    time: str
    duration: str
    customer_name: str
    attendees: List[str] = []
    location: Optional[str] = "Google Meet"
    description: Optional[str] = None
