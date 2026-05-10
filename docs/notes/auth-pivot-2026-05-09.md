# Auth Architecture Pivot · Decision Lock

**Date:** 2026-05-09 (evening)
**Status:** Locked — awaiting formal spec update tomorrow morning
**Context:** Mid-Phase-2 architectural pivot during the build session
**Resolution:** Brain Spec Section 7 + Decision 8 to be rewritten tomorrow

---

## What changed

The Brain Spec v1.0 (locked 2026-05-09 morning) specified **Auth0** as the
authentication mechanism for the gated brain endpoint. During Phase 2
build execution this evening, three discoveries surfaced that changed the
calculus:

1. **MFA is paid-tier** in Auth0 (Pro: $23/mo and up, Enterprise: $$$).
   Free tier provides NO MFA. The Brain Spec required MFA enforcement.

2. **The brain endpoint serves operators only** — not clients. Re-reading
   Spec section "What's NOT in scope for v1" confirmed:
   - Clients receive *outputs* of the brain (audits, dashboards, content)
   - Clients never authenticate to the brain itself
   - Their browsers talk to YOUR Netlify Functions, which talk to the brain
     using YOUR credentials
   - The brain's auth model only needs to scale to operators
     (Zach + 5-10 trusted LGR staff in 1-2 years)

3. **Google Workspace OAuth was already configured** for FOSM·LIVE Personal
   (April 2026). MFA already enforced at the Google account level. Zero
   additional cost. Familiar setup pattern.

These three together mean Auth0's primary value (sophisticated end-user
authentication at scale) doesn't apply to the brain's actual use case.
Google Workspace OAuth covers the operator-only auth needs at $0
additional cost.

---

## The new decision

**Authentication mechanism for the brain endpoint: Google Workspace OAuth.**

Specifically:
- Operators sign in via "Sign in with Google" using their
  `@learnandgrowrich.net` Workspace accounts
- MFA enforced at the Google account level (already configured)
- Token validation via Google's OAuth infrastructure
- Authorized accounts: explicit allowlist of `@learnandgrowrich.net` operators
- No additional vendor, no additional cost

**Cost trajectory:**
- v1 (today): $0 additional (already on Workspace)
- Phase 2 (small team, 1-2 yr): $6-18/user/month for Workspace seats they
  need anyway for email/Drive/Calendar
- Phase 3 (10+ team, 2+ yr): same as Phase 2 — scales linearly with team
  size, but cost is bundled into Workspace (you'd pay regardless)

---

## Why this is durable, not just expedient

This isn't "we'll fix it later." This is the right architecture for the
brain's actual use case:

1. **Brain is operator-only infrastructure.** Even at Phase 4 multi-tenant
   maturity, the brain endpoint is read by operators and Netlify Functions
   acting on operators' behalf — not directly by end users (clients,
   affiliates).

2. **Centralized identity management.** When LGR grows to 5+ team members,
   suspending a Workspace account suspends ALL their access (email, Drive,
   brain, every CC). Single chokepoint for offboarding.

3. **Phase 4 multi-tenant client overrides don't change auth.** Multi-tenant
   means YOUR server fetches CLIENT-specific prompts on behalf of clients —
   not clients accessing the brain directly. Same auth model.

4. **Portability.** Google OAuth is a standard. Migrating off Google is
   easier than migrating off Auth0 (which has proprietary platform lock-in).

5. **The "professional posture" argument for Auth0 evaporates** when
   clients aren't users. CISOs at enterprise clients care about SOC 2,
   pen tests, and encryption — not the specific auth platform name.

---

## What gets revised in the brain spec

Tomorrow morning, the following sections of `docs/brain-spec.md` v1.0 need
deliberate updates:

### Section 7 · The Auth Model (full rewrite)

Replace Auth0-specific architecture with Google Workspace OAuth:
- Sign in with Google flow (not Auth0 hosted page)
- ID token validation via Google's JWKS (not Auth0's)
- Operator allowlist by email domain (`@learnandgrowrich.net`)
- Token expiry per Google's defaults (1-hour access tokens, refresh via
  silent reauth)
- MFA enforced at Google account level (not at Auth0)
- No new tenant — uses existing Google Cloud project from Personal app or
  creates a new one

### Section 9 (Locked Decisions) · Decision 8 · Auth mechanism

Replace the Auth0 entry with:
- **Decision:** Google Workspace OAuth via existing
  `learnandgrowrich.net` Workspace
- **Reason:** Brain endpoint serves operators only; Workspace OAuth covers
  this use case at $0 additional cost; MFA already enforced at account
  level; centralized identity management when team grows; portable
  standard (less vendor lock-in than Auth0)
- **Phase 2 build cost:** estimated 3-4 hours (down from 5-6 hours with
  Auth0) because we reuse patterns from FOSM·LIVE Personal's OAuth setup

