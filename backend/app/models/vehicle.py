import uuid
import datetime
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    vehicle_name = Column(String, nullable=False)
    vehicle_model = Column(String, nullable=False)
    vehicle_type = Column(String, nullable=False)  # 'VAN', 'TRUCK', 'SEDAN', 'BIKE', 'BUS', 'PICKUP'
    max_load_capacity = Column(Float, nullable=False)  # in kg
    current_odometer = Column(Float, default=0.0, nullable=False)  # in km
    acquisition_cost = Column(Float, nullable=False)
    region = Column(String, nullable=True, index=True)
    status = Column(String, default="AVAILABLE", nullable=False, index=True)  # 'AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'
    purchase_date = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    trips = relationship("Trip", back_populates="vehicle")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")
    expenses = relationship("Expense", back_populates="vehicle")
