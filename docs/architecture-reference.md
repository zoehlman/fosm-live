# FOSM·LIVE Architecture Reference

**The Plan To Heal The World — God's Economy as an operating system.**

This is the canonical text reference for the FOSM·LIVE ecosystem. The interactive
wireframe lives at [`../system-map/`](../system-map/); this doc holds the same
information as searchable markdown so any session can read it without parsing
the HTML.

---

## The North Star

- **Vision:** The Plan To Heal The World
- **Frame:** God's Economy · Light · Peace + Prosperity For All
- **Tagline:** "The path is walked, not handed out."

---

## Three-Layer Vision

### Layer 1 — The Vision
The Plan To Heal The World sits above everything else.

### Layer 2 — The Brand Doorways (6 doors, 1 message)
- **Learn And Grow Rich** — parent brand · the warm teacher
- **Beyond The Money** — program under LGR · the peer who's been there
- **The Foundation by LGR** — sub-brand · the steward
- **The Retreat by LGR** — sub-brand · the guide
- **Money·God·Politics** — parallel brand · the humble student
- **Indiana Oehlman** — personal brand · the friend on the road

### Layer 3 — The Software (the operating system)
Two dashboards plus eight expansion command centers. The whole point of the
software stack is to give the brands a tangible product to point at — peace
and prosperity, in software form.

---

## The Software Architecture

### Two LIVE Dashboards (the reporting layer)

```
              FOSM·LIVE CC                FOSM·LIVE Personal
              (for businesses)            (for individuals)
                  ▲                            ▲
                  │                            │
                  │      data flows up         │
                  │                            │
                  └──────── from ──────────────┘
                              ↓
              ┌─────────────────────────────────────┐
              │   8 expansion CCs (the workhorses)  │
              └─────────────────────────────────────┘
                              +
              ┌─────────────────────────────────────┐
              │   External tools                    │
              │   QuickBooks · Stripe · GHL · etc.  │
              └─────────────────────────────────────┘
```

**FOSM·LIVE CC** — the business dashboard. Receives data from QuickBooks,
Stripe, GoHighLevel, and other external tools. As expansion CCs come online
and get connected, they replace or augment the data those external tools
provide.

**FOSM·LIVE Personal** — the parallel dashboard for individuals. Receives data
from personal-finance tools (Sheets via OAuth, Google Drive, etc.) and from
expansion CCs when connected. F·O·S·M + L·I·V·E pillars adapted to
personal-scale: F = personal cash flow, S = career income, etc.

Both are dashboards. There is no "lite mode" — every client gets the full
dashboard. What changes per relationship is which expansion CCs are connected
to it.

### Eight Expansion CCs (the workhorses)

Each is a deep, sophisticated tool that *does the work* of one pillar. Too
vast to live inside a dashboard — they're separate apps that feed dashboards.

| Pillar | Side | Expansion CC | Status |
|---|---|---|---|
| **F** · Finance | Business | (handled by QuickBooks + Stripe — no expansion CC) | n/a |
| **O** · Operations | Business | Operations CC | ⏳ planned |
| **S** · Sales | Business | Sales CC | ✅ live |
| **M** · Marketing | Business | Marketing CC | ✅ live |
| **L** · Leadership | Human | Leadership CC | ⏳ planned |
| **I** · Integrity | Human | Integrity CC | ⏳ planned |
| **V** · Vision | Human | Vision CC | ✅ live (gifted to all) |
| **E** · Emotional Intelligence | Human | Emotional Intelligence CC | ⏳ planned |

### Distribution model (current state · v1)

Every expansion CC is architecturally identical. What differs is *role*:

- **Sold to clients** — **FOSM·LIVE CC only.** This is the dashboard product.
  It incorporates Finance (via QuickBooks/Stripe integration) and is the
  thing a paying client receives, operates, and sees.
