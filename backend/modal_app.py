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

image = (
    modal.Image.debian_slim(python_version="3.13")
    # opencv-python (pulled by ultralytics) needs libGL/libglib at runtime.
    .run_commands(
        "apt-get update",
        "apt-get install -y --no-install-recommends libgl1 libglib2.0-0",
        "rm -rf /var/lib/apt/lists/*",
    )
    .pip_install_from_requirements(BACKEND_DIR / "requirements.txt")
    .run_commands("mkdir -p /weights /srv/data/uploads")
    .env({"MODEL_PATH": "/weights/yolo11n.pt"})
    # add_local_* must be the last step of the image chain.
    .add_local_dir(BACKEND_DIR / "app", remote_path="/srv/app")
)

app = modal.App("urbanvision-api")


@app.function(
    image=image,
    timeout=300,
    # A single container keeps the ephemeral SQLite database consistent
    # across requests (demo scale; production would use managed Postgres).
    max_containers=1,
)
@modal.concurrent(max_inputs=4)
@modal.asgi_app()
def web():
    import sys

    sys.path.insert(0, "/srv")
    from app.main import app as fastapi_app

    return fastapi_app
