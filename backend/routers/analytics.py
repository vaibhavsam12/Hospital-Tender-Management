from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import crud, schemas, auth_utils, models

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary", response_model=schemas.AnalyticsSummary)
def analytics_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin", "officer", "finance"]))
):
    return crud.get_analytics_summary(db, org_id=current_user.organization_id)

@router.get("/vendor", response_model=schemas.VendorStats)
def vendor_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["vendor"]))
):
    # Vendor stats are already inherently user-scoped, but let's ensure the user's org context
    return crud.get_vendor_stats(db, user_id=current_user.id)
