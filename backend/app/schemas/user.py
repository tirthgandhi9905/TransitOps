from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class RoleResponse(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role_id: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role_id: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    is_active: bool
    role_id: str
    role: Optional[RoleResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenUser(BaseModel):
    id: str
    name: str
    email: str
    role: str

class Token(BaseModel):
    token: str
    user: TokenUser

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
