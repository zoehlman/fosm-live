# The Brain · Prompt Library · Design Note

**Status:** Placeholder · context capture · NOT a spec
**Date:** 2026-05-08 (late-night)
**Next:** Full spec drafted Saturday morning at `docs/brain-spec.md`

This is a bridge document. It captures tonight's design conversation about
the prompt library so tomorrow morning's spec sprint doesn't have to
reconstruct context from memory. Every decision recorded here is **locked**
and serves as the foundation for the full spec.

---

## The vision · what the brain is

> "The prompts aren't documentation. They aren't templates. They aren't
> tooling. They're me. Captured, formalized, made replicable. Every audit
> prompt is me doing an audit. Every voice prompt is me speaking."

The CCs are **delivery mechanisms** for the prompts. The prompts are the
**product**.

Implications:
- Prompt versioning matters more than CC versioning (an old version of a CC's
  UI is fine; an old version of an audit prompt could give a client wrong analysis)
- The prompt library is the moat — the thing competitors can't replicate
  even if they reverse-engineer the CCs
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
the spec can be drafted:

### 1 · The folder taxonomy

How are prompts organized inside the private repo? Some candidate top-level
groupings:

```
brain/
├── voice/              ← brand voice rules per brand
├── framework/          ← F.O.S.M., L.I.V.E., 12 Domains, etc.
├── audit/              ← all audit prompts
├── icp/                ← ICP analysis, Triangle of Death scoring
├── content/            ← content-generation prompts (longform, slicing, etc.)
├── client/             ← per-client custom prompts (or stays in Drive?)
└── meta/               ← prompts about prompts (the audit auditor)
```

Right answer depends on how prompts cluster naturally — best decided after
auditing the existing prompt inventory.

### 2 · The auth mechanism for the gated endpoint

Two reasonable options:
- **Shared secret + origin pinning:** the CC bundle embeds a token, the
  endpoint validates the token AND that the request originated from
  `fosmlive.netlify.app`. Simple, fast.
- **Per-session token:** the operator signs in once, gets a token, the CC
  uses it for the session. More secure, more complex, requires login UI.

v1 likely shared secret + origin pinning. v2 may upgrade.

### 3 · The PR template format

What does the heavy-protocol PR template actually look like? GitHub PRs
support markdown templates that auto-fill on PR creation. Worth designing
the template carefully — it's the form that gets filled out on every prompt
change for the next several years.

### 4 · The fetch-and-cache pattern

When a CC fetches a prompt, does it:
- Always hit the brain endpoint? (slow but always fresh)
- Cache for N minutes? (fast but staleness window)
- Cache forever, with manual "refresh prompts" button? (fastest, full operator control)

Tradeoff: freshness vs. speed vs. UX complexity.

### 5 · The migration sequence

Once the brain is built, in what order do existing CCs migrate from
hardcoded prompts to brain-fetched prompts? Same logic as System Map
rollout (lowest-stakes first), but the prompts inside each CC need
auditing before migration.

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

2026-05-08 by Zach Oehlman + Claude. Late-night design capture before sleep.
The vision is locked. The architecture is sketched. The full spec lands
Saturday.

— Cheers and have a blessed day.
