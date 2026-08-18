from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from backend.database import db

router = APIRouter(prefix="/api/admin", tags=["Admin & Settings"])

# ==================== USERS & TEAMS ====================
@router.get("/users")
def list_users():
    return db.users

@router.post("/users")
def create_user(user_data: Dict[str, Any]):
    new_id = f"usr-{len(db.users) + 1}"
    user = {
        "id": new_id,
        "name": user_data.get("name", "Team Member"),
        "email": user_data.get("email", "member@nexoracrm.in"),
        "role": user_data.get("role", "SALES_EXECUTIVE"),
        "department": user_data.get("department", "Sales"),
        "avatar": user_data.get("avatar", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"),
        "status": "Active",
        "last_active": "Just now"
    }
    db.users.append(user)
    return user

# ==================== ROLES & PERMISSIONS ====================
@router.get("/permissions")
def get_permissions_matrix():
    return {
        "roles": [
            {
                "role": "ADMIN",
                "name": "System Administrator",
                "description": "Full unconstrained administrative access across all CRM records, AI controls, and system configuration.",
                "permissions": ["all", "manage_users", "view_audit_logs", "edit_settings", "manage_knowledge_base", "manage_deals", "manage_leads", "manage_tasks", "view_reports"]
            },
            {
                "role": "SALES_MANAGER",
                "name": "Sales Manager",
                "description": "Manages sales teams, approves discounts, oversees pipeline performance, and reviews team reports.",
                "permissions": ["manage_leads", "manage_deals", "manage_tasks", "view_reports", "view_analytics", "manage_contacts", "manage_companies", "use_ai_assistant"]
            },
            {
                "role": "SALES_EXECUTIVE",
                "name": "Sales Executive",
                "description": "Front-line sales representative handling assigned leads, active customer deals, tasks, and follow-ups.",
                "permissions": ["view_assigned_leads", "manage_assigned_deals", "manage_own_tasks", "log_activities", "use_ai_assistant", "view_contacts"]
            },
            {
                "role": "SUPPORT_AGENT",
                "name": "Customer Support Agent",
                "description": "Handles client onboarding, customer health monitoring, support tickets, and knowledge base lookups.",
                "permissions": ["view_companies", "view_contacts", "log_support_activities", "use_ai_assistant", "manage_own_tasks"]
            }
        ]
    }

# ==================== AUDIT LOGS ====================
@router.get("/audit-logs")
def get_audit_logs():
    return db.audit_logs

# ==================== NOTIFICATIONS ====================
@router.get("/notifications")
def get_notifications():
    return db.notifications

@router.put("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str):
    notif = next((n for n in db.notifications if n["id"] == notif_id), None)
    if notif:
        notif["is_read"] = True
    return {"success": True}

@router.post("/notifications/mark-all-read")
def mark_all_notifications_read():
    for n in db.notifications:
        n["is_read"] = True
    return {"success": True}

# ==================== SETTINGS ====================
@router.get("/settings")
def get_settings():
    return db.settings

@router.put("/settings")
def update_settings(updates: Dict[str, Any]):
    db.settings.update(updates)
    db.add_audit_log(
        user_name="Admin",
        user_role="ADMIN",
        action="Updated Settings",
        entity="System Configuration",
        details="Company profile and CRM operational preferences saved"
    )
    return db.settings

# ==================== GLOBAL SEARCH ====================
@router.get("/search")
def global_search(q: str):
    query = q.lower().strip()
    if not query:
        return {"leads": [], "deals": [], "companies": [], "contacts": [], "tasks": [], "documents": []}

    matched_leads = [
        {"id": l["id"], "title": f"{l['first_name']} {l['last_name']}", "subtitle": l["company"], "meta": f"Lead Score: {l['lead_score']}", "link": "/leads"}
        for l in db.leads
        if query in l["first_name"].lower() or query in l["last_name"].lower() or query in l["company"].lower() or query in l["city"].lower()
    ]

    matched_deals = [
        {"id": d["id"], "title": d["deal_name"], "subtitle": d["company_name"], "meta": f"₹{d['deal_value']:,.0f} • {d['stage']}", "link": "/deals"}
        for d in db.deals
        if query in d["deal_name"].lower() or query in d["company_name"].lower()
    ]

    matched_companies = [
        {"id": c["id"], "title": c["name"], "subtitle": f"{c['city']}, {c['state']}", "meta": f"GSTIN: {c['gstin']}", "link": "/companies"}
        for c in db.companies
        if query in c["name"].lower() or query in c["city"].lower() or query in c["gstin"].lower()
    ]

    matched_contacts = [
        {"id": con["id"], "title": con["name"], "subtitle": f"{con['designation']} at {con['company']}", "meta": con["phone"], "link": "/contacts"}
        for con in db.contacts
        if query in con["name"].lower() or query in con["company"].lower() or query in con["phone"]
    ]

    matched_tasks = [
        {"id": t["id"], "title": f"[{t['id']}] {t['title']}", "subtitle": t["customer_name"], "meta": f"Due: {t['due_date']} • {t['status']}", "link": "/tasks"}
        for t in db.tasks
        if query in t["title"].lower() or query in t["id"].lower() or query in t["customer_name"].lower()
    ]

    matched_documents = [
        {"id": doc["id"], "title": doc["name"], "subtitle": f"Category: {doc['category']}", "meta": f"{doc['chunks_count']} vectorized chunks", "link": "/knowledge"}
        for doc in db.documents
        if query in doc["name"].lower() or query in doc["category"].lower()
    ]

    return {
        "leads": matched_leads[:5],
        "deals": matched_deals[:5],
        "companies": matched_companies[:5],
        "contacts": matched_contacts[:5],
        "tasks": matched_tasks[:5],
        "documents": matched_documents[:5]
    }
