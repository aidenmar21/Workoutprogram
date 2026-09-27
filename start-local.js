const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(file, (error, contents) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('File unavailable');
      return;
    }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(contents);
  });
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Stop the other local server and try again.` : error.message);
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Happy Abs Club is running at http://127.0.0.1:${port}`);
  console.log('Press Ctrl+C to stop.');
});
