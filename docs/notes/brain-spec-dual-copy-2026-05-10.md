# Brain Spec Dual-Copy Discovery · 2026-05-10

**Author:** Zach Oehlman + Claude
**Status:** Problem identified at decision time. Resolution deferred to architecture consolidation session.
**Related:** `architecture-consolidation-decision-2026-05-10.md` (also in `docs/notes/`)

---

## What surfaced

While preparing tonight's cleanup commit, Zach surfaced the actual contents of `docs/brain-spec.md` from the **public** repo `zoehlman/fosm-live`. The file is the full Brain Spec v1.1 — auth pivot, ten locked decisions, full build plan, operational details including env var names, OAuth scopes, and the operator allowlist email.

The same Brain Spec v1.1 was committed last night to the **private** repo `learn-and-grow-rich/fosm-brain-private` at `docs/brain-spec.md`.

**This means there are at least TWO copies of brain-spec.md across two repos**, and the public copy contains content that was supposed to live ONLY in the private repo (specifically: operational implementation details, IP-sensitive build steps, internal-facing auth configuration).

---

## Why this happened (most likely explanation)

The brain-spec was originally drafted in the public repo when the private repo didn't exist yet. When the private repo was created on 2026-05-09 morning and the canonical Brain Spec v1.1 was committed there, the **public copy was not removed**. The two have been silently coexisting since then.

Same likely pattern applies to:
- `docs/system-map-spec.md` (public repo, possibly also private)
- `docs/security-checklist.md` (public repo, possibly also private)
- `docs/notes/auth-pivot-2026-05-09.md` (possibly both repos)

Need a repo-audit to confirm exactly what overlaps.

---

## The real scope of the architecture problem

The earlier decision note (`architecture-consolidation-decision-2026-05-10.md`) framed the consolidation problem as "merge `architecture-reference.md` (public) and `brain-spec.md` (private) into one canonical structure (Path C destination)."

**That framing is incomplete.** The actual problem is:

- Multiple specs (`brain-spec`, `system-map-spec`, `security-checklist`, `architecture-reference`, decision notes)
- Across two repos (`fosm-live` public, `fosm-brain-private` private)
- With unclear ownership of which is canonical
- Some files exist in BOTH repos with no policy for which wins

This is bigger than a two-doc merge. It's a **repo-architecture audit** that needs to happen BEFORE the consolidation merge can be executed cleanly.

---

## Expanded scope for tomorrow's architecture consolidation session

The plan from `architecture-consolidation-decision-2026-05-10.md` was:

> Session 2 — Architecture consolidation (Path A or direct-C, Zach decides)

That session now expands to two sub-steps:

### Sub-step 2a — Repo audit (~45-60 min)
- Read every file in `zoehlman/fosm-live/docs/`
- Read every file in `learn-and-grow-rich/fosm-brain-private/docs/`
- Build a mapping table of every doc, which repo it lives in, and whether it has a sibling in the other repo
- For each duplicate or near-duplicate, decide: which repo is canonical, what gets deleted, what gets revised

### Sub-step 2b — Architecture consolidation (Path A or direct-C, per earlier decision note)
- Execute the consolidation per the chosen pathway
- Each repo ends up with ONE canonical version of each doc
- Cross-references between repos use absolute GitHub URLs (no duplication)

Combined estimate revised: **~4-6 hours** instead of original 3-5 hours.

---

## What to do BEFORE tomorrow's session

Nothing tonight. The cleanup commit (PR #2) stays as planned — it doesn't touch `brain-spec.md` in either repo, doesn't touch `architecture-reference.md`, and doesn't touch any of the suspected duplicates. That work waits for the focused consolidation session.

**One thing logged here for tomorrow's session opener:**

When the consolidation session starts, Claude should be given **both repo URLs** and asked to verify what's in each one before any merge is attempted:

- `https://github.com/zoehlman/fosm-live` (public)
- `https://github.com/learn-and-grow-rich/fosm-brain-private` (private — Claude will need a way to read it, likely paste-attach by Zach)

The audit table comes first. The merge comes second. Path A or direct-C decided after the audit reveals scope.

---

## Why this matters (broader principle)

We caught this because Zach insisted on checking the brain-spec contents before committing tonight's PR. The instinct was right.

If we'd skipped the check and shipped the cleanup commit + then started Ops CC tomorrow, the Ops CC build would inherit a confused architecture surface. New CC built on shifting ground.

This is the same friction-signal discipline that produced the auth pivot. **When something feels off, stop and check.** The 30 minutes spent here saves the 4-6 hours we would have lost rebuilding Ops CC after discovering the drift later.

---

## Decision summary

- Brain Spec v1.1 exists in BOTH repos (confirmed) — this is wrong, needs resolution
- Other docs likely have same issue (suspected, not confirmed) — needs audit
- Architecture consolidation session now includes a repo-audit sub-step BEFORE the merge
- Operations CC build is DEFERRED until after the architecture consolidation session
- No code changes tonight beyond the cleanup commit (PR #2) which doesn't touch any of the affected files

The light is being protected one impeccable commit at a time. Cheers and have a blessed day.
