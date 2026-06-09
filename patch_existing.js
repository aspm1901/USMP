const fs = require('fs');
let app = fs.readFileSync('assets/js/app.js', 'utf8');

// 1. Add Event Listener
const target1 = "document.getElementById('mallaAddCourseBtn').addEventListener('click', mallaAddCourse);";
const repl1 = "document.getElementById('mallaAddCourseBtn').addEventListener('click', () => mallaAddCourse());\n      const mallaAddExistingCourseBtn = document.getElementById('mallaAddExistingCourseBtn');\n      if(mallaAddExistingCourseBtn) mallaAddExistingCourseBtn.addEventListener('click', mallaAddExistingCourse);";
app = app.replace(target1, repl1);

// 2. Add the function mallaAddExistingCourse right before mallaAddCourse
const target2 = "async function mallaAddCourse() {";
const repl2 = `async function mallaAddExistingCourse() {
      if (!state.mallaPlanId) return;

      const uniqueCourses = [];
      const seenNames = new Set();
      (state.data.curso || []).forEach(c => {
        const lowerName = c.nombre.trim().toLowerCase();
        if (!seenNames.has(lowerName)) {
          seenNames.add(lowerName);
          uniqueCourses.push(c);
        }
      });
      uniqueCourses.sort((a,b) => a.nombre.localeCompare(b.nombre));

      const options = uniqueCourses.map(c => \`<option value="\${c.id_curso}">\${escapeHtml(c.nombre)} (\${c.codigo_curso})</option>\`).join('');

      const body = \`
        <form id="mallaExistingCourseForm" class="form-grid">
          <div class="field wide">
            <label>Selecciona un curso histórico (Catálogo General)</label>
            <select name="selected_course_id" required>
              <option value="">-- Elige un curso --</option>
              \${options}
            </select>
          </div>
          <div class="wide" style="text-align:right;padding-top:8px">
            <button type="submit" class="mini-button primary">Continuar y configurar</button>
          </div>
        </form>
      \`;

      openModal('Importar curso existente', 'Copiaremos sus datos a la nueva malla', body);

      document.getElementById('mallaExistingCourseForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = Number(e.target.selected_course_id.value);
        const found = uniqueCourses.find(c => c.id_curso === id);
        closeModal();
        if(found) setTimeout(() => mallaAddCourse(found), 300);
      });
    }

    async function mallaAddCourse(prefill = null) {`;
app = app.replace(target2, repl2);

// 3. Inject prefill values into the form
const target3 = `        <form id="mallaAddCourseForm" class="form-grid">
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
          </div>`;

const repl3 = `        <form id="mallaAddCourseForm" class="form-grid">
          <div class="field">
            <label>Código</label>
            <input type="text" name="codigo_curso" required placeholder="Ej: SIS011" value="\${prefill ? escapeHtml(prefill.codigo_curso) : ''}">
          </div>
          <div class="field">
            <label>Nombre (Autocompletado histórico)</label>
            <input type="text" name="nombre" required placeholder="Escribe para buscar histórico..." list="historicCoursesDataList" value="\${prefill ? escapeHtml(prefill.nombre) : ''}">
          </div>
          <div class="field">
            <label>Ciclo</label>
            <select name="id_ciclo" required>\${cycleOptions}</select>
          </div>`;
app = app.replace(target3, repl3);

const target4 = `          <div class="field">
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
            <input type="checkbox" name="es_electivo" id="mallaElectiveCheck">`;

const repl4 = `          <div class="field">
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
            <input type="checkbox" name="es_electivo" id="mallaElectiveCheck" \${prefill && prefill.es_electivo ? 'checked' : ''}>`;
app = app.replace(target4, repl4);

const target5 = `              <select name="id_area" id="mallaAddCourseArea" required style="flex:1">\${areaOptions}</select>`;
const repl5 = `              <select name="id_area" id="mallaAddCourseArea" required style="flex:1">
                \${state.data.areas.map(a => \`<option value="\${a.id_area}" \${prefill && prefill.id_area === a.id_area ? 'selected' : ''}>\${escapeHtml(a.nombre_area)}</option>\`).join('')}
              </select>`;
app = app.replace(target5, repl5);

fs.writeFileSync('assets/js/app.js', app);
console.log('Feature implemented successfully!');
