// Cloudflare Worker — CORS Proxy for Magic Key
// Deploy: run `curl` with multipart upload (see deploy.sh)

// Handle CORS preflight
async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { url, headers: reqHeaders, body: reqBody } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: 'url required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const targetHeaders = {};
    if (reqHeaders) {
      const allowed = ['authorization', 'content-type'];
      for (const [key, val] of Object.entries(reqHeaders)) {
        if (allowed.includes(key.toLowerCase())) {
          targetHeaders[key] = val;
        }
      }
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: targetHeaders,
      body: reqBody,
    });

    const data = await resp.text();

    return new Response(data, {
      status: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
