---
step: 2
name: evolve-contracts
description: Atlas writes new contracts and bumps existing ones in version, without rewriting any unaffected contract
agents: [architect]
---

# Step 2: Evolve Contracts

**Agent:** Atlas (System Architect)

**Purpose:** Apply the contract classification from Phase 1's compatibility matrix to the actual contract files. New contracts are created; additive extensions are version-bumped; breaking changes are deprecated and replaced; obsolete contracts are marked deprecated. Unaffected contracts are not touched.

This is the only step in `extend` that modifies existing files (status flips and version bumps). All other writes are net-new files.

---

## ENTRY CONDITIONS

- Phase 1 passed with verdict `proceed` or `proceed-with-risk` (with confirmation)
- Validation report exists at `sdocs/addenda/<date>-<slug>-validation.md`
- Compatibility matrix in the validation report is complete

---

## SCHEMA REFERENCE

Read before writing: `_sam/core/resources/contract-schema.md`. Refuse to emit contracts that violate it.

---

## PROCESS

Iterate over the compatibility matrix from Phase 1. For each contract:

### 2.1 New Contract

Write `sdocs/contracts/<area>/<id>.md` exactly as a fresh `plan` Phase 2 would:

```yaml
---
id: <area>.<id>
kind: type | api | event | repo | module
title: <one line>
status: draft           # producer story will flip to stable
owner_story: STORY-???-<hint>   # Phase 3 will resolve to real id
version: 1
created: <today>
---
```

### 2.2 Additive Extension

The contract id and file path are unchanged. Edits:

1. Bump `version: N` → `N+1` in frontmatter
2. Keep `status: stable` (the v1 surface is still served; v2 adds fields without removing any)
3. In the body, append the new fields under a clearly marked subsection:

```markdown
## Shape (v2)

\```ts
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  tags: ReadonlyArray<string>;   // v2 addition
}
\```

## Invariants (v2 additions)

- `tags` defaults to `[]` for backward compatibility
- Each tag is non-empty, length 1..40
- Max 10 tags per todo
```

4. Keep the original `## Shape` and `## Invariants` sections intact, retitled with `(v1)` so old consumers know what they were reading.

The implementation MUST satisfy v2; v1 is read-compatible (any v1 consumer still gets all v1 fields back). If that's not true, this is NOT additive — reclassify as breaking and re-run.

### 2.3 Breaking Change

Two write operations:

1. **Old contract** (existing file): set `status: deprecated`. Do NOT modify the body — old consumers need to read it as-is until they migrate.
2. **New contract** (new file): write at `sdocs/contracts/<area>/<id>-v2.md` (or new id entirely if the concept is renamed). `status: draft`, `version: 1` (it's a new contract from this file's perspective), `created: <today>`.

Note: Atlas SHOULD prefer additive extension over breaking change. Breaking is acceptable when the change cannot be additive (e.g. renaming a field, removing a required field, changing a return type).

### 2.4 Obsolete

The addendum removes the feature this contract supports. Set existing contract `status: deprecated`. No replacement contract.

### 2.5 Update INDEX.md

Rewrite `sdocs/contracts/INDEX.md` from the actual file set:

```markdown
| ID | Kind | Version | Owner | Status |
|----|------|---------|-------|--------|
| api.todo | type | 2 | STORY-001 | stable |
| api.tag-set | type | 1 | STORY-??? | draft |
| ... |
```

Preserve any commentary sections; only the table is mechanically regenerated.

### 2.6 Validate the Whole Contract Set

Before writing any of the above, validate the post-change set:

- [ ] Every contract file passes `contract-schema.md` per-file validation
- [ ] No two contracts share an `id`
- [ ] Every deprecated contract is referenced by at least one done story (otherwise it's deprecated AND unreferenced — Atlas should propose removal)
- [ ] No orphan contracts (every contract is `produced` by a story or pre-existed as legacy)

If any check fails, fix BEFORE writing. Partial writes are forbidden.

### 2.7 Update Phase 1 Report

Append to `sdocs/addenda/<date>-<slug>-validation.md` a `## Phase 2 Result` section listing every contract action taken with file path and version.

---

## GATE — EVOLUTION PASSES WHEN

- [ ] Every classification in the compatibility matrix has been applied
- [ ] Every modified file's `version`, `status`, and body match its classification
- [ ] INDEX.md regenerated and accurate
- [ ] Contract set validates as a whole

---

## NEXT

On pass → Phase 3 (`step-03-extend-stories.md`).
On failure → halt; surface the failed validation; do not leave the contract set in a half-evolved state. Roll back any writes already made (the file system has no transaction, so the implementation must write each contract to a tempfile first then atomically rename — Atlas plans the writes, the runtime performs them).
