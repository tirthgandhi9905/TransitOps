import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.fuel_expense import Expense
from app.models.vehicle import Vehicle
from app.schemas.fuel_expense import ExpenseCreate
from app.core.rbac import RoleChecker, get_current_user
from app.core.exceptions import TransitOpsException
from app.utils.api_response import success_response, success_list_response
from app.utils.pagination import apply_pagination_and_sorting
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter(prefix="/expenses", tags=["expenses"])

class ExpenseUpdate(BaseModel):
    vehicleId: Optional[str] = Field(default=None, alias="vehicle_id")
    tripId: Optional[str] = Field(default=None, alias="trip_id")
    expenseType: Optional[str] = Field(default=None, alias="expense_type")
    amount: Optional[float] = None
    description: Optional[str] = None
    expenseDate: Optional[datetime.datetime] = Field(default=None, alias="expense_date")

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

def serialize_expense(e: Expense) -> dict:
    return {
        "id": e.id,
        "vehicleId": e.vehicle_id,
        "tripId": e.trip_id,
        "expenseType": e.expense_type,
        "amount": float(e.amount),
        "description": e.description,
        "expenseDate": e.expense_date.strftime("%Y-%m-%d"),
        "createdAt": e.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "vehicle": serialize_vehicle(e.vehicle)
    }

@router.get("")
def list_expenses(
    page: int = 1,
    limit: int = 20,
    search: str = None,
    sortBy: str = "created_at",
    sortOrder: str = "desc",
    vehicleId: str = None,
    tripId: str = None,
    expenseType: str = None,
    dateFrom: str = None,
    dateTo: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Expense)
    if vehicleId:
        query = query.filter(Expense.vehicle_id == vehicleId)
    if tripId:
        query = query.filter(Expense.trip_id == tripId)
    if expenseType:
        query = query.filter(Expense.expense_type == expenseType.upper())
        
    if dateFrom:
        try:
            df = datetime.datetime.strptime(dateFrom, "%Y-%m-%d")
            query = query.filter(Expense.expense_date >= df)
        except ValueError:
            pass
    if dateTo:
        try:
            dt = datetime.datetime.strptime(dateTo, "%Y-%m-%d") + datetime.timedelta(days=1)
            query = query.filter(Expense.expense_date < dt)
        except ValueError:
            pass
            
    search_fields = ["description"]
    db_sort = "created_at"
    if sortBy == "expenseDate":
        db_sort = "expense_date"
    elif sortBy == "amount":
        db_sort = "amount"
        
    results, total = apply_pagination_and_sorting(
        query=query,
        model=Expense,
        page=page,
        limit=limit,
        search=search,
        search_fields=search_fields,
        sort_by=db_sort,
        sort_order=sortOrder
    )
    
    data = [serialize_expense(e) for e in results]
    return success_list_response(data, total, page, limit)

@router.get("/{id}")
def get_expense(id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    e = db.query(Expense).filter(Expense.id == id).first()
    if not e:
        raise TransitOpsException("NOT_FOUND", "Expense not found", 404)
    return success_response(serialize_expense(e))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_expense(
    log_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Fleet Manager", "Admin"]))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == log_in.vehicleId).first()
    if not vehicle:
        raise TransitOpsException("NOT_FOUND", "Vehicle not found", 404)
        
    expense = Expense(
        vehicle_id=log_in.vehicleId,
        trip_id=log_in.tripId,
        expense_type=log_in.expenseType.upper(),
        amount=log_in.amount,
        description=log_in.description,
        expense_date=log_in.expenseDate
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return success_response(serialize_expense(expense))

@router.put("/{id}")
def update_expense(
    id: str,
    log_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Fleet Manager", "Admin"]))
):
    e = db.query(Expense).filter(Expense.id == id).first()
    if not e:
        raise TransitOpsException("NOT_FOUND", "Expense not found", 404)
        
    update_data = log_in.dict(exclude_unset=True)
    if "vehicleId" in update_data:
        vehicle = db.query(Vehicle).filter(Vehicle.id == update_data["vehicleId"]).first()
        if not vehicle:
            raise TransitOpsException("NOT_FOUND", "Vehicle not found", 404)
        e.vehicle_id = update_data["vehicleId"]
        
    if "tripId" in update_data:
        e.trip_id = update_data["tripId"]
    if "expenseType" in update_data:
        e.expense_type = update_data["expenseType"].upper()
    if "amount" in update_data:
        e.amount = update_data["amount"]
    if "description" in update_data:
        e.description = update_data["description"]
    if "expenseDate" in update_data:
        e.expense_date = update_data["expenseDate"]
        
    db.commit()
    db.refresh(e)
    return success_response(serialize_expense(e))

@router.delete("/{id}")
def delete_expense(
    id: str,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Fleet Manager", "Admin"]))
):
    e = db.query(Expense).filter(Expense.id == id).first()
    if not e:
        raise TransitOpsException("NOT_FOUND", "Expense not found", 404)
    db.delete(e)
    db.commit()
    return success_response({"message": "Expense deleted successfully"})
