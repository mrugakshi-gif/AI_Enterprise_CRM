from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from backend.database import db
from backend.routes.auth import get_current_user_from_header, require_not_viewer, require_admin_or_manager

router = APIRouter(prefix="/api/admin", tags=["Admin & System"])

# ==================== USERS & TEAMS ====================
@router.get("/users")
def list_users():
    return db.users

@router.get("/teams")
def list_teams():
    return db.teams

@router.post("/users")
def create_user(user_data: Dict[str, Any], user: Dict[str, Any] = Depends(require_admin_or_manager)):
    new_id = f"usr-{len(db.users) + 1}"
    new_user = {
        "id": new_id,
        "name": user_data.get("name", "Team Member"),
        "email": user_data.get("email", "member@nexoracrm.in"),
        "role": user_data.get("role", "SALES_EXECUTIVE"),
        "department": user_data.get("department", "Sales"),
        "team": user_data.get("team", "Enterprise Sales"),
        "phone": user_data.get("phone", "+91 98200 99999"),
        "avatar": user_data.get("avatar", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"),
        "status": "Active",
        "last_active": "Just now"
    }
    db.users.append(new_user)

    db.add_audit_log(
        user_name=user.get("name", "Admin"),
        user_role=user.get("role", "ADMIN"),
        user_id=user.get("id"),
        action="Created User",
        entity=new_user["name"],
        entity_id=new_id,
        details=f"Created user with role '{new_user['role']}' in team '{new_user['team']}'"
    )
    return new_user

# ==================== ROLES & PERMISSIONS MATRIX ====================
@router.get("/permissions")
def get_permissions_matrix():
    return {
        "roles": [
            {
                "role": "SUPER_ADMIN",
                "name": "Super Administrator",
                "description": "Full unconstrained administrative master access across all CRM records, AI controls, security policies, and team management.",
                "permissions": ["all", "manage_users", "view_audit_logs", "edit_settings", "manage_knowledge_base", "manage_deals", "manage_leads", "manage_tasks", "view_reports", "view_analytics", "manage_contacts", "manage_companies", "log_activities"]
            },
            {
                "role": "ADMIN",
                "name": "System Administrator",
                "description": "Enterprise administrator managing users, team assignments, system settings, knowledge base policies, and CRM records.",
                "permissions": ["all", "manage_users", "view_audit_logs", "edit_settings", "manage_knowledge_base", "manage_deals", "manage_leads", "manage_tasks", "view_reports", "view_analytics", "manage_contacts", "manage_companies", "log_activities"]
            },
            {
                "role": "SALES_MANAGER",
                "name": "Sales Manager",
                "description": "Manages pipeline velocity, team quotas, discount authorizations up to 20%, and sales reporting.",
                "permissions": ["manage_leads", "manage_deals", "manage_tasks", "view_reports", "view_analytics", "manage_contacts", "manage_companies", "use_ai_assistant", "log_activities"]
            },
            {
                "role": "SALES_EXECUTIVE",
                "name": "Sales Executive",
                "description": "Front-line sales representative handling assigned leads, active deals, discount quotes up to 15%, tasks, and customer calls.",
                "permissions": ["view_assigned_leads", "manage_assigned_deals", "manage_own_tasks", "log_activities", "use_ai_assistant", "view_contacts", "view_companies", "create_lead", "create_deal"]
            },
            {
                "role": "SUPPORT_AGENT",
                "name": "Customer Support Agent",
                "description": "Monitors customer health scores, logs support tickets and meetings, manages client onboarding tasks, and queries policy RAG.",
                "permissions": ["view_companies", "view_contacts", "log_support_activities", "use_ai_assistant", "manage_own_tasks", "log_activities"]
            },
            {
                "role": "VIEWER",
                "name": "Read-Only Viewer / Auditor",
                "description": "Strictly read-only access for compliance audits, board reviews, and financial oversight. Mutation operations are blocked.",
                "permissions": ["view_only", "view_companies", "view_contacts", "view_deals", "view_leads", "view_reports", "view_analytics"]
            }
        ]
    }

# ==================== AUDIT LOGS WITH FILTERING ====================
@router.get("/audit-logs")
def get_audit_logs(
    user_name: Optional[str] = None,
    action: Optional[str] = None,
    entity: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None
):
    results = db.audit_logs
    if user_name and user_name != "All":
        results = [l for l in results if user_name.lower() in l.get("user_name", "").lower()]
    if action and action != "All":
        results = [l for l in results if action.lower() in l.get("action", "").lower()]
    if entity and entity != "All":
        results = [l for l in results if entity.lower() in l.get("entity", "").lower()]
    if severity and severity != "All":
        results = [l for l in results if l.get("severity") == severity]
    if search:
        q = search.lower()
        results = [l for l in results if q in l.get("details", "").lower() or q in l.get("entity", "").lower() or q in l.get("action", "").lower() or q in l.get("user_name", "").lower()]
    return results

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
def update_settings(updates: Dict[str, Any], user: Dict[str, Any] = Depends(require_admin_or_manager)):
    db.settings.update(updates)
    db.add_audit_log(
        user_name=user.get("name", "Admin"),
        user_role=user.get("role", "ADMIN"),
        user_id=user.get("id"),
        action="Updated Settings",
        entity="System Configuration",
        details="Company profile and operational preferences updated",
        severity="WARNING"
    )
    return db.settings

# ==================== GLOBAL SEARCH ACROSS ALL ENTITIES ====================
@router.get("/search")
def global_search(q: str):
    query = q.lower().strip()
    if not query:
        return {
            "leads": [],
            "deals": [],
            "companies": [],
            "contacts": [],
            "tasks": [],
            "documents": [],
            "users": []
        }

    matched_leads = [
        {"id": l["id"], "title": f"{l['first_name']} {l['last_name']}", "subtitle": l.get("company", ""), "meta": f"Score: {l.get('lead_score', 50)}/100 • ₹{l.get('lead_value', 0)/100000:.1f}L", "link": "/leads"}
        for l in db.leads
        if query in l.get("first_name", "").lower() or query in l.get("last_name", "").lower() or query in l.get("company", "").lower() or query in l.get("city", "").lower()
    ]

    matched_deals = [
        {"id": d["id"], "title": d["deal_name"], "subtitle": d.get("company_name", ""), "meta": f"₹{d['deal_value']/100000:.1f}L • {d['stage']}", "link": "/deals"}
        for d in db.deals
        if query in d.get("deal_name", "").lower() or query in d.get("company_name", "").lower()
    ]

    matched_companies = [
        {"id": c["id"], "title": c["name"], "subtitle": f"{c.get('city')}, {c.get('state')} • {c.get('industry')}", "meta": f"GSTIN: {c.get('gstin', '')}", "link": "/companies"}
        for c in db.companies
        if query in c.get("name", "").lower() or query in c.get("city", "").lower() or query in c.get("gstin", "").lower() or query in c.get("industry", "").lower()
    ]

    matched_contacts = [
        {"id": con["id"], "title": con["name"], "subtitle": f"{con.get('designation')} at {con.get('company')}", "meta": con.get("phone", ""), "link": "/contacts"}
        for con in db.contacts
        if query in con.get("name", "").lower() or query in con.get("company", "").lower() or query in con.get("phone", "") or query in con.get("email", "").lower()
    ]

    matched_tasks = [
        {"id": t["id"], "title": f"[{t['id']}] {t['title']}", "subtitle": t.get("customer_name", ""), "meta": f"Due: {t.get('due_date')} • {t.get('status')}", "link": "/tasks"}
        for t in db.tasks
        if query in t.get("title", "").lower() or query in t.get("id", "").lower() or query in t.get("customer_name", "").lower()
    ]

    matched_documents = [
        {"id": doc["id"], "title": doc["name"], "subtitle": f"Category: {doc.get('category')}", "meta": f"{doc.get('chunks_count', 0)} chunks • {doc.get('status')}", "link": "/knowledge"}
        for doc in db.documents
        if query in doc.get("name", "").lower() or query in doc.get("category", "").lower()
    ]

    matched_users = [
        {"id": u["id"], "title": u["name"], "subtitle": f"{u.get('role')} • {u.get('team')}", "meta": u.get("email", ""), "link": "/users"}
        for u in db.users
        if query in u.get("name", "").lower() or query in u.get("email", "").lower() or query in u.get("role", "").lower()
    ]

    return {
        "leads": matched_leads[:6],
        "deals": matched_deals[:6],
        "companies": matched_companies[:6],
        "contacts": matched_contacts[:6],
        "tasks": matched_tasks[:6],
        "documents": matched_documents[:6],
        "users": matched_users[:4]
    }
