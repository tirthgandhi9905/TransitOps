from fastapi import Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User, Role
from app.core.exceptions import TransitOpsException

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise TransitOpsException("TOKEN_EXPIRED", "Authentication credentials missing", 401)
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise TransitOpsException("TOKEN_EXPIRED", "Token email subject is missing", 401)
    except JWTError:
        raise TransitOpsException("TOKEN_EXPIRED", "Token is invalid or expired", 401)
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise TransitOpsException("TOKEN_EXPIRED", "User not found", 401)
    
    if not user.is_active:
        raise TransitOpsException("UNAUTHORIZED", "User account is deactivated", 403)
        
    return user

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
        user_role = db.query(Role).filter(Role.id == current_user.role_id).first()
        if not user_role or user_role.name not in self.allowed_roles:
            raise TransitOpsException(
                "UNAUTHORIZED", 
                f"Role '{user_role.name if user_role else 'None'}' is not authorized to perform this action",
                403
            )
        return current_user
