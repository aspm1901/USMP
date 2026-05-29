-- Preguntas por carrera y grupo de interes.
-- Ejecutar en Supabase SQL Editor.
-- Usa la tabla correcta: pregunta_carrera_poblacion.

create table if not exists pregunta_carrera_poblacion (
  id_pregunta int not null references pregunta_encuesta(id_pregunta) on delete cascade,
  id_carrera bigint not null references carrera(id_carrera) on delete cascade,
  id_poblacion int not null references poblacion_objetivo(id_poblacion) on delete cascade,
  primary key (id_pregunta, id_carrera, id_poblacion)
);

create index if not exists idx_pregunta_carrera_poblacion_carrera
on pregunta_carrera_poblacion (id_carrera);

create index if not exists idx_pregunta_carrera_poblacion_poblacion
on pregunta_carrera_poblacion (id_poblacion);

alter table pregunta_carrera_poblacion enable row level security;

drop policy if exists "pregunta_carrera_poblacion_select_public" on pregunta_carrera_poblacion;
create policy "pregunta_carrera_poblacion_select_public"
on pregunta_carrera_poblacion
for select
to anon, authenticated
using (true);

drop policy if exists "pregunta_carrera_poblacion_admin_insert" on pregunta_carrera_poblacion;
create policy "pregunta_carrera_poblacion_admin_insert"
on pregunta_carrera_poblacion
for insert
to authenticated
with check (true);

drop policy if exists "pregunta_carrera_poblacion_admin_update" on pregunta_carrera_poblacion;
create policy "pregunta_carrera_poblacion_admin_update"
on pregunta_carrera_poblacion
for update
to authenticated
using (true)
with check (true);

drop policy if exists "pregunta_carrera_poblacion_admin_delete" on pregunta_carrera_poblacion;
create policy "pregunta_carrera_poblacion_admin_delete"
on pregunta_carrera_poblacion
for delete
to authenticated
using (true);

