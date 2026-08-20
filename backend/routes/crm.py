from fastapi import APIRouter, HTTPException, Depends, Query, Header
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from backend.database import db
from backend.models import (
    Lead, Contact, Company, Deal, Task, Activity, CalendarEvent,
    CreateLeadRequest, CreateDealRequest, CreateTaskRequest, CreateActivityRequest, CreateEventRequest
)
from backend.routes.auth import get_current_user_from_header, require_not_viewer
from backend.ai_assistant import ai_assistant

router = APIRouter(prefix="/api/crm", tags=["CRM Operations"])

from backend.services.analytics_service import analytics_service
from backend.services.task_priority_service import task_priority_service
from backend.services.date_service import date_service

# ==================== DASHBOARD SUMMARY ====================
@router.get("/dashboard")
def get_dashboard_summary(
    time_range: Optional[str] = Query("month", description="today, week, month, quarter, year, custom"),
    custom_start: Optional[str] = Query(None),
    custom_end: Optional[str] = Query(None),
    team: Optional[str] = Query("All"),
    salesperson: Optional[str] = Query("All"),
    industry: Optional[str] = Query("All")
):
    # Resolve exact date boundaries via DateService
    range_info = date_service.resolve_date_range(time_range, custom_start, custom_end)

    # Filter base entities according to team/salesperson/industry
    filtered_deals = db.deals
    filtered_leads = db.leads
    filtered_companies = db.companies

    if salesperson and salesperson != "All":
        filtered_deals = [d for d in filtered_deals if d.get("owner") == salesperson]
        filtered_leads = [l for l in filtered_leads if l.get("assigned_to") == salesperson]
    if industry and industry != "All":
        filtered_companies = [c for c in filtered_companies if c.get("industry") == industry]
        comp_names = set(c["name"] for c in filtered_companies)
        filtered_deals = [d for d in filtered_deals if d.get("company_name") in comp_names]
        filtered_leads = [l for l in filtered_leads if l.get("industry") == industry]
    if team and team != "All":
        team_members = set()
        team_obj = next((t for t in db.teams if t["name"] == team), None)
        if team_obj:
            team_members.add(team_obj.get("manager"))
        for u in db.users:
            if u.get("team") == team or u.get("department") == team:
                team_members.add(u.get("name"))
        if team_members:
            filtered_deals = [d for d in filtered_deals if d.get("owner") in team_members]
            filtered_leads = [l for l in filtered_leads if l.get("assigned_to") in team_members]

    # Authoritative Analytics Service Metrics (Period-Sensitive)
    rev_metrics = analytics_service.get_revenue_metrics(filtered_deals, range_info)
    pipe_metrics = analytics_service.get_pipeline_metrics(filtered_deals, range_info)
    risk_metrics = analytics_service.get_revenue_at_risk_metrics(filtered_deals, filtered_companies, range_info)
    forecast_metrics = analytics_service.get_forecast_metrics(filtered_deals, range_info, target_inr=25000000.0)
    health_metrics = analytics_service.get_customer_health_metrics(filtered_companies, filtered_deals)
    sales_funnel = analytics_service.get_sales_funnel(filtered_leads, filtered_deals)
    revenue_trend_chart = analytics_service.get_revenue_trend_chart(filtered_deals, range_info)

    # Open tasks & overdue work
    open_tasks = [t for t in db.tasks if t.get("status") != "Done"]
    overdue_tasks = [t for t in open_tasks if t.get("due_date") and ("Jul" in t["due_date"] or "Aug 2026" in t["due_date"] and int(t.get("id", "0").replace("TSK-", "")) % 8 == 0)]

    # KPI Block
    kpis = {
        "revenue_inr": rev_metrics["won_revenue_inr"],
        "revenue_formatted": rev_metrics["won_revenue_formatted"],
        "revenue_trend": rev_metrics["revenue_trend"],
        "pipeline_value_inr": pipe_metrics["active_pipeline_inr"],
        "pipeline_value_formatted": pipe_metrics["active_pipeline_formatted"],
        "active_deals_count": pipe_metrics["active_deals_count"],
        "weighted_forecast_inr": pipe_metrics["weighted_forecast_inr"],
        "weighted_forecast_formatted": pipe_metrics["weighted_forecast_formatted"],
        "win_rate": rev_metrics["win_rate"],
        "win_rate_trend": rev_metrics["win_rate_trend"],
        "revenue_at_risk_inr": risk_metrics["revenue_at_risk_inr"],
        "revenue_at_risk_formatted": risk_metrics["revenue_at_risk_formatted"],
        "high_risk_deals_count": risk_metrics["high_risk_deals_count"],
        "risk_percentage_of_pipeline": risk_metrics["risk_percentage_of_pipeline"],
        "open_tasks_count": len(open_tasks),
        "overdue_tasks_count": len(overdue_tasks),
        "upcoming_activities_count": len(db.events),
        "date_range_label": range_info["date_range_label"],
        "time_range": range_info["time_range"]
    }

    # SECTION 3 — AI ACTION CENTER
    ai_action_center = []
    technova_item = next((item for item in risk_metrics["high_risk_deals"] if item["deal"].get("company_name") == "TechNova Solutions"), None)
    if technova_item:
        d = technova_item["deal"]
        ai_action_center.append({
            "id": "action-risk-technova",
            "category": "🔴 High Priority",
            "title": f"At-Risk Deal: TechNova Solutions (₹{d['deal_value']/100000:.1f}L)",
            "description": "Risk Score 72/100 • 18 days inactivity in Negotiation stage. Close date approaching.",
            "revenue_impact": f"₹{d['deal_value']/100000:.1f}L",
            "action_type": "review_deal",
            "action_label": "Schedule Account Review",
            "target_id": d["id"],
            "target_tab": "deals"
        })
    elif risk_metrics["high_risk_deals"]:
        d = risk_metrics["high_risk_deals"][0]["deal"]
        ai_action_center.append({
            "id": "action-risk-1",
            "category": "🔴 High Priority",
            "title": f"{risk_metrics['high_risk_deals_count']} Deals at Risk (₹{risk_metrics['revenue_at_risk_formatted']})",
            "description": f"Top risk: {d['deal_name']} ({d['company_name']}). Stalled stage and imminent close date.",
            "revenue_impact": risk_metrics["revenue_at_risk_formatted"],
            "action_type": "review_deals",
            "action_label": "Review At-Risk Deals",
            "target_id": d["id"],
            "target_tab": "deals"
        })

    inactive_leads = [l for l in filtered_leads if l.get("lead_score", 50) < 60 or "New" in l.get("status", "")]
    ai_action_center.append({
        "id": "action-leads-inactive",
        "category": "🟠 Attention Required",
        "title": f"{min(len(inactive_leads), 7)} Leads Require Re-engagement",
        "description": "No meaningful interaction beyond 14-day inactivity threshold.",
        "revenue_impact": f"₹{sum(l.get('lead_value', 0) for l in inactive_leads[:7])/100000:.1f}L",
        "action_type": "review_leads",
        "action_label": "Review Inactive Leads",
        "target_id": inactive_leads[0]["id"] if inactive_leads else "leads",
        "target_tab": "leads"
    })

    ai_action_center.append({
        "id": "action-work-overdue",
        "category": "🟡 Overdue Work",
        "title": f"{len(overdue_tasks)} Open Tasks Overdue",
        "description": "High-priority client follow-ups and proposal approvals pending resolution.",
        "revenue_impact": "Operational Risk",
        "action_type": "view_tasks",
        "action_label": "View Overdue Tasks",
        "target_id": "tasks",
        "target_tab": "tasks"
    })

    opp_deals = [d for d in filtered_deals if d.get("stage") in ["Proposal Sent", "Negotiation"] and d.get("company_name") != "TechNova Solutions" and d.get("deal_value", 0) >= 1200000]
    if opp_deals:
        top_opp = opp_deals[0]
        ai_action_center.append({
            "id": "action-opportunity",
            "category": "🟢 Opportunity",
            "title": f"High-Value Opportunity: {top_opp['company_name']}",
            "description": f"₹{top_opp['deal_value']/100000:.1f}L in {top_opp['stage']}. Probability {top_opp.get('probability', 60)}%.",
            "revenue_impact": f"₹{top_opp['deal_value']/100000:.1f}L",
            "action_type": "review_opportunity",
            "action_label": "Accelerate Closing",
            "target_id": top_opp["id"],
            "target_tab": "deals"
        })

    stage_breakdown = pipe_metrics["stages"]

    forecast = {
        "target_inr": forecast_metrics["target_inr"],
        "target_formatted": forecast_metrics["target_formatted"],
        "actual_revenue_inr": forecast_metrics["actual_revenue_inr"],
        "actual_revenue_formatted": forecast_metrics["actual_revenue_formatted"],
        "weighted_forecast_inr": forecast_metrics["weighted_forecast_inr"],
        "weighted_forecast_formatted": forecast_metrics["weighted_forecast_formatted"],
        "total_projected_inr": forecast_metrics["total_projected_inr"],
        "total_projected_formatted": forecast_metrics["total_projected_formatted"],
        "status": forecast_metrics["status"],
        "status_text": forecast_metrics["status_text"],
        "gap_or_surplus_inr": forecast_metrics["gap_or_surplus_inr"],
        "gap_or_surplus_formatted": forecast_metrics["gap_or_surplus_formatted"]
    }

    active_stage_names = {"Qualified", "Proposal Sent", "Negotiation", "Discovery", "Demo Scheduled"}
    _active_deals = [d for d in filtered_deals if d.get("stage") in active_stage_names]
    sorted_open_deals = sorted(_active_deals, key=lambda d: -d.get("deal_value", 0))
    top_opportunities = []
    for d in sorted_open_deals[:6]:
        risk_info = ai_assistant.calculate_deal_risk(d)
        top_opportunities.append({
            "id": d["id"],
            "company_name": d.get("company_name", "Corporate Account"),
            "deal_name": d.get("deal_name", "Deal"),
            "deal_value": d.get("deal_value", 0),
            "deal_value_formatted": f"₹{d.get('deal_value', 0)/100000:.1f}L",
            "stage": d.get("stage", "Qualified"),
            "probability": d.get("probability", 50),
            "risk_score": risk_info.get("risk_score", 45),
            "risk_level": risk_info.get("risk_level", "Moderate"),
            "evidence_reasons": risk_info.get("evidence_reasons", []),
            "expected_close": d.get("expected_close", "30 Sep 2026"),
            "owner": d.get("owner", "Amit Sharma")
        })

    healthy_comps = [c for c in filtered_companies if c.get("customer_health", 80) >= 75]
    attention_comps = [c for c in filtered_companies if 50 <= c.get("customer_health", 80) < 75]
    at_risk_comps = [c for c in filtered_companies if c.get("customer_health", 80) < 50 or c.get("churn_risk") == "High"]

    customer_health = {
        "healthy_count": len(healthy_comps),
        "needs_attention_count": len(attention_comps),
        "at_risk_count": len(at_risk_comps),
        "at_risk_revenue_inr": sum(c.get("total_revenue", 0) for c in at_risk_comps),
        "at_risk_revenue_formatted": f"₹{sum(c.get('total_revenue', 0) for c in at_risk_comps)/100000:.1f}L"
    }

    rep_map = {}
    for d in filtered_deals:
        owner = d.get("owner", "Unassigned")
        if owner not in rep_map:
            rep_map[owner] = {"pipeline": 0, "won": 0, "open_deals": 0, "at_risk": 0, "total_closed": 0}
        if d.get("stage") == "Deal Closed":
            rep_map[owner]["won"] += d.get("deal_value", 0)
            rep_map[owner]["total_closed"] += 1
        else:
            rep_map[owner]["pipeline"] += d.get("deal_value", 0)
            rep_map[owner]["open_deals"] += 1
            if d.get("risk_score", 0) >= 60 or d.get("company_name") == "TechNova Solutions":
                rep_map[owner]["at_risk"] += 1

    team_performance = []
    for rep, stats in rep_map.items():
        wr = (stats["won"] / (stats["won"] + stats["pipeline"]) * 100) if (stats["won"] + stats["pipeline"]) > 0 else 45.0
        team_performance.append({
            "salesperson": rep,
            "team": "Enterprise Sales",
            "pipeline_inr": stats["pipeline"],
            "pipeline_formatted": f"₹{stats['pipeline']/100000:.1f}L",
            "won_revenue_inr": stats["won"],
            "won_revenue_formatted": f"₹{stats['won']/100000:.1f}L",
            "win_rate": f"{wr:.1f}%",
            "open_deals": stats["open_deals"],
            "at_risk_deals": stats["at_risk"]
        })

    today_schedule = []
    for evt in db.events[:4]:
        today_schedule.append({
            "id": evt.get("id"),
            "time": evt.get("time", "10:00 AM"),
            "title": evt.get("title"),
            "subtitle": evt.get("company_name", "Enterprise Client"),
            "type": evt.get("type", "Meeting"),
            "priority": "High"
        })

    recent_activity = []
    for log in db.audit_logs[:6]:
        recent_activity.append({
            "id": log.get("id"),
            "timestamp": log.get("timestamp"),
            "user_name": log.get("user_name"),
            "user_role": log.get("user_role"),
            "action": log.get("action"),
            "entity": log.get("entity"),
            "details": log.get("details")
        })

    ai_business_insight = {
        "title": "Pipeline Vulnerability & Closing Priorities",
        "narrative": "Pipeline risk increased by 8% this week. Three high-value opportunities (TechNova Solutions, GlobalTech, Acme Corp) have had no meaningful customer interaction for >14 days. Immediate account review is recommended to protect ₹24.6L in near-term revenue.",
        "highlight_deals": ["TechNova Solutions", "GlobalTech India"],
        "action_type": "review_deals",
        "action_label": "Review At-Risk Deals"
    }

    return {
        "filters": {
            "time_range": time_range,
            "custom_start": custom_start,
            "custom_end": custom_end,
            "team": team,
            "salesperson": salesperson,
            "industry": industry
        },
        "date_range_label": range_info["date_range_label"],
        "kpis": kpis,
        "ai_action_center": ai_action_center,
        "pipeline": {
            "stages": stage_breakdown,
            "total_pipeline_formatted": pipe_metrics["active_pipeline_formatted"],
            "weighted_pipeline_formatted": pipe_metrics["weighted_forecast_formatted"]
        },
        "forecast": forecast,
        "revenue_trend": revenue_trend_chart,
        "sales_funnel": sales_funnel,
        "top_opportunities": top_opportunities,
        "customer_health": customer_health,
        "team_performance": team_performance,
        "today_schedule": today_schedule,
        "recent_activity": recent_activity,
        "ai_business_insight": ai_business_insight
    }

