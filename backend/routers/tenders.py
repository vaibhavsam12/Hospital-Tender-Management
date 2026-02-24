from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from typing import List, Optional
import crud
import schemas
import auth_utils, models

router = APIRouter(prefix="/tenders", tags=["tenders"])


@router.get("/", response_model=List[schemas.TenderOut])
def list_tenders(
    status: Optional[str] = Query(None),
    hospital_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return crud.get_tenders(db, status=status, hospital_id=hospital_id, skip=skip, limit=limit)


def create_tender(
    tender: schemas.TenderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin", "officer"]))
):
    result = crud.create_tender(db, tender)
    crud.log_action(db, "create_tender", "tenders", result.id, current_user.id, f"Created {result.title}")
    return result


@router.get("/{tender_id}", response_model=schemas.TenderOut)
def get_tender(tender_id: int, db: Session = Depends(get_db)):
    obj = crud.get_tender(db, tender_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tender not found")
    return obj


@router.put("/{tender_id}", response_model=schemas.TenderOut)
def update_tender(tender_id: int, data: schemas.TenderUpdate, db: Session = Depends(get_db)):
    obj = crud.update_tender(db, tender_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Tender not found")
    return obj


@router.delete("/{tender_id}")
def delete_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin"]))
):
    obj = crud.delete_tender(db, tender_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tender not found")
    crud.log_action(db, "delete_tender", "tenders", tender_id, current_user.id)
    return {"message": "Deleted"}
