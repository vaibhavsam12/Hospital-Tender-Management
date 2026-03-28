from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import crud, models, schemas, auth_utils
from database import get_db

router = APIRouter(prefix="/billing", tags=["billing"])

@router.get("/plans", response_model=List[schemas.PlanOut])
def list_plans(db: Session = Depends(get_db)):
    return db.query(models.Plan).all()

@router.get("/subscription", response_model=schemas.SubscriptionOut)
def get_subscription(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    sub = db.query(models.Subscription).filter(
        models.Subscription.organization_id == current_user.organization_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")
    return sub

@router.post("/transactions", response_model=schemas.TransactionOut)
def create_transaction(
    tx_in: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    # Simulated Razorpay Order Creation
    import uuid
    db_tx = models.Transaction(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        amount=tx_in.amount,
        type=tx_in.type,
        status="pending",
        razorpay_order_id=f"order_{uuid.uuid4().hex[:12]}"
    )
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    return db_tx

@router.get("/transactions", response_model=List[schemas.TransactionOut])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    return db.query(models.Transaction).filter(
        models.Transaction.organization_id == current_user.organization_id
    ).all()
