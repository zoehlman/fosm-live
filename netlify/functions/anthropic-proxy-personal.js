// ─────────────────────────────────────────────────────────────────
// /api/anthropic-proxy-personal · Anthropic proxy for FOSM·LIVE Personal
// ─────────────────────────────────────────────────────────────────
// Used by:
//   - FOSM·LIVE Personal (Ask Zach chat with 7 specialist voices)
//
// Why a separate function from /api/ai-proxy:
//   This app uses its own env var (ANTHROPIC_API_KEY_PERSONAL) so usage
//   on the personal app can be tracked, throttled, or rotated independently
//   of the business-side CCs (Marketing CC, Sales CC, FOSM·LIVE CC). You
//   can use the same actual key value if you want — what matters is each
//   app has its own named env var.
//
// Env vars required:
//   ANTHROPIC_API_KEY_PERSONAL  → Set in Netlify → Site settings → Environment variables
// ─────────────────────────────────────────────────────────────────

export default async (req) => {
  // CORS preflight (rare — front-end is same-origin, but being explicit)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: { type: "method_not_allowed", message: "POST only" },
      }),
      {
        status: 405,
        headers: {
          "content-type": "application/json",
          "allow": "POST",
        },
      },
    );
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY_PERSONAL");
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: {
          type: "config_error",
          message:
            "ANTHROPIC_API_KEY_PERSONAL is not set in Netlify environment variables. " +
            "Set it in Site configuration → Environment variables, then redeploy.",
        },
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  // Parse the body (the front-end always sends JSON)
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: { type: "bad_request", message: "Invalid JSON in request body" },
      }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  if (!body || typeof body !== "object") {
    return new Response(
      JSON.stringify({
        error: { type: "bad_request", message: "Empty or non-object request body" },
      }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  // Forward to Anthropic
  let upstream;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[anthropic-proxy-personal] Forward error:", err);
    return new Response(
      JSON.stringify({
        error: {
          type: "upstream_error",
          message:
            (err && err.message) ? err.message : "Failed to reach Anthropic API",
        },
      }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }

  // Pass through response (status, body, content type)
  const responseText = await upstream.text();
  return new Response(responseText, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
};

// Pin the URL path exactly to what the front-end calls.
// (The index.html has /api/anthropic-proxy-personal hardcoded as the endpoint.)
export const config = { path: "/api/anthropic-proxy-personal" };
