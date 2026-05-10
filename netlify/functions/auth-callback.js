// netlify/functions/auth-callback.js
// FOSM·LIVE Brain · OAuth callback handler
// Spec: docs/brain-spec.md v1.1 §7 (Auth Model) + §11 Phase 2C
// ─────────────────────────────────────────────────────────────────
// Receives Google's redirect after operator sign-in:
//   GET /auth/callback?code=<auth_code>&state=<return_url>
//
// Flow (per Brain Spec v1.1 §7):
//   1. Exchange authorization code for tokens at Google's token endpoint
//   2. Verify the ID token (RS256 signature against Google's JWKS, claims)
//   3. Confirm `hd` claim is learnandgrowrich.net (Workspace domain)
//   4. Confirm email is in BRAIN_OPERATOR_ALLOWLIST (defense-in-depth)
//   5. Sign a session JWT (HMAC-SHA256, 8h TTL) with BRAIN_SESSION_SECRET
//   6. Set HttpOnly + Secure + SameSite=Lax cookie
//   7. 302 redirect back to URL passed in `state`
//
// Required env vars (configured Stage 2B):
//   BRAIN_GOOGLE_OAUTH_CLIENT_ID
//   BRAIN_GOOGLE_OAUTH_CLIENT_SECRET
//   BRAIN_OPERATOR_ALLOWLIST       (comma-separated emails)
//   BRAIN_SESSION_SECRET           (64-char hex string)
//
// Zero external dependencies — uses only Node 18+ built-ins.
// Matches codebase pattern set by gemini-proxy.js et al.
// ─────────────────────────────────────────────────────────────────

const crypto = require('crypto');

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const REDIRECT_URI = 'https://fosmlive.netlify.app/auth/callback';
const WORKSPACE_DOMAIN = 'learnandgrowrich.net';
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

// In-memory JWKS cache (Lambda warm-container reuse).
let jwksCache = null;
let jwksCacheExpiry = 0;

exports.handler = async function (event) {
  // Google redirects via GET with query params — no other methods accepted.
  if (event.httpMethod !== 'GET') {
    return errResponse(405, 'Method not allowed');
  }

  // Sanity-check env vars are present before we even start.
  const missing = [
    'BRAIN_GOOGLE_OAUTH_CLIENT_ID',
    'BRAIN_GOOGLE_OAUTH_CLIENT_SECRET',
    'BRAIN_OPERATOR_ALLOWLIST',
    'BRAIN_SESSION_SECRET'
  ].filter(k => !process.env[k]);
  if (missing.length) {
    console.error('[auth-callback] missing env vars:', missing);
    return errResponse(500, 'Server misconfigured');
  }

  const params = event.queryStringParameters || {};
  const { code, state, error: oauthError } = params;

  if (oauthError) {
    return errResponse(400, `OAuth error: ${oauthError}`);
  }
  if (!code) {
    return errResponse(400, 'Missing code parameter');
  }

  // ─── Step 1: Exchange code for tokens ──────────────────────
  let tokenJson;
  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.BRAIN_GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.BRAIN_GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }).toString()
    });
    tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('[auth-callback] token exchange failed:', tokenJson);
      return errResponse(401, 'Token exchange failed');
    }
  } catch (e) {
    console.error('[auth-callback] token endpoint error:', e);
    return errResponse(500, 'Token endpoint error');
  }

  const idToken = tokenJson.id_token;
  if (!idToken) {
    return errResponse(401, 'No ID token in response');
  }

  // ─── Step 2: Verify ID token (signature + standard claims) ─
  let claims;
  try {
    claims = await verifyGoogleIdToken(idToken);
  } catch (e) {
    console.error('[auth-callback] ID token verification failed:', e.message);
    return errResponse(401, 'Invalid ID token');
  }

  // ─── Step 3: Workspace domain check (hd claim) ─────────────
  // The OAuth client's Internal audience already enforces this at the
  // platform level; we double-check here as defense-in-depth.
  if (claims.hd !== WORKSPACE_DOMAIN) {
    console.warn('[auth-callback] rejected non-workspace email:', claims.email);
    return errResponse(403, 'Not authorized: workspace domain mismatch');
  }

  // ─── Step 4: Allowlist check ───────────────────────────────
  const allowlist = (process.env.BRAIN_OPERATOR_ALLOWLIST || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  if (!allowlist.includes((claims.email || '').toLowerCase())) {
    console.warn('[auth-callback] rejected non-allowlisted email:', claims.email);
    return errResponse(403, 'Not authorized: not on operator allowlist');
  }

  // ─── Step 5: Sign session JWT ──────────────────────────────
  const now = Math.floor(Date.now() / 1000);
  const sessionPayload = {
    sub: claims.sub,           // Google's stable user ID
    email: claims.email,
    name: claims.name || '',
    iat: now,
    exp: now + SESSION_TTL_SECONDS
  };
  const sessionJwt = signHs256Jwt(sessionPayload, process.env.BRAIN_SESSION_SECRET);

  // ─── Steps 6 + 7: Set cookie + redirect ────────────────────
  // Cookie attrs:
  //   HttpOnly      — not readable from JS (XSS protection)
  //   Secure        — HTTPS only
  //   SameSite=Lax  — blocks cross-site POST CSRF, allows top-level GET nav
  //   Path=/        — cookie sent on all paths under fosmlive.netlify.app
  const cookieValue = [
    `brain_session=${sessionJwt}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`
  ].join('; ');

  const safeReturn = sanitizeReturnUrl(state);

  return {
    statusCode: 302,
    headers: {
      'Set-Cookie': cookieValue,
      'Location': safeReturn,
      'Cache-Control': 'no-store'
    },
    body: ''
  };
};

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function errResponse(statusCode, message) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ error: message })
  };
}

