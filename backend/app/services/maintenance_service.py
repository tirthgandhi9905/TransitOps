import datetime
from sqlalchemy.orm import Session
from app.models.maintenance import MaintenanceLog
from app.models.vehicle import Vehicle
from app.models.fuel_expense import Expense
from app.core.exceptions import ValidationError

class MaintenanceService:
    @staticmethod
    def create_maintenance_log(db: Session, vehicle_id: int, description: str, cost: float, date: datetime.date) -> MaintenanceLog:
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise ValidationError("Vehicle not found")
        
        if vehicle.status == "Retired":
            raise ValidationError("Cannot create maintenance logs for a retired vehicle")
        if vehicle.status == "On Trip":
            raise ValidationError("Vehicle is currently on a trip and cannot be sent to the shop")
        
        # Rule 9: Creating an active maintenance record automatically sets vehicle to In Shop
        log = MaintenanceLog(
            vehicle_id=vehicle_id,
            description=description,
            cost=cost,
            date=date,
            status="Active"
        )
        vehicle.status = "In Shop"
        
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def close_maintenance_log(db: Session, log_id: int) -> MaintenanceLog:
        log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
        if not log:
            raise ValidationError("Maintenance log not found")
        
        if log.status == "Closed":
            raise ValidationError("Maintenance log is already closed")
        
        vehicle = db.query(Vehicle).filter(Vehicle.id == log.vehicle_id).first()
        
        # Close the log
        log.status = "Closed"
        
        # Rule 10: Close maintenance -> restore vehicle to Available (unless retired)
        if vehicle:
            if vehicle.status == "In Shop":
                vehicle.status = "Available"
                
            # Log the maintenance cost into the Expense table under the 'maintenance' category
            if log.cost > 0:
                expense = Expense(
                    vehicle_id=vehicle.id,
                    description=f"Maintenance: {log.description}",
                    cost=log.cost,
                    category="maintenance",
                    date=datetime.date.today()
                )
                db.add(expense)
        
        db.commit()
        db.refresh(log)
        return log
