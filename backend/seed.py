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

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ---- Clear existing data ----
print("Cleaning old data...")
db.query(models.AuditLog).delete()
db.query(models.Bid).delete()
db.query(models.Tender).delete()
db.query(models.Hospital).delete()
db.query(models.User).delete()
db.commit()

# ---- Users ----
from auth_utils import get_password_hash

print("Seeding Users...")
users_data = [
    {"email": "admin@hospital.com", "full_name": "System Admin", "role": "admin", "password": "password123"},
    {"email": "officer@hospital.com", "full_name": "Procurement Officer", "role": "officer", "password": "password123"},
    {"email": "finance@hospital.com", "full_name": "Finance Head", "role": "finance", "password": "password123"},
    {"email": "vendor@medisync.com", "full_name": "MediSync Sales", "role": "vendor", "password": "password123"},
    {"email": "vendor@careplus.com", "full_name": "CarePlus Manager", "role": "vendor", "password": "password123"},
]

all_users = []
for u in users_data:
    db_user = models.User(
        email=u["email"],
        full_name=u["full_name"],
        role=u["role"],
        hashed_password=get_password_hash(u["password"])
    )
    db.add(db_user)
    all_users.append(db_user)
db.commit()

admin_user = all_users[0]
vendor_user = all_users[3]

# ---- Hospitals ----
print("Seeding Hospitals...")
hospitals_data = [
    {"name": "AIIMS Delhi", "location": "New Delhi", "type": "Government"},
    {"name": "Apollo Hospitals", "location": "Mumbai", "type": "Private"},
    {"name": "Tata Memorial Centre", "location": "Mumbai", "type": "Trust"},
    {"name": "Fortis Healthcare", "location": "Bengaluru", "type": "Private"},
    {"name": "Safdarjung Hospital", "location": "New Delhi", "type": "Government"},
]
hospitals = []
for h in hospitals_data:
    obj = models.Hospital(**h)
    db.add(obj)
    hospitals.append(obj)
db.commit()
for h in hospitals:
    db.refresh(h)

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
base_date = datetime.now() - timedelta(days=90)
for i, title in enumerate(tender_titles):
    hosp = random.choice(hospitals)
    cat = categories[i % len(categories)]
    status = statuses[i % len(statuses)]
    budget = round(random.uniform(500_000, 25_000_000), 2)
    deadline = datetime.now() + timedelta(days=random.randint(10, 60))
    created = base_date + timedelta(days=i*4)
    t = models.Tender(
        hospital_id=hosp.id,
        title=title,
        category=cat,
        budget=budget,
        status=status,
        deadline=deadline,
        created_at=created,
        description=f"Procurement for {title} at {hosp.name}. Budget approved by finance committee.",
    )
    db.add(t)
    tenders.append(t)
db.commit()
for t in tenders:
    db.refresh(t)

# ---- Bids ----
print("Seeding Bids...")
vendor_names = [
    "MedEquip India Pvt Ltd", "SunPharma Supplies", "TechMedics Solutions",
    "HealthFirst Vendors", "BioMed Exports", "NovaCare Distributors",
    "AlphaHealth Systems", "ZenithMed", "CureMed Logistics", "PrimeCare India",
]

for tender in tenders:
    n_bids = random.randint(2, 6)
    amounts = sorted([round(tender.budget * random.uniform(0.7, 1.15), 2) for _ in range(n_bids)])
    winner_idx = 0 if tender.status == "awarded" else None
    for j, amount in enumerate(amounts):
        b = models.Bid(
            tender_id=tender.id,
            vendor_name=random.choice(vendor_names),
            amount=amount,
            notes=f"Best quality guaranteed. Delivery within 30 days. Warranty: 2 years.",
            submitted_at=tender.created_at + timedelta(days=random.randint(1, 15)),
            won=(j == winner_idx and tender.status == "awarded"),
        )
        db.add(b)
db.commit()

# ---- Audit Logs ----
print("Seeding Audit Logs...")
initial_logs = [
    {"action": "login", "table_name": "users", "record_id": admin_user.id, "user_id": admin_user.id, "details": "Admin logged in"},
    {"action": "create_tender", "table_name": "tenders", "record_id": tenders[0].id, "user_id": admin_user.id, "details": f"Created tender: {tenders[0].title}"},
    {"action": "submit_bid", "table_name": "bids", "record_id": 1, "user_id": vendor_user.id, "details": "Vendor MediSync submitted bid for primary tender"},
    {"action": "update_tender", "table_name": "tenders", "record_id": tenders[-1].id, "user_id": admin_user.id, "details": "Marked tender as awarded"},
]
for log_data in initial_logs:
    log = models.AuditLog(**log_data)
    db.add(log)
db.commit()

print("✅ Base seeding complete!")
bid_count = db.query(models.Bid).count()
print(f"   Hospitals : {len(hospitals)}")
print(f"   Tenders   : {len(tenders)}")
print(f"   Bids      : {bid_count}")
print(f"   Logs      : {len(initial_logs)}")
db.close()
