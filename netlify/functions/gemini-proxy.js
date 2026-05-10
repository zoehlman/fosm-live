// netlify/functions/gemini-proxy.js
// Compatibility shim — forwards to video-gen-proxy with provider=veo set.
// Kept so that older deployed front-end versions still work after this build lands.
exports.handler = async function (event) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '{}' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  // Inject provider=veo if missing, then forward to video-gen-proxy.
  body.provider = body.provider || 'veo';
  if (body.action === 'fetch_video') body.action = 'fetch_video'; // unchanged

  const newProxy = require('./video-gen-proxy');
  return newProxy.handler({ ...event, body: JSON.stringify(body) });
};
