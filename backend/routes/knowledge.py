from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.database import db
from backend.rag_engine import rag_engine
from backend.routes.auth import get_current_user_from_header, require_not_viewer

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Base & RAG"])

@router.get("/documents")
def get_documents(user: Dict[str, Any] = Depends(get_current_user_from_header)):
    user_role = user.get("role", "ADMIN")
    # Filter documents by access roles
    visible_docs = []
    for d in db.documents:
        access_roles = d.get("access_roles", ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER", "SALES_EXECUTIVE", "SUPPORT_AGENT", "VIEWER"])
        if user_role in access_roles or user_role in ["SUPER_ADMIN", "ADMIN"]:
            visible_docs.append(d)
    return visible_docs

@router.get("/documents/{doc_id}/chunks")
def get_document_chunks(doc_id: str, user: Dict[str, Any] = Depends(get_current_user_from_header)):
    doc = next((d for d in db.documents if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    user_role = user.get("role", "ADMIN")
    access_roles = doc.get("access_roles", ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER", "SALES_EXECUTIVE", "SUPPORT_AGENT", "VIEWER"])
    if user_role not in access_roles and user_role not in ["SUPER_ADMIN", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to view chunks for this document.")

    return {
        "document_id": doc["id"],
        "document_name": doc["name"],
        "category": doc["category"],
        "chunks_count": len(doc.get("chunks", [])),
        "chunks": doc.get("chunks", [])
    }

@router.post("/upload")
async def upload_document(
    name: str = Form(...),
    category: str = Form(...),
    uploaded_by: str = Form("Admin"),
    content: Optional[str] = Form(None),
    access_roles: Optional[str] = Form("SUPER_ADMIN,ADMIN,SALES_MANAGER,SALES_EXECUTIVE,SUPPORT_AGENT,VIEWER"),
    user: Dict[str, Any] = Depends(require_not_viewer)
):
    doc_id = f"doc-{len(db.documents) + 1}"
    roles_list = [r.strip() for r in access_roles.split(",") if r.strip()]

    raw_text = content or f"Standard operating procedures and enterprise specifications for {name}. Contains compliance guidelines and workflow parameters."
    
    # Vectorize / chunk using RAG Engine with prompt injection protection
    chunks = rag_engine.chunk_text(document_name=name, raw_text=raw_text)

    new_doc = {
        "id": doc_id,
        "name": name,
        "category": category,
        "file_type": "PDF" if name.endswith(".pdf") else "DOCX",
        "uploaded_by": uploaded_by,
        "upload_date": datetime.now().strftime("%d %b %Y"),
        "file_size": f"{round(len(raw_text) / 1024 + 1.2, 1)} MB",
        "status": "Indexed ✓",
        "access_roles": roles_list,
        "content_summary": f"Uploaded policy document with {len(chunks)} vectorized semantic chunks.",
        "chunks_count": len(chunks),
        "chunks": chunks
    }

    db.documents.insert(0, new_doc)

    db.add_audit_log(
        user_name=user.get("name", uploaded_by),
        user_role=user.get("role", "ADMIN"),
        user_id=user.get("id"),
        action="Uploaded Knowledge Document",
        entity=name,
        entity_id=doc_id,
        details=f"Vectorized {len(chunks)} chunks with access roles: {', '.join(roles_list)}"
    )

    return new_doc

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str, user: Dict[str, Any] = Depends(require_not_viewer)):
    doc = next((d for d in db.documents if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.documents = [d for d in db.documents if d["id"] != doc_id]

    db.add_audit_log(
        user_name=user.get("name", "User"),
        user_role=user.get("role", "ADMIN"),
        user_id=user.get("id"),
        action="Deleted Knowledge Document",
        entity=doc["name"],
        entity_id=doc_id,
        details="Document and associated vector chunks purged from RAG index"
    )

    return {"success": True}
