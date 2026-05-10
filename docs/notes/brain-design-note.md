# The Brain · Prompt Library · Design Note

**Status:** v0.5 · spec drafted, locked, and Phase 1 of build complete · this note is now historical
**Date:** 2026-05-09
**Successor:** [`docs/brain-spec.md`](brain-spec.md) v1.0 — the canonical contract

This note's purpose is now historical. v0.1-v0.3 captured the design
conversation that produced the spec. v0.4 marked the spec lock. v0.5
marks **Phase 1 build completion** — the brain repo exists at
`learn-and-grow-rich/fosm-brain-private` with branch protection enforcing,
PR template auto-loading, and the first canonical prompt
(`shared/voice/lgr-master/v1.0.0.md`) merged via PR #1. **For all questions
about brain architecture, refer to `docs/brain-spec.md`.** This note is
preserved so future readers can see the *evolution* of the design — how
decisions were made, what was considered, what was deferred.

This is a bridge document. It captures tonight's design conversation about
the prompt library so the spec sprint doesn't have to reconstruct context
from memory. v0.1 captured the initial design sprint; v0.2 incorporated
upgrades from a structured end-to-end read-through; v0.3 resolves the final
two architectural questions (auth mechanism, cache specifics). All five
original open questions are now resolved. Every decision recorded here is
**locked** and serves as the foundation for the full spec.

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

Working name became final: `learn-and-grow-rich/fosm-brain-private` (created
under the Team-plan org for branch protection enforcement).

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

## Open questions for the spec — ALL RESOLVED in read-through

All five original architectural questions were resolved during the structured
read-through. The full spec (`docs/brain-spec.md`) translates these locked
decisions into implementation contracts. Each question's resolution is
captured below for reference, with reasoning preserved.

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
└── (future CCs as they're built — operations-cc/, leadership-cc/, integrity-cc/,
    emotional-intelligence-cc/, security-cc/, audit-cc/)