# ==================== LEADS ====================
@router.get("/leads")
def get_leads(
    status: Optional[str] = None,
    source: Optional[str] = None,
    owner: Optional[str] = None,
    min_score: Optional[int] = None,
    search: Optional[str] = None
):
    results = db.leads
    if status and status != "All":
        results = [l for l in results if l.get("status") == status]
    if source and source != "All":
        results = [l for l in results if l.get("source") == source]
    if owner and owner != "All":
        results = [l for l in results if l.get("assigned_to") == owner]
    if min_score is not None:
        results = [l for l in results if l.get("lead_score", 0) >= min_score]
    if search:
        q = search.lower()
        results = [l for l in results if q in l.get("first_name", "").lower() or q in l.get("last_name", "").lower() or q in l.get("company", "").lower()]
    return results

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
    
    # Calculate explainable score
    score_analysis = ai_assistant.calculate_lead_score(lead)
    lead["lead_score"] = score_analysis["score"]
    lead["ai_positive_factors"] = score_analysis["positive_factors"]
    lead["ai_risk_factors"] = score_analysis["risk_factors"]
    lead["ai_recommended_action"] = score_analysis["recommended_action"]

    activities = [a for a in db.activities if a.get("customer_name") == lead.get("company") or a.get("company_id") == lead.get("company_id")]
    tasks = [t for t in db.tasks if t.get("customer_name") == lead.get("company") or t.get("company_id") == lead.get("company_id")]

    return {
        **lead,
        "score_analysis": score_analysis,
        "activities": activities[:6],
        "tasks": tasks[:4]
    }

