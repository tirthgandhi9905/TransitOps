from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.vehicle import VehicleResponse
from app.schemas.driver import DriverResponse

class TripBase(BaseModel):
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float = Field(..., gt=0)
    planned_distance: float = Field(..., gt=0)
    revenue: float = Field(default=0.0, ge=0)
    status: str = "Draft"  # 'Draft', 'Dispatched', 'Completed', 'Cancelled'

class TripCreate(TripBase):
    pass

class TripCompleteRequest(BaseModel):
    actual_distance: float = Field(..., ge=0)
    fuel_consumed: float = Field(..., ge=0)
    fuel_cost_per_liter: Optional[float] = 1.50

class TripResponse(TripBase):
    id: int
    actual_distance: Optional[float] = None
    fuel_consumed: Optional[float] = None
    vehicle: Optional[VehicleResponse] = None
    driver: Optional[DriverResponse] = None

    class Config:
        from_attributes = True
