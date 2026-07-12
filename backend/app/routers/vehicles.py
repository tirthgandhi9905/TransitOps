from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.maintenance import MaintenanceLog
from app.models.fuel_expense import FuelLog
from app.schemas.vehicle import VehicleCreate, VehicleUpdate
from app.core.rbac import RoleChecker, get_current_user
from app.core.exceptions import TransitOpsException
from app.utils.api_response import success_response, success_list_response
from app.utils.pagination import apply_pagination_and_sorting

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

def serialize_vehicle(v: Vehicle) -> dict:
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
        "notes": v.notes,
        "createdAt": v.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "updatedAt": v.updated_at.strftime("%Y-%m-%d %H:%M:%S")
    }

@router.get("/available")
def get_available_vehicles(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    vehicles = db.query(Vehicle).filter(Vehicle.status == "AVAILABLE").all()
    data = [serialize_vehicle(v) for v in vehicles]
    return success_response(data)

@router.get("")
def list_vehicles(
    page: int = 1,
    limit: int = 20,
    search: str = None,
    sortBy: str = "created_at",
    sortOrder: str = "desc",
    status: str = None,
    vehicleType: str = None,
    region: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    if vehicleType:
        # handle case-insensitive or direct matching
        query = query.filter(Vehicle.vehicle_type == vehicleType.upper())
    if region:
        query = query.filter(Vehicle.region == region)
        
    search_fields = ["registration_number", "vehicle_name", "vehicle_model"]
    db_sort = "created_at"
    if sortBy == "registrationNumber":
        db_sort = "registration_number"
    elif sortBy == "vehicleName":
        db_sort = "vehicle_name"
    elif sortBy == "currentOdometer":
        db_sort = "current_odometer"
        
    results, total = apply_pagination_and_sorting(
        query=query,
        model=Vehicle,
        page=page,
        limit=limit,
        search=search,
        search_fields=search_fields,
        sort_by=db_sort,
        sort_order=sortOrder
    )
    
    data = [serialize_vehicle(v) for v in results]
    return success_list_response(data, total, page, limit)

@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise TransitOpsException("NOT_FOUND", "Vehicle not found", 404)
        
    # Aggregate costs
    fuel_cost = float(db.query(func.sum(FuelLog.fuel_cost)).filter(FuelLog.vehicle_id == vehicle_id).scalar() or 0.0)
    maint_cost = float(db.query(func.sum(MaintenanceLog.cost)).filter(MaintenanceLog.vehicle_id == vehicle_id).scalar() or 0.0)
    
    # Active maintenance
    active_maint = db.query(MaintenanceLog).filter(
        MaintenanceLog.vehicle_id == vehicle_id,
        MaintenanceLog.status == "ACTIVE"
    ).first()
    
    active_record = None
    if active_maint:
        active_record = {
            "id": active_maint.id,
            "maintenanceType": active_maint.maintenance_type,
            "description": active_maint.description,
            "cost": float(active_maint.cost),
            "vendor": active_maint.vendor,
            "startDate": active_maint.start_date.strftime("%Y-%m-%d")
        }
        
    data = serialize_vehicle(v)
    data.update({
        "totalFuelCost": fuel_cost,
        "totalMaintenanceCost": maint_cost,
        "totalOperationalCost": fuel_cost + maint_cost,
        "activeMaintenanceRecord": active_record
    })
    return success_response(data)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Fleet Manager", "Admin"]))
):
    existing = db.query(Vehicle).filter(Vehicle.registration_number == vehicle_in.registrationNumber).first()
    if existing:
        raise TransitOpsException("DUPLICATE_REGISTRATION", "Vehicle registration number already exists", 409)
        
    vehicle = Vehicle(
        registration_number=vehicle_in.registrationNumber,
        vehicle_name=vehicle_in.vehicleName,
        vehicle_model=vehicle_in.vehicleModel,
        vehicle_type=vehicle_in.vehicleType.upper(),
        max_load_capacity=vehicle_in.maxLoadCapacity,
        current_odometer=vehicle_in.currentOdometer,
        acquisition_cost=vehicle_in.acquisitionCost,
        region=vehicle_in.region,
        status="AVAILABLE",
        purchase_date=vehicle_in.purchaseDate,
        notes=vehicle_in.notes
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return success_response(serialize_vehicle(vehicle))

@router.put("/{vehicle_id}")
def update_vehicle(
    vehicle_id: str,
    vehicle_in: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Fleet Manager", "Admin"]))
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise TransitOpsException("NOT_FOUND", "Vehicle not found", 404)
        
    update_data = vehicle_in.dict(exclude_unset=True)
    
    # Validation: cannot change status directly
    if "status" in update_data:
        del update_data["status"]
        
    if "registrationNumber" in update_data:
        reg = update_data["registrationNumber"]
        if reg != v.registration_number:
            existing = db.query(Vehicle).filter(Vehicle.registration_number == reg).first()
            if existing:
                raise TransitOpsException("DUPLICATE_REGISTRATION", "Vehicle registration number already exists", 409)
            v.registration_number = reg
            
    if "vehicleName" in update_data:
        v.vehicle_name = update_data["vehicleName"]
    if "vehicleModel" in update_data:
        v.vehicle_model = update_data["vehicleModel"]
    if "vehicleType" in update_data:
        v.vehicle_type = update_data["vehicleType"].upper()
    if "maxLoadCapacity" in update_data:
        v.max_load_capacity = update_data["maxLoadCapacity"]
    if "currentOdometer" in update_data:
        v.current_odometer = update_data["currentOdometer"]
    if "acquisitionCost" in update_data:
        v.acquisition_cost = update_data["acquisitionCost"]
    if "region" in update_data:
        v.region = update_data["region"]
    if "purchaseDate" in update_data:
        v.purchase_date = update_data["purchaseDate"]
    if "notes" in update_data:
        v.notes = update_data["notes"]
        
    db.commit()
    db.refresh(v)
    return success_response(serialize_vehicle(v))

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Fleet Manager", "Admin"]))
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise TransitOpsException("NOT_FOUND", "Vehicle not found", 404)
        
    # Rule: only delete if no trips or maintenance records
    trip_count = len(v.trips)
    maint_count = len(v.maintenance_logs)
    
    if trip_count > 0 or maint_count > 0:
        raise TransitOpsException("CANNOT_DELETE", "Cannot delete vehicle with dependent trips or maintenance logs", 422)
        
    db.delete(v)
    db.commit()
    return success_response({"message": "Vehicle deleted successfully"})
