-- Mejoras recomendadas para sustentar el proyecto de base de datos.
-- Ejecutar en Supabase SQL Editor cuando quieras endurecer validaciones.

-- 1. La encuesta publica registra primero al participante y luego sus respuestas.
-- El correo vive en encuesta_participante para no repetirlo por cada pregunta.
create table if not exists encuesta_participante (
  id_participante serial primary key,
  correo_institucional varchar not null,
  id_plan int not null references plan_estudio(id_plan),
  id_poblacion int not null references poblacion_objetivo(id_poblacion),
  fecha_registro timestamp default now()
);

alter table respuesta_encuesta
add column if not exists id_participante int references encuesta_participante(id_participante);

-- 2. Reglas de correo institucional y duplicado global por correo.
alter table encuesta_participante
drop constraint if exists encuesta_participante_correo_usmp_chk;

alter table encuesta_participante
add constraint encuesta_participante_correo_usmp_chk
check (lower(correo_institucional) like '%@usmp.pe') not valid;

create unique index if not exists ux_encuesta_participante_correo
on encuesta_participante (lower(correo_institucional));

grant select, insert on encuesta_participante to anon;
grant usage, select on sequence encuesta_participante_id_participante_seq to anon;

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

create index if not exists idx_respuesta_encuesta_participante
on respuesta_encuesta (id_participante);

create index if not exists idx_encuesta_participante_correo
on encuesta_participante (lower(correo_institucional));

-- 4.1. Migracion opcional: si ya existen respuestas antiguas con correo directo,
-- crea participantes y enlaza esas respuestas con id_participante.
with legacy_participants as (
  select distinct on (lower(correo_institucional))
    lower(correo_institucional) as correo_institucional,
    id_plan,
    id_poblacion,
    fecha_respuesta as fecha_registro
  from respuesta_encuesta
  where correo_institucional is not null
  order by lower(correo_institucional), fecha_respuesta asc
)
insert into encuesta_participante (correo_institucional, id_plan, id_poblacion, fecha_registro)
select correo_institucional, id_plan, id_poblacion, fecha_registro
from legacy_participants
on conflict do nothing;

update respuesta_encuesta respuesta
set id_participante = participante.id_participante
from encuesta_participante participante
where respuesta.id_participante is null
  and respuesta.correo_institucional is not null
  and lower(respuesta.correo_institucional) = lower(participante.correo_institucional);

-- 4.2. Cuando la migracion anterior ya haya llenado id_participante,
-- el correo deja de pertenecer a respuesta_encuesta.
alter table respuesta_encuesta
drop column if exists correo_institucional;

-- 5. Evita duplicar el mismo codigo de curso dentro de un mismo plan.
-- Si ya hay duplicados, revisar primero la pestana "Auditoria BD" antes de ejecutar.
create unique index if not exists ux_curso_plan_codigo
on curso (id_plan, codigo_curso);

-- 6. Evita duplicar la misma respuesta por pregunta dentro de un participante.
drop index if exists ux_respuesta_encuesta_correo_plan_poblacion;
drop index if exists ux_respuesta_encuesta_correo_plan_poblacion_pregunta;

create unique index if not exists ux_respuesta_encuesta_participante_pregunta
on respuesta_encuesta (id_participante, id_pregunta)
where id_participante is not null;
