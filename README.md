# fosm-live

**The Plan To Heal The World — FOSM·LIVE command center ecosystem.**

God's Economy as an operating system. Two LIVE dashboards (business + personal),
eight expansion command centers, six brand doorways — all serving the mission of
peace + prosperity for all.

🌐 **Live at: [fosmlive.netlify.app](https://fosmlive.netlify.app)**

---

## What's in this repo

All command centers live at `https://fosmlive.netlify.app/<folder>/`. Same origin
is non-negotiable — the cross-CC localStorage bridge depends on it.

| Folder | What it is | Status | Live at |
|---|---|---|---|
| `system-map/` | Master architectural reference — V1–V8 ecosystem wireframe | ✅ live | [/system-map/](https://fosmlive.netlify.app/system-map/) |
| `fosm-live-cc/` | FOSM·LIVE CC — business dashboard with 8 AI specialists | ✅ live | [/fosm-live-cc/](https://fosmlive.netlify.app/fosm-live-cc/) |
| `fosm-live-personal/` | FOSM·LIVE Personal — personal-finance dashboard, Ask Zach, Sheets OAuth (gifted) | ✅ live | [/fosm-live-personal/](https://fosmlive.netlify.app/fosm-live-personal/) |
| `marketing-cc/` | Marketing CC — campaign factory + attribution engine | ✅ live | [/marketing-cc/](https://fosmlive.netlify.app/marketing-cc/) |
| `sales-cc/` | Sales CC — pipeline + audit intake + 6 funnels | ✅ live | [/sales-cc/](https://fosmlive.netlify.app/sales-cc/) |
| `vision-cc/` | Vision CC — 12-Domain life vision system (gifted) | ✅ live | [/vision-cc/](https://fosmlive.netlify.app/vision-cc/) |
| `netlify/functions/` | Serverless functions: AI proxies + image gen | ✅ live | `/api/*` |
| `docs/` | Architecture references, voice guides, planning docs | ongoing | — |

Future CCs (planned, in build order):

| Folder | What it is | Status |
|---|---|---|
| `operations-cc/` | Operations CC — anchored on ClickUp; SOPs, RACI, weekly L10 | ⏳ planned |
| `leadership-cc/` | Leadership CC — team alignment, decision logs | ⏳ planned |
| `integrity-cc/` | Integrity CC — promise vs delivery, values audit | ⏳ planned |
| `emotional-intelligence-cc/` | Emotional Intelligence CC — self-state journal, trigger maps | ⏳ planned |

---

## How to read the code

Every command center is a single self-contained `index.html` with embedded CSS
and JS. No build step, no npm install, no dependencies. Open the file in a
browser and it works.

To preview locally:
```bash
cd marketing-cc            # or any other CC folder
python3 -m http.server 8000
# then open http://localhost:8000
```

For full local dev with the API proxies working, install the Netlify CLI:
```bash
npm install -g netlify-cli
cd path/to/fosm-live
netlify dev
# → opens http://localhost:8888 with /api/ai-proxy reachable
```

---

## How to update the code (with Claude)

**Best path — Claude Code.** Install once: `npm install -g @anthropic-ai/claude-code`.
Then `cd` into the repo and run `claude`. Claude can edit files and commit directly.

**Other paths:**
- Cursor / VSCode + Copilot — paste Claude's generated code, save, commit
- GitHub web editor — open the file on github.com, pencil icon, paste, commit

**For Claude in chat (claude.ai)**, paste the raw URL of the file you want
updated. The pattern is:

```
https://raw.githubusercontent.com/zoehlman/fosm-live/main/<folder>/<file>
```

Examples:
- System map: `https://raw.githubusercontent.com/zoehlman/fosm-live/main/system-map/index.html`
- Marketing CC: `https://raw.githubusercontent.com/zoehlman/fosm-live/main/marketing-cc/index.html`
- Architecture doc: `https://raw.githubusercontent.com/zoehlman/fosm-live/main/docs/architecture-reference.md`

Claude fetches the current version, edits it, returns the new code. You commit.

---

## Architecture at a glance

```
                    ┌──────────────────────────────────┐
                    │   THE PLAN TO HEAL THE WORLD     │
                    │   God's Economy · Light · Peace  │
                    └────────────────┬─────────────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
        Layer 2 · 6 Brand     Layer 3 · Software     Layer 4 · Phase 4
        Doorways              (this repo)            Backend + Multi-tenant
                                     │
                ┌────────────────────┼────────────────────┐
                │                                          │
        ┌───────▼────────┐                       ┌─────────▼─────────┐
        │ FOSM·LIVE CC   │                       │ FOSM·LIVE Personal│
        │ (business)     │                       │ (individual)      │
        └───────▲────────┘                       └─────────▲─────────┘
                │                                          │
                │       8 expansion CCs feed both          │
                └──────────────────┬───────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
         Marketing CC ✅       Vision CC ✅       Operations CC ⏳
         Sales CC ✅           Leadership CC ⏳   Integrity CC ⏳
                               Emotional Intelligence CC ⏳
```

Six brand doorways feed into this: Learn And Grow Rich (parent), Beyond The Money
(program), The Foundation by LGR, The Retreat by LGR, Money·God·Politics, Indiana
Oehlman.

Full architecture reference: [`docs/architecture-reference.md`](docs/architecture-reference.md)

Deployment guide: [`DEPLOYMENT.md`](DEPLOYMENT.md)

---

## Distribution model

Every expansion CC is architecturally identical. What differs is who gets it:

- **Gifted to everyone** — Vision CC, FOSM·LIVE Personal. Free. Brand-alignment
  with "give everything away, only help those who qualify."
- **Sold or gifted at discretion** — Marketing CC, Sales CC, future Operations,
  Leadership, Integrity, Emotional Intelligence. Per-relationship decision.

Distribution is a marketing/strategy choice, not an architectural one. Any CC
can be moved between distribution tiers without code changes.

---

## License

MIT

---

Built by Zach Oehlman ([@zoehlman](https://github.com/zoehlman)) with Claude.
Cheers and have a blessed day.
