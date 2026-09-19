# Contexto del proyecto — Demo Computer Vision / ML para entrevista

## 1. Objetivo

Quiero construir una **demo técnica pequeña, funcional y presentable** para una entrevista con **Asociación Sustentar**, equipo de *Gestión Urbana Basada en Datos*.

La demo debe mostrar que, aunque mi experiencia principal está en desarrollo web, UX/UI, integraciones y automatización, puedo **entender, integrar y convertir un modelo de Computer Vision en una herramienta web usable**.

No busco fingir experiencia profunda previa en Machine Learning ni entrenar un modelo complejo desde cero. Busco demostrar:

- capacidad de aprender rápido;
- criterio técnico;
- capacidad de integrar IA con una aplicación real;
- diseño de flujos para usuarios no técnicos;
- comprensión de cómo pasar de un modelo a una herramienta operativa;
- capacidad de documentar y explicar decisiones.

La demo debe poder mostrarse en una entrevista y, si es posible, dejarse publicada para que el equipo pueda probarla.

## 2. Contexto de la búsqueda laboral

La organización está buscando un perfil freelance para trabajar entre octubre y diciembre de 2026, con posibilidad de extensión.

El equipo trabaja en:

1. **Detección y clasificación de materiales reciclables en imágenes controladas.**
2. **Conteo y clasificación de incidencias de higiene urbana en fotografías de campo.**
3. Integración de esos modelos dentro de **aplicaciones web** para uso interno y de terceros.

Ya cuentan con trabajo previo en:

- definición de clases;
- captura de datos;
- primeras pruebas de entrenamiento.

La búsqueda combina Machine Learning / Computer Vision con desarrollo de aplicaciones.

## 3. Qué necesitan técnicamente

Según la búsqueda, esperan que la persona pueda participar en:

### Modelos y procesamiento

- Definir arquitectura de los modelos.
- Definir estrategia de datos.
- Definir métricas de evaluación.
- Definir criterios de aceptación.
- Trabajar con detección y/o segmentación de objetos.
- Trabajar con YOLO.
- Procesar imágenes de campo con variaciones de iluminación, ángulo y fondo.
- Estimar dimensiones reales de objetos a partir de fotografías.
- Integrar espacialmente detecciones.
- Transformar outputs de modelos en conteos y clasificaciones útiles.

### Aplicación web

- Diseñar y desarrollar una plataforma que consuma los modelos.
- Definir cómo se expone la inferencia.
- Diseñar el pipeline de procesamiento.
- Crear una interfaz de procesamiento y auditoría de imágenes.
- Crear una primera plataforma de consulta para terceros.

### Integración / backend

Deseable:

- FastAPI.
- Flask.
- API para servir modelos.
- Pipeline de inferencia.

### Herramientas de dataset

Deseable familiaridad con:

- CVAT.
- Label Studio.
- Roboflow.

### Comunicación

También valoran especialmente:

- documentar decisiones técnicas;
- explicar en lenguaje claro;
- capacitar a un equipo no técnico.

## 4. Productos esperados por la organización

### Producto 1 — Procesamiento de imágenes

Script que permita:

- integrar espacialmente objetos detectados;
- estimar dimensiones;
- convertir outputs del modelo en datos útiles.

### Producto 2 — Interfaz de auditoría

Plataforma que permita:

- procesar imágenes;
- visualizar resultados;
- auditar detecciones;
- evaluar el desempeño de los modelos.

### Producto 3 — Pipeline de consulta

Primera versión de una plataforma para que terceros puedan consultar/procesar imágenes.

### Producto 4 — Integración y transferencia

- integración productiva;
- documentación técnica;
- capacitación al equipo.

## 5. Mi perfil real

Mi nombre es **Fernando Amadini**.

Mi perfil principal es:

- Diseñador Multimedial.
- Frontend Developer.
- UX/UI.
- Automatización.
- IA aplicada.
- Integración de APIs.
- Desarrollo de herramientas internas.
- Consultoría tecnológica.

### Tecnologías principales

Frontend:

- React.
- Next.js.
- TypeScript.
- JavaScript.
- Tailwind CSS.
- MUI.
- React Hook Form.
- Zod.

