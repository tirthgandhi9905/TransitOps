from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.fuel_expense import FuelLog, Expense
from app.schemas.fuel_expense import FuelLogCreate, FuelLogResponse, ExpenseCreate, ExpenseResponse
from app.core.rbac import RoleChecker, get_current_user

router = APIRouter(prefix="/fuel-expenses", tags=["fuel-expenses"])

# Fuel Logs
@router.get("/fuel", response_model=List[FuelLogResponse])
def list_fuel_logs(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(FuelLog).all()

@router.post("/fuel", response_model=FuelLogResponse, status_code=status.HTTP_201_CREATED)
def create_fuel_log(
    log_in: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Fleet Manager"]))
):
    log = FuelLog(**log_in.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


# Expenses
@router.get("/expenses", response_model=List[ExpenseResponse])
def list_expenses(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Expense).all()

@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Fleet Manager"]))
):
    expense = Expense(**expense_in.dict())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense
