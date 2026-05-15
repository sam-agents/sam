---
step: 3
name: generate-stories
description: Decompose a validated PRD into epics, feature stories, and integration stories — all bound to contracts
agents: [architect]
---

# Step 3: Generate Epics and Stories

**Purpose:** Produce the full set of `sdocs/epics/` and `sdocs/stories/` artifacts that `build-tdd` will consume. Bind every story to the contracts written in Step 2 via `produces:` / `consumes:`, and emit an integration story per epic so seams are tested end-to-end. Every artifact MUST conform to the canonical schemas.

---

## ENTRY CONDITIONS

- Step 1 passed (validation report written, status: passed)
- Step 2 passed (`sdocs/contracts/` written, INDEX.md present)
- `sdocs/architecture-ref.md` exists
- Resolved design standards available in architecture-ref.md

---

## SCHEMA REFERENCES (REQUIRED READING)

Read all three before generating anything:
- `_sam/core/resources/story-schema.md`
- `_sam/core/resources/epic-schema.md`
- `_sam/core/resources/contract-schema.md`

The schemas are the contract. Refuse to emit artifacts that violate them.

---

## PROCESS

### 3.1 Analyze PRD Structure

- Identify major feature areas (epic candidates)
- Group related requirements
- Identify dependencies between feature areas
- Apply technical constraints from architect review

### 3.2 Create Epics

For each major feature area, write `sdocs/epics/EPIC-<NNN>-<slug>.md` matching `epic-schema.md`. IDs are sequential starting at `EPIC-001`.

### 3.3 Decompose into Feature Stories

For each epic, write `sdocs/stories/STORY-<NNN>-<slug>.md` matching `story-schema.md` with `kind: feature`. Story IDs are sequential across the **whole project**, not per-epic. Story slugs are short kebab-case hints.

**Mandatory body sections** (in this order):
1. `## User Story` — As a … I want … so that …
2. `## Acceptance Criteria` — Given / When / Then, each as a checkbox
3. `## Technical Notes` — Files in scope, architecture refs, non-functional requirements
4. `## Test Approach` — Unit / integration / e2e split
5. `## Out of Scope` — Explicit exclusions

**Conditional sections:**
- `## Design Standards` — required for any story touching UI
- `## Bootable App Requirements` — required for the first / scaffolding story of a new project

### 3.4 Bind Stories to Contracts

For every feature story, populate the frontmatter `produces:` and `consumes:` lists using contract ids from `sdocs/contracts/INDEX.md`.

- A story `produces:` a contract when its implementation will define the canonical shape / endpoint / event / repo for that seam. Exactly **one** story produces each contract.
- A story `consumes:` a contract when its implementation depends on a seam defined by another story.
- A story's `consumes:` list MUST be transitively reachable in `depends_on` — you cannot consume a contract whose owner story is not in your dependency chain.

After assignment, walk `sdocs/contracts/**` and resolve every `owner_story:` placeholder to the real STORY-NNN id. If any contract has no producer after the pass, halt with the contract id and the missing owner.

### 3.5 Emit Integration Stories (one per epic)

For each epic, append a final story with `kind: integration`. This story exists to exercise the seams between the epic's feature stories so integration drift fails loudly during build-tdd, not later.

Integration story frontmatter:

```yaml
id: STORY-<NNN>
epic: EPIC-<NNN>
kind: integration
title: <Epic title> — integration
status: ready
priority: P0
depends_on: [<every feature story in this epic>]
produces: []
consumes: [<every contract produced by this epic's feature stories>]
```

Integration story body:

```markdown
## User Story
As an operator of the system, I want the <epic-name> seams to compose end-to-end, so that the epic delivers user-visible value, not just locally green tests.

## Acceptance Criteria
- [ ] AC1: An end-to-end scenario that crosses STORY-A → STORY-B → STORY-C completes successfully against real (not mocked) implementations of every consumed contract.
- [ ] AC2: <one AC per cross-story seam — e.g. "login endpoint issues a token that the dashboard endpoint accepts">
- [ ] AC3: <one AC per side-effect that spans stories — e.g. "signing up emits user.signed-up which the welcome-email subscriber receives">

## Technical Notes
- Files in scope: test files only (e.g. `tests/integration/<epic>.spec.ts`). No production code changes.
- Architecture refs: relevant sections of architecture-ref.md
- All `consumes:` contracts are exercised through their real implementations.

## Test Approach
- Integration: end-to-end scenarios across the epic's feature stories
- E2E: where the epic surfaces user-visible flows
- No new unit tests — those belong to feature stories

## Demo Probes
(REQUIRED for web-stack epics; OMIT for non-web epics — Lens auto-skips when absent.)

Each probe is one observable step in the user flow. Lens translates these into a Playwright spec and uses them to assert against the captured network.json:

- milestone: empty-state
  ui: page.goto('/') → expect heading "<epic-feature>" visible
  network: GET <api-base>/<list-endpoint> → 200

- milestone: <action-1-name>
  ui: <user gesture: fill input X with Y, click button Z>
  network: <METHOD> <url-pattern> → <status>

- milestone: <action-2-name>
  ui: <user gesture>
  network: <METHOD> <url-pattern> → <status>

(Continue for every user-visible step in the epic. Each milestone produces a screenshot.)

## Out of Scope
- New production code (Dyna writes wiring only if a missing seam is discovered, and only after the missing contract is documented)
- Stories from other epics
```