Backend / datos:

- Laravel.
- PHP.
- MySQL.
- PostgreSQL.
- Supabase.
- APIs REST.

Infraestructura:

- AWS.
- Vercel.
- Docker.
- Linux.

Automatización / IA:

- n8n.
- LLMs.
- ChatGPT.
- Claude.
- Cursor.
- Claude Code.
- GitHub Copilot.
- Vibe Coding.
- Integraciones mediante API.

Diseño:

- UX/UI.
- Figma.
- Adobe.
- Diseño responsive.
- Diseño de flujos y backoffice.

## 6. Experiencia relevante existente

### VES Patagonia

Participé en el desarrollo de una plataforma operativa para una empresa de turismo.

Stack:

- Next.js.
- TypeScript.
- Laravel.
- MySQL.
- AWS.
- Docker.

Funciones desarrolladas:

- autenticación;
- usuarios;
- tarifas;
- hoteles;
- reservas;
- asignaciones;
- cuenta corriente;
- dashboards;
- formularios;
- validaciones;
- APIs;
- PDFs;
- flujos operativos;
- interfaces para usuarios internos.

Este proyecto demuestra que puedo:

- entender procesos reales;
- transformar procesos operativos en software;
- diseñar interfaces internas;
- integrar frontend y backend;
- trabajar con usuarios no técnicos.

### PluMarket

E-commerce / catálogo digital desarrollado con:

- React.
- TypeScript.
- Vite.
- Tailwind.
- Supabase.

Incluye:

- productos;
- variantes;
- categorías;
- marcas;
- carrito;
- panel administrativo;
- autenticación;
- almacenamiento;
- base de datos.

También existe una automatización grande en **n8n**, que conecta distintos procesos y servicios.

La automatización demuestra experiencia en:

- pipelines;
- integración de servicios;
- flujos;
- transformación de datos;
- automatización;
- IA aplicada.

### Sibras

Catálogo B2B con:

- React.
- TypeScript.
- Supabase.
- panel administrativo;
- productos;
- imágenes;
- documentos;
- categorías.

## 7. Limitación actual

No tengo experiencia profesional previa trabajando específicamente como:

- ML Engineer;
- Computer Vision Engineer;
- Data Scientist.

Tampoco debo afirmar experiencia avanzada previa con:

- entrenamiento de YOLO;
- segmentación;
- métricas de modelos;
- estimación geométrica mediante visión;
- datasets de Computer Vision.

Estoy aprendiendo esta parte específicamente para poder entender y abordar el proyecto.

La demo debe ser técnicamente seria, pero **no debe hacer parecer que tengo años de experiencia en Computer Vision**.

## 8. Qué quiero construir para la entrevista

Quiero construir una **mini plataforma de auditoría de detecciones de imágenes** directamente relacionada con el problema de Asociación Sustentar.

Nombre tentativo:

**UrbanVision Lab**

o

**Sustentar Vision Demo**

La demo podría usar como caso de uso:

> detección de residuos / objetos reciclables dentro de fotografías.

No es obligatorio entrenar un modelo propio.

Se puede utilizar:

- un modelo YOLO preentrenado;
- un modelo público;
- un modelo simple;
- un modelo entrenado rápidamente sobre un dataset pequeño;
- una API/modelo existente.

Lo importante es demostrar el **pipeline completo**.

## 9. Flujo ideal de la demo

### Paso 1 — Carga de imagen

El usuario puede:

- arrastrar una imagen;
- seleccionar un archivo;
- cargar una fotografía.

Ejemplo: fotografía de una calle, residuos o materiales.

### Paso 2 — Inferencia

La imagen se envía a un backend.

El backend ejecuta un modelo de detección.

Idealmente:

- YOLO;
- Python;
- FastAPI.

El backend devuelve algo como:

```json
{
  "detections": [
    {
      "class": "bottle",
      "confidence": 0.89,
      "bbox": [120, 80, 260, 340]
    }
  ]
}
```

## 10. Visualización

En el frontend se muestra:

- imagen original;
- bounding boxes;
- nombre de clase;
- confianza;
- cantidad de objetos detectados.

