---
step: 8
name: docs
description: Per-story changelog entry and API-reference update
agents: [tech-writer]
---

# Step 8: Docs — Per-Story Changelog

**Agent:** Sage (Technical Writer)

**Purpose:** Record this story's changes in the changelog and update API references for any changed public surface. Comprehensive feature docs are handled by `plan-n-build` at the end of a full run, not here.

---

## ENTRY CONDITIONS

- All prior phases passed (or skipped per their activation rules)
- Story `status: in-progress`

---

## PROCESS

```
1. Read the story's AC and changed files
2. Append a changelog entry (Keep a Changelog format) under the Unreleased section
3. If the story touched a public API (HTTP route, exported function, CLI flag):
   - Update or create API reference notes for the changed surface
4. If the story is the first in a project and added a public README-worthy capability:
   - Note it for the comprehensive docs run; do not rewrite README here
```

---

## CHANGELOG FORMAT (Keep a Changelog)

```markdown
## [Unreleased]

### Added
- <STORY-ID>: <one-line summary of what users can now do>

### Changed
- <STORY-ID>: <behavior change visible to users>

### Fixed
- <STORY-ID>: <bug fix visible to users>
```

Pick exactly one section per story. If the story produced internal-only changes (refactor, dependency bump), Sage may skip the changelog — but must note this in the workflow output ("docs: skipped — internal-only change").

If `CHANGELOG.md` does not exist, create it with a [Keep a Changelog](https://keepachangelog.com/) header and an `## [Unreleased]` section.

---

## SCOPE

Per-story docs are intentionally lightweight:
- ✅ Changelog entry
- ✅ API reference delta (when public surface changed)
- ❌ Feature docs / tutorials (handled at end of full run)
- ❌ README rewrites (handled at end of full run)
- ❌ Release notes (handled when cutting a release, not per story)

---

## GATE — DOCS PASSES WHEN

- [ ] Changelog entry added (or explicit "internal-only" skip noted)
- [ ] API reference updated when public surface changed

This phase rarely blocks a story. On unrecoverable failure, log a warning and continue — but never silently skip without logging.

---

## STORY COMPLETION

After this step passes, the workflow:

1. Updates story frontmatter:
   ```yaml
   status: done
   phase_log:
     red:      { completed_at: <ts>, tests_written: <n> }
     green:    { completed_at: <ts>, tests_passing: <n> }
     refactor: { completed_at: <ts>, issues_found: <n> }
     ui:       { completed_at: <ts> }        # if ran
     css:      { completed_at: <ts> }        # if ran
     a11y:     { completed_at: <ts> }        # if ran
     security: { completed_at: <ts> }        # if ran
     docs:     { completed_at: <ts> }
   ```
2. Prints completion summary to the user
3. Exits cleanly — the workflow does NOT advance to another story (that's `plan-n-build`'s job)
