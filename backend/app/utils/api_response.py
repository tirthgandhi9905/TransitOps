from typing import Any, Dict, List, Optional
import math

def success_response(data: Any) -> Dict[str, Any]:
    return {
        "success": True,
        "data": data
    }

def success_list_response(data: List[Any], total: int, page: int, limit: int) -> Dict[str, Any]:
    pages = math.ceil(total / limit) if limit > 0 else 0
    return {
        "success": True,
        "data": data,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages
        }
    }
