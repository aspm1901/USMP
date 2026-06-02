# Resumen para sustentar el proyecto

## Nombre tentativo

Sistema web de gestión curricular y retroalimentación de grupos de interés para la USMP FIA.

## En qué está enfocada la página

La página está enfocada en apoyar el proceso de gestión y mejora curricular de la Facultad de Ingeniería y Arquitectura de la USMP, especialmente el seguimiento del proceso PC01 y la recolección de opiniones de los grupos de interés.

El sistema no es solo una página informativa. Funciona como una vista externa y administrativa conectada a una base de datos en Supabase, donde se puede consultar información curricular, revisar el avance de expedientes, analizar evidencias, administrar preguntas de encuesta y visualizar resultados de feedback.

En términos simples, la página busca responder estas preguntas:

- Qué procesos curriculares están registrados.
- En qué etapa se encuentra cada proceso.
- Qué planes de estudio, cursos, áreas y prerrequisitos están vinculados.
- Qué evidencias existen para sustentar el avance.
- Qué opinan estudiantes, egresados y docentes sobre la carrera o plan evaluado.
- Qué aspectos requieren atención para la toma de decisiones.

## Utilidad principal

La utilidad principal del sistema es convertir información dispersa de gestión curricular en información organizada, consultable y accionable.

Antes, la información podría estar separada en documentos, tablas manuales, formularios o archivos. Con esta página, esos datos se centralizan en una base de datos relacional y se muestran en una interfaz que permite tomar decisiones.

La página sirve para:

- Dar trazabilidad al proceso curricular PC01.
- Registrar y consultar planes de estudio.
- Ver cursos, ciclos, áreas académicas y prerrequisitos.
- Consultar evidencias documentales.
- Recoger feedback de grupos de interés.
- Analizar resultados mediante promedios, alertas y gráficos.
- Diferenciar información actual de información histórica.
- Evitar que la toma de decisiones se base en datos desordenados o incompletos.

## A quiénes está dirigida

### Autoridades o encargados curriculares

Son los usuarios principales del tablero. Necesitan ver información resumida para tomar decisiones: procesos observados, avance promedio, evidencias, feedback bajo, preguntas críticas y carreras que requieren revisión.

### Administradores del sistema

Son quienes gestionan la información. Pueden agregar, editar o quitar registros desde el modo administrador, como planes, cursos, evidencias, prerrequisitos y preguntas de encuesta.

### Estudiantes, egresados y docentes

Participan mediante la encuesta pública. Ellos no administran datos, solo responden preguntas relacionadas con su carrera y grupo de interés.

### Profesor o evaluador del curso

Puede revisar el proyecto como aplicación práctica de teoría y diseño de base de datos: modelo relacional, normalización, relaciones, integridad referencial, tablas puente, consultas y reportes.

## Qué permite hacer actualmente

### En la vista principal

- Consultar el tablero ejecutivo.
- Ver indicadores de procesos curriculares.
- Filtrar por carrera, grupo de interés y plan.
- Consultar prioridades de atención.
- Ver alertas por muestra baja.
- Detectar expedientes sin evidencia.
- Analizar feedback por carrera y grupo.
- Ver semáforo de respuestas.
- Revisar preguntas críticas.
- Consultar seguimiento PC01.
- Ver expedientes y trazabilidad.
- Revisar planes, cursos, prerrequisitos, evidencias y catálogos.

### En modo administrador

- Iniciar sesión como administrador.
- Crear y editar registros.
- Gestionar preguntas de encuesta.
- Asociar preguntas a una carrera y grupo de interés mediante una tabla puente.
- Quitar una pregunta de una carrera/grupo sin eliminar respuestas históricas.

### En la encuesta pública

- Ingresar correo institucional.
- Escoger carrera evaluada.
- Escoger tipo de participante: estudiante, egresado o docente.
- Cargar preguntas según carrera y grupo de interés.
- Responder con escala del 1 al 5.
- Agregar comentarios opcionales.
- Evitar respuestas duplicadas por correo, plan y grupo.
- Guardar las respuestas en Supabase.

## Enfoque de base de datos

El proyecto está planteado como una base de datos relacional. No se guarda todo en una sola tabla porque eso generaría duplicidad, problemas de actualización y pérdida de integridad.

