from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud, schemas, auth_utils, models
from typing import List

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/", response_model=List[schemas.SettingOut])
def read_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin"]))
):
    return crud.get_settings(db)

@router.get("/group/{group}", response_model=List[schemas.SettingOut])
def read_settings_by_group(
    group: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin"]))
):
    return crud.get_settings(db, group=group)

@router.put("/bulk", response_model=List[schemas.SettingOut])
def update_settings_bulk(
    payload: schemas.SettingBulkUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin"]))
):
    return crud.bulk_update_settings(db, payload.settings)

@router.get("/public")
def get_public_settings(db: Session = Depends(get_db)):
    # Only return safe branding settings
    settings = crud.get_settings(db, group="branding")
    return {s.key: s.value for s in settings}
