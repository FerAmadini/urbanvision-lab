"""SQLite persistence helpers (stdlib sqlite3, no ORM).

The schema is created automatically at startup. A single-file database is a
deliberate demo simplification; see docs/API_CONTRACT.md "Known limitations".
"""
import sqlite3
from datetime import datetime, timezone

from .config import DATA_DIR, DB_PATH, UPLOADS_DIR

SCHEMA = """
CREATE TABLE IF NOT EXISTS images (
  image_id   TEXT PRIMARY KEY,
  filename   TEXT NOT NULL,
  ext        TEXT NOT NULL,
  width      INTEGER NOT NULL,
  height     INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS detections (
  id              TEXT PRIMARY KEY,
  image_id        TEXT NOT NULL REFERENCES images(image_id),
  class           TEXT NOT NULL,
  category        TEXT NOT NULL,
  confidence      REAL NOT NULL,
  x1 INTEGER NOT NULL,
  y1 INTEGER NOT NULL,
  x2 INTEGER NOT NULL,
  y2 INTEGER NOT NULL,
  verdict         TEXT NOT NULL DEFAULT 'pending',
  corrected_class TEXT,
  comment         TEXT,
  audited_at      TEXT
);

CREATE INDEX IF NOT EXISTS idx_detections_image ON detections(image_id);
"""


def utcnow() -> str:
    """Current UTC time as an ISO 8601 string."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    conn = get_conn()
    try:
        conn.executescript(SCHEMA)
        conn.commit()
    finally:
        conn.close()


def get_image_row(conn: sqlite3.Connection, image_id: str) -> sqlite3.Row | None:
    return conn.execute(
        "SELECT * FROM images WHERE image_id = ?", (image_id,)
    ).fetchone()


def detection_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "class": row["class"],
        "category": row["category"],
        "confidence": row["confidence"],
        "bbox": [row["x1"], row["y1"], row["x2"], row["y2"]],
        "verdict": row["verdict"],
        "corrected_class": row["corrected_class"],
        "comment": row["comment"],
        "audited_at": row["audited_at"],
    }


def get_detections(conn: sqlite3.Connection, image_id: str) -> list[dict]:
    rows = conn.execute(
        "SELECT * FROM detections WHERE image_id = ? ORDER BY rowid", (image_id,)
    ).fetchall()
    return [detection_to_dict(row) for row in rows]


def metrics_from_detections(detections: list[dict]) -> dict:
    """Per-image metrics. accuracy = validated / audited (None if nothing audited)."""
    counts = {"accepted": 0, "rejected": 0, "reclassified": 0, "deleted": 0}
    for detection in detections:
        if detection["verdict"] in counts:
            counts[detection["verdict"]] += 1
    validated = counts["accepted"] + counts["reclassified"]
    audited = sum(counts.values())
    avg_confidence = (
        round(sum(d["confidence"] for d in detections) / len(detections), 3)
        if detections
        else None
    )
    return {
        "detection_count": len(detections),
        **counts,
        "avg_confidence": avg_confidence,
        "validated": validated,
        "accuracy": round(validated / audited, 3) if audited else None,
    }


def audit_status_from_detections(detections: list[dict]) -> str:
    """An image is 'reviewed' when every detection has a non-pending verdict.

    Images with zero detections count as reviewed (nothing to audit).
    """
    if not detections:
        return "reviewed"
    return "reviewed" if all(d["verdict"] != "pending" for d in detections) else "pending"


def image_to_dict(row: sqlite3.Row) -> dict:
    return {
        "image_id": row["image_id"],
        "filename": row["filename"],
        "width": row["width"],
        "height": row["height"],
        "created_at": row["created_at"],
        "media_url": f"/media/{row['image_id']}.{row['ext']}",
    }


def image_summary(conn: sqlite3.Connection, row: sqlite3.Row) -> dict:
    """List-item shape: image fields + detection_count + audit_status + accuracy."""
    detections = get_detections(conn, row["image_id"])
    metrics = metrics_from_detections(detections)
    return {
        **image_to_dict(row),
        "detection_count": metrics["detection_count"],
        "audit_status": audit_status_from_detections(detections),
        "accuracy": metrics["accuracy"],
    }
