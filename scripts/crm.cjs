// CRM module — stores users in Supabase, tokens in memory
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SALT_ROUNDS = 12;
const sessions = new Map();

// Supabase REST helper (reuse from supabase.cjs patterns)
const https = require('https');
const SUPABASE_HOST = 'sqqknubphqvrhtabtmjb.supabase.co';
const SVC_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcWtudWJwaHF2cmh0YWJ0bWpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ5NTU3MCwiZXhwIjoyMDk3MDcxNTcwfQ.3bE-jhxy8R_Ay9pSXPVE1znDzzi44H0kP7PN7-LiD0A';

function api(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SUPABASE_HOST,
      path: '/rest/v1/' + path,
      method,
      headers: {
        'apikey': SVC_KEY,
        'Authorization': 'Bearer ' + SVC_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    };
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);
    const r = https.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: d ? JSON.parse(d) : null }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

// ── Helpers ──
function hashPassword(password) { return bcrypt.hash(password, SALT_ROUNDS); }
function verifyPassword(password, hash) { return bcrypt.compare(password, hash); }
function generateToken() { return crypto.randomBytes(32).toString('hex'); }
function stripHash(u) { if (!u) return null; const { password_hash, ...safe } = u; return safe; }

// ── Seed initial admin ──
async function seedAdmin(email, password) {
  const r = await api('GET', `crm_users?select=id&limit=1`);
  if (r.data && r.data.length > 0) return false;
  const hash = await hashPassword(password);
  const id = 'u_' + Date.now().toString(36) + crypto.randomBytes(4).toString('hex');
  await api('POST', 'crm_users', JSON.stringify({
    id, email: email.toLowerCase().trim(), password_hash: hash,
    name: 'Admin', role: 'admin',
    permissions: { newsroom: true, recipes: true, users: true, content: true },
  }));
  return true;
}

// ── Login ──
async function login(email, password) {
  const r = await api('GET', `crm_users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=*`);
  if (!r.data || r.data.length === 0) return null;
  const user = r.data[0];
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return null;
  const token = generateToken();
  sessions.set(token, { userId: user.id, user: stripHash(user), createdAt: Date.now() });
  return { token, user: stripHash(user) };
}

// ── Authenticate from token ──
function authenticate(token) {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() - session.createdAt > 86400000) { sessions.delete(token); return null; }
  return session.user || null;
}

// ── CRUD ──
async function listUsers() {
  const r = await api('GET', 'crm_users?order=created_at.asc');
  return (r.data || []).map(stripHash);
}

async function getUser(id) {
  const r = await api('GET', `crm_users?id=eq.${id}&select=*`);
  return r.data && r.data.length ? stripHash(r.data[0]) : null;
}

async function createUser({ email, password, name, role, permissions }) {
  const exists = await api('GET', `crm_users?email=eq.${encodeURIComponent(email.toLowerCase().trim())}&select=id`);
  if (exists.data && exists.data.length > 0) return { error: 'Email already exists' };
  const hash = await hashPassword(password);
  const id = 'u_' + Date.now().toString(36) + crypto.randomBytes(4).toString('hex');
  const r = await api('POST', 'crm_users', JSON.stringify({
    id, email: email.toLowerCase().trim(), password_hash: hash,
    name: name || email.split('@')[0],
    role: role || 'editor',
    permissions: permissions || { newsroom: false, recipes: false, users: false, content: false },
  }));
  if (r.status >= 400) return { error: 'Failed to create user' };
  const created = await getUser(id);
  return { user: created };
}

async function updateUser(id, updates) {
  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email.toLowerCase().trim();
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.permissions !== undefined) payload.permissions = updates.permissions;
  if (updates.password) payload.password_hash = await hashPassword(updates.password);
  payload.updated_at = new Date().toISOString();
  const r = await api('PATCH', `crm_users?id=eq.${id}`, JSON.stringify(payload));
  if (r.status >= 400) return { error: 'Failed to update user' };
  const updated = await getUser(id);
  return { user: updated };
}

async function deleteUser(id) {
  await api('DELETE', `crm_users?id=eq.${id}`);
  for (const [token, session] of sessions) {
    if (session.userId === id) sessions.delete(token);
  }
  return { ok: true };
}

function can(user, permission) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return !!user.permissions?.[permission];
}

module.exports = { seedAdmin, login, authenticate, listUsers, getUser, createUser, updateUser, deleteUser, can };
