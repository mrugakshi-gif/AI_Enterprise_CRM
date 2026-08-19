import json
import os
import random
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

class CRMDatabase:
    def __init__(self):
        self.users: List[Dict[str, Any]] = []
        self.teams: List[Dict[str, Any]] = []
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
        # 1. 20 Enterprise Users across 5 Roles
        user_profiles = [
            ("usr-1", "Kabir Mehta", "kabir.mehta@nexoracrm.in", "SUPER_ADMIN", "Executive Leadership", "Executive Leadership", "+91 98200 11221", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"),
            ("usr-2", "Priya Patil", "priya.patil@nexoracrm.in", "SALES_MANAGER", "Sales", "Enterprise Sales", "+91 98201 22332", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"),
            ("usr-3", "Amit Sharma", "amit.sharma@nexoracrm.in", "SALES_EXECUTIVE", "Sales", "Enterprise Sales", "+91 98202 33443", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"),
            ("usr-4", "Sneha Kulkarni", "sneha.k@nexoracrm.in", "SUPPORT_AGENT", "Customer Success", "Customer Success", "+91 98203 44554", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"),
            ("usr-5", "Rohan Joshi", "rohan.joshi@nexoracrm.in", "SALES_EXECUTIVE", "Sales", "Mid-Market Sales", "+91 98204 55665", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"),
            ("usr-6", "Ananya Deshmukh", "ananya.d@nexoracrm.in", "SALES_MANAGER", "Sales", "Mid-Market Sales", "+91 98205 66776", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"),
            ("usr-7", "Vikram Malhotra", "vikram.m@nexoracrm.in", "SALES_EXECUTIVE", "Sales", "Enterprise Sales", "+91 98206 77887", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"),
            ("usr-8", "Neha Singhania", "neha.s@nexoracrm.in", "SALES_EXECUTIVE", "Sales", "Mid-Market Sales", "+91 98207 88998", "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80"),
            ("usr-9", "Rajesh Nambiar", "rajesh.n@nexoracrm.in", "SALES_EXECUTIVE", "Sales", "Solutions Engineering", "+91 98208 99009", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"),
            ("usr-10", "Pooja Hegde", "pooja.h@nexoracrm.in", "SUPPORT_AGENT", "Customer Success", "Customer Success", "+91 98209 10111", "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80"),
            ("usr-11", "Karthik Raja", "karthik.r@nexoracrm.in", "SALES_EXECUTIVE", "Sales", "Mid-Market Sales", "+91 98210 21222", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"),
            ("usr-12", "Meera Iyer", "meera.i@nexoracrm.in", "SALES_EXECUTIVE", "Sales", "Enterprise Sales", "+91 98211 32333", "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80"),
            ("usr-13", "Arjun Reddy", "arjun.r@nexoracrm.in", "SALES_EXECUTIVE", "Sales", "Solutions Engineering", "+91 98212 43444", "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"),
            ("usr-14", "Divya Menon", "divya.m@nexoracrm.in", "SUPPORT_AGENT", "Customer Success", "Customer Success", "+91 98213 54555", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"),
            ("usr-15", "Siddharth Rao", "siddharth.r@nexoracrm.in", "SALES_EXECUTIVE", "Sales", "Enterprise Sales", "+91 98214 65666", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"),
            ("usr-16", "Tanvi Shah", "tanvi.s@nexoracrm.in", "SALES_EXECUTIVE", "Sales", "Mid-Market Sales", "+91 98215 76777", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"),
            ("usr-17", "Gaurav Sen", "gaurav.s@nexoracrm.in", "SALES_EXECUTIVE", "Sales", "Solutions Engineering", "+91 98216 87888", "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80"),
            ("usr-18", "Shreya Sen", "shreya.s@nexoracrm.in", "SUPPORT_AGENT", "Customer Success", "Customer Success", "+91 98217 98999", "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80"),
            ("usr-19", "Aditya Verma", "aditya.v@nexoracrm.in", "ADMIN", "IT & Security", "Executive Leadership", "+91 98218 09110", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"),
            ("usr-20", "Rhea Kapoor", "rhea.k@nexoracrm.in", "VIEWER", "Auditing & Compliance", "Executive Leadership", "+91 98219 19221", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"),
        ]

        self.users = [
            {
                "id": u[0],
                "name": u[1],
                "email": u[2],
                "role": u[3],
                "department": u[4],
                "team": u[5],
                "phone": u[6],
                "avatar": u[7],
                "status": "Active",
                "last_active": "Online now" if i < 4 else f"{i*3} mins ago"
            }
            for i, u in enumerate(user_profiles)
        ]

        # 2. 5 Teams
        self.teams = [
            {"id": "team-1", "name": "Executive Leadership", "manager": "Kabir Mehta", "members_count": 3, "department": "Management"},
            {"id": "team-2", "name": "Enterprise Sales", "manager": "Priya Patil", "members_count": 5, "department": "Sales"},
            {"id": "team-3", "name": "Mid-Market Sales", "manager": "Ananya Deshmukh", "members_count": 5, "department": "Sales"},
            {"id": "team-4", "name": "Solutions Engineering", "manager": "Priya Patil", "members_count": 3, "department": "Technical Sales"},
            {"id": "team-5", "name": "Customer Success", "manager": "Sneha Kulkarni", "members_count": 4, "department": "Customer Support"}
        ]

        # 3. 50 Realistic Enterprise Companies (Indian & Global)
        company_specs = [
            ("comp-1", "TechNova Solutions", "IT Services", "Mumbai", "Maharashtra", "27ABCDE1234F1Z5", "ABCDE1234F", "150-300", 1840000.0, "Customer", 82, "Low", 14, "Renewal discussion should begin within the next 14 days.", "Amit Sharma", "https://technovasolutions.in"),
            ("comp-2", "FinEdge Systems", "FinTech", "Pune", "Maharashtra", "27FGHIJ5678K2Z6", "FGHIJ5678K", "50-150", 1250000.0, "Customer", 90, "Low", 8, "Upsell opportunity for AI Compliance Module in Q3.", "Priya Patil", "https://finedgesystems.com"),
            ("comp-3", "Bharat Logistics Corp", "Logistics", "Delhi", "Delhi NCR", "07KLMNO9012P3Z7", "KLMNO9012P", "500-1000", 2400000.0, "Customer", 74, "Medium", 28, "Fleet tracking module utilization down 12%. Schedule review.", "Amit Sharma", "https://bharatlogistics.in"),
            ("comp-4", "GreenGrid CleanTech", "Renewable Energy", "Bengaluru", "Karnataka", "29PQRST3456U4Z8", "PQRST3456U", "200-500", 950000.0, "Customer", 88, "Low", 10, "Strong adoption across solar farm installations.", "Rohan Joshi", "https://greengridenergy.in"),
            ("comp-5", "Apex Medicare Solutions", "Healthcare", "Chennai", "Tamil Nadu", "33UVWXY7890Z5Z9", "UVWXY7890Z", "100-250", 850000.0, "Prospect", 65, "Medium", 35, "NABH hospital compliance pilot under evaluation.", "Vikram Malhotra", "https://apexmedicare.in"),
            ("comp-6", "EduSphere Technologies", "EdTech", "Hyderabad", "Telangana", "36ABCDE2345F6Z1", "ABCDE2345F", "50-200", 620000.0, "Prospect", 58, "Medium", 42, "Admissions CRM module evaluation active.", "Neha Singhania", "https://edusphere.co.in"),
            ("comp-7", "CloudMatrix India", "Cloud Computing", "Bengaluru", "Karnataka", "29GHIJK6789L7Z2", "GHIJK6789L", "100-300", 1450000.0, "Customer", 94, "Low", 5, "Key reference customer for multi-cloud deployments.", "Amit Sharma", "https://cloudmatrix.in"),
            ("comp-8", "Maharashtra Digital Works", "Media & Advertising", "Mumbai", "Maharashtra", "27MNOPQ0123R8Z3", "MNOPQ0123R", "20-50", 420000.0, "Customer", 70, "Medium", 30, "Campaign tracking module onboarding in progress.", "Rohan Joshi", "https://mhdigitalworks.com"),
            ("comp-9", "Infosys Cloud Labs", "IT Services", "Bengaluru", "Karnataka", "29AAACI1234K1Z1", "AAACI1234K", "1000+", 4800000.0, "Customer", 96, "Low", 4, "Enterprise expansion contract signed.", "Priya Patil", "https://infosys.com"),
            ("comp-10", "Reliance Retail Digital", "Retail", "Mumbai", "Maharashtra", "27AAACR4321J2Z2", "AAACR4321J", "1000+", 6200000.0, "Customer", 92, "Low", 6, "Omnichannel store integration completed.", "Amit Sharma", "https://relianceretail.com"),
            ("comp-11", "Tata Tech Innovations", "Manufacturing", "Pune", "Maharashtra", "27AAACT8877L3Z3", "AAACT8877L", "1000+", 5400000.0, "Customer", 89, "Low", 9, "PLM pipeline synced across 4 manufacturing units.", "Vikram Malhotra", "https://tatatechnologies.com"),
            ("comp-12", "HDFC FinTech Solutions", "Banking & Finance", "Mumbai", "Maharashtra", "27AAACH9988M4Z4", "AAACH9988M", "1000+", 7800000.0, "Customer", 95, "Low", 5, "Core loan origination CRM workflow live.", "Priya Patil", "https://hdfcbank.com"),
            ("comp-13", "Zomato Logistics Hub", "Food & Logistics", "Gurugram", "Haryana", "06AAACZ1122N5Z5", "AAACZ1122N", "500-1000", 3100000.0, "Customer", 78, "Low", 15, "Merchant onboarding SLA tracker active.", "Rohan Joshi", "https://zomato.com"),
            ("comp-14", "Swiggy Instamart Infra", "E-Commerce", "Bengaluru", "Karnataka", "29AAACS3344P6Z6", "AAACS3344P", "500-1000", 3400000.0, "Customer", 84, "Low", 11, "Dark-store supplier management live.", "Amit Sharma", "https://swiggy.com"),
            ("comp-15", "Mahindra AutoTech", "Automotive", "Chennai", "Tamil Nadu", "33AAACM5566Q7Z7", "AAACM5566Q", "1000+", 4200000.0, "Customer", 87, "Low", 12, "Dealer network management platform active.", "Vikram Malhotra", "https://mahindra.com"),
            ("comp-16", "Zerodha Capital Labs", "FinTech", "Bengaluru", "Karnataka", "29AAACZ7788R8Z8", "AAACZ7788R", "200-500", 2900000.0, "Customer", 98, "Low", 3, "High volume API integration active.", "Amit Sharma", "https://zerodha.com"),
            ("comp-17", "Nykaa Brands Retail", "E-Commerce", "Mumbai", "Maharashtra", "27AAACN9900S9Z9", "AAACN9900S", "500-1000", 2600000.0, "Customer", 83, "Low", 14, "Influencer marketing CRM module rollout.", "Neha Singhania", "https://nykaa.com"),
            ("comp-18", "Freshworks India Partner", "SaaS", "Chennai", "Tamil Nadu", "33AAACF1234T1Z0", "AAACF1234T", "200-500", 1950000.0, "Customer", 91, "Low", 7, "Channel partner management active.", "Priya Patil", "https://freshworks.com"),
            ("comp-19", "Zoho Enterprise Cloud", "SaaS", "Chennai", "Tamil Nadu", "33AAACZ2345U2Z1", "AAACZ2345U", "1000+", 3800000.0, "Customer", 93, "Low", 6, "Co-marketing pipeline active.", "Amit Sharma", "https://zoho.com"),
            ("comp-20", "Wipro Digital Engineering", "IT Services", "Bengaluru", "Karnataka", "29AAACW3456V3Z2", "AAACW3456V", "1000+", 5100000.0, "Customer", 88, "Low", 10, "Digital transformation consulting active.", "Vikram Malhotra", "https://wipro.com"),
            ("comp-21", "ICICI Securities Direct", "Banking & Finance", "Mumbai", "Maharashtra", "27AAACI4567W4Z3", "AAACI4567W", "1000+", 4700000.0, "Customer", 90, "Low", 8, "Wealth management lead workflow active.", "Priya Patil", "https://icicisecurities.com"),
            ("comp-22", "Delhivery Express Network", "Logistics", "Gurugram", "Haryana", "06AAACD5678X5Z4", "AAACD5678X", "1000+", 3900000.0, "Customer", 79, "Medium", 22, "Last-mile courier partner tracking.", "Rohan Joshi", "https://delhivery.com"),
            ("comp-23", "RazorpayX Corporate Pay", "FinTech", "Bengaluru", "Karnataka", "29AAACR6789Y6Z5", "AAACR6789Y", "200-500", 3300000.0, "Customer", 95, "Low", 4, "Automated payroll & vendor payout sync.", "Amit Sharma", "https://razorpay.com"),
            ("comp-24", "Paytm Merchant Solutions", "FinTech", "Noida", "Uttar Pradesh", "09AAACP7890Z7Z6", "AAACP7890Z", "1000+", 2800000.0, "Customer", 71, "Medium", 32, "QR soundbox merchant lifecycle.", "Neha Singhania", "https://paytm.com"),
            ("comp-25", "Larsen & Toubro InfraTech", "Engineering & Infra", "Mumbai", "Maharashtra", "27AAACL8901A8Z7", "AAACL8901A", "1000+", 6800000.0, "Customer", 94, "Low", 5, "Smart city project bid tracking.", "Vikram Malhotra", "https://larsentoubro.com"),
            ("comp-26", "Airtel Business Enterprise", "Telecom", "Gurugram", "Haryana", "06AAACA9012B9Z8", "AAACA9012B", "1000+", 5900000.0, "Customer", 89, "Low", 9, "Dedicated leased-line account tracker.", "Priya Patil", "https://airtel.in/business"),
            ("comp-27", "Jio Platforms Cloud", "Telecom & Tech", "Navi Mumbai", "Maharashtra", "27AAACJ0123C0Z9", "AAACJ0123C", "1000+", 7100000.0, "Customer", 97, "Low", 3, "JioCloud enterprise pilot.", "Amit Sharma", "https://jio.com"),
            ("comp-28", "Sun Pharma Life Sciences", "Pharma & Healthcare", "Mumbai", "Maharashtra", "27AAACS1234D1Z0", "AAACS1234D", "1000+", 4600000.0, "Customer", 86, "Low", 11, "MR field sales compliance.", "Meera Iyer", "https://sunpharma.com"),
            ("comp-29", "Dr Reddys Labs Biotech", "Pharma & Healthcare", "Hyderabad", "Telangana", "36AAACD2345E2Z1", "AAACD2345E", "1000+", 4100000.0, "Customer", 85, "Low", 13, "Clinical trial physician engagement.", "Rajesh Nambiar", "https://drreddys.com"),
            ("comp-30", "Cipla Respiratory Health", "Pharma & Healthcare", "Mumbai", "Maharashtra", "27AAACC3456F3Z2", "AAACC3456F", "1000+", 3700000.0, "Customer", 88, "Low", 10, "Pulmonary clinic outreach CRM.", "Meera Iyer", "https://cipla.com"),
            ("comp-31", "Titan Company Luxury", "Retail", "Bengaluru", "Karnataka", "29AAACT4567G4Z3", "AAACT4567G", "1000+", 3500000.0, "Customer", 92, "Low", 7, "Tanishq VIP customer engagement.", "Tanvi Shah", "https://titancompany.in"),
            ("comp-32", "Asian Paints Home Solutions", "Manufacturing", "Mumbai", "Maharashtra", "27AAACA5678H5Z4", "AAACA5678H", "1000+", 4900000.0, "Customer", 90, "Low", 8, "Color idea store customer leads.", "Vikram Malhotra", "https://asianpaints.com"),
            ("comp-33", "Havells Electricals India", "Manufacturing", "Noida", "Uttar Pradesh", "09AAACH6789I6Z5", "AAACH6789I", "500-1000", 2200000.0, "Customer", 82, "Low", 16, "Industrial contractor loyalty portal.", "Neha Singhania", "https://havells.com"),
            ("comp-34", "Voltas HVAC Systems", "Manufacturing", "Mumbai", "Maharashtra", "27AAACV7890J7Z6", "AAACV7890J", "500-1000", 1900000.0, "Customer", 76, "Medium", 25, "Commercial chiller maintenance AMC.", "Rohan Joshi", "https://voltas.com"),
            ("comp-35", "Blue Star Cold Chain", "Manufacturing", "Mumbai", "Maharashtra", "27AAACB8901K8Z7", "AAACB8901K", "500-1000", 1750000.0, "Customer", 81, "Low", 15, "Pharma cold room pipeline.", "Karthik Raja", "https://bluestarindia.com"),
            ("comp-36", "Godrej Properties Realty", "Real Estate", "Mumbai", "Maharashtra", "27AAACG9012L9Z8", "AAACG9012L", "500-1000", 3900000.0, "Customer", 84, "Low", 12, "Luxury residential lead nurturing.", "Amit Sharma", "https://godrejproperties.com"),
            ("comp-37", "DLF Luxury Estates", "Real Estate", "Gurugram", "Haryana", "06AAACD0123M0Z9", "AAACD0123M", "500-1000", 4100000.0, "Customer", 87, "Low", 11, "Golf Links residency buyer lifecycle.", "Priya Patil", "https://dlf.in"),
            ("comp-38", "Prestige Estates Projects", "Real Estate", "Bengaluru", "Karnataka", "29AAACP1234N1Z0", "AAACP1234N", "500-1000", 3600000.0, "Customer", 85, "Low", 13, "Tech park commercial lease CRM.", "Vikram Malhotra", "https://prestigeconstructions.com"),
            ("comp-39", "Brigade Enterprises Infra", "Real Estate", "Bengaluru", "Karnataka", "29AAACB2345O2Z1", "AAACB2345O", "200-500", 2100000.0, "Customer", 79, "Medium", 21, "Mall tenant lease pipeline.", "Neha Singhania", "https://brigadegroup.com"),
            ("comp-40", "Sobha Developers India", "Real Estate", "Bengaluru", "Karnataka", "29AAACS3456P3Z2", "AAACS3456P", "200-500", 1950000.0, "Customer", 83, "Low", 14, "Premium villa booking workflows.", "Rohan Joshi", "https://sobha.com"),
            ("comp-41", "Tata Power Solar Systems", "Renewable Energy", "Mumbai", "Maharashtra", "27AAACT4567Q4Z3", "AAACT4567Q", "1000+", 5200000.0, "Customer", 93, "Low", 6, "Rooftop solar subsidy lead engine.", "Amit Sharma", "https://tatapower.com"),
            ("comp-42", "Adani Green Energy", "Renewable Energy", "Ahmedabad", "Gujarat", "24AAACA5678R5Z4", "AAACA5678R", "1000+", 6100000.0, "Customer", 95, "Low", 4, "Wind-solar hybrid project pipeline.", "Priya Patil", "https://adanigreenenergy.com"),
            ("comp-43", "Suzlon Energy Turbines", "Renewable Energy", "Pune", "Maharashtra", "27AAACS6789S6Z5", "AAACS6789S", "500-1000", 2700000.0, "Customer", 73, "Medium", 29, "Wind farm turbine service AMC.", "Vikram Malhotra", "https://suzlon.com"),
            ("comp-44", "Ola Electric Mobility", "EV & Mobility", "Bengaluru", "Karnataka", "29AAACO7890T7Z6", "AAACO7890T", "500-1000", 3200000.0, "Customer", 80, "Low", 18, "Hypercharger network deployment.", "Rohan Joshi", "https://olaelectric.com"),
            ("comp-45", "Ather Energy Smart EV", "EV & Mobility", "Bengaluru", "Karnataka", "29AAACA8901U8Z7", "AAACA8901U", "200-500", 2500000.0, "Customer", 88, "Low", 10, "Grid charging station expansion.", "Neha Singhania", "https://atherenergy.com"),
            ("comp-46", "Zepto Fast Logistics", "E-Commerce", "Mumbai", "Maharashtra", "27AAACZ9012V9Z8", "AAACZ9012V", "200-500", 2200000.0, "Customer", 82, "Low", 15, "10-minute grocery hub inventory.", "Amit Sharma", "https://zepto.com"),
            ("comp-47", "Blinkit Quick Commerce", "E-Commerce", "Gurugram", "Haryana", "06AAACB0123W0Z9", "AAACB0123W", "500-1000", 2800000.0, "Customer", 84, "Low", 12, "Local distributor vendor portal.", "Rohan Joshi", "https://blinkit.com"),
            ("comp-48", "Urban Company Home Services", "Consumer Tech", "Gurugram", "Haryana", "06AAACU1234X1Z0", "AAACU1234X", "500-1000", 2400000.0, "Customer", 89, "Low", 9, "Service partner background checks.", "Neha Singhania", "https://urbancompany.com"),
            ("comp-49", "PolicyBazaar FinTech", "FinTech", "Gurugram", "Haryana", "06AAACP2345Y2Z1", "AAACP2345Y", "1000+", 4300000.0, "Customer", 91, "Low", 7, "Health insurance advisory pipeline.", "Priya Patil", "https://policybazaar.com"),
            ("comp-50", "Groww Investment Tech", "FinTech", "Bengaluru", "Karnataka", "29AAACG3456Z3Z2", "AAACG3456Z", "200-500", 3100000.0, "Customer", 94, "Low", 5, "Mutual fund AMC partner onboarding.", "Amit Sharma", "https://groww.in"),
        ]

        self.companies = []
        for spec in company_specs:
            self.companies.append({
                "id": spec[0],
                "name": spec[1],
                "industry": spec[2],
                "city": spec[3],
                "state": spec[4],
                "gstin": spec[5],
                "pan": spec[6],
                "employees": spec[7],
                "total_revenue": spec[8],
                "customer_status": spec[9],
                "customer_health": spec[10],
                "churn_risk": spec[11],
                "churn_probability": spec[12],
                "ai_recommendation": spec[13],
                "account_owner": spec[14],
                "website": spec[15],
                "customer_since": "12 Jan 2025",
                "contacts_count": 5,
                "active_deals_count": 2,
                "contact_ids": [],
                "deal_ids": [],
                "lead_ids": []
            })

        # 4. 250 Contacts (5 per company)
        indian_first_names = ["Rahul", "Ananya", "Rohan", "Pooja", "Vikram", "Sneha", "Amit", "Meera", "Karthik", "Divya", "Suresh", "Tanvi", "Deepak", "Shreya", "Aditya", "Nisha", "Gaurav", "Kavita", "Sanjay", "Ritu", "Alok", "Pallavi", "Naveen", "Swati", "Manoj"]
        indian_last_names = ["Sharma", "Patel", "Verma", "Iyer", "Kulkarni", "Joshi", "Deshmukh", "Nambiar", "Reddy", "Menon", "Malhotra", "Singhania", "Gupta", "Shah", "Sen", "Mehta", "Kapoor", "Bhat", "Chopra", "Chauhan"]
        designations = [
            ("Chief Technology Officer", "IT & Engineering"),
            ("VP of Sales Operations", "Sales"),
            ("Head of Procurement & Vendor Relations", "Procurement"),
            ("Director of Information Security", "IT & Security"),
            ("Chief Financial Officer", "Finance & Accounts")
        ]

        self.contacts = []
        contact_id_counter = 1
        for comp in self.companies:
            comp_contacts = []
            for j in range(5):
                fn = indian_first_names[(contact_id_counter * 3 + j) % len(indian_first_names)]
                ln = indian_last_names[(contact_id_counter * 5 + j) % len(indian_last_names)]
                desig, dept = designations[j % len(designations)]
                cid = f"con-{contact_id_counter}"
                name = f"{fn} {ln}"
                email = f"{fn.lower()}.{ln.lower()}@{comp['name'].lower().replace(' ', '').replace('&', '').replace('-', '')[:14]}.in"
                phone = f"+91 98{contact_id_counter:02d} {10000 + contact_id_counter*17:05d}"
                
                c_item = {
                    "id": cid,
                    "name": name,
                    "company": comp["name"],
                    "company_id": comp["id"],
                    "designation": desig,
                    "department": dept,
                    "email": email,
                    "phone": phone,
                    "city": comp["city"],
                    "state": comp["state"],
                    "status": "Active",
                    "owner": comp["account_owner"],
                    "last_contact": f"{(contact_id_counter % 20) + 1} Aug 2026",
                    "created_at": "15 Jan 2026",
                    "ai_summary": f"Key stakeholder for {dept} at {comp['name']}. Active decision maker for CRM and software procurement.",
                    "avatar": f"https://images.unsplash.com/photo-{1500000000000 + (contact_id_counter * 1234567) % 90000000}?w=150&auto=format&fit=crop&q=80"
                }
                self.contacts.append(c_item)
                comp_contacts.append(cid)
                contact_id_counter += 1
            comp["contact_ids"] = comp_contacts
            comp["contacts_count"] = len(comp_contacts)

        # 5. 100 Deals (2 per company, including exact benchmark TechNova ₹8.4L)
        self.deals = []
        deal_counter = 1
        stages_pool = ["Contacted", "Qualified", "Proposal Sent", "Negotiation", "Deal Closed"]
        
        for comp in self.companies:
            comp_deals = []
            for d_idx in range(2):
                did = f"deal-{deal_counter}"
                
                # EXACT BENCHMARK: TechNova ₹8.4L deal
                if comp["name"] == "TechNova Solutions" and d_idx == 0:
                    d_item = {
                        "id": did,
                        "company_name": "TechNova Solutions",
                        "company_id": comp["id"],
                        "deal_name": "TechNova Solutions - Enterprise AI Suite Upgrade",
                        "description": "Enterprise-wide CRM and AI Knowledge Assistant deployment for 250 sales executives.",
                        "deal_value": 840000.0,
                        "stage": "Negotiation",
                        "expected_close_date": (datetime.now() + timedelta(days=6)).strftime("%d %b %Y"),
                        "owner": "Amit Sharma",
                        "priority": "Urgent",
                        "probability": 72,
                        "risk_score": 72,
                        "days_in_stage": 11,
                        "days_since_last_activity": 18,
                        "win_factors": [
                            "Strong champion in CTO Rahul Sharma",
                            "High engagement with product feature matrix",
                            "Budget allocated for Q3 FY26"
                        ],
                        "risk_factor": "No meaningful interaction for 18 days while in Negotiation",
                        "ai_evidence_reasons": [
                            "No meaningful interaction for 18 days",
                            "Deal has remained in Negotiation for 11 days",
                            "Expected close date is approaching",
                            "No follow-up activity is scheduled"
                        ],
                        "ai_recommendation": "Schedule an account review within 48 hours.",
                        "created_at": "01 Jul 2026",
                        "last_updated": (datetime.now() - timedelta(days=18)).strftime("%d %b %Y"),
                        "contact_name": "Rahul Sharma (CTO)",
                        "contact_id": comp["contact_ids"][0] if comp["contact_ids"] else "con-1"
                    }
                else:
                    stage = stages_pool[(deal_counter * 2 + d_idx) % len(stages_pool)]
                    val = round(float(random.choice([250000, 380000, 450000, 620000, 750000, 920000, 1200000, 1850000, 2400000, 3500000])), 2)
                    prob = 100 if stage == "Deal Closed" else (80 if stage == "Negotiation" else (60 if stage == "Proposal Sent" else (40 if stage == "Qualified" else 25)))
                    risk = 15 if stage == "Deal Closed" else (70 if d_idx == 1 and deal_counter % 3 == 0 else 30)
                    owner = comp["account_owner"]
                    contact_id = comp["contact_ids"][d_idx % len(comp["contact_ids"])] if comp["contact_ids"] else "con-1"
                    contact_obj = next((c for c in self.contacts if c["id"] == contact_id), None)
                    contact_name = f"{contact_obj['name']} ({contact_obj['designation']})" if contact_obj else "Primary Contact"

                    d_item = {
                        "id": did,
                        "company_name": comp["name"],
                        "company_id": comp["id"],
                        "deal_name": f"{comp['name']} - Enterprise CRM & Intelligence Suite",
                        "description": f"Custom deployment of Nexora CRM module for {comp['industry']} operations.",
                        "deal_value": val,
                        "stage": stage,
                        "expected_close_date": (datetime.now() + timedelta(days=random.randint(5, 60))).strftime("%d %b %Y"),
                        "owner": owner,
                        "priority": "Urgent" if val > 1500000 else ("High" if val > 800000 else "Normal"),
                        "probability": prob,
                        "risk_score": risk,
                        "days_in_stage": random.randint(3, 25),
                        "days_since_last_activity": random.randint(1, 14),
                        "win_factors": [
                            "Budget pre-approved by CFO",
                            f"Verified GSTIN {comp['gstin']}",
                            "Positive technical pilot feedback"
                        ],
                        "risk_factor": "Delayed security review response" if risk > 50 else None,
                        "ai_evidence_reasons": [
                            f"Deal active in {stage} for past {random.randint(4, 20)} days",
                            f"Calculated win probability {prob}%",
                            f"Account owner {owner} assigned"
                        ],
                        "ai_recommendation": f"Prepare customized ROI proposal for {comp['name']} procurement board.",
                        "created_at": "10 Jun 2026",
                        "last_updated": (datetime.now() - timedelta(days=random.randint(1, 10))).strftime("%d %b %Y"),
                        "contact_name": contact_name,
                        "contact_id": contact_id
                    }
                self.deals.append(d_item)
                comp_deals.append(did)
                deal_counter += 1
            comp["deal_ids"] = comp_deals
            comp["active_deals_count"] = len([d for d in comp_deals if next((x for x in self.deals if x["id"] == d), {}).get("stage") != "Deal Closed"])

        # 6. 150 Leads (3 per company)
        self.leads = []
        lead_counter = 1
        lead_sources_pool = ["Website Demo", "LinkedIn Inbound", "Direct Referral", "Partner Network", "Google Ads", "Industry Summit 2026"]
        lead_statuses_pool = ["New", "Contacted", "Qualified", "Proposal", "Converted"]

        for comp in self.companies:
            comp_leads = []
            for l_idx in range(3):
                lid = f"lead-{lead_counter}"
                fn = indian_first_names[(lead_counter * 2 + l_idx) % len(indian_first_names)]
                ln = indian_last_names[(lead_counter * 4 + l_idx) % len(indian_last_names)]
                src = lead_sources_pool[(lead_counter + l_idx) % len(lead_sources_pool)]
                status = lead_statuses_pool[(lead_counter * 3 + l_idx) % len(lead_statuses_pool)]
                val = round(float(random.choice([180000, 290000, 420000, 580000, 750000, 980000, 1400000])), 2)
                
                # Deterministic scoring based on real factors
                base_score = 50
                positive_factors = []
                risk_factors = []

                if src in ["Direct Referral", "Website Demo"]:
                    base_score += 20
                    positive_factors.append(f"High-intent inbound source: {src} (+20 pts)")
                else:
                    base_score += 10
                    positive_factors.append(f"Standard marketing channel: {src} (+10 pts)")

                if comp["employees"] in ["500-1000", "1000+"]:
                    base_score += 15
                    positive_factors.append(f"Enterprise account profile: {comp['employees']} employees (+15 pts)")
                else:
                    base_score += 10
                    positive_factors.append(f"Mid-market account fit (+10 pts)")

                if val >= 500000:
                    base_score += 10
                    positive_factors.append(f"High deal value pipeline: ₹{val/100000:.1f}L (+10 pts)")

                if status == "New":
                    base_score -= 10
                    risk_factors.append("Awaiting initial sales discovery call (-10 pts)")
                elif status in ["Qualified", "Proposal", "Converted"]:
                    base_score += 10
                    positive_factors.append(f"Stage progression verified: {status} (+10 pts)")

                score = min(98, max(25, base_score))

                lead_item = {
                    "id": lid,
                    "first_name": fn,
                    "last_name": ln,
                    "email": f"{fn.lower()}.{ln.lower()}@{comp['name'].lower().replace(' ', '').replace('&', '').replace('-', '')[:14]}.in",
                    "phone": f"+91 97{lead_counter:02d} {20000 + lead_counter*13:05d}",
                    "company": comp["name"],
                    "company_id": comp["id"],
                    "job_title": designations[(lead_counter + l_idx) % len(designations)][0],
                    "industry": comp["industry"],
                    "city": comp["city"],
                    "state": comp["state"],
                    "source": src,
                    "status": status,
                    "lead_score": score,
                    "lead_value": val,
                    "assigned_to": comp["account_owner"],
                    "expected_closing": (datetime.now() + timedelta(days=random.randint(10, 45))).strftime("%d %b %Y"),
                    "notes": f"Lead submitted inquiry via {src}. Inquiring for {comp['name']} regional offices.",
                    "created_at": (datetime.now() - timedelta(days=random.randint(2, 60))).strftime("%d %b %Y"),
                    "last_contact": f"{(lead_counter % 15) + 1} Aug 2026",
                    "ai_summary": f"Strong ICP match for {comp['industry']}. Lead score {score}/100 with budget ₹{val/100000:.1f}L.",
                    "ai_reasons": positive_factors,
                    "ai_positive_factors": positive_factors,
                    "ai_risk_factors": risk_factors,
                    "ai_recommended_action": f"Schedule discovery demonstration with {fn} {ln} within 24 hours."
                }
                self.leads.append(lead_item)
                comp_leads.append(lid)
                lead_counter += 1
            comp["lead_ids"] = comp_leads

        # 7. 1,000 Activities across all Accounts, Deals & Leads
        self.activities = []
        activity_types = ["Call", "Email", "Meeting", "Note", "Task", "Follow-up", "Stage Change"]
        activity_counter = 1
        
        # Exact TechNova activity history to match benchmark
        self.activities.append({
            "id": "act-1",
            "type": "Meeting",
            "title": "Executive Proposal Review with Rahul Sharma (CTO)",
            "customer_name": "TechNova Solutions",
            "company_id": "comp-1",
            "deal_id": "deal-1",
            "time": "11:30 AM",
            "date": (datetime.now() - timedelta(days=18)).strftime("%d %b %Y"),
            "performed_by": "Amit Sharma",
            "notes": "Reviewed AI enterprise discount and SOC 2 security compliance. CTO requested final contract sign-off review.",
            "is_key_milestone": True
        })
        self.activities.append({
            "id": "act-2",
            "type": "Stage Change",
            "title": "Moved Deal to Negotiation",
            "customer_name": "TechNova Solutions",
            "company_id": "comp-1",
            "deal_id": "deal-1",
            "time": "03:15 PM",
            "date": (datetime.now() - timedelta(days=11)).strftime("%d %b %Y"),
            "performed_by": "Amit Sharma",
            "notes": "Transitioned to Negotiation stage at ₹8,40,000 deal value with 72% win probability.",
            "is_key_milestone": True
        })
        activity_counter = 3

        # Generate ~1000 activities
        for i in range(activity_counter, 1001):
            comp = self.companies[i % len(self.companies)]
            deal_id = comp["deal_ids"][i % len(comp["deal_ids"])] if comp["deal_ids"] else None
            act_type = activity_types[i % len(activity_types)]
            days_ago = random.randint(0, 90)
            act_date = (datetime.now() - timedelta(days=days_ago)).strftime("%d %b %Y")
            hour = random.randint(9, 18)
            minute = random.choice([0, 15, 30, 45])
            time_str = f"{hour:02d}:{minute:02d} {'AM' if hour < 12 else 'PM'}"
            user_rep = comp["account_owner"]

            notes_templates = {
                "Call": f"Discussed software integration roadmap with {comp['name']} technical leads.",
                "Email": f"Sent revised GST invoice terms & quarterly feature roadmap to {comp['name']}.",
                "Meeting": f"Conducted architecture review call regarding API limits and single sign-on with {comp['name']}.",
                "Note": f"Customer requested documentation on Indian data localization and ISO 27001 audit report.",
                "Task": f"Completed follow-up action on pricing quote submission for {comp['name']}.",
                "Follow-up": f"Scheduled executive check-in with procurement team at {comp['name']}.",
                "Stage Change": f"Updated deal milestone tracking and pipeline probability for {comp['name']}."
            }

            self.activities.append({
                "id": f"act-{i}",
                "type": act_type,
                "title": f"{act_type}: {comp['name']} ({notes_templates[act_type][:32]}...)",
                "customer_name": comp["name"],
                "company_id": comp["id"],
                "deal_id": deal_id,
                "time": time_str,
                "date": act_date,
                "performed_by": user_rep,
                "notes": notes_templates[act_type],
                "is_key_milestone": act_type in ["Meeting", "Stage Change"]
            })

        # 8. 300 Tasks
        self.tasks = []
        task_statuses = ["Backlog", "In progress", "Validation", "Done"]
        task_priorities = ["Urgent", "High", "Normal", "Medium", "Low"]

        # Exact TechNova Task
        self.tasks.append({
            "id": "TSK-101",
            "title": "Conduct Urgent Account Review & Security Briefing",
            "customer_name": "TechNova Solutions",
            "company_id": "comp-1",
            "deal_id": "deal-1",
            "sub_title": "Address 18-day inactivity on ₹8.4L Negotiation opportunity",
            "status": "In progress",
            "priority": "Urgent",
            "due_date": (datetime.now() + timedelta(days=2)).strftime("%d %b %Y"),
            "assigned_to": "Amit Sharma",
            "assigned_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            "comments_count": 3,
            "created_date": (datetime.now() - timedelta(days=1)).strftime("%d %b %Y"),
            "description": "AI recommendation generated to unblock negotiation with Rahul Sharma before expected closing.",
            "is_ai_generated": True
        })

        for t_idx in range(2, 301):
            comp = self.companies[t_idx % len(self.companies)]
            deal_id = comp["deal_ids"][t_idx % len(comp["deal_ids"])] if comp["deal_ids"] else None
            status = task_statuses[t_idx % len(task_statuses)]
            priority = task_priorities[t_idx % len(task_priorities)]
            days_due = random.randint(-5, 20)
            due_date = (datetime.now() + timedelta(days=days_due)).strftime("%d %b %Y")
            owner = comp["account_owner"]

            task_titles = [
                f"Prepare GST Tax Clearance and Invoicing for {comp['name']}",
                f"Send SOC 2 Type II Security Package to {comp['name']}",
                f"Review Enterprise SLA requirements with {comp['name']} CTO",
                f"Configure AI Knowledge Base connector for {comp['name']} product docs",
                f"Follow up on Annual Prepayment Discount approval with {comp['name']}",
                f"Schedule Executive Sponsor Quarterly Review with {comp['name']}"
            ]

            self.tasks.append({
                "id": f"TSK-{100 + t_idx}",
                "title": task_titles[t_idx % len(task_titles)],
                "customer_name": comp["name"],
                "company_id": comp["id"],
                "deal_id": deal_id,
                "sub_title": f"Assigned to {owner} • Priority: {priority}",
                "status": status,
                "priority": priority,
                "due_date": due_date,
                "assigned_to": owner,
                "assigned_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "comments_count": random.randint(0, 5),
                "created_date": (datetime.now() - timedelta(days=random.randint(1, 14))).strftime("%d %b %Y"),
                "description": f"Deliverable for {comp['name']} enterprise CRM rollout and onboarding checklist.",
                "is_ai_generated": t_idx % 5 == 0
            })

        # 9. 200 Calendar Events/Meetings
        self.events = []
        event_types = ["Demo", "Meeting", "Call", "Deadline"]
        for e_idx in range(1, 201):
            comp = self.companies[e_idx % len(self.companies)]
            deal_id = comp["deal_ids"][e_idx % len(comp["deal_ids"])] if comp["deal_ids"] else None
            contact_id = comp["contact_ids"][e_idx % len(comp["contact_ids"])] if comp["contact_ids"] else None
            contact_obj = next((c for c in self.contacts if c["id"] == contact_id), None)
            attendee_name = contact_obj["name"] if contact_obj else "Key Stakeholder"
            
            e_type = event_types[e_idx % len(event_types)]
            days_offset = random.randint(-15, 25)
            e_date = (datetime.now() + timedelta(days=days_offset)).strftime("%Y-%m-%d")
            hour = random.randint(10, 17)
            time_str = f"{hour:02d}:00"

            self.events.append({
                "id": f"evt-{e_idx}",
                "title": f"{e_type}: {comp['name']} ({attendee_name})",
                "event_type": e_type,
                "date": e_date,
                "time": time_str,
                "duration": "45 mins" if e_type == "Demo" else "30 mins",
                "customer_name": comp["name"],
                "company_id": comp["id"],
                "deal_id": deal_id,
                "attendees": [comp["account_owner"], attendee_name, "solutions@nexoracrm.in"],
                "location": "Google Meet" if e_idx % 2 == 0 else f"{comp['city']} Regional Office",
                "description": f"{e_type} session regarding Nexora CRM deployment and Indian enterprise requirements for {comp['name']}.",
                "assigned_to": comp["account_owner"]
            })

        # 10. Real Knowledge Base Documents with Full Policy Chunks
        self.documents = [
            {
                "id": "doc-1",
                "name": "Enterprise Pricing & Discount Policy 2026.pdf",
                "category": "Pricing & Commercials",
                "file_type": "PDF",
                "uploaded_by": "Kabir Mehta (CEO)",
                "upload_date": "10 Jan 2026",
                "file_size": "2.4 MB",
                "status": "Indexed ✓",
                "access_roles": ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER", "SALES_EXECUTIVE", "SUPPORT_AGENT", "VIEWER"],
                "content_summary": "Defines enterprise tiered pricing, maximum discount approval matrix, annual prepayment terms, and GST invoicing.",
                "chunks_count": 4,
                "chunks": [
                    {
                        "chunk_id": "chk-1-1",
                        "document_name": "Enterprise Pricing & Discount Policy 2026.pdf",
                        "page_number": 1,
                        "token_count": 140,
                        "text": "Enterprise Pricing & Discount Policy 2026 - Section 1: Standard SaaS Tiers & Authority Matrix. The maximum enterprise discount allowed without executive board approval is 15% for Sales Representatives, 20% for Sales Managers, and up to 25% with written Executive Committee approval for multi-year enterprise contracts (2+ years commitment)."
                    },
                    {
                        "chunk_id": "chk-1-2",
                        "document_name": "Enterprise Pricing & Discount Policy 2026.pdf",
                        "page_number": 2,
                        "token_count": 135,
                        "text": "Section 2: Discounting Thresholds and Margin Protections. Any discount exceeding 25% is strictly prohibited unless authorized directly by the Chief Executive Officer or Board of Directors. All discounts must maintain a minimum gross software margin of 78%. Bundled professional onboarding services cannot be discounted below cost price."
                    },
                    {
                        "chunk_id": "chk-1-3",
                        "document_name": "Enterprise Pricing & Discount Policy 2026.pdf",
                        "page_number": 3,
                        "token_count": 150,
                        "text": "Section 3: Annual and Multi-Year Prepayment Terms. Clients committing to full annual prepayment receive a standard 10% discount or 2 months free service. For 3-year enterprise contracts with upfront settlement, an aggregate discount of 20% plus dedicated Technical Account Manager (TAM) is pre-authorized."
                    },
                    {
                        "chunk_id": "chk-1-4",
                        "document_name": "Enterprise Pricing & Discount Policy 2026.pdf",
                        "page_number": 4,
                        "token_count": 145,
                        "text": "Section 4: Indian GST & Tax Invoicing Protocols. All pricing quotes and customer contracts are subject to 18% GST (CGST 9% + SGST 9% for intra-state Maharashtra, IGST 18% for inter-state transactions). Tax invoices must be issued within 30 days of service delivery with valid customer GSTIN."
                    }
                ]
            },
            {
                "id": "doc-2",
                "name": "Customer Onboarding & SLA Guidelines.pdf",
                "category": "Customer Success",
                "file_type": "PDF",
                "uploaded_by": "Sneha Kulkarni",
                "upload_date": "14 Jan 2026",
                "file_size": "1.8 MB",
                "status": "Indexed ✓",
                "access_roles": ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER", "SALES_EXECUTIVE", "SUPPORT_AGENT", "VIEWER"],
                "content_summary": "Standard operating procedures for customer onboarding, uptime SLAs (99.9%), ticket resolution tiers, and churn intervention.",
                "chunks_count": 3,
                "chunks": [
                    {
                        "chunk_id": "chk-2-1",
                        "document_name": "Customer Onboarding & SLA Guidelines.pdf",
                        "page_number": 1,
                        "token_count": 130,
                        "text": "Customer Onboarding & SLA Guidelines - Section 1: Guaranteed Uptime & Response Times. Nexora CRM guarantees 99.9% platform availability. Priority 1 (System Down) incidents have a guaranteed initial response time of under 15 minutes and continuous 24x7 resolution engineering."
                    },
                    {
                        "chunk_id": "chk-2-2",
                        "document_name": "Customer Onboarding & SLA Guidelines.pdf",
                        "page_number": 2,
                        "token_count": 140,
                        "text": "Section 2: Implementation Timeline & Data Migration. Enterprise onboarding is structured across 4 phases: Discovery (Days 1-7), Custom Field & GST Mapping (Days 8-14), Legacy CRM Data Migration (Days 15-21), and User Acceptance Testing & Go-Live (Days 22-30)."
                    },
                    {
                        "chunk_id": "chk-2-3",
                        "document_name": "Customer Onboarding & SLA Guidelines.pdf",
                        "page_number": 3,
                        "token_count": 125,
                        "text": "Section 3: Account Health Monitoring and Churn Escalation. Accounts showing fewer than 3 active user logins per week or health scores below 50 are automatically flagged for executive intervention by the Customer Success lead within 48 hours."
                    }
                ]
            },
            {
                "id": "doc-3",
                "name": "Security & Data Compliance Standards.pdf",
                "category": "Compliance & Legal",
                "file_type": "PDF",
                "uploaded_by": "Aditya Verma (IT Security)",
                "upload_date": "20 Jan 2026",
                "file_size": "3.1 MB",
                "status": "Indexed ✓",
                "access_roles": ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER", "SALES_EXECUTIVE", "SUPPORT_AGENT", "VIEWER"],
                "content_summary": "ISO 27001, SOC 2 Type II compliance, Indian Digital Personal Data Protection Act (DPDPA 2023) alignment, and zero-trust access.",
                "chunks_count": 3,
                "chunks": [
                    {
                        "chunk_id": "chk-3-1",
                        "document_name": "Security & Data Compliance Standards.pdf",
                        "page_number": 1,
                        "token_count": 145,
                        "text": "Security & Data Compliance Standards - Section 1: Indian Data Localization & Encryption. All customer CRM data, contact PII, and financial records are hosted within AWS/GCP data centers located in Mumbai and Hyderabad (ap-south-1). Data is encrypted using AES-256 at rest and TLS 1.3 in transit."
                    },
                    {
                        "chunk_id": "chk-3-2",
                        "document_name": "Security & Data Compliance Standards.pdf",
                        "page_number": 2,
                        "token_count": 135,
                        "text": "Section 2: Role-Based Access Control and Prompt Injection Defense. AI and RAG retrieval pipelines treat all uploaded documents and external text as untrusted passive context. System safety boundaries prevent instruction override or arbitrary command execution via vector embeddings."
                    },
                    {
                        "chunk_id": "chk-3-3",
                        "document_name": "Security & Data Compliance Standards.pdf",
                        "page_number": 3,
                        "token_count": 140,
                        "text": "Section 3: DPDPA 2023 Compliance & Consent Management. Customer contacts possess the right to data correction and erasure upon verified request. Audit trails capture all record modifications, export events, and role privilege escalations."
                    }
                ]
            },
            {
                "id": "doc-4",
                "name": "Product Catalog & Feature Matrix 2026.pdf",
                "category": "Product & Engineering",
                "file_type": "PDF",
                "uploaded_by": "Priya Patil",
                "upload_date": "01 Feb 2026",
                "file_size": "2.8 MB",
                "status": "Indexed ✓",
                "access_roles": ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER", "SALES_EXECUTIVE", "SUPPORT_AGENT", "VIEWER"],
                "content_summary": "Comprehensive breakdown of CRM modules including AI Lead Scoring, Customer 360, WhatsApp Business API, and GST Invoicing.",
                "chunks_count": 3,
                "chunks": [
                    {
                        "chunk_id": "chk-4-1",
                        "document_name": "Product Catalog & Feature Matrix 2026.pdf",
                        "page_number": 1,
                        "token_count": 130,
                        "text": "Product Catalog & Feature Matrix - Section 1: AI Lead & Deal Intelligence Engine. Includes automated deterministic lead scoring (0-100), deal risk prediction, sentiment telemetry, and Next Best Action recommendations with 1-click execution."
                    },
                    {
                        "chunk_id": "chk-4-2",
                        "document_name": "Product Catalog & Feature Matrix 2026.pdf",
                        "page_number": 2,
                        "token_count": 135,
                        "text": "Section 2: Omnichannel Indian Communications Suite. Native 2-way integration with WhatsApp Business API, Exotel/Knowlarity cloud telephony, SMS gateways, and Google Workspace / Microsoft 365 calendar synchronization."
                    },
                    {
                        "chunk_id": "chk-4-3",
                        "document_name": "Product Catalog & Feature Matrix 2026.pdf",
                        "page_number": 3,
                        "token_count": 125,
                        "text": "Section 3: Enterprise Integration Connectors. Pre-built real-time sync with TallyPrime, Zoho Books, SAP S/4HANA, RazorpayX, and ClearTax for instant e-invoicing and e-way bill reconciliation."
                    }
                ]
            }
        ]

        # 11. Structured Audit Logs
        self.audit_logs = [
            {
                "id": "log-1",
                "timestamp": (datetime.now() - timedelta(hours=1)).strftime("%d %b %Y %H:%M IST"),
                "user_id": "usr-3",
                "user_name": "Amit Sharma",
                "user_role": "SALES_EXECUTIVE",
                "action": "Updated Deal Stage",
                "entity": "TechNova Solutions - Enterprise AI Suite Upgrade",
                "entity_id": "deal-1",
                "details": "Deal progressed to Negotiation (Value: ₹8,40,000, Probability: 72%)",
                "before_value": "Proposal Sent",
                "after_value": "Negotiation",
                "ip_address": "192.168.1.45",
                "severity": "INFO"
            },
            {
                "id": "log-2",
                "timestamp": (datetime.now() - timedelta(hours=3)).strftime("%d %b %Y %H:%M IST"),
                "user_id": "usr-1",
                "user_name": "Kabir Mehta",
                "user_role": "SUPER_ADMIN",
                "action": "Uploaded Knowledge Document",
                "entity": "Enterprise Pricing & Discount Policy 2026.pdf",
                "entity_id": "doc-1",
                "details": "Vectorized 4 semantic policy chunks with document-level RBAC rules",
                "before_value": None,
                "after_value": "Indexed (4 chunks)",
                "ip_address": "192.168.1.10",
                "severity": "INFO"
            },
            {
                "id": "log-3",
                "timestamp": (datetime.now() - timedelta(hours=6)).strftime("%d %b %Y %H:%M IST"),
                "user_id": "usr-2",
                "user_name": "Priya Patil",
                "user_role": "SALES_MANAGER",
                "action": "Created Task",
                "entity": "TSK-101: Conduct Urgent Account Review & Security Briefing",
                "entity_id": "TSK-101",
                "details": "Assigned urgent account review to Amit Sharma for TechNova Solutions",
                "before_value": None,
                "after_value": "In progress",
                "ip_address": "192.168.1.22",
                "severity": "INFO"
            },
            {
                "id": "log-4",
                "timestamp": (datetime.now() - timedelta(hours=12)).strftime("%d %b %Y %H:%M IST"),
                "user_id": "usr-5",
                "user_name": "Rohan Joshi",
                "user_role": "SALES_EXECUTIVE",
                "action": "Logged Activity",
                "entity": "Bharat Logistics Corp",
                "entity_id": "comp-3",
                "details": "Conducted quarterly fleet tracking module review",
                "before_value": None,
                "after_value": "Activity Logged",
                "ip_address": "192.168.1.33",
                "severity": "INFO"
            },
            {
                "id": "log-5",
                "timestamp": (datetime.now() - timedelta(days=1)).strftime("%d %b %Y %H:%M IST"),
                "user_id": "usr-19",
                "user_name": "Aditya Verma",
                "user_role": "ADMIN",
                "action": "Updated Security Settings",
                "entity": "Access Control System",
                "entity_id": "settings",
                "details": "Enforced strict 6-tier RBAC backend validation and prompt injection filters",
                "before_value": "Standard Auth",
                "after_value": "Enterprise RBAC Enforced",
                "ip_address": "192.168.1.5",
                "severity": "WARNING"
            }
        ]

        # 12. Notifications
        self.notifications = [
            {
                "id": "notif-1",
                "title": "At-Risk Deal Alert: TechNova Solutions",
                "message": "TechNova Solutions ₹8.4L deal has had no interaction for 18 days while in Negotiation. Risk score 72/100.",
                "type": "warning",
                "timestamp": "10 mins ago",
                "is_read": False,
                "action_link": "/deals",
                "action_label": "Review Deal"
            },
            {
                "id": "notif-2",
                "title": "High-Value Lead Qualified: Rahul Sharma",
                "message": "New high-score lead (87/100) from TechNova Solutions ready for demo scheduling.",
                "type": "success",
                "timestamp": "1 hour ago",
                "is_read": False,
                "action_link": "/leads",
                "action_label": "View Lead"
            },
            {
                "id": "notif-3",
                "title": "RAG Knowledge Base Synchronized",
                "message": "4 enterprise policy documents successfully indexed with prompt-injection defense.",
                "type": "info",
                "timestamp": "3 hours ago",
                "is_read": True,
                "action_link": "/knowledge",
                "action_label": "Explore Docs"
            }
        ]

        # 13. System Settings
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
            "ai_model": "Nexora Deterministic Scoring Engine v2.4",
            "embedding_model": "Vector Space Cosine Index (in-memory)",
            "vector_search_top_k": 4,
            "retrieval_threshold": 0.30,
            "theme": "light",
            "enable_slack_webhook": True,
            "enable_whatsapp_crm": True,
            "rbac_mode": "STRICT_BACKEND_ENFORCED"
        }

    # CRUD helpers
    def add_audit_log(self, user_name: str, user_role: str, action: str, entity: str, details: str,
                      entity_id: str = None, before_value: str = None, after_value: str = None,
                      user_id: str = None, ip_address: str = "192.168.1.45", severity: str = "INFO"):
        now_str = datetime.now().strftime("%d %b %Y %H:%M IST")
        new_log = {
            "id": f"log-{len(self.audit_logs) + 1}",
            "timestamp": now_str,
            "user_id": user_id or "usr-1",
            "user_name": user_name,
            "user_role": user_role,
            "action": action,
            "entity": entity,
            "entity_id": entity_id,
            "details": details,
            "before_value": before_value,
            "after_value": after_value,
            "ip_address": ip_address,
            "severity": severity
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
