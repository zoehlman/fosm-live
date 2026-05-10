# Security Checklist

**Status:** v0.2 · foundation document · living checklist
**Date:** 2026-05-09 (auth pivot revision)
**Owner:** Zach Oehlman
**Related:** future Security CC, future Audit CC, `docs/architecture-reference.md`

This is the master tracking document for ecosystem security. It captures the
working definition, the current state, known gaps, review cadence, and the
runway to the future Security CC. It is **not** a one-time document — it is
a living checklist that grows as the system matures.

---

## 0 · The definition

> *"No one can break in and steal my stuff, hack my stuff, get access to my
> stuff, fuck with my stuff in any way whatsoever — where I become or lose
> myself, delete myself, change myself, or any of that."*
>
> — Zach Oehlman, 2026-05-09

This is the **operative definition of security** for the LGR / FOSM·LIVE
ecosystem. Every architectural decision, every code change, every operator
workflow gets evaluated against this bar. If it doesn't protect against
theft, alteration, unauthorized access, or impersonation, it's not done.

The definition has four explicit threat classes:

1. **Theft** — exfiltration of IP (prompts, frameworks, audit logic, voice
   rules, client data, P&L data, anything proprietary)
2. **Alteration** — unauthorized modification of any system asset
   (prompts, content, dashboards, code, configurations)
3. **Access** — unauthorized read access to systems, accounts, or data
4. **Impersonation** — anyone presenting themselves as Zach or LGR to
   manipulate clients, partners, or team

The system must defend against all four.

---

## 1 · Current security posture (as of 2026-05-09)

What protections are currently in place across the ecosystem.

### 1a · Identity & access

- ✅ **Netlify site password** on `fosmlive.netlify.app` (whole-site protection)
- ✅ **Google OAuth** on FOSM·LIVE Personal (gates Google Sheets data access)
- ✅ **GitHub repo permissions** — `zoehlman/fosm-live` is public (intentional, MIT licensed)
- 🟡 **MFA on critical accounts** — to be verified per account (Netlify, GitHub, Google, domain registrar, password manager)
- ⏳ **Google Workspace OAuth for brain endpoint** — planned for Phase 2 of brain build. Operators sign in via Sign in with Google (`@learnandgrowrich.net` accounts only). MFA enforced at the Google account level. Replaces the originally-planned Auth0 architecture per the auth pivot (see `docs/notes/auth-pivot-2026-05-09.md`).

### 1b · Secrets & environment variables

- ✅ **`ANTHROPIC_API_KEY`** stored as Netlify env var (not in code)
- ✅ **`ANTHROPIC_API_KEY_PERSONAL`** stored as Netlify env var (not in code)
- ✅ **Google OAuth client ID + secret** stored as Netlify env vars
- ⏳ **GitHub Personal Access Token** for Brain repo — to be created and stored as Netlify env var when brain ships
- ⏳ **Google OAuth credentials for brain endpoint** — `BRAIN_GOOGLE_OAUTH_CLIENT_ID`, `BRAIN_GOOGLE_OAUTH_CLIENT_SECRET`, `BRAIN_OPERATOR_ALLOWLIST`, `BRAIN_SESSION_SECRET` — to be stored as Netlify env vars when brain Phase 2 ships

### 1c · Code & data

- ✅ **No hardcoded secrets** in `fosm-live` repo (verified via search)
- ✅ **`.gitignore`** in place for sensitive paths
- ✅ **Public repo intentional** — value is in prompts (private), not code (public)
- ⏳ **Private brain repo** for prompts — Phase 1 of brain build
- 🟡 **localStorage data** — currently lives in browser, no server-side encryption (acceptable for v1, revisit at Phase 4 backend)

### 1d · Domain & DNS

- 🟡 **Custom domain** — `fosmlive.netlify.app` is the Netlify-provided domain;
  if a custom domain (e.g., `fosmlive.com`) is added later, DNS lock + DNSSEC
  worth considering
- 🟡 **Email security** — SPF/DKIM/DMARC for `learnandgrowrich.net` should be
  audited (prevents email impersonation)