with nuevas_preguntas(nombre_carrera, id_poblacion, categoria, texto_pregunta) as (
  values
  -- Arquitectura - Estudiantes
  ('Arquitectura', 1, 'Talleres de diseño', '¿Los talleres de diseño le ayudan a crear proyectos arquitectónicos claros y bien sustentados?'),
  ('Arquitectura', 1, 'Urbanismo', '¿Los cursos le ayudan a entender mejor la ciudad, el barrio y las necesidades de las personas que usan los espacios?'),
  ('Arquitectura', 1, 'Sostenibilidad', '¿En sus cursos se trabaja lo suficiente el uso de áreas verdes, ahorro de energía y cuidado del ambiente?'),
  ('Arquitectura', 1, 'Herramientas de diseño', '¿La carrera le enseña herramientas actuales para representar proyectos, como modelado 3D, renders o BIM?'),
  ('Arquitectura', 1, 'Práctica profesional', '¿Siente que lo preparan para situaciones reales como obra, expedientes, trato con clientes o trámites municipales?'),

  -- Arquitectura - Egresados
  ('Arquitectura', 2, 'Perfil profesional', '¿La formación recibida le permite crear proyectos arquitectónicos adecuados a necesidades contemporáneas?'),
  ('Arquitectura', 2, 'Urbanismo y vivienda', '¿La carrera lo preparó para desarrollar propuestas urbanísticas, vivienda colectiva y espacios públicos?'),
  ('Arquitectura', 2, 'Supervisión de obra', '¿La malla le brindó competencias para supervisar obra y generar informes técnicos adecuados?'),
  ('Arquitectura', 2, 'Diseño de interiores y paisaje', '¿Los contenidos de interiores y paisajismo fueron suficientes para su desempeño profesional?'),
  ('Arquitectura', 2, 'Investigación', '¿La carrera desarrolló su capacidad para investigar problemas del campo arquitectónico y proponer soluciones?'),

  -- Arquitectura - Docentes
  ('Arquitectura', 3, 'Coherencia curricular', '¿Los cursos articulan adecuadamente objetivos académicos, talleres, urbanismo, obra y gestión profesional?'),
  ('Arquitectura', 3, 'Resultados de aprendizaje', '¿Los resultados de aprendizaje evidencian competencias de diseño, investigación y supervisión de obra?'),
  ('Arquitectura', 3, 'Sostenibilidad', '¿La malla incorpora de forma transversal sostenibilidad, patrimonio y responsabilidad social?'),
  ('Arquitectura', 3, 'Evaluación curricular', '¿Los instrumentos de evaluación permiten medir competencias proyectuales y profesionales?'),
  ('Arquitectura', 3, 'Actualización profesional', '¿El plan requiere actualizar contenidos sobre normativa, BIM, gestión urbana o tecnologías de representación?'),

  -- Ing. de Computación y Sistemas - Estudiantes
  ('Ing. de Computación y Sistemas', 1, 'Programación', '¿Los cursos de programación le ayudan a construir aplicaciones o sistemas que funcionen en casos reales?'),
  ('Ing. de Computación y Sistemas', 1, 'Tecnología actual', '¿En la carrera están aprendiendo herramientas actuales como web, bases de datos, cloud, IA o ciberseguridad?'),
  ('Ing. de Computación y Sistemas', 1, 'Proyectos', '¿Los trabajos del curso le permiten practicar con proyectos parecidos a los que se piden en empresas?'),
  ('Ing. de Computación y Sistemas', 1, 'Trabajo en equipo', '¿Los cursos le ayudan a trabajar en equipo, organizar tareas y explicar sus soluciones?'),
  ('Ing. de Computación y Sistemas', 1, 'Laboratorios y software', '¿Cuenta con laboratorios, software o recursos suficientes para practicar lo que aprende?'),

  -- Ing. de Computación y Sistemas - Egresados
  ('Ing. de Computación y Sistemas', 2, 'Empleabilidad', '¿La malla respondió a las competencias que exige actualmente el mercado laboral en tecnología?'),
  ('Ing. de Computación y Sistemas', 2, 'Perfil del egresado', '¿La carrera desarrolló su capacidad para analizar sistemas complejos y aplicar principios de computación?'),
  ('Ing. de Computación y Sistemas', 2, 'Diseño de soluciones', '¿La formación le permitió diseñar, implementar y evaluar soluciones basadas en computación?'),
  ('Ing. de Computación y Sistemas', 2, 'Ética profesional', '¿La carrera reforzó criterios éticos, legales y de responsabilidad profesional en proyectos tecnológicos?'),
  ('Ing. de Computación y Sistemas', 2, 'Soporte y operación', '¿Recibió preparación suficiente para administrar, entregar y dar soporte a sistemas de información?'),

  -- Ing. de Computación y Sistemas - Docentes
  ('Ing. de Computación y Sistemas', 3, 'Coherencia curricular', '¿Los cursos se articulan con los objetivos educacionales y el perfil del egresado del programa?'),
  ('Ing. de Computación y Sistemas', 3, 'Actualización tecnológica', '¿La malla requiere actualizar contenidos de IA, cloud, desarrollo web, datos o ciberseguridad?'),
  ('Ing. de Computación y Sistemas', 3, 'Resultados de aprendizaje', '¿Las evaluaciones permiten medir análisis, diseño, implementación y comunicación efectiva?'),
  ('Ing. de Computación y Sistemas', 3, 'Vinculación con empresas', '¿El plan incorpora suficientes proyectos con empresas, instituciones o problemas reales?'),
  ('Ing. de Computación y Sistemas', 3, 'Aprendizaje autónomo', '¿La malla promueve investigación aplicada y aprendizaje continuo en los estudiantes?'),

  -- Ingeniería Civil - Estudiantes
  ('Ingeniería Civil', 1, 'Cursos base', '¿Los cursos de matemática, física y dibujo le sirven para entender mejor los cursos de la carrera?'),
  ('Ingeniería Civil', 1, 'Práctica y campo', '¿La carrera tiene suficientes prácticas, visitas, laboratorios o ejercicios aplicados a obras reales?'),
  ('Ingeniería Civil', 1, 'Software técnico', '¿En los cursos usa herramientas o software actual para planos, estructuras, costos o gestión de obras?'),
  ('Ingeniería Civil', 1, 'Informes técnicos', '¿Los cursos le ayudan a preparar informes, planos o sustentaciones de manera clara?'),
  ('Ingeniería Civil', 1, 'Seguridad y ambiente', '¿La carrera trata lo suficiente temas de seguridad, impacto ambiental y responsabilidad en obras?'),

  -- Ingeniería Civil - Egresados
  ('Ingeniería Civil', 2, 'Perfil del graduado', '¿La formación recibida desarrolló competencias útiles para su desempeño profesional en ingeniería civil?'),
  ('Ingeniería Civil', 2, 'Pensamiento crítico', '¿La carrera fortaleció su capacidad para analizar contextos, información y hechos de la realidad?'),
  ('Ingeniería Civil', 2, 'Investigación aplicada', '¿La malla lo preparó para realizar investigaciones relacionadas con su profesión?'),
  ('Ingeniería Civil', 2, 'Ética y responsabilidad', '¿La carrera reforzó responsabilidad profesional, seguridad, ambiente y criterios éticos?'),
  ('Ingeniería Civil', 2, 'Empleabilidad', '¿Los contenidos estudiados responden a las demandas actuales de obras, gestión y tecnología civil?'),

  -- Ingeniería Civil - Docentes
  ('Ingeniería Civil', 3, 'Coherencia curricular', '¿La malla articula ciencias básicas, cursos profesionales, práctica e investigación aplicada?'),
  ('Ingeniería Civil', 3, 'Resultados de aprendizaje', '¿Las evaluaciones permiten medir análisis, diseño, comunicación y responsabilidad profesional?'),
  ('Ingeniería Civil', 3, 'Actualización técnica', '¿El plan requiere actualizar contenidos de software, normativa, gestión de obras o sostenibilidad?'),
  ('Ingeniería Civil', 3, 'Perfil del egresado', '¿El perfil de egreso refleja las necesidades actuales del sector construcción e infraestructura?'),
  ('Ingeniería Civil', 3, 'Práctica profesional', '¿Existen suficientes actividades prácticas, laboratorios o proyectos integradores en la malla?'),

  -- Ingeniería Electrónica - Estudiantes
  ('Ingeniería Electrónica', 1, 'Circuitos y práctica', '¿Los cursos de circuitos y electrónica se entienden mejor con prácticas de laboratorio?'),
  ('Ingeniería Electrónica', 1, 'Laboratorios', '¿Los laboratorios tienen equipos suficientes y en buen estado para practicar lo aprendido?'),
  ('Ingeniería Electrónica', 1, 'Tecnología actual', '¿En la carrera trabajan temas actuales como Arduino, sensores, IoT, automatización o sistemas embebidos?'),
  ('Ingeniería Electrónica', 1, 'Proyectos', '¿Los cursos le permiten armar, probar y mejorar prototipos o proyectos electrónicos?'),
  ('Ingeniería Electrónica', 1, 'Software y simuladores', '¿Usa software o simuladores que le ayudan a entender y diseñar circuitos o sistemas electrónicos?'),

  -- Ingeniería Electrónica - Egresados
  ('Ingeniería Electrónica', 2, 'Perfil del egresado', '¿La carrera desarrolló competencias útiles para diseñar, implementar y mantener sistemas electrónicos?'),
  ('Ingeniería Electrónica', 2, 'Actualización tecnológica', '¿Los contenidos recibidos fueron suficientes frente a IoT, automatización, telecomunicaciones y embebidos?'),
  ('Ingeniería Electrónica', 2, 'Laboratorio y práctica', '¿La formación práctica fue suficiente para enfrentar problemas profesionales reales?'),
  ('Ingeniería Electrónica', 2, 'Comunicación técnica', '¿La carrera fortaleció su capacidad para documentar, sustentar y comunicar soluciones técnicas?'),
  ('Ingeniería Electrónica', 2, 'Ética y seguridad', '¿La malla incluyó criterios de seguridad, normativa y responsabilidad profesional?'),

  -- Ingeniería Electrónica - Docentes
  ('Ingeniería Electrónica', 3, 'Coherencia curricular', '¿La secuencia de cursos permite desarrollar progresivamente competencias electrónicas y de automatización?'),
  ('Ingeniería Electrónica', 3, 'Equipamiento', '¿Los laboratorios y recursos disponibles son suficientes para los resultados de aprendizaje esperados?'),
  ('Ingeniería Electrónica', 3, 'Actualización curricular', '¿La malla requiere reforzar IoT, sistemas embebidos, telecomunicaciones o control moderno?'),
  ('Ingeniería Electrónica', 3, 'Evaluación por competencias', '¿Las evaluaciones miden diseño, implementación, pruebas y resolución de problemas?'),
  ('Ingeniería Electrónica', 3, 'Vinculación externa', '¿El plan incluye suficientes proyectos con industria, investigación aplicada o retos tecnológicos?'),

  -- Ingeniería Industrial - Estudiantes
  ('Ingeniería Industrial', 1, 'Procesos', '¿Los cursos le ayudan a entender cómo mejorar procesos en empresas, fábricas o servicios?'),
  ('Ingeniería Industrial', 1, 'Datos y decisiones', '¿La carrera le enseña a usar datos, tablas o software para tomar mejores decisiones?'),
  ('Ingeniería Industrial', 1, 'Casos reales', '¿Los trabajos de los cursos usan casos reales o situaciones parecidas a una empresa?'),
  ('Ingeniería Industrial', 1, 'Calidad y productividad', '¿Los cursos explican de forma clara temas de calidad, productividad, costos y mejora continua?'),
  ('Ingeniería Industrial', 1, 'Herramientas digitales', '¿Está aprendiendo herramientas digitales actuales para gestión, análisis o automatización de procesos?'),

  -- Ingeniería Industrial - Egresados
  ('Ingeniería Industrial', 2, 'Empleabilidad', '¿La malla respondió a las competencias que exige el mercado laboral en gestión, operaciones y mejora continua?'),
  ('Ingeniería Industrial', 2, 'Gestión profesional', '¿La formación le permitió liderar procesos, equipos y proyectos de mejora en organizaciones?'),
  ('Ingeniería Industrial', 2, 'Análisis de datos', '¿La carrera le brindó herramientas suficientes para tomar decisiones basadas en datos?'),
  ('Ingeniería Industrial', 2, 'Calidad y productividad', '¿Los cursos de calidad, productividad y operaciones fueron útiles en su desempeño profesional?'),
  ('Ingeniería Industrial', 2, 'Ética y sostenibilidad', '¿La carrera reforzó criterios éticos, ambientales y de responsabilidad social en la gestión industrial?'),

  -- Ingeniería Industrial - Docentes
  ('Ingeniería Industrial', 3, 'Coherencia curricular', '¿La malla articula ciencias básicas, gestión, operaciones, datos y proyectos aplicados?'),
  ('Ingeniería Industrial', 3, 'Actualización profesional', '¿El plan requiere actualizar contenidos de analítica, automatización, lean, calidad o transformación digital?'),
  ('Ingeniería Industrial', 3, 'Resultados de aprendizaje', '¿Las evaluaciones miden solución de problemas, gestión de procesos y toma de decisiones?'),
  ('Ingeniería Industrial', 3, 'Vinculación empresarial', '¿La carrera tiene suficientes proyectos o casos vinculados con empresas e instituciones?'),
  ('Ingeniería Industrial', 3, 'Práctica e investigación', '¿La malla equilibra teoría, práctica profesional e investigación aplicada?')
),
insertadas as (
  insert into pregunta_encuesta (categoria, texto_pregunta)
  select np.categoria, np.texto_pregunta
  from nuevas_preguntas np
  where not exists (
    select 1
    from pregunta_encuesta pe
    where pe.texto_pregunta = np.texto_pregunta
  )
  returning id_pregunta, texto_pregunta
),
catalogo as (
  select distinct pe.id_pregunta, c.id_carrera, np.id_poblacion
  from nuevas_preguntas np
  join carrera c
    on c.nombre_carrera = np.nombre_carrera
  join pregunta_encuesta pe
    on pe.texto_pregunta = np.texto_pregunta
)
insert into pregunta_carrera_poblacion (id_pregunta, id_carrera, id_poblacion)
select id_pregunta, id_carrera, id_poblacion
from catalogo
on conflict do nothing;
