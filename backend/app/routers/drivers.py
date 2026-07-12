import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.driver import Driver
from app.schemas.driver import DriverCreate, DriverUpdate
from app.core.rbac import RoleChecker, get_current_user
from app.core.exceptions import TransitOpsException
from app.utils.api_response import success_response, success_list_response
from app.utils.pagination import apply_pagination_and_sorting

router = APIRouter(prefix="/drivers", tags=["drivers"])

def serialize_driver(d: Driver) -> dict:
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
        "notes": d.notes,
        "createdAt": d.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "updatedAt": d.updated_at.strftime("%Y-%m-%d %H:%M:%S")
    }

@router.get("/available")
def get_available_drivers(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    today = datetime.date.today()
    drivers = db.query(Driver).filter(
        Driver.status == "AVAILABLE",
        Driver.license_expiry > today
    ).all()
    data = [serialize_driver(d) for d in drivers]
    return success_response(data)

@router.get("/expiring-soon")
def get_expiring_soon_drivers(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    today = datetime.date.today()
    thirty_days_later = today + datetime.timedelta(days=30)
    drivers = db.query(Driver).filter(
        Driver.license_expiry >= today,
        Driver.license_expiry <= thirty_days_later
    ).all()
    data = [serialize_driver(d) for d in drivers]
    return success_response(data)

@router.get("")
def list_drivers(
    page: int = 1,
    limit: int = 20,
    search: str = None,
    sortBy: str = "created_at",
    sortOrder: str = "desc",
    status: str = None,
    licenseCategory: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Driver)
    if status:
        query = query.filter(Driver.status == status.upper())
    if licenseCategory:
        query = query.filter(Driver.license_category == licenseCategory.upper())
        
    search_fields = ["name", "license_number", "phone"]
    db_sort = "created_at"
    if sortBy == "licenseExpiry":
        db_sort = "license_expiry"
    elif sortBy == "safetyScore":
        db_sort = "safety_score"
    elif sortBy == "name":
        db_sort = "name"
        
    results, total = apply_pagination_and_sorting(
        query=query,
        model=Driver,
        page=page,
        limit=limit,
        search=search,
        search_fields=search_fields,
        sort_by=db_sort,
        sort_order=sortOrder
    )
    
    data = [serialize_driver(d) for d in results]
    return success_list_response(data, total, page, limit)

@router.get("/{driver_id}")
def get_driver(driver_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    d = db.query(Driver).filter(Driver.id == driver_id).first()
    if not d:
        raise TransitOpsException("NOT_FOUND", "Driver not found", 404)
    return success_response(serialize_driver(d))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_driver(
    driver_in: DriverCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Safety Officer", "Admin"]))
):
    existing = db.query(Driver).filter(Driver.license_number == driver_in.licenseNumber).first()
    if existing:
        raise TransitOpsException("DUPLICATE_LICENSE", "Driver license number already exists", 409)
        
    driver = Driver(
        name=driver_in.name,
        license_number=driver_in.licenseNumber,
        license_category=driver_in.licenseCategory.upper(),
        license_expiry=driver_in.licenseExpiry,
        phone=driver_in.phone,
        email=driver_in.email,
        safety_score=driver_in.safetyScore,
        status="AVAILABLE",
        notes=driver_in.notes
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return success_response(serialize_driver(driver))

@router.put("/{driver_id}")
def update_driver(
    driver_id: str,
    driver_in: DriverUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Safety Officer", "Admin"]))
):
    d = db.query(Driver).filter(Driver.id == driver_id).first()
    if not d:
        raise TransitOpsException("NOT_FOUND", "Driver not found", 404)
        
    update_data = driver_in.dict(exclude_unset=True)
    if "licenseNumber" in update_data:
        lic = update_data["licenseNumber"]
        if lic != d.license_number:
            existing = db.query(Driver).filter(Driver.license_number == lic).first()
            if existing:
                raise TransitOpsException("DUPLICATE_LICENSE", "Driver license number already exists", 409)
            d.license_number = lic
            
    if "name" in update_data:
        d.name = update_data["name"]
    if "licenseCategory" in update_data:
        d.license_category = update_data["licenseCategory"].upper()
    if "licenseExpiry" in update_data:
        d.license_expiry = update_data["licenseExpiry"]
    if "phone" in update_data:
        d.phone = update_data["phone"]
    if "email" in update_data:
        d.email = update_data["email"]
    if "safetyScore" in update_data:
        d.safety_score = update_data["safetyScore"]
    if "status" in update_data:
        d.status = update_data["status"].upper()
    if "notes" in update_data:
        d.notes = update_data["notes"]
        
    db.commit()
    db.refresh(d)
    return success_response(serialize_driver(d))

@router.delete("/{driver_id}")
def delete_driver(
    driver_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Safety Officer", "Admin"]))
):
    d = db.query(Driver).filter(Driver.id == driver_id).first()
    if not d:
        raise TransitOpsException("NOT_FOUND", "Driver not found", 404)
        
    if len(d.trips) > 0:
        raise TransitOpsException("CANNOT_DELETE", "Cannot delete driver with dependent trips", 422)
        
    db.delete(d)
    db.commit()
    return success_response({"message": "Driver deleted successfully"})
