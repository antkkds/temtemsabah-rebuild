// Direct REST test for storage upload
const https = require('https');
const fs = require('fs');

const src = fs.readFileSync('src/lib/supabase.js', 'utf8');
const match = src.match(/const ANON_KEY = '([^']+)'/);
const ANON_KEY = match ? match[1] : '';

function request(method, path, contentType, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'sqqknubphqvrhtabtmjb.supabase.co',
      path: '/storage/v1/' + path,
      method,
      headers: {
        'apikey': ANON_KEY,
        'Authorization': 'Bearer ' + ANON_KEY,
      },
    };
    if (body) {
      opts.headers['Content-Type'] = contentType;
      opts.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const r = https.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function main() {
  // Upload a test file
  const testContent = 'test upload content';
  const fileName = 'test-' + Date.now() + '.txt';
  
  const upload = await request('POST', 'object/recipe/' + fileName, 'text/plain', testContent);
  console.log('Upload:', upload.status, JSON.stringify(upload.data));
  
  if (upload.status === 200) {
    // Check it exists
    const list = await request('GET', 'object/recipe/' + fileName, null, null);
    console.log('Exists:', list.status);
    
    // Clean up
    const del = await request('DELETE', 'object/recipe/' + fileName, null, null);
    console.log('Deleted:', del.status);
  }
}

main().catch(e => console.error(e));
