// Test the exact saveRecipes flow
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
        try { resolve({ status: res.statusCode, data: JSON.parse(d), headers: res.headers }); }
        catch { resolve({ status: res.statusCode, data: d, headers: res.headers }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  // Step 1: Get existing recipes
  console.log("=== Step 1: Get existing recipes ===");
  const existing = await fetch('GET', 'recipes?select=id,title,recipe_id&order=created_at.asc');
  console.log("Status:", existing.status);
  if (existing.status === 200) {
    console.log("Count:", existing.data.length);
    existing.data.forEach(r => console.log(" ", r.title, "- id:", r.id?.substring(0, 20) + "..., recipe_id:", r.recipe_id));
  } else {
    console.log("Error:", JSON.stringify(existing.data).substring(0, 200));
    return;
  }
  
  // Step 2: DELETE all
  console.log("\n=== Step 2: DELETE all ===");
  const del = await fetch('DELETE', 'recipes?id=neq.00000000-0000-0000-0000-000000000000', null);
  console.log("Status:", del.status, "| data:", JSON.stringify(del.data));
  
  if (del.status !== 200) {
    console.log("DELETE FAILED - this is the problem!");
    return;
  }
  
  // Step 3: INSERT clean (simulating what saveRecipes does)
  console.log("\n=== Step 3: INSERT clean ===");
  // Take existing recipes and strip any 'r-' IDs (none should exist in DB data)
  const clean = existing.data.map(r => {
    if (r.id && typeof r.id === 'string' && r.id.startsWith('r-')) {
      const { id, ...rest } = r;
      return rest;
    }
    return r;
  });
  
  console.log("Inserting", clean.length, "recipes");
  const ins = await fetch('POST', 'recipes', clean);
  console.log("Status:", ins.status);
  if (ins.status === 201) {
    console.log("INSERT OK!");
  } else {
    console.log("INSERT FAILED:", JSON.stringify(ins.data).substring(0, 300));
    console.log("Headers:", JSON.stringify(ins.headers));
  }
  
  // Check final count
  const final = await fetch('GET', 'recipes?select=count', null);
  console.log("\nFinal count:", JSON.stringify(final.data));
}

main().catch(e => console.error(e));
