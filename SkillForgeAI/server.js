const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');
const { OrchestratorService } = require('./src/services/OrchestratorService');
const { createApiRouter } = require('./src/routes/apiRouter');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const orchestrator = new OrchestratorService();
const handleApi = createApiRouter(orchestrator);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  // Route API endpoints
  if (pathname.startsWith('/api/')) {
    return handleApi(req, res);
  }

  // Static File Serving
  let relativePath = pathname === '/' ? 'index.html' : pathname;
  // Prevent directory traversal
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA-like navigation or 404
      const fallback = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(fallback, (fallbackErr, content) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SkillForge AI - Agentic Learning Platform Online!`);
  console.log(`📍 Web Interface: http://localhost:${PORT}`);
  console.log(`🧠 Multi-Agent Collaboration Bus: Active`);
  console.log(`🎯 Scenario: Full Stack Developer (Python/SQL/HTML -> JS/React/Node)`);
  console.log(`=======================================================`);
});
