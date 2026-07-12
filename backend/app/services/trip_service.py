import datetime
from sqlalchemy.orm import Session
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.fuel_expense import FuelLog
from app.core.exceptions import ValidationError

class TripService:
    @staticmethod
    def validate_trip_assignment(db: Session, vehicle_id: int, driver_id: int, cargo_weight: float):
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise ValidationError("Vehicle not found")
        
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise ValidationError("Driver not found")
        
        # Rule 2: Retired or In Shop vehicles cannot be assigned
        if vehicle.status in ["Retired", "In Shop"]:
            raise ValidationError(f"Vehicle is in status '{vehicle.status}' and cannot be dispatched")
        
        # Rule 3: Expired licenses or Suspended drivers cannot be assigned
        if driver.status == "Suspended":
            raise ValidationError("Driver is suspended")
        if driver.license_expiry < datetime.date.today():
            raise ValidationError(f"Driver's license expired on {driver.license_expiry}")
        
        # Rule 4: Already On Trip check
        if vehicle.status == "On Trip":
            raise ValidationError("Vehicle is already assigned to an active trip")
        if driver.status == "On Trip":
            raise ValidationError("Driver is already assigned to an active trip")
        
        # Rule 5: Cargo weight must not exceed max load capacity
        if cargo_weight > vehicle.max_load_capacity:
            raise ValidationError(
                f"Cargo weight ({cargo_weight}kg) exceeds vehicle maximum capacity ({vehicle.max_load_capacity}kg)"
            )
        
        return vehicle, driver

    @staticmethod
    def create_trip(db: Session, source: str, destination: str, vehicle_id: int, driver_id: int, cargo_weight: float, planned_distance: float, revenue: float = 0.0) -> Trip:
        # Validate logic upon draft creation
        TripService.validate_trip_assignment(db, vehicle_id, driver_id, cargo_weight)
        
        trip = Trip(
            source=source,
            destination=destination,
            vehicle_id=vehicle_id,
            driver_id=driver_id,
            cargo_weight=cargo_weight,
            planned_distance=planned_distance,
            revenue=revenue,
            status="Draft"
        )
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip

    @staticmethod
    def dispatch_trip(db: Session, trip_id: int) -> Trip:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise ValidationError("Trip not found")
        
        if trip.status != "Draft":
            raise ValidationError("Only Draft trips can be dispatched")
        
        # Re-validate state at dispatch time
        vehicle, driver = TripService.validate_trip_assignment(db, trip.vehicle_id, trip.driver_id, trip.cargo_weight)
        
        # Rule 6: Dispatch changes vehicle + driver to On Trip, and trip to Dispatched
        trip.status = "Dispatched"
        vehicle.status = "On Trip"
        driver.status = "On Trip"
        
        db.commit()
        db.refresh(trip)
        return trip

    @staticmethod
    def complete_trip(db: Session, trip_id: int, actual_distance: float, fuel_consumed: float, fuel_cost_per_liter: float = 1.50) -> Trip:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise ValidationError("Trip not found")
        
        if trip.status != "Dispatched":
            raise ValidationError("Only Dispatched trips can be completed")
        
        if actual_distance < 0:
            raise ValidationError("Actual distance cannot be negative")
        if fuel_consumed < 0:
            raise ValidationError("Fuel consumed cannot be negative")
        
        vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
        driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
        
        # Rule 7: Complete trip -> vehicle + driver revert to Available
        trip.status = "Completed"
        trip.actual_distance = actual_distance
        trip.fuel_consumed = fuel_consumed
        
        # Update vehicle odometer
        if vehicle:
            vehicle.status = "Available"
            vehicle.odometer += actual_distance
            
            # Auto-log fuel consumption
            if fuel_consumed > 0:
                fuel_log = FuelLog(
                    vehicle_id=vehicle.id,
                    liters=fuel_consumed,
                    cost=fuel_consumed * fuel_cost_per_liter,
                    date=datetime.date.today()
                )
                db.add(fuel_log)
                
        if driver:
            driver.status = "Available"
            
        db.commit()
        db.refresh(trip)
        return trip

    @staticmethod
    def cancel_trip(db: Session, trip_id: int) -> Trip:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise ValidationError("Trip not found")
        
        if trip.status not in ["Draft", "Dispatched"]:
            raise ValidationError("Only Draft or Dispatched trips can be cancelled")
        
        vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
        driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
        
        # Rule 8: Cancel dispatched trip -> vehicle + driver restored to Available
        if trip.status == "Dispatched":
            if vehicle:
                vehicle.status = "Available"
            if driver:
                driver.status = "Available"
                
        trip.status = "Cancelled"
        db.commit()
        db.refresh(trip)
        return trip
