import csv
import io
import datetime
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.services.cost_service import CostService
from app.core.rbac import RoleChecker
from app.utils.pagination import apply_pagination_and_sorting

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/vehicles/csv")
def export_vehicles_csv(
    search: str = None,
    status: str = None,
    vehicleType: str = None,
    region: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Fleet Manager", "Financial Analyst", "Admin"]))
):
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    if vehicleType:
        query = query.filter(Vehicle.vehicle_type == vehicleType.upper())
    if region:
        query = query.filter(Vehicle.region == region)
        
    search_fields = ["registration_number", "vehicle_name", "vehicle_model"]
    results, _ = apply_pagination_and_sorting(
        query=query,
        model=Vehicle,
        page=1,
        limit=10000,
        search=search,
        search_fields=search_fields
    )
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Registration Number", "Name/Model", "Type", "Max Capacity (kg)",
        "Odometer (km)", "Cost ($)", "Region", "Status", "Purchase Date"
    ])
    
    for v in results:
        writer.writerow([
            v.id, v.registration_number, f"{v.vehicle_name} {v.vehicle_model}",
            v.vehicle_type, v.max_load_capacity, v.current_odometer,
            v.acquisition_cost, v.region, v.status,
            v.purchase_date.strftime("%Y-%m-%d") if v.purchase_date else ""
        ])
        
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=vehicles-{date_str}.csv"}
    )

@router.get("/drivers/csv")
def export_drivers_csv(
    search: str = None,
    status: str = None,
    licenseCategory: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Safety Officer", "Admin"]))
):
    query = db.query(Driver)
    if status:
        query = query.filter(Driver.status == status.upper())
    if licenseCategory:
        query = query.filter(Driver.license_category == licenseCategory.upper())
        
    search_fields = ["name", "license_number", "phone"]
    results, _ = apply_pagination_and_sorting(
        query=query,
        model=Driver,
        page=1,
        limit=10000,
        search=search,
        search_fields=search_fields
    )
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Name", "License Number", "License Category", "License Expiry",
        "Phone", "Email", "Safety Score", "Status", "Notes"
    ])
    
    for d in results:
        writer.writerow([
            d.id, d.name, d.license_number, d.license_category,
            d.license_expiry.strftime("%Y-%m-%d"), d.phone, d.email or "",
            d.safety_score, d.status, d.notes or ""
        ])
        
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=drivers-{date_str}.csv"}
    )

@router.get("/trips/csv")
def export_trips_csv(
    search: str = None,
    status: str = None,
    vehicleId: str = None,
    driverId: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Dispatcher", "Admin", "Fleet Manager", "Financial Analyst"]))
):
    query = db.query(Trip)
    if status:
        query = query.filter(Trip.status == status.upper())
    if vehicleId:
        query = query.filter(Trip.vehicle_id == vehicleId)
    if driverId:
        query = query.filter(Trip.driver_id == driverId)
        
    search_fields = ["trip_number", "source", "destination"]
    results, _ = apply_pagination_and_sorting(
        query=query,
        model=Trip,
        page=1,
        limit=10000,
        search=search,
        search_fields=search_fields
    )
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Trip Number", "Vehicle Reg", "Driver Name", "Source", "Destination",
        "Cargo Weight (kg)", "Planned Distance (km)", "Actual Distance (km)",
        "Fuel Consumed (L)", "Revenue ($)", "Status", "Dispatch Time", "Completion Time"
    ])
    
    for t in results:
        writer.writerow([
            t.id, t.trip_number, t.vehicle.registration_number if t.vehicle else "",
            t.driver.name if t.driver else "", t.source, t.destination,
            t.cargo_weight, t.planned_distance, t.actual_distance or "",
            t.fuel_consumed or "", t.revenue or 0.0, t.status,
            t.dispatch_time.strftime("%Y-%m-%d %H:%M:%S") if t.dispatch_time else "",
            t.completion_time.strftime("%Y-%m-%d %H:%M:%S") if t.completion_time else ""
        ])
        
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=trips-{date_str}.csv"}
    )

@router.get("/report/csv")
def export_full_report_csv(
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Fleet Manager", "Admin"]))
):
    roi_data = CostService.get_vehicle_roi_report(db)
    cost_data = CostService.get_operational_cost_report(db)
    eff_data = CostService.get_fuel_efficiency_report(db)
    
    merged = {}
    for r in roi_data:
        merged[r["vehicleId"]] = {
            "reg": r["registrationNumber"],
            "revenue": r["revenue"],
            "acquisitionCost": r["acquisitionCost"],
            "roi": r["roi"]
        }
    for c in cost_data:
        if c["vehicleId"] in merged:
            merged[c["vehicleId"]].update({
                "fuelCost": c["fuelCost"],
                "maintCost": c["maintenanceCost"],
                "otherCost": c["otherExpenses"],
                "totalCost": c["totalCost"]
            })
    for e in eff_data:
        if e["vehicleId"] in merged:
            merged[e["vehicleId"]].update({
                "totalKm": e["totalKm"],
                "totalLiters": e["totalLiters"],
                "efficiency": e["efficiency"]
            })
            
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Vehicle ID", "Registration Number", "Acquisition Cost ($)", "Revenue ($)",
        "Fuel Cost ($)", "Maintenance Cost ($)", "Other Expenses ($)", "Total Cost ($)",
        "Distance Traveled (km)", "Fuel Consumed (L)", "Efficiency (km/L)", "ROI (%)"
    ])
    
    for vid, item in merged.items():
        writer.writerow([
            vid,
            item.get("reg", ""),
            item.get("acquisitionCost", 0.0),
            item.get("revenue", 0.0),
            item.get("fuelCost", 0.0),
            item.get("maintCost", 0.0),
            item.get("otherCost", 0.0),
            item.get("totalCost", 0.0),
            item.get("totalKm", 0.0),
            item.get("totalLiters", 0.0),
            item.get("efficiency", 0.0),
            item.get("roi", 0.0)
        ])
        
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=report-{date_str}.csv"}
    )
