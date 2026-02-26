import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from database import engine, SessionLocal, Base
import models, crud, schemas
from datetime import datetime, timedelta
import random

def stress_test():
    db = SessionLocal()
    print("🚀 Starting Stress Test Seeding (1,000 records)...")
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Find a hospital
    hosp = db.query(models.Hospital).first()
    if not hosp:
        print("❌ No hospitals found. Run seed.py first.")
        return

    # Seed 1000 Tenders
    print("  - Seeding 1,000 Tenders...")
    for i in range(1000):
        t = models.Tender(
            hospital_id=hosp.id,
            title=f"Stress Test Tender #{i}",
            category=random.choice(["Equipment", "Drugs", "Services", "IT"]),
            budget=random.uniform(100000, 10000000),
            status="open",
            deadline=datetime.now() + timedelta(days=30),
            description="High performance stress test record."
        )
        db.add(t)
        if i % 200 == 0:
            db.commit()
            print(f"    ... {i} tenders seeded")
    db.commit()

    print("✅ Stress test seeding complete!")
    db.close()

if __name__ == "__main__":
    stress_test()
