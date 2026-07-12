from sqlalchemy import Column, Integer, String, Float, Date
from sqlalchemy.orm import relationship
from app.database import Base

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_category = Column(String, nullable=False)  # e.g., 'Class A', 'Class B'
    license_expiry = Column(Date, nullable=False)
    contact = Column(String, nullable=False)
    safety_score = Column(Float, default=100.0, nullable=False)  # 0 to 100
    status = Column(String, default="Available", nullable=False)  # 'Available', 'On Trip', 'Off Duty', 'Suspended'

    # Relationships
    trips = relationship("Trip", back_populates="driver")
