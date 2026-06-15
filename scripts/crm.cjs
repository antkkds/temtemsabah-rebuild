const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const SALT_ROUNDS = 12;

// ── Sessions (in-memory, lost on restart — token lifetime: 24h) ──
const sessions = new Map();

// ── Storage ──
function ensureFile() {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]', 'utf-8');
}

function readUsers() {
  ensureFile();
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8')); }
  catch { return []; }
}

function writeUsers(users) {
  ensureFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// ── Auth ──
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ── Seed: create initial admin if no users exist ──
async function seedAdmin(email, password) {
  const users = readUsers();
  if (users.length > 0) return false;
  const hash = await hashPassword(password);
  users.push({
    id: 'u_' + Date.now().toString(36) + crypto.randomBytes(4).toString('hex'),
    email,
    passwordHash: hash,
    name: 'Admin',
    role: 'admin',
    permissions: { newsroom: true, recipes: true, users: true, content: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  writeUsers(users);
  return true;
}

// ── Login ──
async function login(email, password) {
  const users = readUsers();
  const user = users.find(u => u.email === email.toLowerCase().trim());
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  const token = generateToken();
  sessions.set(token, { userId: user.id, createdAt: Date.now() });
  // Return user WITHOUT passwordHash
  const { passwordHash, ...safe } = user;
  return { token, user: safe };
}

// ── Authenticate from token ──
function authenticate(token) {
  const session = sessions.get(token);
  if (!session) return null;
  // 24h expiry
  if (Date.now() - session.createdAt > 86400000) {
    sessions.delete(token);
    return null;
  }
  const users = readUsers();
  const user = users.find(u => u.id === session.userId);
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

// ── CRUD ──
function listUsers() {
  return readUsers().map(({ passwordHash, ...u }) => u);
}

function getUser(id) {
  const users = readUsers();
  const user = users.find(u => u.id === id);
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

async function createUser({ email, password, name, role, permissions }) {
  const users = readUsers();
  if (users.find(u => u.email === email.toLowerCase().trim())) {
    return { error: 'Email already exists' };
  }
  const hash = await hashPassword(password);
  const user = {
    id: 'u_' + Date.now().toString(36) + crypto.randomBytes(4).toString('hex'),
    email: email.toLowerCase().trim(),
    passwordHash: hash,
    name: name || email.split('@')[0],
    role: role || 'editor',
    permissions: permissions || { newsroom: false, recipes: false, users: false, content: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  const { passwordHash, ...safe } = user;
  return { user: safe };
}

async function updateUser(id, updates) {
  const users = readUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return { error: 'User not found' };
  if (updates.password) {
    updates.passwordHash = await hashPassword(updates.password);
    delete updates.password;
  }
  Object.assign(users[idx], updates, { updatedAt: new Date().toISOString() });
  writeUsers(users);
  const { passwordHash, ...safe } = users[idx];
  return { user: safe };
}

function deleteUser(id) {
  const users = readUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return { error: 'User not found' };
  const removed = users.splice(idx, 1)[0];
  writeUsers(users);
  // Remove their sessions
  for (const [token, session] of sessions) {
    if (session.userId === id) sessions.delete(token);
  }
  return { ok: true };
}

// ── Permission check ──
function can(user, permission) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return !!user.permissions?.[permission];
}

module.exports = {
  seedAdmin,
  login,
  authenticate,
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  can,
};