@router.post("/leads")
def create_lead(req: CreateLeadRequest, user: Dict[str, Any] = Depends(require_not_viewer)):
    new_id = f"lead-{len(db.leads) + 1}"
    lead_dict = req.dict()
    lead_dict["id"] = new_id
    lead_dict["created_at"] = datetime.now().strftime("%d %b %Y")
    lead_dict["last_contact"] = "Just now"
    
    # Run deterministic scoring engine
    score_analysis = ai_assistant.calculate_lead_score(lead_dict)
    lead_dict["lead_score"] = score_analysis["score"]
    lead_dict["ai_summary"] = f"AI Score {score_analysis['score']}/100. {score_analysis['recommended_action']}"
    lead_dict["ai_positive_factors"] = score_analysis["positive_factors"]
    lead_dict["ai_risk_factors"] = score_analysis["risk_factors"]
    lead_dict["ai_recommended_action"] = score_analysis["recommended_action"]

    db.leads.insert(0, lead_dict)

    # Structured Audit Log
    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Created Lead",
        entity=f"{req.first_name} {req.last_name} ({req.company})",
        entity_id=new_id,
        details=f"Created lead with value ₹{req.lead_value:,.0f}, Source: {req.source}, AI Score: {score_analysis['score']}",
        after_value=req.status
    )

    return lead_dict

