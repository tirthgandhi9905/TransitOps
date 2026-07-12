from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    cargo_weight = Column(Float, nullable=False)  # in kg
    planned_distance = Column(Float, nullable=False)  # in km
    revenue = Column(Float, default=0.0, nullable=False)
    status = Column(String, default="Draft", nullable=False)  # 'Draft', 'Dispatched', 'Completed', 'Cancelled'
    
    # Entered when trip is completed
    actual_distance = Column(Float, nullable=True)  # in km
    fuel_consumed = Column(Float, nullable=True)  # in liters

    # Relationships
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
