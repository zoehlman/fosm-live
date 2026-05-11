# Architecture Consolidation Decision · 2026-05-10

**Author:** Zach Oehlman + Claude
**Status:** Decision locked at decision time. Implementation deferred.
**Logs:** the choice to NOT do the architecture merge tonight, and what we'll do instead.

---

## What surfaced tonight

After a productive day building V0 (Creation Code), V4 (Executive CC), V9 (Operations CC) wireframes and producing an updated `docs/architecture-reference.md`, we noticed a dual-source-of-truth problem:

- `docs/architecture-reference.md` (public repo, this repo) describes CC architecture, V0–V9 system map, brand worlds, build sequence.
- `docs/brain-spec.md` v1.1 (private repo, `fosm-brain-private`) describes brain endpoint architecture, auth model, prompt YAML contract, build phases.

The two docs overlap by ~30%. Both implicitly claim canonical authority. Tonight they happen to agree because both were written recently — but updates will drift over time without a structural fix.

The first version of tonight's commit plan tried to paper over the conflict by adding one "Brain Endpoint" section to `architecture-reference.md` that said "they cover different surfaces." Zach pushed back: "I don't want a hack job. This is God's work. It needs to be done right."

That push-back is correct.

---

## Three paths considered

### Path A — one master architecture doc, modular sections
- One canonical doc covers ontology + CC architecture + brain endpoint architecture + auth model + everything conceptual.
- Brain-spec.md gets demoted from "canonical contract" to "implementation spec for the brain endpoint" — references the master for ontology, owns only operational implementation details (exact env vars, PR template, YAML field list).
- **Strengths:** one source of truth · clean for solo + small team
- **Weaknesses:** master doc gets long (~1,500 lines) · public doc exposes some brain architecture · doesn't scale well past ~5 maintainers or ~50 readers

### Path B — master doc + companion specs, hard split by surface
- Two docs, rigorous ownership rules. Any overlap moves up to master, spec references master.
- **Strengths:** public/private separation cleaner
- **Weaknesses:** still two docs, drift risk lower but not zero, requires constant discipline

### Path C — `docs/architecture/` tree, indexed by concern
- Multiple files under `docs/architecture/`: `00-overview.md`, `10-creation-code-v0.md`, `20-system-map.md`, `30-cc-architecture.md`, `40-brain-endpoint.md`, etc.
- Brain-side private repo holds only operational implementation details, in one small file that references the public arch tree.
- **Strengths:** scales to 50+ readers · scales to 5+ maintainers · search-by-filename works · supports Phase 5 licensee model (PE firms, family offices, foundations fork only the sub-files they need)
- **Weaknesses:** more upfront design · requires more files to maintain

---

## Decision

**Destination: Path C.** Multi-tenant Phase 5 licensee model (PE firm · family office · foundation network · retreat operator) makes a doc tree the right shape — the same modularity that makes docs maintainable makes them re-packageable per licensee. Tree structure teaches the system better than master doc. Doc tree IS the licensing surface for architecture-level forks.

**Pathway: TBD between two options — Zach to decide before next session.**

- **Option 1 — A as stepping stone, then split to C.** Two sessions: ~3 hr to merge brain-spec.md v1.1 into architecture-reference.md as a master doc (Path A). Then ~2 hr to split the resulting master into the `docs/architecture/` tree (Path C). Total ~5 hr across two focused sessions. **Easier execution, surfaces content first then designs structure.**
- **Option 2 — Direct to C.** One longer session (~4-5 hr) to design the tree, distribute content from both docs into the right files at the right depth, write the README/index, and version-bump both repos. **Single shot but more upfront design pressure.**

**Claude's recommendation: Option 1 (A as stepping stone).** Cleanest path because content from two repos is easier to consolidate into one doc and then split, than to split into a designed tree directly. Risk-reduced.

**Zach to decide A→C vs direct-C before next session.** No wrong answer; both lead to C.

---

## What's NOT happening tonight

- **No edits to `docs/architecture-reference.md`** on `main`. The version Zach wrote today stays as-is. The hack-job "Brain Endpoint" section Claude drafted earlier in tonight's session is discarded. We don't ship cosmetic patches when the real fix is a doc consolidation.
- **No edits to `docs/brain-spec.md` v1.1** in the private repo. It stays as-is until the consolidation session.
- **No Path A or Path C execution.** That's a focused-session job, after Ops CC ships.

