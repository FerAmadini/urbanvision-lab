# UrbanVision Lab — Backend

API de demostración para detección de residuos urbanos con visión por
computadora y auditoría humana. Recibe imágenes, ejecuta inferencia con un
modelo YOLO11n preentrenado (clases COCO filtradas a un subconjunto urbano)
y expone un flujo completo de auditoría: validar, rechazar, reclasificar o
eliminar cada detección, con métricas y exportación de resultados.

Este backend es parte de una demo técnica para entrevista. **No es un modelo
productivo de residuos**: ver "Limitaciones" más abajo.

## Cómo ejecutar

Requisitos: [`uv`](https://docs.astral.sh/uv/) (recomendado) o Python 3.11–3.13 con pip.

```bash
cd backend
uv venv --python 3.13
uv pip install -r requirements.txt
uv run uvicorn app.main:app --port 8000
```

Alternativa con pip:

```bash
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

En el primer arranque se descargan automáticamente los pesos de YOLO11n
(~5.4 MB) a `weights/yolo11n.pt`. La base SQLite y el directorio de uploads
se crean solos en `data/`.

Documentación interactiva de la API (Swagger): <http://localhost:8000/docs>

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servicio y cantidad de clases filtradas |
| POST | `/api/predict` | Sube una imagen (multipart, campo `file`), ejecuta inferencia y persiste imagen + detecciones |
| GET | `/api/images` | Historial paginado (`limit`, `offset`) con estado de auditoría y precisión por imagen |
| GET | `/api/images/{id}` | Detalle: detecciones con campos de auditoría + métricas de la imagen |
| PATCH | `/api/images/{id}/detections/{det_id}` | Auditoría humana: `accepted`, `rejected`, `reclassified` (requiere `corrected_class`), `deleted`; opcional `comment` |
| GET | `/api/images/{id}/export?format=json\|csv` | Descarga el resultado auditado como JSON o CSV |
| GET | `/api/metrics` | Métricas globales: conteos por veredicto, confianza promedio, precisión, distribución por clase y categoría |
| GET | `/media/{archivo}` | Imágenes subidas (archivos estáticos) |

El contrato completo de request/response está en `../docs/API_CONTRACT.md`.

## Configuración (variables de entorno)

| Variable | Default | Propósito |
|---|---|---|
| `CONFIDENCE_THRESHOLD` | `0.40` | Confianza mínima para conservar una detección |
| `MODEL_PATH` | `weights/yolo11n.pt` | Ruta de los pesos YOLO |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Orígenes CORS permitidos (separados por coma) |
| `PORT` | `8000` | Puerto de uvicorn |

## Clases y categorías

YOLO11n viene preentrenado en COCO (80 clases). COCO **no tiene** clases de
residuos urbanos (cartón, lata, bolsa), así que la demo filtra las
detecciones a un subconjunto curado y las agrupa en tres categorías que
reflejan los casos de uso de Gestión Urbana Basada en Datos:

- **recyclable**: botellas, vasos, cubiertos, bolsos, paraguas, etc.
- **organic**: restos de comida (manzana, banana, pizza, etc.)
- **bulky**: voluminosos e incidencias de higiene urbana (sillón, cama,
  heladera, TV, bicicleta, etc.)

El mapeo completo es una sola constante editable en `app/classes.py`: en un
despliegue real se reemplazaría por la taxonomía propia de la organización.

## Imágenes de ejemplo

`sample_images/` incluye 7 fotos con origen y licencia documentados en
`sample_images/SOURCES.md`. Las imágenes `escena_*` producen detecciones
reales; las imágenes `contenedores_*` (contenedores de reciclaje reales)
producen **cero detecciones a propósito**: COCO no conoce la clase
"contenedor", y eso hace visible la limitación central de usar un modelo
genérico.

## Limitaciones de la demo (declaradas)

- **Modelo genérico, no productivo**: YOLO11n preentrenado en COCO. Un modelo
  de residuos urbano requiere dataset propio, etiquetado (CVAT / Label
  Studio / Roboflow) y fine-tuning con métricas de aceptación definidas.
- **Licencia**: Ultralytics/YOLO se distribuye bajo AGPL-3.0. Aceptable para
  una demo; un uso productivo requiere licencia comercial o alternativa.
- **Persistencia simple**: SQLite en un solo archivo y un solo proceso, sin
  autenticación ni colas de procesamiento. Decisiones deliberadas para una
  demo ejecutable en cualquier máquina.
- **Consultas N+1** en el listado de imágenes: aceptable a escala de demo;
  en producción se resolvería con una consulta agregada única.
- **Sin estimación de dimensiones**: la estimación geométrica desde una foto
  sin calibración es una aproximación; no se simula precisión inexistente.
