# Repo Manifest — Deferred Maintenance Task · 2026-05-10

**Author:** Zach Oehlman + Claude
**Status:** Deferred to maintenance window (this week or next)
**Related:** `docs/brain-spec.md` v1.2 Principle 6 · `docs/claude-working-rules.md` Patterns 1 and 1.5

---

## What this is

A logged decision to **build an auto-generated repo manifest later this week** as a maintenance task, rather than build it tonight or rely on manual maintenance.

This note captures the reasoning so the work doesn't drift, and serves as the build spec when the work gets picked up.

---

## Why this came up

Tonight's session caught a factual error in a committed decision note (`brain-spec-dual-copy-2026-05-10.md`). The error: claiming brain-spec.md existed in two repos when it actually existed in only one. Root cause: Claude trusted a compaction summary instead of verifying against the actual repos.

The structural fix was Principle 6 (Verify before architecting) added to `brain-spec.md` v1.2, plus the detailed Pattern 1 in `claude-working-rules.md`. **That fix works** — every architectural session is now required to verify against current repo state before making claims.

But verification is repetitive work. Every session re-checks the same files. The natural question Zach raised: "Why not maintain an audit table that lists everything, so Claude just reads the table instead of re-verifying every time?"

The answer to that question landed at the right design pattern (auto-generated manifest, not manual table), but the actual build is real work. So we deferred it.

---

## What was considered, and why we landed where we landed

### Option 1 — Manual audit table maintained by humans

Rejected. Manual maintenance is the failure mode that caused tonight's error. A doc that humans must remember to update will drift. A drifted doc that Claude trusts is worse than no doc.

### Option 2 — Auto-generated manifest

The right answer. A script reads both repos, regenerates the manifest on every push to main. The manifest is never hand-edited. It always reflects actual repo state.

### Option 3 — Verify-at-read-time (no manifest)

What Principle 6 already encodes. This works as the baseline. The auto-generated manifest from Option 2 makes Option 3 cheaper to execute (open one doc vs. inspect both repos), but is not strictly necessary.

### Decision

Ship Principle 6 + working rules tonight (PR #3). Build the auto-generated manifest as a future maintenance task. Until then, verification happens per Pattern 1 of the working rules.

---

## Build spec — when this gets picked up

When the auto-generated manifest gets built, here's what it should be.

### What the script does

A script (Python or Node, language TBD when built) that:

1. Reads both repos via GitHub API:
   - `zoehlman/fosm-live` (public — no auth needed for read)
   - `learn-and-grow-rich/fosm-brain-private` (private — needs PAT with read scope on the org)
2. Walks the entire file tree of each repo
3. For each file, captures:
   - Path (relative to repo root)
   - Repo (public or private)
   - Last modified timestamp
   - Last commit hash
   - File size
   - Front-matter metadata if present (purpose, status, version, owner from prompt YAML schema)
4. Generates a markdown file: `docs/repo-manifest.md` in the public repo
5. Commits the regenerated manifest if it changed

### When the script runs

- On every push to main in either repo (via GitHub Action)
- The Action lives in the public repo's `.github/workflows/`
- It uses a deploy key or fine-grained PAT to read the private repo

### What the manifest looks like

```markdown
# Repo Manifest · Generated 2026-XX-XX

Auto-generated. Do not edit by hand. Regenerated on every push to main in either repo.

## Public repo · zoehlman/fosm-live

### docs/
| Path | Last modified | Last commit | Purpose |
|---|---|---|---|
| architecture-reference.md | 2026-05-10 | abc1234 | CC architecture reference |
| brain-spec.md | 2026-05-10 | def5678 | Brain endpoint API contract |
| ... | | | |

### system-map/
| Path | Last modified | Last commit |
|---|---|---|
| index.html | 2026-05-10 | abc1234 |
| ... | | |

[... rest of repo ...]

## Private repo · learn-and-grow-rich/fosm-brain-private

### shared/voice/
| Path | Last modified | Last commit | prompt_id | Version | Status |
|---|---|---|---|---|---|
| lgr-master/v1.0.0.md | 2026-05-09 | 5d8fd68 | shared/voice/lgr-master | 1.0.0 | live |
| ... | | | | | |

[... rest of repo ...]
```

### Acceptance criteria when built

- [ ] Script reads both repos accurately
- [ ] Manifest lists every non-scaffold file in both repos
- [ ] Manifest includes prompt metadata (prompt_id, version, status) from frontmatter
- [ ] GitHub Action triggers on push to main in either repo
- [ ] Manifest commits only when content actually changed (avoids noisy commits)
- [ ] Working rules doc gets updated with a new pattern pointing operators to the manifest as the canonical lookup
- [ ] Pattern 1 in working rules gets updated: "verify against the manifest first; if the manifest doesn't have the answer, then verify against the repo directly"

### Estimated effort

2-3 hours when built. Breakdown:
- 30 min: design the script structure, decide language, decide which metadata to capture
- 60-90 min: write and test the script locally
- 30 min: wire up GitHub Action with proper auth (PAT for private repo)
- 30 min: test end-to-end with a real commit cycle
- 15 min: update working rules to reference the manifest

### Why "this week or next" not "tonight"

Tonight's energy goes into shipping PR #3 (the discipline fix). The manifest is a "make verification cheaper" project, not a "make verification safe" project. Verification safety is already achieved by Principle 6 + Pattern 1.

The manifest is a quality-of-life improvement, not a foundational fix. Build it when the head is fresh and the script can get the attention it deserves.

---

## What happens between now and when the manifest gets built

Until the manifest exists:

- Every Claude session doing architectural work follows Pattern 1 (verify before architecting) the same way we did tonight — check the actual repos, ask for screenshots if needed, don't trust summaries
- This is slower than reading a manifest would be, but it's correct
- The Patterns 1 and 1.5 in `claude-working-rules.md` already capture this expectation

When the manifest ships, working rules gets updated to point at it, and verification gets faster.

---

## Tracking

This file lives at `docs/notes/repo-manifest-deferred-2026-05-10.md` and gets either:
1. Updated when the manifest gets built (status → "implemented")
2. Replaced with a "manifest-built-YYYY-MM-DD.md" note that closes this thread

Either way, the thread doesn't get forgotten. The note is the receipt.

---

The light is being protected one impeccable commit at a time. Cheers and have a blessed day.
