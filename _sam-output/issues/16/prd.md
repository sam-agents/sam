# PRD: Workflow: replan — handle requirement changes mid-build

> **Issue:** #16
> **Repository:** sam-agents/sam
> **Generated:** 2026-05-16T10:35:16.967Z
> **Type:** feature
> **Priority:** medium
> **Labels:** feature, workflow, enhancement, complex

---

## Overview

Implement 'sam-replan' workflow to handle mid-build requirement changes

## Original Request

## Problem

Today's workflows handle the linear happy path (`plan` → `build-tdd` → done) and additive iteration after v1 (`extend`), but do **not** handle requirement changes that occur mid-build or that modify/remove existing functionality.

## Scenarios we cannot handle today

| Scenario | Current outcome |
|---|---|
| Mid-build: a requirement changes (e.g. \"title max should be 100 not 200\", stories 2–3 done) | No workflow. `plan --force` wipes everything including done stories. Manual edit is the only option. |
| Mid-build: a feature is added | Awkward. `extend` is designed for post-v1, not mid-build. |
| Feature removal (\"drop tags entirely\") | No workflow. User manually edits files. No deprecation lifecycle. |
| Bug fix in done work | Partial — user can re-invoke `build-tdd` on one story, but there is no formal `fix` workflow framing it. |
| Tech-stack pivot | No workflow. Effectively `plan --force` rebuild from scratch. |

## Proposed shape: `sam-replan`

```
sam-replan <revised-prd.md>
```

Pipeline:

1. **Diff** — compare revised PRD against current `prd.md`. Categorize each change: added / modified / removed / unchanged.
2. **Impact analysis** — for each modified or removed item, walk the `produces` / `consumes` graph from the existing contracts and stories to identify affected artifacts.
3. **Per-category action** —
   - Added → behave like `extend` (new contracts + stories appended)
   - Modified, story not yet built → update story file in place; if a contract changes, bump version
   - Modified, story done → bump contract version, mark story `needs-rebuild`, keep code as-is until user confirms rebuild
   - Removed → mark story `obsolete`, deprecate the contract, do **not** delete code automatically
4. **Impact summary as a gate** — show the user what will change before doing anything (\"you're about to invalidate 4 done stories — confirm?\").
5. **Merge revised PRD** into `prd.md` with a change-log entry (reuse Phase 4 from `extend`).

## Why this is tractable now

Contracts-first design from v0.8.0 already gives us the dependency graph: every story declares its `produces` and `consumes` contracts. `replan` walks that graph to compute impact. The hard problem (which artifacts are affected by a given PRD change) is already half-solved.

## Acceptance criteria

- New workflow registered in `_sam/_config/workflow-manifest.csv` and `bin/cli.js`
- Story status lifecycle gains `needs-rebuild` and `obsolete`
- Contract lifecycle gains `deprecated`
- Diff + impact summary printed before any file is touched
- Tested on a real iteration scenario (e.g. modify the sam26 todo PRD mid-build)

## Out of scope

- Automatic code deletion when features are removed (defer to user)
- Automatic dependency-graph repair when contracts diverge — keep it explicit

---

## 🎯 Implementation Plan

### Summary
Implement the `sam-replan` workflow — a 5-step pipeline that diffs a revised PRD against the current one, computes impact on existing contracts/stories, and surgically updates artifacts while preserving done work. This requires new story statuses (`needs-rebuild`, `obsolete`), a new contract status (`deprecated` already exists), and an interactive impact-summary gate.

---

### Tasks

- [ ] **Task 1: Add `needs-rebuild` and `obsolete` to the story status lifecycle**
  - Edit `_sam/core/resources/story-schema.md` to add `needs-rebuild` and `obsolete` to the `status` enum and transition rules
  - `needs-rebuild`: a done story whose contract changed; code is kept but story must be re-built when user confirms
  - `obsolete`: a story whose feature was removed from the PRD; code is not deleted but story is retired
  - Add transition rules: `done → needs-rebuild`, `done → obsolete`, `ready → obsolete`, `in-progress → obsolete`, `needs-rebuild → in-progress` (when user confirms rebuild)
  - **Files:** `_sam/core/resources/story-schema.md`
  - **Acceptance:** Schema doc lists both new statuses with clear transition rules; existing statuses unchanged

- [ ] **Task 2: Document the `deprecated` contract status in contract-schema.md**
  - `deprecated` already exists in contract-schema.md — verify it has clear lifecycle guidance for the replan use case
  - Add a "Replan lifecycle" subsection under Field rules → `status` explaining that replan may set `deprecated` when a feature is removed, and that `deprecated` contracts are not deleted
  - **Files:** `_sam/core/resources/contract-schema.md`
  - **Acceptance:** Contract schema documents how `deprecated` is used during replan; no new status values needed

- [ ] **Task 3: Create the `replan` workflow directory and `workflow.md`**
  - Create `_sam/core/workflows/replan/workflow.md` following the `extend` pattern
  - Frontmatter: `name: replan`, `description`, `version: 1.0.0`
  - Sections: Goal, Your Role, INPUTS (revised PRD path), Required preconditions (same as extend: sdocs/ must exist with at least one story), Optional flags (`--force`), OUTPUTS (modified sdocs/ tree + impact summary), Phase overview (5 phases listed below)
  - Define output structure including `sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md` for impact archive
  - **Files:** `_sam/core/workflows/replan/workflow.md`
  - **Acceptance:** workflow.md is valid, follows extend's structure, documents all 5 phases at a high level

- [ ] **Task 4: Write Step 1 — Diff revised PRD against current PRD**
  - Create `_sam/core/workflows/replan/steps/step-01-diff-prd.md`
  - Agent: `architect` (Atlas)
  - Purpose: Compare revised PRD against `sdocs/prd.md`, categorize each requirement as `added | modified | removed | unchanged`
  - Entry conditions: revised PRD file exists, `sdocs/prd.md` exists
  - Required reading: both PRDs, `sdocs/architecture-ref.md`
  - Process: section-by-section comparison, produce a structured diff summary
  - Output: `sdocs/replans/<YYYY-MM-DD>-<slug>-diff.md` with categorized changes
  - Gate: every PRD section classified; no unclassified sections remain
  - **Files:** `_sam/core/workflows/replan/steps/step-01-diff-prd.md`
  - **Acceptance:** Step file follows build-tdd/extend step anatomy (frontmatter, entry conditions, required reading, process, gate conditions, failure modes, next step)

- [ ] **Task 5: Write Step 2 — Impact analysis on contracts and stories**
  - Create `_sam/core/workflows/replan/steps/step-02-impact-analysis.md`
  - Agent: `architect`
  - Purpose: For each `modified` or `removed` item from Step 1, walk the `produces`/`consumes` graph to identify affected contracts and stories
  - Required reading: `sdocs/contracts/INDEX.md`, all story files, diff output from Step 1
  - Process: for each changed requirement, find contracts that implement it (via story `produces`), then find downstream consumers; classify each affected artifact with its current status (done, ready, in-progress, etc.)
  - Output: append impact matrix to `sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md`
  - Gate: every modified/removed requirement has at least one mapped artifact or explicit "no impact" note
  - **Files:** `_sam/core/workflows/replan/steps/step-02-impact-analysis.md`
  - **Acceptance:** Step file documents the graph-walking algorithm; output format for the impact matrix is specified

- [ ] **Task 6: Write Step 3 — Impact summary gate (user confirmation)**
  - Create `_sam/core/workflows/replan/steps/step-03-impact-gate.md`
  - Agent: `architect`
  - Purpose: Present the impact summary to the user and require explicit confirmation before making changes
  - Process: format the impact matrix as a human-readable summary (X stories affected, Y contracts to update, Z stories to mark obsolete, W done stories to mark needs-rebuild); ask user to confirm or abort
  - Gate: user confirms `proceed` — if user aborts, halt workflow cleanly with no file modifications
  - **Files:** `_sam/core/workflows/replan/steps/step-03-impact-gate.md`
  - **Acceptance:** Step halts without side effects if user declines; confirmation is explicit (not implicit)

- [ ] **Task 7: Write Step 4 — Apply per-category changes to contracts and stories**
  - Create `_sam/core/workflows/replan/steps/step-04-apply-changes.md`
  - Agent: `architect`
  - Purpose: Execute the actual artifact changes based on the confirmed impact analysis
  - Per-category actions:
    - **Added** → behave like `extend` (new contracts at `draft`, new stories at `ready`, append to epics)
    - **Modified, story not yet built** → update story file in place; bump contract version if contract changes
    - **Modified, story done** → bump contract version, set story status to `needs-rebuild`, preserve existing code
    - **Removed** → set story status to `obsolete`, set contract status to `deprecated`, do NOT delete files
  - Gate: all affected artifacts updated; no contract left without an owner; `depends_on` graph remains acyclic; INDEX.md updated
  - **Files:** `_sam/core/workflows/replan/steps/step-04-apply-changes.md`
  - **Acceptance:** Each of the 4 categories has explicit, detailed instructions; gate conditions are checklistable

- [ ] **Task 8: Write Step 5 — Merge revised PRD with changelog**
  - Create `_sam/core/workflows/replan/steps/step-05-merge-prd.md`
  - Agent: `architect`
  - Purpose: Merge the revised PRD into `sdocs/prd.md` with a changelog entry
  - Reuse the pattern from `extend` Phase 4 (`step-04-merge-prd.md`) — read it for reference
  - Process: update affected sections in the PRD body, bump `version` in frontmatter, append to `## Change log` with date + summary of what changed and why
  - Archive the revised PRD input to `sdocs/replans/<YYYY-MM-DD>-<slug>-revised-prd.md`
  - Gate: PRD version strictly greater than previous; changelog entry present; pre-existing unchanged content preserved
  - **Files:** `_sam/core/workflows/replan/steps/step-05-merge-prd.md`
  - **Acceptance:** Step follows extend's merge-prd pattern; changelog format is consistent

- [ ] **Task 9: Register `replan` in workflow-manifest.csv**
  - Add row to `_sam/_config/workflow-manifest.csv`: `"replan","SAM Replan Workflow - Handle mid-build requirement changes by diffing revised PRD, computing impact, and surgically updating contracts and stories without destroying done work.","core","_sam/core/workflows/replan/workflow.md"`
  - **Files:** `_sam/_config/workflow-manifest.csv`
  - **Acceptance:** `npm test` (verify-manifest) passes with the new row

- [ ] **Task 10: Register `replan` in `bin/cli.js` WORKFLOWS array**
  - Add a new entry to the `WORKFLOWS` array (after `extend`): `{ name: 'replan', file: 'core/workflows/replan/workflow.md', display: 'SAM Replan Workflow', description: '...' }`
  - This automatically gets picked up by `generateCursorRules`, `generateClaudeCommands`, `generateGeminiSkills`, `generateCopilotSkills`, and `generateAntigravitySkills` since they iterate over `WORKFLOWS`
  - **Files:** `bin/cli.js`
  - **Acceptance:** `node bin/cli.js --platform all ./test-project` generates replan skills for all platforms

- [ ] **Task 11: Run `sync-templates` and verify**
  - Run `npm run sync-templates` to mirror `_sam/` → `templates/_sam/`
  - Run `npm test` to confirm verify-sync, verify-manifest, and verify-gemini all pass
  - Smoke-test with `node bin/cli.js --platform all ./test-project` and confirm replan skill files appear
  - **Files:** `templates/_sam/core/workflows/replan/` (generated), `templates/_sam/_config/workflow-manifest.csv` (generated)
  - **Acceptance:** `npm test` passes; replan workflow files exist in `templates/`; platform skill files generated for all 5 platforms

---

### Technical Considerations
- **Extend is the closest analog** — replan's steps 4 and 5 heavily mirror extend's steps 2–4. Reference extend's step files when writing replan steps.
- **The `produces`/`consumes` graph is the key data structure** — Step 2 (impact analysis) depends on walking this graph. The graph already exists in story frontmatter; no new infrastructure is needed.
- **No code deletion** — the issue explicitly scopes out automatic code deletion. `obsolete` stories and `deprecated` contracts keep their files intact.
- **`needs-rebuild` is a user-driven gate** — marking a story `needs-rebuild` does NOT trigger an automatic rebuild. The user must explicitly invoke `build-tdd` on that story, which reads the status and proceeds.
- **Idempotency** — archive the revised PRD and diff in `sdocs/replans/` so repeated invocations can detect prior runs (same pattern as extend's `sdocs/addenda/`).
- **Step file anatomy** must include: frontmatter, agent, purpose, entry conditions, required reading, process, gate conditions, failure modes, next step — match existing step files exactly.

### Dependencies
- Requires familiarity with the `extend` workflow (read all 4 step files as reference before starting)
- Tasks 1–2 (schema changes) should be done before Tasks 4–8 (step files reference the new statuses)
- Task 3 (workflow.md) should be done before Tasks 4–8 (step files reference the phase overview)
- Tasks 9–10 (registration) can be done in parallel with step file writing
- Task 11 (sync + verify) must be last

### Estimated Complexity
**Medium** — No runtime code to write (this is a template-generation tool). All deliverables are markdown workflow definitions following well-established patterns. The intellectual complexity is in the impact-analysis algorithm design (Step 2) and the per-category mutation rules (Step 4), but the implementation is documentation, not code.

---
*🏷️ Add label `ready-for-dev` when ready for implementation*

---

## 🏗️ Architecture Review

### Overview

The `replan` workflow is a 5-phase pipeline that diffs a revised PRD against the current one, computes impact via the `produces`/`consumes` contract graph, and surgically updates stories and contracts — introducing two new story statuses (`needs-rebuild`, `obsolete`) and leveraging the existing `deprecated` contract status. The implementation plan proposes 11 tasks, all markdown template files plus two registration points (`workflow-manifest.csv` and `bin/cli.js`). No runtime code changes.

### Component Design

```
                          ┌──────────────────────┐
                          │   Revised PRD (input) │
                          └──────────┬───────────┘
                                     │
                    ┌────────────────▼───────────────┐
                    │  Step 1: Diff PRD               │
                    │  Agent: Atlas                   │
                    │  In: revised-prd + sdocs/prd.md │
                    │  Out: categorized diff           │
                    │       (added/modified/removed/   │
                    │        unchanged)                │
                    └────────────────┬───────────────┘
                                     │
                    ┌────────────────▼───────────────┐
                    │  Step 2: Impact Analysis        │
                    │  Agent: Atlas                   │
                    │  In: diff + contracts/INDEX.md  │
                    │      + all stories              │
                    │  Out: impact matrix             │
                    │  (walks produces/consumes DAG)  │
                    └────────────────┬───────────────┘
                                     │
                    ┌────────────────▼───────────────┐
                    │  Step 3: Impact Gate            │
                    │  Agent: Atlas                   │
                    │  In: impact matrix              │
                    │  Out: user confirms / aborts    │
                    │  ⚠️  NO FILE WRITES BEFORE THIS │
                    └────────────────┬───────────────┘
                                     │ (user confirms)
                    ┌────────────────▼───────────────┐
                    │  Step 4: Apply Changes          │
                    │  Agent: Atlas                   │
                    │  Per-category mutations:         │
                    │  • added → new contracts+stories│
                    │  • modified (not built) → update │
                    │  • modified (done) → needs-rebuild│
                    │  • removed → obsolete/deprecated │
                    └────────────────┬───────────────┘
                                     │
                    ┌────────────────▼───────────────┐
                    │  Step 5: Merge PRD              │
                    │  Agent: Atlas                   │
                    │  In: revised PRD + live PRD     │
                    │  Out: updated prd.md + changelog│
                    │  (mirrors extend step-04)       │
                    └────────────────┬───────────────┘
                                     │
                          ┌──────────▼───────────┐
                          │  sdocs/replans/       │
                          │  (audit trail)        │
                          └──────────────────────┘
```

### Data Model

**Story status lifecycle — proposed additions:**

```
                    ┌─────────┐
                    │  draft  │
                    └────┬────┘
                         │
                    ┌────▼────┐
              ┌─────│  ready  │─────────────┐
              │     └────┬────┘             │
              │          │                  │
              │     ┌────▼──────┐           │
              │     │in-progress│───┐       │
              │     └───────────┘   │       │
              │                     │       │
              │          ┌──────▼──────┐    │
              │          │    done     │    │
              │          └──┬─────┬───┘    │
              │             │     │        │
              │    ┌────────▼┐  ┌─▼──────────┐
              │    │needs-   │  │  obsolete   │◄──┤
              │    │rebuild  │  └─────────────┘   │
              │    └────┬────┘                    │
              │         │                         │
              │    ┌────▼──────┐                  │
              │    │in-progress│ (user confirms)  │
              │    └───────────┘                  │
              │                                   │
              └──────► obsolete ◄─────────────────┘
              (any non-done status → obsolete)

    ┌─────────┐
    │ blocked │  (any → blocked, unchanged)
    └─────────┘
```

**Contract status lifecycle — no new values needed:**

```
  draft → stable → deprecated
                    (replan sets this on removal)
```

**New artifact directory:**

```
sdocs/replans/
  <YYYY-MM-DD>-<slug>-diff.md           # Step 1 output
  <YYYY-MM-DD>-<slug>-analysis.md       # Step 2 output (impact matrix)
  <YYYY-MM-DD>-<slug>-revised-prd.md    # Input archive (Step 5)
```

### Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| All 5 steps use Atlas | Single agent | All phases are architectural reasoning (diff, impact, mutation rules). No code is written, so Titan/Dyna/Argus are irrelevant. Matches `extend` which also uses Atlas for all 4 steps. |
| `needs-rebuild` as status, not flag | Story `status` field | Consistent with existing pattern: status is the single source of truth for resume. A separate flag would create dual-state ambiguity. |
| No automatic code deletion | Explicit out-of-scope | Correct — agents should never silently delete user code. `obsolete` marks intent; user acts on it. |
| Audit trail in `sdocs/replans/` | Mirrors `sdocs/addenda/` from extend | Enables idempotency detection and provides decision history. Consistent pattern. |
| Gate before file writes (Step 3) | Interactive confirmation | High-blast-radius operation — mutating done stories is irreversible in workflow terms. Gate is essential. |
| Reuse extend's merge-PRD pattern | Step 5 mirrors extend step-04 | Proven pattern, avoids divergence. PRD merge logic shouldn't differ by workflow. |

### Risk Assessment

**High Risk:**

- **Step 2's "requirement → contract" mapping is under-specified.** The diff in Step 1 produces _PRD-level_ changes (sections, requirements). Step 2 must map those to _contracts_. But contracts aren't tagged with which PRD requirement they implement — they're tagged with an `owner_story`, and stories are tagged with ACs from the PRD. The mapping is `PRD requirement → story ACs → story → produces → contract`. This multi-hop walk is the hardest part of the workflow and the plan doesn't detail how the agent should resolve ambiguous mappings (e.g., a PRD section that maps to 3 stories producing 5 contracts). **Recommendation:** Step 2 should include explicit heuristics for this mapping — e.g., keyword matching between PRD section titles and story titles, or requiring the user to annotate which requirements changed.

**Medium Risk:**

- **`needs-rebuild` → `in-progress` transition needs a trigger mechanism.** The plan says the user "must explicitly invoke `build-tdd`" on a `needs-rebuild` story, but `build-tdd`'s entry condition today checks for `status: ready` or `status: in-progress`. It will reject `needs-rebuild` unless we also update `build-tdd`'s entry conditions. **Recommendation:** Add a note in Task 1 that `build-tdd` step-01-red.md entry conditions must accept `needs-rebuild` as a valid starting status (treating it like `ready`), or document that the user must manually set status to `in-progress` first. I'd favor the former — adding `needs-rebuild` to build-tdd's accepted statuses is cleaner.

- **Contract version bumping on "modified, done" stories.** Step 4 says to bump the contract version when a done story's requirement changes. But version bumps can cascade — any story that `consumes` that contract at the old version may also need attention. The impact analysis in Step 2 should flag these transitive consumers, but Step 4's instructions should explicitly handle the cascade (mark downstream consumers as `needs-rebuild` too, or at minimum flag them in the output).

- **Ordering of Steps 4 and 5.** Step 4 modifies stories/contracts, Step 5 merges the PRD. If Step 4 fails mid-way (e.g., agent hits a complex case), we have partially-mutated artifacts but the PRD still reflects the old state. Consider whether Step 5 should run first (merge PRD as the source of truth) and Step 4 second (mutate artifacts to match). Counter-argument: the current order lets the user see artifact changes before the PRD is locked in. I'd keep the current order but add a rollback note to Step 4's failure modes.

**Low Risk:**

- **`obsolete` stories still appear in `depends_on` chains.** If STORY-003 is marked `obsolete` but STORY-005 has `depends_on: [STORY-003]`, the DAG is now semantically broken (depending on retired work). Step 4 should address this — either remove obsolete stories from downstream `depends_on` lists or document that `obsolete` stories are treated as `done` for dependency purposes.

- **Duplicate replan runs.** If the user runs `replan` twice with similar PRDs, the idempotency check (detecting prior runs in `sdocs/replans/`) isn't detailed. The plan mentions it but doesn't specify behavior. Should be documented in Step 1.

### Implementation Notes

- **Read all 4 extend step files before writing any replan step.** The plan says this but it bears emphasis — the extend steps are the structural template. Match their section ordering exactly: frontmatter → purpose → entry conditions → required reading → process → gate conditions → failure modes → next step.

- **Step file frontmatter pattern** from build-tdd:
  ```yaml
  ---
  step: 1
  name: diff-prd
  description: Compare revised PRD against current PRD and categorize changes
  agents: [architect]
  ---
  ```

- **The `sdocs/replans/` directory parallels `sdocs/addenda/`** from extend. Use the same naming convention: `<YYYY-MM-DD>-<slug>-<type>.md`.

- **For Task 10 (cli.js registration):** the entry goes after `extend` in the WORKFLOWS array. The shape is:
  ```js
  {
    name: 'replan',
    file: 'core/workflows/replan/workflow.md',
    display: 'SAM Replan Workflow',
    description: 'Handle mid-build requirement changes...'
  }
  ```

- **For Task 9 (manifest):** match the CSV quoting style exactly — all four fields double-quoted, no trailing newline issues.

- **`blocked` status transitions are unchanged** — any status can transition to `blocked`. The plan correctly doesn't touch this.

- **Step 4 is the most complex step file** — it has 4 distinct sub-algorithms (one per category). Structure it with clear H3 subheadings for each category to keep it scannable.

### Questions for Stakeholder

1. **`needs-rebuild` and `build-tdd` integration:** Should `build-tdd` step-01-red accept `needs-rebuild` as a valid entry status? The plan is silent on this. If not, the user must manually edit story status before rebuilding, which adds friction.

2. **Transitive impact cascading:** When a done story is marked `needs-rebuild` due to a contract version bump, should its downstream consumers (stories that `consumes` the same contract) also be flagged? The issue description doesn't address transitive impact explicitly.

3. **`--force` flag mentioned in Task 3 workflow.md:** What should `--force` do — skip the impact gate (Step 3)? This should be documented but I'd recommend against implementing it in v1, since the gate is the primary safety mechanism.

---

*🏗️ Architecture review complete. The plan is sound and well-structured — the extend workflow provides a proven template. The primary risk is the PRD-to-contract mapping heuristic in Step 2, which needs more specificity. The `needs-rebuild` integration with `build-tdd` is a small but important gap to close. Ready for implementation after addressing the high-risk item.*

---

## Notes

- Target Directory: `/tmp/sam-repos/sam-agents/sam`
- Tech Stack: JavaScript

---

*🤖 Generated by Tara 🎯 (Triage) → Pete 📋 (Planning) → Alex 🏗️ (Architecture)*
