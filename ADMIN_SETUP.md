# Configuración del modo administrador

La página usa Supabase Auth para diferenciar dos modos:

- Invitado: entra sin clave y solo consulta información.
- Admin: inicia sesión con correo y clave, y ve acciones para crear, editar y eliminar datos.

## Crear usuario admin

1. Entra a Supabase.
2. Ve a Authentication > Users.
3. Crea un usuario con correo y clave.
4. Si Supabase exige confirmación de correo, confirma el usuario o desactiva temporalmente `Confirm email` para la demo.
5. Usa ese correo y clave en el botón Admin de la página.

## Permisos de base de datos

Para una exposición con RLS desactivado, las escrituras funcionan con la anon key mientras la API REST permita modificar tablas.

Para una publicación más segura, activa RLS y crea policies para que solo usuarios autenticados puedan hacer `INSERT`, `UPDATE` y `DELETE` en tablas administrativas. Los invitados deben conservar solo `SELECT`.

Ejemplo conceptual:

```sql
-- Invitados y admins pueden leer
create policy "lectura_publica" on proceso_curricular
for select using (true);

-- Solo usuarios autenticados pueden escribir
create policy "admin_insert" on proceso_curricular
for insert to authenticated with check (true);

create policy "admin_update" on proceso_curricular
for update to authenticated using (true) with check (true);

create policy "admin_delete" on proceso_curricular
for delete to authenticated using (true);
```

Repite la misma idea para las tablas editables:

- `proceso_curricular`
- `historial_fase`
- `evidencia_documental`
- `plan_estudio`
- `curso`
- `prerrequisito`

## Encuesta pública por QR

La página `encuesta.html` permite que estudiantes, egresados y docentes registren respuestas sin iniciar sesión.

La encuesta necesita:

- `SELECT` en `plan_estudio`, porque carga carreras/planes.
- `SELECT` en `poblacion_objetivo`, porque carga grupos de interés.
- `SELECT` en `pregunta_encuesta`, porque carga el catálogo de preguntas.
- `SELECT` en `pregunta_carrera_poblacion`, porque filtra preguntas por carrera y grupo.
- `SELECT` e `INSERT` en `encuesta_participante`, porque registra el correo y bloquea duplicados.
- `SELECT` e `INSERT` en `respuesta_encuesta`, porque guarda las respuestas vinculadas por `id_participante`.

La tabla de participantes debe existir:

```sql
create table if not exists encuesta_participante (
  id_participante serial primary key,
  correo_institucional varchar not null,
  id_plan int not null references plan_estudio(id_plan),
  id_poblacion int not null references poblacion_objetivo(id_poblacion),
  fecha_registro timestamp default now()
);

alter table respuesta_encuesta
add column if not exists id_participante int references encuesta_participante(id_participante);
```

Policies recomendadas si RLS está activo:

```sql
create policy "feedback_visible" on respuesta_encuesta
for select to anon, authenticated using (true);

create policy "feedback_public_insert" on respuesta_encuesta
for insert to anon with check (true);

create policy "participante_visible" on encuesta_participante
for select to anon, authenticated using (true);

create policy "participante_public_insert" on encuesta_participante
for insert to anon with check (true);

create policy "feedback_admin_update" on respuesta_encuesta
for update to authenticated using (true) with check (true);

create policy "feedback_admin_delete" on respuesta_encuesta
for delete to authenticated using (true);
```

Para `pregunta_carrera_poblacion`, el archivo `preguntas_por_carrera_grupo.sql` incluye la tabla puente, índices y policies de lectura pública.

## Respuestas duplicadas

El frontend bloquea un segundo envío cuando encuentra un participante previo con el mismo:

- `correo_institucional`

Esto evita que una persona responda más de una vez, aunque cambie de carrera o grupo de interés.

Para reforzarlo desde Supabase, revisa `supabase_mejoras_recomendadas.sql`, que incluye un índice único sobre `lower(correo_institucional)` en `encuesta_participante`.

## Mejoras de modelo para sustentar la exposición

El archivo `supabase_mejoras_recomendadas.sql` contiene mejoras alineadas al curso de base de datos:

- Tabla `encuesta_participante` para guardar el correo una sola vez.
- Columna `id_participante` en `respuesta_encuesta`.
- Constraint para dominio `@usmp.pe`.
- Índices para consultas frecuentes del dashboard.
- Índice único para evitar duplicar `codigo_curso` dentro del mismo plan.
- Índice único para evitar participantes duplicados por correo.

Antes de ejecutar índices únicos, revisa que no existan datos duplicados. Si ya existen, corrige esos registros primero.
