from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os

from backend.routes.auth import router as auth_router
from backend.routes.crm import router as crm_router
from backend.routes.knowledge import router as knowledge_router
from backend.routes.ai import router as ai_router
from backend.routes.reports import router as reports_router
from backend.routes.admin import router as admin_router

app = FastAPI(
    title="Nexora CRM API",
    description="AI-Powered Enterprise CRM & Intelligent Company Knowledge Assistant for Indian Businesses",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth_router)
app.include_router(crm_router)
app.include_router(knowledge_router)
app.include_router(ai_router)
app.include_router(reports_router)
app.include_router(admin_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "Nexora CRM Enterprise Engine",
        "version": "1.0.0",
        "currency": "INR (₹)",
        "timezone": "Asia/Kolkata (IST)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
