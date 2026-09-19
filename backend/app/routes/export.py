"""GET /api/images/{image_id}/export — download audited results as JSON or CSV."""
import csv
import io
import json
from typing import Literal

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse, Response

from ..db import (
    audit_status_from_detections,
    get_conn,
    get_detections,
    get_image_row,
    image_to_dict,
    metrics_from_detections,
)

router = APIRouter()

CSV_HEADER = [
    "detection_id",
    "class",
    "corrected_class",
    "category",
    "confidence",
    "bbox_x1",
    "bbox_y1",
    "bbox_x2",
    "bbox_y2",
    "verdict",
    "comment",
]


def _safe_stem(filename: str) -> str:
    stem = filename.rsplit(".", 1)[0] if "." in filename else filename
    return (
        "".join(c if c.isalnum() or c in "-_" else "-" for c in stem) or "image"
    )


@router.get("/api/images/{image_id}/export")
def export_image(
    image_id: str,
    format: Literal["json", "csv"] = Query("json"),
):
    conn = get_conn()
    try:
        row = get_image_row(conn, image_id)
        if row is None:
            return JSONResponse(
                status_code=404, content={"detail": "Image not found"}
            )
        image = image_to_dict(row)
        detections = get_detections(conn, image_id)
    finally:
        conn.close()

    metrics = metrics_from_detections(detections)
    validated = audit_status_from_detections(detections) == "reviewed"
    download_name = f"{_safe_stem(image['filename'])}-audit.{format}"
    disposition = f'attachment; filename="{download_name}"'

    if format == "json":
        payload = {
            "image": image["filename"],
            "processed_at": image["created_at"],
            "width": image["width"],
            "height": image["height"],
            "detections": detections,
            "validated": validated,
            "metrics": metrics,
        }
        return Response(
            content=json.dumps(payload, ensure_ascii=False, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": disposition},
        )

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(CSV_HEADER)
    for d in detections:
        writer.writerow(
            [
                d["id"],
                d["class"],
                d["corrected_class"] or "",
                d["category"],
                d["confidence"],
                *d["bbox"],
                d["verdict"],
                d["comment"] or "",
            ]
        )
    return Response(
        content=buffer.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": disposition},
    )