- **Gifted to everyone** — Vision CC, FOSM·LIVE Personal. Free, public-
  facing tools. Brand-alignment with "give everything away, only help those
  who qualify." Funnel-bottom upsell path: a small percentage of free users
  upgrade to paid FOSM·LIVE CC, at which point their existing free-tool data
  flows into their new paid dashboard.
- **Internal tools (not sold today)** — Marketing CC, Sales CC, future
  Operations CC, Leadership CC, Integrity CC, Emotional Intelligence CC.
  Used by Zach and team to do the work that produces results in client
  FOSM·LIVE CC dashboards. Clients don't operate these directly; they see
  the work product flowing into their dashboard. These CCs may ship as
  standalone products in a future phase if/when there's demand, but that's
  not the v1 model.

Distribution is a strategic choice, not an architectural one. The codebase
doesn't enforce "free" vs "paid" vs "internal" categories. Any CC can be
moved between roles without code changes — meaning if/when expansion CCs
become sellable products in the future, the architecture is ready for it.

### Vision CC — special note

Vision CC is broader than the V pillar of L·I·V·E. It's a **12-Domain life
vision system** (Body, Spirit, Mind, Heart, Character, Marriage, Family, Tribe,
Money, Mission, Legacy, Lifestyle) that *contains* the V pillar inside it.
It also surfaces four Projects (The Farm, The Retreat, The Foundation, The
Business) and a Couple Vision (joint with partner). Treat it as the V pillar's
expansion CC, but understand its scope is wider than V alone.

---

## The Connection Model

Today: each CC is standalone. They share an origin (`fosmlive.netlify.app`)
and use `localStorage` for cross-CC reads via the same-origin bridge.

```
Cross-CC reads (same-origin localStorage):
   Sales CC reads CB_PIPELINE from Marketing CC's `fosm_cc_pipeline_v1`
   Future: V2R CC reads vision-board state from Vision CC's `fosm_vision_*_v1`
   Future: Ops CC reads delivery state from Sales CC's people pipeline

Tomorrow (Phase 4): Postgres/Supabase backend behind /api/db/*
   Same entity contracts. localStorage stays as offline cache.
```

**Why this matters operationally:** all CCs MUST live at the same origin. The
moment one moves to a different subdomain or different host, the bridge breaks
silently — Sales CC's pipeline returns empty because it's reading the wrong
origin's localStorage.

---

## F·O·S·M (Business Engine — for FOSM·LIVE CC)

| Pillar | Role | Feeds from |
|---|---|---|
| **F · Finance** | money brick · cash · margin | QuickBooks, Marketing CC (CAC/ROAS/LTV), Sales CC (pipeline), Ops CC (COGS) |
| **O · Operations** | SOPs · throughput · quality | ClickUp, Slack, Operations CC |
| **S · Sales** | qualify · close · retain | GHL (CRM), Webinars, Sales CC |
| **M · Marketing** | brand · content · attribution | Marketing CC, Attribution Engine, Forum Engine |

## L·I·V·E (Human Engine — for FOSM·LIVE CC and Personal)

| Pillar | Role | Tracks |
|---|---|---|
| **L · Leadership** | inspire · align · empower | Team alignment (L10), Decision logs, Delegation map |
| **I · Integrity** | alignment to chosen destination | Promise vs delivery (word kept ratio), Values audit, Brand-voice integrity |
| **V · Vision** | where we're going · why | Vision-to-Reality CC, Annual planning, Plan To Heal World |
| **E · Emotional Intel** | where does pissed off live? | Self-state journal, Trigger map, Retreat integration |

**RYG schema:** each instance's roll-up = average of 8 pillars. A green company
with a red leader is a yellow business — it'll regress to the mean. The system
flags this before the numbers do.

---

## Mandatory Convention · Every CC ships with the System Map module

**This is non-negotiable.** Every Command Center — current and future — MUST
include the System Map module on day one. Three tabs:

1. **Architecture** — auto-embedded site map (the same content as this doc,
   scoped to that CC)
