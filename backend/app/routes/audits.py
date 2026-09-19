"""PATCH /api/images/{image_id}/detections/{detection_id} — human audit."""
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from ..db import detection_to_dict, get_conn, get_image_row, utcnow
from ..schemas import AuditPatch

router = APIRouter()


@router.patch("/api/images/{image_id}/detections/{detection_id}")
def audit_detection(
    image_id: str, detection_id: str, patch: AuditPatch, request: Request
):
    conn = get_conn()
    try:
        if get_image_row(conn, image_id) is None:
            return JSONResponse(
                status_code=404, content={"detail": "Image not found"}
            )
        row = conn.execute(
            "SELECT * FROM detections WHERE id = ? AND image_id = ?",
            (detection_id, image_id),
        ).fetchone()
        if row is None:
            return JSONResponse(
                status_code=404, content={"detail": "Detection not found"}
            )

        corrected_class = None
        if patch.verdict == "reclassified":
            coco_names = set(request.app.state.model.names.values())
            if patch.corrected_class not in coco_names:
                return JSONResponse(
                    status_code=422,
                    content={
                        "detail": (
                            "corrected_class must be a valid COCO class name "
                            f"(got '{patch.corrected_class}')"
                        )
                    },
                )
            corrected_class = patch.corrected_class

        audited_at = utcnow()
        conn.execute(
            "UPDATE detections SET verdict = ?, corrected_class = ?, comment = ?,"
            " audited_at = ? WHERE id = ?",
            (patch.verdict, corrected_class, patch.comment, audited_at, detection_id),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM detections WHERE id = ?", (detection_id,)
        ).fetchone()
    finally:
        conn.close()
    return detection_to_dict(row)
