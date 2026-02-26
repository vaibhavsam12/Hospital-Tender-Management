from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List, Annotated


# ---- Hospital ----
class HospitalBase(BaseModel):
    name: str
    location: Optional[str] = None
    type: Optional[str] = None


class HospitalCreate(HospitalBase):
    pass


class HospitalOut(HospitalBase):
    id: int

    class Config:
        from_attributes = True


# ---- Bid ----
class BidBase(BaseModel):
    tender_id: int
    user_id: Optional[int] = None # Link to vendor user
    vendor_name: str
    amount: float = Field(..., gt=0)
    notes: Optional[str] = ""


class BidCreate(BidBase):
    pass


class BidUpdate(BaseModel):
    won: Optional[bool] = None
    amount: Optional[float] = None
    notes: Optional[str] = None


class BidOut(BidBase):
    id: int
    submitted_at: datetime
    won: bool

    class Config:
        from_attributes = True


# ---- Tender ----
class TenderBase(BaseModel):
    hospital_id: int
    title: str
    category: Optional[str] = None
    budget: float = Field(0.0, ge=0)
    status: Optional[str] = "open"
    deadline: Optional[datetime] = None
    description: Optional[str] = ""


class TenderCreate(TenderBase):
    pass


class TenderUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    budget: Optional[float] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None
    description: Optional[str] = None


class TenderOut(TenderBase):
    id: int
    created_at: datetime
    hospital: Optional[HospitalOut] = None
    bids: List[BidOut] = []

    class Config:
        from_attributes = True


class TenderList(TenderBase):
    id: int
    created_at: datetime
    hospital: Optional[HospitalOut] = None
    bid_count: int = 0

    class Config:
        from_attributes = True


# ---- Analytics ----
class CategoryStat(BaseModel):
    category: str
    count: int
    total_budget: float


class AnalyticsSummary(BaseModel):
    total_tenders: int
    active_tenders: int
    awarded_tenders: int
    closed_tenders: int
    total_budget: float
    total_bids: int
    avg_bids_per_tender: float
    by_category: List[CategoryStat]


class VendorStats(BaseModel):
    total_bids: int
    won_bids: int
    win_rate: float
    total_bid_value: float
    active_bids: int


# ---- User & Auth ----
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: str = "viewer"


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    is_active: bool
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---- Audit Log ----
class AuditLogOut(BaseModel):
    id: int
    user_id: int
    action: str
    table_name: str
    record_id: Optional[int] = None
    timestamp: datetime
    details: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# ---- Notification ----
class NotificationBase(BaseModel):
    title: str
    message: str
    link: Optional[str] = None


class NotificationOut(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Clarification ----
class ClarificationBase(BaseModel):
    tender_id: int
    question: str


class ClarificationCreate(ClarificationBase):
    pass


class ClarificationAnswer(BaseModel):
    answer: str


class ClarificationOut(ClarificationBase):
    id: int
    user_id: int
    asker_name: str
    answer: Optional[str] = None
    created_at: datetime
    answered_at: Optional[datetime] = None

    class Config:
        from_attributes = True
