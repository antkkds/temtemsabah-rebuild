const http = require('http');
const fs = require('fs');
const path = require('path');

// ── Paths ──
const DIST_DIR = path.join(__dirname, '..', 'dist');
const DATA_DIR = path.join(__dirname, '..', 'data');
const RECIPES_JSON = path.join(DATA_DIR, 'recipes.json');
const NEWSROOM_JSON = path.join(DATA_DIR, 'newsroom.json');
const CONTENT_JSON = path.join(DATA_DIR, 'content.json');
const CONTACTS_JSON = path.join(DATA_DIR, 'contacts.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const ADMIN_PASS = 'admin123'; // Change this in production!

// ── Data helpers ──
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(file, fallback = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e.message);
  }
  return fallback;
}

function writeJSON(file, data) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// ── MIME types ──
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.map': 'application/json',
};

function serveStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON')); }
    });
  });
}

function send(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

// ── Bootstrap: seed JSON from source JS files if empty ──
function seedFromSource() {
  ensureDataDir();
  const srcDir = path.join(__dirname, '..', 'src', 'data');

  if (!fs.existsSync(RECIPES_JSON) || readJSON(RECIPES_JSON).length === 0) {
    try {
      const raw = fs.readFileSync(path.join(srcDir, 'recipes.js'), 'utf-8');
      const match = raw.match(/export const RECIPES = (\[[\s\S]*?\n\]);/);
      if (match) {
        const data = eval('(' + match[1] + ')');
        writeJSON(RECIPES_JSON, data);
        console.log('  Seeded recipes: ' + data.length + ' items');
      }
    } catch (e) { console.error('  Seed recipes failed:', e.message); }
  }

  if (!fs.existsSync(NEWSROOM_JSON) || readJSON(NEWSROOM_JSON).length === 0) {
    try {
      const raw = fs.readFileSync(path.join(srcDir, 'newsroom.js'), 'utf-8');
      const match = raw.match(/export const NEWSROOM_DATA = (\[[\s\S]*?\n\]);/);
      if (match) {
        const data = eval('(' + match[1] + ')');
        writeJSON(NEWSROOM_JSON, data);
        console.log('  Seeded newsroom: ' + data.length + ' articles');
      }
    } catch (e) { console.error('  Seed newsroom failed:', e.message); }
  }

  if (!fs.existsSync(CONTENT_JSON)) {
    writeJSON(CONTENT_JSON, {});
    console.log('  Created empty content.json');
  }
  if (!fs.existsSync(CONTACTS_JSON)) {
    writeJSON(CONTACTS_JSON, []);
    console.log('  Created empty contacts.json');
  }
}

// ── Server ──
const server = http.createServer(async (req, res) => {
  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // ── Auth check for protected routes ──
  const auth = req.headers.authorization;
  const isProtected = () => {
    if (!auth || !auth.startsWith('Bearer admin-token-')) return false;
    return true;
  };

  try {
    // ══════════════ API ROUTES ══════════════

    // ── Health check ──
    if (pathname === '/api/health') {
      send(res, 200, { ok: true, service: 'TemTemSabah Admin', version: '1.0.0' });
      return;
    }

    // ── Login ──
    if (pathname === '/api/login' && req.method === 'POST') {
      const { password } = await parseBody(req);
      if (password === ADMIN_PASS) {
        send(res, 200, { ok: true, token: 'admin-token-' + Date.now() });
      } else {
        send(res, 401, { ok: false, error: 'Wrong password' });
      }
      return;
    }

    // ── GET all newsroom articles ──
    if (pathname === '/api/newsroom' && req.method === 'GET') {
      const articles = readJSON(NEWSROOM_JSON, []);
      const status = url.searchParams.get('status');
      const result = status ? articles.filter(a => a.status === status) : articles;
      send(res, 200, { ok: true, articles: result });
      return;
    }

    // ── Save all newsroom articles ──
    if (pathname === '/api/newsroom' && req.method === 'PUT') {
      if (!isProtected()) { send(res, 401, { ok: false, error: 'Unauthorized' }); return; }
      const { articles } = await parseBody(req);
      writeJSON(NEWSROOM_JSON, articles);
      send(res, 200, { ok: true, message: 'Newsroom saved!', count: articles.length });
      return;
    }

    // ── GET single article by slug ──
    if (pathname.startsWith('/api/newsroom/') && req.method === 'GET') {
      const slug = pathname.replace('/api/newsroom/', '');
      const articles = readJSON(NEWSROOM_JSON, []);
      const article = articles.find(a => a.slug === slug);
      if (article) {
        send(res, 200, { ok: true, article });
      } else {
        send(res, 404, { ok: false, error: 'Not found' });
      }
      return;
    }

    // ── GET all recipes ──
    if (pathname === '/api/recipes' && req.method === 'GET') {
      const recipes = readJSON(RECIPES_JSON, []);
      send(res, 200, { ok: true, recipes });
      return;
    }

    // ── Save all recipes ──
    if (pathname === '/api/recipes' && req.method === 'PUT') {
      if (!isProtected()) { send(res, 401, { ok: false, error: 'Unauthorized' }); return; }
      const { recipes } = await parseBody(req);
      writeJSON(RECIPES_JSON, recipes);
      send(res, 200, { ok: true, message: 'Recipes saved!', count: recipes.length });
      return;
    }

    // ── Content save ──
    if (pathname === '/api/content' && req.method === 'POST') {
      if (!isProtected()) { send(res, 401, { ok: false, error: 'Unauthorized' }); return; }
      const data = await parseBody(req);
      const current = readJSON(CONTENT_JSON, {});
      Object.assign(current, data);
      writeJSON(CONTENT_JSON, current);
      send(res, 200, { ok: true, message: 'Content saved!' });
      return;
    }

    // ── Contact form submission ──
    if (pathname === '/api/contact' && req.method === 'POST') {
      const data = await parseBody(req);
      const contacts = readJSON(CONTACTS_JSON, []);
      data._received_at = new Date().toISOString();
      contacts.push(data);
      writeJSON(CONTACTS_JSON, contacts);
      send(res, 200, { ok: true, message: 'Message received!' });
      return;
    }

    // ── Extract OG metadata from URL (Auto Generate) ──
    if (pathname === '/api/extract' && req.method === 'POST') {
      const { url: targetUrl } = await parseBody(req);
      if (!targetUrl) { send(res, 400, { ok: false, error: 'URL required' }); return; }

      const https = require('https');
      const http2 = require('http');
      const fetcher = targetUrl.startsWith('https') ? https : http2;
      try {
        const data = await new Promise((resolve, reject) => {
          fetcher.get(targetUrl, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (resp) => {
            let d = '';
            resp.on('data', c => d += c);
            resp.on('end', () => resolve(d));
          }).on('error', reject);
        });

        const meta = { title: '', description: '', image: '', site_name: '' };
        const og = (prop) => {
          const r = data.match(new RegExp(`<meta[^>]*property=["']og:${prop}["'][^>]*content=["']([^"']*)["']`, 'i'));
          return r ? r[1] : '';
        };
        meta.title = og('title');
        meta.description = og('description');
        meta.image = og('image');
        meta.site_name = og('site_name');
        if (!meta.title) {
          const t = data.match(/<title>([^<]*)<\/title>/i);
          if (t) meta.title = t[1].replace(/\s*\|\s*.*$/, '').trim();
        }
        if (!meta.description) {
          const d = data.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
          if (d) meta.description = d[1];
        }
        const clean = (s) => s ? s.replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (m, c) => String.fromCodePoint(parseInt(c, 10))).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim() : '';
        meta.title = clean(meta.title);
        meta.description = clean(meta.description);
        send(res, 200, { ok: true, meta });
      } catch (e) {
        send(res, 500, { ok: false, error: 'Fetch failed: ' + e.message });
      }
      return;
    }

    // ── Upload image ──
    if (pathname === '/api/upload' && req.method === 'POST') {
      const { image, name } = await parseBody(req);
      if (!image) { send(res, 400, { ok: false, error: 'No image data' }); return; }
      
      ensureDataDir();
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

      const ext = (name || '.jpg').split('.').pop() || 'jpg';
      const filename = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext.replace(/[^a-zA-Z0-9]/g, '');
      const filepath = path.join(UPLOADS_DIR, filename);
      
      const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      fs.writeFileSync(filepath, buffer);
      
      send(res, 200, { ok: true, url: '/uploads/' + filename });
      return;
    }

    // ── Export all data for backup ──
    if (pathname === '/api/export' && req.method === 'GET') {
      const data = {
        newsroom: readJSON(NEWSROOM_JSON, []),
        recipes: readJSON(RECIPES_JSON, []),
        content: readJSON(CONTENT_JSON, {}),
        contacts: readJSON(CONTACTS_JSON, []),
        exported_at: new Date().toISOString(),
      };
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="temtemsabah-data.json"',
      });
      res.end(JSON.stringify(data, null, 2));
      return;
    }

    // ══════════════ STATIC FILES (SPA at /temtemsabah/) ══════════════

    // Serve uploaded files at /uploads/
    if (pathname.startsWith('/uploads/')) {
      const filename = pathname.replace('/uploads/', '');
      const filePath = path.join(UPLOADS_DIR, filename);
      // Prevent directory traversal
      if (filename.includes('..') || filename.includes('~')) {
        res.writeHead(403); res.end('Forbidden'); return;
      }
      if (fs.existsSync(filePath)) {
        serveStatic(res, filePath);
        return;
      }
    }

    // Serve /temtemsabah/ → dist/ files
    if (pathname.startsWith('/temtemsabah/')) {
      const relativePath = pathname.replace('/temtemsabah/', '') || 'index.html';
      const filePath = path.join(DIST_DIR, relativePath);

      // SPA fallback: if file doesn't exist, serve index.html
      if (!fs.existsSync(filePath)) {
        serveStatic(res, path.join(DIST_DIR, 'index.html'));
        return;
      }
      serveStatic(res, filePath);
      return;
    }

    // Root → redirect to /temtemsabah/
    if (pathname === '/' || pathname === '') {
      res.writeHead(302, { Location: '/temtemsabah/' });
      res.end();
      return;
    }

    // ── 404 ──
    res.writeHead(404);
    res.end('Not found');
  } catch (e) {
    console.error('Server error:', e);
    send(res, 500, { ok: false, error: 'Internal server error' });
  }
});

// ── Start ──
const PORT = process.env.PORT || 3456;
const HOST = '0.0.0.0'; // Listen on all interfaces for Render

seedFromSource();
server.listen(PORT, HOST, () => {
  console.log(`✏️  TemTemSabah API + Static Server`);
  console.log(`   http://0.0.0.0:${PORT}`);
  console.log(`   http://0.0.0.0:${PORT}/temtemsabah/`);
  console.log(`   POST /api/login - Login`);
  console.log(`   GET  /api/newsroom - List newsroom`);
  console.log(`   PUT  /api/newsroom - Save newsroom`);
  console.log(`   GET  /api/recipes - List recipes`);
  console.log(`   PUT  /api/recipes - Save recipes`);
  console.log(`   POST /api/contact - Submit contact`);
  console.log(`   POST /api/extract - URL metadata extract`);
  console.log(`   GET  /api/export - Download all data`);
});
