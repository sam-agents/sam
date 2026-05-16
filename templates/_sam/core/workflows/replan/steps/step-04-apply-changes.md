---
step: 4
name: apply-changes
description: Execute per-category artifact changes (added, modified-unbuilt, modified-done, removed) based on the confirmed impact analysis
agents: [architect]
---

# Step 4: Apply Per-Category Changes to Contracts and Stories

**Agent:** Atlas (System Architect)

**Purpose:** Execute the actual artifact changes based on the confirmed impact analysis from Step 2 and the user confirmation from Step 3. Each change category (added, modified-unbuilt, modified-done, removed) has distinct handling rules. This step modifies files — it is the first step in the pipeline that writes to `sdocs/contracts/` and `sdocs/stories/`.

---

## ENTRY CONDITIONS

- Step 3 gate passed — user confirmed `proceed` OR `--force` flag was set
- Step 2 impact analysis report exists at `sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md`
- The analysis report contains a valid `Full Impact Matrix` section with per-artifact actions
- `sdocs/contracts/INDEX.md` exists and is readable
- `sdocs/stories/` directory exists with at least one story file
- `sdocs/replans/<YYYY-MM-DD>-<slug>-diff.md` exists (for added section details)

If any precondition fails, halt and tell the user which file is missing. Do NOT attempt partial application.

---

## REQUIRED READING

Before applying any changes:
- `sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md` — the full impact matrix (authoritative input for this step)
- `sdocs/replans/<YYYY-MM-DD>-<slug>-diff.md` — the PRD diff (needed for added section details)
- `sdocs/contracts/INDEX.md` — current contract registry
- Each contract and story file listed in the impact matrix — read before modifying

---

## PROCESS

### 4.1 Category: ADDED Requirements

For each requirement classified as `added` in the Step 1 diff, behave identically to the `extend` workflow:

**Contracts:**
- Create new contract files in `sdocs/contracts/` following the standard contract template
- Set status to `draft`
- Assign the next available contract ID (check INDEX.md for the current highest ID)
- Fill in `produces` and `consumes` fields based on the added requirement's scope
- Add the new contract to `sdocs/contracts/INDEX.md`

**Stories:**
- Create new story files in `sdocs/stories/` following the standard story template
- Set status to `ready`
- Link to the newly created contracts via `produces` and `consumes` fields
- Derive acceptance criteria directly from the added PRD section
- Append new stories to the relevant epic file (or create a new epic if the added requirement is a standalone feature)
- Assign the next available story ID (check existing stories for the current highest ID)

**Validation for added:**
- [ ] Each added requirement has at least one contract created
- [ ] Each added requirement has at least one story created
- [ ] All new contracts are registered in INDEX.md
- [ ] All new stories reference their contracts in `produces`/`consumes`
- [ ] New story IDs do not collide with existing IDs

---

### 4.2 Category: MODIFIED — Story Not Yet Built

For requirements classified as `modified` where the associated stories have status `draft`, `ready`, or `blocked` (i.e., no code has been written yet):

**Contracts:**
- If the contract is in `draft` status: update the contract file in place. No version bump needed — drafts are mutable.
- If the contract is in `stable` status: bump the `version` field (e.g., `1.0.0` → `1.1.0` for additive changes, `2.0.0` for breaking changes). Add a changelog entry to the contract file noting what changed and why.
- Update the contract body (fields, endpoints, interfaces) to reflect the modified requirement
- Update `sdocs/contracts/INDEX.md` if the contract description changed

**Stories:**
- Update the story file in place:
  - Revise acceptance criteria to match the modified requirement
  - Update the `produces`/`consumes` references if contract IDs or versions changed
  - Add a note in the story's changelog section: `[replan <date>] ACs updated per revised PRD`
- Do NOT change the story status — it remains `draft`/`ready`/`blocked` as before
- If the story's `depends_on` references changed contracts, verify the dependency still resolves

**Validation for modified-unbuilt:**
- [ ] Each affected contract has its body updated to reflect the new requirement text
- [ ] Stable contracts received a version bump; draft contracts were updated in place
- [ ] Each affected story has revised acceptance criteria
- [ ] Story `produces`/`consumes` references point to correct contract versions
- [ ] No story status was changed (remains draft/ready/blocked)

---

### 4.3 Category: MODIFIED — Story Done or In-Progress

For requirements classified as `modified` where the associated stories have status `done` or `in-progress` (i.e., code exists for this story):

**Contracts:**
- Bump the contract `version` field:
  - Minor bump (`1.0.0` → `1.1.0`) if the change is additive (new fields, relaxed constraints)
  - Major bump (`1.0.0` → `2.0.0`) if the change is breaking (removed fields, tightened constraints, changed types)
- Add a changelog entry: `[replan <date>] <description of change>. Stories marked needs-rebuild.`
- Update the contract body to reflect the modified requirement
- Do NOT change the contract status — it remains `stable`

**Stories:**
- Set story status to `needs-rebuild`
- Add a changelog entry: `[replan <date>] Status changed to needs-rebuild. Requirement modified: <brief description>`
- Update the acceptance criteria to reflect the new requirement (so the rebuild targets the correct behavior)
- Update `produces`/`consumes` references to point to the new contract version
- Preserve all existing fields (implementation notes, code references, etc.) — do NOT delete any information about the existing implementation
- Do NOT modify or delete any code files — only story metadata changes

**Important:** The `needs-rebuild` status signals to the `build-tdd` workflow that this story needs a new TDD pass. The existing code is preserved as-is until the user explicitly triggers a rebuild.

