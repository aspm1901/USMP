const fs = require('fs');
let app = fs.readFileSync('assets/js/app.js', 'utf8');

const target = `      openModal('Agregar curso a la malla', 'Se añadirá al plan seleccionado', body);

      document.getElementById('mallaInlineAddArea').addEventListener('click', () => {`;

const repl = `      openModal('Agregar curso a la malla', 'Se añadirá al plan seleccionado', body);

      const formNode = document.getElementById('mallaAddCourseForm');
      formNode.nombre.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        const found = uniqueCourses.find(c => c.nombre.toLowerCase() === val);
        if (found) {
          formNode.codigo_curso.value = found.codigo_curso || '';
          formNode.creditos.value = found.creditos || 4;
          if (found.modalidad) formNode.modalidad.value = found.modalidad;
          if (found.id_area) formNode.id_area.value = found.id_area;
          if (found.es_electivo !== undefined) formNode.es_electivo.checked = found.es_electivo;
        }
      });

      document.getElementById('mallaInlineAddArea').addEventListener('click', () => {`;

if (app.includes(target)) {
  app = app.replace(target, repl);
  fs.writeFileSync('assets/js/app.js', app);
  console.log('Listener added successfully!');
} else {
  console.log('Target not found in app.js');
}
