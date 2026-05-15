---
name: plan
description: SAM Planning Workflow - Transforms a PRD into validated epics and stories. Does NOT implement code.
version: 1.0.0
---

# SAM Planning Workflow

**Goal:** Validate a PRD and decompose it into epics and stories that are ready for the TDD workflow to implement.

**Your Role:** You are SAM orchestrating planning. You coordinate Atlas (architecture) and Iris (UX) for validation, then generate epics and stories matching the canonical schema.

This workflow produces **artifacts only**. It does not write production code or tests.

---

## INPUTS

```
/sam:core:workflows:plan path/to/prd.md
```

Required: a PRD file path. Optional: `--force` to overwrite existing `sdocs/epics/` and `sdocs/stories/`.

---

## OUTPUTS

Writes to the consumer project:

```
sdocs/
├── architecture-ref.md           # Atlas's resolved architecture + design standards
├── contracts/                    # Typed seams between stories (see contract-schema.md)
│   ├── INDEX.md
│   ├── auth/
│   │   ├── session-token.md
│   │   └── post-login.md
│   └── db/
│       └── user-repo.md
├── epics/
│   ├── EPIC-001-<slug>.md
│   └── EPIC-002-<slug>.md
└── stories/
    ├── STORY-001-<slug>.md       # status: ready, kind: feature
    ├── STORY-002-<slug>.md
    ├── STORY-00N-integration.md  # auto-generated per epic, kind: integration
    └── ...
```

All stories emerge with `status: ready`. None are `in-progress` or `done` — those transitions belong to `build-tdd`. Every epic is closed by an auto-generated **integration story** whose acceptance criteria exercise the seams between the epic's feature stories.

---

## SCHEMA CONTRACTS

Every story file MUST conform to `_sam/core/resources/story-schema.md`.
Every epic file MUST conform to `_sam/core/resources/epic-schema.md`.
Every contract file MUST conform to `_sam/core/resources/contract-schema.md`.
Refuse to emit invalid artifacts.

---

## PHASES

### Phase 1: Validate PRD
**Load step:** `./steps/step-01-validate-prd.md`

- Atlas reviews technical feasibility
- Iris reviews UX (if PRD has UI requirements)
- Atlas resolves design standards (PRD-provided or SAM defaults)
- Atlas writes `sdocs/architecture-ref.md`

**Gate:** PRD is feasible, AC are testable, no blocking risks.

### Phase 2: Design Contracts
**Load step:** `./steps/step-02-design-contracts.md`

- Atlas identifies the seams in the system: data shapes, endpoints, events, repos, module surfaces
- Atlas writes one `sdocs/contracts/<area>/<id>.md` per seam, conforming to `contract-schema.md`
- Atlas writes `sdocs/contracts/INDEX.md` summarizing the contract set
- `owner_story` fields are placeholders at this point — Phase 3 resolves them

**Gate:** Every contract validates against `contract-schema.md`; no duplicate ids; no orphan contracts.

### Phase 3: Generate Epics and Stories
**Load step:** `./steps/step-03-generate-stories.md`

- Group PRD features into epics
- Decompose each epic into feature stories matching the story schema
- For each story, populate `produces:` / `consumes:` referencing real contract ids from Phase 2
- Auto-append an **integration story** per epic (`kind: integration`) whose AC exercise the seams
- Resolve `owner_story` placeholders in `sdocs/contracts/**` to real story IDs
- Order by dependencies (`depends_on`) and priority
- Validate the full set against schema rules
- Write all files; set `status: ready`

**Gate:** All PRD features are covered; every contract has exactly one owner story; every consumer's `consumes:` resolves; integration story exists for each epic; all stories pass schema validation.

---

## EXIT STATES

### Success
All stories written with `status: ready`. Output summary:

```
Planning complete.
Epics: <n>    Stories: <n>
Output: sdocs/epics/, sdocs/stories/, sdocs/architecture-ref.md

Next: /sam:core:workflows:build-tdd <story-path>   (single story)
   or: /sam:core:workflows:plan-n-build           (all stories)
```

### Validation failure (Phase 1)
Halt with `validation-report.md` listing blocking issues. PRD must be revised before retry.

### Contract failure (Phase 2)
Halt with the specific contract that failed and the rule it broke. Do not write a partial contract set — the contracts must be coherent before any story references them.

### Schema failure (Phase 3)
Halt with the specific story/epic that failed and the schema rule it broke. Indicates a planning bug — do not produce partial output.

---

## RESUMPTION

`plan` is idempotent on a clean run. If `sdocs/epics/`, `sdocs/stories/`, or `sdocs/contracts/` already exists:

- Without `--force`: halt with "planning artifacts already exist; pass --force to overwrite"
- With `--force`: archive the existing `sdocs/{epics,stories,contracts,architecture-ref.md}` to `sdocs/.archive/<timestamp>/` then proceed

This protects in-progress TDD work from being silently destroyed.

---

## AUTONOMOUS BEHAVIOR

- No human prompts during execution.
- All decisions logged inline in the validation report and architecture-ref.
- Halt cleanly on gate failures with actionable messages.
