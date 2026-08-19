from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
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
        {"month": "August", "value": round(won_revenue / 100000, 1), "deals": len([d for d in db.deals if d["stage"] == "Deal Closed"])}
    ]

    # Lead source performance
    lead_sources = []
    sources = {}
    for l in db.leads:
        s = l["source"]
        if s not in sources:
            sources[s] = {"total": 0, "qualified": 0}
        sources[s]["total"] += 1
        if l["status"] in ["Qualified", "Proposal", "Converted"]:
            sources[s]["qualified"] += 1
    for s, v in sources.items():
        rate = (v["qualified"] / v["total"] * 100) if v["total"] else 0
        lead_sources.append({"source": s, "leads": v["total"], "qualified": v["qualified"], "conversion": f"{rate:.1f}%"})

    # High priority AI insights
    at_risk_deals = [d for d in db.deals if d.get("risk_factor") and d["stage"] != "Deal Closed"]
    churn_companies = [c for c in db.companies if c.get("churn_risk") in ["High", "Medium"]]
    high_score_leads = sorted([l for l in db.leads if l["lead_score"] >= 80], key=lambda x: -x["lead_score"])

    ai_insights = []
    if high_score_leads:
        l = high_score_leads[0]
        ai_insights.append({
            "id": "ins-1",
            "type": "HIGH-VALUE LEADS",
            "title": f"High-Value Lead: {l['first_name']} {l['last_name']}",
            "description": f"{l['first_name']} ({l['company']}) has AI Score {l['lead_score']}/100. ₹{l['lead_value']/100000:.1f}L deal ready for action.",
            "lead_id": l["id"],
            "action_type": "create_task",
            "action_label": "Create Follow-up Task"
        })
    if at_risk_deals:
        d = at_risk_deals[0]
        ai_insights.append({
            "id": "ins-2",
            "type": "DEAL RISK",
            "title": f"Risk Detected: {d['deal_name']}",
            "description": f"{d['risk_factor']} Win probability: {d['probability']}%.",
            "deal_id": d["id"],
            "action_type": "generate_email",
            "action_label": "Generate ROI Email"
        })
    if churn_companies:
        c = next((x for x in churn_companies if x["churn_risk"] == "High"), churn_companies[0])
        ai_insights.append({
            "id": "ins-3",
            "type": "CUSTOMER RISK",
            "title": f"Churn Alert: {c['name']}",
            "description": f"Health score {c['customer_health']}/100. Churn probability: {c['churn_probability']}%.",
            "company_id": c["id"],
            "action_type": "schedule_meeting",
            "action_label": "Schedule CS Review"
        })

    return {
        "kpis": {
            "total_customers": total_customers,
            "total_customers_trend": "+12.4%",
            "active_leads": active_leads,
            "active_leads_trend": "+8.2%",
            "pipeline_value_inr": pipeline_value,
            "pipeline_value_formatted": f"₹{pipeline_value/100000:.1f} L",
            "pipeline_trend": "+15.7%",
            "won_revenue_inr": won_revenue,
            "won_revenue_formatted": f"₹{won_revenue/100000:.1f} L",
            "won_revenue_trend": "+11.3%",
            "success_rate": round((len([d for d in db.deals if d["stage"] == "Deal Closed"]) / max(len(db.deals), 1)) * 100),
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

@router.get("/leads/{lead_id}/detail")
def get_lead_detail(lead_id: str):
    lead = next((l for l in db.leads if l["id"] == lead_id), None)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Enrich with related records
    company = next((c for c in db.companies if c["id"] == lead.get("company_id")), None)
    contact = next((c for c in db.contacts if c["id"] == lead.get("contact_id")), None)
    deals = [d for d in db.deals if d["id"] in lead.get("deal_ids", [])]
    activities = [a for a in db.activities if a.get("company_id") == lead.get("company_id")]
    tasks = [t for t in db.tasks if t.get("related_company_id") == lead.get("company_id")]
    events = [e for e in db.events if e.get("company_id") == lead.get("company_id")]

    return {
        **lead,
        "related_company": company,
        "related_contact": contact,
        "related_deals": deals,
        "activities": activities[:10],
        "tasks": tasks[:5],
        "events": events[:5]
    }

@router.post("/leads")
def create_lead(req: CreateLeadRequest):
    new_id = f"lead-{len(db.leads) + 1}"

    # Deterministic AI lead score calculation
    score = 40
    reasons = []
    factors = []

    # Source factor
    source_scores = {"Referral": 14, "Website": 13, "Partner": 12, "LinkedIn": 11, "Google Ads": 9, "Direct": 10}
    src_score = source_scores.get(req.source, 10)
    score += src_score
    factors.append({"factor": "Lead Source", "score": src_score, "max": 15, "detail": f"{req.source} source historical conversion rate"})
    reasons.append(f"Source: {req.source}")

    # Value factor
    if req.lead_value >= 500000:
        score += 20; factors.append({"factor": "Lead Value", "score": 20, "max": 20, "detail": f"₹{req.lead_value:,.0f} — Premium enterprise opportunity"})
    elif req.lead_value >= 300000:
        score += 15; factors.append({"factor": "Lead Value", "score": 15, "max": 20, "detail": f"₹{req.lead_value:,.0f} — Above median deal value"})
    else:
        score += 10; factors.append({"factor": "Lead Value", "score": 10, "max": 20, "detail": f"₹{req.lead_value:,.0f} — Standard opportunity size"})
    reasons.append("Deal value qualification")

    # Recency (new lead = high recency)
    score += 8
    factors.append({"factor": "Recency", "score": 8, "max": 8, "detail": "Newly created — most recent"})
    reasons.append("New lead captured")

    # Industry factor
    if req.industry in ["IT Services", "Financial Services"]:
        score += 5; reasons.append("High-conversion industry vertical")

    new_lead = {
        "id": new_id,
        "first_name": req.first_name,
        "last_name": req.last_name,
        "email": req.email,
        "phone": req.phone,
        "company": req.company,
        "company_id": None,
        "contact_id": None,
        "job_title": req.job_title,
        "industry": req.industry,
        "city": req.city,
        "state": req.state,
        "source": req.source,
        "status": req.status,
        "lead_score": min(score, 98),
        "lead_value": req.lead_value,
        "assigned_to": req.assigned_to,
        "assigned_to_id": None,
        "expected_closing": req.expected_closing or (datetime.now() + timedelta(days=30)).strftime("%d %b %Y"),
        "notes": req.notes,
        "created_at": datetime.now().strftime("%d %b %Y"),
        "last_contact": "Today",
        "ai_summary": f"New lead captured for {req.company}. Scoring based on source quality, deal value, and industry vertical.",
        "ai_reasons": reasons,
        "ai_recommended_action": "Schedule introductory discovery call.",
        "ai_score_factors": factors,
        "deal_ids": []
    }
    db.leads.insert(0, new_lead)

    db.add_audit_log(
        user_name=req.assigned_to,
        user_role="SALES_EXECUTIVE",
        action="Created Lead",
        entity=f"{req.first_name} {req.last_name} ({req.company})",
        entity_id=new_id,
        details=f"Lead value: ₹{req.lead_value:,.0f}, Source: {req.source}",
        after_value=req.status
    )

    db.add_notification(
        title="New Lead Created",
        message=f"{req.first_name} {req.last_name} from {req.company} added with score {new_lead['lead_score']}/100.",
        type_="info",
        action_link="leads",
        action_label="View Lead"
    )

    return new_lead

@router.put("/leads/{lead_id}")
def update_lead(lead_id: str, updates: Dict[str, Any]):
    lead = next((l for l in db.leads if l["id"] == lead_id), None)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    old_status = lead.get("status")
    lead.update(updates)
    if "status" in updates and updates["status"] != old_status:
        db.add_audit_log(
            user_name=lead.get("assigned_to", "System"),
            user_role="SALES_EXECUTIVE",
            action="Updated Lead Status",
            entity=f"{lead['first_name']} {lead['last_name']} ({lead['company']})",
            entity_id=lead_id,
            details=f"Status changed from {old_status} to {updates['status']}",
            before_value=old_status,
            after_value=updates["status"]
        )
    return lead

@router.delete("/leads/{lead_id}")
def delete_lead(lead_id: str):
    db.leads = [l for l in db.leads if l["id"] != lead_id]
    return {"success": True}

@router.post("/leads/{lead_id}/convert")
def convert_lead(lead_id: str, payload: Dict[str, Any]):
    """Convert a lead into Contact + Company (if needed) + Deal"""
    lead = next((l for l in db.leads if l["id"] == lead_id), None)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead["status"] == "Converted":
        raise HTTPException(status_code=400, detail="Lead already converted")

    # Check if company already exists
    existing_company = next((c for c in db.companies if c["name"].lower() == lead["company"].lower()), None)
    if not existing_company:
        comp_id = f"comp-{len(db.companies) + 1}"
        existing_company = {
            "id": comp_id,
            "name": lead["company"],
            "industry": lead.get("industry", "IT Services"),
            "city": lead.get("city", "Mumbai"),
            "state": lead.get("state", "Maharashtra"),
            "gstin": payload.get("gstin", ""),
            "pan": payload.get("pan", ""),
            "contacts_count": 1,
            "active_deals_count": 1,
            "total_revenue": 0.0,
            "customer_status": "Prospect",
            "customer_since": datetime.now().strftime("%d %b %Y"),
            "customer_health": 75,
            "churn_risk": "Low",
            "churn_probability": 20,
            "ai_recommendation": "Newly converted — schedule kickoff meeting.",
            "website": payload.get("website", ""),
            "employees": payload.get("employees", "50-100"),
            "contact_ids": [],
            "deal_ids": [],
            "lead_ids": [lead_id]
        }
        db.companies.insert(0, existing_company)

    # Check if contact already exists
    existing_contact = next((c for c in db.contacts if c["email"] == lead["email"]), None)
    if not existing_contact:
        con_id = f"con-{len(db.contacts) + 1}"
        existing_contact = {
            "id": con_id,
            "name": f"{lead['first_name']} {lead['last_name']}",
            "company": lead["company"],
            "company_id": existing_company["id"],
            "designation": lead.get("job_title", "Director"),
            "email": lead["email"],
            "phone": lead["phone"],
            "city": lead.get("city", "Mumbai"),
            "state": lead.get("state", "Maharashtra"),
            "status": "Active",
            "owner": lead.get("assigned_to", "Amit Sharma"),
            "owner_id": lead.get("assigned_to_id"),
            "last_contact": "Today",
            "created_at": datetime.now().strftime("%d %b %Y"),
            "ai_summary": f"Converted from lead. {lead.get('ai_summary', '')}",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "deal_ids": [],
            "lead_ids": [lead_id],
            "engagement_score": lead.get("lead_score", 70),
            "lead_score": lead.get("lead_score", 70)
        }
        db.contacts.insert(0, existing_contact)
        if "contact_ids" not in existing_company:
            existing_company["contact_ids"] = []
        existing_company["contact_ids"].append(con_id)

    # Create the deal
    deal_id = f"deal-{len(db.deals) + 1}"
    new_deal = {
        "id": deal_id,
        "company_name": existing_company["name"],
        "company_id": existing_company["id"],
        "contact_name": existing_contact["name"],
        "contact_id": existing_contact["id"],
        "deal_name": payload.get("deal_name", f"{lead['company']} — CRM Opportunity"),
        "description": payload.get("description", lead.get("notes", "Converted from lead")),
        "deal_value": float(payload.get("deal_value", lead.get("lead_value", 300000))),
        "stage": payload.get("stage", "Qualified"),
        "expected_close_date": payload.get("expected_close_date", lead.get("expected_closing", (datetime.now() + timedelta(days=30)).strftime("%d %b %Y"))),
        "owner": lead.get("assigned_to", "Amit Sharma"),
        "owner_id": lead.get("assigned_to_id"),
        "priority": payload.get("priority", "Normal"),
        "probability": 50,
        "win_factors": ["Converted from qualified lead", f"Lead score: {lead.get('lead_score', 70)}/100"],
        "risk_factor": None,
        "risk_factors": [],
        "ai_recommendation": "Follow up within 24 hours to maintain conversion momentum.",
        "created_at": datetime.now().strftime("%d %b %Y"),
        "last_updated": datetime.now().strftime("%d %b %Y"),
        "days_in_stage": 0,
        "lead_id": lead_id
    }
    db.deals.insert(0, new_deal)

    # Update existing company deal count
    existing_company["active_deals_count"] = len([d for d in db.deals if d.get("company_id") == existing_company["id"] and d["stage"] != "Deal Closed"])
    if "deal_ids" not in existing_company:
        existing_company["deal_ids"] = []
    existing_company["deal_ids"].append(deal_id)

    # Update lead status to Converted and link entities
    lead["status"] = "Converted"
    lead["company_id"] = existing_company["id"]
    lead["contact_id"] = existing_contact["id"]
    if "deal_ids" not in lead:
        lead["deal_ids"] = []
    lead["deal_ids"].append(deal_id)

    db.add_audit_log(
        user_name=lead.get("assigned_to", "System"),
        user_role="SALES_EXECUTIVE",
        action="Converted Lead",
        entity=f"{lead['first_name']} {lead['last_name']} ({lead['company']})",
        entity_id=lead_id,
        details=f"Created Contact: {existing_contact['name']}, Deal: {new_deal['deal_name']} (₹{new_deal['deal_value']:,.0f})",
        before_value="Qualified",
        after_value="Converted"
    )

    db.add_notification(
        title="Lead Converted Successfully",
        message=f"{lead['first_name']} {lead['last_name']} converted. Deal '{new_deal['deal_name']}' created for ₹{new_deal['deal_value']:,.0f}.",
        type_="success",
        action_link="deals",
        action_label="View Deal"
    )

    return {
        "success": True,
        "contact": existing_contact,
        "company": existing_company,
        "deal": new_deal
    }

# ==================== CONTACTS ====================
@router.get("/contacts")
def list_contacts():
    return db.contacts

@router.get("/contacts/{contact_id}")
def get_contact(contact_id: str):
    contact = next((c for c in db.contacts if c["id"] == contact_id), None)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@router.get("/contacts/{contact_id}/360")
def get_contact_360(contact_id: str):
    contact = next((c for c in db.contacts if c["id"] == contact_id), None)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    company = next((c for c in db.companies if c["id"] == contact.get("company_id")), None)
    deals = [d for d in db.deals if d.get("contact_id") == contact_id or d.get("company_id") == contact.get("company_id")]
    activities = [a for a in db.activities if a.get("contact_id") == contact_id or a.get("company_id") == contact.get("company_id")]
    tasks = [t for t in db.tasks if t.get("related_contact_id") == contact_id or t.get("related_company_id") == contact.get("company_id")]
    events = [e for e in db.events if e.get("contact_id") == contact_id]

    deal_value = sum(d["deal_value"] for d in deals if d["stage"] != "Deal Closed")
    open_tasks = len([t for t in tasks if t["status"] not in ["Done"]])

    return {
        **contact,
        "related_company": company,
        "deals": deals,
        "activities": activities,
        "tasks": tasks,
        "events": events,
        "crm_metrics": {
            "deal_value": deal_value,
            "deal_value_formatted": f"₹{deal_value/100000:.1f} L",
            "open_tasks": open_tasks,
            "total_activities": len(activities),
            "active_deals": len([d for d in deals if d["stage"] != "Deal Closed"]),
            "engagement_score": contact.get("engagement_score", 75),
            "lead_score": contact.get("lead_score", 70)
        }
    }

@router.post("/contacts")
def create_contact(contact_data: Dict[str, Any]):
    new_id = f"con-{len(db.contacts) + 1}"
    contact = {
        "id": new_id,
        "name": contact_data.get("name", "New Contact"),
        "company": contact_data.get("company", "Company"),
        "company_id": contact_data.get("company_id"),
        "designation": contact_data.get("designation", "Director"),
        "email": contact_data.get("email", ""),
        "phone": contact_data.get("phone", "+91 98000 00000"),
        "city": contact_data.get("city", "Mumbai"),
        "state": contact_data.get("state", "Maharashtra"),
        "status": "Active",
        "owner": contact_data.get("owner", "Amit Sharma"),
        "owner_id": contact_data.get("owner_id"),
        "last_contact": "Today",
        "created_at": datetime.now().strftime("%d %b %Y"),
        "ai_summary": "Recently added key stakeholder.",
        "avatar": contact_data.get("avatar", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"),
        "deal_ids": [],
        "lead_ids": [],
        "engagement_score": 60,
        "lead_score": 60
    }
    db.contacts.insert(0, contact)
    db.add_audit_log(
        user_name=contact.get("owner", "System"),
        user_role="SALES_EXECUTIVE",
        action="Created Contact",
        entity=contact["name"],
        entity_id=new_id,
        details=f"Contact added at {contact['company']}"
    )
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

@router.get("/companies/{comp_id}/360")
def get_company_360(comp_id: str):
    comp = next((c for c in db.companies if c["id"] == comp_id), None)
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")

    contacts = [c for c in db.contacts if c.get("company_id") == comp_id or c.get("company") == comp["name"]]
    deals = [d for d in db.deals if d.get("company_id") == comp_id or d.get("company_name") == comp["name"]]
    activities = [a for a in db.activities if a.get("company_id") == comp_id or a.get("customer_name") == comp["name"]]
    tasks = [t for t in db.tasks if t.get("related_company_id") == comp_id or t.get("customer_name") == comp["name"]]
    events = [e for e in db.events if e.get("company_id") == comp_id or e.get("customer_name") == comp["name"]]

    open_deals = [d for d in deals if d["stage"] != "Deal Closed"]
    won_deals = [d for d in deals if d["stage"] == "Deal Closed"]
    pipeline_value = sum(d["deal_value"] for d in open_deals)
    won_value = sum(d["deal_value"] for d in won_deals)

    # Health score explanation
    health = comp.get("customer_health", 80)
    health_factors = []
    if len(activities) == 0:
        health_factors.append("No recent activity logged")
    if comp.get("churn_risk") == "High":
        health_factors.append("High churn probability detected")
        health_factors.append("Support issue unresolved")
    elif comp.get("churn_risk") == "Medium":
        health_factors.append("Reduced engagement in past 21 days")
    else:
        health_factors.append("Regular team logins and product usage")
    if open_deals:
        health_factors.append(f"{len(open_deals)} active deal(s) in pipeline")

    return {
        **comp,
        "contacts": contacts,
        "deals": deals,
        "activities": activities[:10],
        "tasks": tasks[:6],
        "events": events[:6],
        "metrics": {
            "pipeline_value": pipeline_value,
            "pipeline_value_formatted": f"₹{pipeline_value/100000:.1f} L",
            "won_value": won_value,
            "won_value_formatted": f"₹{won_value/100000:.1f} L",
            "open_deals": len(open_deals),
            "won_deals": len(won_deals),
            "total_contacts": len(contacts),
            "open_tasks": len([t for t in tasks if t["status"] not in ["Done"]])
        },
        "health_factors": health_factors,
        "revenue_history": [
            {"month": "April", "value": comp["total_revenue"] * 0.12},
            {"month": "May", "value": comp["total_revenue"] * 0.15},
            {"month": "June", "value": comp["total_revenue"] * 0.18},
            {"month": "July", "value": comp["total_revenue"] * 0.22},
            {"month": "August", "value": comp["total_revenue"] * 0.33}
        ]
    }

@router.post("/companies")
def create_company(comp_data: Dict[str, Any]):
    new_id = f"comp-{len(db.companies) + 1}"
    comp = {
        "id": new_id,
        "name": comp_data.get("name", "New Company"),
        "industry": comp_data.get("industry", "IT Services"),
        "city": comp_data.get("city", "Mumbai"),
        "state": comp_data.get("state", "Maharashtra"),
        "gstin": comp_data.get("gstin", ""),
        "pan": comp_data.get("pan", ""),
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
        "employees": comp_data.get("employees", "50-100"),
        "contact_ids": [],
        "deal_ids": [],
        "lead_ids": []
    }
    db.companies.insert(0, comp)
    return comp

# ==================== DEALS ====================
@router.get("/deals")
def list_deals():
    return db.deals

@router.get("/deals/{deal_id}")
def get_deal(deal_id: str):
    deal = next((d for d in db.deals if d["id"] == deal_id), None)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal

@router.get("/deals/{deal_id}/detail")
def get_deal_detail(deal_id: str):
    deal = next((d for d in db.deals if d["id"] == deal_id), None)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    company = next((c for c in db.companies if c["id"] == deal.get("company_id")), None)
    contact = next((c for c in db.contacts if c["id"] == deal.get("contact_id")), None)
    activities = [a for a in db.activities if a.get("deal_id") == deal_id or a.get("company_id") == deal.get("company_id")]
    tasks = [t for t in db.tasks if t.get("related_entity_id") == deal_id or t.get("related_company_id") == deal.get("company_id")]
    events = [e for e in db.events if e.get("deal_id") == deal_id]

    # Build timeline from activities + events + tasks
    timeline = []
    for a in activities:
        timeline.append({
            "type": a["type"],
            "title": a["title"],
            "date": a["date"],
            "time": a.get("time", ""),
            "performed_by": a.get("performed_by", ""),
            "notes": a.get("notes", ""),
            "item_type": "activity"
        })
    for e in events:
        timeline.append({
            "type": e["event_type"],
            "title": e["title"],
            "date": e["date"],
            "time": e.get("time", ""),
            "performed_by": ", ".join(e.get("attendees", [])),
            "notes": e.get("description", ""),
            "item_type": "event"
        })
    timeline.sort(key=lambda x: x.get("date", ""), reverse=True)

    # AI deal risk assessment
    risk_level = "Low"
    if deal.get("probability", 50) < 40:
        risk_level = "High"
    elif deal.get("probability", 50) < 65:
        risk_level = "Medium"

    return {
        **deal,
        "related_company": company,
        "related_contact": contact,
        "activities": activities,
        "tasks": tasks,
        "events": events,
        "timeline": timeline,
        "ai_intelligence": {
            "win_probability": deal.get("probability", 50),
            "predicted_revenue": deal.get("deal_value", 0) * deal.get("probability", 50) / 100,
            "predicted_revenue_formatted": f"₹{(deal.get('deal_value', 0) * deal.get('probability', 50) / 100) / 100000:.2f} L",
            "risk_level": risk_level,
            "risk_factors": deal.get("risk_factors", []),
            "win_factors": deal.get("win_factors", []),
            "next_best_action": deal.get("ai_recommendation", "Continue engagement and monitor response."),
            "days_in_stage": deal.get("days_in_stage", 0)
        }
    }

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
        "company_id": req.company_id if hasattr(req, 'company_id') else None,
        "deal_name": req.deal_name,
        "description": req.description,
        "deal_value": req.deal_value,
        "stage": req.stage,
        "expected_close_date": req.expected_close_date,
        "owner": req.owner,
        "owner_id": None,
        "priority": req.priority,
        "probability": prob,
        "win_factors": ["Initial opportunity created", "Budget aligned"],
        "risk_factor": None,
        "risk_factors": [],
        "ai_recommendation": "Send formal introductory deck and confirm technical evaluation team.",
        "created_at": datetime.now().strftime("%d %b %Y"),
        "last_updated": datetime.now().strftime("%d %b %Y"),
        "contact_name": req.contact_name or "Primary Contact",
        "contact_id": None,
        "days_in_stage": 0,
        "lead_id": None
    }
    db.deals.insert(0, new_deal)

    db.add_audit_log(
        user_name=req.owner,
        user_role="SALES_EXECUTIVE",
        action="Created Deal",
        entity=f"{req.deal_name} ({req.company_name})",
        entity_id=new_id,
        details=f"Value: ₹{req.deal_value:,.0f}, Stage: {req.stage}",
        after_value=req.stage
    )

    return new_deal

@router.put("/deals/{deal_id}")
def update_deal(deal_id: str, updates: Dict[str, Any]):
    deal = next((d for d in db.deals if d["id"] == deal_id), None)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    old_stage = deal.get("stage")
    old_prob = deal.get("probability")
    deal.update(updates)
    deal["last_updated"] = datetime.now().strftime("%d %b %Y")

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
            entity_id=deal_id,
            details=f"Moved from {old_stage} to {new_stage} (Value: ₹{deal['deal_value']:,.0f})",
            before_value=old_stage,
            after_value=new_stage
        )

        db.add_notification(
            title="Deal Stage Updated",
            message=f"{deal['deal_name']} moved to {new_stage}. New win probability: {deal['probability']}%.",
            type_="info",
            action_link="deals",
            action_label="View Deal"
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
        "assigned_to_id": getattr(req, 'assigned_to_id', None),
        "assigned_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "comments_count": 0,
        "created_date": datetime.now().strftime("%d %b %Y"),
        "description": req.description,
        "related_entity_type": getattr(req, 'related_entity_type', None),
        "related_entity_id": getattr(req, 'related_entity_id', None),
        "related_company_id": getattr(req, 'related_company_id', None),
        "related_contact_id": getattr(req, 'related_contact_id', None),
        "is_ai_generated": getattr(req, 'is_ai_generated', False)
    }
    db.tasks.insert(0, new_task)

    db.add_audit_log(
        user_name=req.assigned_to,
        user_role="SALES_EXECUTIVE",
        action="Created Task" + (" (AI Generated)" if new_task["is_ai_generated"] else ""),
        entity=f"{new_id}: {req.title}",
        entity_id=new_id,
        details=f"Customer: {req.customer_name}, Priority: {req.priority}, Due: {req.due_date}",
        after_value=req.status
    )

    if new_task["is_ai_generated"]:
        db.add_notification(
            title="AI Created Task",
            message=f"AI Assistant created task: '{req.title}' for {req.customer_name}.",
            type_="info",
            action_link="tasks",
            action_label="View Task"
        )

    return new_task

@router.put("/tasks/{task_id}")
def update_task(task_id: str, updates: Dict[str, Any]):
    task = next((t for t in db.tasks if t["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    old_status = task.get("status")
    task.update(updates)
    if "status" in updates and updates["status"] != old_status:
        db.add_audit_log(
            user_name=task.get("assigned_to", "System"),
            user_role="SALES_EXECUTIVE",
            action="Updated Task Status",
            entity=f"{task_id}: {task['title']}",
            entity_id=task_id,
            details=f"Status: {old_status} → {updates['status']}",
            before_value=old_status,
            after_value=updates["status"]
        )
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
        "company_id": getattr(req, 'company_id', None),
        "contact_id": getattr(req, 'contact_id', None),
        "deal_id": getattr(req, 'deal_id', None),
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
        entity_id=new_id,
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
        "company_id": getattr(req, 'company_id', None),
        "contact_id": getattr(req, 'contact_id', None),
        "deal_id": getattr(req, 'deal_id', None),
        "attendees": req.attendees,
        "location": req.location,
        "description": req.description
    }
    db.events.insert(0, new_event)

    # Also log as activity
    db.activities.insert(0, {
        "id": f"act-{len(db.activities) + 1}",
        "type": "Meeting" if req.event_type in ["Meeting", "Demo"] else req.event_type,
        "title": f"Scheduled: {req.title}",
        "customer_name": req.customer_name,
        "company_id": new_event["company_id"],
        "contact_id": new_event["contact_id"],
        "deal_id": new_event["deal_id"],
        "time": req.time,
        "date": req.date,
        "performed_by": req.attendees[0] if req.attendees else "System",
        "notes": req.description
    })

    db.add_audit_log(
        user_name=req.attendees[0] if req.attendees else "System",
        user_role="SALES_EXECUTIVE",
        action="Scheduled Event",
        entity=req.title,
        entity_id=new_id,
        details=f"Type: {req.event_type}, Date: {req.date} {req.time}, Customer: {req.customer_name}"
    )

    return new_event

@router.put("/events/{event_id}")
def update_event(event_id: str, updates: Dict[str, Any]):
    event = next((e for e in db.events if e["id"] == event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    old_date = event.get("date")
    old_time = event.get("time")
    event.update(updates)

    db.add_audit_log(
        user_name=event.get("attendees", ["System"])[0] if event.get("attendees") else "System",
        user_role="SALES_EXECUTIVE",
        action="Updated / Rescheduled Event",
        entity=event.get("title", event_id),
        entity_id=event_id,
        details=f"Updated to Date: {event.get('date')} {event.get('time')} (Previous: {old_date} {old_time})",
        before_value=f"{old_date} {old_time}",
        after_value=f"{event.get('date')} {event.get('time')}"
    )
    return event

@router.delete("/events/{event_id}")
def delete_event(event_id: str):
    event = next((e for e in db.events if e["id"] == event_id), None)
    if event:
        db.add_audit_log(
            user_name="System",
            user_role="SALES_EXECUTIVE",
            action="Cancelled Event",
            entity=event.get("title", event_id),
            entity_id=event_id,
            details=f"Cancelled meeting/demo with {event.get('customer_name')}"
        )
    db.events = [e for e in db.events if e["id"] != event_id]
    return {"success": True}

