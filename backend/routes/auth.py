from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from backend.database import db

router = APIRouter(prefix="/api/auth", tags=["Auth & RBAC"])

class LoginRequest(BaseModel):
    email: str
    password: str
    role_override: Optional[str] = None

class SwitchRoleRequest(BaseModel):
    user_id: str
    role: str

PERMISSIONS_MAP = {
    "SUPER_ADMIN": ["all", "manage_users", "view_audit_logs", "edit_settings", "manage_knowledge_base", "manage_deals", "manage_leads", "manage_tasks", "view_reports", "view_analytics", "manage_contacts", "manage_companies", "log_activities"],
    "ADMIN": ["all", "manage_users", "view_audit_logs", "edit_settings", "manage_knowledge_base", "manage_deals", "manage_leads", "manage_tasks", "view_reports", "view_analytics", "manage_contacts", "manage_companies", "log_activities"],
    "SALES_MANAGER": ["manage_leads", "manage_deals", "manage_tasks", "view_reports", "view_analytics", "manage_contacts", "manage_companies", "use_ai_assistant", "log_activities"],
    "SALES_EXECUTIVE": ["view_assigned_leads", "manage_assigned_deals", "manage_own_tasks", "log_activities", "use_ai_assistant", "view_contacts", "view_companies", "create_lead", "create_deal"],
    "SUPPORT_AGENT": ["view_companies", "view_contacts", "log_support_activities", "use_ai_assistant", "manage_own_tasks", "log_activities"],
    "VIEWER": ["view_only", "view_companies", "view_contacts", "view_deals", "view_leads", "view_reports", "view_analytics"]
}

def get_current_user_from_header(x_user_role: Optional[str] = Header(None), x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Extracts authenticated user context from request headers or active DB state.
    """
    user = None
    if x_user_id:
        user = next((u for u in db.users if u["id"] == x_user_id), None)
    if not user:
        user = db.users[0]  # Fallback active user

    if x_user_role:
        user_copy = dict(user)
        user_copy["role"] = x_user_role
        return user_copy
    return user

def require_not_viewer(user: Dict[str, Any] = Depends(get_current_user_from_header)):
    """
    Enforces that the user is not in read-only VIEWER role for any state mutation.
    """
    if user.get("role") == "VIEWER":
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Read-only 'VIEWER' role is not authorized to create, modify, or delete CRM records."
        )
    return user

def require_admin_or_manager(user: Dict[str, Any] = Depends(get_current_user_from_header)):
    role = user.get("role", "VIEWER")
    if role not in ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER"]:
        raise HTTPException(
            status_code=403,
            detail=f"Forbidden: Role '{role}' does not have administrative privileges."
        )
    return user

@router.post("/login")
def login(req: LoginRequest):
    user = next((u for u in db.users if u["email"].lower() == req.email.lower()), None)
    if not user:
        user = db.users[0]
    
    if req.role_override:
        user_copy = dict(user)
        user_copy["role"] = req.role_override
        user = user_copy

    db.add_audit_log(
        user_name=user["name"],
        user_role=user["role"],
        user_id=user["id"],
        action="User Login",
        entity="Authentication",
        details=f"Logged in via Web Interface with role '{user['role']}'"
    )

    return {
        "success": True,
        "token": f"nexora-enterprise-jwt-{user['id']}-{user['role']}",
        "user": user,
        "permissions": PERMISSIONS_MAP.get(user["role"], [])
    }

@router.get("/me")
def get_current_user(user: Dict[str, Any] = Depends(get_current_user_from_header)):
    return user

@router.post("/switch-role")
def switch_role(req: SwitchRoleRequest):
    user = next((u for u in db.users if u["id"] == req.user_id), None)
    if not user:
        user = db.users[0]
    
    old_role = user.get("role", "ADMIN")
    user["role"] = req.role

    db.add_audit_log(
        user_name=user["name"],
        user_role=req.role,
        user_id=user["id"],
        action="Role Switch",
        entity="Access Control",
        before_value=old_role,
        after_value=req.role,
        details=f"Active role switched from {old_role} to {req.role}"
    )

    return {
        "success": True, 
        "user": user,
        "permissions": PERMISSIONS_MAP.get(req.role, [])
    }
