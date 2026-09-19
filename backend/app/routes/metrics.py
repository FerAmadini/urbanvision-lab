"""GET /api/metrics — global dashboard metrics."""
from fastapi import APIRouter

from ..classes import URBAN_CLASSES
from ..db import get_conn

router = APIRouter()


@router.get("/api/metrics")
def global_metrics():
    conn = get_conn()
    try:
        total_images = conn.execute(
            "SELECT COUNT(*) AS n FROM images"
        ).fetchone()["n"]
        total_detections = conn.execute(
            "SELECT COUNT(*) AS n FROM detections"
        ).fetchone()["n"]
        pending_audit_images = conn.execute(
            "SELECT COUNT(DISTINCT image_id) AS n FROM detections"
            " WHERE verdict = 'pending'"
        ).fetchone()["n"]
        verdict_rows = conn.execute(
            "SELECT verdict, COUNT(*) AS n FROM detections GROUP BY verdict"
        ).fetchall()
        avg_confidence = conn.execute(
            "SELECT AVG(confidence) AS avg_conf FROM detections"
        ).fetchone()["avg_conf"]
        # Deleted detections are excluded from distributions: they are
        # confirmed false positives, not real objects on the street.
        class_rows = conn.execute(
            "SELECT CASE WHEN verdict = 'reclassified'"
            " AND corrected_class IS NOT NULL THEN corrected_class ELSE class END"
            " AS cls, COUNT(*) AS n FROM detections WHERE verdict != 'deleted'"
            " GROUP BY cls ORDER BY n DESC"
        ).fetchall()
    finally:
        conn.close()

    counts = {"accepted": 0, "rejected": 0, "reclassified": 0, "deleted": 0}
    for row in verdict_rows:
        if row["verdict"] in counts:
            counts[row["verdict"]] = row["n"]

    validated = counts["accepted"] + counts["reclassified"]
    audited = sum(counts.values())

    class_distribution = {row["cls"]: row["n"] for row in class_rows}
    category_distribution: dict[str, int] = {}
    for cls, count in class_distribution.items():
        category = URBAN_CLASSES.get(cls, "other")
        category_distribution[category] = category_distribution.get(category, 0) + count

    return {
        "total_images": total_images,
        "total_detections": total_detections,
        "pending_audit_images": pending_audit_images,
        **counts,
        "avg_confidence": (
            round(avg_confidence, 3) if avg_confidence is not None else None
        ),
        "accuracy": round(validated / audited, 3) if audited else None,
        "class_distribution": class_distribution,
        "category_distribution": category_distribution,
    }
