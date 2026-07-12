from sqlalchemy import or_, desc, asc
from sqlalchemy.orm import Query

def apply_pagination_and_sorting(
    query: Query,
    model,
    page: int = 1,
    limit: int = 20,
    search: str = None,
    search_fields: list = [],
    sort_by: str = None,
    sort_order: str = "desc"
):
    # Search
    if search and search_fields:
        filters = []
        for field in search_fields:
            column = getattr(model, field, None)
            if column is not None:
                # SQLAlchemy supports ilike for string patterns
                filters.append(column.ilike(f"%{search}%"))
        if filters:
            query = query.filter(or_(*filters))
            
    # Sort
    if sort_by:
        column = getattr(model, sort_by, None)
        if column is not None:
            if sort_order == "desc":
                query = query.order_by(desc(column))
            else:
                query = query.order_by(asc(column))
    else:
        # Default fallback
        column = getattr(model, "created_at", None)
        if column is not None:
            query = query.order_by(desc(column))
            
    total = query.count()
    
    # Offset
    offset = (page - 1) * limit
    results = query.offset(offset).limit(limit).all()
    
    return results, total
