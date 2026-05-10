// netlify/functions/video-gen-proxy.js
//
// Provider-agnostic video generation proxy. Vision Command Center calls this
// instead of any specific provider. Add a new provider by adding a handler
// function below and registering it in PROVIDERS.
//
// Currently active: Veo (Google Gemini).
// Stubs: Higgsfield, Runway, Sora — return "not enabled" until env var is set.
//
// Request body (all actions): { provider, action, password, ...providerArgs }
// Supported actions: 'start', 'poll', 'fetch_video', 'list_providers'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// =================== PROVIDER REGISTRY ===================
const PROVIDERS = {
  veo: {
    id: 'veo',
    label: 'Google Veo',
    envKey: 'GEMINI_API_KEY',
    description: 'Strong at lighting, motion, atmosphere. Veo 3 has native audio.',
    models: {
      'veo-3.1-lite-generate-preview':  { label: 'Veo 3.1 Lite',    costPerSec: 0.075, maxDuration: 8, aspectRatios: ['9:16', '16:9'] },
      'veo-3.1-fast-generate-preview':  { label: 'Veo 3.1 Fast',    costPerSec: 0.15,  maxDuration: 8, aspectRatios: ['9:16', '16:9'] },
      'veo-3.1-generate-preview':       { label: 'Veo 3.1 Premium', costPerSec: 0.40,  maxDuration: 8, aspectRatios: ['9:16', '16:9'] }
    }
  },
  higgsfield: {
    id: 'higgsfield',
    label: 'Higgsfield',
    envKey: 'HIGGSFIELD_API_KEY',
    description: 'Best for identity-locked clips of you and Sumary. Soul ID character consistency.',
    locked: true,
    lockedReason: 'Higgsfield not yet enabled. Sign up at higgsfield.ai/pricing (Plus or Studio plan), add HIGGSFIELD_API_KEY to your Netlify env vars, then refresh.',
    models: {
      'soul-id':       { label: 'Soul ID (identity-locked)', costPerSec: 0.10, maxDuration: 16, aspectRatios: ['9:16', '16:9', '1:1'] },
      'kling-3':       { label: 'Kling 3.0 (motion-first)',  costPerSec: 0.10, maxDuration: 10, aspectRatios: ['9:16', '16:9'] }
    }
  },
  sora: {
    id: 'sora',
    label: 'OpenAI Sora 2',
    envKey: 'OPENAI_API_KEY',
    description: 'Cinematic story beats. Strong for narrative composition.',
    locked: true,
    lockedReason: 'Sora not yet enabled. Add OPENAI_API_KEY to Netlify env to activate.',
    models: {
      'sora-2': { label: 'Sora 2', costPerSec: 0.30, maxDuration: 10, aspectRatios: ['9:16', '16:9', '1:1'] }
    }
  },
  runway: {
    id: 'runway',
    label: 'Runway Gen-4',
    envKey: 'RUNWAY_API_KEY',
    description: 'Stylized and artistic. Strong for non-human B-roll.',
    locked: true,
    lockedReason: 'Runway not yet enabled. Add RUNWAY_API_KEY to Netlify env to activate.',
    models: {
      'gen-4': { label: 'Gen-4', costPerSec: 0.20, maxDuration: 10, aspectRatios: ['9:16', '16:9'] }
    }
  }
};

const HANDLERS = {
  veo: { start: veoStart, poll: veoPoll, fetch_video: veoFetch }
  // Other providers wired in their respective sections when keys arrive
};

// =================== ENTRY ===================
exports.handler = async function (event) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '{}' };
  if (event.httpMethod !== 'POST') return errOut(corsHeaders, 405, 'Method not allowed');

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return errOut(corsHeaders, 400, 'Invalid JSON'); }

  // list_providers is the one action that doesn't need auth — used to populate
  // the picker. Reveals only labels and locked status, no secrets.
  if (body.action === 'list_providers') {
    return {
      statusCode: 200, headers: corsHeaders,
      body: JSON.stringify({
        providers: Object.values(PROVIDERS).map(p => ({
          id: p.id, label: p.label, description: p.description,
          enabled: providerEnabled(p),
          locked: !providerEnabled(p),
          lockedReason: providerEnabled(p) ? null : p.lockedReason,
          models: Object.entries(p.models).map(([id, m]) => ({ id, ...m }))
        }))
      })
    };
  }

  // ---- Auth gate for everything else ----
  const expectedPassword = process.env.AI_GEN_PASSWORD;
  if (!expectedPassword) return errOut(corsHeaders, 500, 'Server misconfigured: AI_GEN_PASSWORD env var not set');
  if (!body.password || body.password !== expectedPassword) return errOut(corsHeaders, 401, 'Wrong password — generation refused');

  // ---- Provider routing ----
  const providerId = body.provider || 'veo';
  const provider = PROVIDERS[providerId];
  if (!provider) return errOut(corsHeaders, 400, 'Unknown provider: ' + providerId);
  if (!providerEnabled(provider)) return errOut(corsHeaders, 400, provider.lockedReason || 'Provider not enabled');

  const apiKey = process.env[provider.envKey];
  const handlerSet = HANDLERS[providerId];
  if (!handlerSet) return errOut(corsHeaders, 500, 'Provider has no handlers registered');

  try {
    const handler = handlerSet[body.action];
    if (!handler) return errOut(corsHeaders, 400, 'Unknown action: ' + body.action);
    return await handler(body, apiKey, corsHeaders, provider);
  } catch (e) {
    console.error('[video-gen-proxy] error:', e);
    return errOut(corsHeaders, 500, e.message || 'Internal error');
  }
};

