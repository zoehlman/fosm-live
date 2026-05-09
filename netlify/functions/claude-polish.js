// netlify/functions/claude-polish.js
//
// Takes a rough prompt + domain context, asks Claude to convert it into a
// cinematic, Veo-ready video prompt. Cheap (~$0.001 per call).

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

exports.handler = async function (event) {
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
  catch (e) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Auth gate using same password as gemini-proxy
  const expected = process.env.AI_GEN_PASSWORD;
  if (!expected || !body.password || body.password !== expected) {
    return { statusCode: 401, headers: corsHeaders, body: JSON.stringify({ error: 'Wrong password' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY_PERSONAL || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server missing Anthropic API key' }) };
  }

  const userPrompt = (body.prompt || '').trim();
  const domainContext = (body.domainContext || '').trim();
  const domainName = (body.domainName || '').trim();
  const aspect = body.aspect || '9:16';
  const duration = body.duration || 6;
  const audio = body.audio !== false;

  if (!userPrompt) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Prompt required' }) };
  }

  const systemPrompt = `You are a cinematic video director writing prompts for Google's Veo video generation model.

Your job is to take a user's rough idea + their personal vision context, and output a single Veo-ready prompt that will produce a cinematic, emotionally resonant ${duration}-second clip${audio ? ' with synchronized audio (ambient sound and natural foley, no dialogue unless requested)' : ' without audio'}.

GUIDELINES:
- Aspect ratio is ${aspect}. Frame the scene appropriately (${aspect === '9:16' ? 'vertical, intimate, person-centric' : 'landscape, environmental, cinematic'}).
- Specify camera type, lens, motion (slow push-in, tracking, handheld, locked-off, etc.)
- Specify lighting (golden hour, overcast, candlelit, neon, etc.)
- Specify mood/atmosphere
- Specify color palette if relevant
- Keep the prompt under 400 characters — Veo handles concise descriptive prompts best
- Write in cinematic present tense, declarative
- Don't reference brand names or copyrighted IP
- Don't reference specific real people by name; use descriptive terms ("a man in his 40s, weathered hands")
- This is a personal vision board — clips should feel intimate, hopeful, real
- ${audio ? 'Include 1 line about ambient sound at the end (e.g., "Ambient: distant ocean, soft wind").' : 'No audio cues.'}

OUTPUT FORMAT:
Return ONLY the polished prompt. No preamble, no explanation, no quotes. Just the prompt itself.`;

  const userMessage = domainContext
    ? `Domain: ${domainName}\nVision context: ${domainContext}\n\nMy idea for this clip: ${userPrompt}`
    : `My idea: ${userPrompt}`;

  try {
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

    if (!res.ok) {
      const msg = (data.error && data.error.message) || data.raw || `HTTP ${res.status}`;
      return { statusCode: res.status, headers: corsHeaders, body: JSON.stringify({ error: 'Claude: ' + msg }) };
    }

    const polished = data.content?.[0]?.text?.trim() || '';
    if (!polished) {
      return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Claude returned empty' }) };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        polished,
        usage: data.usage || null
      })
    };
  } catch (e) {
    console.error('[claude-polish]', e);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e.message || 'Polish failed' }) };
  }
};
