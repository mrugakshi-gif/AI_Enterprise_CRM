from fastapi import APIRouter
from typing import Dict, Any, List
from backend.database import db

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/list")
def get_reports():
    return [
        {
            "id": "rep-1",
            "title": "Sales Performance & Pipeline Report",
            "category": "Sales",
            "description": "Comprehensive analysis of won deals, pipeline velocity, and conversion by stage in ₹ Lakhs.",
            "metrics": {"won_revenue": "₹18,50,000", "pipeline_total": "₹42,80,000", "win_rate": "68%"},
            "generated_date": "17 Aug 2026",
            "export_format": "PDF / CSV"
        },
        {
            "id": "rep-2",
            "title": "Lead Acquisition & Conversion Audit",
            "category": "Marketing",
            "description": "Channel efficiency breakdown across Website, LinkedIn, Google Ads, and Referral networks.",
            "metrics": {"total_leads": "246", "qualified_leads": "178", "avg_lead_score": "76/100"},
            "generated_date": "16 Aug 2026",
            "export_format": "PDF / CSV"
        },
        {
            "id": "rep-3",
            "title": "Customer Health & Churn Analysis",
            "category": "Customer Success",
            "description": "Risk distribution across accounts, NPS telemetry, and renewal forecast for Indian SMBs.",
            "metrics": {"avg_health_score": "82/100", "at_risk_accounts": "1", "projected_retention": "94.2%"},
            "generated_date": "15 Aug 2026",
            "export_format": "PDF / CSV"
        },
        {
            "id": "rep-4",
            "title": "Revenue Forecast & FY 2026-27 Projection",
            "category": "Finance",
            "description": "Fiscal year-to-date collections, GST reconciliation status, and Q3 revenue runway.",
            "metrics": {"q2_achieved": "₹48.6 L", "q3_target": "₹65.0 L", "runway_confidence": "88%"},
            "generated_date": "17 Aug 2026",
            "export_format": "PDF / CSV"
        },
        {
            "id": "rep-5",
            "title": "Sales Executive Leaderboard & Activity Log",
            "category": "Sales Ops",
            "description": "Deal closing velocity, calls logged, demo conversions, and task completion metrics per rep.",
            "metrics": {"top_rep": "Amit Sharma", "deals_closed": "14", "revenue_generated": "₹12.8 L"},
            "generated_date": "17 Aug 2026",
            "export_format": "PDF / CSV"
        }
    ]

@router.get("/export/{report_id}")
def export_report_data(report_id: str):
    if report_id == "rep-1":
        csv_data = (
            "Deal Name,Company,Stage,Value (INR),Expected Date,Owner,Win Probability\n"
            "Enterprise CRM Implementation,TechNova Solutions,Negotiation,450000,24 Aug 2026,Amit Sharma,78%\n"
            "FinTech Compliance & CRM Suite,FinEdge Systems,Proposal Sent,380000,30 Aug 2026,Priya Patil,65%\n"
            "Nationwide Fleet CRM,Bharat Logistics,Contacted,620000,15 Sep 2026,Amit Sharma,45%\n"
            "Solar Project Pipeline,GreenGrid Energy,Deal Closed,540000,12 Aug 2026,Amit Sharma,100%\n"
            "EdTech Admissions CRM,EduSphere Technologies,Qualified,310000,08 Sep 2026,Rohan Joshi,55%\n"
            "Agency Client Hub,Maharashtra Digital Works,Deal Closed,240000,02 Aug 2026,Priya Patil,100%\n"
        )
        return {"filename": "Nexora_Sales_Report_Aug2026.csv", "content": csv_data}

    csv_data = (
        "Lead Name,Company,Source,Status,Lead Score,Value (INR),City\n"
        "Rahul Sharma,TechNova Solutions,Website,Qualified,87,450000,Mumbai\n"
        "Priya Patil,FinEdge Systems,LinkedIn,Contacted,76,380000,Pune\n"
        "Harish Verma,Bharat Logistics,Referral,Proposal,91,620000,Delhi\n"
        "Suresh Iyer,Apex Medicare Solutions,Google Ads,New,64,290000,Chennai\n"
        "Deepak Rao,CloudMatrix India,Partner,Contacted,58,310000,Ahmedabad\n"
    )
    return {"filename": "Nexora_Report_Export.csv", "content": csv_data}
