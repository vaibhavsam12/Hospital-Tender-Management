from database import SessionLocal
import models

def seed_settings():
    db = SessionLocal()
    defaults = [
        {"key": "system_name", "value": "HealthTender Pro", "description": "Display name of the platform", "group": "branding"},
        {"key": "smtp_host", "value": "smtp.gmail.com", "description": "SMTP Server Host", "group": "email"},
        {"key": "smtp_port", "value": "587", "description": "SMTP Server Port", "group": "email"},
        {"key": "smtp_user", "value": "", "description": "SMTP Username", "group": "email"},
        {"key": "smtp_password", "value": "", "description": "SMTP Password", "group": "email"},
    ]
    
    for d in defaults:
        exists = db.query(models.Setting).filter(models.Setting.key == d["key"]).first()
        if not exists:
            db.add(models.Setting(**d))
    
    db.commit()
    db.close()
    print("Settings seeded successfully!")

if __name__ == "__main__":
    seed_settings()
