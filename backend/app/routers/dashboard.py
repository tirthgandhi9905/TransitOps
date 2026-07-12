from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.cost_service import CostService
from app.core.rbac import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/kpis")
def get_kpis(
    vehicle_type: str = None,
    status: str = None,
    region: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return CostService.get_dashboard_kpis(db, vehicle_type, status, region)
