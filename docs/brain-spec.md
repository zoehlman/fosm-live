# Brain Spec · The Canonical Contract for Prompt Governance

**Version:** 1.0 · **Date:** 2026-05-09 · **Status:** Locked — translates Brain Design Note v0.3 into a buildable spec

This spec defines the **Brain Contract** that every Command Center in the
FOSM·LIVE ecosystem MUST honor when fetching, using, or proposing changes
to prompts. It is the single source of truth for how the brain is
structured, accessed, governed, and evolved.

> **Five foundational principles** that govern every architectural
> decision in this spec:
>
> 1. **The brain is the product, the CCs are delivery mechanisms.** What
>    LGR sells is the *thinking* encoded in prompts, not the JavaScript
>    that displays it. The brain houses the IP. The CCs render it.
>
> 2. **Same logic, same structure, different details.** Every CC honors
>    the same fetch contract, the same cache pattern, the same auth
>    flow. The prompts inside differ; the chrome is identical. (Inherited
>    from System Map Spec v1.1.)
>
> 3. **Spec leads code, never the other way around.** When implementation
>    reveals something the spec didn't account for, we stop, update the
>    spec, then build. (Inherited from System Map Spec v1.1.)
>
> 4. **Single source of truth, references everywhere.** Every prompt
>    appears in exactly one canonical place. CCs reference, never copy.
>    Updates propagate automatically. Drift is an error, not a feature.
>    (Inherited from System Map Spec v1.1.)
>
> 5. **Heavy approval, full audit.** Every prompt change is a formal
>    proposal with structured justification, reviewed by the operator,
>    merged with intent. The merge action IS the signature. The audit
>    trail is permanent.

---

## Why this spec exists

The CCs work today. AI features ship. Operators use them in real client
work. So why build a brain?

Three reasons that compound:

### 1 · Without a brain, prompts drift.

