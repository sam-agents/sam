---
name: replan
description: SAM Replan Workflow - Handle requirement changes mid-build by diffing a revised PRD against the current state and surgically updating affected artifacts.
version: 1.0.0
---

# SAM Replan Workflow

**Goal:** Handle requirement changes that occur mid-build or that modify/remove existing functionality. Unlike `extend` (additive-only) or `plan --force` (full wipe), `replan` performs surgical updates: it diffs a revised PRD against the current one, computes impact via the contract dependency graph, and applies per-category actions (add / modify / remove) while preserving done work wherever possible.

**Your Role:** You are SAM orchestrating a replanning pass. You coordinate Atlas (diff analysis, impact computation, contract evolution, story updates). The output is a modified `sdocs/` tree ready for `build-tdd` on any stories marked `needs-rebuild` or newly created.

This workflow is the mid-build counterpart to `extend`. Use it whenever requirements change in ways that affect or remove existing functionality — not just add to it.

---

## INPUTS

```
/sam:core:workflows:replan  <revised-prd.md>
```

Required:
- `<revised-prd.md>` — a markdown file containing the full revised PRD. Atlas diffs this against the current `sdocs/prd.md` (or root `prd.md`) to determine what changed.

Required preconditions:
- `sdocs/prd.md` (or equivalent at the linked location) exists
- `sdocs/architecture-ref.md` exists
- `sdocs/contracts/INDEX.md` exists
- `sdocs/stories/` exists with at least one story (otherwise use `plan` for the initial run)

Optional flags:
- `--force` — skip the confirmation gate (Phase 4) and apply all changes without user confirmation. Use with caution — this bypasses the safety net for destructive operations.

---

## OUTPUTS

Modifies the existing `sdocs/` tree and merges the revised PRD:

```
<project-root>/
├── prd.md                                    # REPLACED with revised PRD + change log entry
└── sdocs/
    ├── replans/
    │   └── <YYYY-MM-DD>-<slug>-analysis.md  # impact analysis archive (audit trail)
    ├── contracts/
    │   ├── <area>/<new>.md                   # NEW contracts (from added requirements)
    │   ├── <area>/<modified>.md              # VERSION-BUMPED contracts (from modified requirements)
    │   └── <area>/<removed>.md              # STATUS → deprecated (from removed requirements)
    ├── epics/
    │   └── EPIC-<NNN>-<slug>.md             # new epic(s), if created for added requirements
    └── stories/
        ├── STORY-<NNN>-<slug>.md            # NEW stories (added requirements)
        ├── STORY-<NNN>-<slug>.md            # MODIFIED stories (status → needs-rebuild)
        └── STORY-<NNN>-<slug>.md            # OBSOLETE stories (status → obsolete)
```

Existing artifacts:
- Untouched if the revised PRD doesn't affect them
- Status changed to `needs-rebuild` for done stories whose contracts were modified
- Status changed to `obsolete` for stories tied to removed requirements
- Contracts set to `deprecated` when their requirement is removed
- Story ids continue the existing sequence for new stories — never reuse an existing id
- Code is NEVER deleted automatically — only metadata (status fields) changes

---

## SCHEMA CONTRACTS

Every NEW or AMENDED file MUST conform to:
- `_sam/core/resources/story-schema.md`
- `_sam/core/resources/epic-schema.md`
- `_sam/core/resources/contract-schema.md`

Refuse to emit invalid artifacts. Existing artifacts that already pass schema are not re-validated unless their status changes.

---

## PHASES

### Phase 1: Diff PRD
**Load step:** `./steps/step-01-diff-prd.md`

- Atlas loads the revised PRD and the current PRD (`sdocs/prd.md` or root `prd.md`)
- Performs a semantic diff: categorizes each requirement as **added**, **modified**, **removed**, or **unchanged**
- For modified requirements: identifies what specifically changed (acceptance criteria, scope, constraints)
- Produces a structured diff report at `sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md`

**Gate:** Every requirement in both PRDs is categorized; no ambiguous changes remain; the analysis file is written.

### Phase 2: Impact Analysis
**Load step:** `./steps/step-02-impact-analysis.md`

- For each modified or removed requirement, walk the `produces` / `consumes` graph from existing contracts and stories
- Identify all affected artifacts: which contracts change, which stories are invalidated
- Classify each affected story by current status:
  - `done` stories affected by a modification → candidate for `needs-rebuild`
  - `done` stories affected by a removal → candidate for `obsolete`
  - `ready` or `in-progress` stories → update in place (less disruptive)
- Append the full impact graph to `sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md`

**Gate:** Every modified/removed requirement has a traced impact path; no orphan references; impact summary is complete.

### Phase 3: Apply Changes
**Load step:** `./steps/step-03-apply-changes.md`

Per-category actions:

