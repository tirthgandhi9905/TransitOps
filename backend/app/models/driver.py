import uuid
import datetime
from sqlalchemy import Column, String, Float, DateTime, Date
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_category = Column(String, nullable=False)  # 'A', 'B', 'C', 'D', 'E'
    license_expiry = Column(Date, nullable=False, index=True)
    phone = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    safety_score = Column(Float, default=10.0, nullable=False)  # 0.0 to 10.0
    status = Column(String, default="AVAILABLE", nullable=False, index=True)  # 'AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    trips = relationship("Trip", back_populates="driver")
