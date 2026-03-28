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
    
    # Find a organization
    hosp = db.query(models.Organization).first()
    if not hosp:
        print("❌ No organizations found. Run seed.py first.")
        return

    # Seed 1000 Projects
    print("  - Seeding 1,000 Projects...")
    for i in range(1000):
        t = models.Project(
            organization_id=hosp.id,
            title=f"Stress Test Project #{i}",
            category=random.choice(["Equipment", "Drugs", "Services", "IT"]),
            budget=random.uniform(100000, 10000000),
            status="open",
            deadline=datetime.now() + timedelta(days=30),
            description="High performance stress test record."
        )
        db.add(t)
        if i % 200 == 0:
            db.commit()
            print(f"    ... {i} projects seeded")
    db.commit()

    print("✅ Stress test seeding complete!")
    db.close()

if __name__ == "__main__":
    stress_test()