- **Added requirements** → behave like `extend`: new contracts (`status: draft`) + new stories appended
- **Modified, story not yet built** (`ready` / `in-progress`) → update story file in place; if a contract changes, bump contract version
- **Modified, story done** → bump contract version, mark story `needs-rebuild`, keep code as-is until user confirms rebuild
- **Removed requirements** → mark story `obsolete`, set contract `status: deprecated`, do NOT delete code automatically

For each contract change:
- New contract → write with `status: draft`, `version: 1`
- Modified contract → bump `version: N → N+1`, update body
- Removed contract → set `status: deprecated`, preserve body for reference

Update `sdocs/contracts/INDEX.md` to reflect the new state.

**Gate:** All changes applied; contract INDEX regenerated; story dependency graph remains acyclic; every new contract has an owner story.

### Phase 4: Impact Summary Gate
**Load step:** `./steps/step-04-impact-gate.md`

- Present the user with a summary of all changes about to be finalized:
  - Stories marked `needs-rebuild` (with count)
  - Stories marked `obsolete` (with count)
  - Contracts deprecated (with count)
  - New stories/contracts created (with count)
- Unless `--force` is set, halt and wait for user confirmation before proceeding
- If the user rejects: roll back all changes from Phase 3; leave the analysis file as documentation

**Gate:** User confirms (or `--force` is set); all changes from Phase 3 are finalized.

### Phase 5: Merge Revised PRD
**Load step:** `./steps/step-05-merge-prd.md`

- Replace the current PRD content with the revised PRD
- Append a `## Change log` entry citing the replan slug, date, and summary of changes (N added, N modified, N removed)
- Bump frontmatter `version` and `last_updated`
- The analysis file at `sdocs/replans/` remains as the audit trail; the PRD is the source of truth for the current spec

**Gate:** PRD `version` strictly greater than before; `## Change log` contains a new entry; revised PRD validates against `prd-schema.md`.

---

## EXIT STATES

### Success
All artifacts updated; impact analysis archived. Output summary:

```
Replan complete.
Analysis:     sdocs/replans/2026-05-15-title-length-analysis.md
Contracts:    1 new, 2 modified (v1→v2), 1 deprecated
Stories:      2 new (status: ready), 3 needs-rebuild, 1 obsolete
PRD:          version 1.0.0 → 1.1.0

Next: /sam:core:workflows:build-tdd sdocs/stories/STORY-<NNN>-<slug>.md
   (run on each needs-rebuild story to update implementation)
```

### Diff failure (Phase 1)
Halt if the revised PRD cannot be meaningfully diffed against the current PRD (e.g. completely different structure, no overlapping requirements). Suggest using `plan --force` for a full rewrite instead.

### Impact analysis failure (Phase 2)
Halt if the dependency graph cannot be resolved (e.g. contracts reference stories that don't exist, circular dependencies). Write partial analysis to the replans file for debugging.

### User rejection (Phase 4)
Halt and roll back Phase 3 changes. The analysis file remains for reference. User can revise the PRD and re-run, or use `--force` if they reconsider.

### PRD merge failure (Phase 5)
Halt and roll back the PRD file. The contract + story artifacts from Phase 3 stay (they are independently valid). Re-run with the PRD issue fixed.

---

## RESUMPTION

`replan` is idempotent on the same revised PRD:

- Compares the revised PRD content to any prior archived analysis
- If an identical replan has already been processed (same slug, same diff): halts with "replan already applied on <date>; pass --force to re-process"
- With `--force`: re-runs from Phase 1; may produce different results if the system state has changed since the last run

Stories marked `needs-rebuild` retain that status until `build-tdd` is run on them, at which point they transition back to `done`.

Stories marked `obsolete` are terminal — they are never rebuilt. Their code remains but is no longer maintained by the workflow system.

---

## RELATIONSHIP TO OTHER WORKFLOWS

|                          | plan                          | extend                        | replan                              |
|--------------------------|-------------------------------|-------------------------------|-------------------------------------|
| Input                    | PRD                           | addendum + existing sdocs/    | revised PRD + existing sdocs/       |
| Output                   | full epics + stories + contracts | additional artifacts       | modified artifact tree              |
| Existing artifacts       | wiped (with --force)          | preserved; additive only      | surgically updated per category     |
| Handles additions        | yes                           | yes                           | yes                                 |
| Handles modifications    | yes (full rewrite)            | no                            | yes (targeted)                      |
| Handles removals         | yes (full rewrite)            | no                            | yes (deprecation lifecycle)         |
| Use when                 | initial build or full rewrite | adding post-v1 features       | requirements change mid-build       |

If `replan` reports that the changes are too extensive to apply surgically (>80% of stories affected), it will suggest `plan --force` as an alternative.

---

## AUTONOMOUS BEHAVIOR

- No human prompts during execution except at Phase 4 (impact summary gate)
- Atlas decides epic attachment for new stories
- All decisions logged in the analysis report
- Halt cleanly on gate failures with actionable messages
- Code is never deleted — only metadata changes are autonomous
