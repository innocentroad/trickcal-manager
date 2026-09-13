'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const root = path.resolve(process.env.TRICKCAL_STORAGE_HTTP_ROOT || path.join(__dirname, '..', '..'));
const port = Number(process.env.TRICKCAL_STORAGE_HTTP_PORT || process.argv[2] || 8765);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};
const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
  const relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '') || 'tools/fixtures/storage-http-baseline.html';
  let filePath = path.resolve(root, relativePath);
  if (filePath.startsWith(`${root}${path.sep}`) && fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!filePath.startsWith(`${root}${path.sep}`) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  const contentType = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  response.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, '127.0.0.1');
