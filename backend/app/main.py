from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.database import engine, Base
from app.core.exceptions import TransitOpsException

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TransitOps API", version="1.0.0")

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(TransitOpsException)
def transitops_exception_handler(request: Request, exc: TransitOpsException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )

@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validation failed: " + str(exc.errors())
            }
        }
    )

@app.exception_handler(StarletteHTTPException)
def http_exception_handler(request: Request, exc: StarletteHTTPException):
    code = "NOT_FOUND" if exc.status_code == 404 else "INTERNAL_ERROR"
    if exc.status_code == 401:
        code = "INVALID_CREDENTIALS"
    elif exc.status_code == 403:
        code = "UNAUTHORIZED"
        
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": exc.detail
            }
        }
    )

@app.exception_handler(Exception)
def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An internal error occurred: " + str(exc)
            }
        }
    )

# Include routers
from app.routers import (
    auth_router, users_router, roles_router, vehicles_router,
    drivers_router, trips_router, maintenance_router, fuel_router,
    expenses_router, dashboard_router, reports_router, export_router
)

app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(roles_router, prefix="/api")
app.include_router(vehicles_router, prefix="/api")
app.include_router(drivers_router, prefix="/api")
app.include_router(trips_router, prefix="/api")
app.include_router(maintenance_router, prefix="/api")
app.include_router(fuel_router, prefix="/api")
app.include_router(expenses_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(export_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to TransitOps API"}
