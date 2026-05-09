// netlify/functions/gemini-proxy.js
//
// Server-side proxy for Google Gemini Veo video generation.
// Vision Command Center calls this function instead of Google directly so the
// API key never leaves Netlify's environment.
//
// Two actions are supported, multiplexed via the "action" field:
//   - "start": kick off a video generation, returns operation name
//   - "poll":  check status of a previously-started operation
//
// Auth: client must send AI_GEN_PASSWORD in the request body. The function
// compares it to the env var server-side. This stops casual abuse without
// rotating keys; for real security, switch to per-user OAuth.

const VEO_MODELS = {
  // model id used in the request URL → label / max duration / per-second cost in USD
  'veo-3.1-generate-preview':       { label: 'Veo 3.1 Premium', maxDuration: 8, costPerSec: 0.40 },
  'veo-3.1-fast-generate-preview':  { label: 'Veo 3.1 Fast',    maxDuration: 8, costPerSec: 0.15 },
  'veo-3.1-lite-generate-preview':  { label: 'Veo 3.1 Lite',    maxDuration: 8, costPerSec: 0.075 }
};

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

exports.handler = async function (event) {
  // CORS so the VCC page can call this from fosmlive.netlify.app
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '{}' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return errOut(corsHeaders, 400, 'Invalid JSON in request body'); }

  // ---- Auth gate ----
  const expected = process.env.AI_GEN_PASSWORD;
  if (!expected) {
    return errOut(corsHeaders, 500, 'Server misconfigured: AI_GEN_PASSWORD env var not set');
  }
  if (!body.password || body.password !== expected) {
    return errOut(corsHeaders, 401, 'Wrong password — generation refused');
  }

  // ---- API key check ----
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errOut(corsHeaders, 500, 'Server misconfigured: GEMINI_API_KEY env var not set');
  }

  // ---- Route by action ----
  const action = body.action;
  try {
    if (action === 'start') {
      return await handleStart(body, apiKey, corsHeaders);
    } else if (action === 'poll') {
      return await handlePoll(body, apiKey, corsHeaders);
    } else if (action === 'fetch_video') {
      return await handleFetchVideo(body, apiKey, corsHeaders);
    } else {
      return errOut(corsHeaders, 400, 'Unknown action. Use "start", "poll", or "fetch_video".');
    }
  } catch (e) {
    console.error('[gemini-proxy] error:', e);
    return errOut(corsHeaders, 500, e.message || 'Internal error');
  }
};

function errOut(headers, code, msg) {
  return { statusCode: code, headers, body: JSON.stringify({ error: msg }) };
}

// =============== START ===============
// Body: { action: 'start', password, prompt, model, duration, aspect, audio }
// Returns: { operationName, model, duration, estimatedCost }
async function handleStart(body, apiKey, headers) {
  const prompt = (body.prompt || '').trim();
  if (!prompt) return errOut(headers, 400, 'Prompt is required');
  if (prompt.length > 2000) return errOut(headers, 400, 'Prompt too long (max 2000 chars)');

  const model = body.model || 'veo-3.1-lite-generate-preview';
  if (!VEO_MODELS[model]) return errOut(headers, 400, 'Unknown model: ' + model);

  const duration = Math.max(4, Math.min(8, parseInt(body.duration) || 6));
  const aspect = (body.aspect === '9:16') ? '9:16' : '16:9';
  const generateAudio = body.audio !== false; // default true
  const negativePrompt = (body.negativePrompt || '').trim();

  // Veo API: POST to models/{MODEL}:predictLongRunning
  // The instances array contains the prompt; parameters object has config.
  const url = `${GEMINI_BASE}/models/${model}:predictLongRunning`;
  const payload = {
    instances: [{ prompt }],
    parameters: {
      aspectRatio: aspect,
      durationSeconds: duration,
      generateAudio,
      personGeneration: 'allow_adult',
      sampleCount: 1
    }
  };
  if (negativePrompt) payload.parameters.negativePrompt = negativePrompt;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

  if (!res.ok) {
    // Surface Google's error message clearly
    const msg = (data.error && data.error.message) || data.raw || `HTTP ${res.status}`;
    return errOut(headers, res.status, 'Veo: ' + msg);
  }

  // Successful response includes operation name like "models/veo-3.1.../operations/abc123"
  const operationName = data.name;
  if (!operationName) {
    return errOut(headers, 500, 'Veo: no operation name returned');
  }

  const costEstimate = duration * VEO_MODELS[model].costPerSec;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      operationName,
      model,
      modelLabel: VEO_MODELS[model].label,
      duration,
      aspect,
      audio: generateAudio,
      estimatedCost: Number(costEstimate.toFixed(4)),
      message: 'Generation started. Poll for completion.'
    })
  };
}

// =============== POLL ===============
// Body: { action: 'poll', password, operationName }
// Returns: { done, status, videoUri?, error? }
async function handlePoll(body, apiKey, headers) {
  const operationName = body.operationName;
  if (!operationName) return errOut(headers, 400, 'operationName required');

  const url = `${GEMINI_BASE}/${operationName}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'x-goog-api-key': apiKey }
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

  if (!res.ok) {
    const msg = (data.error && data.error.message) || data.raw || `HTTP ${res.status}`;
    return errOut(headers, res.status, 'Veo poll: ' + msg);
  }

  // While in progress, response has { name, done: false, metadata: {...} }
  // When complete, response has { name, done: true, response: { generateVideoResponse: { generatedSamples: [...] } } }
  const done = !!data.done;
  if (!done) {
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ done: false, status: 'generating', metadata: data.metadata || null })
    };
  }

  // Done — extract the video URI
  if (data.error) {
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ done: true, status: 'error', error: data.error.message || 'Generation failed' })
    };
  }

  const samples = data.response?.generateVideoResponse?.generatedSamples
                || data.response?.generatedSamples
                || data.response?.videos
                || [];
  const first = samples[0];
  // Different shapes across API versions; check several possible paths
  const videoUri = first?.video?.uri
                || first?.uri
                || first?.video?.fileUri
                || data.response?.video?.uri
                || null;

  if (!videoUri) {
    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        done: true, status: 'error',
        error: 'Generation completed but no video URI in response',
        debug: data.response
      })
    };
  }

  return {
    statusCode: 200, headers,
    body: JSON.stringify({ done: true, status: 'completed', videoUri })
  };
}

// =============== FETCH VIDEO ===============
// Veo returns a URI like https://generativelanguage.googleapis.com/v1beta/files/abc123:download?alt=media
// which requires the API key to download. We proxy that download so the client doesn't see the key.
// Body: { action: 'fetch_video', password, videoUri }
// Returns: base64-encoded video data with content-type
async function handleFetchVideo(body, apiKey, headers) {
  const videoUri = body.videoUri;
  if (!videoUri) return errOut(headers, 400, 'videoUri required');

  // Add API key as query param if not already, or use header. Veo file download needs auth.
  const url = videoUri;
  const res = await fetch(url, {
    headers: { 'x-goog-api-key': apiKey }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return errOut(headers, res.status, 'Video fetch failed: ' + text.slice(0, 200));
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'video/mp4';

  // Return base64 — Netlify functions support binary via this flag
  return {
    statusCode: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentType,
      base64: buf.toString('base64'),
      sizeBytes: buf.length
    })
  };
}
