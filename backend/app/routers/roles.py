from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import Role
from app.utils.api_response import success_response

router = APIRouter(prefix="/roles", tags=["roles"])

@router.get("")
def list_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).all()
    # return list of roles exactly matching: [ { "id": "uuid", "name": "Fleet Manager" }, ... ]
    data = [{"id": r.id, "name": r.name} for r in roles]
    return success_response(data)
