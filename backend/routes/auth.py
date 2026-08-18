from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.database import db

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str
    role_override: Optional[str] = None

class SwitchRoleRequest(BaseModel):
    user_id: str
    role: str

@router.post("/login")
def login(req: LoginRequest):
    # Find user by email or fallback to first user
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
        action="User Login",
        entity="Authentication",
        details=f"Logged in via Web Interface ({user['role']})"
    )

    return {
        "success": True,
        "token": "nexora-enterprise-jwt-token-xyz999",
        "user": user
    }

@router.get("/me")
def get_current_user():
    return db.users[0]

@router.post("/switch-role")
def switch_role(req: SwitchRoleRequest):
    user = next((u for u in db.users if u["id"] == req.user_id), None)
    if not user:
        user = db.users[0]
    user["role"] = req.role

    db.add_audit_log(
        user_name=user["name"],
        user_role=req.role,
        action="Role Switch",
        entity="Access Control",
        details=f"Active role switched to {req.role}"
    )

    return {"success": True, "user": user}
