import datetime
from sqlalchemy.orm import Session
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.fuel_expense import FuelLog
from app.core.exceptions import TransitOpsException

class TripService:
    @staticmethod
    def generate_trip_number(db: Session) -> str:
        today_str = datetime.date.today().strftime("%Y%m%d")
        # count matching trips for today
        count = db.query(Trip).filter(Trip.trip_number.like(f"TRP-{today_str}-%")).count()
        return f"TRP-{today_str}-{(count + 1):03d}"

    @staticmethod
    def validate_trip_assignment(db: Session, vehicle_id: str, driver_id: str, cargo_weight: float, is_dispatch: bool = False):
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise TransitOpsException("NOT_FOUND", "Vehicle not found", 404)
        
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise TransitOpsException("NOT_FOUND", "Driver not found", 404)
        
        # Rule: Cargo Weight must not exceed max load capacity
        # Since Prisma Decimal can map to Float/Float, let's float-convert both
        if float(cargo_weight) > float(vehicle.max_load_capacity):
            raise TransitOpsException(
                "CARGO_EXCEEDS_CAPACITY",
                f"Cargo weight {cargo_weight} kg exceeds vehicle max capacity of {vehicle.max_load_capacity} kg",
                422
            )
            
        # Vehicle status check
        if vehicle.status != "AVAILABLE":
            raise TransitOpsException(
                "VEHICLE_NOT_AVAILABLE",
                f"Vehicle {vehicle.registration_number} is not in AVAILABLE state (current: {vehicle.status})",
                422
            )
            
        # Driver status and license checks
        if driver.status == "SUSPENDED":
            raise TransitOpsException("DRIVER_SUSPENDED", "Driver is suspended", 422)
            
        if driver.status != "AVAILABLE":
            raise TransitOpsException(
                "DRIVER_NOT_AVAILABLE",
                f"Driver {driver.name} is not in AVAILABLE state (current: {driver.status})",
                422
            )
            
        if driver.license_expiry < datetime.date.today():
            raise TransitOpsException("DRIVER_LICENSE_EXPIRED", "Driver's license has expired", 422)
        
        return vehicle, driver

    @staticmethod
    def create_trip(db: Session, created_by_id: str, vehicle_id: str, driver_id: str, source: str, destination: str, cargo_weight: float, planned_distance: float, revenue: float = 0.0, notes: str = None) -> Trip:
        # Validate rules on creation
        TripService.validate_trip_assignment(db, vehicle_id, driver_id, cargo_weight)
        
        trip_num = TripService.generate_trip_number(db)
        
        trip = Trip(
            trip_number=trip_num,
            vehicle_id=vehicle_id,
            driver_id=driver_id,
            source=source,
            destination=destination,
            cargo_weight=cargo_weight,
            planned_distance=planned_distance,
            revenue=revenue,
            status="DRAFT",
            notes=notes,
            created_by_id=created_by_id
        )
        
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip

    @staticmethod
    def dispatch_trip(db: Session, trip_id: str) -> Trip:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise TransitOpsException("NOT_FOUND", "Trip not found", 404)
        
        if trip.status != "DRAFT":
            raise TransitOpsException("INVALID_TRANSITION", f"Cannot dispatch trip in '{trip.status}' status", 422)
            
        # Re-validate availability at dispatch
        vehicle, driver = TripService.validate_trip_assignment(db, trip.vehicle_id, trip.driver_id, trip.cargo_weight, is_dispatch=True)
        
        # State transition: DISPATCHED, vehicle/driver -> ON_TRIP
        trip.status = "DISPATCHED"
        trip.dispatch_time = datetime.datetime.utcnow()
        trip.start_odometer = vehicle.current_odometer
        
        vehicle.status = "ON_TRIP"
        driver.status = "ON_TRIP"
        
        db.commit()
        db.refresh(trip)
        return trip

    @staticmethod
    def complete_trip(db: Session, trip_id: str, end_odometer: float, fuel_consumed: float, actual_distance: float, notes: str = None) -> Trip:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise TransitOpsException("NOT_FOUND", "Trip not found", 404)
            
        if trip.status != "DISPATCHED":
            raise TransitOpsException("INVALID_TRANSITION", f"Only DISPATCHED trips can be completed (current: {trip.status})", 422)
            
        vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
        driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
        
        if vehicle and end_odometer < vehicle.current_odometer:
            raise TransitOpsException(
                "VALIDATION_ERROR",
                f"End odometer ({end_odometer}) cannot be less than vehicle current odometer ({vehicle.current_odometer})",
                400
            )
            
        # State transition: COMPLETED, vehicle/driver -> AVAILABLE
        trip.status = "COMPLETED"
        trip.completion_time = datetime.datetime.utcnow()
        trip.end_odometer = end_odometer
        trip.actual_distance = actual_distance
        trip.fuel_consumed = fuel_consumed
        if notes:
            trip.notes = notes
            
        if vehicle:
            vehicle.status = "AVAILABLE"
            vehicle.current_odometer = end_odometer
            
            # Log fuel consumption
            if fuel_consumed > 0:
                fuel_log = FuelLog(
                    vehicle_id=vehicle.id,
                    trip_id=trip.id,
                    fuel_liters=fuel_consumed,
                    fuel_cost=fuel_consumed * 1.50,  # default fuel cost rate
                    fuel_station="Station Linked to Completion",
                    date=datetime.datetime.utcnow()
                )
                db.add(fuel_log)
                
        if driver:
            driver.status = "AVAILABLE"
            
        db.commit()
        db.refresh(trip)
        return trip

    @staticmethod
    def cancel_trip(db: Session, trip_id: str) -> Trip:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise TransitOpsException("NOT_FOUND", "Trip not found", 404)
            
        if trip.status != "DISPATCHED":
            raise TransitOpsException("INVALID_TRANSITION", f"Only DISPATCHED trips can be cancelled (current: {trip.status})", 422)
            
        vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
        driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
        
        # State transition: CANCELLED, vehicle/driver -> AVAILABLE
        trip.status = "CANCELLED"
        
        if vehicle:
            vehicle.status = "AVAILABLE"
        if driver:
            driver.status = "AVAILABLE"
            
        db.commit()
        db.refresh(trip)
        return trip
