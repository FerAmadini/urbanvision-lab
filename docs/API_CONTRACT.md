# API Contract — UrbanVision Lab Backend

This document is the single source of truth for the backend ↔ frontend interface.
The backend MUST implement it exactly; the frontend MUST consume it exactly.
Any deviation must be reported and this file updated.

## Overview

- Backend: Python 3.13 (venv via `uv`), FastAPI + uvicorn, Ultralytics YOLO11n, SQLite (stdlib `sqlite3`, no ORM).
- Base URL (local dev): `http://localhost:8000`
- Frontend (local dev): `http://localhost:3000` — must be allowed via CORS (`ALLOWED_ORIGINS` env override).
- All routes under `/api`. JSON keys in English snake_case. Timestamps ISO 8601 UTC.
- Model loaded ONCE at startup (FastAPI lifespan) into `app.state`; weights cached at `backend/weights/yolo11n.pt`.
- Uploaded images stored at `backend/data/uploads/<image_id>.<ext>`, served via StaticFiles mounted at `/media`.
- SQLite DB at `backend/data/app.db`, schema auto-created at startup (`CREATE TABLE IF NOT EXISTS`).

## Detection model rules

- Model: `yolo11n` pretrained on COCO. Detections are FILTERED to the curated subset below
  (COCO has no cardboard/can/trash-bag classes — documented limitation, a production model needs a custom dataset).
- Confidence threshold: env `CONFIDENCE_THRESHOLD`, default `0.40`.
- `bbox`: `[x1, y1, x2, y2]` integer pixels in ORIGINAL image coordinates (top-left, bottom-right).
- `confidence`: float 0..1 rounded to 3 decimals.
- `category`: one of `recyclable` | `organic` | `bulky` (used for grouping/counts in the UI).

### URBAN_CLASSES (class → category)

| Category | COCO classes |
|---|---|
| `recyclable` | bottle, wine glass, cup, fork, knife, spoon, bowl, backpack, handbag, suitcase, umbrella, scissors, vase, teddy bear, toothbrush, hair drier, book |
| `organic` | apple, orange, banana, sandwich, pizza, cake, donut |
| `bulky` | chair, couch, bed, dining table, toilet, tv, refrigerator, microwave, oven, toaster, sink, bicycle, potted plant |

Single constant dict in `app/classes.py`. Detections of classes outside this map are discarded.

## Audit semantics

Each detection has `verdict`:

- `pending` — initial state, not audited yet.
- `accepted` — human confirms class + box.
- `rejected` — human says the detection is wrong (false positive).
- `reclassified` — box is valid but class was wrong; `corrected_class` REQUIRED (any COCO class name).
- `deleted` — human removes the detection as noise; kept in DB for traceability, excluded from overlay counts in UI.

Derived metrics:

- `validated` = accepted + reclassified
- `accuracy` = validated / (accepted + rejected + reclassified + deleted); `null` when denominator is 0.
- `audit_status` (image level) = `reviewed` when every detection has verdict != pending; images with 0 detections are `reviewed`. Otherwise `pending`.
- Class distribution uses `corrected_class` when verdict is `reclassified`, else `class`.

## Endpoints

### 1. `GET /api/health`

→ 200 `{"status":"ok","model":"yolo11n","classes_filtered":<int, size of URBAN_CLASSES>}`

### 2. `POST /api/predict`

multipart/form-data, field name `file`. Accepts jpg/png/webp (normalize extension; reject others).

→ 201

```json
{
  "image_id": "<uuid4>",
  "filename": "<original filename>",
  "width": 1280,
  "height": 960,
  "created_at": "2026-09-19T14:03:22Z",
  "media_url": "/media/<image_id>.jpg",
  "detections": [
    {
      "id": "<uuid4>",
      "class": "bottle",
      "category": "recyclable",
      "confidence": 0.891,
      "bbox": [120, 80, 260, 340]
    }
  ]
}
```

→ 400 `{"detail":"..."}` if file missing, not an image, unsupported format, or unreadable.

Note: `media_url` is relative to the BACKEND base URL. Frontend must prefix `http://localhost:8000` (or `NEXT_PUBLIC_API_URL`).

### 3. `GET /api/images?limit=50&offset=0`

→ 200

```json
{
  "items": [
    {
      "image_id": "...", "filename": "...", "created_at": "...",
      "width": 1280, "height": 960, "media_url": "/media/....jpg",
      "detection_count": 7,
      "audit_status": "pending",
      "accuracy": null
    }
  ],
  "total": 12
}
```

Ordered `created_at` DESC. `total` = full count (ignoring limit/offset).

### 4. `GET /api/images/{image_id}`

→ 200 image object (same fields as list item) plus:

