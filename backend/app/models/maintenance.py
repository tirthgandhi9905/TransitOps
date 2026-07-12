from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.database import Base

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    description = Column(String, nullable=False)
    cost = Column(Float, default=0.0, nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, default="Active", nullable=False)  # 'Active', 'Closed'

    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_logs")
