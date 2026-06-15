const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const supabase = require('./supabase.cjs');
const crm = require('./crm.cjs');
const busboy = require('busboy');

const ADMIN_PASS = 'admin123';

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); } });
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

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const auth = req.headers.authorization;
  const isAuth = () => auth && auth.startsWith('Bearer admin-token-');
  const ba = auth;
  const crmAuth = () => { const t = ba?.startsWith('Bearer ') ? ba.slice(7) : ''; return crm.authenticate(t); };

  try {
    // ── Health ──
    if (pathname === '/api/health') {
      send(res, 200, { ok: true, service: 'TemTemSabah Admin', db: 'supabase' });
      return;
    }

    // ── Login (CRM) ──
    if (pathname === '/api/login' && req.method === 'POST') {
      const { password } = await parseBody(req);
      send(res, password === ADMIN_PASS ? 200 : 401, password === ADMIN_PASS
        ? { ok: true, token: 'admin-token-' + Date.now() }
        : { ok: false, error: 'Wrong password' });
      return;
    }

    // ── CRM: Login ──
    if (pathname === '/api/crm/login' && req.method === 'POST') {
      const { email, password } = await parseBody(req);
      const result = await crm.login(email, password);
      if (result) { send(res, 200, { ok: true, token: result.token, user: result.user }); }
      else { send(res, 401, { ok: false, error: 'Invalid email or password' }); }
      return;
    }

    // ── CRM: Me ──
    if (pathname === '/api/crm/me' && req.method === 'GET') {
      const user = crmAuth();
      if (user) { send(res, 200, { ok: true, user }); return; }
      send(res, 401, { ok: false, error: 'Invalid token' });
      return;
    }

    // ── CRM: List users ──
    if (pathname === '/api/crm/users' && req.method === 'GET') {
      const user = crmAuth();
      if (!user || !crm.can(user, 'users')) { send(res, 403, { ok: false, error: 'Forbidden' }); return; }
      send(res, 200, { ok: true, users: crm.listUsers() });
      return;
    }

    // ── CRM: Create user ──
    if (pathname === '/api/crm/users' && req.method === 'POST') {
      const user = crmAuth();
      if (!user || !crm.can(user, 'users')) { send(res, 403, { ok: false, error: 'Forbidden' }); return; }
      const data = await parseBody(req);
      const result = await crm.createUser(data);
      if (result.error) { send(res, 400, { ok: false, error: result.error }); return; }
      send(res, 200, { ok: true, user: result.user });
      return;
    }

    // ── CRM: Update user ──
    if (pathname.startsWith('/api/crm/users/') && req.method === 'PUT') {
      const admin = crmAuth();
      if (!admin || !crm.can(admin, 'users')) { send(res, 403, { ok: false, error: 'Forbidden' }); return; }
      const userId = pathname.replace('/api/crm/users/', '');
      const data = await parseBody(req);
      const result = await crm.updateUser(userId, data);
      if (result.error) { send(res, 400, { ok: false, error: result.error }); return; }
      send(res, 200, { ok: true, user: result.user });
      return;
    }

    // ── CRM: Delete user ──
    if (pathname.startsWith('/api/crm/users/') && req.method === 'DELETE') {
      const admin = crmAuth();
      if (!admin || !crm.can(admin, 'users')) { send(res, 403, { ok: false, error: 'Forbidden' }); return; }
      const userId = pathname.replace('/api/crm/users/', '');
      crm.deleteUser(userId);
      send(res, 200, { ok: true, message: 'User deleted' });
      return;
    }

    // ── GET newsroom ──
    if (pathname === '/api/newsroom' && req.method === 'GET') {
      const { data: articles } = await supabase.getArticles(url.searchParams.get('status'));
      send(res, 200, { ok: true, articles: articles || [] });
      return;
    }

    // ── PUT newsroom ──
    if (pathname === '/api/newsroom' && req.method === 'PUT') {
      if (!isAuth() && !crmAuth()?.permissions?.newsroom) { send(res, 401, { ok: false, error: 'Unauthorized' }); return; }
      const { articles } = await parseBody(req);
      await supabase.saveArticles(articles);
      send(res, 200, { ok: true, message: 'Newsroom saved!', count: articles?.length || 0 });
      return;
    }

    // ── GET single article ──
    if (pathname.startsWith('/api/newsroom/') && req.method === 'GET') {
      const slug = pathname.replace('/api/newsroom/', '');
      const { data: arts } = await supabase.getArticle(slug);
      if (arts && arts.length) { send(res, 200, { ok: true, article: arts[0] }); return; }
      send(res, 404, { ok: false, error: 'Not found' });
      return;
    }

    // ── GET recipes ──
    if (pathname === '/api/recipes' && req.method === 'GET') {
      const { data: recipes } = await supabase.getRecipes();
      send(res, 200, { ok: true, recipes: recipes || [] });
      return;
    }

    // ── PUT recipes ──
    if (pathname === '/api/recipes' && req.method === 'PUT') {
      if (!isAuth() && !crmAuth()?.permissions?.recipes) { send(res, 401, { ok: false, error: 'Unauthorized' }); return; }
      const { recipes } = await parseBody(req);
      await supabase.saveRecipes(recipes);
      send(res, 200, { ok: true, message: 'Recipes saved!', count: recipes?.length || 0 });
      return;
    }

    // ── POST content ──
    if (pathname === '/api/content' && req.method === 'POST') {
      if (!isAuth() && !crmAuth()?.permissions?.content) { send(res, 401, { ok: false, error: 'Unauthorized' }); return; }
      const data = await parseBody(req);
      await supabase.saveContent(data);
      send(res, 200, { ok: true, message: 'Content saved!' });
      return;
    }

    // ── POST contact ──
    if (pathname === '/api/contact' && req.method === 'POST') {
      const data = await parseBody(req);
      await supabase.saveContact(data);
      send(res, 200, { ok: true, message: 'Message received!' });
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

    // ── Upload file to Supabase Storage (multipart) ──
    if (pathname === '/api/upload-file' && req.method === 'POST') {
      const chunks = [];
      const bb = busboy({ headers: req.headers });
      let fileBuffer = null;
      let fileName = 'photo.jpg';
      let folderName = 'recipe';

      bb.on('file', (fieldname, file, info) => {
        fileName = info.filename || fileName;
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
      });

      bb.on('field', (name, val) => {
        if (name === 'folder') folderName = val;
      });

      bb.on('finish', async () => {
        if (!fileBuffer) { send(res, 400, { ok: false, error: 'No file received' }); return; }
        const result = await supabase.uploadFile(fileBuffer, fileName, folderName);
        if (result.ok) { send(res, 200, { ok: true, url: result.url }); }
        else { send(res, 500, { ok: false, error: result.error }); }
      });

      req.pipe(bb);
      return;
    }

    // ── Extract URL metadata ──
    if (pathname === '/api/extract' && req.method === 'POST') {
      const { url: targetUrl } = await parseBody(req);
      if (!targetUrl) { send(res, 400, { ok: false, error: 'URL required' }); return; }
      const fetcher = targetUrl.startsWith('https') ? https : http;
      try {
        const data = await new Promise((resolve, reject) => {
          fetcher.get(targetUrl, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (resp) => {
            let d = ''; resp.on('data', c => d += c); resp.on('end', () => resolve(d));
          }).on('error', reject);
        });
        const og = (p) => { const r = data.match(new RegExp(`<meta[^>]*property=["']og:${p}["'][^>]*content=["']([^"']*)["']`, 'i')); return r ? r[1] : ''; };
        const meta = { title: og('title') || (data.match(/<title>([^<]*)<\/title>/i)?.[1] || '').replace(/\s*\|\s*.*$/, '').trim(), description: og('description') || data.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1] || '', image: og('image'), site_name: og('site_name') };
        const clean = (s) => s ? s.replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (m, c) => String.fromCodePoint(parseInt(c, 10))).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim() : '';
        send(res, 200, { ok: true, meta: { title: clean(meta.title), description: clean(meta.description), image: clean(meta.image), site_name: clean(meta.site_name) } });
      } catch (e) { send(res, 500, { ok: false, error: 'Fetch failed: ' + e.message }); }
      return;
    }

    // ── Recipe Magic (NVIDIA Llama 3.2 90B Vision) ──
    if (pathname === '/api/recipe-magic' && req.method === 'POST') {
      const { imageUrl } = await parseBody(req);
      if (!imageUrl) { send(res, 400, { ok: false, error: 'Image URL required' }); return; }

      const nvKey = process.env.NVIDIA_API_KEY;
      if (!nvKey) {
        send(res, 200, { ok: false, error: 'NVIDIA_API_KEY not set' });
        return;
      }

      const payload = JSON.stringify({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Extract recipe information from this image. Return ONLY valid JSON with these fields: title, subtitle, description, prep, cook, servings, ingredients (array of objects with group and items array), instructions (array of strings), equipment (array), tips, video. If ingredients have groups, separate them. If no info for a field, use empty string or empty array. Return ONLY the JSON object, no markdown, no code blocks, no explanation.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }],
        max_tokens: 2048,
        temperature: 0.1,
      });

      try {
        const resp = await new Promise((resolve, reject) => {
          const r = https.request({
            hostname: 'ai.api.nvidia.com',
            path: '/v1/gr/meta/llama-3.2-11b-vision-instruct/chat/completions',
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + nvKey,
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
          }, (res2) => {
            let d = ''; res2.on('data', c => d += c);
            res2.on('end', () => resolve({ status: res2.statusCode, body: d }));
          });
          r.on('error', reject); r.write(payload); r.end();
        });

        if (resp.status !== 200) {
          send(res, 200, { ok: false, error: 'NVIDIA API error: ' + resp.body.slice(0, 300) });
          return;
        }

        const parsed = JSON.parse(resp.body);
        const text = parsed.choices?.[0]?.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let recipe = {};
        if (jsonMatch) { try { recipe = JSON.parse(jsonMatch[0]); } catch {} }
        send(res, 200, { ok: true, recipe, raw: text.slice(0, 500) });
      } catch (e) {
        send(res, 200, { ok: false, error: e.message });
      }
      return;
    }

    send(res, 404, { ok: false, error: 'Not found' });
  } catch (e) {
    console.error('Server error:', e);
    send(res, 500, { ok: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3456;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`✏️  Edit API (Supabase) running on http://127.0.0.1:${PORT}`);
  console.log(`   POST /api/crm/login - CRM login`);
  console.log(`   GET  /api/crm/users - List users (admin)`);
  console.log(`   GET  /api/newsroom - List newsroom`);
  console.log(`   GET  /api/recipes - List recipes`);
});
