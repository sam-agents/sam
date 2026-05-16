---
step: 5
name: merge-prd
description: Merge the revised PRD into sdocs/prd.md with a changelog entry and archive the revised PRD input file
agents: [architect]
---

# Step 5: Merge Revised PRD with Changelog

**Agent:** Atlas (System Architect)

**Purpose:** Merge the revised PRD into the live `sdocs/prd.md` so the PRD reflects the current product state after the replan. The revised PRD input is archived to `sdocs/replans/` as the audit trail. This step is adapted from the `extend` workflow's Phase 4 (`step-04-merge-prd.md`) but handles modifications and removals in addition to additions.

---

## ENTRY CONDITIONS

- Step 4 gate passed — all per-category artifact changes (contracts, stories) have been applied successfully
- Step 4 application log has been appended to the analysis report
- The PRD file exists at the canonical location (default: `sdocs/prd.md`; fallback: `prd.md` at project root)
- The revised PRD input file (passed as the workflow argument) is still accessible
- `sdocs/replans/` directory exists (created by earlier steps)
- `sdocs/replans/<YYYY-MM-DD>-<slug>-diff.md` exists (from Step 1)
- `sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md` exists (from Step 2/4)

If any precondition fails, halt and tell the user which file is missing. Do NOT attempt a partial merge.

---

## SCHEMA REFERENCE

`_sam/core/resources/prd-schema.md`, especially the `## Change log` section. The merge step writes into structures the schema documents.

---

## PROCESS

### 5.1 Locate the PRD

In order:
1. Check `sdocs/prd.md`
2. Check `prd.md` at project root
3. Check any done story's frontmatter `prd:` field resolved to an absolute path
4. If still not found: halt with "cannot locate PRD; specify the path manually"

### 5.2 Read and Parse the Existing PRD

Identify which canonical sections are present. Note the current frontmatter `version` value — the merge must produce a strictly greater version.

Required sections to consider for merging (from `prd-schema.md`):
- `## Functional Requirements` (or equivalent: `## Features`, `## Requirements`)
- `## Non-Functional Requirements`
- `## Out of Scope`
- `## Change log` (optional in schema, but the merge will create it if absent)

### 5.3 Map Revised PRD Changes → PRD Sections

Using the Step 1 diff (`sdocs/replans/<YYYY-MM-DD>-<slug>-diff.md`) as the guide for what changed, apply the following mapping:

| Change category | PRD action |
|-----------------|------------|
| **Added** requirements | Append new requirement entries to `## Functional Requirements` — combine the feature name (bold lead) and a one-paragraph summary. Append acceptance criteria as sub-bullets. |
| **Modified** requirements | Update the affected requirement entries in place. Revise the description and acceptance criteria to match the revised PRD. Do NOT rewrite surrounding unchanged requirements. |
| **Removed** requirements | Mark the requirement as deprecated inline: prefix with `~~` strikethrough and append `(removed in replan <YYYY-MM-DD>)`. Do NOT delete the text — preserve it for audit. |
| **Unchanged** requirements | Do NOT touch. Preserve verbatim. |

### 5.4 Apply the Changes

In this order:

1. **Frontmatter bumps:**
   - `version: N.M` → `version: N.(M+1)` for non-breaking changes; `version: (N+1).0` for breaking changes (removals or modifications that break existing contracts). Atlas decides based on the impact analysis.
   - `last_updated: <today's date>`
   - Leave `created`, `title`, `owner`, `source` untouched

2. **Functional Requirements:** Apply additions, modifications, and removals per Section 5.3.

3. **Non-Functional Requirements:** If the revised PRD modifies NFRs, update them in place. If new NFRs are added, append them.

4. **Out of Scope:** If the revised PRD adds or modifies out-of-scope items, update accordingly. Create `## Out of Scope` if it doesn't exist and the revised PRD specifies exclusions.

5. **Change log:** Append one entry for this replan run:
   ```markdown
   - **<YYYY-MM-DD> — replan: <slug>.** <summary of changes: N requirements added, N modified, N removed. Key changes: brief description of the most significant change>
   ```
   If `## Change log` doesn't exist, create it at the end of the PRD body (after Out of Scope, before Open Questions / Assumptions if those exist).

### 5.5 Preserve Existing Content