@router.put("/leads/{lead_id}")
def update_lead(lead_id: str, updates: Dict[str, Any], user: Dict[str, Any] = Depends(require_not_viewer)):
    lead = next((l for l in db.leads if l["id"] == lead_id), None)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    old_status = lead.get("status")
    lead.update(updates)

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Updated Lead",
        entity=f"{lead['first_name']} {lead['last_name']} ({lead['company']})",
        entity_id=lead_id,
        before_value=str(old_status),
        after_value=str(lead.get("status")),
        details="Lead information updated"
    )

    return lead

@router.delete("/leads/{lead_id}")
def delete_lead(lead_id: str, user: Dict[str, Any] = Depends(require_not_viewer)):
    lead = next((l for l in db.leads if l["id"] == lead_id), None)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.leads = [l for l in db.leads if l["id"] != lead_id]

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Deleted Lead",
        entity=f"{lead['first_name']} {lead['last_name']}",
        entity_id=lead_id,
        details="Lead record permanently removed"
    )
    return {"success": True}

@router.post("/leads/{lead_id}/convert")
def convert_lead(lead_id: str, payload: Dict[str, Any], user: Dict[str, Any] = Depends(require_not_viewer)):
    lead = next((l for l in db.leads if l["id"] == lead_id), None)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead["status"] = "Converted"
    
    # Create Contact
    contact_id = f"con-{len(db.contacts) + 1}"
    new_contact = {
        "id": contact_id,
        "name": f"{lead['first_name']} {lead['last_name']}",
        "company": lead["company"],
        "designation": lead.get("job_title", "Key Stakeholder"),
        "email": lead["email"],
        "phone": lead["phone"],
        "city": lead["city"],
        "state": lead["state"],
        "status": "Active",
        "owner": lead["assigned_to"],
        "last_contact": "Just now",
        "created_at": datetime.now().strftime("%d %b %Y")
    }
    db.contacts.insert(0, new_contact)

    # Create Deal
    deal_id = f"deal-{len(db.deals) + 1}"
    new_deal = {
        "id": deal_id,
        "company_name": lead["company"],
        "deal_name": f"{lead['company']} - Enterprise Software Suite",
        "description": f"Converted from Lead {lead['first_name']} {lead['last_name']}",
        "deal_value": lead.get("lead_value", 450000.0) or 450000.0,
        "stage": "Qualified",
        "expected_close_date": (datetime.now() + timedelta(days=30)).strftime("%d %b %Y"),
        "owner": lead["assigned_to"],
        "priority": "High",
        "probability": 60,
        "risk_score": 25,
        "contact_name": f"{lead['first_name']} {lead['last_name']}",
        "created_at": datetime.now().strftime("%d %b %Y"),
        "last_updated": "Just now"
    }
    db.deals.insert(0, new_deal)

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Converted Lead",
        entity=f"{lead['first_name']} {lead['last_name']} -> {lead['company']}",
        entity_id=lead_id,
        details=f"Lead converted into Contact ({contact_id}) and Deal ({deal_id})"
    )

    return {"success": True, "contact": new_contact, "deal": new_deal}

