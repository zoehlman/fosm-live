# LGR Operations Command Center · Build Prompt v2.0

**Paste this entire document into a fresh Claude chat to start the build.** Attach the three reference files listed at the bottom. Claude will produce a single-file production HTML deliverable that fits into the existing `fosm-live` GitHub repo at `https://github.com/zoehlman/fosm-live` and deploys to `https://fosmlive.netlify.app/operations-cc/`.

---

## Your role

You are helping me build the **LGR Operations Command Center** — the next expansion CC in the FOSM·LIVE ecosystem. Marketing CC, Sales CC, and Vision CC are already live in production. You will produce a **single-file `index.html` deliverable** that I commit to `operations-cc/` in my repo. Same-origin with the other CCs is non-negotiable — the cross-CC localStorage bridge depends on it.

I want you to act as a careful, opinionated architect. Ask the questions you need to ask. Push back when something I propose contradicts the canonical framework. Surface stubs honestly — never fake functionality.

---

## The repo I'm committing to

**Repo:** `https://github.com/zoehlman/fosm-live`
**Live at:** `https://fosmlive.netlify.app`

**Existing structure:**

```
fosm-live/
├── system-map/         ← V0–V9 wireframe (canonical map)
├── fosm-live-cc/       ← business dashboard with 8 AI specialists (🟢 LIVE)
├── fosm-live-personal/ ← personal dashboard with Ask Zach + Sheets OAuth (🟢 LIVE)
├── marketing-cc/       ← Marketing CC (🟢 LIVE)
├── sales-cc/           ← Sales CC v0.7.14 (🟢 LIVE)
├── vision-cc/          ← Vision CC (🟢 LIVE)
├── operations-cc/      ← ← YOU ARE BUILDING THIS
├── netlify/functions/  ← AI proxies + image gen edge functions
├── docs/               ← architecture-reference.md and planning docs
├── README.md
├── DEPLOYMENT.md
├── netlify.toml
└── index.html          ← landing page for fosmlive.netlify.app
```

**Deployment:** I commit your single `index.html` to `operations-cc/` and Netlify auto-deploys it to `https://fosmlive.netlify.app/operations-cc/`. Same domain as every other CC, so cross-CC localStorage reads work natively.

---

## What FOSM·LIVE is

**FOSM·LIVE is the Creation Code** — the structural grammar that anything alive at any scale must enact to exist, sustain, and create. Eight dimensions in a 4+4 structure:

- **Functions** (flows, throughput): **F**inance · **O**perations · **S**ales · **M**arketing
- **Capacities** (patterns, longitudinal): **L**eadership · **I**ntegrity · **V**ision · **E**motional Intelligence

The framework is recursive (same shape at every scale). Activates the moment two people must coordinate. Destination: **peace and prosperity** — the convergence of every wisdom tradition that has taken human flourishing seriously.

Full text in `FOSM_LIVE_Canonical_Reference_v0_6.docx`. When your build disagrees with that document, the document wins until the document is deliberately revised.

---

## Where Operations CC sits

```
                       [V0 · Canonical Reference v0.6]
                                  ↓
                        [Brain · FOSM·LIVE Master · 7 input streams · 3 chambers]
                                  ↓
        ┌─────────────────────────┼─────────────────────────┐
        ↓                         ↓                         ↓
   [FOSM·LIVE CC]          [FOSM·LIVE Personal]       [Executive CC · per layer]
   business dashboard       personal dashboard          apex per principal
        ↑                         ↑                         ↑
        │       8 expansion CCs feed both dashboards       │
        └─────────────────────────┬─────────────────────────┘
                                  │
   ┌──────────────┬──────────────┼──────────────┬──────────────┐
   ↓              ↓              ↓              ↓              ↓
[Marketing] [Sales] [Operations] [Vision] [L/I/E CCs planned]
 ✅ LIVE    ✅ LIVE  🟠 BUILDING  ✅ LIVE   ⏳
                       │
                       ↓ manages
              [Client Roster]
                       ↓ each delivers
              [Client FOSM·LIVE · the deliverable]
```

**Critical mental model · read twice:**

- **Client FOSM·LIVE is the deliverable.** It's sovereign. Where the client's business lives.
- **LGR Operations CC + LGR ClickUp are the tools** that keep the deliverable fresh.
- **LGR ClickUp** = task manager. Single source of truth. If it's not in ClickUp, it doesn't exist.
- **LGR Operations CC** = the brain. Synthesizes status, prioritizes work, surfaces what needs attention.
- **Client FOSM·LIVE** = the deliverable, sovereign, where Zach reads the business directly.

---