2. **Backup** — Export/Import all `fosm_*_v1` localStorage keys as one JSON
   bundle, with a 7-day overdue warning badge on the sidebar
3. **Diagnostics** — self-tests for the canonical store wiring (verify each
   `+Add` button creates an entry, each `Delete` actually deletes, etc.)

**Why this is a hard rule:** the localStorage-first phase is only survivable
if operators can move their data between origins. The "where did my data go"
panic at every redeploy or migration is solved by Backup. Any CC that ships
without this is one redeploy away from losing operator work.

The convention pays for itself the first time a CC moves origin (which has
already happened tonight: Marketing CC and Sales CC both migrated from
`marketingcc.netlify.app` and `salescc.netlify.app` to
`fosmlive.netlify.app/marketing-cc/` and `fosmlive.netlify.app/sales-cc/`,
and the Backup feature is what made it lossless).

---

## Conventions & Contracts (locked)

- **localStorage keys:** prefix `fosm_`, suffix `_v1`. Versioning is intentional
  for future migration to a real backend.
- **Same-origin requirement:** all CCs at `fosmlive.netlify.app/<cc-slug>/`.
  Subdomain splits break the localStorage bridge.
- **Single-file HTML deployable:** every CC is one `index.html` with embedded
  CSS and JS. No build step. No npm install. No dependencies.
- **AI proxy contract:** front-ends call `/api/ai-proxy` (streaming SSE for
  Marketing/FOSM·LIVE/Sales) or `/api/anthropic-proxy-personal` (non-streaming
  for the Personal app, separate env var for billing isolation). All proxy
  functions live in `netlify/functions/`.
- **Status taxonomy:** 🟢 LIVE · 🟡 PARTIAL · 🟠 STUBBED · 🔴 BROKEN.
- **Cross-CC reads:** never duplicate state. The CC that owns it is the only
  one that writes. Sales CC reads `fosm_cc_pipeline_v1` from Marketing CC; it
  never writes to it.
- **Demo personas:** same artifact + workshop pipeline as real prospects;
  `isDemo: true` flag is the only difference.
- **No backend required for v1:** localStorage carries the system. Phase 4
  brings Postgres/Supabase behind `/api/db/*` mapped from the same entity
  contracts.

---

## The Six Brand Worlds

(Voice rules are the source of truth for content output. See
`01_Brand_Voice_Messaging_Guide.docx` in project knowledge for the full guide.)

| Brand | Audience | Voice | Tone marker | Default CTA |
|---|---|---|---|---|
| **Learn And Grow Rich** | Entrepreneurs scaling to/past $1M | The warm teacher · tactical · framework-driven | "Here's exactly how to do this." | F.O.S.M. Planner → Finance Department → Beyond The Money |
| **Beyond The Money** | Founders with money but no fulfillment | The peer who's been there · reflective · vulnerable | "I had everything and still didn't have peace." | Beyond The Money → Inner Circle → The Retreat |
| **Foundation by LGR** | Givers · donors · the inspired | The steward · grateful · transparent · numbers-driven | "100% of this reached the mission." | Donate → follow progress → MBA Program |
| **Retreat by LGR** | High-functioning entrepreneurs ready for inner work | The guide who's walked it · calm · knowing | "I searched 15 years for this." | Application → Beyond The Money pre-req → The Farm |
| **Money·God·Politics** | Truth-seekers exhausted by polarization | The humble student · inquiring · curious | "Let's explore this together — what if…?" | Subscribe podcast · Substack · LGR for frameworks |
| **Indiana Oehlman** | Everyone — friend-level | The friend on the road · present-tense · adventurous | "Today I'm in [place]." | "Follow along." |

### The 7-question voice check (every post)

1. Sounds like Zach, not a generic marketer?
2. Inquiry-led, not declaration-led?
3. Avoids moralizing?
4. Gives value before asking?
5. Names something concrete (story, framework, number, question)?
6. If God/faith mentioned, would an atheist still want to read it?
7. Does the CTA match brand + funnel stage?

