// Local review server: static files with clean URLs (/privacy-policy) + the /api/contact handler.
// Run: npm start   (http://localhost:4173). Review only; not a production server.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import contact from './api/contact.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public'); // same folder Netlify publishes
const port = Number(process.env.PORT) || 4173;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};
// Only these top-level paths are public (keeps api/, scripts/, node_modules/, *.md out of reach)
const PUBLIC = [/^\/(index|privacy-policy|refund-policy|contact|success)(\.html)?$/, /^\/checkout\/?$/, /^\/checkout\/[\w.-]+$/, /^\/checkout\/assets\/[\w.-]+$/, /^\/css\//, /^\/js\//, /^\/assets\/optimized\//];

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  let p;
  try { p = decodeURIComponent(u.pathname); } catch (e) { res.statusCode = 400; return res.end('Bad request'); }

  if (p === '/api/contact') return contact(req, res);
  if (p === '/') p = '/index';
  if (!PUBLIC.some((re) => re.test(p))) { res.statusCode = 404; return res.end('Not found'); }

  let file = path.join(root, p);
  if (p === '/checkout' || p === '/checkout/') file = path.join(root, 'checkout', 'index.html');
  else if (!path.extname(file)) file += '.html';
  if (!file.startsWith(root + path.sep)) { res.statusCode = 403; return res.end('Forbidden'); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(buf);
  });
});
server.listen(port, () => console.log(`Local review server: http://localhost:${port}`));
