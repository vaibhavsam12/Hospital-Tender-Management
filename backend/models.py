from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    type = Column(String)  # Government / Private / Trust

    tenders = relationship("Tender", back_populates="hospital")


class Tender(Base):
    __tablename__ = "tenders"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    title = Column(String, nullable=False, index=True)
    category = Column(String, index=True)           # Equipment / Drugs / Services / IT
    budget = Column(Float, default=0.0)
    status = Column(String, default="open", index=True)  # open / closed / awarded
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    description = Column(Text, default="")

    hospital = relationship("Hospital", back_populates="tenders")
    bids = relationship("Bid", back_populates="tender")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="viewer") # admin, officer, finance, vendor, viewer
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)


class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True) # Link to vendor user
    vendor_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    notes = Column(Text, default="")
    submitted_at = Column(DateTime, default=datetime.utcnow)
    won = Column(Boolean, default=False)
    quotation_url = Column(String, nullable=True) # PDF storage path

    tender = relationship("Tender", back_populates="bids")
    user = relationship("User")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False) # update_status, award_bid, etc.
    table_name = Column(String)
    record_id = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    details = Column(Text)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Clarification(Base):
    __tablename__ = "clarifications"

    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asker_name = Column(String, nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    answered_at = Column(DateTime, nullable=True)

    tender = relationship("Tender")

