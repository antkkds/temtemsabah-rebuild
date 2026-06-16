// Client-side vision API calls for Magic Key feature
import { supabase } from './supabase';

export async function callMagicVision(imageUrl) {
  const settings = JSON.parse(localStorage.getItem('tts_settings') || '{}');
  const key = settings.apiKey;
  const model = settings.model || 'nvidia/llama-3.2-11b-vision';
  const proxyUrl = settings.proxyUrl || '';
  if (!key) return { error: 'No API key set. Go to Settings to add one.' };

  const prompt = 'Extract recipe information from this image. Return ONLY valid JSON with these fields: title, subtitle, description, prep, cook, servings, ingredients (array of objects with group and items array), instructions (array of strings), equipment (array), tips, video. If ingredients have groups, separate them. If no info for a field, use empty string or empty array. Return ONLY the JSON object, no markdown, no code blocks, no explanation.';

  async function doFetch(url, opts) {
    // If proxy is configured, route through it
    if (proxyUrl) {
      const proxyResp = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url,
          headers: opts.headers,
          body: opts.body,
        }),
      });
      if (!proxyResp.ok) {
        const errText = await proxyResp.text();
        throw new Error('Proxy error: ' + (errText || proxyResp.status));
      }
      return proxyResp;
    }
    // Direct call (only works for APIs that support CORS like OpenAI)
    return await fetch(url, opts);
  }

  try {
    if (model.startsWith('nvidia/')) {
      const nvModel = model === 'nvidia/llama-3.2-90b-vision'
        ? 'meta/llama-3.2-90b-vision-instruct'
        : 'meta/llama-3.2-11b-vision-instruct';
      const endpoint = 'https://ai.api.nvidia.com/v1/gr/' + nvModel + '/chat/completions';
      const resp = await doFetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageUrl } }] }],
          max_tokens: 2048, temperature: 0.1,
        }),
      });
      const data = await resp.json();
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        let text = data.choices[0].message.content;
        text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        try { return { recipe: JSON.parse(text) }; } catch { return { ocr: text }; }
      }
      return { error: (data.error && data.error.message) || 'API error — check your key and proxy settings' };

    } else if (model.startsWith('openai/')) {
      // OpenAI supports CORS, no proxy needed
      const openaiModel = model === 'openai/gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini';
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: openaiModel,
          messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageUrl } }] }],
          max_tokens: 2048, temperature: 0.1,
        }),
      });
      const data = await resp.json();
      if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        let text = data.choices[0].message.content;
        text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        try { return { recipe: JSON.parse(text) }; } catch { return { ocr: text }; }
      }
      return { error: (data.error && data.error.message) || 'Unknown error' };
    }

    return { error: 'Unsupported model: ' + model };
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS')) {
      return { error: 'Browser blocked the request (CORS). Add a Proxy URL in ⚙ Settings or use an OpenAI key (supports CORS).' };
    }
    return { error: msg || 'Network error' };
  }
}

// Delete an uploaded image from Supabase Storage
export async function deleteUploadedImage(url) {
  if (!url) return;
  const match = url.match(/\/object\/public\/([^/]+)\/(.+)/);
  if (!match) return;
  const bucket = match[1];
  const path = match[2];
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch {}
}