---

## What IS happening tonight (the cleanup commit)

A single PR to the public repo with three files:

1. **`system-map/index.html`** (replace existing) — V0–V9 update from today's session. Pure system map work, no architectural conflict.
2. **`docs/OPERATIONS_CC_BUILD_PROMPT.md`** (new) — build prompt v2.0 for Operations CC. Operational, no architectural conflict.
3. **`docs/notes/brain-prompt-inventory-2026-05-09.md`** (new) — last night's open thread: 27-item migration inventory. Logs the open work so it doesn't drift.
4. **`docs/notes/architecture-consolidation-decision-2026-05-10.md`** (new — this file) — captures tonight's decision so the next session walks in oriented.

Branch: `feat-v0-v9-system-map-and-ops-cc-prompt`. Single PR. Same heavy-approval pattern as last night's PR #1.

---

## What's queued for the next sessions

In recommended order:

### Session 1 — Operations CC build
- Fresh Claude chat, paste `OPERATIONS_CC_BUILD_PROMPT.md`, attach reference files
- Build `operations-cc/index.html` as single-file deliverable
- Land as its own PR (PR #3) to public repo
- Verify deploy at `https://fosmlive.netlify.app/operations-cc/`
- **Estimate: 4-6 hours** (single-file CC build, similar in scope to Sales CC)

### Session 2 — Architecture consolidation (Path A or direct-C, Zach decides)
- Read both `docs/architecture-reference.md` and `fosm-brain-private/docs/brain-spec.md` v1.1 side by side
- Execute chosen path (A as stepping stone, or direct C)
- Single coordinated PR (one to public, one to private if Path A → demote spec)
- Version-bump: architecture-reference.md → v2.0 (or `docs/architecture/00-overview.md` v1.0 if direct-C) · brain-spec.md → v1.2 (operational only)
- **Estimate: 3-5 hours** depending on path chosen

### Session 3 — Path C split (only if Option 1 chosen)
- Split master architecture doc into `docs/architecture/` tree
- README/index file at `docs/architecture/README.md`
- **Estimate: 2-3 hours**

### Session 4+ — Brain prompt migration (Step 2 from last night's plan)
- Pick up the 27-item migration from inventory note
- First 5: shared/voice/* (6 brand voice files + signature-language + voice-check + cta-library = 9 files total)
- One PR per file initially, batch later
- Per file: ~30-60 min draft + commit

---

## Why this matters

We could ship the architecture merge tonight by adding a section to one doc and calling it done. That's faster.

We're not doing that because:
1. The system is being built for multi-tenant scale (PE firms, family offices, foundations, retreat operators). Patchwork docs don't scale.
2. The discipline is "spec leads code, never the other way around." When the doc structure is wrong, fix the doc structure properly — don't paper over it.
3. This is God's work. The dual-source-of-truth problem will compound. Catching it now and choosing the right destination is exactly the kind of friction-signal decision the spec rewards.

The light got more protected by the *decision to not patch tonight* than it would have by the patch itself.

---

## Open threads still in motion (logged for next session)

These don't need to be done before architecture consolidation, but tracking so they don't drift:

- **Phase 2C-2** — frontend "Sign in with Google" button for the brain endpoint
- **Phase 2D** — `/api/brain/<prompt_id>` endpoint with cookie auth
- **Phase 2E** — error handling matrix + Postman/curl smoke test
- **Password gate decision** — site-wide Netlify password is blocking `/auth/callback` from being reachable by Google during real OAuth. Three options laid out in PR #1 comment from 2026-05-09. Resolve before Phase 2C-2 deploy.
- **Brain prompt migration** — inventory at `docs/notes/brain-prompt-inventory-2026-05-09.md`. Begin after Ops CC ships.
- **Six open questions from inventory** — Triangle of Death definition, ICP 3 existence, missing prompts, voice override question, versioning style confirmation, PR-style confirmation. Answer before brain prompt migration begins.

---

## Tomorrow morning — pickup state

When the next session opens, read this file first. Then:

1. Confirm A vs direct-C choice (if not already decided)
2. Verify last night's PR #1 (`auth-callback.js`) and tonight's PR #2 (system map + ops prompt + notes) both successfully deployed via Netlify
3. Open a fresh chat for Operations CC build using `docs/OPERATIONS_CC_BUILD_PROMPT.md`

The light is being protected one impeccable commit at a time. Cheers and have a blessed day.