```json
{
  "detections": [
    {
      "id": "...", "class": "bottle", "category": "recyclable",
      "confidence": 0.891, "bbox": [120, 80, 260, 340],
      "verdict": "pending",
      "corrected_class": null,
      "comment": null,
      "audited_at": null
    }
  ],
  "metrics": {
    "detection_count": 7,
    "accepted": 0, "rejected": 0, "reclassified": 0, "deleted": 0,
    "avg_confidence": 0.732,
    "validated": 0,
    "accuracy": null
  }
}
```

→ 404 `{"detail":"Image not found"}` for unknown id.

### 5. `PATCH /api/images/{image_id}/detections/{detection_id}`

Body:

```json
{
  "verdict": "accepted | rejected | reclassified | deleted",
  "corrected_class": "cup",
  "comment": "optional free text"
}
```

- `corrected_class` REQUIRED when verdict = `reclassified` (must be a valid COCO class name); ignored otherwise.
- Re-auditing an already-audited detection is allowed (overwrites verdict/comment, updates `audited_at`).

→ 200 the updated detection object (shape from endpoint 4).
→ 404 unknown image/detection id. → 422 invalid body.

### 6. `GET /api/images/{image_id}/export?format=json|csv`

→ 200 file download, `Content-Disposition: attachment; filename="<original-name>-audit.<json|csv>"`.

JSON shape:

```json
{
  "image": "calle01.jpg",
  "processed_at": "...",
  "width": 1280, "height": 960,
  "detections": [ "...full detection objects with audit fields..." ],
  "validated": true,
  "metrics": { "...same as endpoint 4 metrics..." }
}
```

CSV header:

```
detection_id,class,corrected_class,category,confidence,bbox_x1,bbox_y1,bbox_x2,bbox_y2,verdict,comment
```

→ 422 for invalid `format`.

### 7. `GET /api/metrics`

Global dashboard metrics → 200

```json
{
  "total_images": 12,
  "total_detections": 87,
  "pending_audit_images": 3,
  "accepted": 40, "rejected": 12, "reclassified": 5, "deleted": 2,
  "avg_confidence": 0.71,
  "accuracy": 0.78,
  "class_distribution": {"bottle": 22, "cup": 9},
  "category_distribution": {"recyclable": 31, "organic": 6, "bulky": 4}
}
```

`avg_confidence`/`accuracy` are `null` when no data. Distributions use corrected classes (see Audit semantics).

## DB schema (SQLite)

```sql
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
  x1 INTEGER NOT NULL, y1 INTEGER NOT NULL,
  x2 INTEGER NOT NULL, y2 INTEGER NOT NULL,
  verdict         TEXT NOT NULL DEFAULT 'pending',
  corrected_class TEXT,
  comment         TEXT,
  audited_at      TEXT
);
```

## Configuration (env vars)

| Var | Default | Purpose |
|---|---|---|
| `CONFIDENCE_THRESHOLD` | `0.40` | minimum detection confidence |
| `MODEL_PATH` | `weights/yolo11n.pt` | YOLO weights location |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | comma-separated CORS origins |
| `PORT` | `8000` | uvicorn port |

## Backend file layout

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py         # FastAPI app: CORS, static mount, routers, lifespan (db init + model load)
│   ├── config.py       # env-driven settings
│   ├── classes.py      # URBAN_CLASSES dict + threshold
│   ├── inference.py    # YOLO wrapper: predict(image bytes) → detections
│   ├── db.py           # sqlite3 helpers + schema init
│   ├── schemas.py      # Pydantic models for all API shapes
│   └── routes/
│       ├── __init__.py
│       ├── predict.py
│       ├── images.py
│       ├── audits.py
│       ├── metrics.py
│       └── export.py
├── sample_images/      # 3-5 real photos + SOURCES.md (source URL + license each)
├── data/               # runtime: app.db + uploads/ (gitignored, created at startup)
├── weights/            # yolo11n.pt (gitignored)
├── pyproject.toml
├── requirements.txt
└── README.md           # neutral Spanish: run instructions, endpoint table, class mapping, env config, demo limitations
```

## Verification checklist (backend phase)

1. Deps install cleanly (`uv venv --python 3.13` + `uv pip install -r requirements.txt`).
2. Server starts: `uv run uvicorn app.main:app --port 8000`.
3. `GET /api/health` → ok.
4. `POST /api/predict` with a real sample image → real detections (≥1 detection for at least one sample).
5. `PATCH` a verdict → persisted; `GET /api/images/{id}` reflects verdict + updated metrics.
6. `GET /api/metrics` reflects audits.
7. Export json + csv return valid content.
8. Server restart → data persists (SQLite).
9. No orphan processes left running.

## Known limitations (must appear in backend/README.md)

- Pretrained COCO model, NOT a production urban-waste model; no cardboard/can/plastic-bag classes.
- Ultralytics is AGPL-3.0 — fine for a demo; a production deployment needs a commercial license or alternative.
- Single-process SQLite, no auth, no queue — deliberate demo simplifications.
