---
step: 2
name: design-contracts
description: Atlas designs the typed seams between stories before stories are generated
agents: [architect]
---

# Step 2: Design Contracts

**Agent:** Atlas (System Architect)

**Purpose:** Identify the seams in the system Atlas is about to slice into stories, and lock the shape of each seam as a `sdocs/contracts/<area>/<id>.md` file. Stories will then declare which contracts they `produces:` and which they `consumes:`, so isolated story development can no longer drift.

This step exists because stories built in isolation always integrate badly when the API surface between them is implicit. Making seams explicit and machine-checkable shifts integration cost from end-of-epic to per-story.

---

## ENTRY CONDITIONS

- Step 1 passed: `sdocs/validation-report.md` written with `status: passed`
- `sdocs/architecture-ref.md` exists (resolved architecture + design standards)
- PRD is feasible per Atlas's review

---

## SCHEMA REFERENCE (REQUIRED READING)

Before writing anything: read `_sam/core/resources/contract-schema.md`. It defines the file location, frontmatter, body sections per `kind`, and validation rules. Refuse to emit contracts that violate it.

---

## PROCESS

### 2.1 Identify the seams

Walk the PRD + `architecture-ref.md` and list every place where one piece of the system will produce something another piece must consume. Typical seams:

- **Data shapes** crossing module boundaries (`User`, `SessionToken`, `Invoice`)
- **HTTP / RPC endpoints** the client calls or another service hits
- **Domain events** emitted on a bus / queue
- **Repository / data-access interfaces** between feature code and persistence
- **Module-level public surfaces** when a feature exposes a curated set of functions

A seam is anything where, if two developers worked on the two sides independently, they could plausibly invent two slightly different shapes. Those are the contracts you need.

### 2.2 Pick a `kind` for each seam

Map each seam to one of the five contract `kind`s:

| Seam | Kind |
|------|------|
| Data shape | `type` |
| HTTP / RPC endpoint | `api` |
| Domain event on bus / queue | `event` |
| Persistence interface | `repo` |
| Curated module exports | `module` |

If a seam doesn't fit, prefer `type` for "just a shape" and `module` for "a small public API." Do not invent new kinds.

### 2.3 Draft the body

For each contract, write the body sections required by its `kind` (see `contract-schema.md`). Code blocks MUST declare a language. Prefer the project's primary type language; default to TypeScript when the project is polyglot or undecided.

Three rules:

1. **Be concrete.** No "userId: some identifier" — write `userId: string` and add an invariant line if there's a format rule.
2. **State invariants explicitly.** Anything a consumer would otherwise have to guess (nullability, ranges, error semantics) is part of the contract.
3. **Keep contracts thin.** If a contract is growing past ~50 lines it's probably two contracts.

### 2.4 Assign `owner_story` placeholders

You don't have stories yet — they're generated in Step 3. For each contract, write `owner_story: <slug-hint>` using a kebab-case hint that points at the story you expect will produce it (e.g. `owner_story: STORY-???-login`). Step 3 will resolve these to real IDs after stories are emitted.

Foundational contracts that no single story produces (e.g. shared types pre-existing in the codebase) get `owner_story: null`.

### 2.5 Write the files

Write each contract to `sdocs/contracts/<area>/<id>.md`. Group by area (`auth`, `api`, `db`, `events`, etc.) so the tree is navigable.

### 2.6 Validate the contract set

Before exiting:

- [ ] Every contract file passes `contract-schema.md` per-file validation
- [ ] No two contracts share an `id`
- [ ] Areas are consistent kebab-case
- [ ] Every code block in every contract declares a language
- [ ] Every contract has either an explicit `owner_story` placeholder or `null`

If any check fails, fix the contracts before writing. Do not emit a partial set.

### 2.7 Write the contract index

Write `sdocs/contracts/INDEX.md` — a flat table for humans and agents:

```markdown
# Contracts

| ID | Kind | Owner story | Status |
|----|------|-------------|--------|
| auth.session-token | type | STORY-002-login | draft |
| auth.post-login | api | STORY-002-login | draft |
| db.user-repo | repo | STORY-001-scaffold | draft |
```

---

## OUTPUT SUMMARY

After successful generation, print:

```
## Contract Design Output

Contracts: 12
  type:   4   (data shapes)
  api:    3   (endpoints)
  event:  2   (domain events)
  repo:   2   (persistence interfaces)
  module: 1   (public surface)

Output: sdocs/contracts/, sdocs/contracts/INDEX.md

Next: step-03-generate-stories.md will resolve owner_story placeholders and emit stories with produces / consumes references.
```

---

## EXIT

- **Success:** all contracts written, set validation passes, INDEX.md written, summary printed.
- **Failure:** halt without writing files; print the validation rule that failed and the offending contract.

---

## WHY THIS STEP EXISTS

Without contracts, autonomous TDD pipelines fail at integration: each story passes its own tests, yet the stories don't compose. The failure surfaces late, in an "integration story" that nobody planned, with no clear owner and no machine-checkable target. By the time you see it, three downstream stories have already calcified around the drift.

Contracts move that conversation forward in time and write it down in code-shape. Drift becomes a build error during GREEN, not a surprise during the final assembly.
