from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.database import db
from backend.models import (
    Lead, Contact, Company, Deal, Task, Activity, CalendarEvent,
    CreateLeadRequest, CreateDealRequest, CreateTaskRequest, CreateActivityRequest, CreateEventRequest
)

router = APIRouter(prefix="/api/crm", tags=["CRM"])

# ==================== DASHBOARD SUMMARY ====================
@router.get("/dashboard")
def get_dashboard_summary():
    total_customers = len([c for c in db.companies if c.get("customer_status") == "Customer"])
    active_leads = len([l for l in db.leads if l["status"] != "Unqualified"])
    pipeline_value = sum(d["deal_value"] for d in db.deals if d["stage"] != "Deal Closed")
    won_revenue = sum(d["deal_value"] for d in db.deals if d["stage"] == "Deal Closed")

    # Pipeline stages
    stage_counts = {}
    stage_values = {}
    for stage in ["Contacted", "Qualified", "Proposal Sent", "Negotiation", "Deal Closed"]:
        stage_deals = [d for d in db.deals if d["stage"] == stage]
        stage_counts[stage] = len(stage_deals)
        stage_values[stage] = sum(d["deal_value"] for d in stage_deals)

    # Monthly revenue trend (in Lakhs)
    revenue_chart = [
        {"month": "April", "value": 8.2, "deals": 5},
        {"month": "May", "value": 10.4, "deals": 7},
        {"month": "June", "value": 12.8, "deals": 9},
        {"month": "July", "value": 15.2, "deals": 11},
        {"month": "August", "value": 18.6, "deals": 14}
    ]

    # Lead source performance
    lead_sources = [
        {"source": "Website", "leads": 42, "qualified": 34, "conversion": "80.9%"},
        {"source": "LinkedIn", "leads": 38, "qualified": 28, "conversion": "73.6%"},
        {"source": "Referral", "leads": 29, "qualified": 26, "conversion": "89.6%"},
        {"source": "Google Ads", "leads": 35, "qualified": 21, "conversion": "60.0%"},
        {"source": "Partner", "leads": 18, "qualified": 15, "conversion": "83.3%"},
        {"source": "Direct", "leads": 14, "qualified": 10, "conversion": "71.4%"}
    ]

    # High priority AI insights
    ai_insights = [
        {
            "id": "ins-1",
            "type": "HIGH-VALUE LEADS",
            "title": "High-Value Follow-up Required",
            "description": "Rahul Sharma (TechNova) opened proposal 4 times today. ₹4.5L deal ready for closing.",
            "lead_id": "lead-1",
            "action_type": "create_task",
            "action_label": "Create Follow-up Task"
        },
        {
            "id": "ins-2",
            "type": "DEAL RISK",
            "title": "Price Objection on FinEdge Suite",
            "description": "VP requested quarterly instead of annual payment terms. Win probability adjusted to 65%.",
            "deal_id": "deal-2",
            "action_type": "generate_email",
            "action_label": "Generate ROI Email"
        },
        {
            "id": "ins-3",
            "type": "CUSTOMER RISK",
            "title": "Global Solutions Churn Indicator",
            "description": "Zero activity for 28 days and customer health score dropped to 42/100.",
            "company_id": "comp-6",
            "action_type": "schedule_meeting",
            "action_label": "Schedule CS Review"
        },
        {
            "id": "ins-4",
            "type": "NEXT BEST ACTION",
            "title": "Upsell GreenGrid Energy",
            "description": "Solar division utilization reached 94%. Recommend upgrading to Enterprise Unlimited tier.",
            "company_id": "comp-4",
            "action_type": "create_deal",
            "action_label": "Create Upsell Deal"
        }
    ]

    return {
        "kpis": {
            "total_customers": 1284,
            "total_customers_trend": "+12.4%",
            "active_leads": active_leads,
            "active_leads_trend": "+8.2%",
            "pipeline_value_inr": pipeline_value,
            "pipeline_value_formatted": f"₹{pipeline_value/100000:.1f} L",
            "pipeline_trend": "+15.7%",
            "won_revenue_inr": won_revenue,
            "won_revenue_formatted": f"₹{won_revenue/100000:.1f} L",
            "won_revenue_trend": "+11.3%",
            "success_rate": 68,
            "tasks_in_progress": len([t for t in db.tasks if t["status"] in ["In progress", "Validation"]])
        },
        "pipeline_stages": stage_counts,
        "pipeline_values": stage_values,
        "revenue_chart": revenue_chart,
        "lead_sources": lead_sources,
        "recent_activities": db.activities[:5],
        "tasks_overview": db.tasks[:4],
        "ai_insights": ai_insights
    }

# ==================== LEADS ====================
@router.get("/leads")
def list_leads():
    return db.leads

@router.get("/leads/{lead_id}")
def get_lead(lead_id: str):
    lead = next((l for l in db.leads if l["id"] == lead_id), None)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.post("/leads")
