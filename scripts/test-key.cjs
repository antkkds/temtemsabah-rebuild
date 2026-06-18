// Let's try to log in via GoTrue API to see if it works
const https = require('https');

function gotrue(path, body, apiKey) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: 'sqqknubphqvrhtabtmjb.supabase.co',
      path: '/auth/v1/' + path,
      method: body ? 'POST' : 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };
    const r = https.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(d); } catch { parsed = d; }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  // Try login with the truncated anon key
  console.log('=== Testing with truncated key ===');
  let r = await gotrue('token?grant_type=password', {
    email: 'antkkds@gmail.com',
    password: 'Antkk@3626'
  }, 'eyJhbG...Ee-o');
  console.log('Login status:', r.status);
  if (r.status === 200) {
    console.log('Login SUCCESS! Token available');
  } else {
    console.log('Login FAILED:', r.data);
  }
  
  // Test REST endpoint directly with the truncated key
  console.log('\n=== Testing REST with truncated key ===');
  const restOpts = {
    hostname: 'sqqknubphqvrhtabtmjb.supabase.co',
    path: '/rest/v1/newsroom?select=count&limit=1',
    method: 'GET',
    headers: {
      'apikey': 'eyJhbG...Ee-o',
      'Authorization': 'Bearer eyJhbG...Ee-o',
    },
  };
  const restResult = await new Promise((resolve, reject) => {
    const r2 = https.request(restOpts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: d }));
    });
    r2.on('error', reject);
    r2.end();
  });
  console.log('REST status:', restResult.status);
  console.log('REST data:', restResult.data);
}

main().catch(e => console.error(e));