```

**Future CC folders (planned, not yet created):**

- `operations-cc/` — Operations CC prompts
- `leadership-cc/` — Leadership CC prompts
- `integrity-cc/` — Integrity CC prompts
- `emotional-intelligence-cc/` — Emotional Intelligence CC prompts
- `security-cc/` — Security CC prompts (third-party-style security/cybersecurity audit team)
- `audit-cc/` — Audit CC prompts (third-party-style integrity auditor team)

The Security CC and Audit CC are **meta-CCs** — they don't deliver work in
any one F·O·S·M·L·I·V·E pillar; they protect and verify *all* of them. Their
brain folders contain prompts for security review (penetration testing,
threat modeling, defense-in-depth analysis) and integrity auditing (prompt
accuracy, voice alignment, math verification, output traceability).

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

### 2 · The auth mechanism for the gated endpoint — RESOLVED in read-through

**Decision: Per-session token authentication via Auth0.**

Every request to the brain endpoint requires a valid, non-expired session
token. Tokens are issued by Auth0 after successful login. The brain endpoint
validates tokens server-side before returning any prompt content.

**Why per-session token instead of shared secret:**

This is built for the team-future, not the solo-present. As Zach hires team
members, each will need their own credentials, their own audit trail, and
their own access scopes. Shared-secret architectures collapse the moment
you have more than one operator. Per-session token is the architecture
that scales without a rewrite.

**Why Auth0 specifically:**

- Industry-standard authentication infrastructure
- Free tier covers 7,500 active users (vastly more than needed)
- Handles login, MFA, password reset, social login — all the edge cases
- Stable, well-documented, used by major companies
- Battle-tested for security (which matters for IP-grade infrastructure)

**Architecture flow:**

```
1. Operator visits any CC at fosmlive.netlify.app/<cc-slug>/
2. CC checks for valid session token in cookie/storage
3. If missing/expired → redirect to Auth0 hosted login page
4. Operator logs in (email + password, possibly MFA)
5. Auth0 redirects back to fosmlive.netlify.app with auth code
6. CC exchanges auth code for session token via Netlify Function
7. Session token stored in httpOnly cookie (secure default)
8. Subsequent brain fetches include token in Authorization header
9. Brain endpoint validates token via Auth0, returns prompt if valid
10. Token expires after 8 hours (configurable); refresh logic extends sessions
```

**Edge cases handled:**

- **Token expired mid-session** → CC catches 401, prompts re-login, resumes
- **Sign-out** → invalidates token server-side immediately
- **Multiple devices** → each device gets its own token (independent sessions)
- **Compromised token** → operator can sign out of all sessions from Auth0 dashboard

**This is a Zach decision from the read-through:** initial spec recommended
shared secret + origin pinning (simpler, faster to build). Zach upgraded to
Option B reasoning *"there's going to be other people working in here, and
I want this to be audited, and I just really want to do it right."* The
right architecture for a team-future, even before the team exists.

**Build cost honesty:** This expands Phase 2 of the brain build from ~2
hours to ~5-6 hours. The Phase 2 work breaks down as:
- Auth0 account setup + tenant configuration
- Configure Auth0 application + scopes
- Build login flow (Auth0 hosted page + redirect)
- Build token validation in brain endpoint Netlify Function
- Wire CCs to handle login/token/refresh
- End-to-end testing

This cost is acknowledged and accepted. The right architecture justifies
the build effort.

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

**Decision: Cache for 10 minutes (default), with per-folder TTL overrides and
a "Force refresh prompts" button visible in each CC's settings.**

When a CC fetches a prompt, the response is cached in localStorage with a
timestamp. Subsequent requests within the cache window return the cached
copy. Requests after the window expire fetch fresh from the brain.

**Why this balance:**
- *Always-fetch* (no cache) — every operation pays a network round-trip.
  Annoying. Adds latency to every prompt-using interaction.
- *Cache forever* — operators get prompt updates only on manual refresh.
  Stale prompts run unnoticed for weeks.
- *Cache 10 minutes default* — operations feel instant during a work
  session. Maximum staleness window is 10 minutes. Operator can manually
  trigger immediate refresh when they know a prompt change just shipped.

**Per-folder TTL defaults** (cache durations vary by prompt category based
on how often that category changes):

| Folder | TTL | Reason |
|---|---|---|
| `shared/voice/` | 1 hour | Voice rules change rarely; voice updates should propagate within a session |
| `shared/framework/` | 1 hour | F.O.S.M., L.I.V.E., 12 Domains change rarely |
| `shared/icp/` | 30 minutes | ICP definitions change occasionally |
| `shared/meta/` | 1 hour | Prompts about prompts change rarely |
| `fosm-live-cc/*` | 10 minutes | High iteration during client work |
| `marketing-cc/*` | 10 minutes | High iteration during content production |
| `sales-cc/*` | 10 minutes | High iteration during pipeline work |
| `vision-cc/*` | 30 minutes | Lower iteration cadence |
| `fosm-live-personal/*` | 30 minutes | Lower iteration cadence |

These are starting numbers. Adjust after observation.

**Per-prompt overrides — v1.1.** v1 ships with per-folder defaults only
(simpler to reason about, covers 90% of cases). v1.1 adds per-prompt
override via YAML frontmatter:

```yaml
---
prompt_id: brand-voice-lgr
cache_ttl_minutes: 1440  # override: 24 hours
---
```

Defer until per-folder approach is proven in production.

**Cache invalidation strategy: time-based for v1, push invalidation deferred
to v2.**

When a prompt changes, active CCs find out via two mechanisms:
1. **Time-based expiration** — caches expire on their per-folder TTL
2. **Manual force refresh** — operator-initiated, "🔄 Refresh prompt cache"
   button in each CC's settings. Worst-case staleness is the cache TTL;
   operator can always force-update immediately.

**Push invalidation** (webhook-driven, real-time updates to active CCs)
deferred to v2 because: (a) real engineering project — WebSocket or polling
infrastructure; (b) the manual refresh button is the operator's escape
hatch and works fine for a single-operator phase; (c) when the team grows,
push invalidation becomes worth the engineering work.

**The manual refresh button** sits in each CC's Settings or Resources nav.
Prominent enough to find when needed; not so prominent it gets clicked
accidentally. Probably labeled "🔄 Refresh prompt cache" or similar. Triggers
a fresh fetch of all prompts this CC uses, ignoring cache.

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

**Phase 1 · Brain repo creation (~30-45 min)**
- Create `learn-and-grow-rich/fosm-brain-private` (Team-plan org repo)
- Set up CC-organized folder taxonomy (with `shared/` for cross-cutting prompts)
- Write the README explaining the brain's purpose, structure, and rules
- Migrate first set of prompts manually (the audit prompts mentioned tonight)
- Establish the PR template (markdown form, required structured fields)

**Phase 2 · The gated endpoint with full auth (~5-6 hours)**
- **Auth0 setup:** create tenant, configure application, identify scopes
- **Build login flow:** Auth0 hosted login page + redirect handler
- **Build `/api/brain/<prompt-id>` Netlify Function:** validates session
  token via Auth0, reads from private repo using GitHub PAT, returns prompt
  content with version metadata
- **Build token refresh logic:** 8-hour session lifetime with refresh
- **Build sign-out endpoint:** server-side token invalidation
- **Wire CCs to handle auth:** check for token on load, redirect to login
  if missing, handle 401 by re-prompting login, include token on brain
  requests
- **End-to-end testing:** login works, valid tokens succeed, expired tokens
  refresh, sign-out invalidates
- Test from Postman/curl AND from a real CC before any prompt migration

**Phase 3 · First CC integration (~1 hour)**
- Pick lowest-stakes CC (Vision CC, per System Map rollout order)
- Migrate ONE prompt from hardcoded to brain-fetched
- Verify behavior unchanged
- Verify auth flow works end-to-end (login → fetch → display)
- Ship

**Phase 4 · Roll out across all CCs (incremental)**
- Same order as System Map rollout
- Per-CC two-step (audit, then migrate)
- No forced migration — happens organically as CCs get touched for real work
- No fixed timeline — completes when complete

Phases 1 and 2 are the blocking work. Phase 3 validates the architecture
end-to-end. Phase 4 spreads across days/weeks without urgency, integrated
into normal client work.

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

2026-05-09 by Zach Oehlman + Claude.

- v0.1 captured during initial late-night design sprint (2026-05-08).
- v0.2 incorporated upgrades from a structured end-to-end read-through.
- v0.3 resolved the final two architectural questions (auth, cache).
- v0.4 marked the transition: spec drafted at `docs/brain-spec.md` v1.0.
- **v0.5 marks Phase 1 build completion** — repo at `learn-and-grow-rich/fosm-brain-private`,
  branch protection enforcing, PR template installed, first prompt
  (`shared/voice/lgr-master/v1.0.0.md`) merged via PR #1. All architectural
  decisions validated end-to-end through real implementation.

This note is now **historical**. The canonical contract for the brain
lives in [`brain-spec.md`](brain-spec.md). This note remains in the repo
so future readers can trace the *evolution* of the design.

— *Cheers and have a blessed day.*
