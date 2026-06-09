const http = require('http');
const fs = require('fs');
const path = require('path');

const RECIPES_FILE = path.join(__dirname, '..', 'src', 'data', 'recipes.js');
const NEWSROOM_FILE = path.join(__dirname, '..', 'src', 'data', 'newsroom.js');
const CONTENT_FILE = path.join(__dirname, '..', 'src', 'data', 'content.js');
const ADMIN_PASS = 'admin123'; // Simple local-only auth

function readRecipes() {
  const raw = fs.readFileSync(RECIPES_FILE, 'utf-8');
  // Extract the RECIPES array from the JS file
  const match = raw.match(/export const RECIPES = (\[[\s\S]*?\n\]);/);
  if (!match) return [];
  try {
    return JSON.parse(match[1]);
  } catch {
    return [];
  }
}

function writeRecipes(recipes) {
  let raw = fs.readFileSync(RECIPES_FILE, 'utf-8');
  const json = JSON.stringify(recipes, null, 2);
  raw = raw.replace(/export const RECIPES = [\s\S]*?\n\];/, `export const RECIPES = ${json};`);
  fs.writeFileSync(RECIPES_FILE, raw, 'utf-8');
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
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // ── Auth ──
    if (pathname === '/api/login' && req.method === 'POST') {
      const { password } = await parseBody(req);
      if (password === ADMIN_PASS) {
        send(res, 200, { ok: true, token: 'admin-token-' + Date.now() });
      } else {
        send(res, 401, { ok: false, error: 'Wrong password' });
      }
      return;
    }

    // ── Check auth for protected routes ──
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer admin-token-')) {
      if (pathname.startsWith('/api/recipes') && req.method !== 'GET') {
        send(res, 401, { ok: false, error: 'Unauthorized' });
        return;
      }
    }

    // ── GET all recipes ──
    if (pathname === '/api/recipes' && req.method === 'GET') {
      const raw = fs.readFileSync(RECIPES_FILE, 'utf-8');
      const match = raw.match(/export const RECIPES = (\[[\s\S]*?\n\]);/);
      if (match) {
        // Send as-is — it's valid JS array literal
        send(res, 200, { ok: true, recipes: eval('(' + match[1] + ')') });
      } else {
        send(res, 200, { ok: true, recipes: [] });
      }
      return;
    }

    // ── Save all recipes ──
    if (pathname === '/api/recipes' && req.method === 'PUT') {
      const { recipes } = await parseBody(req);
      writeRecipes(recipes);
      send(res, 200, { ok: true, message: 'Recipes saved!' });
      return;
    }

    // ── Content.js save ──
    if (pathname === '/api/content' && req.method === 'POST') {
      const data = await parseBody(req);
      let content = fs.readFileSync(CONTENT_FILE, 'utf-8');
      for (const [key, val] of Object.entries(data)) {
        const escaped = val.replace(/'/g, "\\'").replace(/&amp;/g, '&');
        content = content.replace(new RegExp(`${key}:\\s*'[^']*'`), `${key}: '${escaped}'`);
      }
      fs.writeFileSync(CONTENT_FILE, content, 'utf-8');
      send(res, 200, { ok: true, message: 'Content saved!' });
      return;
    }

    // ── GET all newsroom articles ──
    if (pathname === '/api/newsroom' && req.method === 'GET') {
      const raw = fs.readFileSync(NEWSROOM_FILE, 'utf-8');
      const match = raw.match(/export const NEWSROOM_DATA = (\[[\s\S]*?\n\]);/);
      if (match) {
        const articles = eval('(' + match[1] + ')');
        // Support ?status=published filter
        const status = url.searchParams.get('status');
        const result = status ? articles.filter(a => a.status === status) : articles;
        send(res, 200, { ok: true, articles: result });
      } else {
        send(res, 200, { ok: true, articles: [] });
      }
      return;
    }

    // ── Save all newsroom articles ──
    if (pathname === '/api/newsroom' && req.method === 'PUT') {
      const { articles } = await parseBody(req);
      let raw = fs.readFileSync(NEWSROOM_FILE, 'utf-8');
      const json = JSON.stringify(articles, null, 2);
      raw = raw.replace(/export const NEWSROOM_DATA = [\s\S]*?\n\];/, `export const NEWSROOM_DATA = ${json};`);
      fs.writeFileSync(NEWSROOM_FILE, raw, 'utf-8');
      send(res, 200, { ok: true, message: 'Newsroom saved!' });
      return;
    }

    // ── GET single article by slug ──
    if (pathname.startsWith('/api/newsroom/') && req.method === 'GET') {
      const slug = pathname.replace('/api/newsroom/', '');
      const raw = fs.readFileSync(NEWSROOM_FILE, 'utf-8');
      const match = raw.match(/export const NEWSROOM_DATA = (\[[\s\S]*?\n\]);/);
      if (match) {
        const articles = eval('(' + match[1] + ')');
        const article = articles.find(a => a.slug === slug);
        if (article) {
          send(res, 200, { ok: true, article });
        } else {
          send(res, 404, { ok: false, error: 'Not found' });
        }
      } else {
        send(res, 404, { ok: false, error: 'No data' });
      }
      return;
    }

    send(res, 404, { ok: false, error: 'Not found' });
  } catch (e) {
    send(res, 500, { ok: false, error: e.message });
  }
});

const PORT = 3456;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`✏️  Edit API running on http://127.0.0.1:${PORT}`);
  console.log(`   POST /api/login - Authenticate`);
  console.log(`   GET  /api/recipes - List all recipes`);
  console.log(`   PUT  /api/recipes - Save all recipes`);
  console.log(`   POST /api/content - Save content.js fields`);
});