## What's been built (the contract you inherit)

### Locked conventions (do not break)

- **localStorage keys** prefixed `fosm_`, suffixed `_v1` (for migration)
- **Status taxonomy** — `🟢 LIVE · 🟡 PARTIAL · 🟠 STUBBED · 🔴 BROKEN` — **never lie about state**
- **Cross-CC reads** — never duplicate · single source of truth · clean dependency direction
- **Single-file HTML** — drag-onto-Netlify-Drop friendly · all CSS and JS inline
- **Same-origin** — your file deploys to `fosmlive.netlify.app/operations-cc/` so localStorage from `/marketing-cc/` and `/sales-cc/` is readable
- **All brand-voice prompts** route through `buildBrandContextBlock()` (lift the pattern from Marketing CC or Sales CC)
- **AI proxy** — calls go to `/api/ai-proxy` (existing Netlify edge function; do NOT pass API keys client-side)
- **Studio job lifecycle**: `queued → in_progress → delivered → (revisions ↔) → approved`
- **Backup safety net** — export owned localStorage keys → versioned JSON · import preview-before-apply
- **Honest stubs** — visible in sidebar with "Phase 2/3" labels · no fake buttons
- **Brand voice 7-point check** — every public-facing string passes 7 questions (see `01_Brand_Voice_Messaging_Guide.docx`)

### Reading the existing code

Before you write anything, fetch and skim these (use the raw GitHub URL pattern):

- Marketing CC: `https://raw.githubusercontent.com/zoehlman/fosm-live/main/marketing-cc/index.html`
- Sales CC: `https://raw.githubusercontent.com/zoehlman/fosm-live/main/sales-cc/index.html`
- System map (for the V9 Operations spec): `https://raw.githubusercontent.com/zoehlman/fosm-live/main/system-map/index.html`
- Architecture reference: `https://raw.githubusercontent.com/zoehlman/fosm-live/main/docs/architecture-reference.md`

Match the visual language (CSS variables, sidebar pattern, callout shapes, status taxonomy) of Marketing CC and Sales CC exactly. Operations CC is a sibling — it should feel like a sibling.

### Cross-CC reads (you read, you don't write)

```
From Marketing CC:
  fosm_brand_library_v1        — brand definitions for the 6 doorways
  fosm_icp_library_v1          — ICP definitions
  fosm_offer_library_v1        — offers / packages / pricing

From Sales CC:
  fosm_person_profiles_v1      — every prospect/lead, closed-won → client
  fosm_artifact_library_v1     — audit outputs follow client to Ops
  fosm_touch_log_v1            — historical touches before close
```

When a Sales CC prospect closes (Stage 7), they become an Operations CC client. The handoff data is already in `fosm_person_profiles_v1` — Operations CC reads it, doesn't duplicate it.

---

## What Operations CC IS (functional spec)

### The four sub-departments

1. **Communications Department** — LGR's OWN comms surface (NOT the client's internal Slack/email):
   - LGR's Slack workspace · per-client channels · LGR-with-client conversations only
   - LGR's email (Gmail/Outlook) · LGR-to-client thread aggregation
   - LGR's recorded calls with clients (Zoom, Meet, Fathom, Loom)
   - LGR's ClickUp comments
   - **Daily background sweep** — cross-references LGR team calendars against recordings · flags unrecorded LGR-client calls
   - **ClickUp Gap Detector** — scans LGR comms for action items, flags "discussed but not in ClickUp" for operator approval
   - **Contradiction Flagger** — cross-channel cross-team-member · flags conflicting statements · operator resolves
   - **Meeting Summarizer** — auto-summary per LGR-client call · decisions · action items · participants
   - **Executive Summary Generator** — per-client digest · what's outstanding · runs daily

2. **Data Department** — about-clients data, not the clients' own data:
   - LGR's QuickBooks (LGR's own books · revenue · margin · client billing)
   - Keeper.com (per-client private financial data · API/MCP if available)
   - Per-client recordings vault
   - FOSM·LIVE feeds from each client instance

3. **ClickUp · PM tool** — the single source of truth for tasks:
   - Operations CC does NOT replicate ClickUp
   - Operations CC feeds FROM it and pushes synthesized work back INTO it
   - ClickUp = task manager · Ops CC = the brain

4. **PM Calendar · output** — the visual output of everything else:
   - Every client's filings, due dates, monthly closes, payroll runs, quarterly Qs, annual returns on one timeline
   - Workload view for staff planning
   - Per-client filter

Plus a "+ add more departments later" affordance.

### Client Roster

