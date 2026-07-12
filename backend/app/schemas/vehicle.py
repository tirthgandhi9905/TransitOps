from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class VehicleBase(BaseModel):
    registrationNumber: str = Field(..., alias="registration_number")
    vehicleName: str = Field(..., alias="vehicle_name")
    vehicleModel: str = Field(..., alias="vehicle_model")
    vehicleType: str = Field(..., alias="vehicle_type") # 'VAN', 'TRUCK', 'SEDAN', 'BIKE', 'BUS', 'PICKUP'
    maxLoadCapacity: float = Field(..., alias="max_load_capacity")
    currentOdometer: float = Field(default=0.0, alias="current_odometer")
    acquisitionCost: float = Field(..., alias="acquisition_cost")
    region: Optional[str] = None
    status: str = "AVAILABLE"
    purchaseDate: Optional[datetime] = Field(default=None, alias="purchase_date")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    registrationNumber: Optional[str] = Field(default=None, alias="registration_number")
    vehicleName: Optional[str] = Field(default=None, alias="vehicle_name")
    vehicleModel: Optional[str] = Field(default=None, alias="vehicle_model")
    vehicleType: Optional[str] = Field(default=None, alias="vehicle_type")
    maxLoadCapacity: Optional[float] = Field(default=None, alias="max_load_capacity")
    currentOdometer: Optional[float] = Field(default=None, alias="current_odometer")
    acquisitionCost: Optional[float] = Field(default=None, alias="acquisition_cost")
    region: Optional[str] = None
    status: Optional[str] = None
    purchaseDate: Optional[datetime] = Field(default=None, alias="purchase_date")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True

class VehicleResponse(VehicleBase):
    id: str
    createdAt: datetime = Field(..., alias="created_at")
    updatedAt: datetime = Field(..., alias="updated_at")

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True

class VehicleDetailResponse(VehicleResponse):
    totalFuelCost: float = 0.0
    totalMaintenanceCost: float = 0.0
    totalOperationalCost: float = 0.0
    activeMaintenanceRecord: Optional[dict] = None
