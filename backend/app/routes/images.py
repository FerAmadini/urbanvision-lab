"""GET /api/images (list) and GET /api/images/{image_id} (detail + metrics)."""
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from ..db import (
    audit_status_from_detections,
    get_conn,
    get_detections,
    get_image_row,
    image_summary,
    image_to_dict,
    metrics_from_detections,
)

router = APIRouter()


@router.get("/api/images")
def list_images(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    conn = get_conn()
    try:
        total = conn.execute("SELECT COUNT(*) AS n FROM images").fetchone()["n"]
        rows = conn.execute(
            "SELECT * FROM images ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        ).fetchall()
        # Per-image aggregation (N+1 is acceptable at demo scale; a production
        # version would use a single GROUP BY query).
        items = [image_summary(conn, row) for row in rows]
    finally:
        conn.close()
    return {"items": items, "total": total}


@router.get("/api/images/{image_id}")
def get_image(image_id: str):
    conn = get_conn()
    try:
        row = get_image_row(conn, image_id)
        if row is None:
            return JSONResponse(
                status_code=404, content={"detail": "Image not found"}
            )
        detections = get_detections(conn, image_id)
    finally:
        conn.close()

    metrics = metrics_from_detections(detections)
    return {
        **image_to_dict(row),
        "detection_count": len(detections),
        "audit_status": audit_status_from_detections(detections),
        "accuracy": metrics["accuracy"],
        "detections": detections,
        "metrics": metrics,
    }
