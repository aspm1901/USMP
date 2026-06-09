const fs = require('fs');
let app = fs.readFileSync('assets/js/app.js', 'utf8');

const target = `      const body = \`
        <datalist id="historicCoursesDataList">
          \${dataListHTML}
        </datalist>
        <form id="mallaAddCourseForm" class="form-grid">
          <div class="field">
            <label>Código</label>
            <input type="text" name="codigo_curso" required placeholder="Ej: SIS011">
          </div>
          <div class="field">
            <label>Nombre (Autocompletado histórico)</label>
            <input type="text" name="nombre" required placeholder="Escribe para buscar histórico..." list="historicCoursesDataList">
          </div>
          <div class="field">
            <label>Ciclo</label>
            <select name="id_ciclo" required>\${cycleOptions}</select>
          </div>
          <div class="field">
            <label>Área académica</label>
            <div style="display:flex;gap:6px">
              <select name="id_area" id="mallaAddCourseArea" required style="flex:1">
                \${state.data.areas.map(a => \`<option value="\${a.id_area}" \${prefill && prefill.id_area === a.id_area ? 'selected' : ''}>\${escapeHtml(a.nombre_area)}</option>\`).join('')}
              </select>
              <button type="button" id="mallaInlineAddArea" class="mini-button" style="white-space:nowrap">+ Nueva</button>
            </div>
          </div>
          <div id="mallaInlineAreaFields" class="field wide" style="display:none;gap:8px;align-items:flex-end">
            <div class="field" style="flex:1;margin:0">
              <label>Nombre del área nueva</label>
              <input type="text" id="mallaInlineAreaName" placeholder="Ej: Formación General">
            </div>
            <div class="field" style="width:60px;margin:0">
              <label>Color</label>
              <input type="color" id="mallaInlineAreaColor" value="#2E86C1" style="width:100%;height:36px;cursor:pointer;border:1px solid var(--line);border-radius:6px">
            </div>
            <button type="button" id="mallaInlineAreaSave" class="mini-button primary" style="height:36px">Crear</button>
          </div>
          <div class="field">
            <label>Créditos</label>
            <input type="number" name="creditos" required min="1" max="10" value="4">
          </div>
          <div class="field">
            <label>Modalidad</label>
            <select name="modalidad">
              <option>Presencial</option>
              <option>Semipresencial</option>
              <option>Virtual</option>
            </select>
          </div>
          <div class="field" style="display:flex;align-items:center;gap:8px">
            <input type="checkbox" name="es_electivo" id="mallaElectiveCheck">
            <label for="mallaElectiveCheck" style="margin:0">Es electivo</label>
          </div>`;

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
            <label>Ciclo</label>
            <select name="id_ciclo" required>\${cycleOptions}</select>
          </div>
          <div class="field">
            <label>Área académica</label>
            <div style="display:flex;gap:6px">
              <select name="id_area" id="mallaAddCourseArea" required style="flex:1">
                \${state.data.areas.map(a => \`<option value="\${a.id_area}" \${prefill && prefill.id_area === a.id_area ? 'selected' : ''}>\${escapeHtml(a.nombre_area)}</option>\`).join('')}
              </select>
              <button type="button" id="mallaInlineAddArea" class="mini-button" style="white-space:nowrap">+ Nueva</button>
            </div>
          </div>
          <div id="mallaInlineAreaFields" class="field wide" style="display:none;gap:8px;align-items:flex-end">
            <div class="field" style="flex:1;margin:0">
              <label>Nombre del área nueva</label>
              <input type="text" id="mallaInlineAreaName" placeholder="Ej: Formación General">
            </div>
            <div class="field" style="width:60px;margin:0">
              <label>Color</label>
              <input type="color" id="mallaInlineAreaColor" value="#2E86C1" style="width:100%;height:36px;cursor:pointer;border:1px solid var(--line);border-radius:6px">
            </div>
            <button type="button" id="mallaInlineAreaSave" class="mini-button primary" style="height:36px">Crear</button>
          </div>
          <div class="field">
            <label>Créditos</label>
            <input type="number" name="creditos" required min="1" max="10" value="\${prefill && prefill.creditos ? prefill.creditos : '4'}">
          </div>
          <div class="field">
            <label>Modalidad</label>
            <select name="modalidad">
              <option \${prefill && prefill.modalidad === 'Presencial' ? 'selected' : ''}>Presencial</option>
              <option \${prefill && prefill.modalidad === 'Semipresencial' ? 'selected' : ''}>Semipresencial</option>
              <option \${prefill && prefill.modalidad === 'Virtual' ? 'selected' : ''}>Virtual</option>
            </select>
          </div>
          <div class="field" style="display:flex;align-items:center;gap:8px">
            <input type="checkbox" name="es_electivo" id="mallaElectiveCheck" \${prefill && prefill.es_electivo ? 'checked' : ''}>
            <label for="mallaElectiveCheck" style="margin:0">Es electivo</label>
          </div>`;

if (app.includes(target)) {
  app = app.replace(target, repl);
  fs.writeFileSync('assets/js/app.js', app);
  console.log('Final fix applied properly!');
} else {
  console.log('Target not found in app.js.');
}
