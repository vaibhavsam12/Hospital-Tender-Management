from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
from typing import List

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


@router.get("/", response_model=List[schemas.HospitalOut])
def list_hospitals(db: Session = Depends(get_db)):
    return crud.get_hospitals(db)