def create_lead(req: CreateLeadRequest):
    new_id = f"lead-{len(db.leads) + 1}"
    
    # Calculate AI lead score
    score = 65
    reasons = ["New lead captured"]
    if req.source in ["Referral", "Website"]:
        score += 15
        reasons.append("High-intent acquisition channel")
    if req.lead_value > 300000:
        score += 10
        reasons.append("High deal value opportunity")
    
    new_lead = {
        "id": new_id,
        "first_name": req.first_name,
        "last_name": req.last_name,
        "email": req.email,
        "phone": req.phone,
        "company": req.company,
        "job_title": req.job_title,
        "industry": req.industry,
        "city": req.city,
        "state": req.state,
        "source": req.source,
        "status": req.status,
        "lead_score": min(score, 98),
        "lead_value": req.lead_value,
        "assigned_to": req.assigned_to,
        "expected_closing": req.expected_closing or "30 Sep 2026",
        "notes": req.notes,
        "created_at": datetime.now().strftime("%d %b %Y"),
        "last_contact": "Today",
        "ai_summary": f"Captured lead for {req.company}. Initial qualification score {min(score, 98)}/100.",
        "ai_reasons": reasons,
        "ai_recommended_action": "Schedule introductory discovery call."
    }
    db.leads.insert(0, new_lead)

    db.add_audit_log(
        user_name=req.assigned_to,
        user_role="SALES_EXECUTIVE",
        action="Created Lead",
        entity=f"{req.first_name} {req.last_name} ({req.company})",
        details=f"Lead value: ₹{req.lead_value:,.0f}, Source: {req.source}"
    )

    db.add_notification(
        title="New Lead Created",
        message=f"{req.first_name} {req.last_name} from {req.company} added with score {new_lead['lead_score']}/100.",
        type_="info",
        action_link="/leads",
        action_label="View Lead"
    )

    return new_lead

@router.put("/leads/{lead_id}")
def update_lead(lead_id: str, updates: Dict[str, Any]):
    lead = next((l for l in db.leads if l["id"] == lead_id), None)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.update(updates)
    return lead

@router.delete("/leads/{lead_id}")
def delete_lead(lead_id: str):
    db.leads = [l for l in db.leads if l["id"] != lead_id]
    return {"success": True}

# ==================== CONTACTS ====================
@router.get("/contacts")
def list_contacts():
    return db.contacts

