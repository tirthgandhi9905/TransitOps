from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    name_model = Column(String, nullable=False)
    type = Column(String, nullable=False)  # e.g., 'Van', 'Truck', 'Flatbed'
    max_load_capacity = Column(Float, nullable=False)  # in kg
    odometer = Column(Float, default=0.0, nullable=False)  # in km
    acquisition_cost = Column(Float, nullable=False)
    status = Column(String, default="Available", nullable=False)  # 'Available', 'On Trip', 'In Shop', 'Retired'
    region = Column(String, nullable=False)  # e.g., 'North', 'South', 'East', 'West'

    # Relationships
    trips = relationship("Trip", back_populates="vehicle")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")
    expenses = relationship("Expense", back_populates="vehicle")
