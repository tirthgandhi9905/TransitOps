from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date

class DriverBase(BaseModel):
    name: str
    licenseNumber: str = Field(..., alias="license_number")
    licenseCategory: str = Field(..., alias="license_category")  # 'A', 'B', 'C', 'D', 'E'
    licenseExpiry: date = Field(..., alias="license_expiry")
    phone: str
    email: Optional[str] = None
    safetyScore: float = Field(default=10.0, alias="safety_score")
    status: str = "AVAILABLE"  # 'AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'
    notes: Optional[str] = None

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    licenseNumber: Optional[str] = Field(default=None, alias="license_number")
    licenseCategory: Optional[str] = Field(default=None, alias="license_category")
    licenseExpiry: Optional[date] = Field(default=None, alias="license_expiry")
    phone: Optional[str] = None
    email: Optional[str] = None
    safetyScore: Optional[float] = Field(default=None, alias="safety_score")
    status: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True

class DriverResponse(DriverBase):
    id: str
    createdAt: datetime = Field(..., alias="created_at")
    updatedAt: datetime = Field(..., alias="updated_at")

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True