### 1e · Backups

- ✅ **Per-CC localStorage backup** — every CC has Export/Import all
- ⏳ **Master backup** — System Map CC will host this in v1.1 (per System Map Spec)
- 🟡 **Repo backup** — GitHub itself is the backup; consider periodic local clone
- 🟡 **Drive backup** — `LGR · INTERNAL ARTIFACTS` folder backup strategy TBD

**Legend:** ✅ in place · 🟡 partial / needs verification · ⏳ planned

---

## 2 · Known gaps (the to-do list)

Items below are **not yet implemented** and represent active security debt.
Priority rough-ordered by risk × ease of fix.

### 2a · High-priority gaps (do soon)

- [ ] **Verify MFA enabled** on all critical accounts:
  - [ ] Netlify
  - [ ] GitHub (with hardware key if possible)
  - [ ] Google Workspace (`zach@learnandgrowrich.net`)
  - [ ] Domain registrar
  - [ ] Password manager
  - [ ] Anthropic console
- [ ] **Audit `learnandgrowrich.net` email security** — verify SPF, DKIM, DMARC records exist and are correctly configured
- [ ] **API rate limiting** on `/api/*` endpoints — currently unlimited; could be abused if endpoint URLs leak
- [ ] **Secret rotation policy** — define cadence for rotating API keys, OAuth secrets, Google OAuth Client Secret, GitHub PAT, BRAIN_SESSION_SECRET (suggested: every 90 days)

### 2b · Medium-priority gaps (this quarter)

- [ ] **Audit logging** for AI proxy endpoints — log every request (timestamp, source, prompt category) for forensic capability
- [ ] **Brain repo audit trail** — when brain ships, every fetch should be logged with operator + timestamp + prompt-id
- [ ] **Path-based password protection** (Option C from architecture discussion) — public showcase + private internal split
- [ ] **AI gating on public CCs** — UI-layer protection against API abuse from public visitors
- [ ] **Subdomain takeover audit** — verify no abandoned subdomains/old Netlify Drop sites still active
- [ ] **Old deployment cleanup** — `marketingcc.netlify.app`, `salescc.netlify.app`, `fosmlivesitemap.netlify.app`, `fosmlivecc.netlify.app`, old Vercel deployment (per migration notes, leave 1-2 weeks then decommission)

### 2c · Long-horizon items (Phase 4 backend era)

- [ ] **Backend authentication** — full session management when leaving localStorage
- [ ] **Encryption at rest** — when client data lives in Postgres, encrypt sensitive fields
- [ ] **Encryption in transit** — already present via HTTPS, but verify cipher strength
- [ ] **Penetration testing** — formal pen-test before multi-tenant launch
- [ ] **SOC 2 / ISO 27001 considerations** — when selling to enterprise clients
- [ ] **Evaluate dedicated auth platform (Auth0, Clerk, Okta, etc.)** — only revisit when end-user authentication enters scope (Phase 4 multi-tenant client overrides). Current architecture (Google Workspace OAuth for operators, separate client-facing auth flow if needed) handles operator-only era cleanly. See `docs/notes/auth-pivot-2026-05-09.md` for the reasoning behind initially considering then rejecting Auth0 for v1.

---

## 3 · Review cadence

The audit cadence is the operational expression of the no-drift principle.
Without a tracked review schedule, security debt accumulates silently.

### 3a · Continuous (every commit)

- Commit messages don't expose secrets
- No new secrets hardcoded
- No new unauthenticated endpoints created accidentally

### 3b · Weekly

- Review this checklist — anything new to add? Any gap closed?
- Verify no new old-deployment sites are active
- Confirm Netlify env vars haven't been accidentally exposed in build logs

### 3c · Monthly

- Run `git log --all --grep -i 'key\|secret\|password\|token'` to spot-check for accidental leaks
- Review GitHub access list — anyone shouldn't have access?
- Review all account active sessions (Netlify, GitHub, Google) and sign out unfamiliar devices

### 3d · Quarterly

