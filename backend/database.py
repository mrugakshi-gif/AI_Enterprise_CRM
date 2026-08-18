import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

class CRMDatabase:
    def __init__(self):
        self.users: List[Dict[str, Any]] = []
        self.leads: List[Dict[str, Any]] = []
        self.contacts: List[Dict[str, Any]] = []
        self.companies: List[Dict[str, Any]] = []
        self.deals: List[Dict[str, Any]] = []
        self.tasks: List[Dict[str, Any]] = []
        self.activities: List[Dict[str, Any]] = []
        self.events: List[Dict[str, Any]] = []
        self.documents: List[Dict[str, Any]] = []
        self.notifications: List[Dict[str, Any]] = []
        self.audit_logs: List[Dict[str, Any]] = []
        self.settings: Dict[str, Any] = {}
        self.seed_initial_data()

    def seed_initial_data(self):
        # 1. Users
        self.users = [
            {
                "id": "usr-1",
                "name": "Kabir Mehta",
                "email": "kabir.mehta@nexoracrm.in",
                "role": "ADMIN",
                "department": "Executive Leadership",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "status": "Active",
                "last_active": "Online now"
            },
            {
                "id": "usr-2",
                "name": "Priya Patil",
                "email": "priya.patil@nexoracrm.in",
                "role": "SALES_MANAGER",
                "department": "Sales",
                "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                "status": "Active",
                "last_active": "5 mins ago"
            },
            {
                "id": "usr-3",
                "name": "Amit Sharma",
                "email": "amit.sharma@nexoracrm.in",
                "role": "SALES_EXECUTIVE",
                "department": "Sales",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "status": "Active",
                "last_active": "Just now"
            },
            {
                "id": "usr-4",
                "name": "Sneha Kulkarni",
                "email": "sneha.k@nexoracrm.in",
                "role": "SUPPORT_AGENT",
                "department": "Customer Success",
                "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
                "status": "Active",
                "last_active": "12 mins ago"
            },
            {
                "id": "usr-5",
                "name": "Rohan Joshi",
                "email": "rohan.joshi@nexoracrm.in",
                "role": "SALES_EXECUTIVE",
                "department": "Sales",
                "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                "status": "Active",
                "last_active": "22 mins ago"
            }
        ]

        # 2. Companies
        self.companies = [
            {
                "id": "comp-1",
                "name": "TechNova Solutions",
                "industry": "IT Services",
                "city": "Mumbai",
                "state": "Maharashtra",
                "gstin": "27ABCDE1234F1Z5",
                "pan": "ABCDE1234F",
                "contacts_count": 12,
                "active_deals_count": 4,
                "total_revenue": 1840000.0,
                "customer_status": "Customer",
                "customer_since": "14 Jan 2025",
                "customer_health": 82,
                "churn_risk": "Low",
                "churn_probability": 14,
                "ai_recommendation": "Renewal discussion should begin within the next 14 days.",
                "website": "https://technovasolutions.in",
                "employees": "150-300"
            },
            {
                "id": "comp-2",
                "name": "FinEdge Systems",
                "industry": "Financial Services",
                "city": "Pune",
                "state": "Maharashtra",
                "gstin": "27AABCF5678G2Z1",
                "pan": "AABCF5678G",
                "contacts_count": 8,
                "active_deals_count": 2,
                "total_revenue": 1250000.0,
                "customer_status": "Customer",
                "customer_since": "22 Feb 2025",
                "customer_health": 88,
                "churn_risk": "Low",
                "churn_probability": 10,
                "ai_recommendation": "Upsell opportunity for AI Analytics Module detected.",
                "website": "https://finedgesystems.com",
                "employees": "80-150"
            },
            {
                "id": "comp-3",
                "name": "Bharat Logistics",
                "industry": "Logistics",
                "city": "Delhi",
                "state": "Delhi",
                "gstin": "07AAACB9876D1Z9",
                "pan": "AAACB9876D",
                "contacts_count": 6,
                "active_deals_count": 2,
                "total_revenue": 920000.0,
                "customer_status": "Prospect",
                "customer_since": "05 Mar 2026",
                "customer_health": 74,
                "churn_risk": "Medium",
                "churn_probability": 35,
                "ai_recommendation": "Executive sponsor meeting required to finalize contract terms.",
                "website": "https://bharatlogistics.in",
                "employees": "250-500"
            },
            {
                "id": "comp-4",
                "name": "GreenGrid Energy",
                "industry": "Renewable Tech",
                "city": "Bengaluru",
                "state": "Karnataka",
                "gstin": "29AABCG4432K1Z4",
                "pan": "AABCG4432K",
                "contacts_count": 5,
                "active_deals_count": 3,
                "total_revenue": 2100000.0,
                "customer_status": "Customer",
                "customer_since": "10 Nov 2024",
                "customer_health": 94,
                "churn_risk": "Low",
                "churn_probability": 6,
                "ai_recommendation": "High NPS score — request testimonial or case study.",
                "website": "https://greengridenergy.in",
                "employees": "100-250"
            },
            {
                "id": "comp-5",
                "name": "EduSphere Technologies",
                "industry": "Education",
                "city": "Hyderabad",
                "state": "Telangana",
                "gstin": "36AACCE9911P1Z8",
                "pan": "AACCE9911P",
                "contacts_count": 4,
                "active_deals_count": 1,
                "total_revenue": 650000.0,
                "customer_status": "Prospect",
                "customer_since": "18 Apr 2026",
                "customer_health": 68,
                "churn_risk": "Medium",
                "churn_probability": 42,
                "ai_recommendation": "Follow-up on pending institutional LMS RFP proposal.",
                "website": "https://edusphere.co.in",
                "employees": "50-100"
            },
            {
                "id": "comp-6",
                "name": "Global Solutions Ltd",
                "industry": "Consulting",
                "city": "Mumbai",
                "state": "Maharashtra",
                "gstin": "27AAACG1122L1Z3",
                "pan": "AAACG1122L",
                "contacts_count": 3,
                "active_deals_count": 0,
                "total_revenue": 450000.0,
                "customer_status": "Customer",
                "customer_since": "15 Sep 2024",
                "customer_health": 42,
                "churn_risk": "High",
                "churn_probability": 81,
                "ai_recommendation": "Customer churn alert: No activity for 28 days and recent support ticket raised.",
                "website": "https://globalsolutionsindia.com",
                "employees": "40-90"
            }
        ]

        # 3. Contacts
        self.contacts = [
            {
                "id": "con-1",
                "name": "Rahul Sharma",
                "company": "TechNova Solutions",
                "designation": "Sales Director",
                "email": "rahul.sharma@technovasolutions.in",
                "phone": "+91 98201 44521",
                "city": "Mumbai",
                "state": "Maharashtra",
                "status": "Active",
                "owner": "Amit Sharma",
                "last_contact": "16 Aug 2026",
                "created_at": "12 Jan 2026",
                "ai_summary": "Rahul is a key decision maker involved in two active enterprise rollout opportunities.",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            },
            {
                "id": "con-2",
                "name": "Vikram Deshmukh",
                "company": "TechNova Solutions",
                "designation": "Chief Technology Officer",
                "email": "vikram.d@technovasolutions.in",
                "phone": "+91 98220 88991",
                "city": "Mumbai",
                "state": "Maharashtra",
                "status": "Active",
                "owner": "Priya Patil",
                "last_contact": "14 Aug 2026",
                "created_at": "18 Jan 2026",
                "ai_summary": "Technical lead evaluating API & single sign-on integration architecture.",
                "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
            },
            {
                "id": "con-3",
                "name": "Ananya Kulkarni",
                "company": "FinEdge Systems",
                "designation": "VP of Operations",
                "email": "ananya.k@finedgesystems.com",
                "phone": "+91 97654 32109",
                "city": "Pune",
                "state": "Maharashtra",
                "status": "Active",
                "owner": "Sneha Kulkarni",
                "last_contact": "15 Aug 2026",
                "created_at": "24 Feb 2026",
                "ai_summary": "High engagement sponsor keen on automated compliance and GST reporting.",
                "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
            },
            {
                "id": "con-4",
                "name": "Harish Verma",
                "company": "Bharat Logistics",
                "designation": "Managing Director",
                "email": "harish.verma@bharatlogistics.in",
                "phone": "+91 98110 55432",
                "city": "Delhi",
                "state": "Delhi",
                "status": "Active",
                "owner": "Rohan Joshi",
                "last_contact": "11 Aug 2026",
                "created_at": "08 Mar 2026",
                "ai_summary": "Final budget authority for 14-branch CRM software procurement.",
                "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
            },
            {
                "id": "con-5",
                "name": "Divya Reddy",
                "company": "GreenGrid Energy",
                "designation": "Head of Enterprise Systems",
                "email": "divya.reddy@greengridenergy.in",
                "phone": "+91 99887 76655",
                "city": "Bengaluru",
                "state": "Karnataka",
                "status": "Active",
                "owner": "Amit Sharma",
                "last_contact": "17 Aug 2026",
                "created_at": "15 Nov 2024",
                "ai_summary": "Champion user actively providing feedback and evaluating custom dashboard modules.",
                "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
            }
        ]

        # 4. Leads
        self.leads = [
            {
                "id": "lead-1",
                "first_name": "Rahul",
                "last_name": "Sharma",
                "email": "rahul.sharma@technovasolutions.in",
                "phone": "+91 98201 44521",
                "company": "TechNova Solutions",
                "job_title": "Sales Director",
                "industry": "IT Services",
                "city": "Mumbai",
                "state": "Maharashtra",
                "source": "Website",
                "status": "Qualified",
                "lead_score": 87,
                "lead_value": 450000.0,
                "assigned_to": "Amit Sharma",
                "expected_closing": "24 Aug 2026",
                "notes": "Requested custom enterprise multi-tenant configuration.",
                "created_at": "10 Aug 2026",
                "last_contact": "16 Aug 2026",
                "ai_summary": "High engagement score based on website product demo visit & pricing download.",
                "ai_reasons": ["High engagement", "Multiple interactions", "Requested pricing", "Visited product page", "Opened recent email"],
                "ai_recommended_action": "Schedule a product demonstration within 24 hours."
            },
            {
                "id": "lead-2",
                "first_name": "Priya",
                "last_name": "Patil",
                "email": "priya.p@finedgesystems.com",
                "phone": "+91 98902 33412",
                "company": "FinEdge Systems",
                "job_title": "VP Strategy",
                "industry": "Financial Services",
                "city": "Pune",
                "state": "Maharashtra",
                "source": "LinkedIn",
                "status": "Contacted",
                "lead_score": 76,
                "lead_value": 380000.0,
                "assigned_to": "Sneha Kulkarni",
                "expected_closing": "30 Aug 2026",
                "notes": "Discussed SOC2 and data localization compliance requirements.",
                "created_at": "12 Aug 2026",
                "last_contact": "15 Aug 2026",
                "ai_summary": "Interested in Indian banking integration & GST automated invoice creation.",
                "ai_reasons": ["Inbound LinkedIn message", "Visited security whitepaper", "Decision maker authority"],
                "ai_recommended_action": "Send SOC2 compliance report and schedule deep-dive."
            },
            {
                "id": "lead-3",
                "first_name": "Harish",
                "last_name": "Verma",
                "email": "harish.v@bharatlogistics.in",
                "phone": "+91 98110 55432",
                "company": "Bharat Logistics",
                "job_title": "Managing Director",
                "industry": "Logistics",
                "city": "Delhi",
                "state": "Delhi",
                "source": "Referral",
                "status": "Proposal",
                "lead_score": 91,
                "lead_value": 620000.0,
                "assigned_to": "Amit Sharma",
                "expected_closing": "18 Aug 2026",
                "notes": "Proposal for 150 fleet tracking & customer portal seats delivered.",
                "created_at": "05 Aug 2026",
                "last_contact": "16 Aug 2026",
                "ai_summary": "Proposal actively reviewed by board; pricing negotiation underway.",
                "ai_reasons": ["Proposal document opened 7 times", "Budget confirmed", "Referral from existing client"],
                "ai_recommended_action": "Offer annual payment discount of 8% to close by Friday."
            },
            {
                "id": "lead-4",
                "first_name": "Suresh",
                "last_name": "Iyer",
                "email": "suresh.iyer@apexmedicare.in",
                "phone": "+91 94440 12890",
                "company": "Apex Medicare Solutions",
                "job_title": "Chief Administrative Officer",
                "industry": "Healthcare Admin",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "source": "Google Ads",
                "status": "New",
                "lead_score": 64,
                "lead_value": 290000.0,
                "assigned_to": "Rohan Joshi",
                "expected_closing": "10 Sep 2026",
                "notes": "Looking for patient relationship management and doctor schedule calendar.",
                "created_at": "16 Aug 2026",
                "last_contact": "16 Aug 2026",
                "ai_summary": "Initial form submission, needs discovery call.",
                "ai_reasons": ["High search intent", "Enterprise healthcare vertical"],
                "ai_recommended_action": "Assign discovery call and send Healthcare CRM brochure."
            },
            {
                "id": "lead-5",
                "first_name": "Deepak",
                "last_name": "Rao",
                "email": "deepak.rao@cloudmatrix.in",
                "phone": "+91 97230 45678",
                "company": "CloudMatrix India",
                "job_title": "Head of Sales",
                "industry": "IT Services",
                "city": "Ahmedabad",
                "state": "Gujarat",
                "source": "Partner",
                "status": "Contacted",
                "lead_score": 58,
                "lead_value": 310000.0,
                "assigned_to": "Priya Patil",
                "expected_closing": "05 Sep 2026",
                "notes": "Partner referral through AWS India network.",
                "created_at": "14 Aug 2026",
                "last_contact": "15 Aug 2026",
                "ai_summary": "Exploring CRM migration from legacy spreadsheets.",
                "ai_reasons": ["Partner validation", "Mid-size team"],
                "ai_recommended_action": "Send data migration guide and schedule 20-min demo."
            }
        ]

        # 5. Deals
        self.deals = [
            {
                "id": "deal-1",
                "company_name": "TechNova Solutions",
                "deal_name": "Enterprise CRM Implementation",
                "description": "Full-stack enterprise CRM deployment with WhatsApp API & RAG Assistant for 120 users.",
                "deal_value": 450000.0,
                "stage": "Negotiation",
                "expected_close_date": "24 Aug 2026",
                "owner": "Amit Sharma",
                "priority": "High",
                "probability": 78,
                "win_factors": ["High executive engagement", "Decision maker involved", "Proposal opened 12 times", "Recent technical demo cleared"],
                "risk_factor": "Pricing objection detected on implementation SLA.",
                "ai_recommendation": "Offer annual-plan pricing with free onboarding training rather than reducing the base package price.",
                "created_at": "01 Aug 2026",
                "last_updated": "16 Aug 2026",
                "contact_name": "Rahul Sharma"
            },
            {
                "id": "deal-2",
                "company_name": "FinEdge Systems",
                "deal_name": "FinTech Compliance & CRM Suite",
                "description": "Automated KYC workflow, GST invoice generator, and RBI audit log trail integration.",
                "deal_value": 380000.0,
                "stage": "Proposal Sent",
                "expected_close_date": "30 Aug 2026",
                "owner": "Priya Patil",
                "priority": "High",
                "probability": 65,
                "win_factors": ["Custom GST requirement fulfilled", "Direct VP sponsorship"],
                "risk_factor": "Budget sign-off pending Q3 financial committee review.",
                "ai_recommendation": "Share ROI calculator showing 34% reduction in lead follow-up latency.",
                "created_at": "04 Aug 2026",
                "last_updated": "15 Aug 2026",
                "contact_name": "Ananya Kulkarni"
            },
            {
                "id": "deal-3",
                "company_name": "Bharat Logistics",
                "deal_name": "Nationwide Fleet CRM & Dispatch Portal",
                "description": "Multi-city logistics pipeline connecting 14 transit hubs across North India.",
                "deal_value": 620000.0,
                "stage": "Contacted",
                "expected_close_date": "15 Sep 2026",
                "owner": "Amit Sharma",
                "priority": "Urgent",
                "probability": 45,
                "win_factors": ["High volume requirement", "Competitor contract expiring"],
                "risk_factor": "Competitor Zoho CRM in active shortlist.",
                "ai_recommendation": "Highlight Nexora's AI Knowledge Assistant & native Indian GST compliance advantage.",
                "created_at": "10 Aug 2026",
                "last_updated": "14 Aug 2026",
                "contact_name": "Harish Verma"
            },
            {
                "id": "deal-4",
                "company_name": "GreenGrid Energy",
                "deal_name": "Solar Project Pipeline & Service CRM",
                "description": "EPC installation tracking, field technician mobile updates, and government subsidy logging.",
                "deal_value": 540000.0,
                "stage": "Deal Closed",
                "expected_close_date": "12 Aug 2026",
                "owner": "Amit Sharma",
                "priority": "Normal",
                "probability": 100,
                "win_factors": ["Signed 2-year contract", "Advance payment received via RTGS"],
                "risk_factor": None,
                "ai_recommendation": "Kickoff onboarding task list and schedule CS introduction.",
                "created_at": "15 Jul 2026",
                "last_updated": "12 Aug 2026",
                "contact_name": "Divya Reddy"
            },
            {
                "id": "deal-5",
                "company_name": "EduSphere Technologies",
                "deal_name": "EdTech Admissions & Counselor CRM",
                "description": "Student lead nurturing, Telephony dialer integration, and payment gateway webhooks.",
                "deal_value": 310000.0,
                "stage": "Qualified",
                "expected_close_date": "08 Sep 2026",
                "owner": "Rohan Joshi",
                "priority": "Medium",
                "probability": 55,
                "win_factors": ["Strong product demo feedback", "Ready for student intake season"],
                "risk_factor": "Requires custom payment gateway connector.",
                "ai_recommendation": "Confirm Razorpay & Cashfree API readiness to remove technical objection.",
                "created_at": "08 Aug 2026",
                "last_updated": "16 Aug 2026",
                "contact_name": "Deepak Rao"
            },
            {
                "id": "deal-6",
                "company_name": "Maharashtra Digital Works",
                "deal_name": "Agency Client Hub & Retainer Tracking",
                "description": "White-label client reporting and task collaboration workspace.",
                "deal_value": 240000.0,
                "stage": "Deal Closed",
                "expected_close_date": "02 Aug 2026",
                "owner": "Priya Patil",
                "priority": "Normal",
                "probability": 100,
                "win_factors": ["Fast decision cycle", "Quarterly upfront payment"],
                "risk_factor": None,
                "ai_recommendation": "Upsell additional team seat pack during month 3.",
                "created_at": "20 Jul 2026",
                "last_updated": "02 Aug 2026",
                "contact_name": "Nitin Gadve"
            }
        ]

        # 6. Tasks (inspired directly by Screenshot 1 & 2)
        self.tasks = [
            {
                "id": "MDS-39",
                "title": "Follow up with TechNova Solutions",
                "customer_name": "TechNova Solutions",
                "sub_title": "Enterprise CRM Implementation",
                "status": "In progress",
                "priority": "Urgent",
                "due_date": "18 Aug 2026",
                "assigned_to": "Amit Sharma",
                "assigned_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "comments_count": 13,
                "created_date": "14 Aug 2026",
                "description": "Send updated annual contract proposal with complimentary dedicated account manager."
            },
            {
                "id": "MDS-2",
                "title": "Finalize FinEdge sales deck & ROI calculator",
                "customer_name": "FinEdge Systems",
                "sub_title": "Marketing & Compliance",
                "status": "In progress",
                "priority": "Low",
                "due_date": "19 Aug 2026",
                "assigned_to": "Priya Patil",
                "assigned_avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                "comments_count": 7,
                "created_date": "12 Aug 2026",
                "description": "Incorporate GST invoice automation figures into the ROI deck."
            },
            {
                "id": "MDS-1",
                "title": "Prepare Bharat Logistics custom case study",
                "customer_name": "Bharat Logistics",
                "sub_title": "Fleet Management",
                "status": "Validation",
                "priority": "Urgent",
                "due_date": "21 Aug 2026",
                "assigned_to": "Amit Sharma",
                "assigned_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "comments_count": 4,
                "created_date": "10 Aug 2026",
                "description": "Highlight latency improvements and 99.9% uptime SLA guarantee."
            },
            {
                "id": "MDS-12",
                "title": "Conduct GreenGrid Solar user training session",
                "customer_name": "GreenGrid Energy",
                "sub_title": "Customer Success",
                "status": "Validation",
                "priority": "Normal",
                "due_date": "22 Aug 2026",
                "assigned_to": "Sneha Kulkarni",
                "assigned_avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
                "comments_count": 2,
                "created_date": "15 Aug 2026",
                "description": "Walk field leads through mobile offline sync and ticket dispatch."
            },
            {
                "id": "MDS-56",
                "title": "Review GST invoice template customizations",
                "customer_name": "EduSphere Technologies",
                "sub_title": "Billing Module",
                "status": "Backlog",
                "priority": "Normal",
                "due_date": "25 Aug 2026",
                "assigned_to": "Rohan Joshi",
                "assigned_avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                "comments_count": 1,
                "created_date": "16 Aug 2026",
                "description": "Verify HSN/SAC code mapping for educational course fees."
            },
            {
                "id": "MDS-43",
                "title": "Integrate Razorpay payment webhooks for lead checkout",
                "customer_name": "Maharashtra Digital Works",
                "sub_title": "Payment Gateway",
                "status": "Done",
                "priority": "Low",
                "due_date": "13 Aug 2026",
                "assigned_to": "Kabir Mehta",
                "assigned_avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "comments_count": 13,
                "created_date": "08 Aug 2026",
                "description": "Webhook endpoint verified with real UPI and Net Banking sandbox transactions."
            }
        ]

        # 7. Activities
        self.activities = [
            {
                "id": "act-1",
                "type": "Call",
                "title": "Discovery call with Rahul Sharma",
                "customer_name": "TechNova Solutions",
                "time": "10:30 AM",
                "date": "17 Aug 2026",
                "performed_by": "Amit Sharma",
                "notes": "Discussed 120-seat expansion across Bangalore and Mumbai development centers."
            },
            {
                "id": "act-2",
                "type": "Email",
                "title": "Enterprise Proposal & Pricing breakdown sent",
                "customer_name": "FinEdge Systems",
                "time": "11:45 AM",
                "date": "17 Aug 2026",
                "performed_by": "Priya Patil",
                "notes": "Attached revised quotation with 3-year locking price protection."
            },
            {
                "id": "act-3",
                "type": "Meeting",
                "title": "Product demonstration & AI assistant walkthrough",
                "customer_name": "Bharat Logistics",
                "time": "02:00 PM",
                "date": "17 Aug 2026",
                "performed_by": "Amit Sharma",
                "notes": "Demonstrated natural language querying of company fleet policies."
            },
            {
                "id": "act-4",
                "type": "Note",
                "title": "GSTIN verification completed",
                "customer_name": "GreenGrid Energy",
                "time": "04:15 PM",
                "date": "16 Aug 2026",
                "performed_by": "Sneha Kulkarni",
                "notes": "GST portal confirmed active status under Karnataka commercial tax zone."
            }
        ]

        # 8. Calendar Events
        self.events = [
            {
                "id": "evt-1",
                "title": "TechNova Demo & Security Q&A",
                "event_type": "Demo",
                "date": "2026-08-18",
                "time": "10:00 AM",
                "duration": "45 mins",
                "customer_name": "TechNova Solutions",
                "attendees": ["Amit Sharma", "Rahul Sharma", "Vikram Deshmukh"],
                "location": "Google Meet: meet.google.com/nex-tech-cst",
                "description": "Executive walkthrough of Nexora CRM security protocols and role-based permissions."
            },
            {
                "id": "evt-2",
                "title": "FinEdge Follow-up & Contract Review",
                "event_type": "Meeting",
                "date": "2026-08-19",
                "time": "02:30 PM",
                "duration": "30 mins",
                "customer_name": "FinEdge Systems",
                "attendees": ["Priya Patil", "Ananya Kulkarni"],
                "location": "Google Meet: meet.google.com/fin-edge-rev",
                "description": "Review final MSA contract draft and confirm payment terms."
            },
            {
                "id": "evt-3",
                "title": "Bharat Logistics Board Presentation",
                "event_type": "Meeting",
                "date": "2026-08-20",
                "time": "11:00 AM",
                "duration": "60 mins",
                "customer_name": "Bharat Logistics",
                "attendees": ["Amit Sharma", "Harish Verma", "Kabir Mehta"],
                "location": "Bharat Logistics HQ, Connaught Place, New Delhi",
                "description": "Presentation to the board of directors regarding multi-city CRM deployment."
            },
            {
                "id": "evt-4",
                "title": "EduSphere LMS Webhook Testing",
                "event_type": "Call",
                "date": "2026-08-21",
                "time": "04:00 PM",
                "duration": "30 mins",
                "customer_name": "EduSphere Technologies",
                "attendees": ["Rohan Joshi", "Deepak Rao"],
                "location": "Zoom Meeting",
                "description": "Technical check for student enrollment lead triggers."
            }
        ]

        # 9. Knowledge Base Documents (for RAG)
        self.documents = [
            {
                "id": "doc-1",
                "name": "Enterprise Pricing & Discount Policy.pdf",
                "category": "Sales",
                "file_type": "PDF",
                "uploaded_by": "Admin",
                "upload_date": "17 Aug 2026",
                "chunks_count": 92,
                "status": "Indexed ✓",
                "file_size": "2.4 MB",
                "content_summary": "Guidelines for enterprise tiered discounts, annual contract payment terms, and manager escalation thresholds.",
                "chunks": [
                    {
                        "chunk_id": "chunk-101",
                        "document_id": "doc-1",
                        "document_name": "Enterprise Pricing & Discount Policy.pdf",
                        "text": "Enterprise discount policy allows sales executives to authorize discounts up to 10% on annual commitments exceeding ₹5 Lakhs. Discounts between 11% and 20% require Sales Manager (Priya Patil) approval. Any discount exceeding 20% requires Executive approval from Kabir Mehta.",
                        "page_number": 2,
                        "token_count": 52
                    },
                    {
                        "chunk_id": "chunk-102",
                        "document_id": "doc-1",
                        "document_name": "Enterprise Pricing & Discount Policy.pdf",
                        "text": "Standard payment terms in India are Net-30 from GST tax invoice date. Early payment discounts of 2.5% can be offered for 100% upfront annual RTGS payments.",
                        "page_number": 3,
                        "token_count": 38
                    }
                ]
            },
            {
                "id": "doc-2",
                "name": "Customer Support & SLA Policy.pdf",
                "category": "Support",
                "file_type": "PDF",
                "uploaded_by": "Sneha Kulkarni",
                "upload_date": "15 Aug 2026",
                "chunks_count": 147,
                "status": "Indexed ✓",
                "file_size": "1.8 MB",
                "content_summary": "Standard resolution times, severity levels (P1 to P4), uptime guarantees (99.9%), and customer escalation matrix.",
                "chunks": [
                    {
                        "chunk_id": "chunk-201",
                        "document_id": "doc-2",
                        "document_name": "Customer Support & SLA Policy.pdf",
                        "text": "Severity 1 (P1 - Critical Outage) response time is within 15 minutes, 24x7. Resolution SLA is 4 hours with hourly status broadcasts to customer stakeholders.",
                        "page_number": 4,
                        "token_count": 35
                    },
                    {
                        "chunk_id": "chunk-202",
                        "document_id": "doc-2",
                        "document_name": "Customer Support & SLA Policy.pdf",
                        "text": "Standard refund and cancellation policy: Subscriptions can be cancelled with 30 days written notice before the annual renewal date. Unused months for annual prepaid contracts are non-refundable unless a verified breach of the 99.9% uptime SLA occurred.",
                        "page_number": 8,
                        "token_count": 48
                    }
                ]
            },
            {
                "id": "doc-3",
                "name": "Client Onboarding & KYC Checklist.docx",
                "category": "Operations",
                "file_type": "DOCX",
                "uploaded_by": "Admin",
                "upload_date": "16 Aug 2026",
                "chunks_count": 64,
                "status": "Indexed ✓",
                "file_size": "950 KB",
                "content_summary": "Mandatory Indian KYC documentation: GSTIN Certificate, PAN Card, Registered Address proof, and Authorized Signatory Letter.",
                "chunks": [
                    {
                        "chunk_id": "chunk-301",
                        "document_id": "doc-3",
                        "document_name": "Client Onboarding & KYC Checklist.docx",
                        "text": "Mandatory onboarding documents required for all Indian business accounts: 1. Company GSTIN Registration Certificate, 2. Entity PAN Card copy, 3. Authorized signatory Board Resolution or authorization letter, 4. Bank account cancelled cheque for RTGS/NEFT verification.",
                        "page_number": 1,
                        "token_count": 46
                    }
                ]
            },
            {
                "id": "doc-4",
                "name": "Product Catalog & Feature Matrix 2026.pdf",
                "category": "Sales",
                "file_type": "PDF",
                "uploaded_by": "Amit Sharma",
                "upload_date": "17 Aug 2026",
                "chunks_count": 184,
                "status": "Indexed ✓",
                "file_size": "4.1 MB",
                "content_summary": "Detailed feature comparison between Starter, Growth, Enterprise, and Sovereign Cloud tiers.",
                "chunks": [
                    {
                        "chunk_id": "chunk-401",
                        "document_id": "doc-4",
                        "document_name": "Product Catalog & Feature Matrix 2026.pdf",
                        "text": "Nexora Enterprise Tier includes unlimited AI Knowledge Assistant queries, custom RAG document vector stores, dedicated Indian cloud VPC hosting, automated GST invoice reconciliation, and WhatsApp Business CRM connector.",
                        "page_number": 3,
                        "token_count": 41
                    }
                ]
            }
        ]

        # 10. Notifications
        self.notifications = [
            {
                "id": "notif-1",
                "title": "High-Value Lead Action",
                "message": "Rahul Sharma (TechNova Solutions) visited the pricing portal and opened proposal for the 4th time.",
                "type": "alert",
                "timestamp": "10 mins ago",
                "is_read": False,
                "action_link": "/leads",
                "action_label": "View Lead"
            },
            {
                "id": "notif-2",
                "title": "Deal Risk Alert",
                "message": "Deal probability for FinEdge Systems decreased from 78% to 65% due to pending committee review.",
                "type": "warning",
                "timestamp": "1 hour ago",
                "is_read": False,
                "action_link": "/deals",
                "action_label": "Review Deal"
            },
            {
                "id": "notif-3",
                "title": "Task Overdue Notice",
                "message": "Task 'Follow up with TechNova Solutions' (MDS-39) due today for Amit Sharma.",
                "type": "warning",
                "timestamp": "2 hours ago",
                "is_read": False,
                "action_link": "/tasks",
                "action_label": "Open Task"
            },
            {
                "id": "notif-4",
                "title": "Customer Churn Risk Detected",
                "message": "Global Solutions Ltd health score dropped to 42/100 (81% churn probability).",
                "type": "alert",
                "timestamp": "4 hours ago",
                "is_read": True,
                "action_link": "/companies",
                "action_label": "View Company"
            },
            {
                "id": "notif-5",
                "title": "Document Indexed",
                "message": "Product Catalog & Feature Matrix 2026.pdf was successfully vectorized (184 chunks).",
                "type": "success",
                "timestamp": "Yesterday",
                "is_read": True,
                "action_link": "/knowledge",
                "action_label": "Inspect Knowledge"
            }
        ]

        # 11. Audit Logs
        self.audit_logs = [
            {
                "id": "log-1",
                "timestamp": "17 Aug 2026 16:45 IST",
                "user_name": "Amit Sharma",
                "user_role": "SALES_EXECUTIVE",
                "action": "Updated Deal Stage",
                "entity": "TechNova Solutions - Enterprise CRM",
                "details": "Moved deal from Proposal Sent to Negotiation (Value: ₹4,50,000)"
            },
            {
                "id": "log-2",
                "timestamp": "17 Aug 2026 15:30 IST",
                "user_name": "Admin (Kabir Mehta)",
                "user_role": "ADMIN",
                "action": "Uploaded Document",
                "entity": "Product Catalog & Feature Matrix 2026.pdf",
                "details": "Vectorized 184 chunks into RAG Knowledge Base"
            },
            {
                "id": "log-3",
                "timestamp": "17 Aug 2026 14:15 IST",
                "user_name": "Priya Patil",
                "user_role": "SALES_MANAGER",
                "action": "Created Task",
                "entity": "MDS-2: Finalize FinEdge sales deck",
                "details": "Assigned to Priya Patil with priority Low, due 19 Aug 2026"
            },
            {
                "id": "log-4",
                "timestamp": "17 Aug 2026 12:42 IST",
                "user_name": "Rohan Joshi",
                "user_role": "SALES_EXECUTIVE",
                "action": "Created Lead",
                "entity": "Suresh Iyer (Apex Medicare Solutions)",
                "details": "Lead source: Google Ads, Value: ₹2,90,000"
            },
            {
                "id": "log-5",
                "timestamp": "16 Aug 2026 17:10 IST",
                "user_name": "Sneha Kulkarni",
                "user_role": "SUPPORT_AGENT",
                "action": "Logged Activity",
                "entity": "GreenGrid Energy",
                "details": "GSTIN verification completed on GST Portal"
            }
        ]

        # 12. Settings
        self.settings = {
            "company_name": "Nexora Technologies India Pvt Ltd",
            "tagline": "AI-Powered Enterprise CRM for Indian Businesses",
            "gstin": "27AAACN8899K1Z4",
            "pan": "AAACN8899K",
            "address": "Floor 9, Tower B, Prestige Tech Park, Marathahalli",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560103",
            "currency": "INR",
            "currency_symbol": "₹",
            "fiscal_year_start": "April",
            "timezone": "Asia/Kolkata",
            "ai_model": "Nexora Enterprise RAG Engine v2.4",
            "vector_search_top_k": 4,
            "theme": "light",
            "enable_slack_webhook": True,
            "enable_whatsapp_crm": True
        }

    # CRUD helpers
    def add_audit_log(self, user_name: str, user_role: str, action: str, entity: str, details: str):
        now_str = datetime.now().strftime("%d %b %Y %H:%M IST")
        new_log = {
            "id": f"log-{len(self.audit_logs) + 1}",
            "timestamp": now_str,
            "user_name": user_name,
            "user_role": user_role,
            "action": action,
            "entity": entity,
            "details": details
        }
        self.audit_logs.insert(0, new_log)
        return new_log

    def add_notification(self, title: str, message: str, type_: str = "info", action_link: str = None, action_label: str = None):
        new_notif = {
            "id": f"notif-{len(self.notifications) + 1}",
            "title": title,
            "message": message,
            "type": type_,
            "timestamp": "Just now",
            "is_read": False,
            "action_link": action_link,
            "action_label": action_label
        }
        self.notifications.insert(0, new_notif)
        return new_notif

# Global singleton
db = CRMDatabase()
