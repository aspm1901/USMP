const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 5502);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url.split('?')[0]);
  const requestedFile = requestPath === '/' ? 'index.html' : requestPath.replace(/^[/\\]+/, '');
  const safePath = path.normalize(requestedFile).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(root, safePath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
    });
    response.end(content);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Servidor listo en http://127.0.0.1:${port}/`);
});