Silos · click any to drill in. Each client card shows:
- Client name
- Number of companies + entities
- Phase indicator: **P1 Starting** (onboarding, entity audit) · **P2 Scaling** (regular delivery, monthly reviews) · **P3 Holding/Selling** (prep for exit)
- FOSM·LIVE/manual indicator: clients with active FOSM·LIVE auto-feed up · clients without one still get a complete profile via manual entry
- Last touch · next review

Filter controls: phase · FOSM·LIVE/manual

### Tabbed Client Profile (sub-page)

Click any client card to open. Tabs organize the work:

- **Companies** — entity tree with FOSM·LIVE toggle per entity · manual entry for entities without FOSM·LIVE (trusts, holding entities, etc.)
- **Communications** — Executive Summary (what's outstanding) · Meeting Summarizer · Contradiction Flagger · ClickUp Gap Detector
- **Filings** — TBD spec, stub for Phase 1
- **Scope** — scope creep tracker (LGR-Ops-only, NOT in Client FOSM·LIVE)
- **Documents** — TBD spec, stub for Phase 1
- **+ add tab** affordance

The **Communications tab** is the daily working surface — the team opens it every morning to see what needs attention per client.

### Outside third parties

These COMMUNICATE with Operations CC but stay separate · do NOT live inside:
- Security (incident reporting, compliance)
- Auditing (external CPA, annual audits, peer reviews)
- + add more as needed (legal, IT, insurance brokers)

### Weekly call rhythm (same in every FOSM·LIVE)

- Monday — F · Finance
- Tuesday — O · Operations
- Wednesday — S · Sales
- Thursday — M · Marketing
- Friday — Open call

Surface this rhythm somewhere visible. It's the four-pillars-alive cadence.

---

## What Operations CC IS NOT (the boundary)

The architecture only works if you keep these clean:

- **Operations CC does NOT push data into Client FOSM·LIVE directly.** LGR's work happens in the client's own systems (their QuickBooks, their Drive, doc requests via email). That work naturally updates their FOSM·LIVE through existing data feeds.

- **What flows UP from Client FOSM·LIVE → LGR Ops is STATUS, not raw pillar data.** Bank rec status, payroll status, filing readiness, doc gaps, OSM·LIVE pillar update health. Not the raw numbers — those stay in the Client FOSM·LIVE.

- **F pillar in Client FOSM·LIVE comes from the client's accounting software** (QuickBooks, others). LGR's role: do the accounting work in client's QuickBooks → auto-feeds Client FOSM·LIVE F.

- **O · S · M · L · I · V · E pillars** come from client's own systems. LGR's role: ensure pillar owners keep updating · LGR doesn't own this data, just nudges it forward.

- **When Zach needs to interpret OSM·LIVE data:** he queries the Client FOSM·LIVE directly. Build a `FOSM·LIVE Query Interface` module that opens the client's FOSM·LIVE URL (paste-URL pattern, same as Sales CC's Drive integration).

- **Monthly reviews stay in Client FOSM·LIVE.** Zach reviews directly there. No replication in Ops.

- **Scope creep tracker is LGR-Ops-only.** It does NOT live in Client FOSM·LIVE.

- **Operations CC does not replicate ClickUp.** ClickUp is the task source of truth. Ops CC feeds from it and pushes synthesized work back into it.

- **The Communications Department aggregates LGR's OWN comms surface, not the client's internal comms.** Big difference.

---

## What to build in Phase 1 (the deliverable)

A **single-file `index.html`** in the same shape as Marketing CC and Sales CC. Honest about what's live vs stubbed. Drops into `operations-cc/` in the repo.

### Sidebar navigation (seven numbered sections + honest stubs)

1. **🎯 Today · See** — what needs attention now (across all clients)
2. **🏢 Client Roster · Work** — silos · drill in to Tabbed Client Profile
3. **🏗 Departments · Configure** — the 4 sub-departments
4. **📅 PM Calendar · Output** — filings timeline
5. **🔗 FOSM·LIVE Query Interface · External** — open client FOSM·LIVE URLs
6. **🌉 Sales CC Bridge · Receive** — closed-won handoff from Sales CC
7. **🗺 Meta · Platform** — System Map (Architecture · Backup · Diagnostics)
8. **🚧 Not Yet Built** — honest stubs

### LIVE modules (Phase 1)

- **Today view** — cross-client surface: what's overdue, what's due this week, what's flagged
- **Client Roster** — add/edit/delete clients · phase tag · FOSM·LIVE toggle · last-touch · next-review
- **Tabbed Client Profile** — at minimum:
  - **Companies tab**: entity tree with manual entry · FOSM·LIVE toggle per entity
  - **Communications tab**: executive summary (manual Phase 1) + manual meeting notes + manual contradiction flagging
  - **Scope tab**: manual scope-creep tracker (in/out of contract, free-give recommendations)
