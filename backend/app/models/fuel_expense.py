import uuid
import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=True)
    fuel_liters = Column(Float, nullable=False)
    fuel_cost = Column(Float, nullable=False)
    fuel_station = Column(String, nullable=True)
    date = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="fuel_logs")
    trip = relationship("Trip", back_populates="fuel_logs")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=True)
    expense_type = Column(String, nullable=False, index=True)  # 'TOLL', 'PARKING', 'REPAIR', 'SERVICE', 'INSURANCE', 'FINE', 'OTHER'
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    expense_date = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="expenses")
