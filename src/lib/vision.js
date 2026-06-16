// Client-side vision API calls for Magic Key feature
import { supabase } from './supabase';

// Parse recipe text from AI response (handles Markdown, JSON, plain text)
function parseRecipeResponse(text) {
  if (!text) return null;

  // Try JSON first (clean + direct)
  const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
  try { const j = JSON.parse(cleaned); if (j.title) return j; } catch {}
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
    try { return JSON.parse(objMatch[0].replace(/,\s*}/g,'}').replace(/,\s*\]/g,']').replace(/'/g,'"').replace(/([{,]\s*)(\w+)(\s*:)/g,'$1"$2"$3')); } catch {}
  }

  // Strip Markdown bold markers
  let plain = text.replace(/\*\*/g, '').trim();

  // Split into lines
  const lines = plain.split('\n').map(l => l.trim()).filter(l => l);

  // Extract fields by looking for "Label:" patterns
  let title = '', subtitle = '', description = '', prep = '', cook = '', servings = '';
  const ingLines = [], instLines = [];
  let currentSection = '';

  for (const l of lines) {
    // Check for known labels
    const titleMatch = l.match(/^Title:\s*(.+)/i);
    const subMatch = l.match(/^Subtitle:\s*(.+)/i);
    const descMatch = l.match(/^Description:\s*(.+)/i);
    const prepMatch = l.match(/^Prep:\s*(.+)/i);
    const cookMatch = l.match(/^Cook:\s*(.+)/i);
    const serveMatch = l.match(/^Servings?:\s*(.+)/i);
    const ingHead = l.match(/^Ingredients?:?\s*/i);
    const instHead = l.match(/^Instructions?:?\s*/i);
    const bahnHead = l.match(/^BAHAN/i);

    if (titleMatch) { title = titleMatch[1].trim(); currentSection = ''; continue; }
    if (subMatch) { subtitle = subMatch[1].trim(); currentSection = ''; continue; }
    if (descMatch) { description = descMatch[1].trim(); currentSection = ''; continue; }
    if (prepMatch) { prep = prepMatch[1].trim(); currentSection = ''; continue; }
    if (cookMatch) { cook = cookMatch[1].trim(); currentSection = ''; continue; }
    if (serveMatch) { servings = serveMatch[1].trim(); currentSection = ''; continue; }
    if (ingHead || bahnHead) { currentSection = 'ingredients'; continue; }
    if (instHead) { currentSection = 'instructions'; continue; }

    if (currentSection === 'ingredients') {
      const item = l.replace(/^[•\-*\d.\s]+/, '').trim();
      if (item && item.length > 1 && !/^(bahan|langkah|instructions?|cara|alat|equipment|tip|video)/i.test(item)) {
        ingLines.push(item);
      }
    } else if (currentSection === 'instructions') {
      const item = l.replace(/^[•\-*\d.\s]+/, '').trim();
      if (item && item.length > 1 && !/^(bahan|langkah|instructions?|cara|alat|equipment|tip|video)/i.test(item)) {
        instLines.push(item);
      }
    }
  }

  // Fallback title: first non-empty line that's not a label or URL
  if (!title) {
    for (const l of lines) {
      if (/^Recipe Extraction/i.test(l)) continue;
      if (/^https?:\/\//i.test(l)) continue;
      if (/^\w+:\s/.test(l)) continue;
      if (l.length > 3) { title = l; break; }
    }
  }

  // Fallback ingredients: look for lines after "BAHAN" or similar
  if (ingLines.length === 0) {
    let inIng = false;
    for (const l of lines) {
      if (/^BAHAN|ingredients/i.test(l)) { inIng = true; continue; }
      if (inIng && /^Langkah|instructions?|cara\b/i.test(l)) break;
      if (inIng) {
        const item = l.replace(/^[•\-*\s]+/, '').trim();
        if (item && !/^(bahan|langkah)/i.test(item)) ingLines.push(item);
      }
    }
  }

  // Fallback instructions: look for lines after "Langkah" or "Instructions"
  if (instLines.length === 0) {
    let inInst = false;
    for (const l of lines) {
      if (/^Langkah|instructions?|cara\b/i.test(l)) { inInst = true; continue; }
      if (inInst && /^BAHAN|ingredients|alat|equipment|tip/i.test(l)) break;
      if (inInst) {
        const item = l.replace(/^[•\-*\s]+/, '').trim();
        if (item && !/^(langkah|cara)/i.test(item)) instLines.push(item);
      }
    }
  }

  // Remove "11:46 am" style timestamps from prep
  if (/^\d+:\d+\s*(am|pm)/i.test(prep)) prep = '';

  return {
    title: title || '',
    subtitle,
    description,
    prep,
    cook,
    servings: parseInt(servings) || 4,
    ingredients: [{ group: '', items: ingLines.map(i => {
      // Try to split quantity from name
      const m = i.match(/^([\d\/]+\s*[a-zA-Z]*)\s+(.+)/);
      if (m) return [m[2].trim(), m[1].trim()]; // [name, amount]
      return [i, '']; // no quantity found
    }) }],
    instructions: instLines,
    equipment: [], tips: '', video: '',
  };
}

export async function callMagicVision(imageUrl) {
  const settings = JSON.parse(localStorage.getItem('tts_settings') || '{}');
  const key = settings.apiKey;
  const model = settings.model || 'nvidia/llama-3.2-11b-vision';
  const proxyUrl = settings.proxyUrl || '';
  if (!key) return { error: 'No API key set. Go to Settings to add one.' };

  const prompt = 'Extract the recipe from this image. Return the recipe data in this exact format:\n\nTitle: [recipe name]\nSubtitle: \nDescription: \nPrep: \nCook: \nServings: \n\nIngredients:\n- [item with quantity]\n- [item with quantity]\n\nInstructions:\n- [step 1]\n- [step 2]';

  async function doFetch(url, opts) {
    if (proxyUrl) {
      const proxyResp = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, headers: opts.headers, body: opts.body }),
      });
      if (!proxyResp.ok) {
        const errText = await proxyResp.text();
        throw new Error('Proxy error: ' + (errText || proxyResp.status));
      }
      return proxyResp;
    }
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
        const text = data.choices[0].message.content;
        const recipe = parseRecipeResponse(text);
        if (recipe && recipe.title) return { recipe };
        return { ocr: text };
      }
      return { error: (data.error && data.error.message) || 'API error' };

    } else if (model.startsWith('openai/')) {
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
        const text = data.choices[0].message.content;
        const recipe = parseRecipeResponse(text);
        if (recipe && recipe.title) return { recipe };
        return { ocr: text };
      }
      return { error: (data.error && data.error.message) || 'Unknown error' };
    }

    return { error: 'Unsupported model: ' + model };
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS')) {
      return { error: 'Browser blocked the request (CORS). Add a Proxy URL in Settings or use OpenAI.' };
    }
    return { error: msg || 'Network error' };
  }
}

// Delete an uploaded image from Supabase Storage
export async function deleteUploadedImage(url) {
  if (!url) return;
  const match = url.match(/\/object\/public\/([^/]+)\/(.+)/);
  if (!match) return;
  try {
    await supabase.storage.from(match[1]).remove([match[2]]);
  } catch {}
}
