from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud, schemas, auth_utils, models
from typing import List

router = APIRouter(prefix="/hospitals", tags=["hospitals"])

@router.get("/", response_model=List[schemas.HospitalOut])
def list_hospitals(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    return crud.get_hospitals(db, org_id=current_user.organization_id, skip=skip, limit=limit)

@router.post("/", response_model=schemas.HospitalOut)
def create_hospital(
    hospital: schemas.HospitalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin"]))
):
    return crud.create_hospital(db=db, hospital=hospital, org_id=current_user.organization_id)

@router.get("/{hospital_id}", response_model=schemas.HospitalOut)
def get_hospital(
    hospital_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    db_hospital = crud.get_hospital(db, hospital_id=hospital_id, org_id=current_user.organization_id)
    if not db_hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return db_hospital
