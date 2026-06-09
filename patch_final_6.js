const fs = require('fs');
let app = fs.readFileSync('assets/js/app.js', 'utf8');

const regex = /(<form id="mallaAddCourseForm" class="form-grid">)([\s\S]*?)(<div class="field">\s*<label>Ciclo<\/label>)/;
const match = app.match(regex);

if (match) {
  const replacement = \`<form id="mallaAddCourseForm" class="form-grid">
          <div class="field">
            <label>Código</label>
            <input type="text" name="codigo_curso" required placeholder="Ej: SIS011" value="\${prefill && prefill.codigo_curso ? escapeHtml(prefill.codigo_curso) : ''}">
          </div>
          <div class="field">
            <label>Nombre del curso</label>
            <input type="text" name="nombre" required placeholder="Ej: Matemática Discreta" value="\${prefill && prefill.nombre ? escapeHtml(prefill.nombre) : ''}">
          </div>
          <div class="field">
            <label>Ciclo</label>\`;
  app = app.replace(regex, replacement);
  fs.writeFileSync('assets/js/app.js', app);
  console.log('REGEX SUCCESS!');
} else {
  console.log('REGEX FAIL!');
}
