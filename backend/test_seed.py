import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from database import engine, SessionLocal
import models

def main():
    db = SessionLocal()
    print("Clearing...")
    db.query(models.Organization).delete()
    db.commit()
    print("Seeding Org...")
    org = models.Organization(slug="test", display_name="Test")
    db.add(org)
    db.commit()
    print(f"Org created with ID: {org.id}")
    db.close()

if __name__ == "__main__":
    main()
