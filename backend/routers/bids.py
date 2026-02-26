from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from typing import List, Optional
import crud
import schemas
import auth_utils, models
from fastapi.responses import FileResponse
import uuid, os

router = APIRouter(prefix="/bids", tags=["bids"])

@router.get("/", response_model=List[schemas.BidOut])
def list_bids(
    tender_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin", "officer", "finance"]))
):
    return crud.get_bids(db, tender_id=tender_id, skip=skip, limit=limit)


@router.post("/", response_model=schemas.BidOut, status_code=201)
async def submit_bid(
    tender_id: int = Form(...),
    vendor_name: str = Form(...),
    amount: float = Form(...),
    notes: str = Form(""),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["vendor", "admin"]))
):
    # Handle file upload (Secure: use UUID)
    quotation_url = None
    if file:
        if not os.path.exists("uploads"): os.makedirs("uploads")
        ext = file.filename.split(".")[-1]
        unique_name = f"{uuid.uuid4()}.{ext}"
        file_path = f"uploads/{unique_name}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
        quotation_url = unique_name # Only store the filename

    bid_schema = schemas.BidCreate(
        tender_id=tender_id,
        user_id=current_user.id,
        vendor_name=vendor_name,
        amount=amount,
        notes=notes
    )
    
    result = crud.create_bid(db, bid_schema)
    result.quotation_url = quotation_url
    db.commit()
    db.refresh(result)
    
    crud.log_action(db, "submit_bid", "bids", result.id, current_user.id, f"Vendor {result.vendor_name} bid {result.amount}")
    return result


@router.put("/{bid_id}", response_model=schemas.BidOut)
def update_bid(
    bid_id: int,
    data: schemas.BidUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin", "officer"]))
):
    obj = crud.update_bid(db, bid_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Bid not found")
    crud.log_action(db, "update_bid", "bids", bid_id, current_user.id, f"Updated fields: {data.model_dump(exclude_unset=True)}")
    return obj
@router.get("/{bid_id}/download")
def download_quotation(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    bid = crud.get_bid(db, bid_id)
    if not bid or not bid.quotation_url:
        raise HTTPException(status_code=404, detail="File not found")
    
    # RBAC: Only bid owner or staff can download
    is_staff = current_user.role in ["admin", "officer", "finance"]
    is_owner = bid.user_id == current_user.id
    
    if not (is_staff or is_owner):
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
        
    file_path = os.path.join("uploads", bid.quotation_url)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Physical file missing")
        
    return FileResponse(file_path)
