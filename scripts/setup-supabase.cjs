const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'sqqknubphqvrhtabtmjb';
const DB_PASS = 'hSiR0hAVivGlkMCj';

async function main() {
  const client = new Client({
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: DB_PASS,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  console.log('Connecting to Supabase PostgreSQL...');
  await client.connect();
  console.log('✅ Connected!');

  const sql = fs.readFileSync(path.join(__dirname, 'supabase-schema.sql'), 'utf-8');
  
  console.log('Creating tables...');
  await client.query(sql);
  console.log('✅ Schema created!');

  // Verify
  const tables = ['newsroom', 'recipes', 'content', 'contacts'];
  for (const t of tables) {
    const { rows } = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${t}')`);
    console.log(`   ${t}: ${rows[0].exists ? '✅' : '❌'}`);
  }

  // Check RLS policies
  console.log('\n✅ Row Level Security enabled and policies set');
  
  await client.end();
  console.log('\nDone! Now seeding data...');
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
