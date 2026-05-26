# Configuracion del modo administrador

La pagina usa Supabase Auth para diferenciar dos modos:

- Invitado: entra sin clave y solo consulta informacion.
- Admin: inicia sesion con correo y clave, y ve acciones para crear, editar y eliminar datos.

## Crear usuario admin

1. Entra a Supabase.
2. Ve a Authentication > Users.
3. Crea un usuario con correo y clave.
4. Si Supabase exige confirmacion de correo, confirma el usuario o desactiva temporalmente "Confirm email" para la demo.
5. Usa ese correo y clave en el boton Admin de la pagina.

## Permisos de base de datos

Para una exposicion con RLS desactivado, las escrituras funcionan con la anon key mientras la API REST permita modificar tablas.

Para una publicacion mas segura, activa RLS y crea policies para que solo usuarios autenticados puedan hacer INSERT, UPDATE y DELETE. Los invitados deben conservar solo SELECT.

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

- proceso_curricular
- historial_fase
- evidencia_documental
- plan_estudio
- curso
- prerrequisito

## Encuesta publica por QR

La pagina `encuesta.html` permite que estudiantes, egresados y docentes registren respuestas sin iniciar sesion. Como se valida correo institucional, primero agrega una columna para no perder ese dato:

```sql
alter table respuesta_encuesta
add column if not exists correo_institucional varchar;
```

Para que funcione con RLS activo, la tabla `respuesta_encuesta` necesita lectura para el dashboard y permiso de insercion para invitados:

```sql
create policy "feedback_visible" on respuesta_encuesta
for select to anon, authenticated using (true);

create policy "feedback_public_insert" on respuesta_encuesta
for insert to anon with check (true);

create policy "feedback_admin_update" on respuesta_encuesta
for update to authenticated using (true) with check (true);

create policy "feedback_admin_delete" on respuesta_encuesta
for delete to authenticated using (true);
```

Tambien conserva `SELECT` publico en `plan_estudio`, `poblacion_objetivo` y `pregunta_encuesta`, porque el formulario necesita cargar planes, grupos de interes y preguntas.
