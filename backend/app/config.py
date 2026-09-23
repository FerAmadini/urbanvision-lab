"""Environment-driven configuration for the UrbanVision Lab backend."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
WEIGHTS_DIR = BASE_DIR / "weights"
DB_PATH = DATA_DIR / "app.db"

MODEL_PATH = os.environ.get("MODEL_PATH", str(WEIGHTS_DIR / "yolo11n.pt"))
CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", "0.40"))
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "ALLOWED_ORIGINS",
        # Demo origins allowed by default so free-tier hosts work with zero
        # configuration; override via env in real deployments.
        "http://localhost:3000,https://urbanvision-lab.vercel.app",
    ).split(",")
    if origin.strip()
]
PORT = int(os.environ.get("PORT", "8000"))

# Accepted upload extensions (jpeg is normalized to jpg on save).
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
