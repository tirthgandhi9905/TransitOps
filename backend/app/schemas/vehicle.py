from pydantic import BaseModel, Field
from typing import Optional

class VehicleBase(BaseModel):
    registration_number: str
    name_model: str
    type: str
    max_load_capacity: float = Field(..., gt=0, description="Max load capacity in kg")
    odometer: float = Field(default=0.0, ge=0, description="Current odometer in km")
    acquisition_cost: float = Field(..., ge=0)
    status: str = "Available"  # 'Available', 'On Trip', 'In Shop', 'Retired'
    region: str

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    name_model: Optional[str] = None
    type: Optional[str] = None
    max_load_capacity: Optional[float] = None
    odometer: Optional[float] = None
    acquisition_cost: Optional[float] = None
    status: Optional[str] = None
    region: Optional[str] = None

class VehicleResponse(VehicleBase):
    id: int

    class Config:
        from_attributes = True