If any answer is wrong, it doesn't ship.

---

## Build Order (recommended sequence · post-tonight)

Updated 2026-05-08 to reflect actual deployment status.

1. ✅ **System map** — wireframe live
2. ✅ **Marketing CC** — campaign factory + attribution engine, AI features working
3. ✅ **Sales CC** — pipeline, audit intake, person profiles, Drive-mode
4. ✅ **FOSM·LIVE CC** — business dashboard with 8 AI specialists
5. ✅ **Vision CC** — 12-Domain life vision system (gifted to all)
6. ✅ **FOSM·LIVE Personal** — personal-finance dashboard with Ask Zach + Sheets OAuth (gifted to all)
7. ⏳ **Operations CC** — anchored on ClickUp; SOPs, RACI, weekly L10
8. ⏳ **Leadership CC** — team alignment, decision logs, A+ team coverage
9. ⏳ **Integrity CC** — promise vs delivery tracking, values audit
10. ⏳ **Emotional Intelligence CC** — self-state journal, trigger maps, retreat integration

After all 10 are live: Phase 4 backend, multi-tenant Executive CC for licensees,
Foundation CC and Retreat CC flagships.

---

## Tonight's Migration · 2026-05-08

What changed: the entire ecosystem consolidated from four separate Netlify
sites + one Vercel site onto a single Netlify origin. The cross-CC
localStorage bridge — silently broken for months because of subdomain
splits — now works.

Before:
- `marketingcc.netlify.app` · `salescc.netlify.app` · `fosmlivesitemap.netlify.app` · `fosmlivecc.netlify.app` (locked)
- `software-by-lgr-personal.vercel.app` (separate platform)

After:
- `fosmlive.netlify.app/marketing-cc/`
- `fosmlive.netlify.app/sales-cc/`
- `fosmlive.netlify.app/system-map/`
- `fosmlive.netlify.app/fosm-live-cc/`
- `fosmlive.netlify.app/fosm-live-personal/`
- `fosmlive.netlify.app/vision-cc/`

Plus three serverless functions at `/api/ai-proxy`, `/api/anthropic-proxy-personal`,
`/api/image-gen`, `/api/image-status`. Two API key env vars (`ANTHROPIC_API_KEY`
and `ANTHROPIC_API_KEY_PERSONAL`) for billing/usage isolation.

The old sites stay live for 1-2 weeks as fallback. Then deletion.

---

## Source Documents (in Claude project knowledge)

These docs feed the Brain and the Brand Voice Sentinel:

- `01_Brand_Voice_Messaging_Guide.docx` — voice rules per brand
- `Learn_and_Grow_Rich___ICP_Reference_Guide.pdf` — 5 ICPs
- `Learn_And_Grow_Rich__FOSM_Planner__Template.pdf` — diagnostic intake
- `Learn_And_Grow_Rich__Executive_Program__Strategic_Plan__Template.pdf`
- `Learn_And_Grow_Rich__Executive__Vision_To_Reality_Yearly_Planning_Session_1.pdf`
- `The_Plan_To_Heal_the_World_compressed.pdf` — vision document
- `100_Reasons_Why_You_Can_t_Scale_Your_Business.pdf` — pain-point catalog
- `Rebrand__Exit_Program.pdf` · `Rebrand__Finance_Department.pdf` — funnel positioning
- `Learn_And_Grow_Rich_-_YouTube_Content_Calendar...pdf` — channel calendar
- `Learn_And_Grow_Rich_MBA_YouTube_Transcripts.docx` — voice training corpus
- `Meditation_*.txt` / `Meditation_*.pdf` — Zach's spiritual downloads (input stream)

---

## Last updated

2026-05-08 by Zach Oehlman + Claude. Re-fetch after the next CC ships.
