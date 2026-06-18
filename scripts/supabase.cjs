// Supabase REST API helper — uses service_role key for full access
const https = require('https');

const SUPABASE_URL = 'sqqknubphqvrhtabtmjb.supabase.co';
const SVC_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWtudWJwaHF2cmh0YWJ0bWpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ5NTU3MCwiZXhwIjoyMDk3MDcxNTcwfQ.3bE-jhxy8R_Ay9pSXPVE1znDzzi44H0kP7PN7-LiD0A';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWtudWJwaHF2cmh0YWJ0bWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTU1NzAsImV4cCI6MjA5NzA3MTU3MH0.N-Gs3GwYVErNdN7zfjS8Z2pi0ikgRHVKdDXJnUwEe-o';

function fetch(path, method, body = null, params = '', prefer = 'return=minimal') {
  return new Promise((resolve, reject) => {
    const qs = params ? '?' + params : '';
    const opts = {
      hostname: SUPABASE_URL,
      path: '/rest/v1/' + path + qs,
      method,
      headers: {
        'apikey': SVC_KEY,
        'Authorization': 'Bearer ' + SVC_KEY,
        'Content-Type': 'application/json',
        'Prefer': prefer,
      },
    };
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);
    const r = https.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: d ? JSON.parse(d) : null, headers: res.headers });
        } catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

module.exports = {
  // Newsroom
  getArticles: (status) => {
    const filter = status ? `&status=eq.${status}` : '';
    return fetch(`newsroom?order=created_at.desc${filter}`, 'GET');
  },
  getArticle: (slug) => fetch(`newsroom?slug=eq.${encodeURIComponent(slug)}`, 'GET'),
  saveArticles: async (articles) => {
    if (!articles.length) return { status: 200 };
    return fetch('newsroom', 'POST', JSON.stringify(articles), 'on_conflict=id', 'resolution=merge-duplicates');
  },

  // Recipes
  getRecipes: () => fetch('recipes?order=created_at', 'GET'),
  saveRecipes: async (recipes) => {
    if (!recipes.length) return { status: 200 };
    return fetch('recipes', 'POST', JSON.stringify(recipes), 'on_conflict=id', 'resolution=merge-duplicates');
  },

  // Content
  getContent: () => fetch('content', 'GET'),
  saveContent: async (data) => {
    for (const [key, val] of Object.entries(data)) {
      await fetch('content', 'POST', JSON.stringify({ key, value: val, updated_at: new Date().toISOString() }), 'onConflict=key');
    }
    return { status: 200 };
  },

  // Contacts
  saveContact: (data) => {
    return fetch('contacts', 'POST', JSON.stringify({ ...data, received_at: new Date().toISOString() }));
  },

  // Upload file to Supabase Storage
  uploadFile: async (buffer, filename, folder = 'recipe') => {
    const ext = filename.split('.').pop() || 'jpg';
    const name = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
    const path = folder + '/' + name;
    const mime = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
    return new Promise((resolve, reject) => {
      const opts = {
        hostname: SUPABASE_URL,
        path: '/storage/v1/object/' + path,
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + SVC_KEY,
          'Content-Type': mime,
          'Content-Length': buffer.length,
        },
      };
      const r = https.request(opts, (res) => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          if (res.statusCode < 300) {
            resolve({ ok: true, url: `https://${SUPABASE_URL}/storage/v1/object/public/${path}` });
          } else {
            resolve({ ok: false, error: d.slice(0, 200) });
          }
        });
      });
      r.on('error', reject);
      r.write(buffer);
      r.end();
    });
  },

  // Raw query helpers
  fetch,
};
