const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const RECIPES_FILE = path.join(__dirname, '..', 'src', 'data', 'recipes.js');
const NEWSROOM_FILE = path.join(__dirname, '..', 'src', 'data', 'newsroom.js');
const CONTENT_FILE = path.join(__dirname, '..', 'src', 'data', 'content.js');
const CONTACT_FILE = path.join(__dirname, '..', 'src', 'data', 'contact-submissions.json');
const ADMIN_PASS = 'admin123'; // Simple local-only auth

const crm = require('./crm.cjs');

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

    // ── CRM: Login with email + password ──
    if (pathname === '/api/crm/login' && req.method === 'POST') {
      const { email, password } = await parseBody(req);
      const result = await crm.login(email, password);
      if (result) {
        send(res, 200, { ok: true, token: result.token, user: result.user });
      } else {
        send(res, 401, { ok: false, error: 'Invalid email or password' });
      }
      return;
    }

    // ── CRM: Get current user from token ──
    if (pathname === '/api/crm/me' && req.method === 'GET') {
      const ba = req.headers.authorization;
      const token = ba?.startsWith('Bearer ') ? ba.slice(7) : '';
      const user = crm.authenticate(token);
      if (user) { send(res, 200, { ok: true, user }); return; }
      send(res, 401, { ok: false, error: 'Invalid token' });
      return;
    }

    // ── CRM: List users (admin only) ──
    if (pathname === '/api/crm/users' && req.method === 'GET') {
      const ba = req.headers.authorization;
      const token = ba?.startsWith('Bearer ') ? ba.slice(7) : '';
      const user = crm.authenticate(token);
      if (!user || !crm.can(user, 'users')) { send(res, 403, { ok: false, error: 'Forbidden' }); return; }
      send(res, 200, { ok: true, users: crm.listUsers() });
      return;
    }

    // ── CRM: Create user (admin only) ──
    if (pathname === '/api/crm/users' && req.method === 'POST') {
      const ba = req.headers.authorization;
      const token = ba?.startsWith('Bearer ') ? ba.slice(7) : '';
      const user = crm.authenticate(token);
      if (!user || !crm.can(user, 'users')) { send(res, 403, { ok: false, error: 'Forbidden' }); return; }
      const data = await parseBody(req);
      const result = await crm.createUser(data);
      if (result.error) { send(res, 400, { ok: false, error: result.error }); return; }
      send(res, 200, { ok: true, user: result.user });
      return;
    }

    // ── CRM: Update user (admin only) ──
    if (pathname.startsWith('/api/crm/users/') && req.method === 'PUT') {
      const ba = req.headers.authorization;
      const token = ba?.startsWith('Bearer ') ? ba.slice(7) : '';
      const admin = crm.authenticate(token);
      if (!admin || !crm.can(admin, 'users')) { send(res, 403, { ok: false, error: 'Forbidden' }); return; }
      const userId = pathname.replace('/api/crm/users/', '');
      const data = await parseBody(req);
      const result = await crm.updateUser(userId, data);
      if (result.error) { send(res, 400, { ok: false, error: result.error }); return; }
      send(res, 200, { ok: true, user: result.user });
      return;
    }

    // ── CRM: Delete user (admin only) ──
    if (pathname.startsWith('/api/crm/users/') && req.method === 'DELETE') {
      const ba = req.headers.authorization;
      const token = ba?.startsWith('Bearer ') ? ba.slice(7) : '';
      const admin = crm.authenticate(token);
      if (!admin || !crm.can(admin, 'users')) { send(res, 403, { ok: false, error: 'Forbidden' }); return; }
      const userId = pathname.replace('/api/crm/users/', '');
      crm.deleteUser(userId);
      send(res, 200, { ok: true, message: 'User deleted' });
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


    // ── Magic Key: OCR image → translate → autofill recipe ──
    if (pathname === '/api/recipe-magic' && req.method === 'POST') {
      const { imageUrl } = await parseBody(req);
      if (!imageUrl) { send(res, 400, { ok: false, error: 'Image URL required' }); return; }

      const tmpImg = path.join(__dirname, '..', 'data', 'magic-tmp.jpg');
      const { execSync } = require('child_process');

      try {
        const proto = imageUrl.startsWith('https') ? https : http;
        await new Promise((resolve, reject) => {
          proto.get(imageUrl, resp => {
            if (resp.statusCode !== 200) { reject(new Error('HTTP ' + resp.statusCode)); return; }
            const file = fs.createWriteStream(tmpImg);
            resp.pipe(file);
            file.on('finish', () => resolve());
          }).on('error', reject);
        });
      } catch (e) {
        send(res, 500, { ok: false, error: 'Download failed: ' + e.message });
        return;
      }

      let ocrText = '';
      try {
        ocrText = execSync('tesseract "' + tmpImg + '" stdout -l chi_sim+eng --psm 6 2>/dev/null', { timeout: 30 }).toString().trim();
      } catch {
        try { ocrText = execSync('tesseract "' + tmpImg + '" stdout -l eng 2>/dev/null', { timeout: 30 }).toString().trim(); } catch {}
      }
      if (!ocrText) { send(res, 200, { ok: true, ocr: '', error: 'No text found in image' }); return; }

      const payload = JSON.stringify({
        prompt: 'Extract recipe info from this text. Return ONLY JSON with: title, subtitle, description, prepTime, cookTime, servings, difficulty, ingredients (array of {group, items}), instructions (array), equipment (array), video.',
        temperature: 0.1, max_tokens: 1024
      });

      let translated = '';
      try {
        const resp = await new Promise((resolve, reject) => {
          const r = http.request({ hostname: '127.0.0.1', port: 8089, method: 'POST', path: '/completions',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }}, res2 => {
            let body = '';
            res2.on('data', c => body += c);
            res2.on('end', () => resolve(JSON.parse(body)));
          });
          r.write(payload);
          r.end();
        });
        translated = resp.choices?.[0]?.text || '';
      } catch {}

      let recipe = {};
      try {
        const jm = translated.match(/{[\s\S]*?}/);
        if (jm) recipe = JSON.parse(jm[0]);
      } catch {}

      send(res, 200, { ok: true, ocr: ocrText, recipe, raw: translated });
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

    // ── Contact form submission ──
    if (pathname === '/api/contact' && req.method === 'POST') {
      const form = await parseBody(req);
      form.timestamp = new Date().toISOString();
      form.ip = req.socket.remoteAddress;
      let submissions = [];
      if (fs.existsSync(CONTACT_FILE)) {
        try { submissions = JSON.parse(fs.readFileSync(CONTACT_FILE, 'utf-8')); } catch {}
      }
      submissions.push(form);
      fs.writeFileSync(CONTACT_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
      console.log(`📩 Contact form submission from ${form.name} <${form.email}>`);
      send(res, 200, { ok: true, message: 'Message received! We will get back to you soon.' });
      return;
    }

    // ── View contact submissions (admin only) ──
    if (pathname === '/api/contact-submissions' && req.method === 'GET') {
      if (!auth || !auth.startsWith('Bearer admin-token-')) {
        send(res, 401, { ok: false, error: 'Unauthorized' });
        return;
      }
      let submissions = [];
      if (fs.existsSync(CONTACT_FILE)) {
        try { submissions = JSON.parse(fs.readFileSync(CONTACT_FILE, 'utf-8')); } catch {}
      }
      send(res, 200, { ok: true, submissions });
      return;
    }

    // ── Upload image ──
    if (pathname === '/api/upload' && req.method === 'POST') {
      const { image, name } = await parseBody(req);
      if (!image) { send(res, 400, { ok: false, error: 'No image data' }); return; }

      const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const ext = (name || '.jpg').split('.').pop() || 'jpg';
      const filename = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext.replace(/[^a-zA-Z0-9]/g, '');
      const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);

      send(res, 200, { ok: true, url: '/temtemsabah/uploads/' + filename });
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
