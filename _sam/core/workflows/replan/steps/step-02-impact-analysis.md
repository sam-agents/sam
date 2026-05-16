---
step: 2
name: impact-analysis
description: Walk the produces/consumes graph to identify contracts and stories affected by each modified or removed requirement from the Step 1 diff
agents: [architect]
---

# Step 2: Impact Analysis on Contracts and Stories

**Agent:** Atlas (System Architect)

**Purpose:** For each `modified` or `removed` requirement identified in Step 1, walk the `produces`/`consumes` dependency graph to determine which contracts and stories are affected. The output is a structured impact matrix that drives all downstream decisions — which stories need rebuilding, which contracts need version bumps or deprecation, and which artifacts are untouched.

---

## ENTRY CONDITIONS

- Step 1 diff report exists at `sdocs/replans/<YYYY-MM-DD>-<slug>-diff.md`
- Diff report contains at least one `modified` or `removed` section (otherwise skip to Step 5 — merge)
- `sdocs/contracts/INDEX.md` exists and is readable
- `sdocs/stories/` directory exists with at least one story file

If any precondition fails, halt and tell the user which file or directory is missing.

---

## REQUIRED READING

Before any analysis:
- `sdocs/replans/<YYYY-MM-DD>-<slug>-diff.md` — the structured diff from Step 1 (read in full)
- `sdocs/contracts/INDEX.md` — the contract index (read in full)
- Every contract file referenced in INDEX.md — at minimum read the frontmatter (`id`, `kind`, `status`, `owner_story`, `version`)
- Every story file in `sdocs/stories/` — at minimum read the frontmatter (`id`, `status`, `produces`, `consumes`, `depends_on`)
- `_sam/core/resources/contract-schema.md` — for understanding contract lifecycle rules
- `_sam/core/resources/story-schema.md` — for understanding story status transitions

---

## PROCESS

### 2.1 Build the Dependency Graph

Construct an in-memory graph from story and contract frontmatter:

```yaml
graph:
  contracts:
    - id: <contract-id>
      kind: <type | api | event | repo | module>
      status: <draft | stable | deprecated>
      version: <N>
      producer: <story-id>           # from owner_story
      consumers: [<story-id>, ...]   # stories whose consumes: list includes this contract

  stories:
    - id: <story-id>
      status: <draft | ready | in-progress | done | blocked | needs-rebuild | obsolete>
      produces: [<contract-id>, ...]
      consumes: [<contract-id>, ...]
      depends_on: [<story-id>, ...]
```

Every contract must appear exactly once as a node. Every story must appear exactly once. Cross-reference:
- For each story's `produces` list, the corresponding contract's `producer` field must point back to that story
- For each story's `consumes` list, that story must appear in the corresponding contract's `consumers` list

Flag any inconsistencies (orphan contracts, dangling references) as warnings in the output — do not halt, but record them.

### 2.2 Map Requirements to Contracts

For each `modified` or `removed` requirement from the diff report, identify which contracts implement or relate to it:

