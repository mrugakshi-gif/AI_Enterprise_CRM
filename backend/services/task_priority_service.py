"""
TaskPriorityService — Authoritative intelligent task priority engine.

Architecture:
  Database → ai_assistant.calculate_deal_risk (reused) → TaskPriorityService → API

Priority Score Factors (configurable):
  Deal Risk Score      : 30 pts max
  Revenue Impact       : 25 pts max
  Urgency / Due Date   : 20 pts max
  Customer Health      : 15 pts max
  Overdue Severity     : 10 pts max
  Total               : 100 pts

Priority Levels:
  90–100 → CRITICAL
  75–89  → HIGH
  50–74  → MEDIUM
  25–49  → LOW
  0–24   → MINIMAL
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from backend.database import db
from backend.ai_assistant import ai_assistant

PRIORITY_WEIGHTS = {
    "deal_risk":        30,
    "revenue_impact":   25,
    "urgency":          20,
    "customer_health":  15,
    "overdue_severity": 10,
}

PRIORITY_THRESHOLDS = {"CRITICAL": 90, "HIGH": 75, "MEDIUM": 50, "LOW": 25}
PRIORITY_COLORS = {"CRITICAL": "#EF4444", "HIGH": "#F59E0B", "MEDIUM": "#EAB308", "LOW": "#6366F1", "MINIMAL": "#6B7280"}
PRIORITY_ICONS  = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢", "MINIMAL": "⚪"}


def _parse_due_date(due_str: str) -> Optional[datetime]:
    if not due_str:
        return None
    due_lower = due_str.strip().lower()
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    if due_lower == "today":    return today
    if due_lower == "tomorrow": return today + timedelta(days=1)
    if due_lower == "yesterday":return today - timedelta(days=1)
    for fmt in ("%d %b %Y", "%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%b %d, %Y"):
        try:
            return datetime.strptime(due_str.strip(), fmt)
        except ValueError:
            continue
    return None


class TaskPriorityService:

    def calculate_task_priority(self, task: Dict[str, Any]) -> Dict[str, Any]:
        score = 0
        breakdown = []

        deal    = self._resolve_deal(task)
        company = self._resolve_company(task, deal)

        # Factor 1 — Deal Risk (30 pts)
        risk_score_raw  = 0
        risk_evidence   = []
        if deal:
            risk_result         = ai_assistant.calculate_deal_risk(deal)
            risk_score_raw      = risk_result.get("risk_score", 0)
            risk_evidence       = risk_result.get("evidence_reasons", [])
            contribution        = round((risk_score_raw / 100) * PRIORITY_WEIGHTS["deal_risk"])
            score              += contribution
            reason              = f"Deal risk {risk_score_raw}/100 — {risk_result.get('risk_level','')}"
            if risk_evidence:
                reason += f": {risk_evidence[0]}"
            breakdown.append({"factor": "Deal Risk", "contribution": contribution, "reason": reason})
        else:
            breakdown.append({"factor": "Deal Risk", "contribution": 0, "reason": "No linked deal — administrative task"})

        # Factor 2 — Revenue Impact (25 pts)
        revenue_inr = 0.0
        if deal:
            revenue_inr = deal.get("deal_value", 0.0)
            if   revenue_inr >= 1_000_000: rc = 25
            elif revenue_inr >= 500_000:   rc = 18
            elif revenue_inr >= 200_000:   rc = 12
            elif revenue_inr >= 50_000:    rc = 6
            else:                          rc = 2
            score += rc
            breakdown.append({"factor": "Revenue Impact", "contribution": rc, "reason": f"Deal value ₹{revenue_inr/100000:.1f}L"})
        else:
            breakdown.append({"factor": "Revenue Impact", "contribution": 0, "reason": "No direct revenue impact (no linked deal)"})

        # Factor 3 — Urgency / Due Date (20 pts)
        today  = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        due_dt = _parse_due_date(task.get("due_date", ""))
        if due_dt is not None:
            days_until_due = (due_dt - today).days
            if   days_until_due  < 0: uc = 20; ur = f"Task is {abs(days_until_due)} day(s) overdue"
            elif days_until_due == 0: uc = 20; ur = "Due today"
            elif days_until_due == 1: uc = 16; ur = "Due tomorrow"
            elif days_until_due <= 3: uc = 12; ur = f"Due in {days_until_due} days"
            elif days_until_due <= 7: uc =  8; ur = f"Due in {days_until_due} days"
            elif days_until_due <=14: uc =  4; ur = f"Due in {days_until_due} days"
            else:                     uc =  1; ur = f"Due in {days_until_due} days"
        else:
            uc = 3; ur = "No due date set"
        score += uc
        breakdown.append({"factor": "Urgency / Due Date", "contribution": uc, "reason": ur})

        # Factor 4 — Customer Health (15 pts)
        if company:
            hs = company.get("customer_health", 80)
            cr = company.get("churn_risk", "Low")
            if   hs < 40 or cr == "High":   hc = 15; hr = f"Customer health critical: {hs}/100 (churn {cr})"
            elif hs < 60 or cr == "Medium": hc = 10; hr = f"Customer health needs attention: {hs}/100"
            elif hs < 75:                   hc =  6; hr = f"Customer health moderate: {hs}/100"
            else:                           hc =  2; hr = f"Customer health good: {hs}/100"
        else:
            hc = 0; hr = "No linked customer account"
        score += hc
        breakdown.append({"factor": "Customer Health", "contribution": hc, "reason": hr})

        # Factor 5 — Overdue Severity (10 pts)
        if due_dt is not None:
            days_overdue = (today - due_dt).days
            if   days_overdue >= 7: oc = 10; oreason = f"Severely overdue: {days_overdue} days past due"
            elif days_overdue >= 3: oc =  7; oreason = f"Overdue: {days_overdue} days past due"
            elif days_overdue >= 1: oc =  4; oreason = f"Overdue: {days_overdue} day(s) past due"
            else:                   oc =  0; oreason = "Not overdue"
        else:
            oc = 0; oreason = "No due date"
        if oc > 0:
            score += oc
            breakdown.append({"factor": "Overdue Severity", "contribution": oc, "reason": oreason})

        if task.get("status") == "Done":
            score = 0

        final_score    = min(100, max(0, score))
        priority_level = self._classify(final_score)

        return {
            "task_id":                  task.get("id"),
            "priority_score":           final_score,
            "priority_level":           priority_level,
            "priority_color":           PRIORITY_COLORS.get(priority_level, "#6B7280"),
            "priority_icon":            PRIORITY_ICONS.get(priority_level, "⚪"),
            "score_breakdown":          breakdown,
            "revenue_impact_inr":       revenue_inr,
            "revenue_impact_formatted": f"₹{revenue_inr/100000:.1f}L" if revenue_inr > 0 else "No direct revenue impact",
            "deal_name":                deal.get("deal_name") if deal else None,
            "company_name":             deal.get("company_name") if deal else task.get("customer_name"),
            "risk_score":               risk_score_raw if deal else None,
            "risk_evidence":            risk_evidence[:3],
            "recommended_action":       self._build_recommendation(task, deal, risk_score_raw, final_score),
            "ai_recommended_deadline":  self._suggest_deadline(task, deal, risk_score_raw, due_dt, today),
        }

    def get_priority_queue(self, tasks: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        if tasks is None:
            tasks = db.tasks
        active = [t for t in tasks if t.get("status") != "Done"]
        enriched = [{**t, **self.calculate_task_priority(t)} for t in active]
        enriched.sort(key=lambda x: (-x["priority_score"], x.get("due_date", "ZZZ")))
        return enriched

    def get_priority_summary(self, tasks: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        queue  = self.get_priority_queue(tasks)
        counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "MINIMAL": 0}
        for t in queue:
            counts[t.get("priority_level", "MINIMAL")] += 1
        return counts

    def _resolve_deal(self, task):
        deal_id = task.get("deal_id")
        if deal_id:
            d = next((d for d in db.deals if d.get("id") == deal_id), None)
            if d: return d
        cust = task.get("customer_name", "")
        if cust:
            return next(
                (d for d in db.deals if d.get("company_name") == cust
                 and d.get("stage") not in ["Closed Won", "Deal Closed", "Closed Lost", "Lost"]),
                None
            )
        return None

    def _resolve_company(self, task, deal):
        cid  = task.get("company_id") or (deal.get("company_id") if deal else None)
        name = (deal.get("company_name") if deal else None) or task.get("customer_name", "")
        if cid:
            c = next((c for c in db.companies if c.get("id") == cid), None)
            if c: return c
        if name:
            return next((c for c in db.companies if c.get("name") == name), None)
        return None

    def _classify(self, score: int) -> str:
        if score >= 90: return "CRITICAL"
        if score >= 75: return "HIGH"
        if score >= 50: return "MEDIUM"
        if score >= 25: return "LOW"
        return "MINIMAL"

    def _build_recommendation(self, task, deal, risk_score, priority_score):
        if not deal:
            return "Complete task within scheduled timeline."
        c = deal.get("company_name", "this account")
        if priority_score >= 90: return f"Immediate action required: Contact {c} today to prevent deal loss."
        if priority_score >= 75: return f"High-priority follow-up: Engage {c} to progress the deal."
        if priority_score >= 50: return f"Prepare and execute next step with {c} to maintain momentum."
        return f"Continue standard follow-up with {c}."

    def _suggest_deadline(self, task, deal, risk_score, due_dt, today):
        if not deal: return None
        close_dt = _parse_due_date(deal.get("expected_close_date", ""))
        if close_dt:
            days_to_close = (close_dt - today).days
            if days_to_close <= 7 and (due_dt is None or (due_dt - today).days > 0):
                return "Today"
            if days_to_close <= 14 and risk_score >= 60:
                rec = today + timedelta(days=3)
                if due_dt is None or (due_dt - today).days > 3:
                    return rec.strftime("%d %b %Y")
        if risk_score >= 65 and due_dt is None:
            return "Today"
        return None


task_priority_service = TaskPriorityService()
