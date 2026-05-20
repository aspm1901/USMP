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
- respuesta_encuesta
- prerrequisito
