# The Brain · Prompt Library · Design Note

**Status:** v0.2 · context capture with read-through upgrades · NOT yet a spec
**Date:** 2026-05-08
**Next:** Full spec drafted Saturday morning at `docs/brain-spec.md`

This is a bridge document. It captures tonight's design conversation about
the prompt library so tomorrow morning's spec sprint doesn't have to
reconstruct context from memory. v0.1 captured the initial design sprint;
v0.2 incorporates upgrades from a structured end-to-end read-through with
Zach. Every decision recorded here is **locked** and serves as the foundation
for the full spec.

---

## The vision · what the brain is

> "The prompts aren't documentation. They aren't templates. They aren't
> tooling. They're me. Captured, formalized, made replicable. Every audit
> prompt is me doing an audit. Every voice prompt is me speaking."

**FOSM·LIVE CC is the product Zach sells to clients today.** It incorporates
Finance (via QuickBooks/Stripe integration) and serves as the dashboard the
client sees and operates.

**The expansion CCs (Marketing, Sales, Operations, Leadership, Integrity,
Vision, Emotional Intelligence) are internal tools.** Zach and his team use
these to do the work that ultimately produces results inside the client's
FOSM·LIVE CC dashboard. The client doesn't operate Marketing CC themselves —
they see the *work product* of Marketing CC's prompts flowing into their
dashboard.

**The prompts inside the expansion CCs encode Zach's thinking.** That
thinking is what clients are ultimately paying for, even though they never
operate those CCs directly. The prompts are the product; the expansion CCs
are the workshop where Zach uses them to serve clients.

*Future state may include selling expansion CCs as standalone products
("buy Marketing CC for your in-house marketing team"), but that's not the
v1 model. Spec for the brain must serve the current model first; future
sellable-CC scenarios are forward-looking concerns.*

Implications:
- Prompt versioning matters more than CC versioning (an old version of a
  CC's UI is fine; an old version of an audit prompt could give a client
  wrong analysis embedded in their dashboard)
- The prompt library is the moat — even if competitors reverse-engineer the
  FOSM·LIVE CC dashboard a client sees, they can't replicate the expansion
  CCs and their prompts that produce the dashboard's content
- Prompts deserve more infrastructure care than the CCs themselves

---

## Three properties the brain must have

**1 · Single source of truth.** All prompts live in one place. CCs pull from
that place at runtime rather than hardcoding inline. Update once, every CC
sees the new version on next fetch.

