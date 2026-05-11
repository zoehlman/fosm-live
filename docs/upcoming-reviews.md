# Upcoming Reviews · Post-Merge Backlog

Long-term memory across build sessions. Items captured here came from verification walks where they were caught but deferred (not blockers, but worth fixing on the next polish ship). Plus the larger code-review and integration items that need their own session.

## Operations CC · v0.5.0 (shipped 2026-05-11)

### Build sequence complete
C1 through C5 verified clean (30/30 checks). PR #4 merged as squash commit `cbb3a28`. Branch `feat-operations-cc-c1-scaffolding` deleted. Production at `fosmlive.netlify.app/operations-cc/`.

### UX refinements caught during C5 verification (non-blocking)

1. **Wrong-app rejection toast visibility**
   - Current: gold warn-styled toast appears when a non-Ops-CC backup file is selected for import, fades after ~3 seconds
   - Issue: works correctly but too subtle for the severity of what's being communicated (a safety-net rejection)
   - Options: (a) bigger toast + longer duration for warn-level, (b) modal instead of toast for wrong-app rejection, (c) add persistent inline notice in Import section
   - Lean: option (a) is easiest fix, option (c) preserves audit trail. Probably do both.

2. **Roster nav escape hatch missing**
   - Current: `selectedClientId` persists across hard refresh (C3 design — operators land back in their last client on refresh)
   - Issue: clicking "Roster" in sidebar when already viewing a client profile just re-opens that profile — no clean path back to the all-clients list
   - Options: (a) breadcrumb with clickable "Roster" → deselect, (b) "← back to all clients" button in client profile header, (c) clear `selectedClientId` if Roster sidebar item clicked while already in client profile
   - Lean: option (c) is cleanest. Single-click toggle behavior.

3. **Hard-refresh "Today as default landing" — needs documentation**
   - Current: hard refresh resets sidebar view to Today while preserving all view-internal state (filter chips, filed bucket expansion, selectedClientId, activeTab, lastBackupAt)
   - This is deliberate (Today = home pattern, marked with gold `default landing` tag in topbar)
   - Issue: not self-evident — operator coming fresh wouldn't know without being told
   - Options: (a) keep behavior, add brief in-app help text "Today is your home; navigate from there", (b) extend persistence to also remember last view so hard refresh feels truly invisible
   - Lean: option (a) is the cleaner default. Document via in-app hint, not by changing behavior.

4. **Today empty-state copy stale on Source 1**
   - Current: when no overdue filings exist, Source 1 reads "PM Calendar ships in C4 — once you add filings there, this surface will flag the ones running past their due date"
   - Issue: forward-looking copy from C3 ship still references "ships in C4" — PM Calendar has since shipped
   - Fix: copy should now read something like "No overdue filings yet. Add filings in PM Calendar — overdue ones surface here automatically."
   - One-string fix.

## Marketing CC

### Higgs Field integration
- Vision CC has a working Higgs Field implementation that should be ported to Marketing CC for image/video generation in campaign assets
- Worth lifting the integration pattern wholesale rather than rebuilding from scratch
- Pre-build verification round needed: pull the current Vision CC implementation, identify the integration points, identify what config/env-var separation looks like for Marketing CC

### Marketing CC full code review
- Run the full C1→C5 verification cycle discipline against Marketing CC
- Same pattern as Operations CC tonight: pre-build verification round → verify before architecting → walk checks → log refinements → polish ship

## Sales CC

### Full code review
- ~7,200+ line codebase, more than Operations CC's 6,345
- Specific item to verify: `FUNNEL_TEMPLATE_REGISTRY` handoff routing consistency
  - Confirmed during Operations CC C5: `audit.handoff === 'operations-cc'` works as expected
  - Other funnels (`tax_strategy`, `closed_lost_loop`, etc.) should be audited for consistent `handoff` field values
  - Phase 4 backend will turn this into a database table both CCs can read — but the in-source registry should be consistent before then

### Bridge filter tightening (deferred from Operations CC C5)
- Current filter: `person.stageKey === 'closed'`
- Tighter filter: `person.stageKey === 'closed' && FUNNEL_TEMPLATE_REGISTRY[person.funnelKey]?.handoff === 'operations-cc'`
- Three implementation options documented in `renderBridge()` comment in `operations-cc/index.html`:
  - A. Hardcode handoff routing table in Ops CC (DRY violation)
  - B. Defer past Phase 1 (clean — wait for Phase 4 Supabase backend)
  - C. Serialize FUNNEL_TEMPLATE_REGISTRY to localStorage in Sales CC at boot
- Current decision: B (defer). Diagnostics surfaces this as known-deferred. Revisit when multiple funnels with different handoffs exist.

## Patterns held (apply to all future builds)

- **Pattern 1** — Verify before architecting (pre-build verification round on every ship)
- **Pattern 4** — Two-CC separation (each CC owns its `fosm_<slug>_*` keys, reads but never writes other CCs')
- **Pattern 5** — No silent compliance (build chat pushes back when blockers exist)
- **Pattern 6** — Store truth, not derived state (single source, render-time derivation)

## Last updated

2026-05-11 by Zach Oehlman + reviewer Claude after Operations CC v0.5.0 merge.
