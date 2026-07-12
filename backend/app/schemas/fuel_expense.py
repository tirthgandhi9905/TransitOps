from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.vehicle import VehicleResponse

class FuelLogBase(BaseModel):
    vehicleId: str = Field(..., alias="vehicle_id")
    tripId: Optional[str] = Field(default=None, alias="trip_id")
    fuelLiters: float = Field(..., alias="fuel_liters")
    fuelCost: float = Field(..., alias="fuel_cost")
    fuelStation: Optional[str] = Field(default=None, alias="fuel_station")
    date: datetime

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogResponse(FuelLogBase):
    id: str
    createdAt: datetime = Field(..., alias="created_at")
    vehicle: Optional[VehicleResponse] = None

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True


class ExpenseBase(BaseModel):
    vehicleId: str = Field(..., alias="vehicle_id")
    tripId: Optional[str] = Field(default=None, alias="trip_id")
    expenseType: str = Field(..., alias="expense_type")  # 'TOLL', 'PARKING', 'REPAIR', 'SERVICE', 'INSURANCE', 'FINE', 'OTHER'
    amount: float
    description: Optional[str] = None
    expenseDate: datetime = Field(..., alias="expense_date")

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: str
    createdAt: datetime = Field(..., alias="created_at")
    vehicle: Optional[VehicleResponse] = None

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        from_attributes = True
        orm_mode = True