Today, prompts live inside `index.html` files (hardcoded) and inside
`localStorage` templates (Sales CC's Prompt Workshop). When Zach refines
the audit logic on a Tuesday call with a client, that refinement lives
in his head until the next time he edits Marketing CC's `index.html` —
maybe Wednesday, maybe never. Sales CC's audit prompt doesn't get the
update. FOSM·LIVE CC's audit prompt doesn't get the update. Three weeks
later, three CCs are running three slightly-different versions of the
same logic. Drift.

The brain is the lock against drift. One canonical version. Every CC
fetches it. Updates propagate.

### 2 · Without a brain, the IP is exposed.

The CCs are public (MIT licensed `fosm-live` repo). That's intentional —
the *value* isn't in the JavaScript. The value is in the prompts. But
the prompts currently live *inside* the JavaScript. A competitor can
clone the repo and have everything.

The brain moves the IP to a private repo with gated access. The public
CCs keep working — they just fetch the prompts they need from a server
that authenticates the request. Clone the public repo all you want; the
prompts come with you only if you have credentials.

### 3 · Without a brain, the audit trail is shallow.

Today, prompt changes are git commits to `index.html` files. The diff
shows what changed, but there's no structured record of *why* the change
was made, *what* it impacts upstream/downstream, or *which* prompt
version produced which output.

The brain encodes change as a formal proposal — a pull request with a
required structured template. Why → What → Impact → Test confirmation.
Every approved change is signed by Zach via the merge action. Every
prompt has a version. Every output records which version produced it.
The audit trail is legal-grade.

---

## The Vision · What the Brain Is

The brain is **the centralized, versioned, governed source of every prompt
that drives every AI feature across every Command Center.**

It is:
- **Centralized** — one private repo, not scattered across CC files
- **Versioned** — every change tracked in git, full history retained
- **Governed** — heavy PR approval protocol, no silent edits
- **Gated** — accessed via authenticated endpoint, not direct file reads
- **Cached** — fetched once per cache window, not on every operation
- **Structured** — folder taxonomy mirrors CC architecture
- **Forward-compatible** — designed to scale to multi-tenant client
  overrides in Phase 4 without a rewrite

It is NOT:
- A prompt-editing UI for clients (Phase 4)
- A real-time collaboration tool (locked to Zach + Claude in v1)
- A prompt analytics dashboard (future)
- A prompt evaluation system (future)
- A general-purpose CMS (it's specifically for prompts)

---

## The Three Properties The Brain Must Have

Every architectural decision in this spec serves one of three properties.
If a feature doesn't serve at least one of them, it's not in v1.

### Property 1 · Centralization

Every CC reads from the same canonical source. No CC has its own copy.
Edits to the canonical source propagate to every CC on next fetch.

**Implication:** the brain endpoint is the *only* way CCs get prompts in
the steady state. Hardcoded prompts in CCs are a transitional state, not
an end state.

### Property 2 · Privacy

The brain repo is not publicly accessible. Read access requires
authentication. The endpoint that serves prompts is rate-limited and
auth-gated.

**Implication:** the threat model assumes a sophisticated attacker who
can read the public CCs. The defense is that prompts aren't *in* the
public CCs — they're fetched at runtime from a server that only
authenticated operators can access.

### Property 3 · Auditability

Every change to a prompt is a formal proposal. Every proposal has
structured justification. Every approval is a Zach-merged PR. Every
prompt has a version. Every AI output records which prompt version
generated it.

**Implication:** "what was the prompt that generated this audit on
2026-04-12?" is always answerable. Forever.

---

## The Contract — what every prompt must declare

Every prompt file in the brain MUST honor a structured frontmatter schema.
The schema is enforced by validation at PR time and by the brain endpoint
at fetch time.

### Schema (YAML frontmatter)

```yaml
---
prompt_id: fosm-live-cc/audit/audit-master
version: 1.2.0
status: live
purpose: |
  The master audit prompt run against client business data to produce
  the FOSM·LIVE CC dashboard's primary diagnostic output.
owner: zoehlman
visibility: private
created_at: 2026-04-15T00:00:00Z
last_modified_at: 2026-05-09T00:00:00Z
last_audited_at: 2026-05-08T00:00:00Z

# Versioning
supersedes: 1.1.3
deprecates_at: null  # ISO timestamp if planned deprecation; null otherwise

# Cache control
cache_ttl_minutes: 10  # overrides folder default if set; null inherits

# Dependency tracking (for impact analysis)
depends_on:
  - shared/voice/lgr-master
  - shared/framework/fosm-master
  - shared/framework/live-master
feeds_into:
  - fosm-live-cc/client-demo-with-data/master
  - fosm-live-cc/client-demo-without-data/master

# AI configuration
model: claude-opus-4-7
temperature: 0.3
max_tokens: 4096

# Tags
tags:
  - audit
  - dashboard
  - client-facing
  - high-stakes
---

[Prompt content goes here as markdown.]
```

**Required fields:** `prompt_id`, `version`, `status`, `purpose`, `owner`,
`visibility`, `created_at`, `last_modified_at`.

**Optional but strongly recommended:** `last_audited_at`, `depends_on`,
`feeds_into`, `cache_ttl_minutes`.

**`prompt_id` rules:** matches the file path relative to the brain repo
root, minus the `.md` extension. The file at
`fosm-live-cc/audit/audit-master.md` has `prompt_id:
fosm-live-cc/audit/audit-master`. This is enforced by validation; mismatch
fails the PR.

**`status` values:** `live` · `staging` · `deprecated` · `retired`
- `live` — actively used by CCs in production
- `staging` — under review or testing, not yet promoted to live
- `deprecated` — still served but flagged for replacement; CCs warned at fetch
- `retired` — no longer served; fetch returns 410 Gone

**`visibility` values:** `private` · `public` (Phase 4 — `public` not used in v1)

---

## The Architecture

### Repo structure

The brain lives in a separate private GitHub repo, working name
`learn-and-grow-rich/fosm-brain-private` (created on Team plan for branch
protection enforcement on private repos).
Folder structure is **CC-organized with `shared/` for cross-cutting
prompts**:

```
fosm-brain-private/
├── README.md                      ← brain purpose, structure, rules
├── .github/
│   └── pull_request_template.md   ← required PR template
├── shared/                        ← prompts used by MORE than one CC
│   ├── voice/                     ← brand voice rules per brand
│   ├── framework/                 ← F·O·S·M, L·I·V·E, 12 Domains
│   ├── icp/                       ← ICP analysis (Marketing + Sales + others)
│   └── meta/                      ← prompts about prompts (audit auditor)
├── fosm-live-cc/                  ← prompts whose OUTPUT is FOSM·LIVE CC content
│   ├── audit/
│   ├── client-demo-with-data/
│   ├── client-demo-without-data/
│   └── ...
├── fosm-live-personal/            ← prompts whose OUTPUT is FOSM·LIVE Personal content
│   └── ...
├── marketing-cc/                  ← prompts whose OUTPUT is Marketing CC content
│   ├── campaign-builder/
│   ├── longform-studio/
│   └── ...
├── sales-cc/                      ← prompts whose OUTPUT is Sales CC content
│   ├── audit-intake/
│   ├── pipeline-prompts/
│   └── ...
├── vision-cc/                     ← prompts whose OUTPUT is Vision CC content
│   └── ...
├── system-map/                    ← prompts whose OUTPUT is System Map content (minimal)
│   └── ...
└── (future CC folders — operations-cc/, leadership-cc/, integrity-cc/,
    emotional-intelligence-cc/, security-cc/, audit-cc/)
```

**Organizing principle: "Where does the work product live? That's where
the prompt lives."**

### Future CC folders (planned)

When the future CCs come online, their brain folders are created as part
of CC initialization:

- `operations-cc/` — Operations CC prompts
- `leadership-cc/` — Leadership CC prompts
- `integrity-cc/` — Integrity CC prompts
- `emotional-intelligence-cc/` — Emotional Intelligence CC prompts
- `security-cc/` — Security CC prompts (third-party-style security team:
  threat modeling, pen-test scenarios, defense-in-depth review)
- `audit-cc/` — Audit CC prompts (third-party-style integrity audit:
  prompt accuracy verification, voice alignment audits, math verification,
  output traceability checks)

Security CC and Audit CC are **meta-CCs** (per `architecture-reference.md`)
— independent of the eight pillars, they protect and verify the entire
ecosystem. Their brain folders contain prompts for ecosystem-wide review.

### Per-folder cache TTL defaults

Cache durations vary by prompt category, reflecting how often each
category changes:

| Folder | Cache TTL | Rationale |
|---|---|---|
| `shared/voice/` | 1 hour | Voice rules change rarely; updates should propagate within a session |
| `shared/framework/` | 1 hour | F·O·S·M, L·I·V·E definitions change rarely |
| `shared/icp/` | 30 minutes | ICP definitions change occasionally |
| `shared/meta/` | 1 hour | Prompts about prompts change rarely |
| `fosm-live-cc/*` | 10 minutes | High iteration during client work |
| `marketing-cc/*` | 10 minutes | High iteration during content production |
| `sales-cc/*` | 10 minutes | High iteration during pipeline work |
| `vision-cc/*` | 30 minutes | Lower iteration cadence |
| `fosm-live-personal/*` | 30 minutes | Lower iteration cadence |
| `security-cc/*` | 1 hour | Security rules change rarely; high stakes when they do |
| `audit-cc/*` | 1 hour | Audit logic changes rarely |

These are starting numbers. Adjustments require a spec amendment, not a
silent code change.

**Per-prompt overrides** (declared via `cache_ttl_minutes` in frontmatter)
ship in v1.1, not v1. Folder defaults handle 90% of cases.

### The gated endpoint

Brain prompts are served via a Netlify Function at:

```
GET /api/brain/<prompt_id>
GET /api/brain/<prompt_id>?version=<semver>
```

**Default behavior:** returns the latest `live` version of the prompt.

**With `version` parameter:** returns the specified pinned version
(succeeds even if status is `deprecated`; returns 410 if `retired`).

**Response shape:**

```json
{
  "prompt_id": "fosm-live-cc/audit/audit-master",
  "version": "1.2.0",
  "content": "[markdown content]",
  "metadata": {
    "purpose": "...",
    "model": "claude-opus-4-7",
    "temperature": 0.3,
    "max_tokens": 4096,
    "cache_ttl_minutes": 10,
    "depends_on": [...],
    "feeds_into": [...],
    "last_modified_at": "2026-05-09T00:00:00Z"
  },
  "fetched_at": "2026-05-09T18:00:00Z"
}
```

**Auth:** every request requires a valid Auth0 session token in the
`Authorization: Bearer <token>` header. Invalid/expired tokens return 401.

**Caching:** the endpoint sets `Cache-Control: private, max-age=<ttl>`
where `<ttl>` is the prompt's effective cache TTL (per-prompt override OR
per-folder default). CCs honor the header.

**Error responses:**
- `401 Unauthorized` — missing/invalid/expired token
- `403 Forbidden` — token valid but operator doesn't have access (Phase 4)
- `404 Not Found` — prompt_id doesn't exist
- `410 Gone` — prompt is retired
- `429 Too Many Requests` — rate limit exceeded
- `500 Internal Server Error` — unexpected error (logged for review)

### The fetch flow

```
1. CC needs a prompt (e.g., FOSM·LIVE CC needs audit-master)
2. CC checks localStorage for cached copy:
     fosm_brain_cache_<prompt_id>_v1
3. If cached AND not expired → use cached copy. Done.
4. If not cached OR expired → call /api/brain/<prompt_id>
5. CC includes Auth0 token in Authorization header
6. Brain endpoint validates token, reads prompt from private repo,
   returns response
7. CC stores response in localStorage with timestamp
8. CC uses prompt content
```

### Manual cache refresh

Every CC has a "🔄 Refresh prompt cache" button in its Settings or Resources
nav. Clicking it:

1. Clears all `fosm_brain_cache_*_v1` keys for prompts this CC uses
2. Triggers a fresh fetch of each prompt the CC depends on
3. Shows a confirmation toast: "Refreshed N prompts from brain"

This is the operator's escape hatch when they know a prompt was just
updated and want to bypass the cache.

---

## The Auth Model

**Decision: Per-session token authentication via Auth0.**

This is built for the team-future, not the solo-present. Locked from
Brain Note v0.3.

### Why Auth0 specifically

- Industry-standard authentication infrastructure
- Free tier covers 7,500 active users (vastly more than needed)
- Handles login, MFA, password reset, social login, all edge cases
- Stable, well-documented, used by major companies
- Battle-tested for security (matters for IP-grade infrastructure)

### Auth flow (full sequence)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Operator visits any CC at fosmlive.netlify.app/<cc>/     │
│ 2. CC checks for valid session token in httpOnly cookie     │
│ 3. If missing/expired → redirect to Auth0 hosted login      │
│ 4. Operator logs in (email + password, possibly MFA)        │
│ 5. Auth0 redirects back to fosmlive.netlify.app/auth/callback│
│ 6. Callback function exchanges auth code for session token  │
│ 7. Token stored in httpOnly secure cookie                   │
│ 8. Subsequent brain fetches include token in Authorization  │
│ 9. Brain endpoint validates token via Auth0 JWKS, returns   │
│    prompt if valid                                          │
│ 10. Token expires after 8 hours (configurable)              │
│ 11. Refresh logic extends sessions silently when active     │
└─────────────────────────────────────────────────────────────┘
```

### Edge cases (all handled in v1)

| Scenario | Behavior |
|---|---|
| Token expired mid-session | CC catches 401, redirects to Auth0 login, returns to original URL after auth |
| Sign-out | Server-side token invalidation immediate; cookie cleared |
| Multiple devices | Each device has its own token (independent sessions) |
| Compromised token | Operator can sign out of all sessions from Auth0 dashboard |
| Auth0 outage | CCs fall back to last-known-good cached prompts (read-only mode) |

### Auth0 configuration (locked at setup)

- **Tenant:** dedicated LGR tenant (separate from any test/dev tenants)
- **Application type:** Single Page Application
- **Allowed callback URLs:** `https://fosmlive.netlify.app/auth/callback`
- **Allowed logout URLs:** `https://fosmlive.netlify.app/`
- **Allowed web origins:** `https://fosmlive.netlify.app`
- **Token expiry:** 8 hours (access token), 30 days (refresh token)
- **MFA:** required for all operator accounts (enforced at Auth0)
- **Connections:** username/password (initial), email+passwordless option
  (v1.1 if useful)

### Roles (v1 → Phase 4)

In v1, two roles exist:

- **`operator`** — full read access to all prompts. Zach has this role.
- *(no other roles)*

In Phase 4, multi-tenant adds:

- **`client`** — limited read access to specific prompts (their own
  brand voice, their own framework instances)
- **`team`** — operator-equivalent access for trusted hires
- **`auditor`** — read-only access for the future Audit CC's third-party
  reviewers

Phase 4 is out of scope for v1. The role schema just leaves room.

---

## The Governance Protocol — Heavy

Every prompt change goes through a formal pull request workflow. No
exceptions. This is the **discipline tax** that earns the audit trail and
prevents drift.

### The PR workflow

```
1. AI (Claude) drafts a prompt change as a feature branch + PR
2. PR template auto-loads with required structured fields
3. Claude fills in: prompt being changed, type of change, why,
   upstream/downstream impact, test confirmation
4. Zach reviews in GitHub's diff view
5. Zach approves (merge) or rejects (close with reason)
6. Merge = approved = live
7. Cache invalidates per cache TTL → CCs pick up new version on next fetch
```

### The PR template (canonical)

Lives at `.github/pull_request_template.md` in the brain repo:

````markdown
# Prompt Change Proposal

## Prompt being changed

<!-- Full prompt_id (e.g., fosm-live-cc/audit/audit-master) -->

## Type of change

<!-- Pick ONE -->
- [ ] Refinement (clarity, tone, structure)
- [ ] Bug fix (incorrect logic, wrong output)
- [ ] New framework (adds new conceptual layer)
- [ ] Voice update (brand voice change)
- [ ] IP update (proprietary thinking refinement)
- [ ] New prompt (creating, not editing)
- [ ] Deprecation (marking as deprecated)
- [ ] Retirement (removing from active use)

## What's changing

<!-- Auto-populated by GitHub diff view; confirm here -->

## Why

<!-- Required. Max 500 chars. Justify the change. -->

## Upstream prompts that may need review

<!-- From `depends_on` of the prompt being changed -->
- [ ] None
- [ ] Listed: ...

## Downstream prompts that may need review

<!-- From `feeds_into` of the prompt being changed -->
- [ ] None
- [ ] Listed: ...

## Estimated impact

<!-- Pick ONE -->
- [ ] Low — minor refinement, no behavioral change expected
- [ ] Medium — meaningful behavioral change, affects one CC
- [ ] High — significant change, affects multiple CCs or production output

## Test confirmation

- [ ] I have run this prompt at least once before submitting
- [ ] The output matches expected behavior

## Reviewer notes (optional)

<!-- Anything Zach should know that doesn't fit elsewhere -->
````

### Required fields enforcement

GitHub PR templates support required-checkbox enforcement via branch
protection rules. v1 enforcement:

- **Type of change** — exactly one box checked
- **Why** — non-empty
- **Estimated impact** — exactly one box checked
- **Test confirmation** — both boxes checked

PRs that don't satisfy these are blocked from merge.

### Approval semantics

- **Zach is the only approver** in v1. No other operators have merge
  rights.
- **Self-approval is implemented as `Required approvals: 0`** in the GitHub
  ruleset. GitHub's platform doesn't allow PR authors to formally "Approve"
  their own PRs through the review UI — that option is greyed out for
  authors. The functional equivalent for a solo operator is requiring zero
  separate approvals while still requiring the PR pathway. The template
  forces Zach to fill out the structured fields, which is the real
  discipline. The merge action by Zach IS the signature. The audit trail
  records authorship + merge timestamp + structured PR body. When LGR
  grows beyond a single operator, bump `Required approvals` to 1 (or
  more) — the architecture is reversible.
- **Claude cannot approve.** Claude drafts; Zach merges.

### Audit trail

Every merged PR is permanent. The git log shows:
- Who authored the change (Claude or Zach)
- Who approved (always Zach in v1)
- When it merged (timestamp)
- What changed (the diff)
- Why (the structured PR body)

This is **legal-grade documentation**. Years later, if someone asks
"what was the audit prompt that diagnosed Reynolds Heating in March
2026?" the answer is recoverable from the brain's commit history.

---

## The Versioning Model

**Decision: Pinned versioning with full history retention.**

Every prompt run records which version was used. Old prompts never
delete — they get superseded. Default behavior on re-run: use the
version active when the original output was generated. Optional:
explicitly use the latest version. Side-by-side diff comparison is
first-class.

### Version semantics

Prompts use **semver** (`MAJOR.MINOR.PATCH`):

- **PATCH** (1.0.x) — wording refinement, typo fix, no behavioral change
- **MINOR** (1.x.0) — new capability added, behavior expanded but
  backward-compatible
- **MAJOR** (x.0.0) — breaking change in output format or expected
  upstream/downstream contracts

**MAJOR version bumps require explicit deprecation of the old version**
with a deprecation date — gives downstream consumers time to migrate.

### File naming convention

Each prompt has TWO file locations:

**Source of truth (versioned):**
```
fosm-live-cc/audit/audit-master/v1.2.0.md
fosm-live-cc/audit/audit-master/v1.1.3.md
fosm-live-cc/audit/audit-master/v1.0.0.md
```

**Stable alias (latest live version):**
```
fosm-live-cc/audit/audit-master/latest.md
```

The `latest.md` is a symlink (on filesystem) or a routing rule (in the
brain endpoint) that resolves to the most recent version with `status:
live`. Versioned files never delete; they accumulate as history.

**This is the "single source of truth" principle in action.** The
versioned files are HISTORY. The `latest` alias is the CURRENT SOURCE.
References to "the audit prompt" automatically get latest. References to
"audit-master v1.0.0" get the pinned historical version. Both work.

### How CCs request versions

```
GET /api/brain/fosm-live-cc/audit/audit-master
   → returns latest live version (default behavior)

GET /api/brain/fosm-live-cc/audit/audit-master?version=1.0.0
   → returns pinned v1.0.0 (succeeds even if deprecated;
     410 if retired)

GET /api/brain/fosm-live-cc/audit/audit-master?version=latest
   → equivalent to omitting version parameter
```

### How outputs record their prompt version

When an AI feature in a CC runs a prompt, the output metadata records:

```json
{
  "ai_output_id": "fosm-live-audit-result-2026-05-09-001",
  "prompt_used": {
    "prompt_id": "fosm-live-cc/audit/audit-master",
    "version": "1.2.0",
    "fetched_at": "2026-05-09T18:00:00Z"
  },
  "model": "claude-opus-4-7",
  "input": "...",
  "output": "...",
  "generated_at": "2026-05-09T18:00:00Z"
}
```

This metadata is stored alongside the output (in localStorage in v1, in
backend in Phase 4). It enables:
- "Re-run this audit with the same prompt version" (reproducibility)
- "Re-run this audit with the latest prompt" (refreshed thinking)
- "Show me side-by-side: what would v1.2.0 say vs v1.0.0?" (diff
  comparison)

### Side-by-side diff comparison (first-class feature)

A future Audit CC capability: load two versions of the same prompt, run
them against the same input, show outputs side-by-side. Reveals what
changed in the *thinking*, not just the wording.

This is **Audit CC's killer feature** — it makes prompt evolution
visible. Lives in the audit-cc/ brain folder when the Audit CC is built.

---

## The Migration Plan

### Coexistence with existing patterns

The brain doesn't replace the existing prompts. It layers on top.

**Three patterns coexist in the migration period:**

- **Pattern A · Hardcoded prompts in `index.html`** — preserved as-is
  during transition. CCs continue to work.
- **Pattern B · localStorage prompt templates** (Sales CC's Prompt
  Workshop) — preserved as-is. Operators continue to edit local copies.
- **Pattern C · Brain-fetched prompts** — built in parallel. Each CC
  migrates from A and B to C deliberately, one CC at a time.

**Migration is voluntary, not forced.** A CC can stay on A or B
indefinitely if there's no reason to upgrade. The brain is opt-in,
per-CC, per-prompt.

### Per-CC two-step migration

For each CC:

**Step 1 · Prompt audit.** Read every prompt currently inside that CC's
`index.html` and `localStorage` templates. Sort each prompt into one of
two buckets:

- **Brain-worthy** — IP-grade thinking. Voice rules, audit logic, ICP
  analysis, framework applications, content generation. These move to
  the brain.
- **CC-local** — UI labels, dropdown options, tooltips, error messages,
  plumbing. These stay hardcoded in the CC. They're "prompts" in the
  technical sense but not part of the IP.

The audit step is judgment-heavy. Worth doing carefully, one CC at a
time.

**Step 2 · Migration.** For each brain-worthy prompt:
1. Create the prompt file in the appropriate brain folder
2. Open a PR with the structured template
3. Zach reviews and merges
4. Replace the inline version in the CC with a `brain.fetch(prompt_id)`
   call
5. Verify behavior is unchanged with a test run
6. Commit the CC change (separate commit from the brain PR)
7. Move to next prompt

### CC migration order (lowest-stakes first)

Same order as System Map rollout — lowest-stakes first so we learn
before touching operator data:

1. **Vision CC** (newest, no operator data yet)
2. **FOSM·LIVE Personal** (data exists but it's Zach's, not a client's)
3. **System Map** (no operator data, just a wireframe — minimal prompts)
4. **FOSM·LIVE CC** (data exists but resettable)
5. **Sales CC** (operator data — prospects)
6. **Marketing CC** (operator data — ICPs, offers, longforms — most
   prompts)

### Migration cadence

Phase 4 of the brain build (this migration) spreads across days/weeks
without urgency. As Zach naturally uses each CC for real client work,
prompts get audited and migrated organically.

---

## Locked Decisions

Six decisions made during the design conversation, now resolved and
folded into the spec body above. Recorded here so the reasoning is
preserved for future reference.

### 1 · Privacy model — Private IP, proprietary to LGR

**Decision:** Brain repo is private. Read access requires authentication.
Public exposure compromises the moat.

**Reason:** The prompts encode Zach's thinking. They are the IP that
drives the entire ecosystem. People are paying for this thinking.
Architecture must protect it.

### 2 · Storage — Separate private GitHub repo

**Decision:** Repo at `learn-and-grow-rich/fosm-brain-private`. Created
under the `learn-and-grow-rich` GitHub Team organization (not personal
account) for: (a) brand alignment, (b) branch protection enforcement on
private repos (free tier doesn't enforce on private personal repos),
(c) future team support.

**Reason:** Six benefits compound:
- Git versioning is the audit trail
- Free at this scale
- Familiar workflow (same as `fosm-live` repo)
- AI tools can access via GitHub PAT
- Netlify Functions can fetch from it
- Easy to add collaborators later

The audit trail point is **load-bearing**. Every approved prompt change
is automatically a commit, signed by Zach, dated. Legal-grade
documentation of when each version of his thinking was active.

### 3 · Access pattern — Gated API endpoint

**Decision:** CCs fetch via `/api/brain/<prompt_id>` Netlify Function.
Function authenticates via Auth0 token, reads from private repo via
GitHub PAT, returns prompt content with version metadata. Public URLs
explicitly rejected.

**Reason:** Hides the storage location, validates every request,
provides a single chokepoint for rate limiting and audit logging.

### 4 · Versioning — Pinned with full history retention

**Decision:** Every prompt run records which version was used. Old
prompts never delete. Default re-run uses original version; optional
opt-in to use latest. Side-by-side diff is first-class.

**Reason:** Reproducibility AND evolution both matter. The Tuesday
audit was generated with v1.0; running it again with v1.2 should be a
*choice*, not a silent change. Both options are real.

### 5 · Approval protocol — Heavy

**Decision:** Every prompt change is a formal PR with structured
template. Required fields enforce the protocol. Zach is the sole
operator in v1; "self-approval" is implemented as `Required approvals: 0`
in the ruleset (since GitHub blocks self-approval through the review UI).
The merge action by Zach IS the signature. When LGR grows beyond solo
operation, bump approvals to 1+.

**Reason:** The 60-second-per-change overhead is the price of the audit
trail. Worth it for IP that defines the brand. Compound across hundreds
of changes per year and the result is unfakeable provenance.

### 6 · Edit access — Zach + Claude only (v1)

**Decision:** Read access for running CCs (via gated API). Write access
for Zach (manual edits) and Claude (PR drafts that Zach approves). No
client-side editing in v1.

**Reason:** Single-operator phase doesn't need multi-tenant
infrastructure yet. Phase 4 expands to client overrides and team write
access. v1 architecture leaves room without paying the cost.

### 7 · Folder taxonomy — CC-organized with `shared/`

**Decision:** Folders mirror the CC architecture. Cross-cutting prompts
live in `shared/`. Per-CC prompts live in their CC folder. The
organizing principle is "where does the work product live? That's where
the prompt lives."

**Reason:** Zach's design from the read-through. Lookup is intuitive
(no abstract category-hunting). Cross-cutting prompts are explicit (in
`shared/`). Future CCs slot in naturally (their own folder).

### 8 · Auth mechanism — Auth0 per-session token

**Decision:** Per-session token authentication via Auth0. Every brain
fetch requires a valid, non-expired token. Tokens issued after Auth0
login. Token validation server-side.

**Reason:** Built for team-future, not solo-present. Shared-secret
architectures collapse the moment there are multiple operators.
Per-session token is the architecture that scales without a rewrite.
Phase 2 build cost expanded from ~2 hours to ~5-6 hours; cost
acknowledged and accepted.

### 9 · Cache pattern — 10 min default, per-folder TTLs, time-based invalidation

**Decision:** Cache for 10 minutes default, with per-folder TTL
overrides (1hr for shared/, 30min for vision/personal, 10min for active
CCs). Time-based invalidation in v1; push invalidation deferred to v2.
Manual force-refresh button as operator escape hatch.

**Reason:** Balance of freshness, speed, and infrastructure simplicity.
Worst-case staleness is bounded by TTL. Operator can override anytime.
Push invalidation requires WebSocket or polling infrastructure not
worth the cost in single-operator phase.

### 10 · Migration sequence — Per-CC two-step, in System Map rollout order

**Decision:** Two steps per CC: (1) audit existing prompts to
classify brain-worthy vs CC-local, (2) migrate brain-worthy ones to
brain-fetched. Same order as System Map rollout: Vision → Personal →
System Map → FOSM·LIVE CC → Sales → Marketing.

**Reason:** Doing per-CC lets us learn. Auditing all up-front would
lock in folder taxonomies we'd revise after seeing real usage. Lowest-
stakes-first matches risk to learning curve.

---

## What's NOT in scope for v1

To keep the spec from sprawling:

- **Multi-tenant client overrides.** Phase 4 territory.
- **A/B testing of prompts.** Future feature.
- **Prompt analytics** ("which prompt got used most this week?"). Future.
- **Automated prompt evaluation** (does this prompt actually do what
  it's supposed to?). Real engineering project.
- **Real-time collaborative editing.** Locked to Zach + Claude in v1.
- **Per-prompt access control.** Either you have brain access or you
  don't. Granular access is Phase 4.
- **Client-side prompt editing UI.** Future scenario where paid clients
  could tweak prompts through a UI. Phase 4 multi-tenant work.
- **Future trusted team-member write access.** When LGR grows beyond
  Zach, trusted team members may need write access to specific prompt
  categories. v1 keeps it Zach + Claude only; revisit when team grows.
- **Push invalidation on prompt changes.** v1 uses time-based cache
  expiration. Push invalidation requires WebSocket/polling
  infrastructure deferred to v2.
- **Per-prompt cache TTL overrides via frontmatter.** v1 uses
  per-folder defaults. Per-prompt overrides ship in v1.1.
- **Side-by-side diff UI.** The data model supports it (every output
  records which prompt version generated it), but the UI ships with
  Audit CC, not in v1 of the brain itself.

---

## The Build Plan

Four phases. No fixed timeline — work happens when ready. Spec leads
code throughout.

### Phase 1 · Brain repo creation (~30-45 min)

- Create `learn-and-grow-rich/fosm-brain-private` (private repo under the
  Team-plan org for branch protection enforcement)
- Set up CC-organized folder taxonomy (per the architecture section
  above)
- Write the README explaining the brain's purpose, structure, and rules
- Create `.github/pull_request_template.md` with the canonical PR
  template
- Configure branch protection rules (required PR template fields,
  required Zach review)
- Migrate first set of prompts manually (the audit prompts for testing
  the workflow)

### Phase 2 · Auth0 + gated endpoint (~5-6 hours)

- Set up Auth0 tenant for LGR
- Configure Auth0 application (SPA, callback URLs, MFA required)
- Build Auth0 login flow (hosted page + redirect handler at
  `/auth/callback`)
- Build session token issuance + cookie storage
- Build token refresh logic (8-hour access token, 30-day refresh token)
- Build sign-out endpoint (server-side invalidation)
- Build `/api/brain/<prompt_id>` Netlify Function:
  - Validates Auth0 token via JWKS
  - Reads prompt from private repo via GitHub PAT
  - Returns prompt content with version metadata
  - Honors `?version=` parameter
  - Sets `Cache-Control` header per cache TTL
- Build error handling for all defined error responses
- Test from Postman/curl AND from a real CC before any prompt migration

### Phase 3 · First CC integration (~1 hour)

- Pick lowest-stakes CC (Vision CC, per System Map rollout order)
- Migrate ONE prompt from hardcoded to brain-fetched
- Add `🔄 Refresh prompt cache` button to CC settings
- Verify behavior unchanged
- Verify auth flow works end-to-end (login → fetch → display)
- Verify cache works (second fetch returns cached, after TTL fetches
  fresh)
- Verify manual refresh works
- Ship

### Phase 4 · Roll out across all CCs (incremental)

- Same order as System Map rollout
- Per-CC two-step (audit, then migrate)
- No forced migration — happens organically as CCs are touched for real
  work
- No fixed timeline — completes when complete

Phases 1 and 2 are the blocking work. Phase 3 validates the architecture
end-to-end. Phase 4 spreads across days/weeks without urgency,
integrated into normal client work.

---

## What this spec is and isn't

**It is:** the contract every CC must honor when fetching prompts. The
canonical schema. The single source of truth for the brain's
architecture. The vocabulary the team uses when discussing prompt
governance.

**It isn't:** code. There is no JavaScript file, no Netlify Function
implementation, no actual Auth0 configuration in this spec. The
implementation comes from the build plan. This document is the
*specification* the implementation will be tested against.

**It is:** version-controlled. Lives at `docs/brain-spec.md` in the
`fosm-live` repo. Every change to the contract is a commit, with a
reason.

**It isn't:** a one-time document. The spec evolves as we learn.
Version 1.1 when implementation reveals something the spec missed.
Version 2.0 when Phase 4 lands. Version 3.0 when something we haven't
thought of forces a rewrite. The discipline is that *the spec leads the
code*, never the other way around.

---

## Cross-references

- **Brain Note v0.3** (`docs/notes/brain-design-note.md`) — the design
  conversation that produced this spec
- **System Map Spec v1.1** (`docs/system-map-spec.md`) — the sister spec
  for system-map governance; shares the foundational principles
- **Architecture Reference** (`docs/architecture-reference.md`) — the
  ecosystem map showing how the brain fits with the CCs
- **Security Checklist** (`docs/security-checklist.md`) — the security
  posture this spec must operate within
- **Brand Voice Messaging Guide** (`01_Brand_Voice_Messaging_Guide.docx`)
  — content for the future `shared/voice/lgr-master` brain prompt

---

## Last updated

2026-05-09 by Zach Oehlman + Claude. v1.0 locked. Translates Brain
Design Note v0.3 (resolved 2026-05-08) into a buildable specification.
Includes Security CC + Audit CC additions from 2026-05-09 morning. Ten
locked decisions captured with reasoning.

**Phase 1 build status: COMPLETE.** Repo created at
`learn-and-grow-rich/fosm-brain-private`. Branch protection enforcing.
PR template auto-loading. First canonical prompt (`shared/voice/lgr-master/v1.0.0.md`)
merged via PR #1 on 2026-05-09. All Phase 1 architectural decisions
validated through real implementation.

**Minor revisions during Phase 1 build:**
- Decision 2 updated to reflect Team-plan org (`learn-and-grow-rich`) — discovered during build that branch protection on private repos requires Team plan
- Decision 5 (approval protocol) refined to capture that GitHub blocks self-approval through the review UI; "self-approval" is implemented as `Required approvals: 0` in the ruleset

These are clarifications to match implementation reality, not changes to
the architectural intent. Spec body and footer kept in sync.

— *Cheers and have a blessed day.*

## Brand Voice source

- **Brand Voice Messaging Guide** (`01_Brand_Voice_Messaging_Guide.docx`)
  — source content for the now-live `shared/voice/lgr-master/v1.0.0.md`
  brain prompt
