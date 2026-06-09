const fs = require('fs');
let app = fs.readFileSync('assets/js/app.js', 'utf8');

const target = `      setTimeout(() => searchInput.focus(), 200);
    }
          <div class="field">
            <label>Código</label>`;

const repl = `      setTimeout(() => searchInput.focus(), 200);
    }

    async function mallaAddCourse(prefill = null) {
      if (!state.mallaPlanId) return;

      const cycleOptions = state.data.cycles
        .slice().sort((a, b) => a.numero_ciclo - b.numero_ciclo)
        .map((cy) => \`<option value="\${cy.id_ciclo}">\${cy.numero_ciclo}. \${escapeHtml(cy.denominacion)}</option>\`)
        .join('');

      const areaOptions = state.data.areas
        .map((a) => \`<option value="\${a.id_area}">\${escapeHtml(a.nombre_area)}</option>\`)
        .join('');

      const uniqueCourses = [];
      const seenNames = new Set();
      (state.data.courses || []).forEach(c => {
        const lowerName = c.nombre.trim().toLowerCase();
        if (!seenNames.has(lowerName)) {
          seenNames.add(lowerName);
          uniqueCourses.push(c);
        }
      });
      const dataListHTML = uniqueCourses.map(c => \`<option value="\${escapeHtml(c.nombre)}"></option>\`).join('');

      const body = \`
        <datalist id="historicCoursesDataList">
          \${dataListHTML}
        </datalist>
        <form id="mallaAddCourseForm" class="form-grid">
          <div class="field">
            <label>Código</label>`;

if (app.includes(target)) {
  app = app.replace(target, repl);
  fs.writeFileSync('assets/js/app.js', app);
  console.log('Restored mallaAddCourse fully!');
} else {
  console.log('Target not found.');
}
