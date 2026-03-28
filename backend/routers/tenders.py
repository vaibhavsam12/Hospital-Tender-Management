from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
import crud, schemas, auth_utils, models
from typing import List, Optional

router = APIRouter(prefix="/tenders", tags=["tenders"])

@router.get("/", response_model=List[schemas.TenderOut])
def list_tenders(
    status: Optional[str] = None,
    hospital_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    # Strictly scope to user's organization
    return crud.get_tenders(db, org_id=current_user.organization_id, status=status, hospital_id=hospital_id, skip=skip, limit=limit)

@router.post("/", response_model=schemas.TenderOut)
def create_tender(
    tender: schemas.TenderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin", "officer"]))
):
    # Force the organization_id from the authenticated user
    return crud.create_tender(db=db, tender=tender, org_id=current_user.organization_id)

@router.get("/{tender_id}", response_model=schemas.TenderOut)
def get_tender(
    tender_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    db_tender = crud.get_tender(db, tender_id=tender_id, org_id=current_user.organization_id)
    if not db_tender:
        raise HTTPException(status_code=404, detail="Tender not found in your organization")
    return db_tender

@router.get("/{tender_id}/predict", response_model=schemas.BidPredictionOut)
def predict_l1_bid(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    prediction = crud.get_bid_prediction(db, tender_id, org_id=current_user.organization_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Tender not found")
    return prediction

@router.put("/{tender_id}", response_model=schemas.TenderOut)
def update_tender(
    tender_id: int,
    tender_data: schemas.TenderUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin", "officer"]))
):
    old_obj = crud.get_tender(db, tender_id, org_id=current_user.organization_id)
    if not old_obj:
        raise HTTPException(status_code=404, detail="Tender not found")
        
    old_status = old_obj.status
    updated = crud.update_tender(db, tender_id=tender_id, data=tender_data, org_id=current_user.organization_id)
    
    # Notify if status changed
    if updated and tender_data.status and tender_data.status != old_status:
        from services.email import send_tender_notification
        try:
            vendor_emails = {b.user.email for b in updated.bids if b.user and b.user.email}
            for email in vendor_emails:
                background_tasks.add_task(
                    send_tender_notification,
                    email,
                    updated.title,
                    updated.status
                )
        except Exception as e:
            print(f"NOTIFICATION ERROR: {e}")

    return updated

@router.delete("/{tender_id}")
def delete_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin"]))
):
    success = crud.delete_tender(db, tender_id=tender_id, org_id=current_user.organization_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tender not found")
    return {"detail": "Tender deleted successfully"}
