from pydantic import BaseModel, Field
import datetime
from typing import Optional
from app.schemas.vehicle import VehicleResponse

class FuelLogBase(BaseModel):
    vehicle_id: int
    liters: float = Field(..., gt=0)
    cost: float = Field(..., ge=0)
    date: datetime.date

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogResponse(FuelLogBase):
    id: int
    vehicle: Optional[VehicleResponse] = None

    class Config:
        from_attributes = True


class ExpenseBase(BaseModel):
    vehicle_id: int
    description: str
    cost: float = Field(..., ge=0)
    category: str  # 'tolls', 'maintenance', 'other'
    date: datetime.date

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    vehicle: Optional[VehicleResponse] = None

    class Config:
        from_attributes = True
