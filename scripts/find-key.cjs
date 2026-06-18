const { Client } = require("pg");
const c = new Client({
  connectionString: "postgresql://postgres:hSiR0hAVivGlkMCj@db.sqqknubphqvrhtabtmjb.supabase.co:5432/postgres"
});
c.connect().then(async () => {
  // Use the decrypted_secrets view properly
  try {
    const r = await c.query("SELECT * FROM vault.decrypted_secrets WHERE 1=1 LIMIT 10");
    console.log("decrypted_secrets rows:", r.rows.length);
    r.rows.forEach(row => console.log("  ", JSON.stringify(row).substring(0, 300)));
  } catch(e) { console.log("decrypted_secrets error:", e.message); }
  
  // Check pg_settings
  try {
    const keys = await c.query("SELECT name, setting FROM pg_settings WHERE name LIKE '%jwt%' OR name LIKE '%secret%' LIMIT 5");
    keys.rows.forEach(r => console.log("pg_settings:", r.name, "=", r.setting?.substring(0, 60)));
  } catch(e) { console.log("pg_settings error:", e.message); }

  await c.end();
}).catch(e => console.error("Error:", e.message));