function providerEnabled(p) {
  return !!process.env[p.envKey] && !p.locked;
}
function errOut(headers, code, msg) {
  return { statusCode: code, headers, body: JSON.stringify({ error: msg }) };
}

// =================== VEO HANDLERS ===================
async function veoStart(body, apiKey, headers, provider) {
  const prompt = (body.prompt || '').trim();
  if (!prompt) return errOut(headers, 400, 'Prompt is required');
  if (prompt.length > 2000) return errOut(headers, 400, 'Prompt too long (max 2000 chars)');

  const model = body.model || 'veo-3.1-lite-generate-preview';
  if (!provider.models[model]) return errOut(headers, 400, 'Unknown Veo model: ' + model);

  const duration = Math.max(4, Math.min(8, parseInt(body.duration) || 6));
  const aspect = (body.aspect === '9:16') ? '9:16' : '16:9';
  const audioRequested = body.audio !== false; // informational — Veo 3 has audio built in
  const negativePrompt = (body.negativePrompt || '').trim();

  const url = `${GEMINI_BASE}/models/${model}:predictLongRunning`;
  const payload = {
    instances: [{ prompt }],
    parameters: {
      aspectRatio: aspect,
      durationSeconds: duration,
      personGeneration: 'allow_adult',
      sampleCount: 1
    }
  };
  if (negativePrompt) payload.parameters.negativePrompt = negativePrompt;

  // Reference image for image-to-video (the v4.3 People system feeds these in).
  // Veo accepts a single seed image; if multiple are sent we use the first.
  if (body.referenceImages && body.referenceImages.length > 0) {
    const ref = body.referenceImages[0];
    const base64Data = ref.dataUrl ? ref.dataUrl.split(',')[1] : ref.base64;
    const mimeType = ref.dataUrl ? (ref.dataUrl.match(/^data:([^;]+);/) || [, 'image/jpeg'])[1] : (ref.mimeType || 'image/jpeg');
    if (base64Data) {
      payload.instances[0].image = { bytesBase64Encoded: base64Data, mimeType };
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }
  if (!res.ok) {
    const msg = (data.error && data.error.message) || data.raw || `HTTP ${res.status}`;
    return errOut(headers, res.status, 'Veo: ' + msg);
  }
  const operationName = data.name;
  if (!operationName) return errOut(headers, 500, 'Veo: no operation name returned');

  const costEstimate = duration * provider.models[model].costPerSec;
  return {
    statusCode: 200, headers,
    body: JSON.stringify({
      operationName,
      provider: 'veo',
      model,
      modelLabel: provider.models[model].label,
      duration, aspect, audio: audioRequested,
      estimatedCost: Number(costEstimate.toFixed(4))
    })
  };
}

async function veoPoll(body, apiKey, headers) {
  const operationName = body.operationName;
  if (!operationName) return errOut(headers, 400, 'operationName required');
  const url = `${GEMINI_BASE}/${operationName}`;
  const res = await fetch(url, { headers: { 'x-goog-api-key': apiKey } });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }
  if (!res.ok) {
    const msg = (data.error && data.error.message) || data.raw || `HTTP ${res.status}`;
    return errOut(headers, res.status, 'Veo poll: ' + msg);
  }
  const done = !!data.done;
  if (!done) return { statusCode: 200, headers, body: JSON.stringify({ done: false, status: 'generating' }) };
  if (data.error) return { statusCode: 200, headers, body: JSON.stringify({ done: true, status: 'error', error: data.error.message || 'Generation failed' }) };

  const samples = data.response?.generateVideoResponse?.generatedSamples
                || data.response?.generatedSamples
                || data.response?.videos
                || [];
  const first = samples[0];
  const videoUri = first?.video?.uri || first?.uri || first?.video?.fileUri || data.response?.video?.uri || null;
  if (!videoUri) return { statusCode: 200, headers, body: JSON.stringify({ done: true, status: 'error', error: 'No video URI in completion' }) };
  return { statusCode: 200, headers, body: JSON.stringify({ done: true, status: 'completed', videoUri }) };
}

async function veoFetch(body, apiKey, headers) {
  const videoUri = body.videoUri;
  if (!videoUri) return errOut(headers, 400, 'videoUri required');
  const res = await fetch(videoUri, { headers: { 'x-goog-api-key': apiKey } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return errOut(headers, res.status, 'Video fetch failed: ' + text.slice(0, 200));
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'video/mp4';
  return {
    statusCode: 200, headers,
    body: JSON.stringify({ contentType, base64: buf.toString('base64'), sizeBytes: buf.length })
  };
}

// =================== HIGGSFIELD HANDLERS (stub for v4.4) ===================
// async function higgsfieldStart(body, apiKey, headers, provider) { ... }
// async function higgsfieldPoll(body, apiKey, headers) { ... }
// async function higgsfieldFetch(body, apiKey, headers) { ... }