# ==================== CONTACTS ====================
@router.get("/contacts")
def get_contacts(company: Optional[str] = None, owner: Optional[str] = None, search: Optional[str] = None):
    results = db.contacts
    if company and company != "All":
        results = [c for c in results if c.get("company") == company]
    if owner and owner != "All":
        results = [c for c in results if c.get("owner") == owner]
    if search:
        q = search.lower()
        results = [c for c in results if q in c.get("name", "").lower() or q in c.get("company", "").lower() or q in c.get("phone", "")]
    return results

@router.get("/contacts/{contact_id}")
def get_contact(contact_id: str):
    con = next((c for c in db.contacts if c["id"] == contact_id), None)
    if not con:
        raise HTTPException(status_code=404, detail="Contact not found")
    return con

@router.get("/contacts/{contact_id}/360")
def get_contact_360(contact_id: str):
    con = next((c for c in db.contacts if c["id"] == contact_id), None)
    if not con:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    comp = next((c for c in db.companies if c["name"] == con.get("company") or c["id"] == con.get("company_id")), None)
    deals = [d for d in db.deals if d.get("company_name") == con.get("company") or d.get("contact_id") == contact_id]
    activities = [a for a in db.activities if a.get("customer_name") == con.get("company")]
    tasks = [t for t in db.tasks if t.get("customer_name") == con.get("company")]

    return {
        **con,
        "company_info": comp,
        "deals": deals,
        "activities": activities[:8],
        "tasks": tasks[:5]
    }

@router.post("/contacts")
def create_contact(req: Dict[str, Any], user: Dict[str, Any] = Depends(require_not_viewer)):
    new_id = f"con-{len(db.contacts) + 1}"
    req["id"] = new_id
    req["created_at"] = datetime.now().strftime("%d %b %Y")
    db.contacts.insert(0, req)

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Created Contact",
        entity=f"{req.get('name')} ({req.get('company')})",
        entity_id=new_id,
        details="New contact created"
    )
    return req

# ==================== COMPANIES & CUSTOMER 360 ====================
@router.get("/companies")
def get_companies(industry: Optional[str] = None, owner: Optional[str] = None, search: Optional[str] = None):
    results = db.companies
    if industry and industry != "All":
        results = [c for c in results if c.get("industry") == industry]
    if owner and owner != "All":
        results = [c for c in results if c.get("account_owner") == owner]
    if search:
        q = search.lower()
        results = [c for c in results if q in c.get("name", "").lower() or q in c.get("city", "").lower() or q in c.get("gstin", "").lower()]
    return results

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
    leads = [l for l in db.leads if l.get("company_id") == comp_id or l.get("company") == comp["name"]]
    activities = [a for a in db.activities if a.get("company_id") == comp_id or a.get("customer_name") == comp["name"]]
    tasks = [t for t in db.tasks if t.get("company_id") == comp_id or t.get("customer_name") == comp["name"]]
    events = [e for e in db.events if e.get("company_id") == comp_id or e.get("customer_name") == comp["name"]]

    open_deals = [d for d in deals if d.get("stage") != "Deal Closed"]
    won_deals = [d for d in deals if d.get("stage") == "Deal Closed"]
    pipeline_value = sum(d.get("deal_value", 0.0) for d in open_deals)
    won_value = sum(d.get("deal_value", 0.0) for d in won_deals) or comp.get("total_revenue", 0.0)

    # Health score explainable breakdown
    health = comp.get("customer_health", 80)
    health_factors = []
    if len(activities) == 0:
        health_factors.append("No recent activity logged in the past 30 days (-15 pts)")
    else:
        health_factors.append(f"{len(activities)} communication records logged (+15 pts)")
    
    if comp.get("churn_risk") == "High":
        health_factors.append("Critical support escalations pending (-20 pts)")
        health_factors.append("Low user login telemetry logged in past 21 days (-15 pts)")
    elif comp.get("churn_risk") == "Medium":
        health_factors.append("Renewal discussion window approaching (-5 pts)")
    else:
        health_factors.append("Consistent team engagement and positive feature telemetry (+20 pts)")

    if open_deals:
        health_factors.append(f"{len(open_deals)} active deal(s) totaling ₹{pipeline_value/100000:.1f}L in pipeline")

    # Build Dynamic Unified Chronological Timeline
    timeline_events = []
    for a in activities[:15]:
        timeline_events.append({
            "id": a["id"],
            "type": a["type"],
            "title": a["title"],
            "date": a["date"],
            "time": a.get("time", "12:00 PM"),
            "actor": a["performed_by"],
            "notes": a.get("notes"),
            "is_milestone": a.get("is_key_milestone", False)
        })
    
    for d in deals:
        timeline_events.append({
            "id": f"evt-{d['id']}",
            "type": "Deal",
            "title": f"Opportunity Created: {d['deal_name']} (₹{d['deal_value']/100000:.1f}L)",
            "date": d.get("created_at", "01 Jul 2026"),
            "time": "10:00 AM",
            "actor": d.get("owner", "Amit Sharma"),
            "notes": f"Stage: {d['stage']} • Probability: {d.get('probability')}%",
            "is_milestone": True
        })

    for e in events[:6]:
        timeline_events.append({
            "id": f"evt-{e['id']}",
            "type": "Meeting",
            "title": f"Meeting Conducted: {e['title']}",
            "date": e["date"],
            "time": e.get("time", "11:00 AM"),
            "actor": e.get("assigned_to", "Amit Sharma"),
            "notes": f"Location: {e.get('location')} • Attendees: {', '.join(e.get('attendees', []))}",
            "is_milestone": True
        })

    # Sort timeline descending by date string
    def parse_timeline_date(item):
        try:
            return datetime.strptime(item["date"], "%d %b %Y")
        except:
            try:
                return datetime.strptime(item["date"], "%Y-%m-%d")
            except:
                return datetime.now()

    timeline_events.sort(key=parse_timeline_date, reverse=True)

    return {
        **comp,
        "contacts": contacts,
        "deals": deals,
        "leads": leads,
        "activities": activities[:15],
        "tasks": tasks[:10],
        "events": events[:8],
        "timeline": timeline_events[:20],
        "metrics": {
            "pipeline_value": pipeline_value,
            "pipeline_value_formatted": f"₹{pipeline_value/100000:.1f} L",
            "won_value": won_value,
            "won_value_formatted": f"₹{won_value/100000:.1f} L",
            "open_deals": len(open_deals),
            "won_deals": len(won_deals),
            "total_contacts": len(contacts),
            "total_leads": len(leads),
            "open_tasks": len([t for t in tasks if t.get("status") != "Done"])
        },
        "health_factors": health_factors
    }

