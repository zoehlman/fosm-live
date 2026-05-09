# System Map Canonical Spec

**Version:** 1.0 · **Date:** 2026-05-08 · **Status:** Locked — all design decisions resolved

This spec defines the **System Map Contract** that every Command Center in the
FOSM·LIVE ecosystem MUST honor. It is the single source of truth for how a CC
introduces itself to the operator, declares its data, manages its backups, and
shows where it fits in the larger ecosystem.

> **The principle:** same logic, same structure, different details.
> Each CC implements the contract its own way (Marketing CC's data needs differ
> from Vision CC's), but every CC honors the same five views and the same
> declarative schema. That is what makes the system scale.

---

## Why this spec exists

Across the existing CCs (Marketing CC, Sales CC, FOSM·LIVE CC, Vision CC,
FOSM·LIVE Personal), every system map is slightly different. They were built
at different times by different sessions and they drifted.

This drift is harmful for three reasons:

1. **Operator confusion** — switching between CCs feels jarring because the
   same UI element does different things in different places.
2. **Code duplication** — every CC carries its own slightly-different system map
   implementation. Bug fixes have to be applied 6 times.
3. **Future scaling pain** — when Operations / Leadership / Integrity / Emotional
   Intelligence CCs come online, "what should the system map look like" becomes
   a meeting every time. Lock it once.

The contract below is the lock.

---

## The Contract — Five Views

Every CC's System Map module renders the same five views in the same order
with the same controls. The data inside each view is CC-specific; the chrome
is identical.

### View 1 · Identity

**The header card. Tells the operator what they're looking at.**

Required fields (every CC declares these):

- `name` — display name, e.g. "Marketing CC"
- `slug` — folder slug, e.g. `marketing-cc`
- `version` — semver string, e.g. `0.7.5`
- `status` — one of: `live` · `partial` · `stubbed` · `broken`
- `tagline` — one-liner, e.g. "Campaign factory + attribution engine"
- `serves` — audience, e.g. "Operators producing content for thought-leader brands"
- `owner` — entity that owns the CC, e.g. "Learn And Grow Rich"
- `pillar` — one of: `M` · `O` · `S` · `F` · `L` · `I` · `V` · `E` · `meta`
- `distribution` — one of: `gifted` · `discretionary` · `internal`

**Render contract:** title-bar style card at the top of the System Map module.
Background panel, name + version + status badge inline, tagline below, then a
small meta strip with serves / pillar / distribution. No interactive elements.

### View 2 · Architecture

**How this CC works internally. Mix of FOSM·LIVE CC's data flow + Marketing CC's status framing.**

Three sub-sections, in this order:

**2a · Data flow diagram** — SVG rendering of how data moves through this
CC. Boxes are pages or modules; arrows are reads/writes. The diagram shows
*where data enters this CC*, *how it transforms*, and *where it exits*.
Same SVG visual language as the cross-ecosystem view — consistency across
all diagrammatic surfaces.

**2b · Page Registry** — table form, every page in this CC declares:

- `id` (e.g. `mod-cb` for Marketing CC's Campaign Builder)
- `name` (display name)
- `status` (🟢 LIVE · 🟡 PARTIAL · 🟠 STUBBED · 🔴 BROKEN)
- `reads` (which localStorage stores it reads from)
- `writes` (which localStorage stores it writes to)
- `cross_cc` (boolean — does this page read from another CC's stores?)

**2c · Data Source Registry** — table form, every localStorage store declares:

- `key` (the actual localStorage key, e.g. `fosm_icp_library_v1`)
- `owner` (which page/module owns writes to this store)
- `consumers` (list of pages that read this store)
- `cross_cc` (boolean — is this store also read by other CCs?)
- `size_bytes` (current size, computed at render time)
- `entry_count` (current count, computed at render time)

**Render contract:** the three sub-sections as collapsible panels. Default:
data flow expanded, registries collapsed. Operators who want depth can expand;
operators who just want the picture get the diagram.

### View 3 · Connections

**Where this CC fits in the ecosystem. The mini-diagram view.**

Renders a small graph showing:
- This CC at the center, highlighted
- Direct neighbors (CCs this one reads from or writes to) as adjacent nodes
- Arrows labeled with what flows (e.g. "CB_PIPELINE" between Marketing → Sales)
- Greyed-out nodes for CCs that *would* be neighbors once Phase 4 ships

Below the mini-diagram, a list:

- **Reads from:** [list of cross-CC reads, with target CC + store key + status]
- **Writes for:** [list of stores other CCs read from this CC]
- **Hub-ready:** [list of stores this CC declares as available for FOSM·LIVE
  hub sync — relevant in Phase 4]

**Render contract:** SVG mini-diagram (polished, scalable, print-clean — same
visual language used in the cross-ecosystem view). Max 5 neighbors visible at
once. If a CC has more than 5 connections, "see all in ecosystem map →" link
to `/system-map/`'s ecosystem view (deep-linked via query string — see
"You-are-here indicator" below).

### View 4 · Backup

**Export/Import all this CC's `fosm_*_v1` localStorage keys.**

Identical UX across all CCs. Marketing CC's existing implementation is the
reference — adopt it as-is for new CCs.

Required behaviors:
- **Export all** — bundles every `fosm_*_v1` key this CC owns into one JSON,
  downloads as `fosm_<cc-slug>_backup_<YYYY-MM-DD>.json`
- **Import all** — accepts JSON, previews counts before applying, requires
  explicit confirmation, applies via canonical store helpers (never raw
  localStorage writes)
- **Last backup tracking** — `fosm_backup_last_at_v1` stores ISO timestamp of
  most recent export
- **Overdue warning** — sidebar nav shows ⚠ badge when last backup > 7 days ago
- **Master backup** — *not in v1*. Phase 1.x ships per-CC only.

**Render contract:** identical to Marketing CC's current implementation. Single
column. Export button on top, import below, list of stores being managed
displayed inline.

### View 5 · Diagnostics

**Self-tests for the canonical store wiring.**

Sales CC's pattern is the reference. Every CC declares a list of test cases
that walk through its in-CC operations:

- Click each `+Add` button, verify entry appears in canonical store
- Click each `Delete` button, verify entry removed from canonical store
- Each test reports pass/fail inline with the entry ID created/deleted

**Cross-CC tests deferred to v1.1.** Cross-CC read tests (verifying e.g. that
Sales CC can see Marketing CC's pipeline data) require a "test mode" flag to
isolate test runs from real operator data. Building that isolation properly
is its own piece of work. Ship v1 with in-CC tests only; add cross-CC tests
in v1.1 once the test mode infrastructure is designed.

**Render contract:** vertical list of named tests. Each test has a "Run" button.
Pass = green checkmark + ID confirmation. Fail = red X + error message + link
to the failing line of code.

---

## The Schema — what every CC must declare

The contract is enforced by a single JavaScript object that lives in every CC's
`index.html`. The shared System Map renderer reads this object and produces the
five views automatically.

```javascript
window.SYSTEM_MAP_DECLARATION = {
  identity: {
    name: "Marketing CC",
    slug: "marketing-cc",
    version: "0.7.5",
    status: "live",
    tagline: "Campaign factory + attribution engine",
    serves: "Operators producing content for thought-leader brands",
    owner: "Learn And Grow Rich",
    pillar: "M",
    distribution: "discretionary",
  },

  pages: [
    {
      id: "mod-cb",
      name: "Campaign Builder",
      status: "live",
      reads: ["fosm_icp_library_v1", "fosm_offer_library_v1", "fosm_brand_library_v1"],
      writes: ["fosm_cc_pipeline_v1"],
      cross_cc: false,
    },
    // ... every page in this CC
  ],

  stores: [
    {
      key: "fosm_cc_pipeline_v1",
      owner: "mod-cb",
      consumers: ["mod-cal", "mod-attr", "mod-sh"],
      cross_cc: true,  // Sales CC reads this
    },
    // ... every store this CC owns
  ],

  connections: {
    reads_from: [
      // empty for Marketing CC — it's a top-of-funnel
    ],
    writes_for: [
      { target_cc: "sales-cc", store: "fosm_cc_pipeline_v1", purpose: "Pipeline handoff" },
    ],
    hub_ready: [
      // stores this CC will offer to the FOSM·LIVE hub in Phase 4
      "fosm_cc_pipeline_v1",
      "fosm_attribution_v1",
    ],
  },

  diagnostics: [
    {
      id: "test-icp-add",
      name: "+Add ICP creates canonical entry",
      run: () => { /* test logic here */ },
    },
    // ... every test
  ],
};
```

Each CC fills in its own data. The renderer doesn't care what the data IS —
it just cares that the schema is honored.

---

## Implementation Plan

### Phase 1 · The shared module (Saturday morning)

Two files at the repo root that every CC includes:

```
/system-map-shared/
  ├── system-map.js     ← renderer that reads window.SYSTEM_MAP_DECLARATION
  └── system-map.css    ← visual styles (matches existing dark theme)
```

Each CC includes via:

```html
<link rel="stylesheet" href="/system-map-shared/system-map.css">
<script src="/system-map-shared/system-map.js" defer></script>
```

The renderer mounts itself wherever the CC has a `<div id="system-map-mount"></div>`
on its System Map page.

**Why two shared files instead of inlining:** updates propagate to all 9 CCs
with one commit. No need to edit every CC's `index.html` when the renderer
improves.

### Phase 2 · Roll out to existing CCs (Saturday afternoon)

For each of the 6 live CCs (Marketing, Sales, FOSM·LIVE, Vision, Personal,
System Map):

1. Read the existing System Map module
2. Extract its data into `window.SYSTEM_MAP_DECLARATION`
3. Replace the module's render code with `<div id="system-map-mount"></div>` + the shared script include
4. Verify all five views render correctly with the CC's data
5. Confirm Backup still works (this is the highest-stakes view — operators have data here)
6. Commit
7. Move to next CC

**Order of rollout** (lowest-stakes to highest-stakes, so we learn before we
touch anything operators depend on):

1. Vision CC (newest, no operator data yet)
2. FOSM·LIVE Personal (data exists but it's yours, not a client's)
3. System Map (no operator data, just a wireframe)
4. FOSM·LIVE CC (data exists but resettable from V3 personalization)
5. Sales CC (operator data — your prospects)
6. Marketing CC (operator data — your ICPs, offers, longforms, etc.)

### Phase 3 · The cross-ecosystem view (Saturday evening or Sunday)

Inside `/system-map/` (the existing CC), add a new top-level view: **Ecosystem**.

This is the bird's-eye picture: every CC visible as a node, connections drawn,
status indicators on each, "you are here" highlight (when accessed from
inside another CC's "see full ecosystem map →" link).

Two display modes:

- **Default** — dark theme, technical, matches everything else (background `#0d0d0d`, IBM Plex fonts, orange accent, technical labels visible including localStorage key names)

- **Presentation mode** — toggle in top-right, switches three things simultaneously:
  1. **Background lightens** from `#0d0d0d` to `#fafafa` (better for projectors and screen-shares with people who haven't seen dark UI before)
  2. **Technical labels hide** — localStorage key names disappear, replaced by descriptive labels (e.g. "Pipeline data" instead of `fosm_cc_pipeline_v1`)
  3. **Fonts get larger** — 14px → 18px base, easier to read from across a conference room

  Structure stays the same (boxes, arrows, connections) so toggling doesn't
  disorient the operator — it just dresses up the same picture for a
  different audience.

The Ecosystem view reads from a master registry:

```javascript
const ECOSYSTEM_REGISTRY = [
  { slug: "system-map", name: "System Map", pillar: "meta", status: "live" },
  { slug: "fosm-live-cc", name: "FOSM·LIVE CC", pillar: "hub-business", status: "live" },
  { slug: "fosm-live-personal", name: "FOSM·LIVE Personal", pillar: "hub-personal", status: "live" },
  { slug: "marketing-cc", name: "Marketing CC", pillar: "M", status: "live" },
  { slug: "sales-cc", name: "Sales CC", pillar: "S", status: "live" },
  { slug: "vision-cc", name: "Vision CC", pillar: "V", status: "live" },
  { slug: "operations-cc", name: "Operations CC", pillar: "O", status: "planned" },
  { slug: "leadership-cc", name: "Leadership CC", pillar: "L", status: "planned" },
  { slug: "integrity-cc", name: "Integrity CC", pillar: "I", status: "planned" },
  { slug: "emotional-intelligence-cc", name: "Emotional Intelligence CC", pillar: "E", status: "planned" },
];
```

Every CC's mini-diagram (View 3) reads from the same registry to ensure
consistency. Add a CC to the registry once — appears everywhere.

---

## The Hub Topology · Phase 4 forward-looking contract

The current architecture is **same-origin localStorage with peer-to-peer reads**
(Sales CC reads Marketing CC's pipeline directly).

The future architecture is **hub-and-spoke through FOSM·LIVE CC**. This spec
captures both because we want to spec the destination even though we can't
build it tonight.

### How it works in Phase 4

```
            Each expansion CC connects to FOSM·LIVE CC.
            Connection is opt-in, per-relationship, reversible.

  Marketing CC ─┐
                ├─→ FOSM·LIVE CC (the hub) ─→ Other connected CCs
  Sales CC    ──┤
                │
  Vision CC   ──┤
                │
  Future CCs  ──┘
```

When Marketing CC connects to FOSM·LIVE CC:
- Marketing CC's `hub_ready` stores get pushed to FOSM·LIVE CC's data layer
- Other connected CCs (Sales, Vision, etc.) can read Marketing CC's data
  *via FOSM·LIVE CC*, not directly
- Disconnection stops the sync but doesn't lose either side's data

### Why hub-and-spoke (not peer-to-peer)

Peer-to-peer is what we have today. It works for 2-3 CCs but doesn't scale —
every new CC has to be aware of every other CC. That's `n²` coupling.

Hub-and-spoke is `n` coupling. Every new CC connects to one place (the hub).
The hub handles routing.

### What this changes for tonight

**Nothing in the code.** We continue using same-origin localStorage. The spec
just declares `connections.hub_ready` as a forward-looking field — every CC
declares which of its stores it intends to expose to the hub when Phase 4
ships. We don't have to use those declarations yet, but having them recorded
means Phase 4's migration is mechanical rather than design-from-scratch.

### When does Phase 4 happen?

Not soon, and not tonight. Phase 4 requires a backend (Postgres or Supabase)
which is its own project. The trigger is when the localStorage approach starts
hurting more than it helps:

- Operator data exceeds browser storage limits (~10MB per origin)
- Multiple devices need to read the same data
- Multiple operators need to write to the same data (multi-tenant Executive CC)

When any of those become real, Phase 4 starts. Until then, the contract
above is enough.

---

## Migration Path · today → Phase 4

The three-step migration looks like this:

**Step 1 (today, complete):** Same-origin localStorage. Every CC owns its own
stores. Cross-CC reads are direct.

**Step 2 (Phase 1.x, the spec rollout):** Add `SYSTEM_MAP_DECLARATION` to every
CC. Cross-CC reads still direct, but the declarations document them. The
shared System Map renderer makes the declarations visible to operators.

**Step 3 (Phase 4, future):** Replace direct cross-CC reads with hub queries.
The schema doesn't change — the wire transport does. Same `fosm_*_v1` key
contracts; data just lives in Postgres instead of (or in addition to)
localStorage.

The reason this works: the schema is the same end-to-end. localStorage is
just a key-value store. Postgres is also a key-value store (with more
guarantees). Migration is mechanical because the contract was honored from
day one.

---

## Locked Decisions

Five decisions that were on the table during the spec sprint, now resolved
and folded into the spec body above. Recorded here so the reasoning is
preserved for future reference.

### 1 · Diagnostic test depth

**Decision:** v1 ships with in-CC tests only (verify +Add and Delete work
against canonical stores). Cross-CC read tests deferred to v1.1.

**Reason:** Cross-CC tests need a "test mode" flag to isolate test runs from
real operator data, and building that isolation properly is its own piece of
work. Defer to avoid polluting real localStorage with test entries.

### 2 · Diagram aesthetics — SVG everywhere

**Decision:** All diagrams are SVG from v1. No ASCII intermediate.

**Reason:** The diagrams do double-duty as marketing material (sales calls,
prospect demos, screen-shares, printed handouts). The polish is worth the
extra build effort. Consistency between in-CC mini-diagrams and the
cross-ecosystem view is also valuable — operators learn one visual language,
not two.

### 3 · Presentation mode toggle behavior

**Decision:** Three simultaneous changes when toggled:
1. Background `#0d0d0d` → `#fafafa`
2. Technical labels (localStorage key names) hide, replaced by descriptive labels
3. Base font 14px → 18px

Structure (boxes, arrows, connections) stays identical so toggling doesn't
disorient.

**Reason:** Minimum changes that turn a developer-facing tool into an
audience-facing one without rebuilding twice.

### 4 · Rollback story

**Decision:** Git revert is the primary recovery path. No fallback flag.

**Reason:** Building a fallback flag (option to use legacy System Map if
shared module fails) doubles the maintenance burden — every change has to
be tested in both modes. The benefit doesn't justify it for a one-person
shop. Safety is provided instead by the rollout order: lowest-stakes CC
first (Vision), highest-stakes last (Marketing). By the time we touch
Marketing CC's data, the shared module has been validated in 5 other CCs.

### 5 · "You are here" indicator

**Decision:** Query string parameter — `?from=<cc-slug>`.

**Reason:** Referrer headers are unreliable (browsers strip them in some
configurations, they break for bookmarked URLs). Query string is explicit,
predictable, debuggable, and bonus: enables deep-linking. Onboarding emails
can include URLs like `/system-map/?from=marketing-cc` to land users on the
ecosystem view focused on a specific CC.

---

## What this spec is and isn't

**It is:** the contract every CC must honor. The shared schema. The five-view
guarantee. The hub topology direction-of-travel. The vocabulary the team uses
when discussing System Map work.

**It isn't:** code. There is no JavaScript file in this spec, no CSS, no HTML
templates. The implementation comes Saturday. This document is the
*specification* the implementation will be tested against.

**It is:** version-controlled. This file lives at `docs/system-map-spec.md`
in the repo. Every change to the contract is a commit, with a reason.

**It isn't:** a one-time document. The spec evolves as we learn. Version 1.1
when implementation reveals something the spec missed. Version 2.0 when Phase
4 lands. Version 3.0 when something we haven't thought of forces a rewrite.
The discipline is that *the spec leads the code*, never the other way around.

---

## Last updated

2026-05-08 by Zach Oehlman + Claude. Late-night spec sprint. All design
decisions locked. Implementation begins Saturday morning.

— Cheers and have a blessed day.
