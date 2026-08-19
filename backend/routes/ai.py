from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from backend.database import db
from backend.ai_assistant import ai_assistant
from backend.routes.auth import get_current_user_from_header

router = APIRouter(prefix="/api/ai", tags=["AI & Predictions"])

class ChatRequest(BaseModel):
    query: str
    user_role: Optional[str] = "ADMIN"

class GenerateEmailRequest(BaseModel):
    recipient_name: str
    company_name: str
    purpose: str  # "Follow-up", "ROI Proposition", "Meeting Request", "Discount Offer"
    context: Optional[str] = None

@router.post("/chat")
def chat_ai(req: ChatRequest, user: Dict[str, Any] = Depends(get_current_user_from_header)):
    caller_role = user.get("role", req.user_role)
    return ai_assistant.process_query(query=req.query, user_role=caller_role)

@router.get("/insights")
def get_ai_insights():
    # 1. Lead Scoring List with Signal Explanations
    lead_scores = []
    for l in db.leads[:25]:
        analysis = ai_assistant.calculate_lead_score(l)
        lead_scores.append({
            "id": l["id"],
            "lead_name": f"{l['first_name']} {l['last_name']}",
            "company": l["company"],
            "score": analysis["score"],
            "probability": "High probability" if analysis["score"] >= 80 else ("Medium probability" if analysis["score"] >= 60 else "Low probability"),
            "reasons": analysis["positive_factors"],
            "positive_factors": analysis["positive_factors"],
            "risk_factors": analysis["risk_factors"],
            "recommended_action": analysis["recommended_action"],
            "value": f"₹{l.get('lead_value', 0):,.0f}"
        })

    # 2. Deal Risk Predictions with Facts vs Scores vs Actions
    deal_predictions = []
    for d in db.deals[:25]:
        risk_data = ai_assistant.calculate_deal_risk(d)
        deal_predictions.append({
            "id": d["id"],
            "deal_name": d["deal_name"],
            "company_name": d["company_name"],
            "deal_value_raw": d["deal_value"],
            "deal_value_formatted": f"₹{d['deal_value']/100000:.1f} L",
            "win_probability": d.get("probability", 50),
            "risk_score": risk_data["risk_score"],
            "risk_level": risk_data["risk_level"],
            "evidence_reasons": risk_data["evidence_reasons"],
            "ai_interpretation": risk_data["ai_interpretation"],
            "recommended_action": risk_data["recommended_action"],
            "action_payload": risk_data.get("action_payload"),
            "owner": d.get("owner", "Amit Sharma")
        })

    # 3. Customer Churn Risk & Health Factors
    churn_predictions = []
    for c in db.companies[:20]:
        reasons = [
            f"Health Score: {c['customer_health']}/100 with {c['churn_risk']} Churn Risk",
            f"Active revenue: ₹{c['total_revenue']/100000:.1f}L",
            "Contract renewal window open"
        ]
        if c.get("churn_risk") == "High":
            reasons.insert(0, "High churn probability detected: Low activity telemetry")

        churn_predictions.append({
            "id": c["id"],
            "company_name": c["name"],
            "city": c["city"],
            "churn_risk": c.get("churn_risk", "Low"),
            "churn_probability": c.get("churn_probability", 12),
            "health_score": c.get("customer_health", 80),
            "reasons": reasons,
            "recommendation": c.get("ai_recommendation", "Conduct quarterly business review")
        })

    # 4. Next Best Actions (with real executable payloads)
    next_best_actions = [
        {
            "id": "nba-technova",
            "company_name": "TechNova Solutions",
            "context": "₹8.4L active opportunity in Negotiation stage. No interaction for 18 days.",
            "recommended_action": "Schedule an account review within 48 hours.",
            "rationale": "Deal has remained in Negotiation for 11 days with 72% win probability and approaching close date.",
            "action_type": "create_task",
            "action_label": "Create Account Review Task",
            "payload": {
                "title": "Account Review with TechNova Solutions CTO",
                "customer_name": "TechNova Solutions",
                "company_id": "comp-1",
                "deal_id": "deal-1",
                "priority": "Urgent",
                "due_date": "22 Aug 2026",
                "assigned_to": "Amit Sharma",
                "description": "Urgent review required to address 18-day inactivity on ₹8.4L deal."
            }
        },
        {
            "id": "nba-finedge",
            "company_name": "FinEdge Systems",
            "context": "Annual prepayment discount objection for Q3 expansion.",
            "recommended_action": "Offer customized annual-plan pricing with complimentary onboarding instead of base discounting.",
            "rationale": "Protects 78% software gross margin while satisfying VP of Operations budget parameters.",
            "action_type": "generate_email",
            "action_label": "Generate ROI Email",
            "payload": {
                "recipient_name": "Ananya Kulkarni",
                "company_name": "FinEdge Systems",
                "purpose": "ROI Proposition"
            }
        },
        {
            "id": "nba-bharat",
            "company_name": "Bharat Logistics Corp",
            "context": "Fleet tracking module utilization down 12% in past 30 days.",
            "recommended_action": "Schedule Technical Account Review & Operations Training.",
            "rationale": "Proactive intervention prevents potential churn on ₹24.0L annual contract.",
            "action_type": "schedule_meeting",
            "action_label": "Schedule Review Call",
            "payload": {
                "customer_name": "Bharat Logistics Corp",
                "company_id": "comp-3",
                "title": "Technical Account Review - Bharat Logistics",
                "event_type": "Meeting",
                "date": "23 Aug 2026",
                "time": "14:00",
                "duration": "45 mins",
                "attendees": ["Amit Sharma", "harish.verma@bharatlogistics.in"],
                "location": "Google Meet",
                "description": "Review fleet tracking module adoption and resolve API limits."
            }
        }
    ]

    return {
        "lead_scoring": lead_scores,
        "deal_predictions": deal_predictions,
        "churn_predictions": churn_predictions,
        "next_best_actions": next_best_actions
    }

@router.post("/generate-email")
def generate_email(req: GenerateEmailRequest):
    templates = {
        "Follow-up": f"""Subject: Following up on our Nexora CRM discussion — {req.company_name}

Dear {req.recipient_name},

I hope this email finds you well.

I wanted to follow up on our recent conversation regarding how Nexora CRM can streamline sales pipeline visibility and automate Indian GST compliance workflows for {req.company_name}.

Our solutions engineering team has prepared a tailored demonstration showing our AI Knowledge Assistant integrated with your product catalogs and lead channels.

Would you have 15 minutes available this Wednesday or Thursday for a brief walkthrough?

Warm regards,
Amit Sharma
Senior Sales Executive | Nexora CRM
+91 98202 33443 | amit.sharma@nexoracrm.in""",

        "ROI Proposition": f"""Subject: Projected ROI & Efficiency Gains with Nexora CRM for {req.company_name}

Dear {req.recipient_name},

Following our pricing and implementation discussion, our solutions engineering team modeled the projected operational improvements for {req.company_name}:

• 34% reduction in lead follow-up turnaround time through AI automated scoring.
• 100% automated GST tax invoice generation & reconciliation with Indian fiscal standards.
• Grounded AI Assistant trained on your internal product policies for instant sales rep queries.

We are pleased to include our comprehensive enterprise onboarding package with dedicated training at no additional cost for your annual commitment.

Let me know if we can finalize the contract draft this week.

Best regards,
Priya Patil
Sales Manager | Nexora CRM
+91 98201 22332 | priya.patil@nexoracrm.in"""
    }

    body = templates.get(req.purpose, templates["Follow-up"])
    return {
        "subject": body.split("\n")[0].replace("Subject: ", ""),
        "body": body
    }
