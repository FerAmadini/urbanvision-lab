"""UrbanVision Lab backend — FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image

from .classes import URBAN_CLASSES
from .config import ALLOWED_ORIGINS, MODEL_PATH, UPLOADS_DIR, WEIGHTS_DIR
from .db import init_db
from .inference import load_model
from .routes import audits, export, images, metrics, predict
from .schemas import HealthOut

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create schema and load YOLO11n once (weights auto-download
    # to backend/weights/ on first run).
    init_db()
    app.state.model = load_model(MODEL_PATH)
    # Warm up inference kernels so the first real request after a cold start
    # does not pay one-time init costs (matters on free-tier hosts).
    dummy = Image.new("RGB", (64, 64), (120, 120, 120))
    app.state.model.predict(dummy, conf=0.99, verbose=False)
    yield


app = FastAPI(
    title="UrbanVision Lab API",
    version="0.1.0",
    description=(
        "Demo backend: urban-waste detection with a pretrained YOLO11n model"
        " (COCO classes filtered to an urban-waste subset) plus a human-audit"
        " API. See docs/API_CONTRACT.md."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory=UPLOADS_DIR), name="media")

app.include_router(predict.router)
app.include_router(images.router)
app.include_router(audits.router)
app.include_router(metrics.router)
app.include_router(export.router)


@app.get("/", include_in_schema=False)
def root():
    return {"name": "UrbanVision Lab API", "docs": "/docs", "health": "/api/health"}


@app.get("/api/health", response_model=HealthOut)
def health():
    return {"status": "ok", "model": "yolo11n", "classes_filtered": len(URBAN_CLASSES)}
