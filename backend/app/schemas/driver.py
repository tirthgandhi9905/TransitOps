from pydantic import BaseModel, Field
import datetime
from typing import Optional

class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry: datetime.date
    contact: str
    safety_score: float = Field(default=100.0, ge=0, le=100)
    status: str = "Available"  # 'Available', 'On Trip', 'Off Duty', 'Suspended'

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_number: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry: Optional[datetime.date] = None
    contact: Optional[str] = None
    safety_score: Optional[float] = None
    status: Optional[str] = None

class DriverResponse(DriverBase):
    id: int

    class Config:
        from_attributes = True
