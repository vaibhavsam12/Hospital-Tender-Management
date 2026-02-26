from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
import auth_utils
from database import get_db

router = APIRouter(prefix="/clarifications", tags=["Clarifications"])


@router.get("/{tender_id}", response_model=List[schemas.ClarificationOut])
def get_tender_clarifications(tender_id: int, db: Session = Depends(get_db)):
    return crud.get_clarifications(db, tender_id)


@router.post("/", response_model=schemas.ClarificationOut)
def ask_question(
    data: schemas.ClarificationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth_utils.get_current_user)
):
    if current_user.role not in ["vendor", "admin"]:
        raise HTTPException(status_code=403, detail="Only vendors or admins can ask questions")
    
    return crud.create_clarification(
        db, 
        tender_id=data.tender_id, 
        user_id=current_user.id, 
        asker_name=current_user.full_name or "Anonymous Vendor",
        question=data.question
    )


@router.put("/{clarification_id}/answer", response_model=schemas.ClarificationOut)
def answer_question(
    clarification_id: int,
    data: schemas.ClarificationAnswer,
    db: Session = Depends(get_db),
    current_user=Depends(auth_utils.get_current_user)
):
    if current_user.role not in ["admin", "officer"]:
        raise HTTPException(status_code=403, detail="Only admins or officers can answer questions")
    
    clarif = crud.answer_clarification(db, clarification_id, data.answer)
    if not clarif:
        raise HTTPException(status_code=404, detail="Clarification not found")
    
    # Optional: Log action
    crud.log_action(db, "answer_clarification", "clarifications", clarification_id, current_user.id, f"Answered question for tender {clarif.tender_id}")
    
    return clarif
