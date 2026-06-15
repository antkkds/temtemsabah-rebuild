const { Client } = require('pg');
const PROJECT_REF = 'sqqknubphqvrhtabtmjb';
const DB_PASS = 'hSiR0hAVivGlkMCj';

(async () => {
  const client = new Client({
    host: `db.${PROJECT_REF}.supabase.co`, port: 5432, database: 'postgres',
    user: 'postgres', password: DB_PASS, ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  // Create crm_users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS crm_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      role TEXT DEFAULT 'editor',
      permissions JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;
  `);
  await client.query(`CREATE POLICY "Allow all on crm_users" ON crm_users FOR ALL USING (true) WITH CHECK (true)`);
  console.log('✅ crm_users table created');

  // Migrate existing users from data/users.json
  const fs = require('fs');
  const path = require('path');
  const usersFile = path.join(__dirname, '..', 'data', 'users.json');
  if (fs.existsSync(usersFile)) {
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    for (const u of users) {
      await client.query(
        `INSERT INTO crm_users (id, email, password_hash, name, role, permissions, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (email) DO UPDATE SET password_hash=$3, name=$4, role=$5, permissions=$6, updated_at=NOW()`,
        [u.id, u.email, u.passwordHash, u.name, u.role, JSON.stringify(u.permissions || {}), u.createdAt, u.updatedAt]
      );
    }
    console.log(`✅ Migrated ${users.length} users from local file`);
  } else {
    console.log('⚠️  No local users.json found');
  }

  await client.end();
  console.log('Done!');
})().catch(e => { console.error('❌', e.message); process.exit(1); });
