from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from pydantic import BaseModel
import database, crud, schemas, auth_utils

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(database.get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth_utils.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_utils.create_access_token(
        data={"sub": user.email, "org_id": user.organization_id}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: schemas.UserOut = Depends(auth_utils.get_current_user)):
    return current_user

class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=req.email)
    if not user:
        return {"msg": "If your email is registered, you will receive a reset link shortly."}
        
    reset_token = auth_utils.create_access_token(
        data={"sub": user.email, "type": "reset"}, expires_delta=timedelta(minutes=15)
    )
    reset_link = f"http://localhost:4200/auth/reset-password?token={reset_token}"
    
    from services.email import send_email_async
    background_tasks.add_task(
        send_email_async, 
        "Password Reset Request", 
        user.email, 
        f"Click the link to reset your password: <a href='{reset_link}'>Reset Password</a>"
    )
    return {"msg": "If your email is registered, you will receive a reset link shortly."}

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(database.get_db)):
    try:
        from jose import jwt, JWTError
        payload = jwt.decode(req.token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        if email is None or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token")
        
    user = crud.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = auth_utils.get_password_hash(req.new_password)
    db.commit()
    return {"msg": "Password reset successfully"}

