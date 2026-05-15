---
name: extend
description: SAM Extend Workflow - Plan additive changes on top of an existing app. Never wipes; only adds and amends.
version: 1.0.0
---

# SAM Extend Workflow

**Goal:** Plan a new feature, set of stories, or contract change ON TOP OF an existing app produced by a prior `plan`/`plan-n-build` run. `extend` adds artifacts; it never destroys existing ones.

**Your Role:** You are SAM orchestrating an additive planning pass. You coordinate Atlas (compatibility review, contract evolution, story extension). The output is consumable by `build-tdd` exactly like the output of `plan`.

This workflow is the post-v1 counterpart to `plan`. Use it whenever you have an existing `sdocs/` and want to grow the system without rewriting it.

---

## INPUTS

```
/sam:core:workflows:extend  <addendum.md>
```

Required:
- `<addendum.md>` — a markdown file describing the additive change. Loose format; no formal schema. Atlas reads it like a mini-PRD section. See "Addendum Format" below.

Required preconditions:
- `sdocs/prd.md` (or equivalent at the linked location) exists
- `sdocs/architecture-ref.md` exists
- `sdocs/contracts/INDEX.md` exists (so `extend` can amend the set)
- `sdocs/epics/` and `sdocs/stories/` exist with at least one done story (otherwise use `plan` for the initial run)

Optional flags:
- `--epic <id>` — bind new stories to an existing epic by id (skips creating a new epic). Without this flag, Atlas decides whether to attach to an existing epic or open a new one.

---

## OUTPUTS

Adds to the existing `sdocs/` tree AND merges the addendum into the live PRD:

```
<project-root>/
├── prd.md                              # MERGED in place: new requirements + change log + version bump
└── sdocs/
    ├── addenda/
    │   └── <YYYY-MM-DD>-<slug>.md     # copy of the input addendum, archived (audit trail)
    ├── contracts/
    │   └── <area>/<new-or-extended>.md   # NEW or VERSION-BUMPED contracts
    ├── epics/
    │   └── EPIC-<NNN>-<slug>.md        # new epic(s), if created
    └── stories/
        └── STORY-<NNN>-<slug>.md       # new feature + integration stories
```

Existing artifacts:
- Untouched if the addendum doesn't affect them
- Amended in-place ONLY for `status` field changes (e.g. a contract going from `stable` to `deprecated`); the body is preserved
- Story ids continue the existing sequence — never reuse a done story's id
- The PRD is **modified in place** by Phase 4: new functional requirements appended, `## Change log` entry added, frontmatter `version` bumped. Pre-existing PRD content is preserved — never rewritten or reordered.

---

## ADDENDUM FORMAT

A markdown file with these sections (all required except where noted):

```markdown
# <Feature name>

## Purpose
One paragraph describing what this addendum adds and why.

## User-visible change
What a user will notice. If none (refactor, internal), state "none — internal change."

## Affected areas
- Which existing PRD features does this touch?
- Which existing contracts will be extended, broken, or made obsolete?
- Estimate: number of new stories (Atlas may revise).

## New acceptance criteria
- AC1: ...
- AC2: ...

## Out of scope
- Things explicitly NOT in this addendum

## Compatibility
- Does this break any existing public surface? If yes, name what.
- If breaking, is migration covered by this addendum or a follow-up?
```

Addenda are intentionally loose. Atlas turns them into rigorous artifacts.

---

## SCHEMA CONTRACTS

Every NEW or AMENDED file MUST conform to:
- `_sam/core/resources/story-schema.md`
- `_sam/core/resources/epic-schema.md`
- `_sam/core/resources/contract-schema.md`

Refuse to emit invalid artifacts. Existing artifacts that already pass schema are not re-validated.

---

## PHASES

### Phase 1: Validate Addendum
**Load step:** `./steps/step-01-validate-addendum.md`

- Atlas reads `<addendum>` + existing PRD + architecture-ref + contracts INDEX
- Determines compatibility: does the addendum fit the existing system, or does it require a redesign?
- Identifies which existing contracts will be extended vs broken
- Surfaces risks introduced by the addendum
- Writes `sdocs/addenda/<date>-<slug>.md` (archived copy) + `sdocs/addenda/<date>-<slug>-validation.md`

**Gate:** Addendum is implementable additively; no rewrite required; any breaking change is explicitly named.

### Phase 2: Evolve Contracts
**Load step:** `./steps/step-02-evolve-contracts.md`

- For each contract the addendum touches:
  - **New contract** → write at `sdocs/contracts/<area>/<id>.md` with `status: draft`, `version: 1`
  - **Additive extension** → bump `version: N → N+1`, append the new fields to the body, keep `status: stable`
  - **Breaking change** → leave old contract at its current version, set `status: deprecated`, write a new contract at version N+1 with new id (or same id at v2 — Atlas picks per convention)
