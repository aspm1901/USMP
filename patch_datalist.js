const fs = require('fs');
let app = fs.readFileSync('assets/js/app.js', 'utf8');

const target = `      const areaOptions = state.data.areas
      });
      const dataListHTML = uniqueCourses.map(c => \`<option value="\${escapeHtml(c.nombre)}"></option>\`).join('');`;

const repl = `      const areaOptions = state.data.areas
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
      const dataListHTML = uniqueCourses.map(c => \`<option value="\${escapeHtml(c.nombre)}"></option>\`).join('');`;

if (app.includes(target)) {
  app = app.replace(target, repl);
  fs.writeFileSync('assets/js/app.js', app);
  console.log('Fixed datalist logic!');
} else {
  console.log('Target not found in app.js.');
}
