---
step: 3
name: tdd-loop
description: Execute TDD RED-GREEN-REFACTOR cycle for each story
agents: [test, dev, reviewer]
---

# Step 3: TDD Implementation Loop

**Purpose:** Implement each story using strict Test-Driven Development methodology: RED (failing tests) → GREEN (make tests pass) → REFACTOR (improve code).

---

## ENTRY CONDITIONS

- Phase 2 complete (stories generated)
- Stories available in `stories/` directory
- Pipeline status has story list with priorities

---

## MAIN LOOP

```
FOR each story in priority order:
  IF story.status == 'pending':
    execute_tdd_cycle(story)

  IF all stories complete OR all remaining stories blocked:
    EXIT loop

PROCEED to Phase 4
```

---

## TDD CYCLE PER STORY

### 3.1 RED Phase - Write Failing Tests

**Agent:** Murat (Test Architect)

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
      expected: "All tests fail"
      if_any_pass: "HALT - investigate existing implementation"

    5_document:
      action: "Update story file with test info"
      update: "red_phase.completed = true"
```

**Test Template:**

```typescript
// tests/epic-1-story-1.test.ts

describe('Story: User can log in with email and password', () => {

  describe('AC1: Successful Login', () => {
    it('should authenticate user with valid credentials', async () => {
      // Arrange
      const credentials = { email: 'user@example.com', password: 'valid123' };

      // Act
      const result = await login(credentials);

      // Assert - THIS MUST FAIL (login not implemented)
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });

    it('should redirect to dashboard after login', async () => {
      // ... test that will fail
    });
  });

  describe('AC2: Invalid Credentials', () => {
    it('should return error for wrong password', async () => {
      // ... test that will fail
    });
  });

  describe('AC3: Empty Fields', () => {
    it('should validate empty email', async () => {
      // ... test that will fail
    });
  });
});
```

**Gate: RED Phase Complete**

```yaml
red_phase_gate:
  required:
    - all_ac_have_tests: true
    - all_tests_failing: true
    - failure_reason: "missing implementation"  # Not errors

  on_pass:
    update_status: "red"
    proceed_to: "green_phase"

  on_fail:
    if: "tests pass unexpectedly"
    action: "HALT and investigate"

    if: "test errors (not failures)"
    action: "Fix test code, retry"
```

---

### 3.2 GREEN Phase - Implement Until Tests Pass

**Agent:** Amelia (Developer)

**Input:**
- Story file with tasks
- Failing tests from RED phase
- Project codebase access

**Process:**

```yaml
green_phase:
  steps:
    1_review_tests:
      action: "Understand what tests expect"
      output: "Implementation plan"

    2_implement_task:
      action: "Write minimum code for current task"
      principle: "Make tests pass, nothing more"

    3_run_tests:
      action: "Execute test suite"
      check: "Which tests pass now?"

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
      required: "ALL tests pass (AC + unit + existing)"
```

**Implementation Loop:**

```
attempt = 0
max_attempts = 3

WHILE attempt < max_attempts:
  implement_next_task()
  result = run_tests()

  IF result.all_pass:
    BREAK  # Success!

  IF result.some_pass AND result.progress:
    continue  # Making progress

  IF result.no_progress:
    attempt += 1
    analyze_failure()
    adjust_approach()

IF attempt >= max_attempts:
  mark_story_blocked("GREEN phase failed after max retries")
  CONTINUE to next story
```

**Gate: GREEN Phase Complete**

```yaml
green_phase_gate:
  required:
    - all_acceptance_tests_pass: true
    - all_unit_tests_pass: true
    - no_regression: true  # Existing tests still pass
    - code_compiles: true

  on_pass:
    update_status: "green"
    proceed_to: "refactor_phase"

  on_fail:
    increment_retry_count
    if: retry_count < max_retries
    action: "Continue implementation"

    if: retry_count >= max_retries
    action: "Mark story BLOCKED, continue to next story"
```

---

### 3.3 REFACTOR Phase - Review and Improve

**Agent:** Marcus (Code Reviewer)

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

    3_document_issues:
      action: "List all issues found"
      minimum: 3  # Find at least 3 things
      categorize: [critical, moderate, minor]

    4_auto_fix:
      action: "Fix issues where possible"
      after_each_fix: "Run tests"
      if_tests_break: "Revert fix"

    5_verify_green:
      action: "Confirm all tests still passing"
      required: true

    6_document_remaining:
      action: "Document issues needing manual attention"
      if_critical_remain: "Loop back to GREEN"
```

**Review Output:**

```markdown
## Code Review: epic-1-story-1

### Issues Found: 5

#### Critical (0)
None

#### Moderate (2)
1. **Missing input validation** - `login.ts:23`
   - Risk: Potential injection
   - Fix: Added validation ✓

2. **No rate limiting** - `auth-controller.ts:45`
   - Risk: Brute force attacks
   - Fix: Added rate limiter ✓

#### Minor (3)
1. Variable naming: `res` → `response` ✓
2. Missing JSDoc on public function ✓
3. Console.log left in code ✓

### Tests After Fixes
✓ All 12 tests passing

### Recommendation
APPROVED - All issues addressed, tests green
```

**Gate: REFACTOR Phase Complete**

```yaml
refactor_phase_gate:
  required:
    - review_completed: true
    - no_critical_issues: true
    - no_moderate_issues: true  # All fixed
    - all_tests_passing: true

  on_pass:
    update_status: "done"
    proceed_to: "next_story"

  on_fail:
    if: "critical/moderate issues remain"
    action: "Loop back to GREEN phase with fix instructions"

    if: "tests broken by refactor"
    action: "Revert, try alternative fix"
```

---

## UPDATE STATE (Per Story)

```yaml
# Update pipeline-status.yaml after each phase

stories:
  - id: "epic-1-story-1"
    status: "done"  # pending → red → green → refactor → done

    red_phase:
      completed: true
      completed_at: "<timestamp>"
      tests_written: 8
      tests_failing: 8

    green_phase:
      completed: true
      completed_at: "<timestamp>"
      retry_count: 1
      tests_passing: 12  # 8 AC + 4 unit

    refactor_phase:
      completed: true
      completed_at: "<timestamp>"
      issues_found: 5
      issues_fixed: 5
      issues_remaining: 0
```

---

## BLOCKED STORY HANDLING

When a story cannot complete after max retries:

```yaml
blocked_story:
  id: "epic-1-story-3"
  status: "blocked"
  blocked_at: "<timestamp>"
  blocked_phase: "green"  # Where it got stuck

  failure_details:
    attempts: 3
    last_error: "Cannot resolve dependency injection"
    tests_passing: 3
    tests_failing: 2

  recommendation: "Manual intervention required"
```

**Continue to next story** - don't halt entire pipeline for one blocked story.

---

## LOOP EXIT CONDITIONS

```yaml
exit_conditions:
  success:
    - all_stories_status: "done"

  partial_success:
    - some_stories: "done"
    - some_stories: "blocked"
    - action: "Proceed to Phase 4, report blocked stories"

  failure:
    - all_stories: "blocked"
    - action: "Halt pipeline, generate failure report"
```

---

## AUTONOMOUS BEHAVIOR

In autonomous mode:
- **No human prompts** between phases
- **Automatic retry** up to max_retry_attempts
- **Skip blocked stories** and continue
- **Log everything** for post-run analysis

---

## NEXT STEP

On loop complete → Load `step-04-complete.md`
