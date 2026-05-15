---
name: build-tdd
description: SAM Build-TDD Workflow - Implements a single user story using RED-GREEN-REFACTOR, with conditional UI/CSS/A11y/Security review.
version: 1.0.0
---

# SAM Build-TDD Workflow

**Goal:** Take one validated story and drive it to `done` using strict Test-Driven Development.

**Your Role:** You are SAM orchestrating the TDD cycle for one story. You coordinate Titan (RED), Dyna (GREEN), Argus (REFACTOR), and conditional reviewers (Iris / Cosmo / Aria / Sentinel), then Sage logs the per-story changelog. When the story is the last in an epic (the `kind: integration` story) and the project is a web stack, Lens runs after the integration story passes to capture demo evidence for the whole epic.

This workflow is **single-story scoped**. To process multiple stories, use `plan-n-build` (which calls this workflow per story).

---

## INPUTS

```
/sam:core:workflows:build-tdd <story-path-or-id>
```

Examples:
```
/sam:core:workflows:build-tdd sdocs/stories/STORY-001-user-login.md
/sam:core:workflows:build-tdd STORY-001       # resolved against sdocs/stories/
```

Optional flags:
- `--security` — invoke Sentinel after refactor (off by default)
- `--no-web-review` — skip Iris / Cosmo / Aria even if the project looks like a web app

---

## ENTRY CONDITIONS

- Story file exists and passes `story-schema.md` validation
- Story `status` is `ready` (or `in-progress` for resume)
- All stories in the story's `depends_on` list have `status: done`
- `sdocs/architecture-ref.md` exists (or story has self-contained Technical Notes)

If any precondition fails, halt with a clear message — do not silently proceed.

---

## OUTPUTS

- Implementation code + tests in the consumer project
- Updated story file: `status: done`, phase timestamps recorded in frontmatter
- Per-story changelog entry written by Sage (CHANGELOG.md or `sdocs/changelog/<story-id>.md`)

---

## PHASES

State transitions on the story file's `status` field:

```
ready ──► in-progress ──► done
                 └──────► blocked  (on max retries)
```

### Phase 1: RED — Failing tests
**Step:** `./steps/step-01-red.md` (agent: Titan)
- Flip `status: ready` → `in-progress` at entry
- Write failing tests covering every AC
- **Gate:** all new tests fail, and fail for the right reason (no implementation), not because of test errors

### Phase 2: GREEN — Make tests pass
**Step:** `./steps/step-02-green.md` (agent: Dyna)
- Implement minimum code to pass the failing tests
- Verify full suite + build + entry point wiring (for stories that add providers / routers)
- **Gate:** all tests pass, build succeeds, no regression

### Phase 3: REFACTOR — Review and improve
**Step:** `./steps/step-03-refactor.md` (agent: Argus)
- Adversarial review (minimum 3 issues)
- Auto-fix where possible; revert any fix that breaks tests
- **Gate:** no critical / moderate issues, full suite still green, build still succeeds

### Phase 4 (web-only): UI
**Step:** `./steps/step-04-ui.md` (agent: Iris)
- Run only when story affects UI and `--no-web-review` is not set
- Validate user flow, accessibility basics, design-standards conformance
- **Gate:** no critical UX issues

### Phase 5 (web-only): CSS
**Step:** `./steps/step-05-css.md` (agent: Cosmo)
- Run only when web app detected
- Static analysis for spacing, color, alignment, design tokens
- **Gate:** no critical CSS inconsistencies

### Phase 6 (web-only): A11y
**Step:** `./steps/step-06-a11y.md` (agent: Aria)
- Run only when web app detected
- Semantic markup, keyboard navigation, labels, contrast
- **Gate:** no critical semantics or keyboard issues

### Phase 7 (opt-in): Security
**Step:** `./steps/step-07-security.md` (agent: Sentinel)
- Run only when `--security` flag is set
- Secrets, dependency CVEs, secure-coding violations in changed code
- **Gate:** no hardcoded secrets, no Critical / High CVEs in direct deps

### Phase 8: Per-story docs
**Step:** `./steps/step-08-docs.md` (agent: Sage)
- Append a changelog entry for this story (Keep a Changelog format)
- Update API reference if the story added / changed a public surface
- Comprehensive docs are handled by `plan-n-build` at the end of the full run

### Phase 9 (epic-end, conditional): Demo
**Step:** `./steps/step-09-demo.md` (agent: Lens)
- Runs ONLY when the current story is the epic's `kind: integration` story AND it just reached `status: done` AND the project is a web stack
- Lens drives a real browser through the user flow declared by the integration story's `## Demo Probes`, captures video / screenshots / console / network as evidence under `sdocs/evidence/<epic-id>/`
- Evidence-only; not a verifier. The integration story is what proved the seams compose.
- **Gate:** evidence files exist with non-zero size, every declared probe appears in network.json with matching method/URL/status, no `[pageerror]` in console.log
- Skips with a logged `skip.md` for non-web stacks

---

## CONDITIONAL EXECUTION

Web review (Iris / Cosmo / Aria) runs only when web indicators are present in the consumer project. Each agent runs its own activation check; the workflow does not gate on a single flag.

Security (Sentinel) is opt-in per invocation — never auto-runs in the single-story workflow.

Demo (Lens) runs only when (a) the current story is the epic's `kind: integration` story, (b) that story just reached `done`, and (c) a web stack is detected. For non-web stacks, Lens writes a structured `skip.md` and the epic closes without a video. Lens never runs for per-story phases (RED/GREEN/REFACTOR); the slice they produce is incoherent for demo recording.

---

## RETRY POLICY

- **Max retries per phase:** 3
- On retry exhaustion: set `status: blocked`, write `## Blocked Reason` section to the story file, exit with a non-zero summary. Do **not** continue to the next phase.

Retry logic is per-phase, not per-story. A failed GREEN phase that exhausts retries blocks the story; it does not roll back RED.

---

## FINAL STATE WRITE

On success, update the story frontmatter:

```yaml
status: done
phase_log:
  red:      { completed_at: <ts>, tests_written: <n> }
  green:    { completed_at: <ts>, tests_passing: <n>, retries: <n> }
  refactor: { completed_at: <ts>, issues_found: <n>, issues_fixed: <n> }
  ui:       { completed_at: <ts> }    # if web
  css:      { completed_at: <ts> }    # if web
  a11y:     { completed_at: <ts> }    # if web
  security: { completed_at: <ts> }    # if --security
  docs:     { completed_at: <ts> }
  demo:     { completed_at: <ts>, evidence: sdocs/evidence/<epic-id>/ }   # integration story only, web stack
```

---

## EXIT STATES

### Success
Story `status: done`. Print phase summary, test counts, and pointer to the changelog entry.

### Blocked
Story `status: blocked`. `## Blocked Reason` section appended with phase, attempts, and details. Other stories are unaffected — `plan-n-build` can still continue past this one.

### Refused (bad input)
No state changes. Print precondition that failed. Caller should fix the story or unblock its dependencies.
