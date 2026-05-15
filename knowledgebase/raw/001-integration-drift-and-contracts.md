# Learning: Integration Drift in Autonomous TDD, and the Contracts Fix

**Date:** 2026-05-14
**Scope:** SAM planning model — `plan` workflow, `build-tdd` workflow, story schema

## Context

SAM decomposes a PRD into stories and runs each one through strict TDD (RED → GREEN → REFACTOR) in isolation. Each story passes its own tests. But when stories are assembled, integration breaks at the seams: types disagree, endpoint shapes mismatch, repos expose methods callers don't expect. Nobody noticed during individual story runs because no test ever exercised the seam between stories.

This is a structural failure mode of autonomous TDD, not an SAM bug. Any pipeline that runs RED-GREEN-REFACTOR per story without explicit seam enforcement will hit it.

This learning documents the root causes we identified and the fix we landed.

---

## What was happening (the failure mode)

1. **Per-story tests assert against the AC, not against the seam.** Story B's tests prove Story B's code does what Story B's AC says. They do not prove Story B's outputs match Story A's expectations.
2. **Full-suite-must-stay-green catches regressions, not absence.** When Story B passes the full suite after GREEN, that means no *existing* test broke. It does not mean a test exists for the new seam — and integration seams typically have no test author.
3. **`architecture-ref.md` was prose, not a contract.** It described what types and endpoints would exist, but nothing failed when a story diverged from it. Documents that don't fail the build are advisory, and advisory rules drift.
4. **Two stories independently invent slightly different shapes of "the same thing."** Both pass. The drift compounds across an epic.
5. **No story owns the seam.** The seam between Story A and Story B is real but unowned; nobody writes a test for it because writing it inside either story feels out of scope.

---

## The root cause, in one sentence

**Seams between stories were implicit.** Anything implicit drifts. The fix had to make seams explicit *and* machine-checkable.

---

## The fix

Two changes to the planning model, working together:

### 1. Contracts as a first-class planning artifact

Atlas writes `sdocs/contracts/<area>/<id>.md` in a new `plan` Phase 2, **before** stories are decomposed. Each contract is a typed, code-shaped seam — interface, API endpoint, event payload, repo interface, or module surface — governed by a schema (`_sam/core/resources/contract-schema.md`). Five `kind`s cover the common seam shapes.

Stories then declare in frontmatter:
```yaml
produces: [auth.session-token, auth.post-login]
consumes: [db.user-repo]
```

Titan imports `consumes:` types directly (no redeclaration). Dyna implements `produces:` against the contract body (names and signatures match exactly). Argus gates on conformance — drift is a Critical issue.

### 2. Auto-generated integration story per epic

Every epic ends with a `kind: integration` story whose AC exercise the seams between the epic's feature stories against real (non-mocked) implementations. The epic isn't `done` until that story is `done`. **The seam now has an owner.**

---

## Why this works

- **Drift becomes a build error during GREEN**, not a runtime surprise three stories later.
- **Seams move from "implied in prose" to "imported as code."** A test file that says `import type { SessionToken } from '@/auth/types'` can't disagree with the contract body — TypeScript (or the project's type checker) catches it.
- **Per-epic integration stories surface cross-story bugs inside the epic that produced them.** No more mystery regressions in epic 4 caused by a misalignment in epic 2.
- **The unowned-seam problem is solved by giving the seam a story.** Diffusion of responsibility is what makes integration testing fail in big systems; assigning ownership is what fixes it.

---

## Specific learnings worth keeping

### 1. Documents-as-rules drift; code-shaped rules don't

`architecture-ref.md` existed for a long time and was supposed to constrain stories. It didn't, because nothing failed when a story ignored it. The contracts file solves the same problem by being importable — the rule is enforced by the type system, not by Atlas re-reading prose.

**Generalizable:** any rule you can't enumerate as checkboxes or import as code will drift. Prefer enforceable representations.

### 2. `produces:` / `consumes:` is cheap and high-signal

Two list fields in frontmatter give you three things at once:
- **Execution ordering** (consumer's `depends_on` must reach producer)
- **Drift detection** (Argus gates on `produces:` exports matching the contract)
- **Test targeting** (Titan knows what surface to test, not just what AC to test)

Three for the price of one. If a metadata field can replace three runtime checks, write the metadata field.

### 3. The integration story belongs to the seam, not to the feature

Putting integration tests inside Story A "because Story A produces the seam" makes Story A's scope ambiguous — what counts as Story A's AC? Putting them in Story B is symmetric and equally wrong. The integration story is its own story whose AC are end-to-end scenarios across the depends-on graph. This is the same insight that drives contract testing in microservices: the seam test is its own artifact.

### 4. Spec-driven rebuilds are reproducible; clean-room rebuilds aren't

A tangential learning from the same session: when asked to design a prompt that rebuilds SAM from scratch, the spec-driven approach (locked manifest + format contract → regenerate prose) is reproducible across runs. A clean-room rebuild (describe the system's purpose, let the model invent) produces a SAM-like system with different agent names and slightly different workflow shapes every time.

**Generalizable:** if you want reproducibility, lock structure and let prose float. If you want exploration, do the inverse.

### 5. The fix had to live in `plan`, not `build-tdd`

By the time you're in `build-tdd`, the contracts are already implicit. Trying to add seam enforcement during the TDD loop means trying to recover information that was thrown away during planning. Make the planner write the seams down; the TDD loop just enforces them.

**Generalizable:** if you find yourself adding gates to a downstream phase, check whether the upstream phase failed to record information you now need.

---

## Tradeoffs we accepted

- **Atlas does more work in `plan`.** Contracts have to be designed up front. quick-prd is unaffected; `scope` + `plan` are heavier.
- **Stories take longer to author.** Each one names its `produces:` / `consumes:` and is gated on conformance.
- **Contracts can be wrong.** A bad seam from Atlas means every consumer story will rework against the redesigned contract. We accepted this — wrong contracts at least fail loudly and early, vs. drift that fails late and quietly.
- **Integration stories cost an extra TDD cycle per epic.** Worth it; that's where the previously-invisible bugs live.

---

## What we did NOT do (and why)

- **No live-merge-into-main-trunk.** Tempting (the seam would fail at integration if the trunk is the source of truth) but operationally heavy and not strictly necessary once contracts and integration stories exist.
- **No automatic contract versioning.** We added a `version:` field but no auto-bump logic. Manual versioning is good enough until we see real-world breakage.
- **No re-planning during build-tdd.** Contracts are locked at planning time. If a seam needs to change mid-build, it goes through a re-plan, not a hot-patch. We prefer obvious correctness over flexible incorrectness.

---

## Related artifacts

- `_sam/core/resources/contract-schema.md` — contract file spec
- `_sam/core/workflows/plan/steps/step-02-design-contracts.md` — new planning step
- `_sam/core/workflows/plan/steps/step-03-generate-stories.md` — bound stories to contracts + integration stories
- `_sam/core/resources/story-schema.md` — added `kind`, `produces`, `consumes`
- `_sam/core/workflows/build-tdd/steps/step-01-red.md` — Titan imports contracts
- `_sam/core/workflows/build-tdd/steps/step-02-green.md` — Dyna implements against produces
- `_sam/core/workflows/build-tdd/steps/step-03-refactor.md` — Argus gates on conformance
- `REBUILD_PROMPT.md` — clean-room rebuild prompt (tangential to this learning; see point 4 above)
