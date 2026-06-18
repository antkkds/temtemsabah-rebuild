// FINAL TEST: use real UUID like the fixed code does
const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

const src = fs.readFileSync('src/lib/supabase.js', 'utf8');
const match = src.match(/const ANON_KEY = '([^']+)'/);
const ANON_KEY = match ? match[1] : '';
const HOST = 'sqqknubphqvrhtabtmjb.supabase.co';

function fetch(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: HOST,
      path: '/rest/v1/' + path,
      method,
      headers: {
        'apikey': ANON_KEY,
        'Authorization': 'Bearer ' + ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    };
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(data);
    const r = https.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  const existing = await fetch('GET', 'recipes?select=*&order=title.asc', null);
  console.log("Existing:", existing.data.length);
  if (!existing.data.length) { console.log("No recipes - restore first"); return; }
  
  const dbKeys = Object.keys(existing.data[0]).sort();
  const newRecipe = {};
  dbKeys.forEach(k => {
    if (k === 'id') newRecipe[k] = crypto.randomUUID();
    else if (k === 'recipe_id') newRecipe[k] = 'final-test-recipe';
    else if (k === 'title') newRecipe[k] = 'Final Test Recipe';
    else if (k === 'created_at' || k === 'updated_at') newRecipe[k] = new Date().toISOString();
    else newRecipe[k] = existing.data[0][k];
  });
  
  const updated = [...existing.data, newRecipe];
  console.log("DELETE...");
  await fetch('DELETE', 'recipes?id=neq.00000000-0000-0000-0000-000000000000', null);
  
  console.log("INSERT", updated.length, "recipes (all with UUID ids)...");
  const ins = await fetch('POST', 'recipes', updated);
  console.log("Status:", ins.status);
  if (ins.status === 201) {
    console.log("✅ SAVE SUCCESS! Rows:", ins.data.length);
  } else {
    console.log("❌ FAILED:", JSON.stringify(ins.data).substring(0, 400));
  }
  
  const verify = await fetch('GET', 'recipes?select=title,recipe_id&order=title.asc', null);
  console.log("\nFinal count:", verify.data.length);
  verify.data.forEach(r => console.log(`  ${r.title}`));
}

main().catch(e => console.error(e));
