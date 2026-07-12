from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.cost_service import CostService
from app.core.rbac import RoleChecker
from app.utils.api_response import success_response

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/fuel-efficiency")
def get_fuel_efficiency(
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Safety Officer", "Fleet Manager", "Admin"]))
):
    report = CostService.get_fuel_efficiency_report(db)
    return success_response(report)

@router.get("/operational-cost")
def get_operational_cost(
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Safety Officer", "Fleet Manager", "Admin"]))
):
    report = CostService.get_operational_cost_report(db)
    return success_response(report)

@router.get("/vehicle-roi")
def get_vehicle_roi(
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Safety Officer", "Fleet Manager", "Admin"]))
):
    report = CostService.get_vehicle_roi_report(db)
    return success_response(report)

@router.get("/fleet-utilization")
def get_fleet_utilization(
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Safety Officer", "Fleet Manager", "Admin"]))
):
    report = CostService.get_fleet_utilization_report(db)
    return success_response(report)
