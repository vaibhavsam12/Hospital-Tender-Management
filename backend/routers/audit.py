from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import database, crud, schemas, auth_utils, models
from typing import List

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("/", response_model=List[schemas.AuditLogOut])
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin", "officer"]))
):
    return crud.get_audit_logs(db, skip=skip, limit=limit)
