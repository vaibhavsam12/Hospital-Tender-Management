from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ---- Organization ----
class OrganizationBase(BaseModel):
    slug: str
    display_name: str
    is_active: bool = True

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationOut(OrganizationBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Hospital ----
class HospitalBase(BaseModel):
    name: str
    location: Optional[str] = None
    type: Optional[str] = None # Government / Private / Trust

class HospitalCreate(HospitalBase):
    pass

class HospitalOut(HospitalBase):
    id: int
    organization_id: int
    class Config:
        from_attributes = True


# ---- Tender ----
class TenderBase(BaseModel):
    title: str
    category: Optional[str] = None # Equipment / Drugs / Services / IT
    budget: float = 0.0
    status: str = "open" # open / closed / awarded
    deadline: Optional[datetime] = None
    description: Optional[str] = ""

class TenderCreate(TenderBase):
    organization_id: int
    hospital_id: int

class TenderUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    budget: Optional[float] = None
    status: Optional[str] = None
    deadline: Optional[datetime] = None
    description: Optional[str] = None

class TenderOut(TenderBase):
    id: int
    organization_id: int
    hospital_id: int
    created_at: datetime
    hospital: Optional[HospitalOut] = None
    
    class Config:
        from_attributes = True


# ---- Bid ----
class BidBase(BaseModel):
    tender_id: int
    vendor_name: str
    amount: float
    notes: Optional[str] = ""

class BidCreate(BidBase):
    user_id: Optional[int] = None

class BidUpdate(BaseModel):
    amount: Optional[float] = None
    notes: Optional[str] = None
    won: Optional[bool] = None

class BidOut(BidBase):
    id: int
    user_id: Optional[int] = None
    submitted_at: datetime
    won: bool
    quotation_url: Optional[str] = None
    tender: Optional[TenderOut] = None 
    class Config:
        from_attributes = True


# ---- User & Auth ----
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: str = "viewer"

class UserCreate(UserBase):
    organization_id: Optional[int] = None
    password: str

class UserOut(UserBase):
    id: int
    organization_id: Optional[int] = None
    is_active: bool
    organization: Optional[OrganizationOut] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    org_id: Optional[int] = None


# ---- Audit Log ----
class AuditLogOut(BaseModel):
    id: int
    organization_id: Optional[int]
    user_id: Optional[int]
    action: str
    table_name: Optional[str]
    record_id: Optional[int]
    timestamp: datetime
    details: Optional[str]
    class Config:
        from_attributes = True


# ---- Analytics ----
class CategoryBudget(BaseModel):
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
    by_category: List[CategoryBudget]

class VendorStats(BaseModel):
    total_bids: int
    won_bids: int
    active_bids: int
    win_rate: float
    total_bid_value: float

class BidPredictionOut(BaseModel):
    tender_id: int
    predicted_l1_price: float
    confidence_score: float # 0 to 1
    historical_avg: float
    market_trend: str # increasing / decreasing / stable
    insight_text: str


# ---- Notifications ----
class NotificationOut(BaseModel):
    id: int
    organization_id: Optional[int]
    title: str
    message: str
    link: Optional[str]
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True


# ---- Clarifications ----
class ClarificationBase(BaseModel):
    question: str

class ClarificationCreate(ClarificationBase):
    tender_id: int
    asker_name: str

class ClarificationAnswer(BaseModel):
    answer: str

class ClarificationOut(ClarificationBase):
    id: int
    organization_id: Optional[int]
    tender_id: int
    user_id: int
    asker_name: str
    answer: Optional[str]
    created_at: datetime
    answered_at: Optional[datetime]
    class Config:
        from_attributes = True

# ---- Settings ----
class SettingBase(BaseModel):
    key: str
    value: Optional[str] = None
    description: Optional[str] = None
    group: str

class SettingUpdate(BaseModel):
    value: str

class SettingOut(SettingBase):
    id: int
    organization_id: Optional[int]
    class Config:
        from_attributes = True

class SettingBulkUpdate(BaseModel):
    settings: List[dict] # List of {"key": "...", "value": "..."}

# ---- Billing ----
class PlanOut(BaseModel):
    id: int
    name: str
    price: float
    features: Optional[str]
    class Config:
        from_attributes = True

class SubscriptionOut(BaseModel):
    id: int
    organization_id: int
    plan_id: int
    status: str
    current_period_end: Optional[datetime]
    plan: Optional[PlanOut]
    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    amount: float
    type: str # subscription / bid_fee
    org_id: Optional[int] = None

class TransactionOut(BaseModel):
    id: int
    amount: float
    currency: str
    status: str
    type: str
    razorpay_order_id: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