**2 · Upstream/downstream impact tracking.** When a prompt is edited, the
system surfaces:
- Which prompts feed into this one (upstream — review whether their changes
  affected this one's logic)
- Which prompts depend on this one (downstream — they may need updates too)

This metadata lives in YAML frontmatter on each prompt file:
```yaml
---
prompt_id: audit-master-v1
depends_on: [brand-voice, fosm-framework, icp-reference]
feeds_into: [audit-summary, audit-recommendations]
---
```

A graph tool walks these declarations to surface impact before any change
ships.

**3 · Live access from running CCs.** Not "edit prompt, redeploy CCs." CCs
*fetch* prompts at runtime from the brain. Updating a prompt requires no
code change in any CC — behavior changes on next fetch.

Network access required for CC operation is acceptable. Offline operation is
NOT a v1 requirement.

---

## Locked Decisions

### Privacy model

**Locked: Private IP, proprietary to Learn And Grow Rich.**

The prompts encode Zach's thinking. They are the IP that drives the entire
LGR ecosystem. Public exposure would compromise the moat. Architecture must
honor this from day one.

### Storage location

**Locked: Separate private GitHub repo.**

Working name: `zoehlman/fosm-brain-private` (final name decided tomorrow).

Rationale:
- Native git versioning — every prompt change is a commit, which IS the
  audit trail
- Free for private repos at this scale
- Familiar workflow (Zach is now comfortable in GitHub)
- AI tools (Claude Code, etc.) can read/write to it the same way as the
  public repo
- Netlify Functions can fetch from it using a GitHub Personal Access Token
  stored as an env var
- Easy to add collaborators in the future (when the team grows)

### Access pattern

**Locked: Gated API endpoint.**

CCs will fetch prompts via a Netlify Function that:
1. Authenticates the request (mechanism TBD in spec — likely a shared secret
   embedded in the CC bundle plus origin-pinning)
2. Reads the requested prompt from the private GitHub repo using a GitHub
   PAT
3. Returns the prompt content (with version metadata) to the CC

Public raw URLs are explicitly rejected — the prompts must never be readable
by anyone outside the auth boundary.

### Versioning model

**Locked: Pinned versioning with full history retention.**

Every prompt run records which version was used. Old prompts never delete —
they get superseded. When re-running:
- Default: use the version active when the original output was generated
  ("reproduce my Tuesday audit exactly as it was")
- Optional: explicitly use the latest version ("re-audit me with my updated
  thinking")

Side-by-side diff comparison ("what changed when I went from v1.0 to v1.1?")
is a first-class feature, not a power-user fallback.

**Why this matters:** clients asking "why is my new audit different from my
old one?" can be answered with a prompt diff. That's transparency that
builds trust. It's also how Zach himself answers "what's the impact of this
new idea / new law / new framework I just adopted?"

Implementation note: until a real database (Supabase or similar) lands in
Phase 4, version history lives in git itself. Each prompt file has a
versioned filename pattern (`audit-master-v1.0.md`, `audit-master-v1.1.md`,
etc.) AND the latest version is also accessible via a stable alias
(`audit-master-latest.md` symlink or routing convention). The exact pattern
is decided in the spec tomorrow.

### Approval protocol — heavy

**Locked: Heavy protocol — formal pull requests on GitHub.**

Every prompt change goes through:
1. AI (Claude) drafts the change as a pull request
2. PR template required — must include:
   - **Which prompt** is being changed
   - **What** is changing (the diff itself)
   - **Why** the change is being made
   - **Upstream impact** — which prompts feed into this one and might need review
   - **Downstream impact** — which prompts depend on this one and might need review
3. Zach reviews in GitHub's diff view
4. Zach merges or rejects
5. Merge = approved = live

No prompt change ships without an approved PR. No exceptions.

The 60-second-per-change overhead is the price of the audit trail. Worth it
for IP that defines the brand.

### Edit access — Zach + Claude only

**Locked: Read access for the running CCs (via the gated API). Write access
for Zach (manual edits) and Claude (PR drafts that Zach approves).**

No client-side editing in v1. Future Phase 4 may introduce client overrides
(e.g., a paid client provides their own brand voice that overrides the
default) but that's explicitly out of scope for the brain spec v1.

---

## Coexistence with existing patterns

The brain doesn't replace what works today. It layers on top.

**Pattern A · Hardcoded prompts in `index.html`** — preserved as-is. CCs
continue to work with their inline prompts during the transition. This means
you can keep doing real client work tomorrow while we build the brain.

**Pattern B · localStorage prompt templates** (Sales CC's Prompt Workshop) —
preserved as-is. Operators continue to edit local copies; their edits persist
in their browser.

**Pattern C · Brain-fetched prompts** (this spec) — built in parallel, not
hooked up to CCs until complete. When ready, each CC migrates from A and B
to C deliberately, one at a time, in the same order as the System Map
rollout (lowest-stakes first).

**Migration is voluntary, not forced.** A CC can stay on A or B indefinitely
if there's no reason to upgrade. The brain is opt-in, per-CC, per-prompt.

---

## Open questions for tomorrow's spec

These are the architectural decisions that need real thought tomorrow before
the spec can be drafted. Question 1 (folder taxonomy) was resolved during
the read-through and is captured here for reference. Questions 2–5 require
fresh-head thinking tomorrow morning.

### 1 · Folder taxonomy — RESOLVED in read-through

**Decision: organize by Command Center, with a `shared/` folder for
cross-cutting prompts.** The folder structure mirrors the actual usage —
when working on Marketing CC, Marketing CC's prompts are in
`marketing-cc/`. No abstract category-hunting.

```
fosm-brain-private/
├── README.md                      ← brain purpose, structure, rules
├── shared/                        ← prompts used by MORE than one CC
│   ├── voice/                     ← brand voice rules per brand (used everywhere)
│   ├── framework/                 ← F.O.S.M., L.I.V.E., 12 Domains (multi-CC)
│   ├── icp/                       ← ICP analysis (used by Marketing + Sales + others)
│   └── meta/                      ← prompts about prompts (the audit auditor)
├── fosm-live-cc/                  ← prompts where the OUTPUT is FOSM·LIVE CC content
│   ├── audit/                     ← audit prompts producing audit results in dashboards
│   ├── client-demo-with-data/     ← personalized demos when prospect data exists
│   ├── client-demo-without-data/  ← fictional demos when no prospect data yet
│   └── ...
├── fosm-live-personal/            ← prompts where the OUTPUT is FOSM·LIVE Personal content
│   └── ...
├── marketing-cc/                  ← prompts where the OUTPUT is Marketing CC content
│   ├── campaign-builder/
│   ├── longform-studio/
│   └── ...
├── sales-cc/                      ← prompts where the OUTPUT is Sales CC content
│   ├── audit-intake/
│   ├── pipeline-prompts/
│   └── ...
├── vision-cc/                     ← prompts where the OUTPUT is Vision CC content
│   └── ...
└── (future CCs as they're built — operations-cc/, leadership-cc/, etc.)
```

**The organizing principle: "Where does the work product live? That's where
the prompt lives."**

If a prompt produces output that ends up in FOSM·LIVE CC dashboards (e.g.,
audit results, demo dashboards), it lives in `fosm-live-cc/` — even if Sales
CC operators are the ones who *trigger* the prompt during sales calls. The
output is FOSM·LIVE CC content, so the prompt belongs there.

If a prompt is genuinely cross-cutting — used by multiple CCs to produce
different outputs — it lives in `shared/`. Brand voice rules apply to every
CC's content. F.O.S.M. framework definitions apply to multiple CCs. These
are `shared/`.

**This is the "single source of truth, references everywhere" principle in
action.** The voice rules live in ONE place (`shared/voice/`). Marketing CC,
Sales CC, FOSM·LIVE CC all reference the same source. Update once, every CC
sees the new version on next fetch.

**Per-client custom prompts (deferred decision):** the `client/` folder from
the original taxonomy is deferred to tomorrow's spec sprint. Question to
resolve: do per-client prompt overrides live inside the brain (e.g.,
`fosm-live-cc/clients/<client-id>/voice-override.md`) or in the existing
Drive-mode pattern? The Drive option keeps client data separate from your
master IP. The brain option keeps everything version-controlled. Real
tradeoff. Worth deciding tomorrow when designing the client-override flow.

**This taxonomy is a Zach decision from the read-through:** initial draft
proposed organizing by prompt type (voice/framework/audit/icp/content/meta).
Zach refactored it to organize by Command Center based on how prompts are
actually used in practice — making lookup intuitive ("where's the
campaign-builder prompt? marketing-cc/campaign-builder/, obviously") and
making cross-cutting prompts explicit (`shared/`).

### 2 · The auth mechanism for the gated endpoint

Two reasonable options:
- **Shared secret + origin pinning:** the CC bundle embeds a token, the
  endpoint validates the token AND that the request originated from
  `fosmlive.netlify.app`. Simple, fast.
- **Per-session token:** the operator signs in once, gets a token, the CC
  uses it for the session. More secure, more complex, requires login UI.

v1 likely shared secret + origin pinning. v2 may upgrade.

### 3 · The PR template format — DIRECTION SET in read-through

**Direction: structured form with required fields, more-rather-than-less.**

The PR template is the form that gets filled out on every prompt change for
the next several years. Designed thoughtfully, it *enforces* the heavy
protocol automatically. Designed poorly, it becomes a checkbox-tick exercise
that loses meaning.

**Zach's guidance during read-through:** *"My suggestion is we make it more
than less, because we can always trim it down. It's better to have more
information there than less."*

**Candidate structured fields** (refined and finalized in tomorrow's spec):

- **Prompt being changed** — dropdown of all prompt files (auto-populated)
- **Type of change** — refinement / bug fix / new framework / voice update / IP update / new prompt
- **What's changing** — auto-populated diff view (GitHub native)
- **Why** — required free-text justification, max 500 chars
- **Upstream prompts that may need review** — auto-populated from `depends_on` metadata
- **Downstream prompts that may need review** — auto-populated from `feeds_into` metadata
- **Estimated impact** — low / medium / high (signals how carefully Zach should review)
- **Test confirmation** — checkbox: "I have tested this prompt at least once before submitting"
- **Reviewer notes** — optional free-text for context Zach should know

**Why required fields matter:** GitHub PR templates can mark fields as
required-before-submission. This prevents a hurried "looks fine, merge"
moment from skipping the upstream/downstream check. Friction is a feature
here, not a bug.

**Tomorrow's spec will:** finalize the exact field list, write the
markdown template file, document the workflow.

### 4 · The fetch-and-cache pattern — RESOLVED in read-through

**Decision: cache for 5–15 minutes, with a "Force refresh prompts" button
visible in each CC's settings.**

When a CC fetches a prompt, the response is cached in localStorage with a
timestamp. Subsequent requests within the cache window return the cached
copy. Requests after the window expire fetch fresh from the brain.

**Why this balance:**
- *Always-fetch* (no cache) — every operation takes an extra network hop.
  Annoying. Adds latency on every prompt-using interaction.
- *Cache forever* — operators get prompt updates only when they manually
  refresh. They forget. Stale prompts run for weeks unnoticed.
- *Cache 5–15 minutes* — operations feel instant. Maximum staleness window
  is short. Operator can manually trigger immediate refresh when they know
  Zach just pushed a change.

**The manual refresh button:** prominent enough to find when needed, not so
prominent it gets clicked accidentally. Probably under each CC's Settings
or Resources nav, labeled something like "🔄 Refresh prompt cache."

**Open implementation questions** (resolved in spec tomorrow):
- Exact cache duration — 5? 10? 15 minutes? Probably operator-configurable.
- Cache invalidation strategy — does updating a prompt in the brain push
  invalidation events to active CCs, or do we rely purely on time-based
  expiration? Push invalidation requires WebSockets or polling; time-based
  is simpler.
- Per-prompt cache override — some prompts (e.g., voice rules) might have
  longer caches because they change rarely. Some (e.g., active campaign
  prompts) might want shorter caches.

### 5 · The migration sequence — RESOLVED in read-through

**Decision: per-CC two-step migration, in same order as System Map rollout
(lowest-stakes first).**

For each CC, two steps:

**Step 1 · Prompt audit.** Read every prompt currently inside that CC's
`index.html` and `localStorage` templates. Sort each prompt into one of two
buckets:

- **Brain-worthy** — IP-grade thinking. Voice rules, audit logic, ICP
  analysis, framework applications, content generation prompts. These move
  to the brain.
- **CC-local** — UI labels, dropdown options, tooltips, error messages,
  plumbing strings. These stay hardcoded in the CC. They're "prompts" in the
  technical sense but not part of your IP.

The audit step is judgment-heavy. Worth doing carefully, one CC at a time.

**Step 2 · Migration.** For each brain-worthy prompt, replace the inline
version in the CC with a `brain.fetch(prompt-id)` call. Verify behavior is
unchanged. Commit. Move to the next prompt.

**Per-CC order** (same as System Map rollout — lowest-stakes first so we
learn before touching operator data):

1. Vision CC (newest, no operator data yet)
2. FOSM·LIVE Personal (data exists but it's Zach's, not a client's)
3. System Map (no operator data, just a wireframe — minimal prompts to migrate)
4. FOSM·LIVE CC (data exists but resettable)
5. Sales CC (operator data — prospects)
6. Marketing CC (operator data — ICPs, offers, longforms — most prompts)

**Why two-step per CC, not all-audit-first:** doing per-CC lets us learn.
We audit Marketing CC first, decide which prompts are brain-worthy, migrate
them, observe how the brain handles real load. Then we audit Sales CC with
that experience informing better judgment calls. Auditing all CCs up-front
might lock us into folder taxonomies we'd revise after seeing real usage.

**Cadence:** Phase 4 of the build (this migration) spreads across days/weeks
without urgency. As Zach naturally uses each CC for real work, prompts get
audited and migrated organically.

---

## What's NOT in scope for v1

To keep the spec from sprawling:

- **Multi-tenant client overrides.** Phase 4 territory.
- **A/B testing of prompts.** Future feature, not v1.
- **Prompt analytics** ("which prompt got used most this week?"). Future.
- **Automated prompt evaluation** (does this prompt actually do what it's
  supposed to?). Real engineering project on its own.
- **Real-time collaborative editing.** Locked to Zach + Claude only in v1.
- **Per-prompt access control.** Either you have access to the brain or you
  don't. Granular access is Phase 4.
- **Client-side prompt editing UI.** Future scenario where a paid FOSM·LIVE
  CC operator could tweak prompts through a UI rather than asking Zach.
  Phase 4 multi-tenant work.
- **Future trusted team-member write access.** When LGR grows beyond Zach,
  trusted team members may need write access to specific prompt categories.
  v1 keeps it Zach + Claude only; revisit when the team grows.

---

## Build order (placeholder — refined in tomorrow's spec)

**Phase 1 · Brain repo creation** (Saturday morning, ~30 min)
- Create `zoehlman/fosm-brain-private`
- Set up folder taxonomy
- Write the README explaining the brain's purpose, structure, and rules
- Migrate first set of prompts manually (the audit prompts Zach mentioned tonight)
- Establish the PR template

**Phase 2 · The gated endpoint** (Saturday afternoon, ~2 hours)
- Build `/api/brain/<prompt-id>` Netlify Function
- Auth via shared secret + origin pinning
- Reads from private repo using GitHub PAT
- Returns prompt content with version metadata
- Test from Postman / curl before any CC integration

**Phase 3 · First CC integration** (Sunday morning, ~1 hour)
- Pick lowest-stakes CC (likely Vision CC)
- Migrate ONE prompt from hardcoded to brain-fetched
- Verify behavior unchanged
- Ship

**Phase 4 · Roll out across all CCs** (Sunday afternoon + following week, as needed)
- Same order as System Map rollout
- Per-CC, per-prompt, deliberate
- No forced migration

Phases 1 and 2 are the blocking work. Phase 3+ is incremental and can spread
across days/weeks without urgency.

---

## What this note is and isn't

**It is:**
- A snapshot of tonight's design conversation
- The locked decisions ready to drop into a real spec
- The open questions tomorrow's spec must answer
- A bridge between exhausted-Friday-night-Zach and rested-Saturday-morning-Zach

**It isn't:**
- A spec
- A build plan
- Code
- A contract any CC must honor

The real spec lives at `docs/brain-spec.md` and gets drafted Saturday morning
based on this note plus a fresh design pass.

---

## Last updated

2026-05-08 by Zach Oehlman + Claude. v0.1 captured during initial late-night
design sprint. v0.2 incorporates upgrades from a structured end-to-end
read-through:

- Folder taxonomy resolved — CC-organized with `shared/` for cross-cutting
  prompts (Zach's design)
- Demo prompts go under `fosm-live-cc/` (organize by output, not function)
- PR template direction set — structured form with required fields,
  more-rather-than-less
- Fetch-and-cache resolved — 5–15 minute cache with manual refresh button
- Migration sequence resolved — per-CC two-step (audit, then migrate), in
  System Map rollout order
- Out-of-scope list expanded with client-side editing UI and future team
  member write access

The vision is locked. The architecture is sketched. Three of five open
questions are now resolved. Two remain (auth mechanism, exact cache
durations) for tomorrow's spec sprint. The full spec (`docs/brain-spec.md`)
lands Saturday.

— Cheers and have a blessed day.
