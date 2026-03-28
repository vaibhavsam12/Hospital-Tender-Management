from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from typing import List, Optional
import crud
import schemas
import auth_utils, models
from fastapi.responses import FileResponse
import uuid, os, shutil

router = APIRouter(prefix="/bids", tags=["bids"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/", response_model=List[schemas.BidOut])
def list_bids(
    tender_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin", "officer", "finance", "vendor"]))
):
    # Strictly filter by organization
    return crud.get_bids(db, tender_id=tender_id, org_id=current_user.organization_id, skip=skip, limit=limit)


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
    # Verify the tender belongs to the user's organization
    tender = crud.get_tender(db, tender_id=tender_id, org_id=current_user.organization_id)
    if not tender:
        raise HTTPException(status_code=403, detail="Tender not found in your organization scope")

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Bid amount must be greater than zero")

    quotation_url = None
    if file:
        MAX_FILE_SIZE = 5 * 1024 * 1024
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
             raise HTTPException(status_code=400, detail="File too large (Max 5MB)")
        await file.seek(0)
        
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in [".pdf", ".doc", ".docx"]:
             raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOC are allowed.")

        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        quotation_url = f"/bids/download/{unique_filename}"

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
    
    crud.log_action(db, "submit_bid", "bids", result.id, current_user.id, org_id=current_user.organization_id, details=f"Vendor {result.vendor_name} bid {result.amount}")
    return result


@router.put("/{bid_id}", response_model=schemas.BidOut)
def update_bid(
    bid_id: int,
    data: schemas.BidUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.check_role(["admin", "officer"]))
):
    # Verify the bid belongs to the user's organization
    obj = crud.update_bid(db, bid_id, data, org_id=current_user.organization_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    if data.won and obj.user and obj.user.email:
        from services.email import send_tender_notification
        background_tasks.add_task(
            send_tender_notification,
            obj.user.email,
            obj.tender.title if obj.tender else f"Tender #{obj.tender_id}",
            "AWARDED"
        )

    crud.log_action(db, "update_bid", "bids", bid_id, current_user.id, org_id=current_user.organization_id, details=f"Updated fields: {data.model_dump(exclude_unset=True)}")
    return obj

@router.get("/download/{filename}")
def download_quotation(
    filename: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    filename = os.path.basename(filename)
    
    # Strictly scope the search to the organization
    bid = db.query(models.Bid).join(models.Tender).filter(
        models.Bid.quotation_url.ilike(f"%{filename}"),
        models.Tender.organization_id == current_user.organization_id
    ).first()
    
    if not bid:
        raise HTTPException(status_code=404, detail="File not found or access denied")
    
    is_staff = current_user.role in ["admin", "officer", "finance"]
    is_owner = bid.user_id == current_user.id
    
    if not (is_staff or is_owner):
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
        
    file_path = os.path.normpath(os.path.join(UPLOAD_DIR, filename))
    if not file_path.startswith(os.path.abspath(UPLOAD_DIR)):
         raise HTTPException(status_code=403, detail="Invalid path access")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Physical file missing")
        
    return FileResponse(file_path, filename=filename)
