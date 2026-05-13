---
name: plan-n-build
description: SAM end-to-end composer - runs plan, then tdd for every story, then comprehensive docs. The one-shot PRD → working code experience.
version: 1.0.0
---

# SAM Plan-n-Build Workflow

**Goal:** Take a PRD all the way to working, tested, documented code by composing `plan` and `build-tdd`.

**Your Role:** You are SAM orchestrating the full pipeline. You delegate planning to `plan`, then iterate stories through `build-tdd`, then run Sage one more time for comprehensive feature docs.

This workflow contains **no original logic** beyond composition, ordering, and final-pass docs. All TDD discipline lives in `build-tdd`; all planning lives in `plan`.

---

## INPUTS

```
/sam:core:workflows:plan-n-build <prd-path>            # full pipeline from PRD
/sam:core:workflows:plan-n-build --resume              # resume in current sdocs/ dir
```

Optional flags:
- `--security` — pass through to every `build-tdd` invocation
- `--no-web-review` — pass through to every `build-tdd` invocation
- `--skip-plan` — skip Phase 1 (use existing `sdocs/stories/`); requires `sdocs/stories/` to exist
- `--security-audit-final` — also run Sentinel once at the end against the whole project

---

## PRECONDITIONS

- Without `--skip-plan` / `--resume`: a PRD path is provided and readable
- With `--resume` or `--skip-plan`: `sdocs/stories/` exists with at least one story

---

## PHASES

### Phase 1: Plan (skippable)

Invoke `/sam:core:workflows:plan <prd-path>` and wait for completion.

Skip when:
- `--skip-plan` is set (use existing `sdocs/stories/`)
- `--resume` is set (resume into existing planning artifacts)

Halt the whole composer if `plan` halts with a validation failure — do not silently fall through into TDD on an invalid plan.

### Phase 2: Execute TDD per story

Build the execution order:

```
1. Read all story files in sdocs/stories/
2. Validate each against story-schema.md; halt on any invalid file
3. Topologically sort by `depends_on` (any cycle → halt)
4. Within each topological layer, sort by `priority`: P0 → P1 → P2
5. Build the queue, skipping stories already at status: done
```

Then, for each story in the queue:

```
if story.status == 'blocked':
    log skip ("blocked from previous run; manual review required")
    continue
if any dep in story.depends_on has status != 'done':
    log skip ("unmet dependency: <DEP-ID>")
    continue

invoke /sam:core:workflows:build-tdd <story-path> [--security] [--no-web-review]
wait for completion

on success:
    record completion in run report
on blocked:
    record block reason in run report
    continue to next story (do NOT halt the whole composer)
```

### Phase 3: Comprehensive Docs

Invoke Sage in **comprehensive mode** once the queue drains:

- Aggregate per-story changelog entries into a single coherent Unreleased section (deduplicate, group by feature)
- Generate feature-level documentation under `docs/features/` for completed epics
- Update top-level README with new public-facing capabilities (Features / Usage / API sections)
- Suggest a semver bump (major / minor / patch) and draft release notes

Sage already runs per-story (lightweight) inside `build-tdd`. This phase is the **comprehensive pass**, not a replacement.

### Phase 4 (opt-in): Final Security Audit

When `--security-audit-final` is set, invoke Sentinel against the whole project (not just changed files). Findings go into the run report — they do not retroactively block completed stories.

### Phase 5: Final Report

Write `sdocs/runs/<timestamp>/run-report.md` summarizing:

- Total stories: completed / blocked / skipped (with reasons)
- Total tests: written / passing
- Phase metrics: counts per phase (RED / GREEN / REFACTOR / UI / CSS / A11y / Security / Docs)
- Blocked stories and their reasons (the punch list for human review)
- Time per phase

Also print a one-screen summary to the user.

---

## RESUMPTION

`plan-n-build --resume` is the safe way to continue an interrupted run:

1. Read all stories in `sdocs/stories/`
2. Skip any with `status: done`
3. Re-queue any with `status: in-progress` (these were interrupted mid-flight; `build-tdd` is idempotent at the phase boundary)
4. Skip `blocked` stories (require manual unblock)
5. Continue the TDD loop from where it left off

Because story `status` is the single source of truth, there is no separate state file to repair.

---

## ERROR HANDLING

| Situation | Behavior |
|-----------|----------|
| `plan` fails validation | Halt entire composer; report PRD revisions needed |
| Story file fails schema validation | Halt before TDD starts; do not implement against invalid stories |
| `depends_on` cycle | Halt before TDD starts; report the cycle |
| Individual story blocks during TDD | Log, continue to next eligible story |
| All remaining stories blocked | Continue to docs / report phases with what's done |
| Sage comprehensive docs fail | Log warning, do not block run; produce report regardless |

The composer is **never silent**: every skip, block, and continuation appears in the final report.

---

## FINAL OUTPUT

```
╔══════════════════════════════════════════════════════════════╗
║                  SAM PLAN-N-BUILD COMPLETE                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Stories:    <done> / <total>  (<blocked> blocked)           ║
║  Tests:      <count> passing                                 ║
║  Duration:   <h>h <m>m                                       ║
║                                                              ║
║  Report:     sdocs/runs/<timestamp>/run-report.md             ║
║  Changelog:  CHANGELOG.md                                    ║
║  Docs:       docs/features/                                  ║
║                                                              ║
║  Blocked:    <list of STORY-IDs needing manual review>       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```