- For each existing story that produces a now-extended contract: append a note in `sdocs/addenda/<date>-<slug>-validation.md` flagging the producer story for review (NOT modified automatically — that's a future story's job)
- Update `sdocs/contracts/INDEX.md` to reflect the new state

**Gate:** Every contract change classified (new / additive / breaking); INDEX.md regenerated; no orphan contracts.

### Phase 3: Extend Stories
**Load step:** `./steps/step-03-extend-stories.md`

- Generate new story ids continuing the existing sequence (max(existing STORY-NNN) + 1)
- For each new story: declare `produces` / `consumes` against the contract set (new or v2 ids as appropriate)
- If creating a new epic: emit an integration story for it
- If extending an existing epic (`--epic` flag or Atlas decision): emit a `kind: integration` "regression" story to verify the extension didn't break the existing flow. This regression story consumes both the v2 (extended) contracts AND the original v1-still-consumed contracts.
- Walk every new contract from Phase 2 and confirm an owner_story is now assigned

**Gate:** New stories valid; depends_on acyclic across the WHOLE story set (including pre-existing done stories); every new contract has an owner; every consumer can reach its producer.

### Phase 4: Merge PRD
**Load step:** `./steps/step-04-merge-prd.md`

- Locate the live PRD (via story frontmatter, falling back to `sdocs/prd.md` then root `prd.md`)
- Append the addendum's new functional requirements to the PRD's `## Functional Requirements` (or equivalent section)
- Append the addendum's `## Out of scope` items to the PRD's `## Out of Scope` section
- Append a `## Change log` entry citing the addendum slug and the version bump
- Bump frontmatter `version` and `last_updated`
- Preserve all pre-existing PRD content — no rewrites, no reorders, no deletions
- The addendum file at `sdocs/addenda/` remains as the audit trail; the PRD is the source of truth for the **current** spec

**Gate:** PRD `version` strictly greater than before; `## Change log` contains a new entry; pre-existing sections preserved; PRD still validates against `prd-schema.md`.

---

## EXIT STATES

### Success
All new artifacts written; existing artifacts amended only for status flips. Output summary:

```
Extend complete.
Addendum:     sdocs/addenda/2026-05-15-tags.md
Contracts:    1 new, 2 extended (v1→v2), 0 deprecated
Epics:        0 new, 1 extended (EPIC-001 gains 3 stories)
Stories:      3 new (status: ready); 0 existing modified

Next: /sam:core:workflows:build-tdd sdocs/stories/STORY-<NNN>-<slug>.md
   or invoke plan-n-build over the new story set only
```

### Compatibility failure (Phase 1)
Halt with `sdocs/addenda/<date>-<slug>-validation.md` describing why the addendum cannot land additively (e.g. requires architectural rewrite, conflicts with an in-progress story). User decides whether to revise the addendum, use `plan --force`, or split into smaller addenda.

### Contract failure (Phase 2)
Halt with the offending contract change. Roll back any partial writes. Do not leave the contract set in a half-evolved state.

### Schema failure (Phase 3)
Halt with the specific story that failed and the schema rule it broke. Do not emit partial story artifacts.

### PRD merge failure (Phase 4)
Halt and roll back the PRD file. The contract + story artifacts written by Phases 2 and 3 stay (they are independently valid). Re-run with `--merge-only <addendum>` after fixing the underlying issue (most often: PRD too unstructured to merge automatically, or section names diverge from `prd-schema.md`).

---

## RESUMPTION

`extend` is idempotent on the same addendum:

- Compares the addendum content to any prior archived addendum
- If an identical addendum has already been processed (same slug, same body): halts with "addendum already extended on <date>; pass --force to re-process"
- With `--force`: re-runs Phase 1 (validation may surface new issues if the system has changed); writes new contract/story versions with fresh sequence numbers

Existing `done` stories are NEVER re-opened by `extend`. Their status stays `done`.

---

## RELATIONSHIP TO `plan`

|                          | plan                                    | extend                                  |
|--------------------------|-----------------------------------------|-----------------------------------------|
| Input                    | PRD                                     | addendum + existing sdocs/              |
| Output                   | full epics + stories + contracts        | additional epics + stories + contracts  |
| Existing artifacts       | wiped (with --force) or refused         | preserved; only status flips amended    |
| Use when                 | initial build OR full rewrite           | adding to a running app                 |
| Atlas review depth       | full PRD validation                     | compatibility + delta only              |

If `extend` reports that the addendum cannot land additively, the answer is usually one of:
1. Split the addendum into smaller additive pieces
2. Re-run `plan --force` to redesign from scratch (last resort; loses done state)
3. Manually mark affected stories `blocked`, write a migration story, then re-run `extend`

---

## AUTONOMOUS BEHAVIOR

- No human prompts during execution
- Atlas decides epic attachment unless `--epic` is set
- All decisions logged in the validation report
- Halt cleanly on gate failures with actionable messages
