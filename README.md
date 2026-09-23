# UrbanVision Lab

Mini plataforma de **auditoría de detecciones de residuos urbanos** con visión
por computadora: subís una foto, un modelo YOLO11n detecta objetos, la
interfaz los dibuja sobre la imagen y una persona **audita cada detección**
(correcta / incorrecta / reclasificar / eliminar), generando métricas e
historial exportables.

Demo técnica construida para una entrevista con **Asociación Sustentar**
(Gestión Urbana Basada en Datos). Es una prueba de concepto del pipeline
completo —modelo → API → herramienta usable→ auditoría humana— y **no un
sistema productivo de detección de residuos**: las limitaciones están
documentadas en [backend/README.md](backend/README.md#limitaciones-de-la-demo-declaradas)
y [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Requisitos

- Python 3.11–3.13 con [`uv`](https://docs.astral.sh/uv/) (o pip)
- Node.js 18+ con npm

## Cómo ejecutar (dos terminales)

**Terminal 1 — backend (FastAPI + YOLO11n, puerto 8000):**

```bash
cd backend
uv venv --python 3.13
uv pip install -r requirements.txt
uv run uvicorn app.main:app --port 8000
```

**Terminal 2 — frontend (Next.js, puerto 3000):**

```bash
cd frontend
npm install
npm run dev
```

Abrí <http://localhost:3000>. En el primer arranque del backend se descargan
los pesos de YOLO11n (~5.4 MB). Imágenes de ejemplo con origen y licencia
documentados: [`backend/sample_images/`](backend/sample_images/SOURCES.md).

## Flujo de la demo

1. **Procesar imagen** → arrastrar una foto → inferencia YOLO11n.
2. **Resultado** → bounding boxes con clase, categoría y confianza.
3. **Auditoría humana** → validar, rechazar, reclasificar o eliminar cada
   detección, con comentarios.
4. **Métricas** → precisión modelo vs. auditoría por imagen y globales.
5. **Historial y export** → JSON/CSV del resultado auditado.

## Estructura

```
├── backend/            FastAPI + YOLO11n + SQLite (ver backend/README.md)
│   ├── app/            código de la API
│   └── sample_images/  fotos de ejemplo con licencia documentada
├── frontend/           Next.js + TypeScript + Tailwind (UI de auditoría)
└── docs/
    ├── API_CONTRACT.md          contrato backend ↔ frontend
    ├── ARCHITECTURE.md          arquitectura y demo vs. producción
    └── GUIA_DEMO_ENTREVISTA.md  guión de demo y preguntas esperables
```

## Documentación

- [backend/README.md](backend/README.md) — endpoints, configuración, clases, limitaciones.
- [docs/API_CONTRACT.md](docs/API_CONTRACT.md) — contrato exacto de la API.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — decisiones técnicas y qué cambiaría en producción.
- [docs/GUIA_DEMO_ENTREVISTA.md](docs/GUIA_DEMO_ENTREVISTA.md) — guión de 20-30 minutos y Q&A.
- [docs/RESUMEN_REPASO_ENTREVISTA.md](docs/RESUMEN_REPASO_ENTREVISTA.md) — conceptos desde cero y respuestas pulidas a preguntas duras.

## Deploy público (demo en línea)

- **Frontend**: Vercel (plan free) — https://urbanvision-lab.vercel.app
- **Backend**: Modal (plan free) — https://fernandoamadini--urbanvision-api-web.modal.run
  vía [modal_app.py](backend/modal_app.py)
- **Nota de licencia**: el backend se publica en este repositorio público, que
  actúa como oferta de código fuente requerida por AGPL-3.0 (Ultralytics) al
  exponer el modelo como servicio de red.

Limitaciones del hosting gratuito (documentadas, no bugs):

- Modal duerme el servicio tras ~60 s sin tráfico: el primer request
  después de una pausa tarda 15-20 s (cold start); después vuela.
- SQLite y uploads son **efímeros** en Modal: el historial se resetea
  en cada reinicio. La demo está pensada para que cada visitante procese
  sus propias imágenes en vivo.
