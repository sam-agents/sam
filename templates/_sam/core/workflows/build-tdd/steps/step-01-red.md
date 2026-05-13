---
step: 1
name: red
description: Write failing tests covering every AC for the story
agents: [test]
---

# Step 1: RED — Failing Tests

**Agent:** Titan (Test Architect)

**Purpose:** Translate every acceptance criterion in the story into executable tests that fail for the right reason: missing implementation.

---

## ENTRY CONDITIONS

- Story file passes `story-schema.md` validation
- Story `status` flipped from `ready` to `in-progress` by the workflow
- Test framework configured in the consumer project (detect from package.json / config)

---

## PROCESS

```
1. Read the story file (frontmatter + body)
2. Parse `## Acceptance Criteria` — every checkbox becomes a test group
3. Read `## Test Approach` — split tests into unit / integration / e2e per the story's plan
4. Read `## Technical Notes > Files in scope` — bound test locations to scoped paths only
5. Write tests in the project's existing test conventions
6. Run the tests
7. Confirm:
   - Every new test FAILS
   - Failures are because the implementation is missing, not because of test errors
8. If any test passes unexpectedly: STOP and investigate (likely existing implementation)
```

---

## TEST STRUCTURE

```typescript
describe('Story: <story title from frontmatter>', () => {
  describe('AC1: <first acceptance criterion>', () => {
    it('<expected behavior>', () => {
      // Arrange / Act / Assert — must fail because target is unimplemented
    });
  });

  describe('AC2: <second acceptance criterion>', () => {
    // ...
  });
});
```

Coverage requirement per AC: at least one happy-path test, plus edge / error cases where the AC implies them.

---

## GATE — RED PASSES WHEN

- [ ] Every AC has at least one test
- [ ] All new tests fail
- [ ] Failures are "missing implementation" failures, not test errors / syntax errors
- [ ] Tests live in the conventional location for the project (not in story-scoped scratch dirs)

---

## FAILURE MODES

- **A test passes unexpectedly** → halt. The feature may already exist or the test is too lax. Investigate before continuing.
- **A test errors** (rather than fails) → fix the test code and re-run. Errors don't count as RED.
- **AC is ambiguous** → halt, set story `status: blocked`, document the ambiguity in `## Blocked Reason`. Do not invent intent.

---

## NEXT

On pass → workflow proceeds to `step-02-green.md`.
