const fs = require('fs');
let app = fs.readFileSync('assets/js/app.js', 'utf8');

const target = `          <div class="field">
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
            <label for="mallaElectiveCheck" style="margin:0;cursor:pointer">Es electivo</label>
          </div>
          <div class="field wide" style="display:flex;gap:8px;align-items:end">
            <div style="flex:1">
              <label>Área académica</label>
              <select name="id_area" id="mallaAddCourseArea" required style="flex:1">\${areaOptions}</select>`;

const repl = `          <div class="field">
            <label>Código</label>
            <input type="text" name="codigo_curso" required placeholder="Ej: SIS011" value="\${prefill && prefill.codigo_curso ? escapeHtml(prefill.codigo_curso) : ''}">
          </div>
          <div class="field">
            <label>Nombre (Autocompletado histórico)</label>
            <input type="text" name="nombre" required placeholder="Escribe para buscar histórico..." list="historicCoursesDataList" value="\${prefill && prefill.nombre ? escapeHtml(prefill.nombre) : ''}">
          </div>
          <div class="field">
            <label>Ciclo</label>
            <select name="id_ciclo" required>\${cycleOptions}</select>
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
            <label for="mallaElectiveCheck" style="margin:0;cursor:pointer">Es electivo</label>
          </div>
          <div class="field wide" style="display:flex;gap:8px;align-items:end">
            <div style="flex:1">
              <label>Área académica</label>
              <select name="id_area" id="mallaAddCourseArea" required style="flex:1">
                \${state.data.areas.map(a => \`<option value="\${a.id_area}" \${prefill && prefill.id_area === a.id_area ? 'selected' : ''}>\${escapeHtml(a.nombre_area)}</option>\`).join('')}
              </select>`;

app = app.replace(target, repl);
fs.writeFileSync('assets/js/app.js', app);
console.log('Prefill attributes injected fully!');