Add a **Decision 8.1 · Pivot rationale** sub-entry preserving the
Auth0-considered-then-rejected reasoning so future-you doesn't relitigate:
- Initially specified Auth0 (2026-05-08)
- Mid-build discovered: Auth0 MFA requires Pro tier ($23/mo); brain serves
  operators only (not clients); Google Workspace already configured with
  MFA; Auth0's enterprise features don't earn their cost for operator-only
  use case
- Pivoted to Google Workspace OAuth (2026-05-09 evening)
- Build resumes with simpler architecture

### Section 11 (Build Plan) · Phase 2 estimate

Update Phase 2 time estimate from "~5-6 hours" to "~3-4 hours" reflecting:
- No Auth0 tenant setup
- No Auth0 application config
- Reuse OAuth client and consent screen patterns from Personal app's Google Cloud project
- Login flow: standard Google Identity Services (GIS) implicit flow
- Token validation: standard Google OAuth token verification

### Section 12 · What's NOT in scope for v1

Add a new entry:
- **Auth0 or other dedicated auth platforms.** Initially considered;
  rejected when brain's operator-only use case became clear. Revisit if
  Phase 4 multi-tenant brings end-user authentication into scope (which
  current architecture suggests it won't).

---

## What gets revised in the brain note

`docs/notes/brain-design-note.md` bumps from v0.5 → v0.6 with:
- New section: "Auth pivot · 2026-05-09 evening"
- Documents the three discoveries (MFA cost, operator-only audience,
  Google already configured)
- Captures the architecture rationale for future readers
- Marks v0.6 as the version that reflects post-Phase-1 build learnings

---

## What gets revised in the security checklist

`docs/security-checklist.md` bumps from v0.1 → v0.2 with:
- Section 1a (Identity & access): Auth0 references changed to "Google
  Workspace OAuth" entries
- Section 2a (high-priority gaps): "MFA verification" item adds
  `learnandgrowrich.net` Workspace MFA confirmation as the operative
  control point
- New entry in section 2c (long-horizon): "Evaluate dedicated auth
  platform (Auth0, Clerk, or similar) when end-user authentication enters
  scope" — moves the Auth0 question to its proper time horizon

---

## Tonight's action items (already executed)

1. ✅ Stopped Phase 2 Auth0 build mid-stream
2. ✅ Verified no billing method attached to Auth0 trial (no charges in 22
   days when trial expires)
3. ✅ Captured this decision lock note for tomorrow's spec update work
4. ⏳ Auth0 trial tenant left in place; will auto-downgrade to free tier in
   22 days; will be deleted then if not needed

---

## Tomorrow's action items (to execute)

In order:

1. **Spec update** (~30-45 min):
   - Rewrite Section 7 (Auth Model) of brain-spec.md per the outline above
   - Rewrite Decision 8 in the Locked Decisions section
   - Add Decision 8.1 (pivot rationale)
   - Update Phase 2 build time estimate
   - Add Auth0 to "NOT in scope for v1" with the revisit-trigger note
   - Bump brain-spec.md version: 1.0 → 1.1 (minor revision, architecture
     intent preserved)

2. **Brain note bump** (~10 min):
   - Update brain-design-note.md to v0.6
   - Add the auth-pivot section

3. **Security checklist bump** (~10 min):
   - Update security-checklist.md to v0.2
   - Migrate Auth0 references to Google Workspace OAuth
   - Add the long-horizon "evaluate dedicated auth platform" entry

4. **Phase 2 build** (~3-4 hours, with all docs locked first):
   - Verify Google Cloud OAuth project for the brain (use existing or new)
   - Configure OAuth consent screen, test users, authorized origins
   - Build the login flow (Sign in with Google) using Google Identity
     Services
   - Build the `/api/brain/<prompt_id>` Netlify Function with token
     validation
   - Build error handling (401 for invalid token, 403 for unauthorized
     domain, 404 for missing prompt, etc.)
   - Test from Postman + smoke-test from a real CC

---

## Discipline note

This pivot is in integrity with the brain spec's foundational principles:

- **"Spec leads code, never the other way around"** → we stopped the
  build the moment the implementation revealed the spec needed updating.
  Code does not proceed until the spec catches up.

- **"Heavy approval, full audit"** → this decision lock is the audit
  trail. Tomorrow's spec update will be a formal commit. The reasoning is
  preserved for future-you reading the architecture history.

- **"Single source of truth, references everywhere"** → updating spec,
  brain note, and security checklist together ensures no doc has stale
  Auth0 references after tomorrow.

This is exactly how the architecture is supposed to evolve when
implementation reveals something the spec didn't account for.

---

## Last updated

2026-05-09 evening, by Zach Oehlman + Claude. Decision locked during the
Phase 2 build session pause. Formal spec updates scheduled for tomorrow
morning with fresh energy. The Auth0 trial sits unused for 22 days then
auto-expires; no further action required tonight.

— *Cheers and have a blessed day.*
