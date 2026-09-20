# Repaso para la entrevista — conceptos y respuestas

Material de estudio personal. Complementa a
[GUIA_DEMO_ENTREVISTA.md](GUIA_DEMO_ENTREVISTA.md) (guión de puesta en escena):
este documento explica **qué es cada cosa** y **cómo responder las preguntas
duras**. Regla de oro en todo momento: **nunca bluffear**. Si algo no se
sabe: *"no lo trabajé todavía, lo entiendo hasta acá y lo abordaría así…"*.

---

## 1. Conceptos desde cero

### Visión por computadora (Computer Vision)

Una computadora ve una imagen como una grilla gigante de números (píxeles con
valores de color). Computer Vision es lograr que, a partir de esos números,
entienda *"acá hay una botella"*.

Analogía: a un nene no le explicás qué es un perro con reglas ("tiene 4 patas y
ladra" — una silla también tiene 4 patas). Le mostrás **muchos perros** hasta
que aprende. La computadora igual: **aprende con ejemplos, no con reglas
escritas a mano**.

### Modelo

Un programa que, en vez de ser escrito con reglas fijas, **aprendió de
ejemplos**. Por dentro tiene millones de numeritos ajustables (**pesos**) que
se calibraron durante el entrenamiento.

### Entrenamiento vs. inferencia

- **Entrenar** = estudiar para el examen: ajustar los pesos viendo miles de
  imágenes etiquetadas.
- **Inferir** = rendir el examen: usar el modelo ya entrenado con una imagen
  nueva.
- **La demo hace SOLO inferencia.** El modelo ya viene aprendido; nosotros lo
  usamos.

### YOLO

**YOLO = "You Only Look Once"** ("mirás una sola vez"). Familia de modelos de
**detección** de objetos, de lo más usado en la industria. Su gracia: mira la
imagen **una sola vez** y encuentra todos los objetos a la vez → rapidísimo,
incluso en CPU sin placa de video.

- **YOLO11n**: la "n" es de *nano* — la versión más chica y rápida (~6 MB,
  100-300 ms por imagen en CPU).
- **Ultralytics**: la empresa/librería que mantiene YOLO y da las herramientas
  (entrenar, predecir, exportar). **Ultralytics es una herramienta, no el
  modelo** (ver sección 2).

### Modelo preentrenado y COCO

Entrenar desde cero cuesta días y miles de imágenes etiquetadas. Pero alguien
ya hizo ese trabajo y lo publicó:

- **COCO**: dataset famoso con ~330.000 imágenes de objetos cotidianos,
  etiquetadas a mano, en **80 categorías** (botella, taza, persona, auto…).
- Un modelo **preentrenado en COCO ya sabe reconocer esas 80 clases**.
- **La demo usa YOLO11n preentrenado en COCO tal cual, sin entrenar nada.**

### Detección vs. clasificación vs. segmentación (vocabulario del puesto)

| Tarea | Qué responde |
|---|---|
| **Clasificación** | "En esta foto hay una botella" (toda la imagen, sin decir dónde) |
| **Detección** | "Hay 3 botellas, y cada una está **acá**" → rectángulos (bounding boxes). ← **esto hace la demo** |
| **Segmentación** | El **contorno exacto** del objeto, píxel por píxel |

### Qué devuelve el modelo por cada objeto

1. **Bounding box**: rectángulo `[x1, y1, x2, y2]` en **píxeles de la imagen
   original** (esquina superior izquierda e inferior derecha).
2. **Clase**: qué es ("bottle", "cup"…).
3. **Confianza**: número de 0 a 1 = qué tan seguro está (0.89 = 89 %). Se
   filtra con un umbral (0.40 en la demo, configurable).

Todo se entrega en **JSON**: el formato de texto estándar para que dos
programas se pasen datos estructurados. Es el "idioma" de la web.

### API, backend, frontend

- **API** = un menú de restaurante para programas: hacés un pedido (*request*:
  "acá va una imagen") y te traen el plato (*response*: "acá van las
  detecciones"). No importa cómo cocina la cocina: importa el **contrato**.
- **Backend** = lo que corre en el servidor y el usuario no ve: Python +
  FastAPI + modelo + base de datos.
- **Frontend** = lo que el usuario ve y toca en el navegador: Next.js +
  TypeScript + Tailwind.
- **FastAPI**: framework moderno de Python para crear APIs. La búsqueda lo
  menciona explícitamente → por eso se usó.

### Persistencia

Guardar los datos para que no se pierdan al cerrar la app. **SQLite** = base
de datos en un solo archivo, sin instalar servidores (perfecta para demo).
Guarda: imágenes, detecciones y auditorías (los veredictos viven en cada
detección).

### Human-in-the-loop ("un humano en el ciclo")

El modelo **propone**, la persona **dispone** (acepta, rechaza, reclasifica,
elimina). Por qué es el corazón del puesto:

1. **Los modelos se equivocan** en campo (luz, ángulo, oclusión). Si una
   decisión importa, alguien valida.
2. **Cada corrección humana genera datos etiquetados** que alimentan el
   próximo entrenamiento → **círculo virtuoso**: modelo → auditoría → mejores
   datos → mejor modelo.
3. Es **literalmente lo que pide la búsqueda**: "interfaz de procesamiento y
   auditoría de imágenes".

### Dataset, etiquetado, anotación

Imágenes con **etiquetas**: un humano marcó dónde está cada objeto y qué es.
Sin datos etiquetados no hay entrenamiento. Herramientas: **CVAT, Label
Studio, Roboflow** (las tres aparecen como deseables en la búsqueda).

**Dato clave: Sustentar ya tiene este trabajo en marcha** (definición de
clases, captura de datos, primeras pruebas de entrenamiento).

### Fine-tuning

Agarrar un modelo preentrenado y **seguir entrenándolo con TUS datos** para
que aprenda TUS clases. Como un médico generalista que se especializa.

### Métricas

- **En la demo** (derivadas de la auditoría humana): aceptadas, rechazadas,
  reclasificadas, eliminadas, confianza promedio y
  **accuracy = validadas / auditadas**.
- **En ML profesional**:
  - *precision*: de lo que el modelo detectó, cuánto era verdad.
  - *recall*: de todo lo que realmente había, cuánto encontró.
  - *mAP*: métrica estándar de detección que combina ambas a varios umbrales
    de solapamiento (IoU).
- Nivel conceptual: sí se maneja. Implementadas: no todavía → decirlo así,
  sin inflar.

---

## 2. El mapa conceptual que NO hay que confundir

| Concepto | Qué es | Analogía |
|---|---|---|
| **Ultralytics** | Librería / toolkit (herramienta para entrenar, predecir, exportar YOLO) | La caja de herramientas |
| **YOLO11n.pt (COCO)** | Modelo **genérico** preentrenado en 80 clases cotidianas | La lamparita de prueba |
| **Sus imágenes etiquetadas** | Dataset de entrenamiento con **sus clases reales** (cartón, PET, vidrio…) | El combustible |
| **Fine-tuning** | Proceso que crea **su modelo** a partir del dataset | Fabricar la lamparita |
| **`best.pt`** | **Su modelo productivo**: sí distingue cartón vs PET vs vidrio | La lamparita real |
| **La demo (UrbanVision Lab)** | Plataforma que consume **cualquier** modelo: API + UI + auditoría + métricas | **El enchufe** |

Frase para decirlo:

> *"La demo usa un YOLO preentrenado en COCO **solo para demostrar el pipeline
> completo** (upload → inferencia → auditoría → métricas). No es su modelo
> productivo. Cuando terminen de etiquetar su dataset y hagan fine-tuning —con
> Ultralytics, YOLO-NAS, RT-DETR, lo que elijan—, ese `best.pt` reemplaza al
> genérico con una línea de configuración. La plataforma ya está lista para
> recibir su modelo real."*

¿Es necesario Ultralytics para entrenar su modelo? **No es la única opción**:
YOLO-NAS y RT-DETR (Apache-2.0), MMDetection/Detectron2 (Apache/MIT), PyTorch
puro (BSD). Para un organismo público, licencias permisivas (Apache/MIT) son
legalmente más simples que AGPL-3.0 → vale evaluarlas desde el día 1.

---

## 3. El pipeline narrado (para contar señalando la pantalla)

1. El usuario arrastra una foto de la calle → frontend Next.js.
2. La foto viaja por HTTP a la API → `POST /api/predict`.
3. FastAPI recibe la imagen y llama al modelo YOLO11n (cargado una sola vez
   al arrancar).
4. YOLO hace **inferencia** (~100-300 ms en CPU).
5. Devuelve JSON: clase, confianza y bounding box por objeto (filtrado al
   subconjunto urbano y al umbral de confianza).
6. El frontend dibuja los rectángulos sobre la imagen (SVG con viewBox en
   coordenadas originales → escalan solas).
7. Una **persona** revisa cada detección: correcta / incorrecta / cambiar
   clase / eliminar, con comentario.
8. La auditoría se guarda y la plataforma calcula métricas: *"el modelo
   detectó 8, el auditor validó 6 → 75 %"*. Exportable a JSON/CSV.

---

## 4. Limitaciones honestas (decirlas ANTES de que las pregunten)

| Limitación | Cómo se dice |
|---|---|
| COCO no tiene clases de residuos (cartón, lata, bolsa, contenedor) | *"Por eso las fotos de contenedores dan cero detecciones: lo dejo visible a propósito. Un modelo productivo necesita su dataset con sus clases — el trabajo que ustedes ya tienen en marcha."* |
| Estimación de dimensiones reales | *"Con una sola foto la profundidad es ambigua. Aproximación con objeto de referencia de dimensión conocida (escala píxel→cm en el mismo plano); producción requiere calibración geométrica de cámara o múltiples vistas. No simulo precisión que no existe."* |
| Licencia Ultralytics AGPL-3.0 | Ver pregunta 3 abajo. |
| SQLite, sin auth, sin colas | *"Simplificaciones deliberadas de demo, documentadas; el esquema y las queries migran directo a Postgres + storage de objetos."* |

---

## 5. Las preguntas duras y sus respuestas pulidas

### Q1 — "¿Cómo estimarías dimensiones reales desde una foto sin calibración conocida?"

> *"Se usa un **objeto de referencia de dimensión conocida** en el mismo plano
> del objeto a medir, para calcular la **escala píxel→cm**. Con una sola foto
> la profundidad es ambigua, así que la demo muestra la aproximación y
> documenta la limitación. Para producción se requiere **calibración
> geométrica de cámara** (intrínsecos/extrínsecos) o **múltiples vistas /
> estéreo**; no simulo precisión que no existe."*

### Q2 — "El modelo detecta botellas pero no distingue PET de vidrio. ¿Cómo lo resolvés?"

> *"Con **su taxonomía propia** (que ya tienen definida) y etiquetado en
> **CVAT / Label Studio / Roboflow**. Fine-tuning de YOLO con **data
> augmentation fuerte** para campo no controlado (luz, ángulo, fondo).
> Métricas: **precision/recall por clase, mAP y matriz de confusión
> PET↔vidrio**, con **criterios de aceptación** definidos antes de producir
> (ej.: recall PET ≥ 0.85). Si hay desbalance de clases, weighted loss y
> sampling balanceado: el volumen ayuda, pero la calidad de etiquetas y el
> balance importan más."*

### Q3 — "Ultralytics es AGPL-3.0. ¿Cómo lo ponés en producción?"

> *"Para **uso interno del equipo** no hay problema: AGPL obliga a liberar
> código al **distribuir** software o ofrecerlo como servicio a terceros. Para
> el Producto 3 (consulta de terceros) hay tres caminos: (1) **licencia
> comercial de Ultralytics**; (2) **alternativa permisiva** — exportar a ONNX
> con ONNX Runtime (MIT) o usar YOLO-NAS / RT-DETR (Apache-2.0) y re-entrenar;
> (3) **aislar el modelo en un microservicio** que solo exponga HTTP/JSON, con
> el backend propietario hablando por REST (con opinión legal previa). Mi
> recomendación pragmática: arrancar con uso interno y decidir 1 vs 2 vs 3
> cuando definan el roadmap del Producto 3, con su abogado. No bloqueo el
> desarrollo por esto."*

### Q4 — "¿Ultralytics es necesario si ya tenemos nuestras imágenes? ¿Para qué sirve la plataforma?"

> *"Son cosas distintas. Sus imágenes etiquetadas son el **combustible** para
> crear **su modelo** mediante fine-tuning; Ultralytics es solo **una** de las
> herramientas posibles para ese entrenamiento. Mi plataforma es el
> **enchufe**: la infraestructura (API, visualización, auditoría, métricas,
> export) que consume el modelo que sea. Hoy corre con un modelo genérico de
> prueba para demostrar el flujo; cuando exista su `best.pt`, se enchufa y la
> misma plataforma valida el modelo en campo, corrige sus errores y **sigue
> alimentando su dataset con cada corrección humana**."*

---

## 6. Frases ganadoras (narrativa)

**Apertura (3 min):**

> *"Quise entender el problema que están abordando, así que armé una prueba de
> concepto chica pero completa. No entrené un modelo complejo — usé un YOLO
> preentrenado con total transparencia — porque lo que quería demostrar es
> otra cosa: cómo se convierte un modelo en una **herramienta operativa con
> auditoría humana**, que es lo que un equipo no técnico puede usar todos los
> días."*

**Con el dato de su dataset:**

> *"Sé que ustedes vienen armando su propio dataset etiquetado con las clases
> reales de residuos. Mi demo no intenta reemplazar eso: **lo complementa**.
> La auditoría humana que armé es la herramienta para validar su modelo cuando
> esté listo, corregirlo en campo y seguir alimentando su dataset con cada
> corrección. Yo me sumo a **ese ciclo**, no vengo a inventar otro paralelo."*

**Cierre de perfil:**

> *"Mi perfil es desarrollo de producto: frontend, UX, integraciones,
> automatización e IA aplicada. La parte ML la estoy aprendiendo activamente y
> esta demo es parte de eso. Lo que ya puedo garantizar: sé tomar un modelo y
> convertirlo en software usable, documentado y explicable para un equipo no
> técnico."*

---

## 7. Alineación con la búsqueda (para tener presente)

| Piden | La demo / el discurso lo cubre con |
|---|---|
| Detección / segmentación con YOLO | YOLO11n + detección con bounding boxes |
| Exponer modelos como servicio (FastAPI) | Backend FastAPI con 7 endpoints + Swagger |
| Interfaz de auditoría (Producto 2) | Pantallas de procesamiento, auditoría y métricas |
| Pipeline de consulta (Producto 3) | API REST con contrato documentado, lista para terceros |
| Scripts de conteos / integración de outputs | Conteos por clase/categoría + métricas + export |
| Estimación de dimensiones (excluyente) | Entendimiento del problema + limitaciones documentadas (Q1) |
| Datasets de campo no controlados | Augmentation y métricas por clase en el discurso (Q2) |
| CVAT / Label Studio / Roboflow | Mencionadas como siguiente paso del flujo de datos |
| Documentar y capacitar equipo no técnico | README, ARCHITECTURE, guía de demo, UI en español sobrio |

---

## 8. Reglas de oro

1. **Nunca bluffear.** *"No lo sé todavía; lo entiendo hasta acá y lo
   abordaría así…"* vale más que una respuesta falsa mal sostenida.
2. **Cada limitación dicha a tiempo = criterio técnico**, no debilidad.
3. **Narrativa de perfil**: desarrollador de producto que convierte modelos
   en herramientas usables — no "experto en ML".
4. **Su dataset es el activo valioso**; la plataforma propia es el enchufe que
   lo explota.
5. Si algo falla en vivo: contenedores con 0 detecciones, reinicio del
   backend, o capturas pregrabadas (ver GUIA_DEMO_ENTREVISTA.md).
