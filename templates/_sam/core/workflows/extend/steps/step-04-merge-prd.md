---
step: 4
name: merge-prd
description: Apply the addendum's deltas to the live PRD so the PRD reflects the current product state. The addendum file is preserved as the audit trail.
agents: [architect]
---

# Step 4: Merge PRD

**Agent:** Atlas (System Architect)

**Purpose:** Apply the addendum to the **live** `prd.md` so anyone reading the PRD sees the current product, not the v1 snapshot frozen in time. The addendum file remains under `sdocs/addenda/` as the audit trail; the PRD is the source of truth for the current spec.

This step is the difference between `extend` as "additive planning" and `extend` as "additive planning that keeps the docs honest." Without it, every successful `extend` run silently outdates the PRD.

---

## ENTRY CONDITIONS

- Phase 3 passed: new stories written, contracts evolved, integration story emitted
- The PRD file exists at the location declared by the addendum frontmatter (default: `prd.md` at project root; or whatever path the original PRD was written to — derived from any story's `prd:` frontmatter field)
- The validation report from Phase 1 is complete

---

## SCHEMA REFERENCE

`_sam/core/resources/prd-schema.md`, especially the `## Change log` section. The merge step writes into structures the schema documents.

---

## PROCESS

### 4.1 Locate the PRD

In order:
1. Check the addendum's frontmatter for `prd: <path>` (if present)
2. Otherwise: any done story's frontmatter `prd:` field resolved to an absolute path
3. Otherwise: try `sdocs/prd.md`, then `prd.md` at project root
4. If still not found: halt with "cannot locate PRD; specify --prd <path>"

### 4.2 Read and Parse the Existing PRD

Identify which canonical sections are present. The PRD may not have all required sections (consumer-written PRDs are lenient). Note which sections exist; the merge will append to existing ones and create missing ones only where the addendum has something to put there.

Required sections to consider for merging (from `prd-schema.md`):
- `## Functional Requirements` (or equivalent: `## Features`, `## Requirements`)
- `## Non-Functional Requirements`
- `## Out of Scope`
- `## Change log` (optional in schema, but the merge will create it if absent)

### 4.3 Map Addendum → PRD Sections

For each section in the addendum, map to PRD:

| Addendum section | PRD target | Action |
|------------------|------------|--------|
| `# <Feature name>` + `## Purpose` | `## Functional Requirements` | Append one new requirement entry combining the feature name (as the bold lead) and a one-paragraph summary derived from `## Purpose` and `## User-visible change`. |
| `## New acceptance criteria` | `## Functional Requirements` (per-requirement details) OR a sub-bullet under the new requirement | Append the AC bullets as sub-points under the requirement created above. |
| `## Affected areas` | `## Change log` entry | One line summarizing what changed (used as the change log description, not appended to the PRD body). |
| `## Out of scope` | `## Out of Scope` | Append each excluded item verbatim. Create the section if it doesn't exist in the PRD. |
| `## Compatibility` | `## Change log` entry | One line note if it states a breaking change or version bump. Otherwise omitted from the merged PRD body (the contract version bumps already capture this). |

The addendum's existing `## Purpose` and `## User-visible change` are flattened into a single descriptive paragraph for the new functional requirement entry. Keep it tight — under ~3 sentences.

### 4.4 Apply the Changes

In this order:

1. **Frontmatter bumps:**
   - `version: N.M` → `version: N.(M+1)` (or `N+1.0` if the addendum is a major addition — Atlas decides)
   - `last_updated: <today>`
   - Leave `created`, `title`, `owner`, `source` untouched

2. **Functional Requirements:** append the new requirement entries in the order the addendum presents them.

3. **Out of Scope:** append addendum exclusions. If `## Out of Scope` doesn't exist yet, create it AFTER the required sections (per the schema's order: append-after-required-then-optional).

4. **Change log:** append one entry per merge run.
   ```markdown
   - **<YYYY-MM-DD> — <addendum-slug>.** <one-line summary citing the new requirement(s) and any version bumps>
   ```
   If `## Change log` doesn't exist, create it at the end of the PRD body (after Out of Scope, before Open Questions / Assumptions if those exist).

### 4.5 Preserve Existing Content

Do NOT:
- Rewrite, rephrase, or "improve" existing sections
- Delete anything from the PRD
- Reorder existing requirements
- Touch `## Assumptions` or `## Open Questions` from the original drafting workflow

If an addendum's new requirement happens to obsolete an existing one (rare — usually that's a `deprecate` workflow concern, not `extend`), flag it in the validation report. Do not silently rewrite the obsoleted requirement.

### 4.6 Validate the Result

Before writing:

- [ ] Every section that existed BEFORE the merge still exists
- [ ] Frontmatter `version` strictly greater than before
- [ ] `## Change log` contains an entry with this run's date and addendum slug
- [ ] PRD still passes `prd-schema.md` validation (required sections present and non-empty)
- [ ] No content was lost (line count of merged PRD > line count of original PRD)

If any check fails, halt and roll back. Atomic write only.

### 4.7 Write

Replace the PRD file at its discovered location. Print a unified diff (or summary of added sections) to the run log so the user can review what changed.

---

## OUTPUT SUMMARY

After successful merge, print:

```
PRD merged.
File:           <path>
Version:        0.1 → 0.2
Sections added: 1 functional requirement, 2 out-of-scope items
Change log:     2026-05-15 — tags-on-todos
```

---

## GATE — MERGE PASSES WHEN

- [ ] PRD file written with strictly-greater `version`
- [ ] `## Change log` entry present with addendum slug and date
- [ ] At least one of: new functional requirement appended, new out-of-scope item appended (otherwise the addendum had nothing to merge — likely a planning bug)
- [ ] No pre-existing PRD section was removed or rewritten
- [ ] PRD still validates against `prd-schema.md`

---

## FAILURE MODES

- **PRD not found:** halt with the locations tried. User specifies `--prd <path>` or moves the PRD to a canonical location.
- **PRD has no canonical sections (free-form prose):** halt with "PRD too unstructured to merge automatically; convert to `prd-schema.md` format or write the merge by hand." Do not guess.
- **Frontmatter `version` parse fails:** treat as if `version: 0.1` and bump to `0.2`. Warn in the run log.
- **Validation fails after merge:** roll back the file. Do not leave the PRD in a half-merged state.

---

## RELATIONSHIP TO OTHER PHASES

| Phase | Touches | Source of truth |
|-------|---------|-----------------|
| 1 validate-addendum | nothing (write-only reports) | the addendum + existing artifacts |
| 2 evolve-contracts | `sdocs/contracts/**` | the addendum's affected-areas + Phase 1 verdict |
| 3 extend-stories | `sdocs/{epics,stories}/**` | the addendum's new ACs |
| **4 merge-prd** | **`prd.md`** | **the addendum's user-facing description** |

The PRD merge is intentionally LAST. If Phases 1–3 fail, the PRD stays untouched, and rerunning `extend` is safe. If Phase 4 fails AFTER 1–3 succeeded, the artifacts are coherent (stories + contracts) but the PRD is stale — user can re-run merge alone with `extend --merge-only <addendum>` (future enhancement).

---

## NEXT

Workflow exits. The user runs `build-tdd` (or `plan-n-build`) on the new stories.
