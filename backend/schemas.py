from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


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
    vendor_name: str
    amount: float
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
    budget: Optional[float] = 0.0
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

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
