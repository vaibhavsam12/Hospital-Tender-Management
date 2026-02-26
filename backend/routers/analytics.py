from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
import auth_utils, models

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=schemas.AnalyticsSummary)
def analytics_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin", "officer", "finance"]))
):
    return crud.get_analytics_summary(db)


@router.get("/vendor", response_model=schemas.VendorStats)
def get_vendor_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    if current_user.role not in ["vendor", "admin"]:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Only vendors can see their stats")
    return crud.get_vendor_stats(db, current_user.id)
