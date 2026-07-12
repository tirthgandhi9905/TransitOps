import uuid
import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    maintenance_type = Column(String, nullable=False)  # 'OIL_CHANGE', 'TIRE_REPLACEMENT', etc.
    description = Column(String, nullable=True)
    cost = Column(Float, default=0.0, nullable=False)
    vendor = Column(String, nullable=True)
    status = Column(String, default="ACTIVE", nullable=False, index=True)  # 'ACTIVE', 'COMPLETED'
    start_date = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_logs")
