# FOSM·LIVE Brain · Prompt & IP Inventory

**Prepared:** 2026-05-09 (after Phase 2C-1 deploy)
**Purpose:** Complete inventory of every prompt and reference document scattered across the project, mapped to brain repo target paths, sorted by migration priority.
**Status:** DRAFT — Zach reviews, pushes back, we agree on top 5 to migrate first.

---

## What's already in the brain repo

| File | Status | Notes |
|---|---|---|
| `shared/voice/lgr-master/v1.0.0.md` | ✅ Merged (PR #1) | 268 lines. Foundational voice doc. Distilled from the Brand Voice & Messaging Guide. |

That's it. Every other piece of IP listed below is currently scattered across:
- CC `index.html` files (V0–V5 audit prompts, persona prompts, industry research prompts, Strategic Plan AI prompts)
- Standalone PDFs and DOCX files (Brand Voice Guide, Plan to Heal the World, FOSM Planner, ICP Reference Guide, 100 Reasons, Strategic Plan Template, Rebrand docs)
- Source recordings and transcripts (Meditation files, MBA YouTube Transcripts, YouTube Content Calendar)

---

## Total inventory

**Identified items:** 27 distinct prompts and reference documents, broken down by brain repo target.

| Category | Count |
|---|---|
| `shared/voice/` (cross-brand voice + tone) | 4 |
| `shared/framework/` (F.O.S.M. core methodology) | 5 |
| `shared/icp/` (ideal client profiles) | 1 |
| `shared/meta/` (vision + worldview) | 2 |
| `sales-cc/` (V1–V5 prompt suite) | 9 |
| `marketing-cc/` (industry research, persona builder, content) | 4 |
| `vision-cc/` (Vision-to-Reality, Strategic Plan, FOSM Planner) | 2 |

---

## Priority legend

- 🔴 **P1 — Migrate first.** Foundational voice/framework. Used by every other prompt. High IP value. Cleanest to migrate.
- 🟡 **P2 — Migrate next.** Production prompts in active use. Medium-large in size. Some content already in CC code (need extraction).
- 🟢 **P3 — Migrate later.** Reference content, lead magnets, support material, source recordings. Important but lower urgency for the brain endpoint.

---

# `shared/voice/` — cross-brand voice + tone

## 🔴 P1 — `shared/voice/lgr-master/v1.0.0.md` (already merged)

**What:** The foundational LGR voice document.
**Source:** Distilled from `01_Brand_Voice_Messaging_Guide.docx`.
**Status:** ✅ Merged in PR #1.
**Action:** None. Done.

## 🔴 P1 — `shared/voice/six-brand-voices/v1.0.0.md`

**What:** Voice nuances across the six brand doorways.
**Source:** `01_Brand_Voice_Messaging_Guide.docx` Part 3.
**Why P1:** Every CC and every content prompt needs to know which brand voice it's serving. Without this, content drifts across brands and the audience-doorway model breaks.
**Brands covered:**
- Learn And Grow Rich (LGR) — warm teacher
- Beyond The Money — peer who's been there
- Money God Politics — humble student
- The Foundation — steward
- The Retreat — guide who's walked it
- IndianaOehlman.com — friend on the road
**Estimated migration effort:** 30 min to draft markdown with frontmatter. Content already exists, just needs structured format.

## 🟡 P2 — `shared/voice/signature-language/v1.0.0.md`

**What:** Signature words, phrases, hook formulas, and language to avoid.
**Source:** `01_Brand_Voice_Messaging_Guide.docx` Parts 4-5.
**Why P2:** Used as voice-anchor reference by content generation prompts. Less foundational than the master doc, but high practical value. Tactical, copy-pasteable.
**Includes:**
- Words/phrases to use ("path to peace and prosperity," "light vs dark," "F.O.S.M.," "where does X live?")
- Story hooks ("24 countries," "4 companies past $1M," "I used to sell this for $20K")
- Hook formulas (The Inversion, The Question That Locates Something, The Permission Drop, etc.)
- Words to avoid (urgency selling, moralizing, evangelism)
**Estimated migration effort:** 30 min.

## 🟡 P2 — `shared/voice/voice-check/v1.0.0.md`

**What:** The 7-question voice check before any piece of content publishes.
**Source:** `01_Brand_Voice_Messaging_Guide.docx` Part 7.
**Why P2:** Tactical quality gate. Should be runnable as a prompt to validate any output.
**Estimated migration effort:** 15 min — small, simple to extract.

## 🟡 P2 — `shared/voice/cta-library/v1.0.0.md`

**What:** Default CTAs per brand with matching rules.
**Source:** `01_Brand_Voice_Messaging_Guide.docx` Part 6.
**Why P2:** Used at the bottom of nearly every piece of content. Currently embedded in CC code, should be canonical here.
**Estimated migration effort:** 20 min.

---

# `shared/framework/` — F.O.S.M. core methodology

## 🔴 P1 — `shared/framework/fosm/v1.0.0.md`

**What:** The canonical F.O.S.M. Framework definition.
**Source:** Synthesized from `Learn And Grow Rich  Executive Program  Strategic Plan  Template.pdf`, `Rebrand  Finance Department.pdf`, `The_Plan_To_Heal_the_World_compressed.pdf`, `Learn And Grow Rich MBA YouTube Transcripts.docx`, the audit prompts in `index.html`.
**Why P1:** The framework is the IP. Every audit prompt, every Strategic Plan section, every content piece references F.O.S.M. We need ONE canonical definition that all downstream prompts cite.
**Includes:**
- Pillar definitions: Finance (measure), Operations (deliver), Sales (explain why best), Marketing (find people)
- Customer journey through pillars (M → S → O → F)
- Scaling sequence: phase 1 starting (M+S focus), phase 2 scaling (full FOSM), phase 3 holding/selling
- Why F.O.S.M. vs. EOS (FOSM is the plan, EOS is the implementation)
- The "Art Side" — Vision/Mission/Values/Leadership/Dream Life Number
**Estimated migration effort:** 60 min — content is well-developed but scattered across many sources, needs synthesis.

## 🔴 P1 — `shared/framework/money-brick-dashboard/v1.0.0.md`

**What:** The Money Brick Dashboard concept — KPIs mapped to each F.O.S.M. pillar.
**Source:** `Rebrand  Finance Department.pdf`, `The_Plan_To_Heal_the_World_compressed.pdf`, `Learn And Grow Rich MBA YouTube Transcripts.docx`, the audit Excel template structure (Sheet 6 of Summit Mechanical).
**Why P1:** This is the *quantitative* side of F.O.S.M. — every audit Excel uses this dashboard structure. Without canonical KPI definitions, audits drift.
**Estimated migration effort:** 45 min — KPI list + benchmark sources need consolidating.

## 🟡 P2 — `shared/framework/wilson-law/v1.0.0.md`

**What:** Wilson's Law — "Education is the key to wealth."
**Source:** YouTube Content Calendar Week 1, MBA Transcripts.
**Why P2:** Recurring concept in LGR content but lower frequency than F.O.S.M.
**Estimated migration effort:** 15 min.

## 🟡 P2 — `shared/framework/triangle-of-death/v1.0.0.md`

**What:** The Triangle of Death — Zach's Call 1 qualification framework for ICP 1.
**Source:** ICP Reference Guide ("Run them through the Triangle of Death on Call 1.")
**Why P2:** Sales-CC adjacent. Should be canonical so the qualifier-call prompts can cite it.
**Estimated migration effort:** 30 min — needs Zach to define it, since it's referenced but not detailed in the docs I've read.
**⚠ ZACH INPUT NEEDED:** I don't see the full definition anywhere in project knowledge. You may need to draft this fresh.

## 🟡 P2 — `shared/framework/scaling-phases/v1.0.0.md`

**What:** The three phases of business — Starting / Scaling / Holding-Selling — with the org structure for each phase (Board / C-Suite / Mid-Mgmt / Entry / Personnel).
**Source:** `Rebrand  Finance Department.pdf`, `Rebrand  Exit Program.pdf`.
**Why P2:** Used by Strategic Plan generation prompts and audit recommendations to position the prospect's stage.
**Estimated migration effort:** 30 min.

---

# `shared/icp/` — ideal client profiles

## 🔴 P1 — `shared/icp/lgr-icp-master/v1.0.0.md`

**What:** All defined ICPs with persona detail, pain, why-they-buy, decision-makers, offer fit, lead-gen angle.
**Source:** `Learn and Grow Rich   ICP Reference Guide.pdf`.
**Why P1:** Every Sales CC prompt, Marketing CC content prompt, and audit recommendation depends on knowing which ICP the prospect is. Without canonical definitions, segmentation breaks.
**Includes:**
- ICP 1: The Grind-Phase Service Business Owner (Joshua/Sam/Corey types, $3K/mo offer)
- ICP 2: The Real Estate Investor with Private/Institutional Investors (Michael type, $7-10K/mo offer)
- ICP 3: (Exit-ready, larger founder-led) — referenced in V5 Demo Persona Builder
- Plus any additional ICPs from your own working notes
**Estimated migration effort:** 45-60 min — most content already structured, just needs frontmatter and any missing ICPs added.
**⚠ ZACH INPUT NEEDED:** Are there ICPs beyond #1 and #2 that you've defined and I haven't surfaced? The audit demo persona builder references "ICP 3" and "ICP #" in ways suggesting more exist.

---

# `shared/meta/` — vision + worldview

## 🟢 P3 — `shared/meta/plan-to-heal-the-world/v1.0.0.md`

**What:** The full vision document. The Foundation, The Farm, Healing Center, Leadership Academy, Co-Working Space, etc.
**Source:** `The_Plan_To_Heal_the_World_compressed.pdf`.
**Why P3:** This is the *worldview behind everything*. It's referenced in voice docs, but doesn't get pulled by prompts at runtime. Lives here as canonical reference for future-team-members and as input to brand-positioning content.
**Estimated migration effort:** 60-90 min — large document, needs careful structuring. Would benefit from sub-files for each sub-vision (Foundation, Farm, etc.).

## 🟢 P3 — `shared/meta/dragons-den-pathway-to-peace/v1.0.0.md`

**What:** The personal narrative anchor — Buddha + dragon, peace as destination, the founder's story.
**Source:** `Meditation - Pathway to Peace - 1 - 4-12-2026.txt`, `Meditation_4122026.pdf`, `Meditation - 4-16-2026.txt`.
**Why P3:** Source material for personal-brand content (Beyond The Money, Money God Politics, Indiana Oehlman). Lives here as voice anchor / origin story canon.
**Estimated migration effort:** 45 min — transcripts need editorial pass to extract the canonical narrative from the meditation rambles.

---

# `sales-cc/` — V1–V5 prompt suite (the audit pipeline)

The Sales CC has the most prompt density of any CC. These are PRODUCTION prompts in daily/weekly use.

## 🔴 P1 — `sales-cc/v2-audit-master/v3.0.0.md`

**What:** The F.O.S.M. Audit Master Prompt — the prompt that produces the audit deliverables for clients. Currently split into V2a (Foundation), V2b1+V2b2 (Excel), V2c (Word), V2d (Bundle).
**Source:** `index.html` (Sales CC) — embedded as `<script type="text/template" id="tpl-audit">` and the V2a/b1/b2/c/d step templates.
**Why P1:** This is the production audit that delivers every Excel + Word + JSON bundle to every client. It's the most important prompt you have outside the voice docs.
**Estimated migration effort:** 2-3 hrs total — this is a large suite. Each sub-step (V2a, V2b1, V2b2, V2c, V2d) becomes its own file. Plus the master orchestrator. Five files minimum.
**Recommendation:** Break into:
- `sales-cc/v2-audit-master/v3.0.0.md` (orchestrator)
- `sales-cc/v2a-audit-foundation/v1.0.0.md`
- `sales-cc/v2b1-audit-excel-foundation/v1.0.0.md`
- `sales-cc/v2b2-audit-excel-analytical/v1.0.0.md`
- `sales-cc/v2c-audit-word/v1.0.0.md`
- `sales-cc/v2d-audit-bundle/v1.0.0.md`

## 🔴 P1 — `sales-cc/discovery-packet/v2.0.0.md`

**What:** The F.O.S.M. Discovery Packet — the 100+ question intake instrument that collects everything an audit needs.
**Source:** `index.html` Sales CC — discovery packet template.
**Why P1:** This is the intake. No discovery packet, no audit. Used at the front of every sales engagement.
**Estimated migration effort:** 60 min.

## 🟡 P2 — `sales-cc/v1-questionnaire-generator/v1.0.0.md`

**What:** The prompt that generates the personalized Discovery Packet docx for a specific prospect (with their name, company, branding).
**Source:** `index.html` Sales CC — `tpl-questionnaire`.
**Why P2:** Lighter usage than V2 since the discovery packet is mostly static. But still production.
**Estimated migration effort:** 30 min.

## 🟡 P2 — `sales-cc/v3-fosm-live-personalization/v1.0.0.md`

**What:** The FOSM·LIVE personalization prompt suite — V3a (Identity), V3b (Time Anchors), V3c (Ledger), V3d (Org & Industry), V3e (Seeds & Final). Takes the CLIENT_BUNDLE.json and produces a personalized FOSM·LIVE HTML for deploy.
**Source:** `index.html` Sales CC — V3 step templates.
**Why P2:** Production but downstream of audit. Like V2, this is a multi-step suite — needs 5+ files.
**Estimated migration effort:** 2-3 hrs total for full suite.

## 🟡 P2 — `sales-cc/v5-demo-persona-builder/v1.0.0.md`

**What:** The prompt that builds a fictional demo persona (interview round + 7 artifact bundle) for sales demos and lead-magnet content.
**Source:** `index.html` Sales CC — `tpl-demo-persona-builder`.
**Why P2:** Used for sales-asset creation, not direct client work. High value when needed but not hourly use.
**Estimated migration effort:** 60 min.

## 🟡 P2 — `sales-cc/qualifier-15min-call/v1.0.0.md`

**What:** The prompt(s) for running a 15-minute qualifier call: rubric, scoring, decision criteria.
**Source:** Sales CC stage definitions in `index.html` (`'qualifier-15'` stage).
**Why P2:** Sales process anchor. Currently the rubric is hard-coded in the CC; should be canonical here so it can evolve without redeploys.
**Estimated migration effort:** 45 min.

## 🟢 P3 — `sales-cc/v0-pre-discovery/v1.0.0.md`

**What:** Pre-discovery introductory materials, scheduling rubric, etc.
**Source:** Sales CC `tpl-v0-*` templates (if any exist — referenced by structure but content placeholder).
**Why P3:** Low usage, mostly automated.
**Estimated migration effort:** 30 min — likely placeholder content.

## 🟢 P3 — `sales-cc/v4-custom-content/v0.1.0.md`

**What:** Custom content templates for proposals, follow-ups, audit-aware emails.
**Source:** Sales CC `tpl-v4-*` (currently placeholder per Phase 1.11 plan).
**Why P3:** Currently a placeholder. Define when needed.
**Estimated migration effort:** Unknown — content doesn't exist yet.

## 🟢 P3 — `sales-cc/proposal-generator/v1.0.0.md`

**What:** The prompt that generates a custom proposal from audit findings.
**Source:** Sales CC stage `'proposal'`. Currently spec'd but not detailed in templates I've read.
**Why P3:** Important deliverable but downstream of V4.
**Estimated migration effort:** 60 min when ready.

---

# `marketing-cc/` — industry research, persona builder, content

## 🟡 P2 — `marketing-cc/competitor-finder/v1.0.0.md`

**What:** The prompt that uses web search to find 10 real competitor companies for a given business description.
**Source:** `fosm-live-template-v8.html` — competitor finder system prompt.
**Why P2:** Currently embedded in personal CC, but the pattern applies to Marketing CC too. Production.
**Estimated migration effort:** 30 min.

## 🟡 P2 — `marketing-cc/leader-finder/v1.0.0.md`

**What:** Same pattern as competitor finder, but for industry leaders the user wants to *become* (5x-100x bigger).
**Source:** `fosm-live-template-v8.html` — leader finder system prompt.
**Why P2:** Production.
**Estimated migration effort:** 30 min.

## 🟡 P2 — `marketing-cc/icp-industry-scanner/v1.0.0.md`

**What:** The downstream + self-industry analysis prompts (read clients' industry to predict shifts in your own).
**Source:** `fosm-live-template-v8.html` — industry analysis prompts.
**Why P2:** Powerful framework, currently single-CC-bound, deserves canonical home.
**Estimated migration effort:** 45 min.

## 🟢 P3 — `marketing-cc/youtube-content-calendar/v1.0.0.md`

**What:** The 6-month YouTube content calendar (180+ video themes with hooks, problems, CTAs).
**Source:** `Learn And Grow Rich - YouTube Content Calendar - Learn And Grow Rich.pdf`.
**Why P3:** This is a *content plan* not a *prompt*. Lives here as canonical reference for content team, but doesn't get fetched at runtime.
**Estimated migration effort:** 90 min — long doc, needs structured TOC.

---

# `vision-cc/` — Vision-to-Reality, Strategic Plan, FOSM Planner

## 🟡 P2 — `vision-cc/vision-to-reality-session/v1.0.0.md`

**What:** The Vision To Reality Session framework: Dream Life Number, Dream Day, Adventure List, Monthly Budget. The personal-vision frame that anchors everything financial.
**Source:** `Learn And Grow Rich  Executive Program  Strategic Plan  Template.pdf` (the Vision To Reality Session 1), MBA Transcripts ("vision to reality strategy session"), Brand Voice Guide.
**Why P2:** Foundational personal framework. Used at the start of nearly every engagement and referenced in Strategic Plan generation.
**Estimated migration effort:** 60 min.

## 🟡 P2 — `vision-cc/strategic-plan-generator/v1.0.0.md`

**What:** The 19+ AI prompts embedded in the FOSM·LIVE template that generate Strategic Plan sections (welcome, vision, mission, values, principles, current offers, current clients, FOSM goals, etc.).
**Source:** `fosm-live-template-v8.html` — `SP_AI_PROMPTS` block + `CLIENT_SEEDS_DEFAULTS`.
**Why P2:** Production prompts running in every deployed FOSM·LIVE. Should be canonical so updates propagate without redeploying every prospect's HTML.
**Estimated migration effort:** 90 min — many small prompts to migrate.

## 🟢 P3 — `vision-cc/fosm-planner-template/v1.0.0.md`

**What:** The FOSM Planner — annual → quarterly → monthly → weekly → daily cascade with SWOT diagnostic.
**Source:** `Learn And Grow Rich  FOSM Planner  Template.pdf`.
**Why P3:** Reference content / lead magnet asset. Lives here as canonical, doesn't get pulled at runtime by CCs.
**Estimated migration effort:** 60 min.

---

# Items NOT being migrated to the brain (and why)

Some content surfaced in my reading that should NOT live in the brain repo. Logging here so we don't accidentally pull it in:

- **100 Reasons Why You Can't Scale Your Business.pdf** — Lead magnet content. Lives in marketing distribution, not in the brain. Could be referenced by content prompts but doesn't need to be a brain artifact.
- **MBA YouTube Transcripts.docx** — Source recordings. Used as input for content distillation, not a fetchable artifact.
- **Meditation .txt and .pdf files** — Source recordings. Same as above. The *distilled narrative* (`shared/meta/dragons-den-pathway-to-peace`) is what goes in the brain; the raw transcripts stay outside.
- **Rebrand documents (Finance Dept, Exit Program)** — Service offering descriptions. Live in marketing collateral / sales decks, not in the brain. Their content informs prompts but isn't a brain artifact.

---

# Recommended migration order — first 5 to do

Based on highest-value-fastest-first:

1. **`shared/voice/six-brand-voices/v1.0.0.md`** — 30 min. Unblocks every content prompt across brands.
2. **`shared/icp/lgr-icp-master/v1.0.0.md`** — 60 min. Unblocks every sales prompt.
3. **`shared/framework/fosm/v1.0.0.md`** — 60 min. Canonical framework, foundation for everything else.
4. **`shared/voice/signature-language/v1.0.0.md`** — 30 min. Highly tactical, used by every content piece.
5. **`shared/voice/voice-check/v1.0.0.md`** — 15 min. Quality gate, runnable as standalone prompt.

**Total time for first 5: ~3.25 hours.** Spread across 2-3 work sessions.

After these 5 land, you have a **complete shared/ folder** in the brain repo. Every per-CC prompt that gets migrated next can cite these files instead of re-defining voice/ICP/framework inline.

---

# Open questions for Zach

1. **Are there ICPs beyond #1 and #2?** The Demo Persona Builder references "ICP 3" — that suggests at least one more I haven't surfaced.

2. **Is the Triangle of Death documented anywhere?** Mentioned in ICP guide, but not defined. Want it canonical so qualifier-call prompts can use it.

3. **Are there prompts I've missed entirely?** Things you've drafted but haven't shared with Claude in any conversation, things in Notion/Slack/Drive I don't have access to. Push back on the inventory.

4. **Voice override question:** the existing `lgr-master/v1.0.0.md` (PR #1) — does it already incorporate the six-brand-voices content, or is it a distillation of just the LGR brand? If the latter, we keep both. If the former, we may consolidate.

5. **Versioning style for migrations:** all new files go in at `v1.0.0.md` with `latest.md` as alias, per Brain Spec v1.1 Decision #5. Confirm.

6. **PR style:** one PR per file, or batch by category (e.g., one PR for all four voice files)? My recommendation: one PR per file for the first wave (clean audit trail, easy to revert), then batch later when confidence builds.

---

# What happens after this inventory is approved

**Step 2 starts.** I draft the first 5 markdown files, with full YAML frontmatter (per Brain Spec v1.1 Locked Decision #4), in proper structure. You PR them in (same flow as `auth-callback.js`). When all 5 are merged, you have a real prompt library that any future prompt can cite by GitHub URL.

**Step 3 — actually using it tomorrow.** When you sit down to do client work tomorrow, your operator-side instruction to Claude becomes:

```
Use the canonical voice from:
https://github.com/learn-and-grow-rich/fosm-brain-private/blob/main/shared/voice/lgr-master/v1.0.0.md

Use the F.O.S.M. framework from:
https://github.com/learn-and-grow-rich/fosm-brain-private/blob/main/shared/framework/fosm/v1.0.0.md

Now [whatever the client task is].
```

Claude reads the GitHub URLs directly (no Phase 2D needed), grounds itself in your canonical voice/framework/ICP, and produces work that's already on-brand. You stop carrying the voice in your head every time.

That's the unlock. That's why this is more valuable than Phase 2D tonight.
