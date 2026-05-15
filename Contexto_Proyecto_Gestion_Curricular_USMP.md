# Contexto del Proyecto: Sistema de Gestión Curricular USMP FIA (Proceso PC01)

Este documento contiene todo el contexto técnico y funcional necesario para continuar con el desarrollo del frontend del proyecto. El objetivo es proporcionar a una IA la base sobre la cual se ha construido el sistema de base de datos en **Supabase** y los requerimientos de la **Vista Externa**.

## 1. Visión General del Proyecto
El sistema tiene como objetivo automatizar y dar trazabilidad al proceso **PC01 (Modificación del Currículo)** de la Facultad de Ingeniería y Arquitectura (FIA) de la Universidad de San Martín de Porres (USMP). 

### Problemática Resuelta:
* Falta de trazabilidad en los 12 pasos administrativos.
* Gestión ineficiente del feedback (encuestas) de alumnos y egresados.
* Necesidad de un historial de al menos 3 ciclos académicos.
* Dificultad para identificar cuellos de botella en la aprobación de nuevas mallas.

---

## 2. Arquitectura de Datos (Modelo de 14 Tablas)
Se ha diseñado y poblado una base de datos relacional en PostgreSQL (vía Supabase) con las siguientes tablas:

### Módulo Académico y Temporal
1.  **AREA_ACADEMICA**: Agrupación de cursos por especialidad.
2.  **CICLO_ACADEMICO**: Niveles de la carrera (I al X).
3.  **PERIODO_ACADEMICO**: Ciclos cronológicos (2024-II, 2025-I, etc.) para mantener historial.
4.  **PLAN_ESTUDIO**: Versiones de las mallas curriculares (Vigente, Histórico, Propuesta).
5.  **CURSO**: Detalle de asignaturas con créditos y modalidad.
6.  **PRERREQUISITO**: Relaciones de dependencia entre cursos.

### Módulo de Indicadores (Feedback)
7.  **POBLACION_OBJETIVO**: Estudiantes, Egresados o Docentes.
8.  **PREGUNTA_ENCUESTA**: Catálogo de preguntas de evaluación (Escala 1-5).
9.  **RESPUESTA_ENCUESTA**: Calificaciones y comentarios reales que detonan la necesidad de cambio.

### Módulo de Flujo Administrativo (Trazabilidad PC01)
10. **ACTOR_INSTITUCIONAL**: Responsables (DUA, CC, UAC, CF, CU).
11. **CATALOGO_PASO**: Los 12 pasos oficiales del proceso administrativo.
12. **PROCESO_CURRICULAR**: Expediente que vincula un plan antiguo con una propuesta nueva.
13. **HISTORIAL_FASE**: Log de auditoría que registra quién aprobó qué paso, cuándo y qué observaciones hubo.
14. **EVIDENCIA_DOCUMENTAL**: Rutas a archivos PDF que sustentan cada paso aprobado.

---

## 3. Estado Actual de la Base de Datos
* **Estructura:** Creada completamente en Supabase.
* **Datos de Prueba (Mock Data):** Inyectados. Existen 5 expedientes de carreras (Sistemas, Civil, Industrial, Arquitectura, Electrónica).
* **Caso de Estudio Clave:** La carrera de **Ingeniería de Computación y Sistemas** está actualmente en estado **'Observado'** en el **Paso 7 (Revisión UAC)** debido a que las sumillas de Inteligencia Artificial no tienen bibliografía actualizada. Esto sirve para demostrar la trazabilidad.
* **Seguridad:** RLS (Row Level Security) desactivado temporalmente para facilitar la conexión del frontend.

---

## 4. Requerimientos del Frontend (Vista de Usuario Final)
El profesor solicita una **Vista Externa de solo lectura** con las siguientes características:

1.  **Tecnología Sugerida:** HTML, CSS, JavaScript (puro) usando **DataTables.net** para los filtros.
2.  **Interactividad:**
    * Buscador global de texto.
    * Filtros por columna (especialmente por Periodo, Carrera y Estado).
    * Ordenamiento de columnas (A-Z, 0-9).
3.  **Estética:**
    * Colores institucionales (Rojo USMP: `#B22222`).
    * Uso de "Badges" de colores para los estados (Verde: Finalizado, Rojo: Observado, Amarillo: En Curso).
    * Diseño limpio tipo Dashboard.
4.  **Conexión:** Uso de la librería `@supabase/supabase-js` para realizar consultas `SELECT` con `JOINs` (vía `.select('..., TABLA_HIJA(...)')`).

---

## 5. Instrucciones para la Implementación (Para la IA de Desarrollo)
1.  **Conexión:** Se deben usar `SUPABASE_URL` y `SUPABASE_ANON_KEY` (el usuario las proporcionará).
2.  **Query Principal:** Consultar la tabla `PROCESO_CURRICULAR` trayendo datos de `PLAN_ESTUDIO`, `PERIODO_ACADEMICO` y el último registro de `HISTORIAL_FASE` con su `CATALOGO_PASO`.
3.  **Visualización:** Renderizar los resultados en una tabla HTML dinámica.
4.  **Filtros:** Asegurar que el usuario pueda ver el historial de los últimos 3 ciclos académicos de forma clara.

---
**Nota para el desarrollador:** El backend ya está blindado. No es necesario realizar operaciones de escritura (`INSERT/UPDATE`), solo optimizar la visualización y la experiencia de usuario en la tabla de filtros.
