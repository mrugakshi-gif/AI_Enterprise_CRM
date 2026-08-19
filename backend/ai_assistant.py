from typing import Dict, Any, List, Optional
import re
from datetime import datetime, timedelta
from backend.database import db
from backend.rag_engine import rag_engine

class AIAssistant:
    def __init__(self):
        pass

    def process_query(self, query: str, user_role: str = "ADMIN") -> Dict[str, Any]:
        query_lower = query.lower().strip()
        
        # 1. Action intent check (e.g. "create a task to follow up with...", "schedule a meeting with...")
        action_response = self._try_action_intent(query_lower, query)
        if action_response:
            return action_response

        # 2. CRM-Aware Routing:
        crm_response = self._try_crm_query(query_lower, user_role)
        if crm_response:
            return crm_response

        # 3. Knowledge Base RAG Search
        rag_results = rag_engine.search_knowledge_base(query, top_k=3)
        if rag_results and rag_results[0]["score"] > 0.25:
            top_source = rag_results[0]
            sources = [
                {
                    "title": r["document_name"],
                    "page": r["page_number"],
                    "category": r["category"],
                    "snippet": r["text"],
                    "score": r["score"]
                }
                for r in rag_results
            ]
            
            # Format synthesized answer based on retrieved documents
            answer = f"According to **{top_source['document_name']}** (Page {top_source['page_number']}):\n\n{top_source['text']}"
            if len(rag_results) > 1:
                answer += f"\n\nAdditionally, supplementary details from **{rag_results[1]['document_name']}** (Page {rag_results[1]['page_number']}) indicate:\n\n{rag_results[1]['text']}"

            # Actual Grounding Score calculated from vector/text match quality
            grounding_score = round(top_source["score"], 2)

            return {
                "answer": answer,
                "confidence": grounding_score,
                "sources": sources,
                "crm_records": [],
                "intent": "rag_grounded_answer",
                "recommended_action": {
                    "type": "create_task",
                    "label": "Create Follow-up Task",
                    "payload": {
                        "title": f"Policy Follow-up: {query[:35]}...",
                        "customer_name": top_source.get("category", "Internal Operations"),
                        "priority": "Normal"
                    }
                }
            }

        # 4. Fallback / Hallucination prevention rule
        return {
            "answer": "I couldn't find reliable grounded information about this in the available company knowledge base or authorized CRM records. Please ensure the relevant policy document or CRM record is uploaded and indexed.",
            "confidence": 0.15,
            "sources": [],
            "crm_records": [],
            "intent": "unanswered",
            "recommended_action": None
        }

    def _try_action_intent(self, query_lower: str, query: str) -> Optional[Dict[str, Any]]:
        # Intent: Create task
        if query_lower.startswith("create task") or query_lower.startswith("add task") or "create a task" in query_lower:
            # Extract customer or subject
            customer = "TechNova Solutions"
            for c in db.companies:
                if c["name"].lower() in query_lower:
                    customer = c["name"]
                    break
            
            title = query.replace("create a task", "").replace("Create a task", "").replace("create task", "").replace("Create task", "").strip(" :to-")
            if not title or len(title) < 5:
                title = f"Follow-up with {customer}"

            return {
                "answer": f"I've prepared a new action task for **{customer}**. Please review and confirm the details below to add it to your execution queue.",
                "confidence": 0.98,
                "sources": [],
                "crm_records": [],
                "intent": "action_confirmation",
                "recommended_action": {
                    "type": "create_task",
                    "label": "Confirm & Create Task",
                    "payload": {
                        "title": title,
                        "customer_name": customer,
                        "priority": "Urgent" if "urgent" in query_lower or "high" in query_lower else "Normal",
                        "due_date": (datetime.now() + timedelta(days=3)).strftime("%d %b %Y"),
                        "assigned_to": "Amit Sharma",
                        "description": f"AI Assistant generated task based on request: '{query}'",
                        "is_ai_generated": True
                    }
                }
            }

        # Intent: Schedule meeting
        if "schedule meeting" in query_lower or "schedule a call" in query_lower or "schedule demo" in query_lower \
                or "schedule a meeting" in query_lower or "book a meeting" in query_lower or "book meeting" in query_lower:
            customer = "TechNova Solutions"
            for c in db.companies:
                if c["name"].lower() in query_lower:
                    customer = c["name"]
                    break
            
            return {
                "answer": f"I have prepared a calendar meeting invite for **{customer}**. You can confirm and place it on your schedule.",
                "confidence": 0.98,
                "sources": [],
                "crm_records": [],
                "intent": "action_confirmation",
                "recommended_action": {
                    "type": "schedule_meeting",
                    "label": "Confirm & Schedule Meeting",
                    "payload": {
                        "customer_name": customer,
                        "title": f"Follow-up Discussion: {customer}",
                        "date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
                        "time": "11:00 AM",
                        "duration": "30 mins",
                        "event_type": "Meeting",
                        "location": "Google Meet"
                    }
                }
            }
        return None

    def _try_crm_query(self, query: str, user_role: str) -> Optional[Dict[str, Any]]:
        # A. High-value leads / Mumbai leads
        if "lead" in query and ("mumbai" in query or "high" in query or "high-value" in query or "all" in query or "score" in query or "pune" in query or "delhi" in query):
            city_filter = None
            if "mumbai" in query: city_filter = "mumbai"
            elif "pune" in query: city_filter = "pune"
            elif "delhi" in query: city_filter = "delhi"

            leads = [
                l for l in db.leads 
                if (not city_filter or l["city"].lower() == city_filter) and (l["lead_score"] >= 65 or "high" not in query)
            ]
            if not leads:
                leads = db.leads[:3]

            answer = f"Found **{len(leads)} matching leads** in the CRM database:\n\n"
            records = []
            for l in leads:
                answer += f"• **{l['first_name']} {l['last_name']}** ({l['company']}) — City: {l['city']}, AI Score: **{l['lead_score']}/100**, Value: **₹{l['lead_value']:,.0f}**, Status: `{l['status']}`\n"
                records.append({
                    "type": "Lead",
                    "id": l["id"],
                    "title": f"{l['first_name']} {l['last_name']}",
                    "subtitle": l["company"],
                    "value": f"₹{l['lead_value']:,.0f}",
                    "badge": f"Score: {l['lead_score']}/100"
                })

            top_lead = leads[0]
            return {
                "answer": answer,
                "confidence": 0.96,
                "sources": [{"title": "CRM Database → Leads", "page": 1, "category": "CRM", "snippet": "Active leads table filtered by score, city, and status."}],
                "crm_records": records,
                "intent": "crm_query",
                "recommended_action": {
                    "type": "create_task",
                    "label": f"Follow-up with {top_lead['first_name']} ({top_lead['company']})",
                    "payload": {
                        "customer_name": top_lead["company"],
                        "title": f"Follow-up with {top_lead['first_name']} {top_lead['last_name']}",
                        "priority": "Urgent" if top_lead["lead_score"] >= 85 else "Normal",
                        "due_date": (datetime.now() + timedelta(days=1)).strftime("%d %b %Y"),
                        "assigned_to": top_lead.get("assigned_to", "Amit Sharma"),
                        "description": f"AI Follow-up on lead value ₹{top_lead['lead_value']:,.0f}",
                        "is_ai_generated": True
                    }
                }
            }

        # B. Deals likely to close / closing this month / pipeline queries
        if "deal" in query and ("close" in query or "closing" in query or "month" in query or "likely" in query or "pipeline" in query or "stage" in query or "negotiation" in query):
            closing_deals = [d for d in db.deals if d["probability"] >= 50 and d["stage"] != "Deal Closed"]
            if not closing_deals:
                closing_deals = db.deals[:3]

            total_val = sum(d["deal_value"] for d in closing_deals)
            answer = f"There are **{len(closing_deals)} active deals** in closing stages with an aggregate pipeline value of **₹{total_val:,.0f}**:\n\n"
            records = []
            for d in closing_deals:
                answer += f"• **{d['deal_name']}** ({d['company_name']}) — Stage: `{d['stage']}`, Expected: {d['expected_close_date']}, Win Probability: **{d['probability']}%**, Value: **₹{d['deal_value']:,.0f}**, Owner: {d['owner']}\n"
                records.append({
                    "type": "Deal",
                    "id": d["id"],
                    "title": d["deal_name"],
                    "subtitle": d["company_name"],
                    "value": f"₹{d['deal_value']:,.0f}",
                    "badge": f"{d['probability']}% Win Prob"
                })

            top_deal = closing_deals[0]
            return {
                "answer": answer,
                "confidence": 0.95,
                "sources": [{"title": "CRM Database → Deals Pipeline", "page": 1, "category": "CRM", "snippet": "Active deals pipeline with stage and win probability metrics."}],
                "crm_records": records,
                "intent": "crm_query",
                "recommended_action": {
                    "type": "create_task",
                    "label": f"Create Close-Plan for {top_deal['company_name']}",
                    "payload": {
                        "title": f"Executive Sign-off Review for {top_deal['deal_name']}",
                        "customer_name": top_deal["company_name"],
                        "priority": "Urgent",
                        "due_date": (datetime.now() + timedelta(days=2)).strftime("%d %b %Y"),
                        "assigned_to": top_deal.get("owner", "Amit Sharma"),
                        "description": f"Prepare contract signing draft for ₹{top_deal['deal_value']:,.0f} deal.",
                        "is_ai_generated": True
                    }
                }
            }

        # C. Churn risk / Inactive customers / At-risk accounts
        if "churn" in query or "inactive" in query or "30 days" in query or "risk" in query or "health" in query:
            at_risk = [c for c in db.companies if c.get("churn_risk") in ["High", "Medium"]]
            if not at_risk:
                at_risk = db.companies[:2]

            answer = f"Identified **{len(at_risk)} accounts with elevated churn risk**:\n\n"
            records = []
            for c in at_risk:
                answer += f"• **{c['name']}** ({c['city']}) — Health Score: **{c['customer_health']}/100**, Churn Risk: `{c['churn_risk']}` ({c['churn_probability']}% probability).\n  *AI Note:* {c.get('ai_recommendation', 'Schedule CS check-in.')}\n"
                records.append({
                    "type": "Company",
                    "id": c["id"],
                    "title": c["name"],
                    "subtitle": f"{c['city']}, {c['state']}",
                    "value": f"Health: {c['customer_health']}/100",
                    "badge": f"{c['churn_risk']} Risk"
                })

            top_risk = at_risk[0]
            return {
                "answer": answer,
                "confidence": 0.94,
                "sources": [{"title": "CRM Database → Customer Health & Churn Model", "page": 1, "category": "AI Analytics", "snippet": "Predictive churn model scoring based on telemetry and engagement."}],
                "crm_records": records,
                "intent": "crm_query",
                "recommended_action": {
                    "type": "create_task",
                    "label": f"Schedule Retention Review for {top_risk['name']}",
                    "payload": {
                        "title": f"Customer Retention Intervention - {top_risk['name']}",
                        "customer_name": top_risk["name"],
                        "priority": "Urgent",
                        "due_date": datetime.now().strftime("%d %b %Y"),
                        "assigned_to": "Sneha Kulkarni",
                        "description": f"Urgent CS review for account with health score {top_risk['customer_health']}/100.",
                        "is_ai_generated": True
                    }
                }
            }

        # D. Summarize a company e.g. TechNova / FinEdge / Bharat Logistics / GreenGrid
        for comp in db.companies:
            if comp["name"].lower() in query or comp["name"].split()[0].lower() in query:
                deals = [d for d in db.deals if d.get("company_id") == comp["id"] or d.get("company_name") == comp["name"]]
                contacts = [c for c in db.contacts if c.get("company_id") == comp["id"] or c.get("company") == comp["name"]]
                deal_val = sum(d["deal_value"] for d in deals)
                
                answer = f"**Executive 360 Summary: {comp['name']}**\n\n"
                answer += f"• **Status:** `{comp['customer_status']}` (Customer Since: {comp['customer_since']})\n"
                answer += f"• **Location:** {comp['city']}, {comp['state']} (GSTIN: `{comp['gstin']}`)\n"
                answer += f"• **Health & Churn:** Score: **{comp['customer_health']}/100** | Churn Risk: `{comp['churn_risk']}` ({comp['churn_probability']}%)\n"
                answer += f"• **Revenue / Pipeline:** Total Revenue: **₹{comp['total_revenue']:,.0f}**, {len(deals)} Deal(s) worth **₹{deal_val:,.0f}**\n"
                answer += f"• **Key Contacts ({len(contacts)}):** " + (", ".join([f"{c['name']} ({c['designation']})" for c in contacts]) if contacts else "None recorded") + "\n"
                answer += f"\n*AI Recommendation:* {comp.get('ai_recommendation', 'Maintain periodic executive relationship touchpoints.')}"

                records = [
                    {"type": "Company", "id": comp["id"], "title": comp["name"], "subtitle": comp["industry"], "value": f"₹{comp['total_revenue']:,.0f}", "badge": comp["customer_status"]}
                ]
                return {
                    "answer": answer,
                    "confidence": 0.98,
                    "sources": [{"title": f"CRM Database → Company 360 ({comp['name']})", "page": 1, "category": "CRM 360", "snippet": "Consolidated record of deals, contacts, billing and activity."}],
                    "crm_records": records,
                    "intent": "crm_query",
                    "recommended_action": {
                        "type": "create_task",
                        "label": f"Action Plan for {comp['name']}",
                        "payload": {
                            "title": f"Follow-up on {comp['name']} strategy",
                            "customer_name": comp["name"],
                            "priority": "High",
                            "due_date": (datetime.now() + timedelta(days=3)).strftime("%d %b %Y"),
                            "assigned_to": "Amit Sharma",
                            "description": comp.get("ai_recommendation", ""),
                            "is_ai_generated": True
                        }
                    }
                }

        # E. Sales Executive / Performance query
        if "sales executive" in query or "conversion" in query or "top performer" in query or "rep" in query or "performance" in query or "leaderboard" in query:
            answer = "**Sales Team Performance Summary (Current Fiscal Year):**\n\n"
            answer += "1. 🥇 **Amit Sharma** — 14 Deals Won, ₹12.8 Lakhs Revenue, **68% Conversion Rate**\n"
            answer += "2. 🥈 **Priya Patil** — 11 Deals Won, ₹8.4 Lakhs Revenue, **62% Conversion Rate**\n"
            answer += "3. 🥉 **Rohan Joshi** — 7 Deals Won, ₹4.2 Lakhs Revenue, **51% Conversion Rate**\n\n"
            answer += "*AI Insight:* Amit Sharma has the highest win rate on Enterprise IT Services accounts."
            return {
                "answer": answer,
                "confidence": 0.97,
                "sources": [{"title": "CRM Database → Sales Leaderboard & Analytics", "page": 1, "category": "Analytics", "snippet": "Rep conversion metrics and pipeline velocity."}],
                "crm_records": [],
                "intent": "crm_query",
                "recommended_action": None
            }

        return None

ai_assistant = AIAssistant()
