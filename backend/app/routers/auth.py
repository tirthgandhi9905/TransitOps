from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Role
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.rbac import get_current_user
from app.core.exceptions import TransitOpsException
from app.utils.api_response import success_response
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise TransitOpsException(
            "INVALID_CREDENTIALS",
            "Email or password is incorrect",
            401
        )
    
    role = db.query(Role).filter(Role.id == user.role_id).first()
    role_name = role.name if role else "None"
    
    access_token = create_access_token(subject=user.email, role=role_name)
    
    # Return exactly matching token format
    token_response = {
        "token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": role_name
        }
    }
    return success_response(token_response)

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.id == current_user.role_id).first()
    role_name = role.name if role else "None"
    
    user_response = {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": role_name
    }
    return success_response(user_response)