- **Department containers** — 4 named departments with module lists · clicking modules shows "Phase 2/3 · Stubbed" callouts
- **PM Calendar · output** — simple filings/dates timeline · per-client filter · manual entry for Phase 1
- **FOSM·LIVE Query Interface** — paste a client FOSM·LIVE URL per client → button to open in new tab · stores in `fosm_client_profiles_v1`
- **Sales CC Bridge** — read-only view of `fosm_person_profiles_v1` filtered to closed-won · one-click "import to roster"
- **System Map sub-views** — Architecture diagram · Backup tab (export/import JSON) · Diagnostics

### PARTIAL modules

- Bridge from Sales CC closed-won → auto-create client roster slot. Mark this PARTIAL — manual import works Phase 1, auto-trigger Phase 4 Supabase.

### STUBBED modules (sidebar entries with Phase 2/3 labels)

**Communications Department:**
- LGR Slack Aggregator (Phase 2 · Slack API)
- LGR Email Aggregator (Phase 2 · Gmail API)
- LGR Recording Vault (Phase 2 · Zoom/Fathom/Loom imports)
- Meeting Summarizer (Phase 3 · AI per LGR-client call · uses `/api/ai-proxy`)
- Executive Summary Generator (Phase 3 · AI · runs daily · `/api/ai-proxy`)
- Contradiction Flagger (Phase 3 · cross-channel AI · `/api/ai-proxy`)
- Daily Sweep (Phase 2 · calendar × recordings cron)
- ClickUp Gap Detector (Phase 3 · AI scans LGR comms · `/api/ai-proxy`)
- LGR Calendar Sync (Phase 2 · Google Calendar API)

**Data Department:**
- QuickBooks Integration (Phase 2 · API)
- Keeper.com Integration (Phase 2 · API/MCP)
- FOSM·LIVE Feeds (Phase 2 · webhooks or polling per client instance)

**ClickUp Department:**
- ClickUp API · two-way sync (Phase 2)
- Owner Scorecards (Phase 2)
- SOP Library (Phase 2)
- L10 Tracker (Phase 2)

**PM Calendar:**
- Workload Heatmap (Phase 2 · derived from filings + ClickUp)
- Auto-filing-due-date detection (Phase 2 · per entity type)
- Phase-based cadence automation (Phase 3)

---

## Storage architecture

### Storage keys Operations CC owns

```
fosm_client_roster_v1          — array of clients · name · phase · fosmLiveUrl · isManualOnly · createdAt · lastTouch · nextReview
fosm_client_profiles_v1        — per-client deep profile (parent_id links to client_roster.id)
fosm_entity_tree_v1            — entity tree per client (companies → sub-entities, with fosmLiveEntityId or isManualEntry)
fosm_filing_status_v1          — filings calendar entries
fosm_recordings_index_v1       — manifest of recording references (Phase 1 manual, Phase 2 auto)
fosm_sweep_results_v1          — daily sweep output queue (Phase 1 manual, Phase 2 auto)
fosm_task_sync_v1              — ClickUp task mirror (Phase 1 stub, Phase 2 wired)
fosm_gap_detector_queue_v1     — items flagged "discussed but not in ClickUp" awaiting operator approval
fosm_workload_v1               — workload per LGR team member
fosm_doc_state_v1              — document state per client/entity
fosm_scope_tracker_v1          — scope creep entries (in/out of contract)
fosm_phase_indicators_v1       — phase rules · cadence per phase
fosm_meeting_notes_v1          — manual meeting note entries (Phase 1) · auto Phase 3
fosm_contradiction_flags_v1    — manual + auto-flagged contradictions
fosm_ops_ui_state_v1           — UI state (which client selected, which tab open, filters)
```

### Storage keys Operations CC reads

```
From Marketing CC:
  fosm_brand_library_v1
  fosm_icp_library_v1
  fosm_offer_library_v1

From Sales CC:
  fosm_person_profiles_v1
  fosm_artifact_library_v1
  fosm_touch_log_v1
```

### Backup safety net

Same pattern as Marketing CC and Sales CC: System Map → Backup tab exports all owned keys to versioned JSON (`fosm-ops-cc-backup-YYYY-MM-DD.json`). Import is preview-before-apply with overwrite warnings. Stale-after-7-days warning on the backup timestamp.

---

## AI integration

