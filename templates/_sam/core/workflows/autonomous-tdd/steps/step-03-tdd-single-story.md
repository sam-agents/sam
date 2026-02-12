---
step: 3s
name: tdd-single-story
description: Execute TDD RED-GREEN-REFACTOR cycle for a SINGLE story (multi-pass mode)
agents: [test, dev, reviewer]
---

# Step 3S: TDD Implementation - Single Story Mode

**Purpose:** Implement ONE story using strict Test-Driven Development methodology: RED (failing tests) → GREEN (make tests pass) → REFACTOR (improve code).

**Mode:** This step is used in multi-pass pipeline mode where the orchestrator invokes Claude separately for each story. Each invocation gets a fresh context window.

---

## CRITICAL: EXISTING CODEBASE

The `/workspace` directory contains code from previously completed stories.

- **Do NOT delete or rewrite existing files** unless this story specifically requires modification
- **ALL existing tests must continue to pass** — no regressions allowed
- **Follow existing code patterns** and conventions established by previous stories
- **git commit after each TDD phase** (RED, GREEN, REFACTOR)

---

## ENTRY CONDITIONS

- Story file provided (contains acceptance criteria)
- PRD available for tech stack and architecture context
- Workspace may contain code from previous stories
- Pipeline status tracks overall progress

---

## TDD CYCLE

### 3S.1 RED Phase - Write Failing Tests

**Agent:** Titan (Test Architect)

**Input:**
- Story file with acceptance criteria
- Existing test patterns (if any)
- Project test framework configuration

**Process:**

```yaml
red_phase:
  steps:
    1_analyze_ac:
      action: "Parse acceptance criteria from story file"
      output: "List of testable assertions"

    2_design_tests:
      action: "Design test cases for each AC"
      coverage:
        - happy_path: "Main success scenarios"
        - edge_cases: "Boundary conditions"
        - error_cases: "Error handling"

    3_write_tests:
      action: "Write test code"
      format: "Follow project test conventions"
      requirement: "Tests MUST fail (no implementation yet)"

    4_verify_failure:
      action: "Run tests"
      expected: "New tests fail, existing tests still pass"
      if_existing_tests_break: "HALT - fix test setup first"

    5_commit:
      action: "git commit -m 'RED: [story-id] failing tests'"
```

**Gate: RED Phase Complete**

```yaml
red_phase_gate:
  required:
    - all_ac_have_tests: true
    - new_tests_failing: true
    - existing_tests_passing: true  # No regressions!
    - failure_reason: "missing implementation"

  on_pass:
    proceed_to: "green_phase"

  on_fail:
    if: "existing tests broken"
    action: "Fix test setup, do not modify existing code"

    if: "test errors (not failures)"
    action: "Fix test code, retry"
```

---

### 3S.2 GREEN Phase - Implement Until Tests Pass

**Agent:** Dyna (Developer)

**Input:**
- Story file with tasks
- Failing tests from RED phase
- Existing codebase

**Process:**

```yaml
green_phase:
  steps:
    1_review_tests:
      action: "Understand what tests expect"
      output: "Implementation plan"

    2_implement:
      action: "Write minimum code to make tests pass"
      principle: "Make tests pass, nothing more"
      constraint: "Do NOT break existing functionality"

    3_run_all_tests:
      action: "Execute FULL test suite (new + existing)"
      check: "All tests pass?"

    4_iterate:
      if: "tests still failing"
      action: "Continue implementation"
      retry_limit: 3

      if: "all tests pass"
      action: "Proceed to unit tests"

    5_add_unit_tests:
      action: "Add unit tests for implementation details"
      coverage: "Test internal logic not covered by AC tests"

    6_verify_all_green:
      action: "Run full test suite"
      required: "ALL tests pass (new AC + new unit + ALL existing)"

    7_commit:
      action: "git commit -m 'GREEN: [story-id] implementation complete'"
```

**Gate: GREEN Phase Complete**

```yaml
green_phase_gate:
  required:
    - all_new_tests_pass: true
    - all_existing_tests_pass: true  # No regressions!
    - code_compiles: true

  on_pass:
    proceed_to: "refactor_phase"

  on_fail:
    increment_retry_count
    if: retry_count < 3
    action: "Continue implementation"

    if: retry_count >= 3
    action: "Output STORY_STATUS:blocked:GREEN phase failed after max retries"
```

---

### 3S.3 REFACTOR Phase - Review and Improve

**Agent:** Argus (Code Reviewer)

**Input:**
- Implemented code (GREEN state)
- Story file with AC
- Test results

**Process:**

```yaml
refactor_phase:
  steps:
    1_verify_green:
      action: "Confirm all tests passing"
      required: true

    2_review_code:
      action: "Adversarial code review"
      checklist:
        - correctness: "Matches AC?"
        - testing: "Adequate coverage?"
        - security: "OWASP top 10?"
        - performance: "Efficient?"
        - maintainability: "Clean code?"
        - consistency: "Matches existing patterns?"

    3_auto_fix:
      action: "Fix issues where possible"
      after_each_fix: "Run tests"
      if_tests_break: "Revert fix"

    4_verify_green:
      action: "Confirm all tests still passing"
      required: true

    5_commit:
      action: "git commit -m 'REFACTOR: [story-id] code review complete'"
```

**Gate: REFACTOR Phase Complete**

```yaml
refactor_phase_gate:
  required:
    - review_completed: true
    - no_critical_issues: true
    - all_tests_passing: true

  on_pass:
    action: "Story complete"

  on_fail:
    if: "critical issues remain"
    action: "Output STORY_STATUS:blocked:Critical issues unresolved"

    if: "tests broken by refactor"
    action: "Revert, try alternative fix"
```

---

## UPDATE STATE

After completing all three phases, update `pipeline-status.yaml`:

```yaml
stories:
  - id: "<story-id>"
    status: "done"

    red_phase:
      completed: true
      tests_written: <count>
      tests_failing: <count>

    green_phase:
      completed: true
      retry_count: <count>
      tests_passing: <count>

    refactor_phase:
      completed: true
      issues_found: <count>
      issues_fixed: <count>
```

---

## EXIT PROTOCOL

When the story is complete, output one of these as the **LAST LINE** of your response:

- `STORY_STATUS:done` — Story completed successfully, all tests passing
- `STORY_STATUS:blocked:REASON` — Story could not be completed, with explanation

This line is parsed by the orchestrator to track progress.
