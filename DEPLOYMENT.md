# DEPLOYMENT.md · FOSM·LIVE on Netlify

How the FOSM·LIVE ecosystem ships to production. One Netlify site, one custom domain, four command centers, three serverless functions.

---

## TL;DR

```bash
# 1. Push these new files to the repo (see "Files in this commit" below)
git add netlify.toml netlify/ index.html DEPLOYMENT.md
git commit -m "Add Netlify config + AI proxy functions + landing page"
git push origin main

# 2. Connect the repo to a NEW Netlify site (one time):
#    Netlify dashboard → Add new site → Import from GitHub → zoehlman/fosm-live
#    Build command: (leave blank)  Publish directory: .

# 3. Set environment variables (Site settings → Environment variables):
#    ANTHROPIC_API_KEY  = sk-ant-...           (required for Marketing + FOSM·LIVE CCs)
#    REPLICATE_API_TOKEN = r8_...              (optional — only if you want image-gen)

# 4. Trigger a deploy. Done. The site has all four CCs live behind /system-map/, /marketing-cc/, /sales-cc/, /fosm-live-cc/.
```

---

## Why one Netlify site (not four)

The Sales CC's own site map says it: *"deploy Marketing CC and Sales CC under the same domain at different paths."* Reason: the cross-CC handoff reads `fosm_cc_pipeline_v1` from `localStorage`, and `localStorage` is **same-origin only**. Splitting CCs across subdomains breaks the bridge.

Layout on the deployed site:
```
https://your-site.netlify.app/
├── /                  → landing page (root index.html)
├── /system-map/       → master architectural wireframe
├── /marketing-cc/     → Marketing Command Center
├── /sales-cc/         → Sales Command Center
├── /fosm-live-cc/     → deployable FOSM·LIVE command center
├── /api/ai-proxy      → Anthropic streaming proxy
├── /api/image-gen     → Replicate Flux create
└── /api/image-status  → Replicate Flux poll
```

---

## Files in this commit

| File | Purpose |
|---|---|
| `netlify.toml` | Build/publish config + redirects + headers |
| `netlify/functions/ai-proxy.js` | Anthropic streaming proxy (used by Marketing + FOSM·LIVE CCs) |
| `netlify/functions/image-gen.js` | Replicate image generation (used by Marketing CC) |
| `netlify/functions/image-status.js` | Replicate prediction polling (used by Marketing CC) |
| `index.html` | Root landing page linking to all four CCs |
| `DEPLOYMENT.md` | This file |

No `package.json` is required — Netlify Functions v2 (the `export default` syntax) ships with `fetch` built in.

---

## Step-by-step deploy

### 1. Commit and push

```bash
cd path/to/fosm-live
# Drop the files from this commit into the repo at the paths listed above.
git status                        # confirm only the new files are staged
git add netlify.toml netlify/ index.html DEPLOYMENT.md
git commit -m "Add Netlify config + AI proxy functions"
git push origin main
```

### 2. Create the Netlify site (one time)

1. Go to <https://app.netlify.com> → **Add new site** → **Import an existing project**
2. Connect to GitHub → pick `zoehlman/fosm-live` → branch `main`
3. Build settings: leave **Build command** blank, set **Publish directory** to `.` (or just leave the default — `netlify.toml` overrides anyway)
4. Click **Deploy site**

Netlify will auto-detect `netlify.toml` and pick up the functions.

### 3. Set environment variables

In the new site's dashboard:

1. **Site configuration** → **Environment variables** → **Add a variable**
2. Add these:

   | Key | Value | Required by |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` from <https://console.anthropic.com> | Marketing CC, FOSM·LIVE CC |
   | `REPLICATE_API_TOKEN` | `r8_...` from <https://replicate.com/account/api-tokens> | Marketing CC Image Studio (optional) |
   | `ANTHROPIC_VERSION` | `2023-06-01` (default) | Optional — only set if Anthropic announces a new version |
   | `REPLICATE_MODEL` | `black-forest-labs/flux-schnell` (default) | Optional — to swap models |

3. **Trigger deploy** → **Deploy site** so the env vars take effect.

### 4. Test each endpoint

Once deployed (replace `your-site.netlify.app` with your actual URL):

```bash
# Landing page → should render the four-CC grid
curl -I https://your-site.netlify.app/

# Each CC → should return 200 with a hefty HTML body
curl -I https://your-site.netlify.app/system-map/
curl -I https://your-site.netlify.app/marketing-cc/
curl -I https://your-site.netlify.app/sales-cc/
curl -I https://your-site.netlify.app/fosm-live-cc/

