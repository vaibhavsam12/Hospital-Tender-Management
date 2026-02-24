from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import models
import schemas


# ---------- Hospital ----------
def get_hospitals(db: Session):
    return db.query(models.Hospital).all()


def get_hospital(db: Session, hospital_id: int):
    return db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()


def create_hospital(db: Session, hospital: schemas.HospitalCreate):
    obj = models.Hospital(**hospital.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# ---------- Tender ----------
def get_tenders(db: Session, status: Optional[str] = None, hospital_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    q = db.query(models.Tender)
    if status:
        q = q.filter(models.Tender.status == status)
    if hospital_id:
        q = q.filter(models.Tender.hospital_id == hospital_id)
    return q.offset(skip).limit(limit).all()


def get_tender(db: Session, tender_id: int):
    return db.query(models.Tender).filter(models.Tender.id == tender_id).first()


def create_tender(db: Session, tender: schemas.TenderCreate):
    obj = models.Tender(**tender.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_tender(db: Session, tender_id: int, data: schemas.TenderUpdate):
    obj = get_tender(db, tender_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete_tender(db: Session, tender_id: int):
    obj = get_tender(db, tender_id)
    if obj:
        db.delete(obj)
        db.commit()
    return obj


# ---------- Bid ----------
def get_bids(db: Session, tender_id: Optional[int] = None, skip: int = 0, limit: int = 200):
    q = db.query(models.Bid)
    if tender_id:
        q = q.filter(models.Bid.tender_id == tender_id)
    return q.offset(skip).limit(limit).all()


def get_bid(db: Session, bid_id: int):
    return db.query(models.Bid).filter(models.Bid.id == bid_id).first()


def create_bid(db: Session, bid: schemas.BidCreate):
    obj = models.Bid(**bid.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_bid(db: Session, bid_id: int, data: schemas.BidUpdate):
    obj = get_bid(db, bid_id)
    if not obj:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


# ---------- Analytics ----------
def get_analytics_summary(db: Session):
    total = db.query(func.count(models.Tender.id)).scalar()
    active = db.query(func.count(models.Tender.id)).filter(models.Tender.status == "open").scalar()
    awarded = db.query(func.count(models.Tender.id)).filter(models.Tender.status == "awarded").scalar()
    closed = db.query(func.count(models.Tender.id)).filter(models.Tender.status == "closed").scalar()
    total_budget = db.query(func.sum(models.Tender.budget)).scalar() or 0.0
    total_bids = db.query(func.count(models.Bid.id)).scalar()
    avg_bids = (total_bids / total) if total else 0.0

    cat_rows = (
        db.query(
            models.Tender.category,
            func.count(models.Tender.id).label("count"),
            func.sum(models.Tender.budget).label("total_budget"),
        )
        .group_by(models.Tender.category)
        .all()
    )
    by_category = [
        {"category": r.category or "Other", "count": r.count, "total_budget": r.total_budget or 0.0}
        for r in cat_rows
    ]

# ---------- User ----------
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    from auth_utils import get_password_hash
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ---------- AuditLog ----------
def log_action(db: Session, action: str, table_name: str, record_id: int, user_id: Optional[int] = None, details: Optional[str] = None):
    log = models.AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        details=details
    )
    db.add(log)
    db.commit()
    return log


def get_audit_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
