import csv
import io
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.cost_service import CostService
from app.core.rbac import RoleChecker

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Fleet Manager"]))
):
    return CostService.get_vehicle_summary_report(db)

@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Financial Analyst", "Fleet Manager"]))
):
    report_data = CostService.get_vehicle_summary_report(db)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write CSV Header
    writer.writerow([
        "ID", "Registration Number", "Name/Model", "Type", "Region", "Status",
        "Odometer (km)", "Acquisition Cost ($)", "Completed Trips", "Total Revenue ($)",
        "Total Distance (km)", "Fuel Consumed (L)", "Fuel Cost ($)", "Maintenance Cost ($)",
        "Other Expenses ($)", "Operational Cost ($)", "Fuel Efficiency (km/L)", "ROI (%)"
    ])
    
    # Write rows
    for row in report_data:
        writer.writerow([
            row["id"],
            row["registration_number"],
            row["name_model"],
            row["type"],
            row["region"],
            row["status"],
            row["odometer"],
            row["acquisition_cost"],
            row["total_trips"],
            row["total_revenue"],
            row["total_distance"],
            row["total_fuel_consumed"],
            row["total_fuel_cost"],
            row["total_maintenance_cost"],
            row["total_other_cost"],
            row["total_operational_cost"],
            round(row["fuel_efficiency"], 2),
            round(row["roi"] * 100, 2)  # Show ROI in percentage
        ])
        
    output.seek(0)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vehicle_summary_report.csv"}
    )
