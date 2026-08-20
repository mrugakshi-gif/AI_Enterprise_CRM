from fastapi import APIRouter
from typing import Dict, Any, List
from datetime import datetime, timedelta
from backend.database import db

from backend.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/reports", tags=["Reports & Exports"])

@router.get("/list")
def get_reports():
    rev_metrics = analytics_service.get_revenue_metrics(db.deals)
    pipe_metrics = analytics_service.get_pipeline_metrics(db.deals)
    risk_metrics = analytics_service.get_revenue_at_risk_metrics(db.deals, db.companies)

    total_leads = len(db.leads)
    qualified_leads = len([l for l in db.leads if l.get("status") in ["Qualified", "Proposal", "Converted"]])
    avg_score = round(sum(l.get("lead_score", 50) for l in db.leads) / total_leads) if total_leads else 75

    return [
        {
            "id": "rep-1",
            "title": "Sales Performance & Pipeline Velocity Report",
            "category": "Sales",
            "description": "Comprehensive analysis of won deals, pipeline velocity, and conversion by stage in ₹ Lakhs.",
            "metrics": {
                "won_revenue": rev_metrics["won_revenue_formatted"],
                "pipeline_total": pipe_metrics["active_pipeline_formatted"],
                "win_rate": rev_metrics["win_rate"]
            },
            "generated_date": datetime.now().strftime("%d %b %Y"),
            "export_format": "PDF / CSV"
        },
        {
            "id": "rep-2",
            "title": "Lead Acquisition & Conversion Audit",
            "category": "Marketing",
            "description": "Channel efficiency breakdown across Website Demo, LinkedIn, Direct Referral, and Summit networks.",
            "metrics": {
                "total_leads": str(total_leads),
                "qualified_leads": str(qualified_leads),
                "avg_lead_score": f"{avg_score}/100"
            },
            "generated_date": datetime.now().strftime("%d %b %Y"),
            "export_format": "PDF / CSV"
        },
        {
            "id": "rep-3",
            "title": "Customer Health & Churn Analysis",
            "category": "Customer Success",
            "description": "Risk distribution across accounts, NPS telemetry, and renewal forecast for Indian SMBs.",
            "metrics": {
                "total_accounts": str(len(db.companies)),
                "at_risk_accounts": str(len([c for c in db.companies if c.get("churn_risk") in ["High", "Medium"]])),
                "projected_retention": "95.4%"
            },
            "generated_date": datetime.now().strftime("%d %b %Y"),
            "export_format": "PDF / CSV"
        },
        {
            "id": "rep-4",
            "title": "Revenue Forecast & FY 2026-27 Projection",
            "category": "Finance",
            "description": "Fiscal year-to-date collections, GST reconciliation status, and Q3 revenue runway.",
            "metrics": {
                "weighted_pipeline": pipe_metrics["weighted_forecast_formatted"],
                "q3_target": "₹1.50 Cr",
                "runway_confidence": "91%"
            },
            "generated_date": datetime.now().strftime("%d %b %Y"),
            "export_format": "PDF / CSV"
        }
    ]

@router.get("/export/{report_id}")
def export_report_data(report_id: str):
    if report_id == "rep-1":
        lines = ["Deal ID,Deal Name,Company,Stage,Value (INR),Expected Close,Owner,Win Probability"]
        for d in db.deals:
            lines.append(f"{d['id']},{d['deal_name'].replace(',', ' ')},{d['company_name'].replace(',', ' ')},{d['stage']},{d['deal_value']},{d['expected_close_date']},{d['owner']},{d.get('probability', 50)}%")
        return {
            "filename": f"Nexora_Sales_Report_{datetime.now().strftime('%b%Y')}.csv",
            "content": "\n".join(lines)
        }

    lines = ["Lead ID,Lead Name,Company,Source,Status,Lead Score,Value (INR),Assigned To,City"]
    for l in db.leads:
        lines.append(f"{l['id']},{l['first_name']} {l['last_name']},{l['company'].replace(',', ' ')},{l['source']},{l['status']},{l['lead_score']},{l['lead_value']},{l['assigned_to']},{l['city']}")
    return {
        "filename": f"Nexora_Leads_Export_{datetime.now().strftime('%b%Y')}.csv",
        "content": "\n".join(lines)
    }