Ejemplo:

```text
Botellas: 3
Cartón: 2
Latas: 1
```

## 11. Auditoría humana

Esta es una parte MUY IMPORTANTE porque se alinea directamente con el puesto.

El usuario debe poder revisar cada detección.

Opciones:

- Correcta.
- Incorrecta.
- Cambiar clase.
- Eliminar detección.
- Agregar comentario.

Ejemplo:

```text
Detección #4

Clase detectada: bottle
Confianza: 67 %

[Correcta]
[Incorrecta]
[Cambiar clase]
```

## 12. Métricas básicas

La plataforma podría mostrar:

- cantidad de detecciones;
- detecciones aceptadas;
- detecciones rechazadas;
- confianza promedio;
- distribución por clase.

No hace falta implementar métricas ML avanzadas si no aportan a la demo.

## 13. Historial

Pantalla opcional:

```text
Imagen          Fecha       Objetos   Auditoría
calle01.jpg     18/09       7         Revisado
calle02.jpg     18/09       4         Pendiente
calle03.jpg     19/09       12        Revisado
```

Esto demuestra una aplicación real y no simplemente una demo de IA.

## 14. Arquitectura sugerida

### Frontend

Preferentemente:

- Next.js.
- TypeScript.
- Tailwind.

Porque es mi stack más fuerte.

### Backend ML

Preferentemente:

- Python.
- FastAPI.
- YOLO / Ultralytics.

Flujo:

```text
Frontend
   ↓
Upload imagen
   ↓
FastAPI
   ↓
Modelo YOLO
   ↓
JSON detecciones
   ↓
Frontend
   ↓
Visualización + auditoría
```

## 15. Persistencia

Para una demo se puede utilizar:

- SQLite;
- Supabase;
- PostgreSQL;
- JSON local.

Datos mínimos:

```text
images
detections
audits
```

No es necesario construir un sistema complejo.

## 16. UX esperada

La interfaz debe parecer una **herramienta profesional interna**, no una demo de hackathon.

Características:

- limpia;
- sobria;
- clara;
- desktop first, pero responsive;
- rápida de entender;
- orientada a usuarios no técnicos.

Pantallas posibles:

### Dashboard

```text
Imágenes procesadas
Detecciones
Pendientes de auditoría
Confianza promedio
```

### Procesar imagen

Carga + inferencia.

### Resultado

Bounding boxes + conteos.

### Auditoría

Validación humana.

### Historial

Procesamientos anteriores.

## 17. Qué NO quiero construir

Evitar:

- dashboard enorme;
- autenticación compleja;
- permisos avanzados;
- sistema multi-tenant;
- arquitectura innecesariamente sofisticada;
- entrenamiento largo de modelos;
- features sin relación con la búsqueda;
- chatbot genérico;
- asistente LLM sin utilidad real.

La demo debe ser:

> pequeña, clara, funcional y directamente relacionada con el trabajo.

## 18. Feature opcional de alto impacto

### Comparación modelo vs auditoría

Mostrar:

```text
Modelo detectó: 8 objetos
Auditor validó: 6

Precisión de esta imagen:
75 %
```

Esto hace visible la importancia del **human-in-the-loop**.

## 19. Feature opcional: exportar resultado

Permitir descargar JSON o CSV.

Ejemplo:

```json
{
  "image": "calle01.jpg",
  "detections": [],
  "validated": true
}
```

Esto puede demostrar que los resultados pueden alimentar sistemas externos.

## 20. Feature opcional: estimación de dimensiones

La búsqueda menciona explícitamente la **estimación de dimensiones reales de objetos a partir de fotografías**.

Esto es un problema más complejo.

Si se implementa, debe hacerse de manera controlada y explicando las limitaciones.

Una primera demo podría pedir al usuario:

1. marcar un objeto de referencia de dimensión conocida;
2. introducir su medida real;
3. calcular una escala aproximada píxel/cm;
4. estimar el tamaño de otro objeto en el mismo plano.

Debe dejar claro que:

- es una aproximación;
- perspectiva y profundidad afectan el cálculo;
- una solución productiva necesita calibración geométrica adecuada.

