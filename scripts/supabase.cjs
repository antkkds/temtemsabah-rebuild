// Supabase REST API helper — uses service_role key for full access
const https = require('https');

const SUPABASE_URL = 'sqqknubphqvrhtabtmjb.supabase.co';
const SVC_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWtudWJwaHF2cmh0YWJ0bWpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ5NTU3MCwiZXhwIjoyMDk3MDcxNTcwfQ.3bE-jhxy8R_Ay9pSXPVE1znDzzi44H0kP7PN7-LiD0A';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWtudWJwaHF2cmh0YWJ0bWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTU1NzAsImV4cCI6MjA5NzA3MTU3MH0.N-Gs3GwYVErNdN7zfjS8Z2pi0ikgRHVKdDXJnUwEe-o';

function fetch(path, method, body = null, params = '') {
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
        'Prefer': 'return=minimal',
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
    // Delete all, re-insert
    await fetch('newsroom', 'DELETE');
    if (articles.length) {
      return fetch('newsroom', 'POST', JSON.stringify(articles));
    }
    return { status: 200 };
  },

  // Recipes
  getRecipes: () => fetch('recipes?order=created_at', 'GET'),
  saveRecipes: async (recipes) => {
    await fetch('recipes', 'DELETE');
    if (recipes.length) {
      return fetch('recipes', 'POST', JSON.stringify(recipes));
    }
    return { status: 200 };
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

  // Raw query helpers
  fetch,
};