La información se separa en entidades:

- `carrera`
- `plan_estudio`
- `curso`
- `area_academica`
- `ciclo_academico`
- `prerrequisito`
- `proceso_curricular`
- `catalogo_paso`
- `historial_fase`
- `actor_institucional`
- `evidencia_documental`
- `poblacion_objetivo`
- `pregunta_encuesta`
- `pregunta_carrera_poblacion`
- `respuesta_encuesta`

Cada tabla tiene un propósito específico. Eso permite que la base sea más mantenible y más cercana a un diseño normalizado.

## Por qué existe una tabla para carreras

La tabla `carrera` permite normalizar las carreras. Si la carrera se escribiera directamente en muchas tablas, se repetiría texto como "Ingeniería Civil", "Ing. Civil" o "Civil", causando inconsistencias.

Con una tabla de carreras, otras tablas pueden relacionarse mediante `id_carrera`, lo que mejora la integridad y facilita consultas.

## Por qué las preguntas no tienen directamente una carrera

Las preguntas están en `pregunta_encuesta`, pero la relación con carrera y grupo de interés se maneja en `pregunta_carrera_poblacion`.

Esto se hizo porque una pregunta puede:

- Usarse en una sola carrera.
- Usarse en varias carreras.
- Usarse para estudiantes, egresados o docentes.
- Reutilizarse sin duplicar texto.

La tabla `pregunta_carrera_poblacion` funciona como tabla puente. Relaciona:

- `id_pregunta`
- `id_carrera`
- `id_poblacion`

Eso permite responder: "Esta pregunta corresponde a esta carrera y a este grupo de interés".

## Por qué las respuestas se guardan por plan

La encuesta muestra la carrera al usuario, pero internamente guarda `id_plan` en `respuesta_encuesta`.

Esto es importante porque una carrera puede tener varias versiones de plan de estudio:

- Histórico
- Vigente
- En revisión
- Propuesta

Si solo se guardara la carrera, no se sabría qué versión curricular fue evaluada. Al guardar el plan, se puede analizar el feedback de una versión específica.

Ejemplo:

Si Ingeniería Civil tuvo un plan 2021 histórico y un plan 2025 vigente, las respuestas actuales deben asociarse al plan vigente o activo, no al histórico.

## Por qué el tablero no debe mostrar todo igual

El tablero está pensado para tomar decisiones actuales. Por eso diferencia entre:

- Información operativa general.
- Información histórica.
- Información útil para encuestas.

Los indicadores generales pueden mostrar planes no históricos aunque estén en distintos pasos del proceso. Pero las gráficas de encuesta se enfocan en planes que todavía están en etapa de captar información de grupos de interés.

Esto evita que información antigua o ya cerrada afecte decisiones actuales.

## Qué significa la muestra baja

La alerta de muestra baja aparece cuando hay pocos registros de respuesta para un grupo. Esto es importante porque un promedio con una sola respuesta puede ser engañoso.

Por ejemplo, si una carrera tiene promedio 2.0 pero solo una respuesta, no se puede concluir con la misma fuerza que si tuviera 50 respuestas. Por eso el sistema muestra una advertencia para interpretar mejor los datos.

## Escala de encuesta

La encuesta usa escala Likert de 1 a 5:

- 1: Totalmente en desacuerdo.
- 2: En desacuerdo.
- 3: Neutral.
- 4: De acuerdo.
- 5: Totalmente de acuerdo.

Esta escala permite convertir opiniones en datos numéricos medibles. Así se pueden calcular promedios, detectar preguntas críticas y crear gráficos.

## Fortalezas del proyecto

- Usa una base de datos relacional.
- Aplica normalización.
- Usa tablas puente para relaciones muchos a muchos.
- Tiene vista pública y vista administrativa.
- Permite análisis con gráficos.
- Diferencia datos históricos de datos accionables.
- Recoge opiniones de grupos de interés.
- Valida duplicados por correo, plan y grupo.
- Permite mantener trazabilidad del proceso PC01.
- Está conectado a Supabase, por lo que los datos no son estáticos.

## Posibles preguntas del profesor y respuestas

### 1. ¿Cuál es el problema que resuelve el sistema?

