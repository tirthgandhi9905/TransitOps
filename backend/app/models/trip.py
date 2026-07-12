import uuid
import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Trip(Base):
    __tablename__ = "trips"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    trip_number = Column(String, unique=True, index=True, nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(String, ForeignKey("drivers.id"), nullable=False)
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    cargo_weight = Column(Float, nullable=False)  # in kg
    planned_distance = Column(Float, nullable=False)  # in km
    actual_distance = Column(Float, nullable=True)  # in km, filled on completion
    start_odometer = Column(Float, nullable=True)
    end_odometer = Column(Float, nullable=True)
    fuel_consumed = Column(Float, nullable=True)  # in liters, filled on completion
    revenue = Column(Float, default=0.0, nullable=True)
    status = Column(String, default="DRAFT", nullable=False, index=True)  # 'DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'
    notes = Column(String, nullable=True)
    dispatch_time = Column(DateTime, nullable=True)
    completion_time = Column(DateTime, nullable=True)
    created_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    created_by = relationship("User", back_populates="trips")
    fuel_logs = relationship("FuelLog", back_populates="trip")
