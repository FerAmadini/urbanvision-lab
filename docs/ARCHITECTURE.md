# Arquitectura — UrbanVision Lab

## Visión general

Dos servicios independientes comunicados por una API REST con contrato
explícito ([API_CONTRACT.md](API_CONTRACT.md)):

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│  Frontend (Next.js 16)  │  HTTP   │  Backend (FastAPI, :8000)    │
│  localhost:3000         │ ──────► │                              │
│                         │  JSON   │  /api/predict  ─► YOLO11n    │
│  Panel / Procesar /     │ ◄────── │  /api/images   ─► SQLite     │
│  Imagen / Historial     │         │  /api/metrics  ─► /media     │
└─────────────────────────┘         └──────────────────────────────┘
```

## Componentes y responsabilidades

### Backend (`backend/app/`)

| Módulo | Responsabilidad |
|---|---|
| `main.py` | App FastAPI: lifespan (schema + carga única del modelo), CORS, mount `/media`, routers |
| `inference.py` | Wrapper de YOLO11n: decodifica bytes → PIL → `model.predict` → detecciones filtradas |
| `classes.py` | `URBAN_CLASSES`: subconjunto COCO curado → categoría (recyclable / organic / bulky) |
| `db.py` | SQLite stdlib: schema, helpers de lectura/escritura y cálculo de métricas |
| `schemas.py` | Validación Pydantic de requests (veredictos de auditoría) |
| `routes/*` | Endpoints: predict, images, audits, metrics, export |

### Frontend (`frontend/`)

| Pieza | Responsabilidad |
|---|---|
| `lib/api.ts` | Cliente tipado de la API (único lugar que conoce las rutas) |
| `lib/labels.ts` | Traducción COCO→español, categorías, veredictos, colores |
| `components/DetectionOverlay.tsx` | Cajas SVG escaladas con `viewBox` en coordenadas originales |
| `components/AuditCard.tsx` | Panel human-in-the-loop por detección |
| `app/*` | Pantallas: panel, procesar, detalle+auditoría, historial |

## Flujo de datos

1. `POST /api/predict` (multipart) → PIL valida y mide la imagen → YOLO11n
   infiere (~100-300 ms CPU) → se filtran clases fuera de `URBAN_CLASSES` y
   confianzas bajo `CONFIDENCE_THRESHOLD` → se persisten imagen + detecciones
   y se copia el archivo a `data/uploads/`.
2. El frontend dibuja las cajas con un SVG cuyo `viewBox` usa las dimensiones
   originales: las coordenadas escalan solas al tamaño mostrado (evita el bug
   clásico de mezclar coordenadas naturales y de pantalla).
3. `PATCH .../detections/{id}` registra el veredicto humano. Las métricas se
   **derivan** de los veredictos (nunca se guardan precalculadas):
   `accuracy = (accepted + reclassified) / detecciones auditadas`.
4. Las distribuciones por clase usan la clase **corregida** cuando existe: la
   auditoría mejora los datos, no solo los valida.

## Modelo de datos

```
images(image_id PK, filename, ext, width, height, created_at)
detections(id PK, image_id FK, class, category, confidence,
           x1, y1, x2, y2, verdict, corrected_class, comment, audited_at)
```

`verdict ∈ {pending, accepted, rejected, reclassified, deleted}`. Las
detecciones eliminadas se conservan (trazabilidad) y se excluyen de overlays
y distribuciones.

## Decisiones técnicas y por qué

| Decisión | Motivo |
|---|---|
| YOLO11**n** preentrenado (COCO) | Nano = rápido en CPU y liviano; el objetivo de la demo es el pipeline, no el entrenamiento. Documentado como limitación. |
| Filtrado de clases COCO → categorías urbanas | COCO no tiene clases de residuos; el mapeo curado acerca el modelo al dominio sin fingir capacidades inexistentes. |
| SQLite stdlib, sin ORM | Cero dependencias extra, un archivo, esquema en startup: ejecutable en cualquier máquina. |
| Modelo cargado una vez en `lifespan` | Evitar recargas de ~1-2 s por request. |
| Páginas de datos como client components | El backend puede no existir en build time; el fetch en `useEffect` mantiene `next build` independiente del backend. |
| Overlay SVG con `viewBox` original | Escalado correcto sin matemática manual de coordenadas. |
| Métricas derivadas, no almacenadas | Una sola fuente de verdad (los veredictos); imposible que se desincronicen. |
| Contrato de API versionado en docs/ | Frontend y backend se construyeron contra el mismo documento; es también material de entrevista. |

## Demo vs. producción

| Aspecto | En la demo | En producción |
|---|---|---|
| Modelo | YOLO11n COCO genérico | Fine-tuning con dataset propio (clases reales: cartón, lata, bolsa…), etiquetado en CVAT/Label Studio/Roboflow |
| Métricas ML | Precisión percibida por auditoría humana | precision / recall / mAP@0.5:0.95 con split de validación y criterios de aceptación |
| Persistencia | SQLite un proceso | PostgreSQL + object storage (S3) para imágenes |
| Inferencia | Sincrónica en el request | Cola de trabajos + workers GPU, versionado de modelos |
| Acceso | Sin auth, CORS abierto a localhost | Autenticación y roles para auditores |
| Dimensiones reales | No implementado (no se simula precisión inexistente) | Calibración geométrica: referencia de escala, profundidad o estéreo |
| Licencia | AGPL-3.0 (Ultralytics) aceptable para demo | Evaluar licencia comercial o alternativa |
| Observabilidad | Logs de uvicorn | Métricas de latencia, drift de confianza, trazabilidad de auditorías |
