// my code formatter — tiny server (no dependencies)
// Serves the site and appends feedback to feedback.txt in this folder.
//
//   node server.js            → http://localhost:3000
//   PORT=8080 node server.js  → custom port
//
// © 2026 · Sir Troy. All rights reserved.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const FEEDBACK_FILE = path.join(ROOT, 'feedback.txt');
const MAX_BODY = 20 * 1024; // 20 KB

// Files that must never be served to the browser
const PRIVATE = new Set(['feedback.txt', 'server.js', 'package.json', '.env']);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

// Simple rate limit: max 5 feedback posts per IP per 10 minutes
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now(), windowMs = 10 * 60 * 1000;
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  list.push(now); hits.set(ip, list);
  return list.length > 5;
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

function clean(v, max) {
  return String(v == null ? '' : v).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

function timestamp() {
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  const off = -d.getTimezoneOffset(), sign = off >= 0 ? '+' : '-';
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ` +
    `(UTC${sign}${p(Math.floor(Math.abs(off) / 60))}:${p(Math.abs(off) % 60)})`;
}

function handleFeedback(req, res) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (rateLimited(ip)) return sendJson(res, 429, { ok: false, error: 'Too many submissions. Please try again in a few minutes.' });

  let body = '', tooBig = false;
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > MAX_BODY) { tooBig = true; req.destroy(); }
  });
  req.on('end', () => {
    if (tooBig) return sendJson(res, 413, { ok: false, error: 'Feedback is too long.' });
    let data;
    try { data = JSON.parse(body); } catch { return sendJson(res, 400, { ok: false, error: 'Invalid request.' }); }

    const name = clean(data.name, 100).replace(/\n/g, ' ');
    const email = clean(data.email, 200).replace(/\s/g, '');
    const comment = clean(data.comment, 5000);
    if (!name) return sendJson(res, 400, { ok: false, error: 'Name is required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(res, 400, { ok: false, error: 'Please enter a valid email.' });
    if (!comment) return sendJson(res, 400, { ok: false, error: 'Comment is required.' });

    const entry =
      '========================================\n' +
      `Date:    ${timestamp()}\n` +
      `Name:    ${name}\n` +
      `Email:   ${email}\n` +
      'Comment:\n' +
      comment.split('\n').map((l) => '  ' + l).join('\n') + '\n\n';

    fs.appendFile(FEEDBACK_FILE, entry, 'utf8', (err) => {
      if (err) { console.error('Could not write feedback:', err); return sendJson(res, 500, { ok: false, error: 'Could not save feedback.' }); }
      console.log(`Feedback saved from ${name} <${email}>`);
      sendJson(res, 200, { ok: true });
    });
  });
}

function serveStatic(req, res) {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); return res.end('Bad request'); }
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const file = path.normalize(path.join(ROOT, urlPath));
  const rel = path.relative(ROOT, file);
  if (rel.startsWith('..') || path.isAbsolute(rel) || PRIVATE.has(rel) || rel.split(path.sep).some((s) => s.startsWith('.'))) {
    res.writeHead(404); return res.end('Not found');
  }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/api/health') return sendJson(res, 200, { ok: true, feedback: true });
  if (url === '/api/feedback') {
    if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Use POST.' });
    return handleFeedback(req, res);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`my code formatter running at http://localhost:${PORT}`);
  console.log(`Feedback will be appended to ${FEEDBACK_FILE}`);
});