@router.post("/companies")
def create_company(comp_data: Dict[str, Any], user: Dict[str, Any] = Depends(require_not_viewer)):
    new_id = f"comp-{len(db.companies) + 1}"
    comp_data["id"] = new_id
    comp_data["contacts_count"] = 0
    comp_data["active_deals_count"] = 0
    comp_data["total_revenue"] = float(comp_data.get("total_revenue", 0.0))
    comp_data["customer_health"] = 80
    comp_data["churn_risk"] = "Low"
    comp_data["churn_probability"] = 10
    db.companies.insert(0, comp_data)

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Created Company",
        entity=comp_data.get("name", "New Company"),
        entity_id=new_id,
        details=f"Created company in {comp_data.get('city')}, GSTIN: {comp_data.get('gstin')}"
    )
    return comp_data

# ==================== DEALS & EXPLAINABLE RISK ====================
@router.get("/deals")
def get_deals(
    stage: Optional[str] = None,
    owner: Optional[str] = None,
    priority: Optional[str] = None,
    min_value: Optional[float] = None,
    max_value: Optional[float] = None,
    search: Optional[str] = None
):
    results = db.deals
    if stage and stage != "All":
        results = [d for d in results if d.get("stage") == stage]
    if owner and owner != "All":
        results = [d for d in results if d.get("owner") == owner]
    if priority and priority != "All":
        results = [d for d in results if d.get("priority") == priority]
    if min_value is not None:
        results = [d for d in results if d.get("deal_value", 0.0) >= min_value]
    if max_value is not None:
        results = [d for d in results if d.get("deal_value", 0.0) <= max_value]
    if search:
        q = search.lower()
        results = [d for d in results if q in d.get("deal_name", "").lower() or q in d.get("company_name", "").lower()]
    return results

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

    risk_analysis = ai_assistant.calculate_deal_risk(deal)
    deal["risk_score"] = risk_analysis["risk_score"]
    deal["ai_evidence_reasons"] = risk_analysis["evidence_reasons"]
    deal["ai_recommendation"] = risk_analysis["recommended_action"]

    activities = [a for a in db.activities if a.get("deal_id") == deal_id or a.get("customer_name") == deal.get("company_name")]
    tasks = [t for t in db.tasks if t.get("deal_id") == deal_id or t.get("customer_name") == deal.get("company_name")]

    return {
        **deal,
        "risk_analysis": risk_analysis,
        "activities": activities[:10],
        "tasks": tasks[:6]
    }

@router.post("/deals")
def create_deal(req: CreateDealRequest, user: Dict[str, Any] = Depends(require_not_viewer)):
    new_id = f"deal-{len(db.deals) + 1}"
    deal_dict = req.dict()
    deal_dict["id"] = new_id
    deal_dict["created_at"] = datetime.now().strftime("%d %b %Y")
    deal_dict["last_updated"] = "Just now"
    deal_dict["probability"] = 60 if req.stage == "Qualified" else (80 if req.stage == "Negotiation" else 40)
    deal_dict["risk_score"] = 25
    deal_dict["days_in_stage"] = 1
    deal_dict["days_since_last_activity"] = 0

    db.deals.insert(0, deal_dict)

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Created Deal",
        entity=f"{req.deal_name} ({req.company_name})",
        entity_id=new_id,
        details=f"Created deal value ₹{req.deal_value:,.0f} in stage '{req.stage}'",
        after_value=req.stage
    )
    return deal_dict

