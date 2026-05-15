---
step: 3
name: extend-stories
description: Atlas appends new stories to the existing set, resolving contract owners and depends_on across the old + new story graph
agents: [architect]
---

# Step 3: Extend Stories

**Agent:** Atlas (System Architect)

**Purpose:** Generate the new feature stories required by the addendum, bind them to the (post-Phase-2) contract set, and emit the integration coverage. This step is structurally identical to `plan` Phase 3 — except story ids continue the existing sequence and integration coverage may attach to an existing epic as a "regression" story rather than a fresh one.

---

## ENTRY CONDITIONS

- Phase 2 passed; contracts evolved and INDEX.md regenerated
- `sdocs/stories/` and `sdocs/epics/` exist with at least one done story

---

## SCHEMA REFERENCES (REQUIRED READING)

- `_sam/core/resources/story-schema.md`
- `_sam/core/resources/epic-schema.md`
- `_sam/core/resources/contract-schema.md`

The schemas are the contract. Refuse to emit artifacts that violate them.

---

## PROCESS

### 3.1 Determine ID Sequence Start

Find the highest existing STORY-NNN id in `sdocs/stories/`. New stories continue from N+1.

Find the highest existing EPIC-NNN id if a new epic will be created. Otherwise reuse the epic id specified by `--epic` or chosen by Atlas in Phase 1.

### 3.2 Decompose the Addendum into Feature Stories

For each user-visible piece of the addendum, write a new `kind: feature` story matching `story-schema.md`. Same body sections as `plan` Phase 3 (User Story / AC / Technical Notes / Test Approach / Out of Scope).

Slicing rules from `plan` Phase 3 still apply (vertical slices; one user-visible outcome per story; producers-before-consumers).

### 3.3 Bind Stories to Contracts (including v2 contracts)

For each new story, populate `produces` / `consumes`. Pay attention to versions:

- A new story that consumes the v2 surface of an extended contract declares `consumes: [api.todo]` (no `@version` suffix means "latest stable"). It implicitly consumes v2.
- A new story that needs the v1 surface specifically can declare `consumes: [api.todo@1]` (pinned). Use this when a regression story tests that v1 still works for legacy consumers.
- A new story that produces a new contract (from Phase 2) takes that contract's `owner_story` placeholder.

After assignment, walk `sdocs/contracts/**` and replace any `owner_story: STORY-???-<hint>` placeholders with the real STORY-NNN id Phase 3 just assigned.

### 3.4 Emit Integration Coverage

Two cases:

**Case A: addendum creates a new epic.** Append a final `kind: integration` story to that epic exactly like `plan` Phase 3 does. The integration story consumes every contract produced by the new epic's feature stories.

**Case B: addendum extends an existing epic.** Append a new `kind: integration` story to the existing epic with `title: "<existing epic title> — regression integration (post-<addendum-slug>)"`. This story consumes both:
- Every contract that already exists and is consumed by the epic's prior stories
- Every new or extended contract this addendum introduced

The regression integration story exercises BOTH the original flow (still working) AND the new flow (working with v2 contracts). Demo Probes section MUST include milestones for both paths if web-stack.

### 3.5 Resolve depends_on Across Old + New

For each new story, build its `depends_on` against the COMBINED set of old + new stories:

- Producers before consumers (as in `plan`)
- A regression integration story `depends_on` every prior feature story in the epic AND every new feature story in this addendum
- Foundation before feature: if the addendum requires a new shared dependency, it gets its own story that other new stories depend on

The combined depends_on graph (old + new) MUST remain acyclic.

### 3.6 Sizing & Ordering Check

Same Small / Medium / Large sizing rules as `plan` Phase 3. Same ordering: dependencies first, producers before consumers, happy path before edge cases, integration last.

### 3.7 Validate the Combined Output Set

Before writing files, validate:

- [ ] Every new story passes `story-schema.md` validation
- [ ] Every new contract from Phase 2 has its `owner_story` resolved to a real STORY-NNN
- [ ] Every new consumer's `consumes:` reaches its producer via `depends_on` (over the combined graph)
- [ ] No new story has the same id as any existing story (sequence collision)
- [ ] If a new epic was created, it has exactly one `kind: integration` story; if an existing epic was extended, the additional integration story exists
- [ ] The COMBINED depends_on graph (old done stories + new ready stories) is acyclic
- [ ] All new ACs follow Given / When / Then or equivalent testable form

If any check fails, fix BEFORE writing. No partial writes.

### 3.8 Write Files

Write all new epic, story, and updated contract owner_story fields. New stories are `status: ready`. Existing done stories are NOT touched. Existing epic files MAY be updated to append new story ids to their `## Stories` list.

---

## OUTPUT SUMMARY

After successful generation, print:

```
## Extend Output

Addendum: 2026-05-15-tags
Compatibility verdict: proceed (from Phase 1)

Contracts:
  - api.todo: v1 → v2 (additive)
  - api.create-todo: v1 → v2 (additive — request shape gains optional tags)
  - api.update-todo: v1 → v2 (additive — allow tags update)

Epics: 0 new, 1 extended (EPIC-001)

Stories: 3 new (status: ready)
  STORY-007 — Backend: accept and persist tags (P0, feature)
  STORY-008 — Frontend: show + edit tags (P0, feature)
  STORY-009 — User manages todos — regression integration post-tags (P0, integration)

Next: /sam:core:workflows:build-tdd sdocs/stories/STORY-007-...md
   or: /sam:core:workflows:plan-n-build  (will run only ready stories)
```

---

## EXIT

- **Success:** all new files written, validation passes, summary printed. Proceed to `step-04-merge-prd.md` to update the live PRD.
- **Failure:** halt without writing files; print the validation rule that failed and the offending story / contract.

---

## NEXT

On pass → load `step-04-merge-prd.md` to merge the addendum's new functional requirements into the live PRD. The PRD is the only artifact `extend` modifies in place outside `sdocs/`; without Phase 4, the PRD silently goes out of sync with the actual stories.