Use the existing `/api/ai-proxy` Netlify edge function (already deployed in the repo). Do NOT pass API keys client-side. The proxy pattern is identical to Marketing CC's AI calls — lift it from there.

Most Operations CC AI features ship in Phase 3 (Meeting Summarizer, Executive Summary Generator, Contradiction Flagger, ClickUp Gap Detector). For Phase 1, stub them with the proxy pattern in place so wiring is just turning on the routes.

---

## The fractal · why this works

Same FOSM·LIVE shape at every level:

- **Stage 1:** Your business — F · O · S · M · L · I · V · E
- **Stage 2:** Their (client) business — F · O · S · M · L · I · V · E. You fill ONE pillar.
- **Stage 3:** Their client's business — F · O · S · M · L · I · V · E. Same logic recurses.

LGR is an accounting firm → slots into clients' **F**. A marketing agency → slots into clients' **M**. Same logic, different pillar.

The loop:
- **Marketing** tells the world what you do
- **Sales** explains why you solve it best
- **Operations** delivers on the promise
- **Finance** measures it all and tells the story in numbers

Surface this fractal in the System Map sub-view of Operations CC. It anchors why the same code can serve LGR's operations AND license out to other firms in Phase 5.

---

## Build sequence (do this in order)

1. **First:** Confirm you've read the canonical reference and the brand voice guide. Confirm you've fetched Marketing CC and Sales CC source from the raw GitHub URLs. Confirm the architectural mental model. Ask clarifying questions if anything is unclear.

2. **Then:** Propose the file structure — top-level layout, sidebar IDs, view IDs, CSS variable names — matching Marketing CC and Sales CC's visual language. Get my approval before generating code.

3. **Then:** Build Phase 1 LIVE modules one at a time, with localStorage wiring and brand-voice-aware copy. Ship each as you go so I can review.

4. **Stubbed modules last:** Add sidebar entries with honest Phase 2/3 labels. Clickable to show a "Phase 2 · Stubbed · here's what this will do when wired" callout. Never fake functionality.

5. **System Map sub-views last:** Architecture · Backup · Diagnostics, mirroring Marketing CC and Sales CC.

---

## What success looks like

When Phase 1 is done:

- I can drop `operations-cc/index.html` into the repo, commit, and it's live at `https://fosmlive.netlify.app/operations-cc/`
- The page reads from Marketing CC and Sales CC's localStorage natively (same-origin works)
- I can see what's happening across my client base at a glance
- I can add a new client manually, set their phase, mark them FOSM·LIVE or manual, start tracking
- I can drill into any client to see their entity tree, communications log, scope tracker, FOSM·LIVE link
- I can import closed-won prospects from Sales CC into the client roster
- I can manually enter meeting notes, executive summary items, contradiction flags
- I can see filings calendar across all clients with per-client filter
- I can back up all my data to JSON and restore it
- Every stubbed module clearly says "Phase 2 · Stubbed" — no fake buttons
- Brand voice 7-point check passes on every public-facing string
- Visual language matches Marketing CC and Sales CC exactly (same CSS variables, same callout patterns)

---

## Reference files attached to this chat

Confirm you can see these before we begin:

1. **`FOSM_LIVE_Canonical_Reference_v0_6.docx`** — the Creation Code, the 8 dimensions, the pathology library, the diagnostic decision tree, the Viable Unit data model, the Theory of Impact, the society-scale mapping. This is canon.

2. **`01_Brand_Voice_Messaging_Guide.docx`** — the 6 brand doorways, voices, tone markers, default CTAs, and the 7-point voice check.

3. **`architecture-reference.md`** — the canonical text mirror of the system map. Treat as secondary source of truth (after the canonical reference docx).

---

## Reference URLs to fetch (do this first)

```
https://raw.githubusercontent.com/zoehlman/fosm-live/main/marketing-cc/index.html
https://raw.githubusercontent.com/zoehlman/fosm-live/main/sales-cc/index.html
https://raw.githubusercontent.com/zoehlman/fosm-live/main/system-map/index.html
https://raw.githubusercontent.com/zoehlman/fosm-live/main/docs/architecture-reference.md
https://raw.githubusercontent.com/zoehlman/fosm-live/main/netlify.toml
```

The first two give you the visual language and storage conventions to match. The third has the full V9 Operations CC spec in wireframe form. The fourth is the architecture text. The fifth confirms the deploy config.

---

## Ready

When you've absorbed all of the above, confirm the architectural mental model back to me in your own words (one short paragraph). Then ask whatever clarifying questions you need before we start building. We will build the LGR Operations Command Center the way Marketing CC and Sales CC were built — careful, honest, fractal, and one piece at a time.

Let's go.
