---
step: 2
name: green
description: Implement minimum code to make failing tests pass, verify build and integration
agents: [dev]
---

# Step 2: GREEN — Make Tests Pass

**Agent:** Dyna (Developer)

**Purpose:** Write the **minimum** code needed to satisfy the failing tests from RED. Then verify the build and entry-point wiring so the implementation actually runs, not just passes tests.

---

## ENTRY CONDITIONS

- RED phase complete: all new tests failing for the right reason
- Story `status: in-progress`
- Code-write access to files listed in `## Technical Notes > Files in scope`

---

## PROCESS

```
1. Re-read the story file (especially `Files in scope` and `Test Approach`)
2. Confirm RED state (tests fail)
3. Implement minimum code to pass tests
4. Run the new tests until they pass
5. Add unit tests for implementation details not covered by AC tests
6. Run the FULL project test suite (not just new tests) — no regression allowed
7. Run the build command — must succeed
8. For stories adding providers / routers / context: verify the real app entry point is wired
9. Mark story phase complete
```

---

## SCOPE DISCIPLINE

- Only modify files listed in `## Technical Notes > Files in scope`. If implementation requires changes outside scope, halt and update the story's scope before proceeding — do not silently expand the blast radius.
- "Minimum code to pass tests" is the bar. Do not introduce abstractions, helpers, or future-proofing. Three similar lines beat a premature abstraction.

---

## BUILD VERIFICATION (REQUIRED)

After all tests pass, verify the app actually builds and boots — not just that tests pass in isolation. This catches missing files, unwired providers, broken imports, and configuration issues that unit tests mask.

1. **Build:** Run the project's build command (e.g., `npm run build`, `npx vite build`). If it fails, GREEN is not complete — fix and re-run.
2. **Full suite:** Run ALL project tests. Earlier stories' tests must still pass.

**For scaffolding stories** (first story of a project, or any story with `## Bootable App Requirements`):
3. **Boot check:** Server starts and listens / client renders without console errors.
4. **Entry point wiring:** Providers, routers, context wrappers from architecture-ref.md are present in the **real** entry point (e.g. `src/main.tsx`), not just test wrappers.

**For stories that add providers / routers / context:**
5. **Entry point update:** When adding a new provider (Auth, Router, Theme, etc.), update the real entry point. Tests that wrap components in `<MemoryRouter>` or `<AuthProvider>` will pass even when the real app is missing them — this is the classic regression.

**For monorepo projects:**
6. **Environment check:** `dotenv` / config loads from the correct path relative to project root, not from CWD.

---

## RETRY LOOP

```
attempt = 0
while attempt < 3:
  implement / adjust
  result = run_tests()
  if result.all_pass: break
  attempt += 1

if attempt == 3:
  set story.status = blocked
  append `## Blocked Reason` with phase: green, last error
  exit (do not continue to refactor)
```

---

## GATE — GREEN PASSES WHEN

- [ ] All new AC tests pass
- [ ] All new unit tests pass
- [ ] Full suite green (no regression in prior stories' tests)
- [ ] Build succeeds (`npm run build` or project equivalent)
- [ ] Real entry point wired for any new providers / routers (not just test wrappers)
- [ ] For scaffolding: app boots in dev mode

---

## NEXT

On pass → workflow proceeds to `step-03-refactor.md`.
