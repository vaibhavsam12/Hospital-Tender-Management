from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
import auth_utils
from database import get_db
import models # Added this import as models.User is used

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[schemas.NotificationOut])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    return crud.get_notifications(db, user_id=current_user.id, org_id=current_user.organization_id)


@router.post("/{notification_id}/read", response_model=schemas.NotificationOut)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth_utils.get_current_user)
):
    notif = crud.mark_notification_read(db, notification_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notif.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return notif
