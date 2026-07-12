import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.schemas.trip import TripCreate, TripUpdate, TripCompleteRequest
from app.services.trip_service import TripService
from app.core.rbac import RoleChecker, get_current_user
from app.core.exceptions import TransitOpsException
from app.utils.api_response import success_response, success_list_response
from app.utils.pagination import apply_pagination_and_sorting

router = APIRouter(prefix="/trips", tags=["trips"])

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

def serialize_driver(d: Driver) -> dict:
    if not d:
        return None
    return {
        "id": d.id,
        "name": d.name,
        "licenseNumber": d.license_number,
        "licenseCategory": d.license_category,
        "licenseExpiry": d.license_expiry.strftime("%Y-%m-%d"),
        "phone": d.phone,
        "email": d.email,
        "safetyScore": float(d.safety_score),
        "status": d.status,
        "notes": d.notes
    }

def serialize_trip(t: Trip) -> dict:
    return {
        "id": t.id,
        "tripNumber": t.trip_number,
        "vehicleId": t.vehicle_id,
        "driverId": t.driver_id,
        "source": t.source,
        "destination": t.destination,
        "cargoWeight": float(t.cargo_weight),
        "plannedDistance": float(t.planned_distance),
        "actualDistance": float(t.actual_distance) if t.actual_distance is not None else None,
        "startOdometer": float(t.start_odometer) if t.start_odometer is not None else None,
        "endOdometer": float(t.end_odometer) if t.end_odometer is not None else None,
        "fuelConsumed": float(t.fuel_consumed) if t.fuel_consumed is not None else None,
        "revenue": float(t.revenue or 0.0),
        "status": t.status,
        "notes": t.notes,
        "dispatchTime": t.dispatch_time.strftime("%Y-%m-%d %H:%M:%S") if t.dispatch_time else None,
        "completionTime": t.completion_time.strftime("%Y-%m-%d %H:%M:%S") if t.completion_time else None,
        "createdById": t.created_by_id,
        "createdAt": t.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "updatedAt": t.updated_at.strftime("%Y-%m-%d %H:%M:%S"),
        "vehicle": serialize_vehicle(t.vehicle),
        "driver": serialize_driver(t.driver)
    }

@router.get("")
def list_trips(
    page: int = 1,
    limit: int = 20,
    search: str = None,
    sortBy: str = "created_at",
    sortOrder: str = "desc",
    status: str = None,
    vehicleId: str = None,
    driverId: str = None,
    dateFrom: str = None,
    dateTo: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Trip)
    if status:
        query = query.filter(Trip.status == status.upper())
    if vehicleId:
        query = query.filter(Trip.vehicle_id == vehicleId)
    if driverId:
        query = query.filter(Trip.driver_id == driverId)
        
    if dateFrom:
        try:
            df = datetime.datetime.strptime(dateFrom, "%Y-%m-%d")
            query = query.filter(Trip.created_at >= df)
        except ValueError:
            pass
    if dateTo:
        try:
            dt = datetime.datetime.strptime(dateTo, "%Y-%m-%d") + datetime.timedelta(days=1)
            query = query.filter(Trip.created_at < dt)
        except ValueError:
            pass
            
    search_fields = ["trip_number", "source", "destination"]
    db_sort = "created_at"
    if sortBy == "tripNumber":
        db_sort = "trip_number"
    elif sortBy == "plannedDistance":
        db_sort = "planned_distance"
        
    results, total = apply_pagination_and_sorting(
        query=query,
        model=Trip,
        page=page,
        limit=limit,
        search=search,
        search_fields=search_fields,
        sort_by=db_sort,
        sort_order=sortOrder
    )
    
    data = [serialize_trip(t) for t in results]
    return success_list_response(data, total, page, limit)

