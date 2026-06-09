const fs = require('fs');
let app = fs.readFileSync('assets/js/app.js', 'utf8');

const target = `        const filtered = uniqueCourses.filter(c => c.nombre.toLowerCase().includes(q) || c.codigo_curso.toLowerCase().includes(q)).slice(0, 15);`;
const repl = `        const filtered = uniqueCourses.filter(c => {
          const n = (c.nombre || '').toLowerCase();
          const cod = (c.codigo_curso || '').toLowerCase();
          return n.includes(q) || cod.includes(q);
        }).slice(0, 15);`;

if (app.includes(target)) {
  app = app.replace(target, repl);
  fs.writeFileSync('assets/js/app.js', app);
  console.log('Crash fix applied!');
} else {
  console.log('Target not found in app.js. Check if code already patched or different.');
}