**Why `## Demo Probes` matters:** Lens consumes this section to generate `tests/e2e/<epic-slug>.spec.ts` and to verify the captured network.json includes every declared call. If the probe list and the implementation drift, Lens fails the demo gate — surfacing the discrepancy in a way the orchestrator can act on. For non-web epics (backend-only, CLI, library), omit the section and Lens will skip cleanly with a logged reason.

**Why a separate integration story:** the feature stories' GREEN gate enforces the full suite stays green, but that catches regressions in existing tests — not the absence of tests for a seam that no single story owns. The integration story is the story that owns the seam.

### 3.6 Sizing and Ordering

| Size | Criteria |
|------|----------|
| Small | 1–3 tasks, single component, ≤ 1 day |
| Medium | 4–6 tasks, multiple components, 1–2 days |
| Large | 7+ tasks — **split it** unless explicitly indivisible |

**Ordering rules** (encoded as `depends_on` in each story's frontmatter):
1. Dependencies first
2. Foundation before features (scaffolding always STORY-001 for new projects)
3. Producers before consumers (a story's `depends_on` must include every story that produces a contract it consumes)
4. Happy path before edge cases
5. Core functionality before polish
6. Integration story is always the last story in its epic

`priority` (P0 / P1 / P2) is independent of ordering — it captures importance, not sequence. `plan-n-build` will respect `depends_on` first, then sort remaining stories by priority.

### 3.7 Validate the Output Set

Before writing files, validate the whole set:

- [ ] Every PRD feature maps to at least one feature story
- [ ] Every epic has exactly one `kind: integration` story as its final child
- [ ] Every story passes `story-schema.md` validation rules
- [ ] Every epic passes `epic-schema.md` validation rules
- [ ] No orphan stories (every story's `epic` exists in `sdocs/epics/`)
- [ ] No phantom stories (every epic's `Stories` list references real files)
- [ ] `depends_on` graph is acyclic
- [ ] Every contract in `sdocs/contracts/**` has exactly one producer story
- [ ] Every `consumes:` reference resolves to a real contract id
- [ ] Every consumer's `depends_on` (transitively) includes the contract's producer
- [ ] All AC follow Given / When / Then or equivalent testable form

If any check fails, fix the planning output before writing files. Do not emit partial artifacts.

### 3.8 Write Files

Write all epic, feature story, and integration story files with `status: planned` / `status: ready` respectively. Update `sdocs/contracts/**` with resolved `owner_story` ids.

---

## OUTPUT SUMMARY

After successful generation, print:

```
## Planning Output

Epics: 3
  EPIC-001 — User Authentication (4 feature + 1 integration)
  EPIC-002 — Dashboard (3 feature + 1 integration)
  EPIC-003 — Settings (2 feature + 1 integration)

Stories: 12 (9 feature + 3 integration, all status: ready)

Contracts: 11 (4 type, 3 api, 2 event, 2 repo)
  All `owner_story` resolved; every `consumes:` reaches its producer through depends_on.

  Execution order (respecting depends_on, then priority):
    1. STORY-001 — Project scaffolding (P0, feature)
    2. STORY-002 — User can log in (P0, feature) [produces: auth.session-token, auth.post-login]
    3. STORY-003 — User can log out (P1, feature) [consumes: auth.session-token]
    4. STORY-005 — User Authentication — integration (P0, integration)
    ...

Next: /sam:core:workflows:build-tdd sdocs/stories/STORY-001-scaffolding.md
   or: /sam:core:workflows:plan-n-build
```

---

## EXIT

- **Success:** all files written, validation set passes, summary printed.
- **Failure:** halt without writing files; print the validation rule that failed and the offending story / epic / contract.
