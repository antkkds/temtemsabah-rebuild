const http = require('http');
const https = require('https');
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

    // ── Extract metadata from URL (for Auto Generate feature) ──
    if (pathname === '/api/extract' && req.method === 'POST') {
      const { url } = await parseBody(req);
      if (!url) { send(res, 400, { ok: false, error: 'URL required' }); return; }

      const fetcher = url.startsWith('https') ? https : http;
      fetcher.get(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HermesAgent/1.0)' } }, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
          const meta = { title: '', description: '', image: '', site_name: '' };

          // Extract OG tags
          const ogTitle = data.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
          if (ogTitle) meta.title = ogTitle[1];

          const ogDesc = data.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
          if (ogDesc) meta.description = ogDesc[1];

          const ogImage = data.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
          if (ogImage) meta.image = ogImage[1];

          const ogSite = data.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["']/i);
          if (ogSite) meta.site_name = ogSite[1];

          // Fallback to standard meta
          if (!meta.title) {
            const titleTag = data.match(/<title>([^<]*)<\/title>/i);
            if (titleTag) meta.title = titleTag[1].replace(/\\s*\\|\\s*.*$/, '').trim();
          }
          if (!meta.description) {
            const metaDesc = data.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
            if (metaDesc) meta.description = metaDesc[1];
          }

          // Clean up extracted text — decode HTML entities, remove raw newlines
          const cleanText = (str) => {
            if (!str) return '';
            // Decode HTML entities (&#x...; and &#...;)
            return str
              .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
              .replace(/&#(\d+);/g, (m, c) => String.fromCodePoint(parseInt(c, 10)))
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&apos;/g, "'")
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/\\n/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
          };

          meta.title = cleanText(meta.title);
          meta.description = cleanText(meta.description);
          meta.site_name = cleanText(meta.site_name);

          // For Facebook URLs, special handling
          if (url.includes('facebook.com') || url.includes('fb.com')) {
            meta.site_name = 'Facebook';
            if (!meta.title) meta.title = 'Facebook Post';
          }

          send(res, 200, { ok: true, meta, source_url: url });
        });
      }).on('error', (err) => {
        send(res, 500, { ok: false, error: 'Failed to fetch URL: ' + err.message });
      });
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
