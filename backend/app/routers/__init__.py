from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.roles import router as roles_router
from app.routers.vehicles import router as vehicles_router
from app.routers.drivers import router as drivers_router
from app.routers.trips import router as trips_router
from app.routers.maintenance import router as maintenance_router
from app.routers.fuel import router as fuel_router
from app.routers.expenses import router as expenses_router
from app.routers.dashboard import router as dashboard_router
from app.routers.reports import router as reports_router
from app.routers.export import router as export_router

__all__ = [
    "auth_router", "users_router", "roles_router", "vehicles_router", 
    "drivers_router", "trips_router", "maintenance_router", "fuel_router", 
    "expenses_router", "dashboard_router", "reports_router", "export_router"
]
