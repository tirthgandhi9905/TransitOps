from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.maintenance import MaintenanceLog
from app.schemas.maintenance import MaintenanceCreate, MaintenanceResponse
from app.services.maintenance_service import MaintenanceService
from app.core.exceptions import ValidationError
from app.core.rbac import RoleChecker, get_current_user

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.get("", response_model=List[MaintenanceResponse])
def list_maintenance_logs(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(MaintenanceLog).all()

@router.post("", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_log(
    log_in: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Fleet Manager"]))
):
    try:
        log = MaintenanceService.create_maintenance_log(
            db=db,
            vehicle_id=log_in.vehicle_id,
            description=log_in.description,
            cost=log_in.cost,
            date=log_in.date
        )
        return log
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{log_id}/close", response_model=MaintenanceResponse)
def close_maintenance_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Fleet Manager"]))
):
    try:
        log = MaintenanceService.close_maintenance_log(db, log_id)
        return log
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