Do NOT:
- Rewrite, rephrase, or "improve" existing unchanged sections
- Reorder existing requirements
- Touch `## Assumptions` or `## Open Questions` from the original drafting workflow
- Remove any section that existed before the merge (sections can only be added or have content modified within them)

The only exception: requirements explicitly classified as `removed` in the diff receive strikethrough treatment — this is a controlled, auditable modification, not a deletion.

### 5.6 Archive the Revised PRD Input

Copy the revised PRD input file to:
```
sdocs/replans/<YYYY-MM-DD>-<slug>-revised-prd.md
```

This preserves the exact input that triggered the replan, alongside the diff and analysis reports already in the same directory.

### 5.7 Validate the Result

Before writing:

- [ ] Every section that existed BEFORE the merge still exists
- [ ] Frontmatter `version` is strictly greater than the previous value
- [ ] `## Change log` contains an entry with this run's date and the replan slug
- [ ] PRD still passes `prd-schema.md` validation (required sections present and non-empty)
- [ ] No pre-existing unchanged content was modified (diff the unchanged sections to verify)
- [ ] Archived revised PRD exists at `sdocs/replans/<YYYY-MM-DD>-<slug>-revised-prd.md`
- [ ] Line count of merged PRD is reasonable (may be less than original if removals use strikethrough, but should not drop dramatically)

If any check fails, halt and roll back. Atomic write only.

### 5.8 Write

Replace the PRD file at its discovered location. Print a unified diff (or summary of changed sections) to the run log so the user can review what changed.

---

## OUTPUT SUMMARY

After successful merge, print:

```
PRD merged (replan).
File:              <path>
Version:           <old> → <new>
Requirements added:    <N>
Requirements modified: <N>
Requirements removed:  <N>
Change log:        <YYYY-MM-DD> — replan: <slug>
Archived input:    sdocs/replans/<YYYY-MM-DD>-<slug>-revised-prd.md
```

---

## GATE — MERGE PASSES WHEN

- [ ] PRD file written with strictly-greater `version`
- [ ] `## Change log` entry present with replan slug and date
- [ ] All `added` requirements from the diff appear in the merged PRD's Functional Requirements
- [ ] All `modified` requirements reflect the revised text (not the old text)
- [ ] All `removed` requirements are marked with strikethrough and removal annotation (not deleted)
- [ ] No pre-existing unchanged PRD content was altered or removed
- [ ] PRD still validates against `prd-schema.md`
- [ ] Revised PRD input archived to `sdocs/replans/<YYYY-MM-DD>-<slug>-revised-prd.md`

---

## FAILURE MODES

- **PRD not found:** Halt with the locations tried. User must specify the path or move the PRD to a canonical location.
- **PRD has no canonical sections (free-form prose):** Halt with "PRD too unstructured to merge automatically; convert to `prd-schema.md` format or apply changes by hand." Do not guess.
- **Frontmatter `version` parse fails:** Treat as if `version: 0.1` and bump to `0.2`. Warn in the run log.
- **Validation fails after merge:** Roll back the file. Do not leave the PRD in a half-merged state.
- **Revised PRD input file missing:** Halt. Without the input file, we cannot archive it. The user must provide it again.
- **Archive path collision:** If `sdocs/replans/<YYYY-MM-DD>-<slug>-revised-prd.md` already exists (replan run twice on same day with same slug), append a numeric suffix: `-revised-prd-2.md`, `-revised-prd-3.md`, etc.

---

## RELATIONSHIP TO OTHER STEPS

| Step | Touches | Source of truth |
|------|---------|-----------------|
| 1 diff-prd | nothing (write-only reports) | the revised PRD + current PRD |
| 2 impact-analysis | nothing (write-only reports) | the diff + existing contracts/stories |
| 3 impact-gate | nothing (user confirmation) | the impact summary |
| 4 apply-changes | `sdocs/contracts/**`, `sdocs/stories/**` | the impact analysis |
| **5 merge-prd** | **`sdocs/prd.md`**, **`sdocs/replans/`** | **the revised PRD + diff report** |

The PRD merge is intentionally LAST. If Steps 1–4 fail, the PRD stays untouched, and rerunning `replan` is safe. If Step 5 fails AFTER Steps 1–4 succeeded, the artifacts are coherent (stories + contracts updated) but the PRD is stale — the user can re-run merge alone.

---

## NEXT

Workflow exits. The user runs `build-tdd` on any stories with status `needs-rebuild` or newly created stories with status `ready`.
