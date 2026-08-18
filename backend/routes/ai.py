from fastapi import APIRouter
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from backend.database import db
from backend.ai_assistant import ai_assistant

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
def chat_ai(req: ChatRequest):
    return ai_assistant.process_query(query=req.query, user_role=req.role if hasattr(req, "role") else req.user_role)

@router.get("/insights")
def get_ai_insights():
    # 1. Lead Scoring List
    lead_scores = [
        {
            "id": l["id"],
            "lead_name": f"{l['first_name']} {l['last_name']}",
            "company": l["company"],
            "score": l["lead_score"],
            "probability": "High probability" if l["lead_score"] >= 80 else ("Medium probability" if l["lead_score"] >= 60 else "Low probability"),
            "reasons": l.get("ai_reasons", ["Engagement signal"]),
            "recommended_action": l.get("ai_recommended_action", "Follow-up with lead"),
            "value": f"₹{l['lead_value']:,.0f}"
        }
        for l in db.leads
    ]

    # 2. Deal Predictions
    deal_predictions = [
        {
            "id": d["id"],
            "deal_name": d["deal_name"],
            "company_name": d["company_name"],
            "deal_value_raw": d["deal_value"],
            "deal_value_formatted": f"₹{d['deal_value']/100000:.1f} L",
            "win_probability": d["probability"],
            "expected_revenue": f"₹{(d['deal_value'] * d['probability'] / 100) / 100000:.2f} L",
            "risk_factor": d.get("risk_factor"),
            "ai_recommendation": d.get("ai_recommendation"),
            "owner": d["owner"]
        }
        for d in db.deals
    ]

    # 3. Churn Predictions
    churn_predictions = [
        {
            "id": c["id"],
            "company_name": c["name"],
            "city": c["city"],
            "churn_risk": c.get("churn_risk", "Low"),
            "churn_probability": c.get("churn_probability", 15),
            "health_score": c.get("customer_health", 80),
            "reasons": [
                "Support complaint unresolved" if c.get("churn_risk") == "High" else "Normal platform engagement",
                "Reduced user activity in past 21 days" if c.get("churn_risk") in ["High", "Medium"] else "Regular team logins",
                "Contract renewal approaching"
            ],
            "recommendation": c.get("ai_recommendation", "Conduct quarterly business review")
        }
        for c in db.companies
    ]

    # 4. Next Best Actions
    next_best_actions = [
        {
            "id": "nba-1",
            "company_name": "TechNova Solutions",
            "context": "Executive proposal under active review (12 opens detected).",
            "recommended_action": "Schedule a product demonstration & closing call within 24 hours.",
            "rationale": "High executive engagement + pricing review + decision maker Rahul Sharma active.",
            "action_type": "create_task",
            "action_label": "Create Closing Task",
            "payload": {
                "title": "Closing meeting with TechNova Sales Director",
                "customer_name": "TechNova Solutions",
                "priority": "Urgent"
            }
        },
        {
            "id": "nba-2",
            "company_name": "FinEdge Systems",
            "context": "Pricing objection detected regarding annual prepayment terms.",
            "recommended_action": "Offer customized annual-plan pricing with complimentary onboarding instead of discounting base price.",
            "rationale": "Protects gross margin while satisfying VP of Operations budget parameters.",
            "action_type": "generate_email",
            "action_label": "Generate ROI Email",
            "payload": {
                "recipient_name": "Ananya Kulkarni",
                "company_name": "FinEdge Systems",
                "purpose": "ROI Proposition"
            }
        },
        {
            "id": "nba-3",
            "company_name": "Global Solutions Ltd",
            "context": "Customer health dropped to 42/100; zero telemetry logged in 28 days.",
            "recommended_action": "Initiate executive sponsor retention intervention.",
            "rationale": "81% churn probability unless immediate customer success check-in is conducted.",
            "action_type": "schedule_meeting",
            "action_label": "Schedule Retention Meeting",
            "payload": {
                "customer_name": "Global Solutions Ltd",
                "title": "Customer Retention Review - Global Solutions"
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

I wanted to follow up on our recent conversation regarding how Nexora CRM can help streamline sales pipeline visibility and automate Indian GST compliance workflows for {req.company_name}.

Our team has prepared a tailored demonstration showing our AI Knowledge Assistant integrated with your product catalogs and lead channels. 

Would you have 15 minutes available this Wednesday or Thursday for a brief walkthrough?

Warm regards,
Amit Sharma
Senior Sales Executive | Nexora CRM
+91 98765 43210 | amit.sharma@nexoracrm.in""",

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
+91 98765 43211 | priya.patil@nexoracrm.in"""
    }

    body = templates.get(req.purpose, templates["Follow-up"])
    return {
        "subject": body.split("\n")[0].replace("Subject: ", ""),
        "body": body
    }
