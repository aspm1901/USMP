const fs = require('fs');
let app = fs.readFileSync('assets/js/app.js', 'utf8');

const target = `      const body = \`
        <form id="mallaAddCourseForm" class="form-grid">
          <div class="field">
            <label>Ciclo</label>`;

const repl = `      const body = \`
        <form id="mallaAddCourseForm" class="form-grid">
          <div class="field">
            <label>Código</label>
            <input type="text" name="codigo_curso" required placeholder="Ej: SIS011" value="\${prefill && prefill.codigo_curso ? escapeHtml(prefill.codigo_curso) : ''}">
          </div>
          <div class="field">
            <label>Nombre del curso</label>
            <input type="text" name="nombre" required placeholder="Ej: Matemática Discreta" value="\${prefill && prefill.nombre ? escapeHtml(prefill.nombre) : ''}">
          </div>
          <div class="field">
            <label>Ciclo</label>`;

if (app.indexOf(target) !== -1) {
  app = app.replace(target, repl);
  fs.writeFileSync('assets/js/app.js', app);
  console.log('SUCCESS injecting fields!');
} else {
  console.log('FAIL! Target not found.');
}
