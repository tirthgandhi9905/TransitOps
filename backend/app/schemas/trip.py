from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.vehicle import VehicleResponse
from app.schemas.driver import DriverResponse

class TripBase(BaseModel):
    vehicleId: str = Field(..., alias="vehicle_id")
    driverId: str = Field(..., alias="driver_id")
    source: str
    destination: str
    cargoWeight: float = Field(..., alias="cargo_weight")
    plannedDistance: float = Field(..., alias="planned_distance")
    revenue: Optional[float] = Field(default=0.0)
    notes: Optional[str] = None
    status: str = "DRAFT"

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    vehicleId: Optional[str] = Field(default=None, alias="vehicle_id")
    driverId: Optional[str] = Field(default=None, alias="driver_id")
    source: Optional[str] = None
    destination: Optional[str] = None
    cargoWeight: Optional[float] = Field(default=None, alias="cargo_weight")
    plannedDistance: Optional[float] = Field(default=None, alias="planned_distance")
    revenue: Optional[float] = None
    notes: Optional[str] = None

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True

class TripCompleteRequest(BaseModel):
    endOdometer: float = Field(..., alias="end_odometer")
    fuelConsumed: float = Field(..., alias="fuel_consumed")
    actualDistance: float = Field(..., alias="actual_distance")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True

class TripResponse(TripBase):
    id: str
    tripNumber: str = Field(..., alias="trip_number")
    actualDistance: Optional[float] = Field(default=None, alias="actual_distance")
    startOdometer: Optional[float] = Field(default=None, alias="start_odometer")
    endOdometer: Optional[float] = Field(default=None, alias="end_odometer")
    fuelConsumed: Optional[float] = Field(default=None, alias="fuel_consumed")
    dispatchTime: Optional[datetime] = Field(default=None, alias="dispatch_time")
    completionTime: Optional[datetime] = Field(default=None, alias="completion_time")
    createdById: str = Field(..., alias="created_by_id")
    createdAt: datetime = Field(..., alias="created_at")
    updatedAt: datetime = Field(..., alias="updated_at")
    
    vehicle: Optional[VehicleResponse] = None
    driver: Optional[DriverResponse] = None

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True
