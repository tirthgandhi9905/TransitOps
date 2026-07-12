# TransitOps

Most logistics companies run their entire fleet on spreadsheets. Dispatchers message drivers on WhatsApp. Maintenance gets logged in a notepad. Fuel receipts pile up in a drawer. Nobody knows vehicle utilization until the month-end report, and by then it's too late to act.

TransitOps is what happens when you take that chaos and put it in one place.

---

## What's Inside

A full fleet operations platform built in 8 hours — auth, RBAC, vehicle registry, driver management, trip dispatch with live status transitions, maintenance workflows, fuel & expense tracking, and a reports page with CSV and PDF export.

It enforces real business rules: a driver with an expired license cannot be dispatched. A vehicle already on a trip cannot be assigned again. Cargo weight is validated against the vehicle's rated capacity before dispatch is even allowed. These aren't UI hints — they're enforced at the API layer and surfaced as structured error codes the frontend handles gracefully.

---

## Getting Started

**Prerequisites:** Docker and Docker Compose. That's it.

```bash
git clone https://github.com/your-org/transitops.git
cd transitops

# Copy the environment file
cp .env.example .env

# Bring up the database and backend, build fresh
docker-compose up --build
```

The backend will start on `http://localhost:8000`. The frontend dev server runs on `http://localhost:5173`.

On first boot, seed the database:

```bash
docker-compose exec backend python seed.py
```

This creates 8 vehicles, 6 drivers, 10 trips across all statuses, 5 maintenance records, 15 fuel logs, 10 expenses, and one user for each role.

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@transitops.com | password123 |
| Fleet Manager | fleet@transitops.com | password123 |
| Dispatcher | dispatch@transitops.com | password123 |
| Safety Officer | safety@transitops.com | password123 |
| Financial Analyst | finance@transitops.com | password123 |

Each role sees a different version of the application. A Dispatcher cannot access Maintenance or Reports. A Financial Analyst cannot see the Drivers page. These aren't just hidden nav links — unguarded routes redirect to a 403.

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | PostgreSQL 15 |
| Auth | JWT + bcrypt |
| Charts | Recharts |
| Export | PapaParse (CSV) · jsPDF + html2canvas (PDF) |
| Infrastructure | Docker Compose |

The frontend communicates with the backend through a typed API client (`src/api/client.js`) with a 401 interceptor that clears the session and redirects to login automatically.

---

## How Trips Work

The most critical flow in the system:

```
DRAFT → DISPATCHED → COMPLETED
              ↓
          CANCELLED
```

Creating a trip in DRAFT state validates cargo weight against vehicle capacity. Dispatching it locks both the vehicle and driver into `ON_TRIP` — they disappear from every dropdown in the system. Completing a trip requires a final odometer reading and fuel consumed; the system updates the vehicle's odometer and computes fuel efficiency automatically. Cancelling a dispatched trip restores both vehicle and driver to `AVAILABLE`.

If any validation fails, the API returns a structured error code — `CARGO_EXCEEDS_CAPACITY`, `VEHICLE_NOT_AVAILABLE`, `DRIVER_LICENSE_EXPIRED` — and the frontend surfaces it inline, not as an alert box.

---

## Business Rules Enforced

- Vehicle registration numbers are unique. The API returns `DUPLICATE_REGISTRATION` on conflict.
- Vehicles with `RETIRED` or `IN_SHOP` status never appear in dispatch dropdowns.
- Drivers with `SUSPENDED` status or an expired license cannot be assigned to any trip.
- Creating a maintenance record immediately sets the vehicle to `IN_SHOP`. Closing the record restores it to `AVAILABLE` (unless it was already `RETIRED`).
- A trip can only be dispatched from `DRAFT`. Completing requires `DISPATCHED`. Invalid state transitions return `INVALID_TRANSITION`.

---

## Reports

The Reports page pulls from four dedicated endpoints:

**Fuel Efficiency** — total km driven divided by total liters consumed, per vehicle. Displayed as a bar chart sorted best-to-worst so underperforming vehicles are visible immediately.

**Operational Cost** — stacked breakdown of fuel, maintenance, and other expenses per vehicle. Helps isolate cost drivers.

**Vehicle ROI** — `(Revenue − Total Costs) / Acquisition Cost × 100`. Tells you which vehicles have paid for themselves and which haven't.

**Fleet Utilization Trend** — daily utilization percentage over the last 30 days as a line chart. The KPI card on the dashboard shows the current snapshot.

Export buttons sit in the toolbar. CSV uses `Papa.unparse()` on the live data. PDF captures the visible report section with `html2canvas` and writes it using `jsPDF` — no server round-trip needed.

---

## Dashboard Alerts

The dashboard isn't just KPI cards. It runs two background checks on load:

- Drivers whose license expires within 30 days appear in an alerts panel with the exact days remaining.
- Vehicles that have been in maintenance for more than 7 days surface as a separate alert — because a vehicle sitting in the shop for a week probably needs a follow-up call to the vendor.

---

## Project Structure

```
transitops/
├── frontend/
│   └── src/
│       ├── api/          # One file per resource, typed axios calls
│       ├── components/
│       │   ├── ui/       # Shared component library
│       │   └── layout/   # AppLayout, Sidebar, Topbar
│       ├── context/      # AuthContext with JWT re-hydration
│       ├── hooks/        # useAuth, useToast, useApi
│       ├── pages/        # One file per route
│       └── utils/        # Status enums, RBAC constants, formatters
│
└── backend/
    ├── app/
    │   ├── routers/      # One router per resource
    │   ├── models/       # SQLAlchemy ORM models
    │   ├── schemas/      # Pydantic request/response schemas
    │   ├── services/     # Business logic layer
    │   └── middleware/   # JWT auth + RBAC guards
    ├── seed.py
    └── requirements.txt
```

---

## API Contract

All responses follow a single envelope format:

```json
// Success
{ "success": true, "data": { } }
{ "success": true, "data": [ ], "meta": { "total": 84, "page": 1, "limit": 20 } }

// Error
{ "success": false, "error": { "code": "CARGO_EXCEEDS_CAPACITY", "message": "Cargo 600 kg exceeds vehicle max 500 kg" } }
```

Every list endpoint accepts `?search=`, `?sortBy=`, `?sortOrder=`, `?page=`, and `?limit=`. Filters vary by resource (status, vehicle type, date range).

---

## Environment Variables

```env
# .env
DATABASE_URL=postgresql://transitops:transitops@db:5432/transitops
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480
```

---

## Possible Next Steps

A few things that didn't fit in 8 hours but are worth noting:

- **Email reminders** for expiring driver licenses — the alert data is already there, it just needs a cron job and an SMTP integration
- **Vehicle document management** — attaching insurance, registration, and PUC certificates per vehicle
- **Dark mode** — Tailwind's `dark:` variants are already in the config, the CSS variables just need a second set of values
- **Offline support** — trip creation and completion are the two flows that matter most when drivers are in areas with poor connectivity
