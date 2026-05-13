---
step: 2
name: generate-stories
description: Decompose a validated PRD into epics and stories conforming to the canonical schemas
agents: [architect]
---

# Step 2: Generate Epics and Stories

**Purpose:** Produce the full set of `sdocs/epics/` and `sdocs/stories/` artifacts that `build-tdd` will consume. Every artifact MUST conform to the canonical schemas.

---

## ENTRY CONDITIONS

- Step 1 passed (validation report written, status: passed)
- `sdocs/architecture-ref.md` exists
- Resolved design standards available in architecture-ref.md

---

## SCHEMA REFERENCES (REQUIRED READING)

Read both before generating anything:
- `_sam/core/resources/story-schema.md`
- `_sam/core/resources/epic-schema.md`

The schemas are the contract. Refuse to emit artifacts that violate them.

---

## PROCESS

### 2.1 Analyze PRD Structure

- Identify major feature areas (epic candidates)
- Group related requirements
- Identify dependencies between feature areas
- Apply technical constraints from architect review

### 2.2 Create Epics

For each major feature area, write `sdocs/epics/EPIC-<NNN>-<slug>.md` matching `epic-schema.md`. IDs are sequential starting at `EPIC-001`.

### 2.3 Decompose into Stories

For each epic, write `sdocs/stories/STORY-<NNN>-<slug>.md` matching `story-schema.md`. Story IDs are sequential across the **whole project**, not per-epic. Story slugs are short kebab-case hints.

**Mandatory body sections** (in this order):
1. `## User Story` — As a … I want … so that …
2. `## Acceptance Criteria` — Given / When / Then, each as a checkbox
3. `## Technical Notes` — Files in scope, architecture refs, non-functional requirements
4. `## Test Approach` — Unit / integration / e2e split
5. `## Out of Scope` — Explicit exclusions

**Conditional sections:**
- `## Design Standards` — required for any story touching UI
- `## Bootable App Requirements` — required for the first / scaffolding story of a new project

### 2.4 Sizing and Ordering

| Size | Criteria |
|------|----------|
| Small | 1–3 tasks, single component, ≤ 1 day |
| Medium | 4–6 tasks, multiple components, 1–2 days |
| Large | 7+ tasks — **split it** unless explicitly indivisible |

**Ordering rules** (encoded as `depends_on` in each story's frontmatter):
1. Dependencies first
2. Foundation before features (scaffolding always STORY-001 for new projects)
3. Happy path before edge cases
4. Core functionality before polish

`priority` (P0 / P1 / P2) is independent of ordering — it captures importance, not sequence. `plan-n-build` will respect `depends_on` first, then sort remaining stories by priority.

### 2.5 Validate the Output Set

Before writing files, validate the whole set:

- [ ] Every PRD feature maps to at least one story
- [ ] Every story passes `story-schema.md` validation rules
- [ ] Every epic passes `epic-schema.md` validation rules
- [ ] No orphan stories (every story's `epic` exists in `sdocs/epics/`)
- [ ] No phantom stories (every epic's `Stories` list references real files)
- [ ] `depends_on` graph is acyclic
- [ ] All AC follow Given / When / Then or equivalent testable form

If any check fails, fix the planning output before writing files. Do not emit partial artifacts.

### 2.6 Write Files

Write all epic and story files with `status: planned` / `status: ready` respectively.

---

## OUTPUT SUMMARY

After successful generation, print:

```
## Planning Output

Epics: 3
  EPIC-001 — User Authentication (4 stories)
  EPIC-002 — Dashboard (3 stories)
  EPIC-003 — Settings (2 stories)

Stories: 9 (all status: ready)
  Execution order (respecting depends_on, then priority):
    1. STORY-001 — Project scaffolding (P0)
    2. STORY-002 — User can log in (P0)
    3. STORY-003 — User can log out (P1)
    ...

Next: /sam:core:workflows:build-tdd sdocs/stories/STORY-001-scaffolding.md
   or: /sam:core:workflows:plan-n-build
```

---

## EXIT

- **Success:** all files written, validation set passes, summary printed.
- **Failure:** halt without writing files; print the validation rule that failed and the offending story / epic.
