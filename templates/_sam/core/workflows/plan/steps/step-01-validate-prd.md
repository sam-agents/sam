---
step: 1
name: validate-prd
description: Validate PRD completeness, technical feasibility, and UX requirements
agents: [architect, ux-designer]
---

# Step 1: Validate PRD

**Purpose:** Confirm the PRD is complete, technically feasible, and has testable AC before any story generation.

---

## ENTRY CONDITIONS

- PRD path provided and readable
- `sdocs/` directory writeable (created if missing)

---

## PROCESS

### 1.1 Parse PRD

Read the PRD and extract:
- Project / feature name
- Objectives
- Features / requirements
- Acceptance criteria (or evidence they can be derived)
- Technical constraints
- UX / design requirements (if any)

### 1.2 Architect Review (Atlas)

Invoke Atlas to assess:

```yaml
architect_review:
  technical_feasibility:
    - Can each feature be implemented?
    - Are there blockers?
    - What technologies / patterns are required?

  risks_and_dependencies:
    - External dependencies
    - Integration points
    - Scalability concerns

  testability:
    - Are AC testable as written?
    - Anything needing clarification?

  effort_assessment:
    - Rough complexity per feature
    - Suggested epic / story breakdown

  bootable_app_requirements:
    - For new projects: list the minimum files / config needed for the app to boot
      (entry point, providers, build / dev commands, env loading)
```

**Atlas output:** `sdocs/architecture-ref.md` containing resolved architecture decisions, design standards, and bootable-app requirements.

### 1.3 Design Standards Resolution

Atlas resolves design standards in this order:
1. PRD has `## Design`, `## Visual Style`, `## UX Design`, or referenced ux-design doc → **use PRD guidance**.
2. Otherwise → load `_sam/core/resources/default-design-standards.md` as fallback.

Record the resolved standards in `sdocs/architecture-ref.md` under a `## Design Standards` section, and log the source: `[PRD-provided]` or `[SAM defaults]`.

### 1.4 UX Review (Iris) — if UI present

Invoke Iris when the PRD contains UI / UX requirements:

```yaml
ux_review:
  user_flow:        # journey clear? interactions defined?
  accessibility:    # WCAG level stated?
  design_completeness:  # specs / style guide sufficient?
  testability:      # UX criteria testable?
```

### 1.5 Consolidate

```yaml
validation_result:
  status: passed | failed
  architect_approval: true | false
  ux_approval: true | false | not_applicable
  blocking_issues: []
  warnings: []
  clarifications_needed: []
  recommendation: proceed | revise | block
```

Write `sdocs/validation-report.md` summarizing the above.

---

## EXIT CONDITIONS

### Pass → proceed to Step 2
- Atlas approves feasibility
- Iris approves (or not applicable)
- All AC deemed testable
- No blocking issues

### Fail → halt workflow
Halt with `sdocs/validation-report.md` listing blocking issues and required PRD revisions. Do not generate stories on a failed PRD.

---

## NEXT STEP

On pass → load `step-02-generate-stories.md`.