Resuelve la falta de centralización y trazabilidad en la gestión curricular. Permite registrar procesos, planes, cursos, evidencias y feedback de grupos de interés en una base de datos organizada.

### 2. ¿Por qué no se hizo todo en una sola tabla?

Porque una sola tabla generaría redundancia, inconsistencias y anomalías de inserción, actualización y eliminación. El diseño separa entidades como carrera, plan, curso, pregunta y respuesta para mantener integridad y facilitar consultas.

### 3. ¿Qué evidencia hay de normalización?

Las carreras están separadas en `carrera`, los planes en `plan_estudio`, los cursos en `curso`, las preguntas en `pregunta_encuesta` y las respuestas en `respuesta_encuesta`. Además, las relaciones complejas se manejan con tablas puente como `pregunta_carrera_poblacion` y `prerrequisito`.

### 4. ¿Por qué existe `pregunta_carrera_poblacion`?

Porque una pregunta puede corresponder a una carrera y grupo específico. También permite reutilizar preguntas sin duplicarlas. Es una tabla puente que resuelve la relación entre preguntas, carreras y poblaciones objetivo.

### 5. ¿Por qué la respuesta guarda `id_plan` y no solo `id_carrera`?

Porque una carrera puede tener varias versiones de plan. Guardar `id_plan` permite saber exactamente qué versión curricular fue evaluada.

### 6. ¿Qué pasa si una carrera tiene varios planes?

El sistema puede diferenciar planes por año y estado. Para encuesta pública se debe usar el plan principal activo o vigente. Los planes históricos se conservan para consulta, pero no deben afectar las decisiones actuales.

### 7. ¿Cómo evitan respuestas duplicadas?

El frontend valida si ya existe una respuesta con el mismo correo institucional, plan y grupo de interés. Además, se recomienda reforzarlo en la base de datos con un índice único parcial.

### 8. ¿Por qué se pide correo institucional?

Para reducir duplicidad y asegurar que la participación venga de usuarios vinculados a la universidad. No se usa como login, sino como control de participación.

### 9. ¿Por qué los comentarios son opcionales?

Porque la parte medible de la encuesta son los valores numéricos del 1 al 5. Los comentarios ayudan a interpretar, pero no todos los usuarios necesitan escribir uno. Eso reduce fricción y evita almacenar texto innecesario.

### 10. ¿Por qué se usa una escala de 1 a 5?

Porque permite medir percepción de manera cuantitativa. Con esos valores se pueden calcular promedios, clasificar resultados y detectar puntos críticos.

### 11. ¿Qué utilidad tienen los gráficos?

Los gráficos convierten respuestas individuales en información resumida. Permiten ver rápidamente carreras con bajo promedio, distribución de respuestas y preguntas críticas.

### 12. ¿Qué significa que el tablero sea accionable?

Significa que no muestra todo indiscriminadamente. Prioriza información útil para tomar decisiones actuales, como procesos observados, falta de evidencia, feedback bajo y muestra insuficiente.

### 13. ¿Por qué conservar información histórica?

Porque sirve para auditoría, comparación y trazabilidad. Aunque no siempre debe aparecer en el tablero principal, sí debe existir para consulta y respaldo.

### 14. ¿Dónde se ve la trazabilidad del proceso?

En las tablas `proceso_curricular`, `historial_fase`, `catalogo_paso`, `actor_institucional` y `evidencia_documental`. Estas permiten saber qué paso se ejecutó, cuándo, por quién y con qué evidencia.

### 15. ¿Qué tipo de relación hay entre plan y curso?

Un plan puede tener muchos cursos. Cada curso pertenece a un plan. Es una relación uno a muchos.

### 16. ¿Qué tipo de relación hay entre curso y prerrequisito?

Es una relación recursiva entre cursos. Un curso puede tener cursos previos y un curso puede ser prerrequisito de otros. Por eso se usa la tabla `prerrequisito`.

### 17. ¿Qué tipo de relación hay entre pregunta, carrera y población?

Es una relación compuesta manejada por tabla puente. Una pregunta puede asignarse a una carrera y grupo, y una carrera/grupo puede tener muchas preguntas.

### 18. ¿Qué tipo de relación hay entre pregunta y respuesta?

