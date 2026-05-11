# Brain Spec Dual-Copy Note · CORRECTION · 2026-05-10

**Author:** Zach Oehlman + Claude
**Status:** Corrects `brain-spec-dual-copy-2026-05-10.md` (committed earlier tonight, PR #2)
**Trigger:** Repo audit revealed the original note's premise was factually wrong

---

## Why this correction exists

Earlier tonight (PR #2), we committed `docs/notes/brain-spec-dual-copy-2026-05-10.md` claiming that `brain-spec.md` existed in BOTH the public repo (`zoehlman/fosm-live`) and the private repo (`learn-and-grow-rich/fosm-brain-private`). The note framed this as a dual-source-of-truth problem requiring expanded scope for architecture consolidation.

**That premise was factually wrong.**

A subsequent repo audit (screenshot of `fosm-brain-private` root, sent by Zach) revealed:
- The private repo has NO `docs/` folder at all
- `brain-spec.md` exists ONLY in the public repo, not in both
- `auth-pivot-2026-05-09.md`, `security-checklist.md`, `system-map-spec.md` likewise exist only in the public repo
- The private repo contains exactly: 7 scaffold folders (one per CC), `shared/` (with `voice/lgr-master/v1.0.0.md` as the only real prompt content), `.github/pull_request_template.md`, and a root `README.md`

There is no dual copy. There never was. The architecture is already correct.

---

## What the original note got wrong, and what's actually true

| Original note claimed | Actually true |
|---|---|
| Brain-spec.md exists in both repos | Brain-spec.md exists only in public repo |
| This is a dual-source-of-truth problem | There is no dual-source problem |
| Other docs likely follow the same pattern | All system docs live only in public repo |
| Architecture consolidation needs to expand to a repo audit | Architecture is already correctly separated: mechanics public, prompts private |
| Tomorrow's session needs to merge two copies | Tomorrow's session can focus on brain prompt migration as originally planned in `brain-prompt-inventory-2026-05-09.md` |

---

## The architectural principle, now properly stated

The repo separation reflects a deliberate decision made earlier in the project:

- **Public repo (`zoehlman/fosm-live`):** mechanics + their documentation. CC code, Netlify Functions, system map, the brain endpoint spec (which documents the public-facing API contract), security posture, architecture reference. **The code isn't the IP. The mechanics are open source. Anyone can clone the repo.**

- **Private repo (`learn-and-grow-rich/fosm-brain-private`):** the prompts. Voice rules, framework definitions, ICP profiles, audit prompts, per-CC AI system prompts. **The prompts ARE the IP. The thinking encoded in markdown is what LGR sells.**

Brain-spec.md is **documentation of a mechanism** (the brain endpoint), not the IP itself. It describes the public-facing API contract between CCs (public consumers) and the brain (private implementation). The contract is appropriately public. The data behind the contract is appropriately private.

This is the same pattern as OpenAPI specs or RPC interface definitions — schema and contract documentation is public so consumers can integrate; implementation and data are private.

**No file needs to move. No consolidation is needed at the repo-layout level.**

---

## What actually caused the error

Claude operated on an unverified assumption from a session compaction summary. The summary stated brain-spec.md existed in both repos as a dual copy. Claude treated the summary as authoritative without verifying against the actual repo state. Several architectural decisions were then built on top of that false premise:

1. The "Brain Endpoint" section Claude proposed adding to `architecture-reference.md` — drafted to "reconcile" the supposed two copies. Discarded after Zach pushed back, but driven by the wrong mental model.
2. The "architecture consolidation decision" note — framed correctly as Path C destination, but with consolidation urgency manufactured by the false dual-copy premise.
3. **This very correction's predecessor** — the dual-copy note itself, which is now factually wrong in the audit trail.

The verification (Zach sending the private repo screenshot) only happened after Claude requested an audit. By that point, the wrong note was already committed.

**Root cause:** verification happened after architectural claims were made, instead of before.

---

## The fix — going forward

This kind of error cannot happen again. The fix is structural, not behavioral.

A new foundational principle is being added to Brain Spec v1.1 → v1.2:

> **Principle 6 · Verify before architecting.** When proposing architectural changes, identifying problems with the current state, or making structural claims about the system, FIRST verify the actual state of the system by reading current files in current repos. Never act on summarized memory, paraphrased session history, or unverified assumptions. The cost of a 2-minute verification is always less than the cost of a wrong architectural decision logged in the permanent audit trail.

Plus a detailed companion document at `docs/claude-working-rules.md` that elaborates the verification pattern with examples, captures the friction-signal pattern, and warns about compaction summaries drifting from current state.

Both files ship in this PR (#3) alongside this correction note.

---

## What this means for tomorrow's session

The earlier note `architecture-consolidation-decision-2026-05-10.md` framed tomorrow as "architecture consolidation across two repos." That framing is no longer accurate.

**Tomorrow's actual priorities:**

1. **No repo consolidation needed.** The two-repo split is correct.
2. **Brain prompt migration begins.** Per `brain-prompt-inventory-2026-05-09.md`, start with the first wave: 6 brand voice files + `signature-language` + `voice-check` + `cta-library` (9 files total in `shared/voice/`).
3. **The 6 open questions in the inventory get answered first.** Triangle of Death definition, ICP 3 existence, missing prompts, voice override question, versioning style confirmation, PR style confirmation.
4. **Path C destination is still valid as a long-term doc organization choice** but not urgent. The public repo's `docs/` folder will grow over time; eventually a `docs/architecture/` tree may help discoverability. That's a "later, when there are 15+ docs" decision, not a "this weekend" decision.

The earlier `architecture-consolidation-decision-2026-05-10.md` note stays in the audit trail. Like this correction, it captures what we believed at decision time. Future readers consult both notes together to see the evolution of the architectural understanding.

---

## What we did right

Even though the dual-copy premise was wrong, several things in tonight's process worked:

1. **Zach insisted on checking the actual brain-spec.md contents before committing the architecture-reference.md patch.** That instinct caught the deeper problem before it shipped.
2. **The decision to NOT update architecture-reference.md tonight was correct** — the patch would have been a hack over a non-existent problem, doubly bad.
3. **The discipline of "log decisions at decision time"** is exactly what's letting us correct this cleanly now. The wrong note is in the audit trail; this correction is in the audit trail; future readers see both and learn from the sequence.
4. **The brain prompt migration inventory committed tonight remains valid.** That was real work, properly scoped, and still the right next step.
5. **The Operations CC build was deliberately deferred.** Even though the rationale (architectural drift) turned out to be partly wrong, the underlying instinct (don't build on unstable ground) was right.

The friction signal worked. The cost of the false alarm was three decision notes and one PR. The cost of acting on a wrong architectural premise — repo restructuring that turned out to be unnecessary — would have been an order of magnitude worse.

---

## Decisions logged tonight

1. ✅ Brain-spec.md stays in public repo. No move needed.
2. ✅ Architecture-reference.md stays in public repo. No move needed.
3. ✅ Security-checklist.md, system-map-spec.md, all `docs/notes/*` — stay in public repo. No moves needed.
4. ✅ Architecture consolidation work as originally scoped is no longer needed. The previous decision note is preserved in the audit trail for completeness but its conclusions are superseded.
5. ✅ Tomorrow's session focuses on brain prompt migration, not doc consolidation.
6. ✅ Principle 6 added to Brain Spec v1.2 (verify before architecting). Companion doc at `docs/claude-working-rules.md` captures detailed working patterns.

The light is being protected one impeccable commit at a time. Cheers and have a blessed day.
