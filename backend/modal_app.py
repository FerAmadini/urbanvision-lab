"""Modal deployment target for the UrbanVision Lab inference backend.

Why Modal: the Render free plan (0.1 CPU) cannot finish a YOLO inference
within its gateway timeout, and Hugging Face Spaces now requires a paid plan
for Docker/Gradio apps. Modal's Starter plan includes free monthly compute
with real multi-core CPU, which is what PyTorch inference needs.

Deploy (after `modal setup` authentication):

    cd backend && uvx --from modal modal deploy modal_app.py

The public URL is printed by the deploy command
(<workspace>--urbanvision-api-web.modal.app).
"""
from pathlib import Path

import modal

BACKEND_DIR = Path(__file__).resolve().parent
WEIGHTS_URL = (
    "https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo11n.pt"
)

image = (
    modal.Image.debian_slim(python_version="3.13")
    .pip_install_from_requirements(BACKEND_DIR / "requirements.txt")
    # Ship the FastAPI package inside the image; /srv ends up on sys.path.
    .add_local_dir(BACKEND_DIR / "app", remote_path="/srv/app")
    .run_commands(
        "mkdir -p /weights /srv/data/uploads",
        f"curl -sL -o /weights/yolo11n.pt {WEIGHTS_URL}",
    )
    .env({"MODEL_PATH": "/weights/yolo11n.pt"})
)

app = modal.App("urbanvision-api")


@app.function(
    image=image,
    timeout=300,
    # A single container keeps the ephemeral SQLite database consistent
    # across requests (demo scale; production would use managed Postgres).
    max_containers=1,
    allow_concurrent_inputs=4,
)
@modal.asgi_app()
def web():
    import sys

    sys.path.insert(0, "/srv")
    from app.main import app as fastapi_app

    return fastapi_app