**Validation for modified-done:**
- [ ] Each affected contract received a version bump (minor or major as appropriate)
- [ ] Each affected story status is now `needs-rebuild`
- [ ] Story acceptance criteria reflect the NEW requirement (not the old one)
- [ ] Existing implementation notes and code references are preserved in the story file
- [ ] No code files were modified or deleted
- [ ] Contract changelog documents the change and references the replan

---

### 4.4 Category: REMOVED Requirements

For requirements classified as `removed` in the Step 1 diff:

**Contracts:**
- Set contract status to `deprecated`
- Add a `deprecated_date` field with today's date
- Add a `deprecated_reason` field: `Requirement removed in replan <YYYY-MM-DD>-<slug>`
- Add a changelog entry: `[replan <date>] Deprecated — requirement removed from PRD`
- Do NOT delete the contract file — it remains as documentation
- Do NOT remove the contract from INDEX.md — update its status column to `deprecated`

**Stories:**
- Set story status to `obsolete`
- Add a changelog entry: `[replan <date>] Status changed to obsolete. Requirement removed from PRD.`
- Do NOT delete the story file — it remains as documentation
- Do NOT modify or delete any code files associated with the story
- If the story has `produces` contracts that are ONLY consumed by other obsolete stories, note this in the changelog (orphan detection)

**Important constraints:**
- Never delete files during a replan. Deprecated/obsolete artifacts serve as documentation of what existed and why it was removed.
- Never modify code automatically when a requirement is removed. The user decides when and how to clean up implementation artifacts.

**Validation for removed:**
- [ ] Each affected contract status is now `deprecated`
- [ ] Each affected contract has `deprecated_date` and `deprecated_reason` fields
- [ ] Each affected story status is now `obsolete`
- [ ] No files were deleted (contracts or stories)
- [ ] No code files were modified or deleted
- [ ] INDEX.md reflects the `deprecated` status for affected contracts

---

## 4.5 Update INDEX.md

After all per-category changes are applied, regenerate the summary sections of `sdocs/contracts/INDEX.md`:

- Update status for modified contracts (version bumps)
- Update status for deprecated contracts
- Add entries for newly created contracts
- Verify the total contract count matches the number of contract files

---

## 4.6 Validate Dependency Graph

After all changes are applied, perform a consistency check on the `depends_on` / `produces` / `consumes` graph:

1. **No dangling references:** Every contract ID referenced in a story's `produces`/`consumes` must exist in `sdocs/contracts/`
2. **No orphaned active contracts:** Every non-deprecated contract should be referenced by at least one non-obsolete story (warn if not — do not halt)
3. **Acyclic check:** Walk the `depends_on` graph across stories. If a cycle is detected, halt and report the cycle — do not proceed to Step 5
4. **Version consistency:** If a story references a contract, it must reference the current version (not a stale version left over from before the replan)

If validation fails on items 1, 3, or 4: halt with a detailed error. These are structural problems that must be fixed before proceeding.
If validation fails on item 2 (orphaned contracts): log a warning but continue — orphaned contracts may be consumed by future stories.

---

## 4.7 Write Application Log

Append the application results to the analysis report (`sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md`):

```markdown
## Step 4: Changes Applied

- **Date:** <timestamp>
- **Contracts created:** <N>
- **Contracts version-bumped:** <N>
- **Contracts deprecated:** <N>
- **Contracts updated in place:** <N>
- **Stories created:** <N>
- **Stories marked needs-rebuild:** <N>
- **Stories marked obsolete:** <N>
- **Stories updated in place:** <N>
- **Dependency graph valid:** yes | no (with details)
- **Warnings:** <any non-fatal issues>
```

---

## GATE — APPLY CHANGES PASSES WHEN

- [ ] All `added` requirements have new contracts (status: `draft`) and new stories (status: `ready`)
- [ ] All `modified-unbuilt` stories have updated ACs; their contracts are updated (version-bumped if stable, edited in place if draft)
- [ ] All `modified-done` stories are now status `needs-rebuild`; their contracts are version-bumped with changelog entries
- [ ] All `removed` stories are now status `obsolete`; their contracts are status `deprecated` with `deprecated_date` and `deprecated_reason`
- [ ] No files were deleted during this step
- [ ] No code files were modified during this step (only `sdocs/` artifacts)
- [ ] `sdocs/contracts/INDEX.md` is updated and accurate
- [ ] Dependency graph passes: no dangling references, no cycles, version references are current
- [ ] Application log appended to the analysis report

---

## FAILURE MODES

- **Missing analysis report or gate not passed:** Halt immediately. Step 4 must never run without Step 3 confirmation.
- **Contract ID collision:** If a new contract ID would collide with an existing one, increment until a unique ID is found. Log the collision.
- **Story ID collision:** Same as contract — increment until unique. Log the collision.
- **Cycle detected in dependency graph:** Halt and report the full cycle path. The user must resolve the cycle before the replan can continue. Suggest which `depends_on` edge to remove.
- **Stale version reference:** If a story references an old contract version after the replan applied a bump, fix the reference automatically and log it as a correction.
- **File write failure:** If any file cannot be written, halt immediately and report which files were successfully updated and which failed. Do not leave the system in a partially-applied state — roll back all changes in the current category if possible.

---

## NEXT

→ Step 5: Merge Revised PRD (`step-05-merge-prd.md`)

With all contracts and stories updated, Atlas merges the revised PRD into `sdocs/prd.md` with a changelog entry, completing the replan pipeline. The merged PRD becomes the new source of truth for subsequent `build-tdd` passes on `needs-rebuild` stories.