Una pregunta puede tener muchas respuestas. Cada respuesta pertenece a una pregunta específica.

### 19. ¿Qué pasaría si se elimina una pregunta que ya tiene respuestas?

No debería eliminarse físicamente si ya tiene historial. Por eso es mejor quitar la asociación en `pregunta_carrera_poblacion`, conservando las respuestas históricas.

### 20. ¿Qué mejora de seguridad recomendarías?

Activar RLS en Supabase, permitir lectura pública solo donde sea necesario, permitir `INSERT` anónimo solo en `respuesta_encuesta` y restringir `UPDATE`/`DELETE` a administradores autenticados.

## Respuestas útiles para defender decisiones

### Si el profesor dice: "Esto parece solo una página web"

Respuesta:

La página es la capa de presentación. Lo importante del proyecto está en cómo se estructura, consulta y administra la información en la base de datos. La interfaz permite demostrar el uso real del modelo relacional: relaciones, filtros, reportes, formularios y operaciones CRUD.

### Si el profesor dice: "Por qué no usan solo Excel"

Respuesta:

Excel puede servir para registrar datos simples, pero no garantiza integridad referencial, control de duplicados, relaciones entre entidades ni consultas estructuradas. Una base de datos relacional permite mantener consistencia entre carreras, planes, cursos, preguntas y respuestas.

### Si el profesor dice: "Por qué tanta tabla"

Respuesta:

Porque cada tabla representa una entidad distinta. Separar entidades reduce redundancia y evita anomalías. Por ejemplo, si una carrera cambia de nombre, se actualiza en una sola tabla y no en todas las respuestas o cursos.

### Si el profesor dice: "La encuesta debería guardar carrera y no plan"

Respuesta:

El usuario percibe la carrera, pero académicamente se evalúa una versión curricular. Por eso la respuesta se guarda con `id_plan`. Si solo se guardara carrera, no se podría saber qué plan fue evaluado.

### Si el profesor dice: "Los comentarios no son medibles"

Respuesta:

Correcto. Por eso el dato principal es el valor numérico de 1 a 5. Los comentarios son complementarios y sirven para interpretación cualitativa, no para el indicador principal.

### Si el profesor dice: "Con pocas respuestas el promedio no es confiable"

Respuesta:

También lo consideramos. Por eso el tablero muestra la alerta de muestra baja cuando hay pocos registros. El promedio se muestra, pero se advierte que debe interpretarse con cuidado.

### Si el profesor dice: "Por qué el tablero no muestra todo"

Respuesta:

Porque el tablero principal está orientado a decisiones actuales. La información histórica se conserva en consultas, pero no debe mezclarse con alertas actuales porque puede distorsionar prioridades.

### Si el profesor dice: "Qué aporta esto al proceso curricular"

Respuesta:

Aporta trazabilidad, evidencia y retroalimentación. Permite saber qué se está modificando, en qué etapa está, qué evidencia existe y qué opinan los grupos de interés.

## Limitaciones actuales

- El sistema depende de permisos correctamente configurados en Supabase.
- La validación de duplicados existe en frontend, pero debe reforzarse con índice único en la base de datos.
- La calidad del análisis depende de la cantidad de respuestas recibidas.
- La encuesta asume que existe un plan principal activo por carrera.
- Para producción, debe revisarse seguridad con RLS y políticas más estrictas.

## Mejoras futuras

- Agregar control de roles más detallado.
- Crear reportes exportables en PDF.
- Agregar más validaciones en base de datos.
- Implementar auditoría de cambios administrativos.
- Crear panel comparativo entre planes históricos y vigentes.
- Mejorar métricas por periodo académico.
- Agregar indicadores de participación esperada vs participación real.

## Conclusión para exposición

Este proyecto demuestra cómo una base de datos relacional puede aplicarse a un caso real de gestión curricular. No solo almacena datos, sino que permite organizar procesos, relacionar entidades, recoger retroalimentación y convertir esa información en indicadores para la toma de decisiones.

La página está dirigida a autoridades, administradores y grupos de interés. Su valor está en que combina trazabilidad del proceso PC01 con encuestas y análisis de feedback, manteniendo una estructura de datos normalizada y útil para consulta, administración y mejora continua.
