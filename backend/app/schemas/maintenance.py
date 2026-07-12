from pydantic import BaseModel, Field
import datetime
from typing import Optional
from app.schemas.vehicle import VehicleResponse

class MaintenanceBase(BaseModel):
    vehicle_id: int
    description: str
    cost: float = Field(default=0.0, ge=0)
    date: datetime.date
    status: str = "Active"  # 'Active', 'Closed'

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceResponse(MaintenanceBase):
    id: int
    vehicle: Optional[VehicleResponse] = None

    class Config:
        from_attributes = True
