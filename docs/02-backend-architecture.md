<!-- # System Design

## User Flow

User → Login → JWT Issued → Authorized API Access

Admin:
Create Tender → Status Management → View Bids → Award

Vendor:
View Open Tenders → Submit Bid → Track Status

System:
Log actions → Store audit trail → Generate analytics -->

# Backend Architecture

The backend is built using FastAPI with a modular router-based architecture.

## Core Structure

main.py  
→ Application entry point  
→ Router registration  

database.py  
→ SQLAlchemy session management  

models.py  
→ Database models  

schemas.py  
→ Pydantic request/response schemas  

crud.py  
→ Database interaction layer  

auth_utils.py  
→ JWT authentication & password hashing  

routers/
- auth.py
- tenders.py
- bids.py
- audit.py
- notifications.py
- clarifications.py
- analytics.py

## Architecture Pattern

Router → Schema → CRUD → Database

This ensures:
- Separation of concerns
- Scalable feature expansion
- Maintainable business logic