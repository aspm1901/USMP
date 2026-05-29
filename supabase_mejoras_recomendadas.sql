-- Mejoras recomendadas para sustentar el proyecto de base de datos.
-- Ejecutar en Supabase SQL Editor cuando quieras endurecer validaciones.

-- 1. La encuesta publica valida @usmp.pe en frontend, pero el dato debe quedar
-- persistido en la base para trazabilidad y auditoria.
alter table respuesta_encuesta
add column if not exists correo_institucional varchar;

-- 2. Regla de dominio institucional en la base.
-- NOT VALID evita bloquear la exposicion si ya existen registros antiguos sin correo.
alter table respuesta_encuesta
drop constraint if exists respuesta_encuesta_correo_usmp_chk;

alter table respuesta_encuesta
add constraint respuesta_encuesta_correo_usmp_chk
check (
  correo_institucional is null
  or lower(correo_institucional) like '%@usmp.pe'
) not valid;

-- 3. Indices para consultas del dashboard, filtros y trazabilidad.
create index if not exists idx_proceso_curricular_periodo
on proceso_curricular (id_periodo);

create index if not exists idx_historial_fase_proceso_paso
on historial_fase (id_proceso, id_paso);

create index if not exists idx_evidencia_documental_historial
on evidencia_documental (id_historial);

create index if not exists idx_curso_plan_codigo
on curso (id_plan, codigo_curso);

create index if not exists idx_respuesta_encuesta_plan_pregunta
on respuesta_encuesta (id_plan, id_pregunta);

create index if not exists idx_respuesta_encuesta_correo
on respuesta_encuesta (correo_institucional);

-- 4. Acelera la validacion de duplicados de la encuesta publica.
create index if not exists idx_respuesta_encuesta_correo_plan_poblacion
on respuesta_encuesta (lower(correo_institucional), id_plan, id_poblacion)
where correo_institucional is not null;

-- 5. Evita duplicar el mismo codigo de curso dentro de un mismo plan.
-- Si ya hay duplicados, revisar primero la pestana "Auditoria BD" antes de ejecutar.
create unique index if not exists ux_curso_plan_codigo
on curso (id_plan, codigo_curso);

-- 6. Evita que el mismo correo responda dos veces la misma encuesta
-- para el mismo plan y grupo de interes.
-- Antes de ejecutarlo, elimina duplicados existentes si los hubiera.
create unique index if not exists ux_respuesta_encuesta_correo_plan_poblacion
on respuesta_encuesta (lower(correo_institucional), id_plan, id_poblacion)
where correo_institucional is not null;
