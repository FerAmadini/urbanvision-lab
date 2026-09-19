"""YOLO11n inference wrapper.

The model is loaded once at startup (see main.py lifespan) and reused across
requests. Inference runs on CPU by default; YOLO11n takes ~100-300 ms per
image, which is fine for an interactive demo.
"""
import io
from pathlib import Path

from PIL import Image, UnidentifiedImageError
from ultralytics import YOLO

from .classes import URBAN_CLASSES


class InvalidImageError(ValueError):
    """Raised when uploaded bytes cannot be decoded as an image."""


def load_model(model_path: str) -> YOLO:
    """Load YOLO11n, downloading the weights on first run."""
    path = Path(model_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        from ultralytics.utils.downloads import attempt_download_asset

        attempt_download_asset(str(path))
    return YOLO(str(path))


def run_inference(
    model: YOLO, image_bytes: bytes, threshold: float
) -> tuple[list[dict], int, int]:
    """Run detection on raw image bytes.

    Returns (detections, width, height). Detections are filtered to
    URBAN_CLASSES and shaped per docs/API_CONTRACT.md.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise InvalidImageError("File is not a valid image") from exc

    width, height = image.size
    results = model.predict(image, conf=threshold, verbose=False)

    detections: list[dict] = []
    for result in results:
        if result.boxes is None:
            continue
        for box in result.boxes:
            class_name = model.names[int(box.cls[0])]
            if class_name not in URBAN_CLASSES:
                continue
            x1, y1, x2, y2 = (int(round(v)) for v in box.xyxy[0].tolist())
            detections.append(
                {
                    "class": class_name,
                    "category": URBAN_CLASSES[class_name],
                    "confidence": round(float(box.conf[0]), 3),
                    "bbox": [x1, y1, x2, y2],
                }
            )
    return detections, width, height
