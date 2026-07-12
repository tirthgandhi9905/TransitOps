from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.driver import Driver
from app.schemas.driver import DriverCreate, DriverUpdate, DriverResponse
from app.core.rbac import RoleChecker, get_current_user

router = APIRouter(prefix="/drivers", tags=["drivers"])

@router.get("", response_model=List[DriverResponse])
def list_drivers(
    status: str = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    query = db.query(Driver)
    if status:
        query = query.filter(Driver.status == status)
    return query.all()

@router.post("", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(
    driver_in: DriverCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(RoleChecker(["Safety Officer", "Fleet Manager"]))
):
    existing = db.query(Driver).filter(Driver.license_number == driver_in.license_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Driver license number must be unique")
        
    driver = Driver(**driver_in.dict())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

@router.get("/{driver_id}", response_model=DriverResponse)
def get_driver(driver_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.put("/{driver_id}", response_model=DriverResponse)
def update_driver(
    driver_id: int, 
    driver_in: DriverUpdate, 
    db: Session = Depends(get_db), 
    current_user = Depends(RoleChecker(["Safety Officer", "Fleet Manager"]))
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    update_data = driver_in.dict(exclude_unset=True)
    
    if "license_number" in update_data:
        if update_data["license_number"] != driver.license_number:
            existing = db.query(Driver).filter(Driver.license_number == update_data["license_number"]).first()
            if existing:
                raise HTTPException(status_code=400, detail="Driver license number must be unique")
                
    for field, value in update_data.items():
        setattr(driver, field, value)
        
    db.commit()
    db.refresh(driver)
    return driver

@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(
    driver_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(RoleChecker(["Safety Officer", "Fleet Manager"]))
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    db.delete(driver)
    db.commit()
    return
