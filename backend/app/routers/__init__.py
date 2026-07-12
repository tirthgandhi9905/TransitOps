from app.routers.auth import router as auth_router
from app.routers.vehicles import router as vehicles_router
from app.routers.drivers import router as drivers_router
from app.routers.trips import router as trips_router
from app.routers.maintenance import router as maintenance_router
from app.routers.fuel_expenses import router as fuel_expenses_router
from app.routers.dashboard import router as dashboard_router
from app.routers.reports import router as reports_router

__all__ = [
    "auth_router", "vehicles_router", "drivers_router",
    "trips_router", "maintenance_router", "fuel_expenses_router",
    "dashboard_router", "reports_router"
]
