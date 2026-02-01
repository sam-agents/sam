---
step: 1
name: validate-prd
description: Validate PRD completeness and technical feasibility
agents: [architect, ux-designer]
---

# Step 1: Validate PRD

**Purpose:** Ensure the PRD is complete, technically feasible, and has testable acceptance criteria before proceeding with development.

---

## ENTRY CONDITIONS

- PRD file path provided
- PRD file exists and is readable
- Pipeline status initialized

---

## PROCESS

### 1.1 Load and Parse PRD

```
1. Read PRD file from provided path
2. Extract:
   - Project/feature name
   - Objectives
   - Features/requirements
   - Acceptance criteria
   - Technical constraints (if any)
   - UX requirements (if any)
3. Store parsed data in pipeline context
```

### 1.2 Architect Review (Winston)

**Invoke Architect agent to assess:**

```yaml
architect_review:
  technical_feasibility:
    - Can each feature be implemented?
    - Are there technical blockers?
    - What technologies/patterns required?

  risks_and_dependencies:
    - External dependencies?
    - Integration points?
    - Scalability concerns?

  testability:
    - Are acceptance criteria testable?
    - Can we write automated tests?
    - Any criteria needing clarification?

  effort_assessment:
    - Rough complexity estimate
    - Suggested story breakdown
```

**Architect Output Format:**

```markdown
## Technical Feasibility Review

### Overall Assessment: [APPROVED / NEEDS_REVISION / BLOCKED]

### Feature Analysis
| Feature | Feasible | Concerns | Notes |
|---------|----------|----------|-------|
| Feature 1 | Yes | None | Straightforward |
| Feature 2 | Yes | Minor | Needs API design |

### Risks Identified
1. [Risk 1] - Mitigation: [...]
2. [Risk 2] - Mitigation: [...]

### Dependencies
- [Dependency 1]
- [Dependency 2]

### Testability Assessment
- All AC testable: [Yes/No]
- Clarification needed: [List items]

### Recommendation
[Proceed / Revise PRD / Block with reason]
```

### 1.3 UX Review (Sally) - If UI Present

**Invoke UX Designer agent if PRD contains UI requirements:**

```yaml
ux_review:
  user_flow:
    - Is user journey clear?
    - Are interactions defined?

  accessibility:
    - Accessibility requirements stated?
    - WCAG compliance level?

  design_requirements:
    - Design specs available?
    - Style guide referenced?

  testability:
    - Can UX criteria be tested?
    - Automation possible?
```

**UX Output Format:**

```markdown
## UX Requirements Review

### Overall Assessment: [APPROVED / NEEDS_REVISION]

### User Flow Analysis
- Primary flow clear: [Yes/No]
- Edge cases defined: [Yes/No]

### Accessibility
- Requirements stated: [Yes/No]
- Recommendations: [...]

### Design Completeness
- Sufficient for implementation: [Yes/No]
- Missing elements: [List]

### Recommendation
[Proceed / Revise PRD]
```

### 1.4 Consolidate Validation Results

```yaml
validation_result:
  status: "passed|failed"
  architect_approval: true|false
  ux_approval: true|false|not_applicable

  blocking_issues: []
  warnings: []
  clarifications_needed: []

  recommendation: "proceed|revise|block"
```

---

## UPDATE STATE

```yaml
# Update pipeline-status.yaml
validation:
  status: "passed"  # or "failed"
  completed_at: "<timestamp>"
  architect_approval: true
  ux_approval: true
  issues:
    - type: "warning"
      description: "..."
    - type: "clarification"
      description: "..."
```

---

## EXIT CONDITIONS

### Pass → Proceed to Phase 2
- Architect approves technical feasibility
- UX approves (if applicable)
- No blocking issues
- All AC deemed testable

### Fail → Halt Pipeline
- Technical feasibility blocked
- Critical UX issues
- Untestable acceptance criteria

**On Failure:**
```yaml
# Generate validation failure report
validation_failure_report:
  prd_path: "<path>"
  blocking_issues:
    - issue: "..."
      agent: "architect|ux-designer"
      recommendation: "..."

  action_required: "Revise PRD and re-run pipeline"
```

---

## AUTONOMOUS BEHAVIOR

In autonomous mode:
- **No human prompts** - proceed or fail based on gates
- **Document everything** - all decisions logged
- **Clear failure reports** - actionable feedback if blocked

---

## NEXT STEP

On validation pass → Load `step-02-generate-stories.md`
