from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
import auth_utils, models
from typing import List

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


@router.get("/", response_model=List[schemas.HospitalOut])
def list_hospitals(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_hospitals(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.HospitalOut, status_code=201)
def create_hospital(
    hospital: schemas.HospitalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin"]))
):
    result = crud.create_hospital(db, hospital)
    crud.log_action(db, "create_hospital", "hospitals", result.id, current_user.id, f"Created {result.name}")
    return result
