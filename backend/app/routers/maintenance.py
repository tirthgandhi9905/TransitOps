import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.maintenance import MaintenanceLog
from app.models.vehicle import Vehicle
from app.schemas.maintenance import MaintenanceCreate
from app.services.maintenance_service import MaintenanceService
from app.core.rbac import RoleChecker, get_current_user
from app.core.exceptions import TransitOpsException
from app.utils.api_response import success_response, success_list_response
from app.utils.pagination import apply_pagination_and_sorting
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

class MaintenanceUpdate(BaseModel):
    maintenanceType: Optional[str] = Field(default=None, alias="maintenance_type")
    description: Optional[str] = None
    cost: Optional[float] = None
    vendor: Optional[str] = None
    startDate: Optional[datetime.datetime] = Field(default=None, alias="start_date")

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True

def serialize_vehicle(v: Vehicle) -> dict:
    if not v:
        return None
    return {
        "id": v.id,
        "registrationNumber": v.registration_number,
        "vehicleName": v.vehicle_name,
        "vehicleModel": v.vehicle_model,
        "vehicleType": v.vehicle_type,
        "maxLoadCapacity": float(v.max_load_capacity),
        "currentOdometer": float(v.current_odometer),
        "acquisitionCost": float(v.acquisition_cost),
        "region": v.region,
        "status": v.status,
        "purchaseDate": v.purchase_date.strftime("%Y-%m-%d") if v.purchase_date else None,
        "notes": v.notes
    }

def serialize_maintenance(m: MaintenanceLog) -> dict:
    return {
        "id": m.id,
        "vehicleId": m.vehicle_id,
        "maintenanceType": m.maintenance_type,
        "description": m.description,
        "cost": float(m.cost),
        "vendor": m.vendor,
        "status": m.status,
        "startDate": m.start_date.strftime("%Y-%m-%d %H:%M:%S") if m.start_date else None,
        "endDate": m.end_date.strftime("%Y-%m-%d %H:%M:%S") if m.end_date else None,
        "createdAt": m.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "updatedAt": m.updated_at.strftime("%Y-%m-%d %H:%M:%S"),
        "vehicle": serialize_vehicle(m.vehicle)
    }

@router.get("")
def list_maintenance(
    page: int = 1,
    limit: int = 20,
    search: str = None,
    sortBy: str = "created_at",
    sortOrder: str = "desc",
    vehicleId: str = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(MaintenanceLog)
    if vehicleId:
        query = query.filter(MaintenanceLog.vehicle_id == vehicleId)
    if status:
        query = query.filter(MaintenanceLog.status == status.upper())
        
    search_fields = ["description", "vendor"]
    db_sort = "created_at"
    if sortBy == "startDate":
        db_sort = "start_date"
    elif sortBy == "cost":
        db_sort = "cost"
        
    results, total = apply_pagination_and_sorting(
        query=query,
        model=MaintenanceLog,
        page=page,
        limit=limit,
        search=search,
        search_fields=search_fields,
        sort_by=db_sort,
        sort_order=sortOrder
    )
    
    data = [serialize_maintenance(m) for m in results]
    return success_list_response(data, total, page, limit)

@router.get("/{id}")
def get_maintenance_log(id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == id).first()
    if not log:
        raise TransitOpsException("NOT_FOUND", "Maintenance log not found", 404)
    return success_response(serialize_maintenance(log))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_maintenance(
    log_in: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Fleet Manager", "Admin"]))
):
    log = MaintenanceService.create_maintenance_log(
        db=db,
        vehicle_id=log_in.vehicleId,
        maintenance_type=log_in.maintenanceType.upper(),
        description=log_in.description,
        cost=log_in.cost or 0.0,
        vendor=log_in.vendor,
        start_date=log_in.startDate
    )
    return success_response(serialize_maintenance(log))

@router.put("/{id}")
def update_maintenance(
    id: str,
    log_in: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Fleet Manager", "Admin"]))
):
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == id).first()
    if not log:
        raise TransitOpsException("NOT_FOUND", "Maintenance log not found", 404)
        
    # Rule: only update ACTIVE records
    if log.status != "ACTIVE":
        raise TransitOpsException("INVALID_TRANSITION", f"Only ACTIVE maintenance records can be updated (current: {log.status})", 422)
        
    update_data = log_in.dict(exclude_unset=True)
    if "maintenanceType" in update_data:
        log.maintenance_type = update_data["maintenanceType"].upper()
    if "description" in update_data:
        log.description = update_data["description"]
    if "cost" in update_data:
        log.cost = update_data["cost"]
    if "vendor" in update_data:
        log.vendor = update_data["vendor"]
    if "startDate" in update_data:
        log.start_date = update_data["startDate"]
        
    db.commit()
    db.refresh(log)
    return success_response(serialize_maintenance(log))

@router.delete("/{id}")
def delete_maintenance(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Fleet Manager", "Admin"]))
):
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == id).first()
    if not log:
        raise TransitOpsException("NOT_FOUND", "Maintenance log not found", 404)
        
    # Rule: only delete if COMPLETED
    if log.status != "COMPLETED":
        raise TransitOpsException("INVALID_TRANSITION", f"Only COMPLETED maintenance logs can be deleted (current: {log.status})", 422)
        
    db.delete(log)
    db.commit()
    return success_response({"message": "Maintenance log deleted successfully"})

@router.post("/{id}/close")
def close_maintenance(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Fleet Manager", "Admin"]))
):
    log = MaintenanceService.close_maintenance_log(db, id)
    return success_response(serialize_maintenance(log))