# AI proxy smoke test → should return a streaming SSE response
curl -N -X POST https://your-site.netlify.app/api/ai-proxy \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-6","max_tokens":50,"stream":true,"messages":[{"role":"user","content":"Reply with just the word: ready"}]}'
```

If the AI proxy returns an error JSON instead of SSE, the response body has a `fix` field with the next step.

### 5. Custom domain (optional)

Netlify dashboard → **Domain management** → **Add custom domain**. Point your DNS at Netlify (CNAME or A record per their instructions). The standard pattern: `command.learnandgrowrich.com` or similar.

---

## What about the existing `fosmlivesitemap.netlify.app` deployment?

That was a separate Netlify site deployed from the `system-map/` folder only. After you deploy the consolidated site, two options:

**Option A · Keep both** (zero risk · no migration). The old site stays live; the new site's `/system-map/` becomes the canonical version going forward. Update any links you control to point at the new URL.

**Option B · Migrate** (cleaner long-term). In the old `fosmlivesitemap.netlify.app` Netlify site → Domain management → Remove the existing custom domain (if any). Then in the new consolidated site → Domain management → Add `fosmlivesitemap.netlify.app` (or the custom domain) so traffic to the old URL lands on the new site at the right path.

Either is fine. Option A is what most teams do until the new site is proven.

---

## Local development

Install the Netlify CLI:

```bash
npm install -g netlify-cli
```

Run the site locally with functions enabled:

```bash
cd path/to/fosm-live
netlify dev
# → opens http://localhost:8888 with /api/ai-proxy reachable
```

Set env vars locally by creating a `.env` in the repo root (it's already gitignored):

```bash
ANTHROPIC_API_KEY=sk-ant-...
REPLICATE_API_TOKEN=r8_...
```

`netlify dev` reads `.env` automatically.

---

## Troubleshooting

### `/api/ai-proxy` returns 500 with `"error": "Not configured"`

`ANTHROPIC_API_KEY` isn't set on the site. Check **Site configuration → Environment variables**. After adding, redeploy (Site overview → Trigger deploy → Deploy site).

### `/api/ai-proxy` returns 401

The API key is set but invalid or expired. Generate a new one at <https://console.anthropic.com> → Settings → API Keys, update the env var, redeploy.

### `/api/ai-proxy` returns 429

You're rate-limited by Anthropic. Wait a moment. If it persists, check usage limits at console.anthropic.com.

### Streaming response just hangs

Check the browser network tab — if the response says `text/event-stream` and bytes are arriving, streaming is working but the front-end might not be parsing the SSE format. Open the Marketing CC, hit a feature like the Mastermind, watch the console for `content_block_delta` messages.

### Functions don't deploy / `netlify.toml` ignored

Confirm the folder structure:
```
fosm-live/
├── netlify.toml            ← MUST be at repo root
└── netlify/
    └── functions/
        ├── ai-proxy.js
        ├── image-gen.js
        └── image-status.js
```
The `[functions]` block in `netlify.toml` references this exact path. If you nested `netlify.toml` inside a subfolder, Netlify won't find it — it only reads from the publish-dir root.

### `claude-sonnet-4-6` model not found

The front-end may pin a model name. Check `marketing-cc/index.html` for the model string and confirm it matches what's available on your Anthropic account. Newer or unreleased model names will return 400.

### CCs load but localStorage doesn't carry over between them

That's same-origin policy working as intended within ONE Netlify site — but it'll fail if two CCs are on different subdomains. Confirm the deployed URL serves all CCs from the same hostname (i.e. all paths under `https://your-site.netlify.app/`, not split across `marketing.netlify.app` and `sales.netlify.app`).

---

## Phase 4 outlook · what changes when the real backend lands

The `/api/*` functions stay roughly as-is — the proxy pattern is good for any LLM provider. What gets added on top:

- A Postgres/Supabase backend behind `/api/db/*` that mirrors the localStorage entities (ICP_LIBRARY, OFFER_LIBRARY, BRAND_CENTER, CB_PIPELINE, etc.)
- Multi-tenant auth in front of the CC entry pages
- Drive Picker (proper) for the Sales CC `driveFolderUrl` field instead of paste-URL
- Hyros-style attribution numbers wiring into the Marketing CC's Attribution Engine

The export/import bundle in System Map → Backup is already version-tagged (v1) and maps cleanly to the future schema. Nothing in this Netlify deploy locks any of that in — it's a paving stone, not a wall.

---

*Last updated: 2026-05-08 · Re-fetch after Phase 4.*
