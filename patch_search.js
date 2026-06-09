const fs = require('fs');
let app = fs.readFileSync('assets/js/app.js', 'utf8');

const target = `async function mallaAddExistingCourse() {
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
    }`;

const repl = `async function mallaAddExistingCourse() {
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

      const body = \`
        <div class="form-grid" style="margin-bottom: 20px;">
          <div class="field wide">
            <label>Buscar curso histórico por Nombre o Código</label>
            <input type="text" id="mallaCourseSearchInput" placeholder="Ej: Matemática Básica..." autocomplete="off">
          </div>
          <div class="wide">
            <div id="mallaCourseSearchResults" style="max-height: 250px; overflow-y: auto; border: 1px solid var(--line); border-radius: 6px; display: none; flex-direction: column;">
              <!-- Results go here -->
            </div>
          </div>
        </div>
      \`;

      openModal('Buscador de Cursos Históricos', 'Selecciona uno para configurar sus créditos y ciclo en esta malla', body);

      const searchInput = document.getElementById('mallaCourseSearchInput');
      const resultsContainer = document.getElementById('mallaCourseSearchResults');

      const renderResults = (query) => {
        const q = query.toLowerCase().trim();
        if (!q) {
          resultsContainer.style.display = 'none';
          resultsContainer.innerHTML = '';
          return;
        }

        const filtered = uniqueCourses.filter(c => c.nombre.toLowerCase().includes(q) || c.codigo_curso.toLowerCase().includes(q)).slice(0, 15);
        
        if (filtered.length === 0) {
          resultsContainer.style.display = 'flex';
          resultsContainer.innerHTML = '<div style="padding: 16px; color: var(--text-muted); text-align: center;">No se encontraron cursos con ese término</div>';
          return;
        }

        resultsContainer.style.display = 'flex';
        resultsContainer.innerHTML = filtered.map(c => \`
          <div class="search-result-item" data-id="\${c.id_curso}" style="padding: 12px; cursor: pointer; border-bottom: 1px solid var(--line); transition: background 0.2s;">
            <div style="font-weight: 600; color: var(--text);">\${escapeHtml(c.nombre)}</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Código: \${escapeHtml(c.codigo_curso)} • Créditos: \${c.creditos}</div>
          </div>
        \`).join('');

        const items = resultsContainer.querySelectorAll('.search-result-item');
        items.forEach(item => {
          item.addEventListener('click', () => {
            const id = Number(item.getAttribute('data-id'));
            const found = uniqueCourses.find(c => c.id_curso === id);
            closeModal();
            if (found) setTimeout(() => mallaAddCourse(found), 300);
          });
          item.addEventListener('mouseover', () => item.style.backgroundColor = 'var(--bg)');
          item.addEventListener('mouseout', () => item.style.backgroundColor = 'transparent');
        });
      };

      searchInput.addEventListener('input', (e) => renderResults(e.target.value));
      setTimeout(() => searchInput.focus(), 200);
    }`;

if (app.includes(target)) {
  app = app.replace(target, repl);
  fs.writeFileSync('assets/js/app.js', app);
  console.log('Search patch applied successfully!');
} else {
  console.log('Target not found.');
}
