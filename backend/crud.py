from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import models
import schemas


# ---------- Hospital ----------
def get_hospitals(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Hospital).offset(skip).limit(limit).all()


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
    # Link to user_id if provided in the schema
    obj = models.Bid(**bid.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update_bid(db: Session, bid_id: int, data: schemas.BidUpdate):
    obj = get_bid(db, bid_id)
    if not obj:
        return None
    
    was_won = obj.won
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)
    
    db.commit()
    db.refresh(obj)

    # Trigger notification if won status changes to true
    if not was_won and obj.won and obj.user_id:
        create_notification(
            db,
            user_id=obj.user_id,
            title="🎯 Bid Awarded!",
            message=f"Your bid for Tender #{obj.tender_id} has been accepted.",
            link=f"/tenders/{obj.tender_id}"
        )
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
    return schemas.AnalyticsSummary(
        total_tenders=total,
        active_tenders=active,
        awarded_tenders=awarded,
        closed_tenders=closed,
        total_budget=total_budget,
        total_bids=total_bids,
        avg_bids_per_tender=round(avg_bids, 1) if total > 0 else 0.0,
        by_category=by_category
    )

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


# ---------- Notification ----------
def create_notification(db: Session, user_id: int, title: str, message: str, link: Optional[str] = None):
    obj = models.Notification(user_id=user_id, title=title, message=message, link=link)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    return db.query(models.Notification).filter(models.Notification.user_id == user_id).order_by(models.Notification.created_at.desc()).offset(skip).limit(limit).all()


def mark_notification_read(db: Session, notification_id: int):
    obj = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if obj:
        obj.is_read = True
        db.commit()
        db.refresh(obj)
    return obj


# ---------- Clarification ----------
def create_clarification(db: Session, tender_id: int, user_id: int, asker_name: str, question: str):
    obj = models.Clarification(tender_id=tender_id, user_id=user_id, asker_name=asker_name, question=question)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def answer_clarification(db: Session, clarification_id: int, answer: str):
    from datetime import datetime
    obj = db.query(models.Clarification).filter(models.Clarification.id == clarification_id).first()
    if obj:
        obj.answer = answer
        obj.answered_at = datetime.utcnow()
        db.commit()
        db.refresh(obj)
    return obj


def get_clarifications(db: Session, tender_id: int):
    return db.query(models.Clarification).filter(models.Clarification.tender_id == tender_id).order_by(models.Clarification.created_at.desc()).all()


def get_vendor_stats(db: Session, user_id: int):
    # Total bids by this user
    total_bids = db.query(func.count(models.Bid.id)).filter(models.Bid.user_id == user_id).scalar()
    # Won bids
    won_bids = db.query(func.count(models.Bid.id)).filter(models.Bid.user_id == user_id, models.Bid.won == True).scalar()
    # Win rate
    win_rate = (won_bids / total_bids * 100) if total_bids > 0 else 0.0
    # Total bid value
    total_val = db.query(func.sum(models.Bid.amount)).filter(models.Bid.user_id == user_id).scalar() or 0.0
    # Active bids (bids on open tenders)
    active_bids = (
        db.query(func.count(models.Bid.id))
        .join(models.Tender)
        .filter(models.Bid.user_id == user_id, models.Tender.status == "open")
        .scalar()
    )
    
    return schemas.VendorStats(
        total_bids=total_bids,
        won_bids=won_bids,
        win_rate=float(int(win_rate * 10) / 10.0),
        total_bid_value=total_val,
        active_bids=active_bids
    )
