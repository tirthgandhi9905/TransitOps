from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.vehicle import VehicleResponse

class MaintenanceBase(BaseModel):
    vehicleId: str = Field(..., alias="vehicle_id")
    maintenanceType: str = Field(..., alias="maintenance_type")  # 'OIL_CHANGE', etc.
    description: Optional[str] = None
    cost: float = Field(default=0.0)
    vendor: Optional[str] = None
    status: str = "ACTIVE"  # 'ACTIVE', 'COMPLETED'
    startDate: datetime = Field(default_factory=datetime.utcnow, alias="start_date")
    endDate: Optional[datetime] = Field(default=None, alias="end_date")

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceResponse(MaintenanceBase):
    id: str
    createdAt: datetime = Field(..., alias="created_at")
    updatedAt: datetime = Field(..., alias="updated_at")
    vehicle: Optional[VehicleResponse] = None

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True