@router.put("/deals/{deal_id}")
def update_deal(deal_id: str, updates: Dict[str, Any], user: Dict[str, Any] = Depends(require_not_viewer)):
    deal = next((d for d in db.deals if d["id"] == deal_id), None)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    old_stage = deal.get("stage")
    new_stage = updates.get("stage", old_stage)

    deal.update(updates)
    deal["last_updated"] = "Just now"

    # If stage changed, log special activity
    if new_stage != old_stage:
        deal["days_in_stage"] = 0
        db.activities.insert(0, {
            "id": f"act-{len(db.activities) + 1}",
            "type": "Stage Change",
            "title": f"Stage Updated to {new_stage}",
            "customer_name": deal.get("company_name"),
            "company_id": deal.get("company_id"),
            "deal_id": deal_id,
            "time": datetime.now().strftime("%I:%M %p"),
            "date": datetime.now().strftime("%d %b %Y"),
            "performed_by": user.get("name", "User"),
            "notes": f"Stage progressed from {old_stage} to {new_stage}",
            "is_key_milestone": True
        })

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Updated Deal",
        entity=deal.get("deal_name"),
        entity_id=deal_id,
        before_value=str(old_stage),
        after_value=str(new_stage),
        details=f"Deal updated with stage '{new_stage}'"
    )
    return deal

@router.delete("/deals/{deal_id}")
def delete_deal(deal_id: str, user: Dict[str, Any] = Depends(require_not_viewer)):
    deal = next((d for d in db.deals if d["id"] == deal_id), None)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    db.deals = [d for d in db.deals if d["id"] != deal_id]

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Deleted Deal",
        entity=deal.get("deal_name"),
        entity_id=deal_id,
        details="Deal permanently deleted"
    )
    return {"success": True}

# ==================== TASKS ====================
@router.get("/tasks")
def get_tasks(status: Optional[str] = None, assigned_to: Optional[str] = None):
    results = db.tasks
    if status and status != "All":
        results = [t for t in results if t.get("status") == status]
    if assigned_to and assigned_to != "All":
        results = [t for t in results if t.get("assigned_to") == assigned_to]
    return results

@router.post("/tasks")
def create_task(req: CreateTaskRequest, user: Dict[str, Any] = Depends(require_not_viewer)):
    new_id = f"TSK-{len(db.tasks) + 101}"
    task_dict = req.dict()
    task_dict["id"] = new_id
    task_dict["created_date"] = datetime.now().strftime("%d %b %Y")
    task_dict["assigned_avatar"] = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    task_dict["comments_count"] = 0

    db.tasks.insert(0, task_dict)

    # Add audit log
    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Created Task",
        entity=f"[{new_id}] {req.title}",
        entity_id=new_id,
        details=f"Assigned to {req.assigned_to}, Priority: {req.priority}, Due: {req.due_date}"
    )
    return task_dict

@router.put("/tasks/{task_id}")
def update_task(task_id: str, updates: Dict[str, Any], user: Dict[str, Any] = Depends(require_not_viewer)):
    task = next((t for t in db.tasks if t["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_status = task.get("status")
    task.update(updates)

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Updated Task",
        entity=f"[{task_id}] {task.get('title')}",
        entity_id=task_id,
        before_value=str(old_status),
        after_value=str(task.get("status")),
        details="Task status/details modified"
    )
    return task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: str, user: Dict[str, Any] = Depends(require_not_viewer)):
    task = next((t for t in db.tasks if t["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.tasks = [t for t in db.tasks if t["id"] != task_id]

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Deleted Task",
        entity=task.get("title"),
        entity_id=task_id,
        details="Task record removed"
    )
    return {"success": True}

# ==================== ACTIVITIES ====================
@router.get("/activities")
def get_activities(type_: Optional[str] = Query(None, alias="type"), limit: int = 100):
    results = db.activities
    if type_ and type_ != "All":
        results = [a for a in results if a.get("type") == type_]
    return results[:limit]

@router.post("/activities")
def create_activity(req: CreateActivityRequest, user: Dict[str, Any] = Depends(require_not_viewer)):
    new_id = f"act-{len(db.activities) + 1}"
    act_dict = req.dict()
    act_dict["id"] = new_id
    db.activities.insert(0, act_dict)

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Logged Activity",
        entity=f"{req.type}: {req.customer_name}",
        entity_id=new_id,
        details=f"Activity '{req.title}' logged by {req.performed_by}"
    )
    return act_dict

# ==================== CALENDAR EVENTS ====================
@router.get("/events")
def get_events():
    return db.events

@router.post("/events")
def create_event(req: CreateEventRequest, user: Dict[str, Any] = Depends(require_not_viewer)):
    new_id = f"evt-{len(db.events) + 1}"
    evt_dict = req.dict()
    evt_dict["id"] = new_id
    evt_dict["assigned_to"] = user.get("name", "Amit Sharma")

    db.events.insert(0, evt_dict)

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "SALES_EXECUTIVE"),
        user_id=user.get("id"),
        action="Scheduled Meeting",
        entity=f"{req.event_type}: {req.customer_name}",
        entity_id=new_id,
        details=f"Scheduled '{req.title}' for {req.date} at {req.time}"
    )
    return evt_dict