No inventar precisión.

## 21. Qué quiero demostrar durante la entrevista

La demo debe permitir que pueda decir:

> “Quise entender mejor el problema que están abordando, así que armé una pequeña prueba de concepto. No intenté entrenar un modelo complejo, sino recorrer el flujo completo: cargar una imagen, ejecutar una inferencia, visualizar detecciones y permitir que una persona audite el resultado. Me interesaba especialmente entender cómo convertir un modelo en una herramienta que pueda usar un equipo no técnico.”

Esa es la idea central.

## 22. Narrativa profesional

No quiero presentarme como:

> “Experto en Machine Learning”.

Quiero presentarme como:

> “Desarrollador de producto digital con experiencia en frontend, UX, integraciones, automatización e IA aplicada, capaz de convertir modelos y procesos técnicos en herramientas utilizables.”

Mi diferencial:

- conozco desarrollo web;
- entiendo UX;
- entiendo procesos de negocio;
- puedo hablar con usuarios;
- puedo integrar APIs;
- puedo diseñar interfaces;
- puedo documentar;
- puedo explicar sin tecnicismos;
- aprendo rápido;
- tengo experiencia real implementando software.

## 23. Qué debería hacer la IA que reciba este documento

Quiero que actúes como:

- Senior Computer Vision Engineer;
- ML Engineer;
- Full Stack Engineer;
- Product Designer.

Necesito que me ayudes a construir esta demo.

Antes de escribir código:

1. revisá el objetivo;
2. proponé la arquitectura mínima;
3. definí qué partes son imprescindibles;
4. eliminá cualquier complejidad innecesaria;
5. advertime si alguna decisión técnica es incorrecta;
6. mantené el alcance realizable en pocos días.

Después:

1. proponé estructura del proyecto;
2. prepará frontend y backend;
3. implementá la inferencia;
4. implementá visualización de detecciones;
5. implementá auditoría humana;
6. agregá persistencia mínima;
7. documentá cómo ejecutar todo;
8. documentá qué partes son demo y qué habría que mejorar para producción.

## 24. Criterios de calidad

La demo debe:

- funcionar;
- ser fácil de ejecutar;
- ser fácil de explicar;
- tener código entendible;
- ser visualmente profesional;
- demostrar integración ML + web;
- estar alineada con el problema real de Sustentar;
- evitar sobreingeniería;
- poder desplegarse si es posible;
- dejar claras sus limitaciones.

## 25. Prioridades

Si falta tiempo:

### PRIORIDAD 1

Carga de imagen + inferencia + bounding boxes.

### PRIORIDAD 2

Auditoría humana.

### PRIORIDAD 3

Conteos y métricas simples.

### PRIORIDAD 4

Historial.

### PRIORIDAD 5

Persistencia.

### PRIORIDAD 6

Estimación de dimensiones.

La aplicación debe funcionar antes de agregar features.

## 26. Restricción fundamental

No quiero generar una demo falsa ni simular resultados sin aclararlo.

Si se utiliza:

- modelo preentrenado;
- dataset de ejemplo;
- clases genéricas;

debe estar documentado.

El objetivo es demostrar capacidad de integración y comprensión técnica, no aparentar que ya existe un modelo productivo de residuos urbanos.

## 27. Resultado esperado

Al final quiero tener:

1. repositorio funcional;
2. README;
3. frontend usable;
4. backend de inferencia;
5. ejemplo de imágenes;
6. visualización de detecciones;
7. auditoría;
8. documentación de arquitectura;
9. link público si es posible;
10. material suficiente para mostrar durante una entrevista de 20-30 minutos.

## 28. Primera instrucción para la IA

Comenzá revisando este documento.

No escribas todavía toda la aplicación.

Primero devolveme:

1. arquitectura mínima recomendada;
2. modelo de Computer Vision más conveniente para esta demo;
3. stack final;
4. estructura de carpetas;
5. funcionalidades MVP;
6. funcionalidades opcionales;
7. riesgos técnicos;
8. estimación realista del esfuerzo;
9. plan paso a paso para tener una versión presentable lo antes posible.

Priorizá impacto demostrable sobre complejidad técnica.
