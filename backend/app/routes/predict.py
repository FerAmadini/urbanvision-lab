"""POST /api/predict — upload an image, run YOLO inference, persist results."""
import uuid

from fastapi import APIRouter, File, Request, UploadFile
from fastapi.responses import JSONResponse

from ..config import ALLOWED_EXTENSIONS, CONFIDENCE_THRESHOLD, UPLOADS_DIR
from ..db import get_conn, utcnow
from ..inference import InvalidImageError, run_inference

router = APIRouter()

MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB demo guard
EXT_NORMALIZE = {"jpeg": "jpg"}


def _error(status_code: int, detail: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"detail": detail})


@router.post("/api/predict", status_code=201)
def predict(request: Request, file: UploadFile = File(...)):
    filename = file.filename or "upload.jpg"
    raw_ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    ext = EXT_NORMALIZE.get(raw_ext, raw_ext)
    if ext not in ALLOWED_EXTENSIONS:
        return _error(
            400, f"Unsupported file type '.{raw_ext}'. Allowed: jpg, jpeg, png, webp."
        )

    image_bytes = file.file.read()
    if not image_bytes:
        return _error(400, "Uploaded file is empty.")
    if len(image_bytes) > MAX_UPLOAD_BYTES:
        return _error(400, "File too large (max 20 MB).")

    try:
        detections, width, height = run_inference(
            request.app.state.model, image_bytes, CONFIDENCE_THRESHOLD
        )
    except InvalidImageError as exc:
        return _error(400, str(exc))

    image_id = str(uuid.uuid4())
    created_at = utcnow()

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOADS_DIR / f"{image_id}.{ext}").write_bytes(image_bytes)

    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO images (image_id, filename, ext, width, height, created_at)"
            " VALUES (?, ?, ?, ?, ?, ?)",
            (image_id, filename, ext, width, height, created_at),
        )
        for detection in detections:
            detection["id"] = str(uuid.uuid4())
            x1, y1, x2, y2 = detection["bbox"]
            conn.execute(
                "INSERT INTO detections (id, image_id, class, category, confidence,"
                " x1, y1, x2, y2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    detection["id"],
                    image_id,
                    detection["class"],
                    detection["category"],
                    detection["confidence"],
                    x1,
                    y1,
                    x2,
                    y2,
                ),
            )
        conn.commit()
    finally:
        conn.close()

    return {
        "image_id": image_id,
        "filename": filename,
        "width": width,
        "height": height,
        "created_at": created_at,
        "media_url": f"/media/{image_id}.{ext}",
        "detections": [
            {
                "id": d["id"],
                "class": d["class"],
                "category": d["category"],
                "confidence": d["confidence"],
                "bbox": d["bbox"],
            }
            for d in detections
        ],
    }
