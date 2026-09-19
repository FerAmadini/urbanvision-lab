# Guía de demo para la entrevista (20-30 minutos)

Material de apoyo para presentar UrbanVision Lab ante Asociación Sustentar.
Regla de oro: **nunca bluffear**. Si algo no se sabe: "no lo trabajé todavía,
lo entiendo hasta acá y lo abordaría así…". La honestidad técnica es parte del
producto.

## Antes de la entrevista (setup, 5 minutos)

1. Levantar backend y frontend (ver README raíz) y dejar ambos corriendo.
2. Procesar 2-3 imágenes de `backend/sample_images/` desde la UI:
   - `escena_reciclables_01.jpg` (9 detecciones: ideal para auditar en vivo).
   - `contenedores_01.jpg` (0 detecciones: ideal para hablar de limitaciones).
3. Dejar `escena_reciclables_01.jpg` **parcialmente auditada** (2-3 veredictos)
   para que el panel y las métricas ya tengan datos al mostrar.
4. Abrir pestañas listas: panel, detalle de la imagen auditada, historial y
   `http://localhost:8000/docs` (Swagger) por si preguntan por la API.
5. Si hay internet inestable: todo corre local, pero verificar antes que los
   pesos ya están descargados (`backend/weights/yolo11n.pt`).

## Guión sugerido

### Bloque 1 — El problema y el enfoque (3 min)

> "Quise entender el problema que están abordando, así que armé una prueba de
> concepto chica pero completa. No entrené un modelo complejo: usé un YOLO
> preentrenado con total transparencia, porque lo que quería demostrar es otra
> cosa — cómo se convierte un modelo en una herramienta operativa con
> auditoría humana."

Mostrar el panel con métricas ya cargadas.

### Bloque 2 — Pipeline en vivo (7 min)

1. Ir a **Procesar imagen** y arrastrar `escena_reciclables_01.jpg`.
   Narrar: "la imagen viaja por HTTP a un backend FastAPI, que corre
   inferencia con YOLO11n y devuelve JSON con clase, confianza y bounding
   box en coordenadas de la imagen original".
2. Mostrar el resultado: cajas por categoría con color, etiqueta y confianza.
   Mencionar el umbral de confianza configurable.
3. Explicar el filtrado: "YOLO viene preentrenado en COCO, que no tiene clases
   de residuos; filtro a un subconjunto urbano y lo agrupo en reciclable,
   orgánico y voluminoso. El mapeo es una constante editable: en producción se
   reemplaza por su taxonomía real".

### Bloque 3 — Auditoría humana, el corazón (8 min)

1. En el detalle: auditar en vivo una detección **Correcta**, una
   **Incorrecta** y una **Cambiar clase**.
2. Señalar el panel "Modelo vs. auditoría": "el modelo detectó N, la auditoría
   validó M: esta es la precisión percibida de esta imagen".
3. Explicar por qué importa el human-in-the-loop:
   - los modelos de campo se equivocan (luz, ángulo, oclusión);
   - cada corrección humana genera **datos etiquetados** que alimentan el
     próximo entrenamiento (círculo virtuoso);
   - es exactamente la interfaz de auditoría que menciona la búsqueda.
4. Mostrar export JSON/CSV: "el resultado auditado puede alimentar sistemas
   externos o un pipeline de re-entrenamiento".

### Bloque 4 — Limitaciones con contenedores (4 min)

Procesar `contenedores_01.jpg` en vivo: cero detecciones.

> "Esto no es un bug: COCO no conoce la clase contenedor ni residuos
> genéricos. Lo dejo visible a propósito porque marca el siguiente paso real:
> un dataset propio con sus clases, etiquetado y fine-tuning con métricas de
> aceptación. Mi demo demuestra el pipeline y el criterio de producto; el
> modelo específico es el trabajo que ustedes ya tienen en marcha y al que me
> sumaría."

### Bloque 5 — Cierre y perfil (3 min)

> "Mi perfil es desarrollo de producto: frontend, UX, integraciones,
> automatización e IA aplicada. La parte ML la estoy aprendiendo activamente y
> esta demo es parte de eso. Lo que ya puedo garantizar: sé tomar un modelo y
> convertirlo en software usable, documentado y explicable para un equipo no
> técnico."

## Preguntas esperables y respuestas honestas

| Pregunta | Respuesta |
|---|---|
| ¿Por qué YOLO y no otro modelo? | Estándar de industria para detección, rápido (una sola pasada), integración simple con Ultralytics; la variante nano corre en CPU para una demo. |
| ¿Cómo mejorarías el modelo? | Dataset propio con sus clases reales, etiquetado (CVAT/Label Studio/Roboflow), fine-tuning del nano, split de validación y métricas precision/recall/mAP con criterios de aceptación acordados. |
| ¿Qué es mAP? | Métrica estándar de detección que promedia precision-recall a varios umbrales de IoU. En la demo medí validación humana como primer paso; no implementé mAP todavía. |
| ¿Y la estimación de dimensiones? | Sin calibración es una aproximación: una foto pierde profundidad. Con un objeto de referencia se estima escala píxel→cm en un mismo plano, pero perspectiva y ángulo la degradan; producción necesita calibración geométrica. Preferí no simular precisión inexistente. |
| ¿Cómo escala esto? | Cola de inferencia con workers GPU, storage de objetos para imágenes, Postgres, auth por roles, versionado de modelos. Está en docs/ARCHITECTURE.md. |
| ¿Por qué SQLite y no Postgres? | Demo ejecutable en cualquier máquina sin servicios externos; el esquema y las queries migran directo a Postgres. |
| ¿Las coordenadas de las cajas? | Enteros en píxeles de la imagen original; el overlay SVG usa viewBox con esas dimensiones y escala solo. Evita mezclar coordenadas naturales y de pantalla. |
| ¿Qué pasa con la licencia de YOLO? | Ultralytics es AGPL-3.0: aceptable para demo e investigación; uso productivo requiere licencia comercial o evaluar alternativas. Lo dejé documentado. |
| ¿Por qué hay detecciones rechazadas por el modelo con confianza alta? | La confianza mide certeza del modelo, no verdad de campo; por eso existe la auditoría humana y por eso sus métricas de aceptación importan. |
| ¿Esto lo hiciste vos? | Sí: arquitectura, backend, frontend, documentación y decisiones. Usé asistentes de IA como herramienta de trabajo, igual que usaría cualquier herramienta: las decisiones y la verificación son mías. |

## Si algo falla en vivo

- Backend caído: levantarlo de nuevo (`uv run uvicorn app.main:app --port 8000`);
  la UI muestra un mensaje claro de conexión.
- Inferencia lenta en el momento: es la primera inferencia tras arrancar; las
  siguientes son ~100-300 ms. Por eso el setup procesa imágenes antes.
- Sin internet: todo funciona offline si los pesos ya están descargados.
- Plan B absoluto: capturas/gif pregrabados del flujo + este guión.
