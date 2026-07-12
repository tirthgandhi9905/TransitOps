import datetime
from sqlalchemy.orm import Session
from app.models.maintenance import MaintenanceLog
from app.models.vehicle import Vehicle
from app.core.exceptions import TransitOpsException

class MaintenanceService:
    @staticmethod
    def create_maintenance_log(db: Session, vehicle_id: str, maintenance_type: str, description: str, cost: float, vendor: str, start_date: datetime.date) -> MaintenanceLog:
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise TransitOpsException("NOT_FOUND", "Vehicle not found", 404)
        
        if vehicle.status == "RETIRED":
            raise TransitOpsException("INVALID_TRANSITION", "Cannot service a retired vehicle", 422)
            
        # Rule: check if vehicle has an active log
        active_log = db.query(MaintenanceLog).filter(
            MaintenanceLog.vehicle_id == vehicle_id,
            MaintenanceLog.status == "ACTIVE"
        ).first()
        if active_log:
            raise TransitOpsException("MAINTENANCE_ALREADY_ACTIVE", "Vehicle already has an active maintenance log", 422)
            
        # Set vehicle status to IN_SHOP
        vehicle.status = "IN_SHOP"
        
        # Create log
        log = MaintenanceLog(
            vehicle_id=vehicle_id,
            maintenance_type=maintenance_type,
            description=description,
            cost=cost,
            vendor=vendor,
            status="ACTIVE",
            start_date=start_date or datetime.datetime.utcnow()
        )
        
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def close_maintenance_log(db: Session, log_id: str) -> MaintenanceLog:
        log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
        if not log:
            raise TransitOpsException("NOT_FOUND", "Maintenance log not found", 404)
            
        if log.status == "COMPLETED":
            raise TransitOpsException("INVALID_TRANSITION", "Maintenance record is already closed", 422)
            
        vehicle = db.query(Vehicle).filter(Vehicle.id == log.vehicle_id).first()
        
        # Close log
        log.status = "COMPLETED"
        log.end_date = datetime.datetime.utcnow()
        
        # Restore vehicle state to AVAILABLE (unless RETIRED)
        if vehicle and vehicle.status == "IN_SHOP":
            vehicle.status = "AVAILABLE"
            
        db.commit()
        db.refresh(log)
        return log