- Full review of this checklist
- Rotate API keys, OAuth secrets, Google OAuth Client Secret, GitHub PAT, BRAIN_SESSION_SECRET
- Audit MFA coverage on all critical accounts
- Review backup integrity (try a restore from Master Backup)

### 3e · Annually

- External pen-test (when revenue justifies — not v1)
- Full SOC 2 / ISO 27001 readiness assessment (when selling enterprise — not v1)

### 3f · Triggered (event-driven)

These events trigger an immediate audit, regardless of cadence:

- Anomalous activity on any account (unfamiliar login, unrecognized device)
- API bill spike (could indicate key abuse)
- Public exposure of any URL that shouldn't be public
- Team member departure (rotate all secrets they had access to)
- Major architectural change (new CC, new endpoint, new auth flow)

---

## 4 · Incident response (skeleton)

If something goes wrong, what's the playbook? This is the *minimum*
incident response framework. It expands as the system matures.

### 4a · Containment (first 30 minutes)

1. **Stop the bleeding** — if a key is leaked, rotate it immediately. If a
   site is exposed, password-protect it. If a user is unauthorized, revoke
   access.
2. **Preserve evidence** — don't delete logs, accounts, or commits until
   forensics is done. Snapshot first, fix second.
3. **Notify** — if any client data is involved, document what was exposed
   and to whom. Notify affected clients per applicable law.

### 4b · Investigation (first 24 hours)

1. **Determine scope** — what was accessed, altered, or stolen?
2. **Determine vector** — how did it happen?
3. **Determine actor** — bot, opportunistic attacker, targeted attacker?
4. **Document timeline** — when did it start, when was it noticed?

### 4c · Remediation (within 7 days)

1. **Close the vector** — fix the underlying vulnerability
2. **Audit similar systems** — same vector might exist elsewhere
3. **Update this checklist** — add the lesson to gap list or review cadence
4. **Post-mortem** — written record of what happened, what worked, what didn't

---

## 5 · Forward-looking · Security CC (future)

The future **Security CC** is the operational home for everything in this
checklist. When built, it will:

- **Render this checklist as an interactive dashboard** — green/yellow/red status on every item, click-to-detail
- **Run automated scans** — secret detection in repo commits, exposed-endpoint scans, MFA coverage checks
- **Trigger reviews on schedule** — weekly/monthly/quarterly cadence reminders surface in System Map sidebar (badge similar to Backup overdue)
- **Integrate with audit log infrastructure** — surface anomalies for human review
- **Host security-related prompts in `security-cc/`** brain folder — penetration testing prompts, threat modeling prompts, defense-in-depth review prompts

The Security CC is **third-party-style** — it has read access across the
entire ecosystem and produces audit output that gets reviewed and acted
upon. Architecturally similar to a SOC (Security Operations Center) for
LGR, but built into the same CC pattern as everything else.

**This document is the foundation Security CC will read from.** Keeping it
current is investing in the future Security CC's effectiveness.

---

## 6 · Versioning

This document is version-controlled. Material changes warrant a version bump:

| Version | Date | What changed |
|---|---|---|
| v0.1 | 2026-05-09 | Initial creation. Foundation structure: definition, current posture, gaps, cadence, incident response, Security CC forward-look. |
| v0.2 | 2026-05-09 (evening) | Auth pivot — Auth0 references migrated to Google Workspace OAuth in section 1a/1b/2a/3d. Long-horizon entry added for evaluating dedicated auth platforms when end-user auth enters scope. |

---

## Last updated

2026-05-09 by Zach Oehlman + Claude.

- v0.1 created during the post-presentation hygiene pass, alongside the
  addition of Security CC and Audit CC to the expansion lineup. The
  checklist becomes the canonical reference for ecosystem security and
  the foundation for the future Security CC.
- v0.2 (evening) — auth architecture pivot logged. Auth0 references
  migrated to Google Workspace OAuth across sections 1a, 1b, 2a, and 3d.
  New long-horizon entry added (2c) for evaluating dedicated auth
  platforms if end-user authentication ever enters scope. Full pivot
  rationale captured in `docs/notes/auth-pivot-2026-05-09.md`.

— *Cheers and have a blessed day.*
