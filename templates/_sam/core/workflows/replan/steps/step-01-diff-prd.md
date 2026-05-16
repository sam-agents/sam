---
step: 1
name: diff-prd
description: Compare revised PRD against current sdocs/prd.md and categorize each requirement as added, modified, removed, or unchanged
agents: [architect]
---

# Step 1: Diff Revised PRD Against Current PRD

**Agent:** Atlas (System Architect)

**Purpose:** Perform a semantic, section-by-section comparison of a revised PRD against the current `sdocs/prd.md`. Every requirement is categorized as `added | modified | removed | unchanged`. The structured diff report drives all downstream phases — an incorrect classification here will cascade through impact analysis and artifact updates.

---

## ENTRY CONDITIONS

- Revised PRD file exists and is readable
- `sdocs/prd.md` (or root `prd.md`) exists and is readable
- `sdocs/architecture-ref.md` exists (needed for context on architectural constraints)
- `sdocs/stories/` exists with at least one story file (otherwise use `plan`, not `replan`)

If any precondition fails, halt and tell the user which file is missing.

---

## REQUIRED READING

Before any analysis:
- The revised PRD — read in full
- `sdocs/prd.md` — read in full (this is the baseline for the diff)
- `sdocs/architecture-ref.md` — especially `## Key Architectural Decisions` and `## System Shape` (to understand whether changes cross architectural boundaries)

---

## PROCESS

### 1.1 Inventory Current PRD Sections

Parse the current `sdocs/prd.md` and build an inventory of every requirement-bearing section:

```yaml
sections:
  - id: <section-slug>          # derived from heading text
    heading: <full heading>
    level: <h2 | h3 | h4>
    type: feature | constraint | scope | meta
    acceptance_criteria: [<list of ACs if present>]
    content_hash: <for quick unchanged detection>
```

Focus on `## Features`, `## Acceptance Criteria`, `## Constraints`, and `## Out of Scope`. Meta sections (title, overview, changelog) are tracked but classified separately.

### 1.2 Inventory Revised PRD Sections

Repeat the same parse on the revised PRD. Use identical slugging rules so sections can be matched by id.

### 1.3 Match and Classify

For each section in the union of both inventories:

| Current PRD | Revised PRD | Classification |
|-------------|-------------|----------------|
| present     | present, same content | `unchanged` |
| present     | present, different content | `modified` |
| present     | absent | `removed` |
| absent      | present | `added` |

For `modified` sections, drill into the specific changes:

```yaml
modification_detail:
  section: <id>
  changes:
    - field: acceptance_criteria
      type: ac-added | ac-removed | ac-changed
      before: <text or null>
      after: <text or null>
    - field: scope
      type: narrowed | broadened | reframed
      before: <text>
      after: <text>
    - field: constraints
      type: added | removed | changed
      before: <text or null>
      after: <text or null>
```

### 1.4 Detect Renames and Moves

Before finalizing a `removed` + `added` pair, check for potential renames:
- If a removed section and an added section share >70% content similarity, flag them as a **rename candidate**
- Present rename candidates in the diff report for human verification
- Do NOT auto-classify renames as `unchanged` — classify as `modified` with a rename note

### 1.5 Generate Diff Summary

Produce a count summary:

```yaml
summary:
  total_sections: <N>
  added: <N>
  modified: <N>
  removed: <N>
  unchanged: <N>
  rename_candidates: <N>
```

If removed + modified sections exceed 80% of total, append a warning:

> ⚠ More than 80% of requirements are affected. Consider using `plan --force` for a full rewrite instead.

### 1.6 Write Diff Report

Write the structured diff to `sdocs/replans/<YYYY-MM-DD>-<slug>-diff.md`:

```markdown
---
replan_slug: <slug derived from the primary change>
phase: replan-step-1
date: <today>
revised_prd: <path to revised PRD>
current_prd: sdocs/prd.md
---

# PRD Diff — <slug>

## Summary
- Total sections: N
- Added: N
- Modified: N
- Removed: N
- Unchanged: N

## Added Sections
| Section | Heading | Type |
|---------|---------|------|
| <id>    | <heading> | feature |

## Modified Sections
| Section | Heading | What Changed |
|---------|---------|--------------|
| <id>    | <heading> | AC added, scope broadened |

### Modification Details
#### <section-id>
- **Before:** <relevant text>
- **After:** <relevant text>
- **Change type:** <ac-added, scope-broadened, etc.>

## Removed Sections
| Section | Heading | Type |
|---------|---------|------|
| <id>    | <heading> | feature |

## Unchanged Sections
| Section | Heading |
|---------|---------|
| <id>    | <heading> |

## Rename Candidates
| Removed | Added | Similarity |
|---------|-------|------------|
| <old-id> | <new-id> | ~75% |
```

The slug is derived from the most significant change in the revised PRD (e.g. `title-length-update`, `drop-tags-feature`). If there is no clear dominant change, use a generic slug like `multi-change`.

---

## GATE — DIFF PASSES WHEN

- [ ] Every section in the current PRD is accounted for (classified as `modified`, `removed`, or `unchanged`)
- [ ] Every section in the revised PRD is accounted for (classified as `modified`, `added`, or `unchanged`)
- [ ] No section is left unclassified
- [ ] Every `modified` section has a `modification_detail` entry explaining what changed
- [ ] Rename candidates (if any) are flagged, not silently absorbed
- [ ] Diff report written to `sdocs/replans/<YYYY-MM-DD>-<slug>-diff.md`
- [ ] Summary counts are internally consistent (`added + modified + removed + unchanged = total unique sections across both PRDs`)

---

## FAILURE MODES

- **Unreadable PRD:** Halt with error message identifying which file could not be parsed.
- **Completely different structure:** If no sections match between current and revised PRD (0 unchanged, 0 modified), warn that the PRDs share no common structure and recommend `plan --force` instead.
- **Ambiguous classification:** If a section cannot be confidently classified (e.g. heading matches but content is entirely rewritten), classify as `modified` with a note — never leave it unclassified.

---

## NEXT

→ Step 2: Impact Analysis (`step-02-impact-analysis.md`)

Atlas passes the structured diff report to the next phase, which walks the contract dependency graph to determine which artifacts are affected by each modified or removed requirement.
