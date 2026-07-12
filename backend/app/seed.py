import datetime
import os
import sys

# Add backend to path if run directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.maintenance import MaintenanceLog
from app.models.fuel_expense import FuelLog, Expense
from app.core.security import get_password_hash
from app.services.trip_service import TripService
from app.services.maintenance_service import MaintenanceService

def run_seed():
    print("Initializing Database and dropping/creating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("\n--- Seeding Users (with roles) ---")
        users = [
            User(email="manager@transitops.com", hashed_password=get_password_hash("admin123"), role="Fleet Manager"),
            User(email="driver@transitops.com", hashed_password=get_password_hash("driver123"), role="Driver"),
            User(email="safety@transitops.com", hashed_password=get_password_hash("safety123"), role="Safety Officer"),
            User(email="analyst@transitops.com", hashed_password=get_password_hash("analyst123"), role="Financial Analyst"),
        ]
        db.add_all(users)
        db.commit()
        print("Seeded users successfully.")

        print("\n--- Seeding Vehicles & Drivers ---")
        van = Vehicle(
            registration_number="Van-05",
            name_model="Ford Transit 2022",
            type="Van",
            max_load_capacity=500.0,  # kg
            odometer=12000.0,
            acquisition_cost=25000.0,
            status="Available",
            region="North"
        )
        truck = Vehicle(
            registration_number="Truck-02",
            name_model="Volvo FH16",
            type="Truck",
            max_load_capacity=5000.0,  # kg
            odometer=85000.0,
            acquisition_cost=95000.0,
            status="Available",
            region="South"
        )
        retired_flatbed = Vehicle(
            registration_number="Flatbed-01",
            name_model="Isuzu NPR",
            type="Flatbed",
            max_load_capacity=3000.0,  # kg
            odometer=240000.0,
            acquisition_cost=40000.0,
            status="Retired",
            region="East"
        )
        db.add_all([van, truck, retired_flatbed])
        
        driver_alex = Driver(
            name="Alex",
            license_number="DL-98234",
            license_category="Class B",
            license_expiry=datetime.date.today() + datetime.timedelta(days=365),
            contact="+1-555-0101",
            safety_score=95.0,
            status="Available"
        )
        driver_sarah = Driver(
            name="Sarah",
            license_number="DL-88231",
            license_category="Class A",
            license_expiry=datetime.date.today() + datetime.timedelta(days=730),
            contact="+1-555-0102",
            safety_score=98.0,
            status="Available"
        )
        driver_john = Driver(
            name="John (Expired Licence)",
            license_number="DL-77341",
            license_category="Class B",
            license_expiry=datetime.date.today() - datetime.timedelta(days=30),  # Expired
            contact="+1-555-0103",
            safety_score=85.0,
            status="Available"
        )
        driver_robert = Driver(
            name="Robert (Suspended)",
            license_number="DL-66124",
            license_category="Class A",
            license_expiry=datetime.date.today() + datetime.timedelta(days=120),
            contact="+1-555-0104",
            safety_score=70.0,
            status="Suspended"
        )
        db.add_all([driver_alex, driver_sarah, driver_john, driver_robert])
        db.commit()
        print("Seeded vehicles and drivers successfully.")

        # Run the demo workflow
        print("\n--- Executing Example Workflow ---")
        
        # Step 1 & 2: Vehicle 'Van-05' (500kg max capacity) and Driver 'Alex' registered (completed above)
        print("Step 1 & 2: Van-05 and Alex registered and Available.")
        
        # Step 3 & 4: Create trip with Cargo Weight = 450 kg (450 <= 500 holds)
        print("Step 3: Creating a trip for Van-05 and Alex with cargo weight = 450 kg...")
        trip = TripService.create_trip(
            db=db,
            source="Warehouse Alpha",
            destination="Retail Center North",
            vehicle_id=van.id,
            driver_id=driver_alex.id,
            cargo_weight=450.0,
            planned_distance=100.0,
            revenue=1200.0  # Assumed revenue for calculation
        )
        print(f"Trip created with status: {trip.status}")

        # Step 5: Dispatch trip -> vehicle + driver status auto 'On Trip'
        print("Step 5: Dispatching the trip...")
        trip = TripService.dispatch_trip(db, trip.id)
        db.refresh(van)
        db.refresh(driver_alex)
        print(f"Trip status: {trip.status}")
        print(f"Vehicle status: {van.status} (Expected: On Trip)")
        print(f"Driver status: {driver_alex.status} (Expected: On Trip)")

        # Step 6 & 7: Complete trip -> Enter actual odometer (102km) and fuel consumed (8L)
        print("Step 6: Completing the trip (actual distance = 102km, fuel consumed = 8L)...")
        trip = TripService.complete_trip(
            db=db,
            trip_id=trip.id,
            actual_distance=102.0,
            fuel_consumed=8.0,
            fuel_cost_per_liter=1.50
        )
        db.refresh(van)
        db.refresh(driver_alex)
        print(f"Step 7: Trip status: {trip.status} (Expected: Completed)")
        print(f"Vehicle status: {van.status} (Expected: Available)")
        print(f"Driver status: {driver_alex.status} (Expected: Available)")
        print(f"Vehicle odometer: {van.odometer} km (Expected: 12102.0)")

        # Step 8: Create maintenance record Oil Change -> status In Shop
        print("Step 8: Logging a Maintenance Log (Oil Change) for Van-05...")
        maint_log = MaintenanceService.create_maintenance_log(
            db=db,
            vehicle_id=van.id,
            description="Routine Oil Change and Brake Inspection",
            cost=250.0,
            date=datetime.date.today()
        )
        db.refresh(van)
        print(f"Maintenance status: {maint_log.status} (Expected: Active)")
        print(f"Vehicle status: {van.status} (Expected: In Shop)")

        # Step 8.5: Close maintenance record -> status back to Available
        print("Step 8.5: Closing the maintenance log...")
        maint_log = MaintenanceService.close_maintenance_log(db, maint_log.id)
        db.refresh(van)
        print(f"Maintenance status: {maint_log.status} (Expected: Closed)")
        print(f"Vehicle status: {van.status} (Expected: Available)")

        print("\n--- Example Workflow Completed Successfully! ---")
        
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