// Validate `state` is a relative path or an https URL on our own host.
// Prevents open-redirect: an attacker can't pass ?state=https://evil.com
// and trick us into bouncing the operator there post-login.
function sanitizeReturnUrl(state) {
  if (typeof state !== 'string' || !state) return '/';
  // Relative path (must start with single '/' and not '//')
  if (state.startsWith('/') && !state.startsWith('//')) return state;
  // Absolute URL on our own host
  try {
    const u = new URL(state);
    if (u.host === 'fosmlive.netlify.app' && u.protocol === 'https:') {
      return u.toString();
    }
  } catch (_) { /* not a valid URL */ }
  return '/';
}

// HMAC-SHA256 JWT signing (HS256).
function signHs256Jwt(payload, secretHex) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encHeader = b64urlStr(JSON.stringify(header));
  const encPayload = b64urlStr(JSON.stringify(payload));
  const signingInput = `${encHeader}.${encPayload}`;
  const signature = crypto
    .createHmac('sha256', Buffer.from(secretHex, 'hex'))
    .update(signingInput)
    .digest();
  return `${signingInput}.${b64urlBuf(signature)}`;
}

function b64urlStr(str) {
  return Buffer.from(str, 'utf8').toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function b64urlBuf(buf) {
  return buf.toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function b64urlDecode(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64');
}

// Fetch Google's JWKS (public keys for ID token verification), cached 1h.
async function getGoogleJwks() {
  const now = Date.now();
  if (jwksCache && now < jwksCacheExpiry) return jwksCache;
  const res = await fetch(GOOGLE_JWKS_URL);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  jwksCache = await res.json();
  jwksCacheExpiry = now + 60 * 60 * 1000;
  return jwksCache;
}

// Verify Google ID token: RS256 signature, iss, aud, exp, email_verified.
async function verifyGoogleIdToken(idToken) {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('malformed JWT');
  const [encHeader, encPayload, encSignature] = parts;

  const header = JSON.parse(b64urlDecode(encHeader).toString('utf8'));
  const payload = JSON.parse(b64urlDecode(encPayload).toString('utf8'));

  if (header.alg !== 'RS256') throw new Error(`unexpected alg: ${header.alg}`);

  const jwks = await getGoogleJwks();
  const key = jwks.keys.find(k => k.kid === header.kid);
  if (!key) throw new Error(`no matching kid in JWKS: ${header.kid}`);

  // Convert JWK → public key and verify RSA-SHA256 signature.
  const pubKey = crypto.createPublicKey({ key, format: 'jwk' });
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${encHeader}.${encPayload}`);
  const sigBuf = b64urlDecode(encSignature);
  if (!verifier.verify(pubKey, sigBuf)) {
    throw new Error('signature verification failed');
  }

  // Standard claim checks.
  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
    throw new Error(`bad iss: ${payload.iss}`);
  }
  if (payload.aud !== process.env.BRAIN_GOOGLE_OAUTH_CLIENT_ID) {
    throw new Error(`bad aud: ${payload.aud}`);
  }
  if (typeof payload.exp !== 'number' || payload.exp < now) {
    throw new Error('token expired');
  }
  if (typeof payload.iat !== 'number' || payload.iat > now + 60) {
    throw new Error('token iat in future');
  }
  if (!payload.email_verified) {
    throw new Error('email not verified');
  }
  return payload;
}
