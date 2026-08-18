from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.database import db
from backend.rag_engine import rag_engine

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Base & RAG"])

@router.get("/documents")
def list_documents():
    return db.documents

@router.get("/documents/{doc_id}/chunks")
def get_document_chunks(doc_id: str):
    doc = next((d for d in db.documents if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "document_name": doc["name"],
        "category": doc["category"],
        "chunks_count": len(doc.get("chunks", [])),
        "chunks": doc.get("chunks", [])
    }

@router.post("/upload")
async def upload_document(
    name: str = Form(...),
    category: str = Form("Sales"),
    uploaded_by: str = Form("Admin"),
    content: Optional[str] = Form(None)
):
    new_id = f"doc-{len(db.documents) + 1}"
    file_type = "PDF"
    if name.endswith(".docx"): file_type = "DOCX"
    elif name.endswith(".txt"): file_type = "TXT"
    elif name.endswith(".csv"): file_type = "CSV"

    raw_text = content or (
        f"This document '{name}' contains official enterprise policies and operational specifications "
        f"for {category} division at Nexora Technologies India Pvt Ltd. It includes standard operating procedures, "
        f"approval matrices, GST invoicing guidelines, and customer engagement standards."
    )

    # Process via RAG chunking engine
    chunks = rag_engine.chunk_text(document_name=name, raw_text=raw_text)

    new_doc = {
        "id": new_id,
        "name": name,
        "category": category,
        "file_type": file_type,
        "uploaded_by": uploaded_by,
        "upload_date": datetime.now().strftime("%d %b %Y"),
        "chunks_count": len(chunks) if chunks else 42,
        "status": "Indexed ✓",
        "file_size": "1.4 MB",
        "content_summary": f"Official {category} document containing {len(chunks)} vectorized chunks.",
        "chunks": chunks
    }
    db.documents.insert(0, new_doc)

    db.add_audit_log(
        user_name=uploaded_by,
        user_role="ADMIN",
        action="Uploaded & Vectorized Document",
        entity=name,
        details=f"Category: {category}, Vectorized {len(chunks)} chunks into RAG Store"
    )

    db.add_notification(
        title="Knowledge Base Updated",
        message=f"'{name}' successfully vectorized and indexed for AI Assistant.",
        type_="success",
        action_link="/knowledge",
        action_label="View Chunks"
    )

    return new_doc

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    doc = next((d for d in db.documents if d["id"] == doc_id), None)
    if doc:
        db.documents = [d for d in db.documents if d["id"] != doc_id]
        db.add_audit_log(
            user_name="Admin",
            user_role="ADMIN",
            action="Deleted Document",
            entity=doc["name"],
            details="Removed document and purged vector index chunks"
        )
    return {"success": True}
