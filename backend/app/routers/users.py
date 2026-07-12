from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, Role
from app.schemas.user import UserCreate, UserUpdate
from app.core.rbac import RoleChecker
from app.core.exceptions import TransitOpsException
from app.core.security import get_password_hash
from app.utils.api_response import success_response, success_list_response
from app.utils.pagination import apply_pagination_and_sorting

router = APIRouter(prefix="/users", tags=["users"])

@router.get("")
def list_users(
    page: int = 1,
    limit: int = 20,
    search: str = None,
    sortBy: str = "created_at",
    sortOrder: str = "desc",
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin"]))
):
    query = db.query(User).filter(User.is_active == True)
    search_fields = ["name", "email"]
    
    db_sort = "created_at" if sortBy == "createdAt" else sortBy
    
    results, total = apply_pagination_and_sorting(
        query=query,
        model=User,
        page=page,
        limit=limit,
        search=search,
        search_fields=search_fields,
        sort_by=db_sort,
        sort_order=sortOrder
    )
    
    data = []
    for u in results:
        role = db.query(Role).filter(Role.id == u.role_id).first()
        data.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "isActive": u.is_active,
            "roleId": u.role_id,
            "role": {"id": role.id, "name": role.name} if role else None,
            "createdAt": u.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
        
    return success_list_response(data, total, page, limit)

@router.get("/{user_id}")
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin"]))
):
    u = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not u:
        raise TransitOpsException("NOT_FOUND", "User not found", 404)
        
    role = db.query(Role).filter(Role.id == u.role_id).first()
    user_data = {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "isActive": u.is_active,
        "roleId": u.role_id,
        "role": {"id": role.id, "name": role.name} if role else None,
        "createdAt": u.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }
    return success_response(user_data)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin"]))
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise TransitOpsException("VALIDATION_ERROR", "Email already registered", 400)
        
    role = db.query(Role).filter(Role.id == user_in.role_id).first()
    if not role:
        raise TransitOpsException("NOT_FOUND", "Role not found", 404)
        
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role_id=user_in.role_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    user_data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "isActive": user.is_active,
        "roleId": user.role_id,
        "role": {"id": role.id, "name": role.name},
        "createdAt": user.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }
    return success_response(user_data)

@router.put("/{user_id}")
def update_user(
    user_id: str,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin"]))
):
    u = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not u:
        raise TransitOpsException("NOT_FOUND", "User not found", 404)
        
    update_data = user_in.dict(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        u.password_hash = get_password_hash(update_data["password"])
        
    if "email" in update_data:
        if update_data["email"] != u.email:
            existing = db.query(User).filter(User.email == update_data["email"]).first()
            if existing:
                raise TransitOpsException("VALIDATION_ERROR", "Email already registered", 400)
            u.email = update_data["email"]
            
    if "role_id" in update_data:
        role = db.query(Role).filter(Role.id == update_data["role_id"]).first()
        if not role:
            raise TransitOpsException("NOT_FOUND", "Role not found", 404)
        u.role_id = update_data["role_id"]
        
    if "name" in update_data:
        u.name = update_data["name"]
        
    if "is_active" in update_data:
        u.is_active = update_data["is_active"]
        
    db.commit()
    db.refresh(u)
    
    role = db.query(Role).filter(Role.id == u.role_id).first()
    user_data = {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "isActive": u.is_active,
        "roleId": u.role_id,
        "role": {"id": role.id, "name": role.name} if role else None,
        "createdAt": u.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }
    return success_response(user_data)

@router.delete("/{user_id}")
def deactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Admin"]))
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise TransitOpsException("NOT_FOUND", "User not found", 404)
        
    u.is_active = False
    db.commit()
    return success_response({"message": "User deactivated successfully"})
