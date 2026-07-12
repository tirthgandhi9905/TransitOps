from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.cost_service import CostService
from app.core.rbac import get_current_user
from app.utils.api_response import success_response

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/kpis")
def get_kpis(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    kpis = CostService.get_dashboard_kpis(db)
    return success_response(kpis)

@router.get("/alerts")
def get_alerts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    alerts = CostService.get_dashboard_alerts(db)
    return success_response(alerts)

@router.get("/charts")
def get_charts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    charts = CostService.get_dashboard_charts(db)
    return success_response(charts)