1. **By owner story:** Find stories whose `## User Story` or `## Acceptance Criteria` directly trace to the changed PRD section. Then collect those stories' `produces` contracts.
2. **By content match:** Scan contract bodies for references to the changed requirement (e.g. a contract's `## Shape` mentions the feature being modified). This catches contracts not yet linked to a story.
3. **By section-id mapping:** If the PRD sections use consistent naming (e.g. `## Feature: Tags`), match against story titles and contract titles.

For each mapping, record the confidence level:

```yaml
mappings:
  - requirement: <section-id from diff>
    classification: modified | removed
    matched_contracts:
      - contract: <contract-id>
        match_type: owner-story | content-match | title-match
        confidence: high | medium | low
    matched_stories:
      - story: <story-id>
        relation: producer | consumer | dependency
```

If a requirement maps to zero contracts and zero stories, record it as `no-impact` with a brief explanation (e.g. "this section is a constraint, not a feature — no artifacts implement it directly").

### 2.3 Walk Downstream Dependencies

For each directly affected contract, trace its downstream impact:

1. **Consumer stories:** Find all stories in the contract's `consumers` list
2. **Transitive dependencies:** For each consumer story, check if it `produces` contracts that are consumed by further stories. Walk one level deep (direct consumers of the affected contract, plus their immediate downstream).
3. **Do NOT walk indefinitely** — cap at two hops from the origin contract. Beyond that, flag as "possible transitive impact — manual review recommended."

Record the full impact chain:

```yaml
impact_chain:
  - origin_contract: <contract-id>
    origin_requirement: <section-id>
    directly_affected:
      - artifact: <story-id or contract-id>
        type: story | contract
        current_status: <status>
        impact: needs-version-bump | needs-rebuild | needs-deprecation | needs-update
    transitively_affected:
      - artifact: <story-id or contract-id>
        type: story | contract
        hops: <1 | 2>
        current_status: <status>
        impact: possible-rebuild | review-recommended
```

### 2.4 Classify Impact per Artifact

For each affected artifact, assign an impact classification based on the requirement change type and the artifact's current status:

**For contracts:**

| Requirement Change | Contract Status | Impact Classification |
|---|---|---|
| modified | draft | `update-in-place` — edit contract body, no version bump |
| modified | stable | `version-bump` — bump version, update body |
| modified | deprecated | `no-action` — already deprecated, note in report |
| removed | draft | `deprecate` — set status to deprecated |
| removed | stable | `deprecate` — set status to deprecated |
| removed | deprecated | `no-action` — already deprecated |

**For stories:**

| Requirement Change | Story Status | Impact Classification |
|---|---|---|
| modified | draft or ready | `update-in-place` — edit story ACs and technical notes |
| modified | in-progress | `needs-rebuild` — mark status, keep partial code |
| modified | done | `needs-rebuild` — mark status, keep existing code |
| modified | blocked | `update-in-place` — update while already stalled |
| modified | needs-rebuild | `no-action` — already marked for rebuild |
| modified | obsolete | `no-action` — already retired |
| removed | draft or ready | `obsolete` — set status to obsolete |
| removed | in-progress | `obsolete` — set status to obsolete, keep code |
| removed | done | `obsolete` — set status to obsolete, keep code |
| removed | blocked | `obsolete` — set status to obsolete |
| removed | needs-rebuild | `obsolete` — set status to obsolete |
| removed | obsolete | `no-action` — already retired |

### 2.5 Generate Impact Summary Statistics

Produce counts for the impact gate:

```yaml
impact_summary:
  requirements_analyzed: <N>     # modified + removed from diff
  with_mapped_artifacts: <N>     # requirements that map to at least one contract or story
  with_no_impact: <N>            # requirements with explicit "no impact" note
  unmapped: <N>                  # should be 0 — gate fails if > 0

  contracts_affected: <N>
  contracts_to_version_bump: <N>
  contracts_to_deprecate: <N>
  contracts_to_update_in_place: <N>

  stories_affected: <N>
  stories_to_rebuild: <N>        # done or in-progress → needs-rebuild
  stories_to_obsolete: <N>
  stories_to_update: <N>         # draft/ready → update-in-place

  done_stories_invalidated: <N>  # critical metric — shown prominently to user
```

### 2.6 Write Impact Analysis Report

Write the analysis to `sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md`:

```markdown
---
replan_slug: <slug from Step 1>
phase: replan-step-2
date: <today>
diff_report: sdocs/replans/<YYYY-MM-DD>-<slug>-diff.md
---

# Impact Analysis — <slug>

## Summary

- Requirements analyzed: N (M modified, K removed)
- Contracts affected: N (X version-bump, Y deprecate, Z update-in-place)
- Stories affected: N (X needs-rebuild, Y obsolete, Z update-in-place)
- **Done stories invalidated: N** ← user should pay attention to this

## Dependency Graph Warnings

<any inconsistencies found during graph construction — orphan contracts, dangling refs, etc.>

## Requirement → Artifact Mapping

### <requirement-section-id> (modified|removed)

**Matched contracts:**
| Contract | Match Type | Confidence | Current Status | Impact |
|----------|------------|------------|----------------|--------|
| <id>     | owner-story | high      | stable         | version-bump |

**Matched stories:**
| Story | Relation | Current Status | Impact |
|-------|----------|----------------|--------|
| <id>  | producer | done           | needs-rebuild |

**Downstream (transitive):**
| Artifact | Type | Hops | Current Status | Impact |
|----------|------|------|----------------|--------|
| <id>     | story | 1   | ready          | review-recommended |

---

### <next requirement...>

---

## No-Impact Requirements

| Requirement | Reason |
|-------------|--------|
| <id>        | constraint section — no implementing artifacts |

## Full Impact Matrix

| Artifact | Type | Current Status | Impact | Caused By |
|----------|------|----------------|--------|-----------|
| <contract-id> | contract | stable | version-bump | <requirement-id> |
| <story-id> | story | done | needs-rebuild | <requirement-id> |
| ... | | | | |
```

---

## GATE — IMPACT ANALYSIS PASSES WHEN

- [ ] Every `modified` or `removed` requirement from the diff report has at least one mapped artifact OR an explicit `no-impact` note with justification
- [ ] `unmapped` count is 0 — no requirement is left without a classification
- [ ] The dependency graph was built from ALL contracts in INDEX.md and ALL stories in `sdocs/stories/`
- [ ] Every affected artifact has exactly one impact classification (no ambiguous entries)
- [ ] Downstream impact chains are capped at 2 hops — anything beyond is flagged for manual review
- [ ] Impact analysis report written to `sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md`
- [ ] Summary statistics are internally consistent (e.g. `contracts_affected = contracts_to_version_bump + contracts_to_deprecate + contracts_to_update_in_place`)

---

## FAILURE MODES

- **Missing contracts or stories:** If INDEX.md references a contract file that doesn't exist, or a story references a contract not in INDEX.md, record as a graph warning and continue — do not halt the entire analysis for one broken reference.
- **Requirement maps to zero artifacts:** Acceptable ONLY if an explicit `no-impact` note is provided. If the agent cannot determine why there's no impact, flag the requirement as `unmapped` and fail the gate.
- **Circular dependencies:** If the graph contains a cycle (story A consumes a contract produced by story B, which consumes a contract produced by story A), record the cycle as a warning and cap traversal at the cycle boundary.
- **Massive blast radius:** If `done_stories_invalidated` exceeds 50% of all done stories, append a warning recommending `plan --force` instead of replan.

---

## NEXT

→ Step 3: Per-Category Actions (`step-03-apply-changes.md`)

Atlas passes the impact matrix to the next phase, which applies the classified actions: updating stories and contracts in place, bumping versions, setting statuses to `needs-rebuild` or `obsolete`, and deprecating contracts. The impact matrix is the authoritative input — Step 3 does not re-derive impact, it executes it.
