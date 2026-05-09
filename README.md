# fosm-live

**The Plan To Heal The World — FOSM·LIVE command center ecosystem.**

God's Economy as an operating system. Three software layers (For-Profit, Non-Profit, Retreat), one Brain with three chambers, six brand doorways, all serving the mission of peace + prosperity for all.

---

## What's in this repo

| Folder | What it is | Status | Live at |
|---|---|---|---|
| `system-map/` | Master architectural reference — V1–V8 ecosystem wireframe | wireframe v0.1 | https://fosmlivesitemap.netlify.app |
| `marketing-cc/` | Marketing Command Center — campaign factory + attribution engine | building | _tbd_ |
| `sales-cc/` | Sales Command Center — pipeline + audit intake + funnel | building | _tbd_ |
| `fosm-template/` | F.O.S.M. Command Center template (v8) | live | _tbd_ |
| `docs/` | Architecture references, voice guides, planning docs | ongoing | — |

---

## How to read the code

Every command center is a single self-contained `index.html` with embedded CSS and JS. No build step, no npm install, no dependencies. Open the file in a browser and it works.

To preview locally:
```bash
cd system-map
python3 -m http.server 8000
# then open http://localhost:8000
```

To deploy: Netlify, GitHub Pages, Vercel, or drop on any static host.

---

## How to update the code (with Claude)

**Best path — Claude Code.** Install once: `npm install -g @anthropic-ai/claude-code`. Then `cd` into the repo and run `claude`. Claude can edit files and commit directly.

**Other paths:**
- Cursor / VSCode + Copilot — paste Claude's generated code, save, commit
- GitHub web editor — open the file on github.com, pencil icon, paste, commit

**For Claude in chat (claude.ai)**, paste the raw URL of the file you want updated. The pattern is:

https://raw.githubusercontent.com/zoehlman/fosm-live/main/<folder>/<file>

Examples:
- System map: `https://raw.githubusercontent.com/zoehlman/fosm-live/main/system-map/index.html`
- Marketing CC: `https://raw.githubusercontent.com/zoehlman/fosm-live/main/marketing-cc/index.html`
- Architecture doc: `https://raw.githubusercontent.com/zoehlman/fosm-live/main/docs/architecture-reference.md`

Claude fetches the current version, edits it, returns the new code. You commit.

---

## Architecture at a glance

```
                    ┌──────────────────────────────┐
                    │   THE PLAN TO HEAL THE WORLD │
                    │      God's Economy · Light    │
                    └──────────────┬───────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
       Layer 3 · For-Profit   Layer 4 · Non-Profit   Layer 5 · Retreat
       FOSM·LIVE for cos     FOSM·LIVE for foundations  FOSM·LIVE for centers
              │                    │                    │
              └─────────┐    ┌─────┴─────┐    ┌─────────┘
                        │    │           │    │
                   ┌────▼────▼───────────▼────▼────┐
                   │   THE BRAIN · FOSM·LIVE       │
                   │   1 mind · 3 chambers ·       │
                   │   4 input streams              │
                   └────────────────────────────────┘
```

Six brand doorways feed into this: Learn And Grow Rich (parent), Beyond The Money (program), The Foundation by LGR, The Retreat by LGR, Money·God·Politics, Indiana Oehlman.

Full architecture reference: [`docs/architecture-reference.md`](docs/architecture-reference.md)

---

## Build order

1. ✅ System map (wireframe v0.1 — V1–V7 deployed; V8 Sales CC pending redeploy)
2. 🔨 Marketing CC (building)
3. ⏳ Sales CC (queued)
4. ⏳ Operations CC
5. ⏳ Vision-to-Reality CC
6. ⏳ Executive CC (multi-tenant launch)
7. ⏳ Foundation CC
8. ⏳ Retreat CC

---

## License

MIT

---

Built by Zach Oehlman ([@zoehlman](https://github.com/zoehlman)) with Claude.
Cheers and have a blessed day.