@router.get("/{trip_id}")
def get_trip(trip_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    t = db.query(Trip).filter(Trip.id == trip_id).first()
    if not t:
        raise TransitOpsException("NOT_FOUND", "Trip not found", 404)
    return success_response(serialize_trip(t))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Dispatcher", "Admin"]))
):
    trip = TripService.create_trip(
        db=db,
        created_by_id=current_user.id,
        vehicle_id=trip_in.vehicleId,
        driver_id=trip_in.driverId,
        source=trip_in.source,
        destination=trip_in.destination,
        cargo_weight=trip_in.cargoWeight,
        planned_distance=trip_in.plannedDistance,
        revenue=trip_in.revenue or 0.0,
        notes=trip_in.notes
    )
    return success_response(serialize_trip(trip))

@router.put("/{trip_id}")
def update_trip(
    trip_id: str,
    trip_in: TripUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Dispatcher", "Admin"]))
):
    t = db.query(Trip).filter(Trip.id == trip_id).first()
    if not t:
        raise TransitOpsException("NOT_FOUND", "Trip not found", 404)
        
    # Rule: only update DRAFT trips
    if t.status != "DRAFT":
        raise TransitOpsException("INVALID_TRANSITION", f"Only DRAFT trips can be updated (current: {t.status})", 422)
        
    update_data = trip_in.dict(exclude_unset=True)
    
    # re-validate assignment if vehicle or driver changes
    new_v = update_data.get("vehicleId", t.vehicle_id)
    new_d = update_data.get("driverId", t.driver_id)
    new_w = update_data.get("cargoWeight", t.cargo_weight)
    
    if new_v != t.vehicle_id or new_d != t.driver_id or new_w != t.cargo_weight:
        # Recheck constraints
        TripService.validate_trip_assignment(db, new_v, new_d, new_w)
        
    if "vehicleId" in update_data:
        t.vehicle_id = update_data["vehicleId"]
    if "driverId" in update_data:
        t.driver_id = update_data["driverId"]
    if "source" in update_data:
        t.source = update_data["source"]
    if "destination" in update_data:
        t.destination = update_data["destination"]
    if "cargoWeight" in update_data:
        t.cargo_weight = update_data["cargoWeight"]
    if "plannedDistance" in update_data:
        t.planned_distance = update_data["plannedDistance"]
    if "revenue" in update_data:
        t.revenue = update_data["revenue"]
    if "notes" in update_data:
        t.notes = update_data["notes"]
        
    db.commit()
    db.refresh(t)
    return success_response(serialize_trip(t))

@router.delete("/{trip_id}")
def delete_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Dispatcher", "Admin"]))
):
    t = db.query(Trip).filter(Trip.id == trip_id).first()
    if not t:
        raise TransitOpsException("NOT_FOUND", "Trip not found", 404)
        
    # Rule: only delete DRAFT trips
    if t.status != "DRAFT":
        raise TransitOpsException("INVALID_TRANSITION", f"Only DRAFT trips can be deleted (current: {t.status})", 422)
        
    db.delete(t)
    db.commit()
    return success_response({"message": "Trip deleted successfully"})


# --- Transition routes ---
@router.post("/{trip_id}/dispatch")
def dispatch_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Dispatcher", "Admin"]))
):
    trip = TripService.dispatch_trip(db, trip_id)
    return success_response(serialize_trip(trip))

@router.post("/{trip_id}/complete")
def complete_trip(
    trip_id: str,
    payload: TripCompleteRequest,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Dispatcher", "Admin"]))
):
    trip = TripService.complete_trip(
        db=db,
        trip_id=trip_id,
        end_odometer=payload.endOdometer,
        fuel_consumed=payload.fuelConsumed,
        actual_distance=payload.actualDistance,
        notes=payload.notes
    )
    return success_response(serialize_trip(trip))

@router.post("/{trip_id}/cancel")
def cancel_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Dispatcher", "Admin"]))
):
    trip = TripService.cancel_trip(db, trip_id)
    return success_response(serialize_trip(trip))
