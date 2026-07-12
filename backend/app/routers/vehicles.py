from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.core.rbac import RoleChecker, get_current_user

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

@router.get("", response_model=List[VehicleResponse])
def list_vehicles(
    type: str = None, 
    status: str = None, 
    region: str = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    query = db.query(Vehicle)
    if type:
        query = query.filter(Vehicle.type == type)
    if status:
        query = query.filter(Vehicle.status == status)
    if region:
        query = query.filter(Vehicle.region == region)
    return query.all()

@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(RoleChecker(["Fleet Manager"]))
):
    # Rule 1: Vehicle registration number must be unique
    existing = db.query(Vehicle).filter(Vehicle.registration_number == vehicle_in.registration_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle registration number must be unique")
    
    vehicle = Vehicle(**vehicle_in.dict())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int, 
    vehicle_in: VehicleUpdate, 
    db: Session = Depends(get_db), 
    current_user = Depends(RoleChecker(["Fleet Manager"]))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    update_data = vehicle_in.dict(exclude_unset=True)
    
    if "registration_number" in update_data:
        if update_data["registration_number"] != vehicle.registration_number:
            existing = db.query(Vehicle).filter(Vehicle.registration_number == update_data["registration_number"]).first()
            if existing:
                raise HTTPException(status_code=400, detail="Vehicle registration number must be unique")
                
    for field, value in update_data.items():
        setattr(vehicle, field, value)
        
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(RoleChecker(["Fleet Manager"]))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db.delete(vehicle)
    db.commit()
    return
