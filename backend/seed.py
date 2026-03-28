"""
Seed script – run once to populate the SQLite database.
Usage:  python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, SessionLocal, Base
import models
from datetime import datetime, timedelta
import random

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ---- Clear existing data ----
    print("Cleaning old data...")
    db.query(models.AuditLog).delete()
    db.query(models.Clarification).delete()
    db.query(models.Notification).delete()
    db.query(models.Setting).delete()
    db.query(models.Bid).delete()
    db.query(models.Transaction).delete()
    db.query(models.Subscription).delete()
    db.query(models.Tender).delete()
    db.query(models.Hospital).delete()
    db.query(models.User).delete()
    db.query(models.Plan).delete()
    db.query(models.Organization).delete()
    db.commit()

    # ---- Organization ----
    print("Seeding Organizations...")
    demo_org = models.Organization(
        slug="demo-hospital-group",
        display_name="HealthTender Pro Demo Hospital Group",
        is_active=True
    )
    db.add(demo_org)
    db.flush() # Get ID without commit
    org_id = demo_org.id

    # ---- Users ----
    # from auth_utils import get_password_hash # Potential source of error
    print("Seeding Users...")
    # Pre-hashed 'password123' to avoid bcrypt runtime issues during seeding
    dummy_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGGa81WG"
    users_data = [
        {"email": "admin@hospital.com", "full_name": "Hospital Admin", "role": "admin"},
        {"email": "officer@hospital.com", "full_name": "Procurement Officer", "role": "officer"},
        {"email": "finance@hospital.com", "full_name": "Finance Head", "role": "finance"},
        {"email": "vendor@medisync.com", "full_name": "MediSync Sales", "role": "vendor"},
        {"email": "vendor@careplus.com", "full_name": "CarePlus Manager", "role": "vendor"},
    ]

    all_users = []
    for u in users_data:
        db_user = models.User(
            email=u["email"],
            full_name=u["full_name"],
            role=u["role"],
            organization_id=org_id,
            hashed_password=dummy_hash,
            is_active=True
        )
        db.add(db_user)
        all_users.append(db_user)
    db.flush()

    admin_user = all_users[0]
    vendor_user = all_users[3]

    # ---- Hospitals ----
    print("Seeding Hospitals...")
    hospitals_data = [
        {"name": "AIIMS Delhi", "location": "New Delhi", "type": "Government"},
        {"name": "Apollo Hospital", "location": "Mumbai", "type": "Private"},
        {"name": "Tata Memorial Centre", "location": "Mumbai", "type": "Trust"},
        {"name": "Fortis Healthcare", "location": "Bengaluru", "type": "Private"},
        {"name": "Safdarjung Hospital", "location": "New Delhi", "type": "Government"},
    ]
    hospitals = []
    for h in hospitals_data:
        obj = models.Hospital(**h, organization_id=org_id)
        db.add(obj)
        hospitals.append(obj)
    db.flush()

    # ---- Tenders ----
    print("Seeding Tenders...")
    categories = ["Equipment", "Drugs", "Services", "IT", "Infrastructure"]
    statuses = ["open", "open", "open", "closed", "awarded"]
    tender_titles = [
        "MRI Machine Procurement", "ICU Ventilators Supply", "Surgical Gloves (Annual)",
        "EHR Software Implementation", "Hospital Network Upgrade", "Disposable Syringes Bulk",
        "CT Scan Machine", "Patient Monitoring Systems", "Laparoscopy Equipment",
        "Radiology Information System", "Dialysis Machines", "Antibiotic Drug Supply",
        "CSSD Sterilization Equipment", "Audio Visual Nurse Call System", "Ambulance Fleet",
        "Advanced Lab Analyzer", "Blood Bank Refrigeration", "X-Ray Digital Upgrade",
        "Hospital Furniture Procurement", "CCTV Security System",
    ]

    tenders = []
    for i, title in enumerate(tender_titles):
        h = random.choice(hospitals)
        t = models.Tender(
            organization_id=org_id,
            hospital_id=h.id,
            title=title,
            category=random.choice(categories),
            budget=random.randint(50000, 5000000),
            status=random.choice(statuses),
            deadline=datetime.now() + timedelta(days=random.randint(7, 60)),
            description=f"Automated tender for {title} requirements."
        )
        db.add(t)
        tenders.append(t)
    db.flush()

    # ---- Bids ----
    print("Seeding Bids...")
    for t in tenders:
        if t.status in ["closed", "awarded", "open"]:
            num_bids = random.randint(1, 5)
            for _ in range(num_bids):
                b_amount = t.budget * random.uniform(0.7, 1.1)
                bid = models.Bid(
                    tender_id=t.id,
                    user_id=all_users[3].id, # Link to vendor user
                    vendor_name=random.choice(["MediSync", "CarePlus", "GlobalHealth", "PharmaLine"]),
                    amount=b_amount,
                    notes="Competitive pricing according to specs.",
                    won=(t.status == "awarded" and random.random() > 0.8)
                )
                db.add(bid)
    db.flush()

    # ---- Audit Logs & Notifications ----
    log_action(db, "Login", "users", all_users[0].id, all_users[0].id, org_id=org_id, details="Admin logged in from 192.168.1.1")
    create_notification(db, all_users[0].id, "Welcome", "Welcome to HealthTender Pro!", org_id=org_id)

    # ---- Settings ----
    print("Seeding Settings...")
    settings_data = [
        {"key": "app_name", "value": "HealthTender Pro", "group": "branding"},
        {"key": "accent_color", "value": "#2563eb", "group": "branding"},
        {"key": "bid_fee", "value": "5000", "group": "finance"},
    ]
    for s in settings_data:
        db.add(models.Setting(**s, organization_id=org_id))
    db.flush()

    # ---- Seed Plans ----
    print("Seeding Plans...")
    plans_data = [
        {"name": "Free", "price": 0.0, "features": '["3 Tenders/mo", "Basic Analytics"]'},
        {"name": "Pro", "price": 4999.0, "features": '["Unlimited Tenders", "AI Prediction", "Advanced Analytics"]', "stripe_plan_id": "price_pro"},
        {"name": "Enterprise", "price": 14999.0, "features": '["Custom Workflows", "Dedicated Support", "API Access"]', "stripe_plan_id": "price_ent"},
    ]
    plans = []
    for p_data in plans_data:
        plan = models.Plan(**p_data)
        db.add(plan)
        plans.append(plan)
    db.flush()

    # ---- Seed Initial Subscription ----
    print("Seeding Subscriptions...")
    pro_plan = [p for p in plans if p.name == "Pro"][0]
    sub = models.Subscription(
        organization_id=org_id,
        plan_id=pro_plan.id,
        status="active",
        current_period_end=datetime.utcnow() + timedelta(days=30)
    )
    db.add(sub)
    
    db.commit()
    print("Database seeded successfully with Multi-Tenancy & Billing data!")
    bid_count = db.query(models.Bid).count()
    print(f"   Organizations: 1")
    print(f"   Hospitals    : {len(hospitals)}")
    print(f"   Tenders      : {len(tenders)}")
    print(f"   Bids         : {bid_count}")
    print(f"   Logs         : {db.query(models.AuditLog).count()}")
    db.close()

def log_action(db, action, table_name, record_id, user_id, org_id, details):
    log = models.AuditLog(organization_id=org_id, user_id=user_id, action=action, table_name=table_name, record_id=record_id, details=details)
    db.add(log)

def create_notification(db, user_id, title, message, org_id):
    notif = models.Notification(user_id=user_id, organization_id=org_id, title=title, message=message)
    db.add(notif)

if __name__ == "__main__":
    main()
