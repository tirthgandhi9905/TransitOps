from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.trip import Trip
from app.schemas.trip import TripCreate, TripCompleteRequest, TripResponse
from app.services.trip_service import TripService
from app.core.exceptions import ValidationError
from app.core.rbac import RoleChecker, get_current_user

router = APIRouter(prefix="/trips", tags=["trips"])

@router.get("", response_model=List[TripResponse])
def list_trips(
    status: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Trip)
    if status:
        query = query.filter(Trip.status == status)
    return query.all()

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Driver", "Fleet Manager"]))
):
    try:
        trip = TripService.create_trip(
            db=db,
            source=trip_in.source,
            destination=trip_in.destination,
            vehicle_id=trip_in.vehicle_id,
            driver_id=trip_in.driver_id,
            cargo_weight=trip_in.cargo_weight,
            planned_distance=trip_in.planned_distance,
            revenue=trip_in.revenue
        )
        return trip
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{trip_id}/dispatch", response_model=TripResponse)
def dispatch_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Driver", "Fleet Manager"]))
):
    try:
        trip = TripService.dispatch_trip(db, trip_id)
        return trip
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{trip_id}/complete", response_model=TripResponse)
def complete_trip(
    trip_id: int,
    payload: TripCompleteRequest,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Driver", "Fleet Manager"]))
):
    try:
        trip = TripService.complete_trip(
            db=db,
            trip_id=trip_id,
            actual_distance=payload.actual_distance,
            fuel_consumed=payload.fuel_consumed,
            fuel_cost_per_liter=payload.fuel_cost_per_liter or 1.50
        )
        return trip
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{trip_id}/cancel", response_model=TripResponse)
def cancel_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Driver", "Fleet Manager"]))
):
    try:
        trip = TripService.cancel_trip(db, trip_id)
        return trip
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
