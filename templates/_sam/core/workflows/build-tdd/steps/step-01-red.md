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
- For every contract id in the story's `consumes:`, the contract file exists at `sdocs/contracts/<area>/<id>.md` and has `status: stable` or `draft` (not `deprecated`)
- For every contract id in the story's `produces:`, the contract file exists and is `draft` (no other story has implemented it yet)

If any contract precondition fails, halt with the offending contract id — do not invent contracts or silently proceed.

---

## PROCESS

```
1. Read the story file (frontmatter + body)
2. Read every contract listed in `consumes:` — import the types / endpoints / events / repo
   interfaces directly. Do not redeclare them in the test file.
3. Read every contract listed in `produces:` — these define the surface the implementation
   must expose. Tests assert against this surface, not against an invented one.
4. Parse `## Acceptance Criteria` — every checkbox becomes a test group
5. Read `## Test Approach` — split tests into unit / integration / e2e per the story's plan
6. Read `## Technical Notes > Files in scope` — bound test locations to scoped paths only
7. Write tests in the project's existing test conventions:
   - Tests for `consumes:` contracts use the contract's exported types / shapes verbatim
   - Tests for `produces:` contracts assert the implementation will export those types / shapes
   - For `kind: integration` stories: write end-to-end scenarios that cross every story in
     this story's `depends_on` list, against the real (non-mocked) implementations of every
     consumed contract
8. Run the tests
9. Confirm:
   - Every new test FAILS
   - Failures are because the implementation is missing, not because of test errors
10. If any test passes unexpectedly: STOP and investigate (likely existing implementation)
```

---

## CONTRACT-DRIVEN TEST WRITING

When the story has a non-empty `produces:` list:

- Import the contract types into the test file. Test code shows `import type { SessionToken } from '@/auth/types'` (or the project equivalent) — the symbol name comes from the contract, not from your invention.
- Assert behavior against the contract's **invariants** section (e.g. "expiresAt > issuedAt"). Each invariant becomes at least one test.
- For `kind: api` contracts, assert the full request/response shape AND each documented error code.
- For `kind: event` contracts, assert the payload shape AND the emission point.
- For `kind: repo` contracts, assert each method's error semantics (return null vs throw) per the contract.

When the story has a non-empty `consumes:` list:

- Import the contract types as if they exist. The test references the consumed surface; the producer story is what made it real.
- Tests for `kind: integration` stories run against the actual deployed seam — no mocks for any `consumes:` contract. If a consumed contract's producer story is not yet `done`, halt; the integration story was scheduled out of order.

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
- [ ] Every contract in `produces:` has at least one test asserting its exported surface
- [ ] Every invariant documented in a `produces:` contract has at least one corresponding test
- [ ] For `kind: integration` stories: every contract in `consumes:` is exercised by at least one cross-story scenario without mocks

---

## FAILURE MODES

- **A test passes unexpectedly** → halt. The feature may already exist or the test is too lax. Investigate before continuing.
- **A test errors** (rather than fails) → fix the test code and re-run. Errors don't count as RED.
- **AC is ambiguous** → halt, set story `status: blocked`, document the ambiguity in `## Blocked Reason`. Do not invent intent.

---

## NEXT

On pass → workflow proceeds to `step-02-green.md`.
