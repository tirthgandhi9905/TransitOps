import datetime
import os
import sys

# Add backend to path if run directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, Base, engine
from app.models.user import User, Role
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.maintenance import MaintenanceLog
from app.models.fuel_expense import FuelLog, Expense
from app.core.security import get_password_hash

def run_seed():
    print("Resetting database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("\n--- Seeding Roles ---")
        roles = {
            "Admin": Role(name="Admin"),
            "Fleet Manager": Role(name="Fleet Manager"),
            "Dispatcher": Role(name="Dispatcher"),
            "Safety Officer": Role(name="Safety Officer"),
            "Financial Analyst": Role(name="Financial Analyst")
        }
        db.add_all(roles.values())
        db.commit()
        for r in roles.values():
            db.refresh(r)
        print("Roles seeded.")

        print("\n--- Seeding Demo Users ---")
        users = [
            User(name="Admin User", email="admin@transitops.com", password_hash=get_password_hash("password123"), role_id=roles["Admin"].id),
            User(name="Fleet Mgr", email="fleet@transitops.com", password_hash=get_password_hash("password123"), role_id=roles["Fleet Manager"].id),
            User(name="Dispatcher User", email="dispatch@transitops.com", password_hash=get_password_hash("password123"), role_id=roles["Dispatcher"].id),
            User(name="Safety Officer User", email="safety@transitops.com", password_hash=get_password_hash("password123"), role_id=roles["Safety Officer"].id),
            User(name="Financial Analyst User", email="finance@transitops.com", password_hash=get_password_hash("password123"), role_id=roles["Financial Analyst"].id),
        ]
        db.add_all(users)
        db.commit()
        for u in users:
            db.refresh(u)
        print("Users seeded.")

        print("\n--- Seeding Vehicles ---")
        vehicles = [
            # 3 AVAILABLE
            Vehicle(registration_number="VAN-01", vehicle_name="Ford Transit", vehicle_model="Transit 350", vehicle_type="VAN", max_load_capacity=1000.0, current_odometer=10000.0, acquisition_cost=30000.0, region="North", status="AVAILABLE"),
            Vehicle(registration_number="VAN-02", vehicle_name="Mercedes Sprinter", vehicle_model="Sprinter 2500", vehicle_type="VAN", max_load_capacity=1200.0, current_odometer=15000.0, acquisition_cost=35000.0, region="East", status="AVAILABLE"),
            Vehicle(registration_number="VAN-03", vehicle_name="Chevrolet Express", vehicle_model="Express 3500", vehicle_type="VAN", max_load_capacity=1500.0, current_odometer=20000.0, acquisition_cost=28000.0, region="West", status="AVAILABLE"),
            # 2 ON_TRIP
            Vehicle(registration_number="VAN-04", vehicle_name="Ford Transit", vehicle_model="Transit 150", vehicle_type="VAN", max_load_capacity=800.0, current_odometer=12000.0, acquisition_cost=25000.0, region="North", status="ON_TRIP"),
            Vehicle(registration_number="VAN-05", vehicle_name="Mercedes Sprinter", vehicle_model="Sprinter 1500", vehicle_type="VAN", max_load_capacity=900.0, current_odometer=18000.0, acquisition_cost=33000.0, region="South", status="ON_TRIP"),
            # 1 IN_SHOP
            Vehicle(registration_number="TRUCK-01", vehicle_name="Volvo FH16", vehicle_model="FH16", vehicle_type="TRUCK", max_load_capacity=10000.0, current_odometer=80000.0, acquisition_cost=90000.0, region="South", status="IN_SHOP"),
            # 2 RETIRED
            Vehicle(registration_number="TRUCK-02", vehicle_name="Scania R500", vehicle_model="R500", vehicle_type="TRUCK", max_load_capacity=12000.0, current_odometer=250000.0, acquisition_cost=95000.0, region="East", status="RETIRED"),
            Vehicle(registration_number="FLATBED-01", vehicle_name="Isuzu NPR", vehicle_model="NPR", vehicle_type="PICKUP", max_load_capacity=3000.0, current_odometer=180000.0, acquisition_cost=40000.0, region="West", status="RETIRED")
        ]
        db.add_all(vehicles)
        db.commit()
        for v in vehicles:
            db.refresh(v)
        print("Vehicles seeded.")

        print("\n--- Seeding Drivers ---")
        drivers = [
            # 3 AVAILABLE
            Driver(name="Alex", license_number="DL-MH-001", license_category="B", license_expiry=datetime.date.today() + datetime.timedelta(days=365), phone="+91-9876543211", email="alex@transitops.com", safety_score=9.5, status="AVAILABLE"),
            Driver(name="Sarah", license_number="DL-MH-002", license_category="C", license_expiry=datetime.date.today() + datetime.timedelta(days=730), phone="+91-9876543212", email="sarah@transitops.com", safety_score=9.8, status="AVAILABLE"),
            Driver(name="John", license_number="DL-MH-003", license_category="B", license_expiry=datetime.date.today() + datetime.timedelta(days=120), phone="+91-9876543213", email="john@transitops.com", safety_score=8.5, status="AVAILABLE"),
            # 1 ON_TRIP
            Driver(name="Robert", license_number="DL-MH-004", license_category="C", license_expiry=datetime.date.today() + datetime.timedelta(days=150), phone="+91-9876543214", email="robert@transitops.com", safety_score=9.0, status="ON_TRIP"),
            # 1 SUSPENDED
            Driver(name="Michael", license_number="DL-MH-005", license_category="A", license_expiry=datetime.date.today() + datetime.timedelta(days=30), phone="+91-9876543215", email="michael@transitops.com", safety_score=6.0, status="SUSPENDED"),
            # 1 OFF_DUTY
            Driver(name="Emily", license_number="DL-MH-006", license_category="B", license_expiry=datetime.date.today() + datetime.timedelta(days=400), phone="+91-9876543216", email="emily@transitops.com", safety_score=8.8, status="OFF_DUTY")
        ]
        db.add_all(drivers)
        db.commit()
        for d in drivers:
            db.refresh(d)
        print("Drivers seeded.")

        print("\n--- Seeding Trips ---")
        # 10 trips total
        trips = [
            Trip(trip_number="TRP-20240101-001", vehicle_id=vehicles[0].id, driver_id=drivers[0].id, source="Warehouse Alpha", destination="City Center", cargo_weight=450.0, planned_distance=50.0, revenue=1000.0, status="DRAFT", created_by_id=users[2].id),
            Trip(trip_number="TRP-20240101-002", vehicle_id=vehicles[1].id, driver_id=drivers[1].id, source="Warehouse Beta", destination="Retail Hub", cargo_weight=800.0, planned_distance=120.0, revenue=2400.0, status="DRAFT", created_by_id=users[2].id),
            
            # Dispatched (vehicle and driver state matches seed state)
            Trip(trip_number="TRP-20240101-003", vehicle_id=vehicles[3].id, driver_id=drivers[3].id, source="Dock East", destination="Outpost North", cargo_weight=500.0, planned_distance=300.0, revenue=6000.0, status="DISPATCHED", start_odometer=12000.0, dispatch_time=datetime.datetime.utcnow(), created_by_id=users[2].id),
            Trip(trip_number="TRP-20240101-004", vehicle_id=vehicles[4].id, driver_id=drivers[3].id, source="Dock West", destination="Outpost South", cargo_weight=600.0, planned_distance=250.0, revenue=5000.0, status="DISPATCHED", start_odometer=18000.0, dispatch_time=datetime.datetime.utcnow(), created_by_id=users[2].id),
            
            # Completed
            Trip(trip_number="TRP-20240101-005", vehicle_id=vehicles[0].id, driver_id=drivers[0].id, source="Warehouse Alpha", destination="Retail Center", cargo_weight=400.0, planned_distance=80.0, actual_distance=82.0, start_odometer=9918.0, end_odometer=10000.0, fuel_consumed=10.0, revenue=1600.0, status="COMPLETED", dispatch_time=datetime.datetime.utcnow() - datetime.timedelta(days=1), completion_time=datetime.datetime.utcnow() - datetime.timedelta(hours=20), created_by_id=users[2].id),
            Trip(trip_number="TRP-20240101-006", vehicle_id=vehicles[1].id, driver_id=drivers[1].id, source="Warehouse Beta", destination="City Annex", cargo_weight=750.0, planned_distance=150.0, actual_distance=150.0, start_odometer=14850.0, end_odometer=15000.0, fuel_consumed=20.0, revenue=3000.0, status="COMPLETED", dispatch_time=datetime.datetime.utcnow() - datetime.timedelta(days=2), completion_time=datetime.datetime.utcnow() - datetime.timedelta(days=1), created_by_id=users[2].id),
            Trip(trip_number="TRP-20240101-007", vehicle_id=vehicles[2].id, driver_id=drivers[2].id, source="Warehouse Gamma", destination="Docks", cargo_weight=900.0, planned_distance=60.0, actual_distance=58.0, start_odometer=19942.0, end_odometer=20000.0, fuel_consumed=7.5, revenue=1200.0, status="COMPLETED", dispatch_time=datetime.datetime.utcnow() - datetime.timedelta(days=3), completion_time=datetime.datetime.utcnow() - datetime.timedelta(days=2), created_by_id=users[2].id),
            Trip(trip_number="TRP-20240101-008", vehicle_id=vehicles[0].id, driver_id=drivers[0].id, source="City Center", destination="Warehouse Alpha", cargo_weight=300.0, planned_distance=50.0, actual_distance=50.0, start_odometer=9868.0, end_odometer=9918.0, fuel_consumed=6.0, revenue=1000.0, status="COMPLETED", dispatch_time=datetime.datetime.utcnow() - datetime.timedelta(days=4), completion_time=datetime.datetime.utcnow() - datetime.timedelta(days=3), created_by_id=users[2].id),
            
            # Cancelled
            Trip(trip_number="TRP-20240101-009", vehicle_id=vehicles[0].id, driver_id=drivers[0].id, source="Warehouse Alpha", destination="Outpost North", cargo_weight=450.0, planned_distance=100.0, revenue=2000.0, status="CANCELLED", created_by_id=users[2].id),
            Trip(trip_number="TRP-20240101-010", vehicle_id=vehicles[1].id, driver_id=drivers[1].id, source="Warehouse Beta", destination="Outpost South", cargo_weight=500.0, planned_distance=110.0, revenue=2200.0, status="CANCELLED", created_by_id=users[2].id)
        ]
        db.add_all(trips)
        db.commit()
        for t in trips:
            db.refresh(t)
        print("Trips seeded.")

        print("\n--- Seeding Maintenance Logs ---")
        # 5 maintenance logs
        maint_logs = [
            MaintenanceLog(vehicle_id=vehicles[5].id, maintenance_type="ENGINE_REPAIR", description="Overhaul transmission", cost=1500.0, vendor="Volvo Repair shop", status="ACTIVE", start_date=datetime.datetime.utcnow() - datetime.timedelta(days=9)), # > 7 days
            MaintenanceLog(vehicle_id=vehicles[0].id, maintenance_type="OIL_CHANGE", description="Full synthetic oil change", cost=150.0, vendor="Jiffy Lube", status="COMPLETED", start_date=datetime.datetime.utcnow() - datetime.timedelta(days=20), end_date=datetime.datetime.utcnow() - datetime.timedelta(days=20)),
            MaintenanceLog(vehicle_id=vehicles[1].id, maintenance_type="TIRE_REPLACEMENT", description="Replacing front passenger tire", cost=250.0, vendor="Discount Tire", status="COMPLETED", start_date=datetime.datetime.utcnow() - datetime.timedelta(days=15), end_date=datetime.datetime.utcnow() - datetime.timedelta(days=15)),
            MaintenanceLog(vehicle_id=vehicles[2].id, maintenance_type="BRAKE_SERVICE", description="Brake pads replace", cost=300.0, vendor="Pep Boys", status="COMPLETED", start_date=datetime.datetime.utcnow() - datetime.timedelta(days=10), end_date=datetime.datetime.utcnow() - datetime.timedelta(days=10)),
            MaintenanceLog(vehicle_id=vehicles[0].id, maintenance_type="AC_SERVICE", description="Freon recharge", cost=120.0, vendor="Jiffy Lube", status="COMPLETED", start_date=datetime.datetime.utcnow() - datetime.timedelta(days=5), end_date=datetime.datetime.utcnow() - datetime.timedelta(days=5))
        ]
        db.add_all(maint_logs)
        db.commit()
        print("Maintenance logs seeded.")

        print("\n--- Seeding Fuel Logs ---")
        # 15 fuel logs
        fuel_logs = []
        for i in range(15):
            veh = vehicles[i % 5]
            fuel_logs.append(FuelLog(
                vehicle_id=veh.id,
                fuel_liters=30.0 + (i * 2),
                fuel_cost=2500.0 + (i * 150),
                fuel_station="HP Station, North Gate",
                date=datetime.datetime.utcnow() - datetime.timedelta(days=i)
            ))
        db.add_all(fuel_logs)
        db.commit()
        print("Fuel logs seeded.")

        print("\n--- Seeding Expenses ---")
        # 10 expenses
        expenses = []
        for i in range(10):
            veh = vehicles[i % 5]
            expenses.append(Expense(
                vehicle_id=veh.id,
                expense_type="TOLL",
                amount=100.0 + (i * 50),
                description=f"Toll gate passage {i}",
                expense_date=datetime.datetime.utcnow() - datetime.timedelta(days=i)
            ))
        db.add_all(expenses)
        db.commit()
        print("Expenses seeded.")

        print("\n=== Seeding Completed Successfully ===")
        
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
