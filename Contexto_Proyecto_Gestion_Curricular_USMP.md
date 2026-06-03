# Contexto del Proyecto: Sistema de Gestión Curricular USMP FIA

Este proyecto implementa una vista web para consultar y administrar información del proceso curricular PC01 de la Facultad de Ingeniería y Arquitectura de la USMP. La aplicación usa HTML, CSS y JavaScript puro, conectándose a Supabase mediante `@supabase/supabase-js`.

## Objetivo

El sistema ayuda a dar trazabilidad al proceso de modificación curricular y a recoger feedback de grupos de interés. La vista principal permite revisar expedientes, planes, cursos, evidencias, prerrequisitos y respuestas de encuesta. La página pública `encuesta.html` permite que estudiantes, egresados y docentes registren feedback por carrera.

## Base de datos

Tablas principales usadas por la aplicación:

- `carrera`: catálogo normalizado de carreras.
- `plan_estudio`: versiones de mallas curriculares. Mantiene `id_carrera` como relación con `carrera`.
- `curso`: cursos por plan, ciclo y área académica.
- `prerrequisito`: relación entre cursos objetivo y cursos previos.
- `poblacion_objetivo`: grupos de interés, como estudiantes, egresados y docentes.
- `pregunta_encuesta`: catálogo de preguntas.
- `pregunta_carrera_poblacion`: tabla puente que define qué preguntas corresponden a cada carrera y grupo de interés.
- `respuesta_encuesta`: respuestas numéricas de la encuesta, comentarios opcionales, correo institucional, plan y grupo.
- `proceso_curricular`, `historial_fase`, `catalogo_paso`, `actor_institucional` y `evidencia_documental`: trazabilidad del proceso PC01.

## Encuesta pública

La encuesta se encuentra en `encuesta.html`.

Comportamiento actual:

- Carga carreras, grupos de interés, preguntas y relaciones desde Supabase.
- Muestra preguntas solo después de escoger carrera/plan y participante.
- Filtra preguntas usando `pregunta_carrera_poblacion`.
- Usa escala de 1 a 5:
  - 1: Totalmente en desacuerdo.
  - 2: En desacuerdo.
  - 3: Neutral.
  - 4: De acuerdo.
  - 5: Totalmente de acuerdo.
- Los comentarios por pregunta son opcionales y están ocultos hasta pulsar `Agregar comentario`.
- Valida correo institucional `@usmp.pe`.
- Resalta la primera pregunta sin responder antes de enviar.
- Bloquea respuestas duplicadas por `correo_institucional` registrado en `encuesta_participante`.

## Consultas y reportes

La sección de feedback del panel principal resume:

- Promedio general.
- Participantes únicos.
- Cantidad de comentarios.
- Carreras con menor promedio.
- Promedio por grupo de interés.
- Categorías con menor puntaje.

La tabla de feedback conserva el detalle de cada respuesta: fecha, correo, plan, población, categoría, puntaje y comentario.

## Archivos relevantes

- `index.html`: vista principal de consulta y administración.
- `encuesta.html`: formulario público de encuesta.
- `assets/js/app.js`: lógica de la vista principal, dashboard, consultas y administración.
- `assets/js/survey.js`: lógica de la encuesta pública.
- `assets/css/styles.css`: estilos compartidos.
- `ADMIN_SETUP.md`: configuración de administración, permisos y encuesta pública.
- `supabase_mejoras_recomendadas.sql`: mejoras recomendadas para constraints e índices.
- `preguntas_por_carrera_grupo.sql`: creación y carga de preguntas por carrera y grupo de interés.

## Notas de seguridad

Para una demo rápida puede funcionar con RLS desactivado, pero para publicación se recomienda:

- Mantener `SELECT` público solo en tablas necesarias para consulta y encuesta.
- Permitir `INSERT` público únicamente en `encuesta_participante` y `respuesta_encuesta`.
- Restringir `UPDATE` y `DELETE` a usuarios autenticados.
- Agregar una restricción única en `encuesta_participante` para reforzar en base de datos el bloqueo de respuestas duplicadas por correo.
- Como mejora futura, crear una tabla `correo_autorizado` para validar que solo respondan correos institucionales previamente habilitados, opcionalmente asociados a un grupo de interés.
