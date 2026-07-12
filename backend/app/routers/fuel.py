import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.fuel_expense import FuelLog
from app.models.vehicle import Vehicle
from app.schemas.fuel_expense import FuelLogCreate
from app.core.rbac import RoleChecker, get_current_user
from app.core.exceptions import TransitOpsException
from app.utils.api_response import success_response, success_list_response
from app.utils.pagination import apply_pagination_and_sorting
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter(prefix="/fuel", tags=["fuel"])

class FuelUpdate(BaseModel):
    vehicleId: Optional[str] = Field(default=None, alias="vehicle_id")
    tripId: Optional[str] = Field(default=None, alias="trip_id")
    fuelLiters: Optional[float] = Field(default=None, alias="fuel_liters")
    fuelCost: Optional[float] = Field(default=None, alias="fuel_cost")
    fuelStation: Optional[str] = Field(default=None, alias="fuel_station")
    date: Optional[datetime.datetime] = None

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

def serialize_fuel(f: FuelLog) -> dict:
    return {
        "id": f.id,
        "vehicleId": f.vehicle_id,
        "tripId": f.trip_id,
        "fuelLiters": float(f.fuel_liters),
        "fuelCost": float(f.fuel_cost),
        "fuelStation": f.fuel_station,
        "date": f.date.strftime("%Y-%m-%d"),
        "createdAt": f.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "vehicle": serialize_vehicle(f.vehicle)
    }

@router.get("")
def list_fuel_logs(
    page: int = 1,
    limit: int = 20,
    search: str = None,
    sortBy: str = "created_at",
    sortOrder: str = "desc",
    vehicleId: str = None,
    tripId: str = None,
    dateFrom: str = None,
    dateTo: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(FuelLog)
    if vehicleId:
        query = query.filter(FuelLog.vehicle_id == vehicleId)
    if tripId:
        query = query.filter(FuelLog.trip_id == tripId)
        
    if dateFrom:
        try:
            df = datetime.datetime.strptime(dateFrom, "%Y-%m-%d")
            query = query.filter(FuelLog.date >= df)
        except ValueError:
            pass
    if dateTo:
        try:
            dt = datetime.datetime.strptime(dateTo, "%Y-%m-%d") + datetime.timedelta(days=1)
            query = query.filter(FuelLog.date < dt)
        except ValueError:
            pass
            
    search_fields = ["fuel_station"]
    db_sort = "created_at"
    if sortBy == "date":
        db_sort = "date"
    elif sortBy == "fuelCost":
        db_sort = "fuel_cost"
        
    results, total = apply_pagination_and_sorting(
        query=query,
        model=FuelLog,
        page=page,
        limit=limit,
        search=search,
        search_fields=search_fields,
        sort_by=db_sort,
        sort_order=sortOrder
    )
    
    data = [serialize_fuel(f) for f in results]
    return success_list_response(data, total, page, limit)

@router.get("/{id}")
def get_fuel_log(id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    f = db.query(FuelLog).filter(FuelLog.id == id).first()
    if not f:
        raise TransitOpsException("NOT_FOUND", "Fuel log not found", 404)
    return success_response(serialize_fuel(f))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_fuel_log(
    log_in: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Fleet Manager", "Admin"]))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == log_in.vehicleId).first()
    if not vehicle:
        raise TransitOpsException("NOT_FOUND", "Vehicle not found", 404)
        
    fuel = FuelLog(
        vehicle_id=log_in.vehicleId,
        trip_id=log_in.tripId,
        fuel_liters=log_in.fuelLiters,
        fuel_cost=log_in.fuelCost,
        fuel_station=log_in.fuelStation,
        date=log_in.date
    )
    db.add(fuel)
    db.commit()
    db.refresh(fuel)
    return success_response(serialize_fuel(fuel))

@router.put("/{id}")
def update_fuel_log(
    id: str,
    log_in: FuelUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Fleet Manager", "Admin"]))
):
    f = db.query(FuelLog).filter(FuelLog.id == id).first()
    if not f:
        raise TransitOpsException("NOT_FOUND", "Fuel log not found", 404)
        
    update_data = log_in.dict(exclude_unset=True)
    if "vehicleId" in update_data:
        vehicle = db.query(Vehicle).filter(Vehicle.id == update_data["vehicleId"]).first()
        if not vehicle:
            raise TransitOpsException("NOT_FOUND", "Vehicle not found", 404)
        f.vehicle_id = update_data["vehicleId"]
        
    if "tripId" in update_data:
        f.trip_id = update_data["tripId"]
    if "fuelLiters" in update_data:
        f.fuel_liters = update_data["fuelLiters"]
    if "fuelCost" in update_data:
        f.fuel_cost = update_data["fuelCost"]
    if "fuelStation" in update_data:
        f.fuel_station = update_data["fuelStation"]
    if "date" in update_data:
        f.date = update_data["date"]
        
    db.commit()
    db.refresh(f)
    return success_response(serialize_fuel(f))

@router.delete("/{id}")
def delete_fuel_log(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Fleet Manager", "Admin"]))
):
    f = db.query(FuelLog).filter(FuelLog.id == id).first()
    if not f:
        raise TransitOpsException("NOT_FOUND", "Fuel log not found", 404)
    db.delete(f)
    db.commit()
    return success_response({"message": "Fuel log deleted successfully"})
