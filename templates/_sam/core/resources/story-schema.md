---
name: story-schema
description: Canonical schema for SAM story files. Read by plan workflow (writer) and build-tdd workflow (reader).
---

# Story Schema

This is the contract between `plan` (writes stories) and `build-tdd` (reads stories). Every agent that touches a story file MUST honor this schema.

---

## File location

Stories live in the consumer project at:

```
sdocs/stories/STORY-<NNN>-<slug>.md
```

- `NNN` is zero-padded sequential (`001`, `002`, …)
- `slug` is a short kebab-case hint (e.g. `user-login`, `password-reset`)
- Example: `sdocs/stories/STORY-003-password-reset.md`

---

## Frontmatter (required)

```yaml
---
id: STORY-003                         # stable identifier; never renumber
epic: EPIC-001                        # parent epic id (or null for ad-hoc stories)
kind: feature                         # feature | integration | scaffolding
title: User can reset password       # one-line summary, no trailing period
status: ready                         # draft | ready | in-progress | done | blocked | needs-rebuild | obsolete
priority: P1                          # P0 (critical) | P1 (normal) | P2 (nice-to-have)
prd: ../../prd.md                     # relative path from this file to the source PRD (or null)
depends_on: [STORY-001]               # list of story ids that must be `done` first; [] if none
produces: [auth.password-reset-token] # contract ids this story implements; [] if none
consumes: [db.user-repo, auth.session-token]  # contract ids this story depends on; [] if none
created: 2026-05-13                   # YYYY-MM-DD; never changes after creation
---
```

**Field rules**
- `id` — assigned at creation, immutable. Renaming the file does not change `id`.
- `kind`:
  - `feature` — implements user-facing or system functionality (the default)
  - `integration` — auto-generated per epic; exercises seams between feature stories; writes test code only
  - `scaffolding` — bootstraps a new project; always STORY-001 for new projects
- `status` — the **single source of truth** for resume. `plan-n-build` reads this to skip completed stories. Transitions:
  - `draft` → `ready` (when `plan` finalizes the story)
  - `ready` → `in-progress` (when `build-tdd` picks it up)
  - `in-progress` → `done` (when `build-tdd` completes all phases)
  - any → `blocked` (when retry limit hit; include reason in body)
  - `done` → `needs-rebuild` (when a contract this story produces has changed; code is kept but story must be re-built when user confirms)
  - `needs-rebuild` → `in-progress` (when user confirms rebuild; `build-tdd` picks it up again)
  - `done` → `obsolete` (when the feature is removed from the PRD; code is not deleted but story is retired)
  - `ready` → `obsolete` (when the feature is removed before build starts)
  - `in-progress` → `obsolete` (when the feature is removed during build)
- `priority` — drives execution order in `plan-n-build`.
- `prd` — relative link so agents can pull PRD context without re-deriving it.
- `depends_on` — `plan-n-build` honors this when ordering execution.
- `produces` — contract ids (from `sdocs/contracts/INDEX.md`) this story defines the canonical implementation for. Exactly one producer per contract across the whole project.
- `consumes` — contract ids this story imports / depends on. Every entry MUST be reachable from this story through `depends_on` (its producer is in the dependency chain).

---

## Body (required sections, in this order)

```markdown
## User Story
As a <persona>, I want <capability>, so that <outcome>.

## Acceptance Criteria
- [ ] AC1: Given X, when Y, then Z
- [ ] AC2: ...

## Technical Notes
- Files in scope: src/auth/*, src/components/LoginForm.tsx
- Architecture refs: architecture-ref.md sections 3, 5
- Non-functional: a11y AA, p95 < 200ms

## Test Approach
- Unit: <what to unit-test>
- Integration: <what to integration-test>
- E2E: <what to e2e-test, if any>

## Out of Scope
- <Explicitly excluded items, often "covered in STORY-NNN">
```

**Optional sections (append after the required ones)**

```markdown
## Design Standards
- Source: PRD-provided | SAM default-design-standards.md
- Apply: typography, color tokens, component states per resolved standards

## Bootable App Requirements
(Only for scaffolding stories — first story of a project.)
- [ ] index.html with root + script entry
- [ ] main.{js,ts}x mounts app with all required providers
- [ ] npm run build succeeds
- [ ] npm run dev starts without error

## Blocked Reason
(Only when status: blocked.)
- Phase: red | green | refactor | ui | css | a11y | security
- Attempts: <n>
- Details: <what's stuck and why>
```

---

## Why each field earns its place

| Field | Why |
|-------|-----|
| `id` / `epic` | Stable references that survive renames and reordering |
| `kind` | Distinguishes feature work from auto-generated integration / scaffolding work |
| `status` | Single source of truth; resume logic depends on it (no separate state file) |
| `prd` | Lets `build-tdd` agents pull broader context without re-running planning |
| `depends_on` | Lets `plan-n-build` execute stories in valid order |
| `produces` / `consumes` | Make seams between stories machine-checkable; Titan tests against `consumes:`, Argus gates on `produces:` |
| `Files in scope` | Bounds the dev agent's blast radius — prevents drift |
| `Out of Scope` | Prevents scope creep mid-story |
| `Test Approach` | Gives Titan a starting point without re-deriving from AC |

---

## Validation rules

A story is **valid** when:
- [ ] All frontmatter fields present (`prd` may be `null`; `depends_on`/`produces`/`consumes` may be `[]`)
- [ ] `kind` is one of `feature` | `integration` | `scaffolding`
- [ ] At least one AC in `## Acceptance Criteria`
- [ ] Each AC follows Given/When/Then or equivalent testable form
- [ ] `depends_on` is acyclic across the whole `sdocs/stories/` set
- [ ] `Files in scope` is non-empty (or explicitly states "new files only")
- [ ] Every entry in `produces` and `consumes` matches a contract id in `sdocs/contracts/INDEX.md`
- [ ] For every `consumes:` entry, the contract's `owner_story` is reachable from this story's `depends_on` (transitively); a consumer cannot run before its producer
- [ ] No two stories `produces:` the same contract id

Additional rules by `kind`:
- `kind: integration` — `produces:` must be `[]`; `Files in scope` lists test files only (no production code paths)
- `kind: scaffolding` — `## Bootable App Requirements` section is required

`plan` MUST emit valid stories. `build-tdd` MUST refuse to start on an invalid story.