@router.post("/contacts")
def create_contact(contact_data: Dict[str, Any]):
    new_id = f"con-{len(db.contacts) + 1}"
    contact = {
        "id": new_id,
        "name": contact_data.get("name", "New Contact"),
        "company": contact_data.get("company", "Company"),
        "designation": contact_data.get("designation", "Director"),
        "email": contact_data.get("email", ""),
        "phone": contact_data.get("phone", "+91 98000 00000"),
        "city": contact_data.get("city", "Mumbai"),
        "state": contact_data.get("state", "Maharashtra"),
        "status": "Active",
        "owner": contact_data.get("owner", "Amit Sharma"),
        "last_contact": "Today",
        "created_at": datetime.now().strftime("%d %b %Y"),
        "ai_summary": "Recently added key stakeholder.",
        "avatar": contact_data.get("avatar", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
    }
    db.contacts.insert(0, contact)
    return contact

# ==================== COMPANIES ====================
@router.get("/companies")
def list_companies():
    return db.companies

@router.get("/companies/{comp_id}")
def get_company(comp_id: str):
    comp = next((c for c in db.companies if c["id"] == comp_id), None)
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")
    return comp

@router.post("/companies")
def create_company(comp_data: Dict[str, Any]):
    new_id = f"comp-{len(db.companies) + 1}"
    comp = {
        "id": new_id,
        "name": comp_data.get("name", "New Company"),
        "industry": comp_data.get("industry", "IT Services"),
        "city": comp_data.get("city", "Mumbai"),
        "state": comp_data.get("state", "Maharashtra"),
        "gstin": comp_data.get("gstin", "27ABCDE1234F1Z5"),
        "pan": comp_data.get("pan", "ABCDE1234F"),
        "contacts_count": 1,
        "active_deals_count": 0,
        "total_revenue": float(comp_data.get("total_revenue", 0.0)),
        "customer_status": comp_data.get("customer_status", "Prospect"),
        "customer_since": datetime.now().strftime("%d %b %Y"),
        "customer_health": 80,
        "churn_risk": "Low",
        "churn_probability": 15,
        "ai_recommendation": "Initiate introductory relationship meeting.",
        "website": comp_data.get("website", ""),
        "employees": comp_data.get("employees", "50-100")
    }
    db.companies.insert(0, comp)
    return comp

# ==================== DEALS ====================
@router.get("/deals")
def list_deals():
    return db.deals

@router.post("/deals")
def create_deal(req: CreateDealRequest):
    new_id = f"deal-{len(db.deals) + 1}"
    prob = 30
    if req.stage == "Qualified": prob = 50
    elif req.stage == "Proposal Sent": prob = 65
    elif req.stage == "Negotiation": prob = 80
    elif req.stage == "Deal Closed": prob = 100

    new_deal = {
        "id": new_id,
        "company_name": req.company_name,
        "deal_name": req.deal_name,
        "description": req.description,
        "deal_value": req.deal_value,
        "stage": req.stage,
        "expected_close_date": req.expected_close_date,
        "owner": req.owner,
        "priority": req.priority,
        "probability": prob,
        "win_factors": ["Initial opportunity created", "Budget aligned"],
        "risk_factor": None,
        "ai_recommendation": "Send formal introductory deck and confirm technical evaluation team.",
        "created_at": datetime.now().strftime("%d %b %Y"),
        "last_updated": datetime.now().strftime("%d %b %Y"),
        "contact_name": req.contact_name or "Primary Contact"
    }
    db.deals.insert(0, new_deal)

    db.add_audit_log(
        user_name=req.owner,
        user_role="SALES_EXECUTIVE",
        action="Created Deal",
        entity=f"{req.deal_name} ({req.company_name})",
        details=f"Value: ₹{req.deal_value:,.0f}, Stage: {req.stage}"
    )

    return new_deal

@router.put("/deals/{deal_id}")
def update_deal(deal_id: str, updates: Dict[str, Any]):
    deal = next((d for d in db.deals if d["id"] == deal_id), None)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    old_stage = deal.get("stage")
    deal.update(updates)
    deal["last_updated"] = datetime.now().strftime("%d %b %Y")

    # If stage changed, recalculate probability and audit
    if "stage" in updates and updates["stage"] != old_stage:
        new_stage = updates["stage"]
        if new_stage == "Deal Closed":
            deal["probability"] = 100
        elif new_stage == "Negotiation":
            deal["probability"] = 80
        elif new_stage == "Proposal Sent":
            deal["probability"] = 65
        elif new_stage == "Qualified":
            deal["probability"] = 50
        elif new_stage == "Contacted":
            deal["probability"] = 30

        db.add_audit_log(
            user_name=deal["owner"],
            user_role="SALES_EXECUTIVE",
            action="Updated Deal Stage",
            entity=f"{deal['deal_name']} ({deal['company_name']})",
            details=f"Moved from {old_stage} to {new_stage} (Value: ₹{deal['deal_value']:,.0f})"
        )

    return deal

@router.delete("/deals/{deal_id}")
def delete_deal(deal_id: str):
    db.deals = [d for d in db.deals if d["id"] != deal_id]
    return {"success": True}

# ==================== TASKS ====================
@router.get("/tasks")
def list_tasks():
    return db.tasks

@router.post("/tasks")
def create_task(req: CreateTaskRequest):
    new_id = f"MDS-{len(db.tasks) + 10}"
    new_task = {
        "id": new_id,
        "title": req.title,
        "customer_name": req.customer_name,
        "sub_title": req.sub_title or "General Operations",
        "status": req.status,
        "priority": req.priority,
        "due_date": req.due_date,
        "assigned_to": req.assigned_to,
        "assigned_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "comments_count": 0,
        "created_date": datetime.now().strftime("%d %b %Y"),
        "description": req.description
    }
    db.tasks.insert(0, new_task)

    db.add_audit_log(
        user_name=req.assigned_to,
        user_role="SALES_EXECUTIVE",
        action="Created Task",
        entity=f"{new_id}: {req.title}",
        details=f"Customer: {req.customer_name}, Priority: {req.priority}, Due: {req.due_date}"
    )

    return new_task

@router.put("/tasks/{task_id}")
def update_task(task_id: str, updates: Dict[str, Any]):
    task = next((t for t in db.tasks if t["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.update(updates)
    return task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: str):
    db.tasks = [t for t in db.tasks if t["id"] != task_id]
    return {"success": True}

# ==================== ACTIVITIES ====================
@router.get("/activities")
def list_activities():
    return db.activities

@router.post("/activities")
def log_activity(req: CreateActivityRequest):
    new_id = f"act-{len(db.activities) + 1}"
    new_act = {
        "id": new_id,
        "type": req.type,
        "title": req.title,
        "customer_name": req.customer_name,
        "time": req.time,
        "date": req.date,
        "performed_by": req.performed_by,
        "notes": req.notes
    }
    db.activities.insert(0, new_act)

    db.add_audit_log(
        user_name=req.performed_by,
        user_role="SALES_EXECUTIVE",
        action="Logged Activity",
        entity=f"{req.type}: {req.title}",
        details=f"Target: {req.customer_name}"
    )

    return new_act

# ==================== CALENDAR ====================
@router.get("/events")
def list_events():
    return db.events

@router.post("/events")
def create_event(req: CreateEventRequest):
    new_id = f"evt-{len(db.events) + 1}"
    new_event = {
        "id": new_id,
        "title": req.title,
        "event_type": req.event_type,
        "date": req.date,
        "time": req.time,
        "duration": req.duration,
        "customer_name": req.customer_name,
        "attendees": req.attendees,
        "location": req.location,
        "description": req.description
    }
    db.events.insert(0, new_event)
    return new_event