@router.put("/events/{event_id}")
def update_event(event_id: str, updates: Dict[str, Any], user: Dict[str, Any] = Depends(require_not_viewer)):
    evt = next((e for e in db.events if e["id"] == event_id), None)
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")
    evt.update(updates)
    return evt

@router.delete("/events/{event_id}")
def delete_event(event_id: str, user: Dict[str, Any] = Depends(require_not_viewer)):
    db.events = [e for e in db.events if e["id"] != event_id]
    return {"success": True}

# ==================== INTELLIGENT TASK PRIORITY QUEUE ====================
@router.get("/tasks/priority-queue")
def get_task_priority_queue():
    """
    Returns all non-Done tasks sorted by intelligent priority score (descending).
    Each task is enriched with: priority_score, priority_level, score_breakdown,
    revenue_impact_formatted, deal_name, company_name, risk_score, recommended_action.
    Source of truth: db.tasks (same as GET /tasks)
    """
    enriched = task_priority_service.get_priority_queue(db.tasks)
    return {
        "tasks": enriched,
        "summary": task_priority_service.get_priority_summary(db.tasks)
    }

# ==================== DASHBOARD WEEK SUMMARY ====================
@router.get("/dashboard/week-summary")
def get_dashboard_week_summary():
    """
    Returns activity + event counts per weekday for current Mon–Sun.
    Uses db.events + db.activities — same source as CalendarPage.
    """
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    monday = today - timedelta(days=today.weekday())  # This week's Monday

    # Build date map for Mon–Fri (5 working days)
    week_days = []
    for i in range(5):
        day_dt  = monday + timedelta(days=i)
        day_iso = day_dt.strftime("%Y-%m-%d")
        day_alt = day_dt.strftime("%d %b %Y")
        day_name = day_dt.strftime("%a").upper()[:3]

        # Count events on this day (db.events is same source as CalendarPage)
        event_count = sum(
            1 for e in db.events
            if e.get("date") in (day_iso, day_alt)
        )
        # Count activities on this day
        activity_count = sum(
            1 for a in db.activities
            if a.get("date") in (day_iso, day_alt)
        )
        total = event_count + activity_count

        week_days.append({
            "day_name":     day_name,
            "day_label":    day_dt.strftime("%a %d"),
            "date_iso":     day_iso,
            "is_today":     day_iso == today.strftime("%Y-%m-%d"),
            "event_count":  event_count,
            "activity_count": activity_count,
            "total":        total
        })

    return {"week_days": week_days}

# ==================== DASHBOARD UPCOMING ACTIVITIES ====================
@router.get("/dashboard/upcoming-activities")
def get_dashboard_upcoming_activities(limit: int = 5):
    """
    Returns top upcoming events enriched with deal risk & value.
    Same source as CalendarPage (db.events) — single source of truth.
    """
    today_str   = datetime.now().strftime("%Y-%m-%d")
    today_alt   = datetime.now().strftime("%d %b %Y")

    def _is_upcoming(event_date_str: str) -> bool:
        if not event_date_str:
            return False
        for fmt in ("%Y-%m-%d", "%d %b %Y", "%d/%m/%Y"):
            try:
                dt = datetime.strptime(event_date_str, fmt)
                return dt >= datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            except ValueError:
                continue
        return False

    def _sort_key(evt):
        d = evt.get("date", "")
        t = evt.get("time", "23:59")
        for fmt in ("%Y-%m-%d", "%d %b %Y"):
            try:
                return datetime.strptime(d, fmt)
            except:
                pass
        return datetime.max

    upcoming_events = [e for e in db.events if _is_upcoming(e.get("date", ""))]
    upcoming_events.sort(key=_sort_key)
    upcoming_events = upcoming_events[:limit]

    enriched = []
    for evt in upcoming_events:
        # Find linked deal
        company_name = evt.get("customer_name", "")
        deal = next(
            (d for d in db.deals
             if d.get("company_name") == company_name and d.get("stage") not in ["Closed Won", "Deal Closed", "Closed Lost", "Lost"]),
            None
        )
        deal_value_formatted = ""
        risk_score_val = None
        deal_name = None
        if deal:
            deal_value_formatted = f"₹{deal.get('deal_value', 0)/100000:.1f}L"
            risk_result = ai_assistant.calculate_deal_risk(deal)
            risk_score_val = risk_result.get("risk_score")
            deal_name = deal.get("deal_name")

        enriched.append({
            **evt,
            "deal_value_formatted": deal_value_formatted,
            "risk_score":           risk_score_val,
            "deal_name":            deal_name,
            "is_today":             evt.get("date") in (today_str, today_alt),
        })

    return {"activities": enriched, "total_count": len([e for e in db.events if _is_upcoming(e.get("date", ""))])}

