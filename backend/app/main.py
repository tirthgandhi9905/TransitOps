from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.core.exceptions import ValidationError, PermissionDeniedError

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TransitOps API", version="1.0.0")

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon/local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(ValidationError)
def validation_error_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=400,
        content={"detail": exc.message}
    )

@app.exception_handler(PermissionDeniedError)
def permission_denied_handler(request: Request, exc: PermissionDeniedError):
    return JSONResponse(
        status_code=403,
        content={"detail": exc.message}
    )

# Include routers
from app.routers import (
    auth_router, vehicles_router, drivers_router,
    trips_router, maintenance_router, fuel_expenses_router,
    dashboard_router, reports_router
)

app.include_router(auth_router, prefix="/api")
app.include_router(vehicles_router, prefix="/api")
app.include_router(drivers_router, prefix="/api")
app.include_router(trips_router, prefix="/api")
app.include_router(maintenance_router, prefix="/api")
app.include_router(fuel_expenses_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(reports_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to TransitOps API"}
