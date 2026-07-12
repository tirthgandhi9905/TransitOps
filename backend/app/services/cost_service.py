from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.maintenance import MaintenanceLog
from app.models.fuel_expense import FuelLog, Expense

class CostService:
    @staticmethod
    def get_vehicle_summary_report(db: Session):
        vehicles = db.query(Vehicle).all()
        report = []

        for v in vehicles:
            # 1. Total Completed Trips & Revenue
            trips = db.query(Trip).filter(Trip.vehicle_id == v.id, Trip.status == "Completed").all()
            total_trips = len(trips)
            total_revenue = sum(t.revenue for t in trips)
            total_distance = sum(t.actual_distance or 0.0 for t in trips)
            total_fuel_consumed = sum(t.fuel_consumed or 0.0 for t in trips)

            # 2. Fuel Log Costs
            fuel_cost_result = db.query(func.sum(FuelLog.cost)).filter(FuelLog.vehicle_id == v.id).scalar()
            total_fuel_cost = float(fuel_cost_result or 0.0)

            # 3. Maintenance Costs (both active and closed, or only closed? Let's sum all maintenance logs)
            maint_cost_result = db.query(func.sum(MaintenanceLog.cost)).filter(MaintenanceLog.vehicle_id == v.id).scalar()
            total_maintenance_cost = float(maint_cost_result or 0.0)

            # 4. Other Expenses (tolls, other)
            other_expense_result = db.query(func.sum(Expense.cost)).filter(
                Expense.vehicle_id == v.id, Expense.category != "maintenance"
            ).scalar()
            total_other_cost = float(other_expense_result or 0.0)

            # Sum of Maintenance + Fuel as requested by PRD ROI formula
            maintenance_and_fuel = total_maintenance_cost + total_fuel_cost
            
            # Operational Cost = Fuel + Maintenance + Other
            total_operational_cost = total_fuel_cost + total_maintenance_cost + total_other_cost

            # ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
            roi = 0.0
            if v.acquisition_cost > 0:
                roi = (total_revenue - maintenance_and_fuel) / v.acquisition_cost

            # Fuel Efficiency = Distance / Fuel
            fuel_efficiency = 0.0
            if total_fuel_consumed > 0:
                fuel_efficiency = total_distance / total_fuel_consumed

            report.append({
                "id": v.id,
                "registration_number": v.registration_number,
                "name_model": v.name_model,
                "type": v.type,
                "region": v.region,
                "status": v.status,
                "odometer": v.odometer,
                "acquisition_cost": v.acquisition_cost,
                "total_trips": total_trips,
                "total_revenue": total_revenue,
                "total_distance": total_distance,
                "total_fuel_consumed": total_fuel_consumed,
                "total_fuel_cost": total_fuel_cost,
                "total_maintenance_cost": total_maintenance_cost,
                "total_other_cost": total_other_cost,
                "total_operational_cost": total_operational_cost,
                "fuel_efficiency": fuel_efficiency,
                "roi": roi
            })

        return report

    @staticmethod
    def get_dashboard_kpis(db: Session, vehicle_type: str = None, status: str = None, region: str = None):
        # Base queries for vehicles
        v_query = db.query(Vehicle)
        if vehicle_type:
            v_query = v_query.filter(Vehicle.type == vehicle_type)
        if status:
            v_query = v_query.filter(Vehicle.status == status)
        if region:
            v_query = v_query.filter(Vehicle.region == region)
            
        vehicles = v_query.all()
        total_vehicles = len(vehicles)
        
        active_vehicles = sum(1 for v in vehicles if v.status == "On Trip")
        available_vehicles = sum(1 for v in vehicles if v.status == "Available")
        vehicles_in_maintenance = sum(1 for v in vehicles if v.status == "In Shop")
        
        # Fleet utilization (%) = (Active Vehicles / Total Vehicles) * 100
        fleet_utilization = 0.0
        if total_vehicles > 0:
            fleet_utilization = (active_vehicles / total_vehicles) * 100

        # Trip statistics (optionally filter by vehicle region/type if connected, but trips don't have region directly. Let's filter by matching vehicle)
        t_query = db.query(Trip)
        if vehicle_type or region:
            t_query = t_query.join(Vehicle).filter(
                (Vehicle.type == vehicle_type) if vehicle_type else True,
                (Vehicle.region == region) if region else True
            )
            
        trips = t_query.all()
        active_trips = sum(1 for t in trips if t.status == "Dispatched")
        pending_trips = sum(1 for t in trips if t.status == "Draft")

        # Driver statistics
        drivers = db.query(Driver).all()
        drivers_on_duty = sum(1 for d in drivers if d.status in ["Available", "On Trip"])

        return {
            "total_vehicles": total_vehicles,
            "active_vehicles": active_vehicles,
            "available_vehicles": available_vehicles,
            "vehicles_in_maintenance": vehicles_in_maintenance,
            "active_trips": active_trips,
            "pending_trips": pending_trips,
            "drivers_on_duty": drivers_on_duty,
            "fleet_utilization": round(fleet_utilization, 2)
        }
