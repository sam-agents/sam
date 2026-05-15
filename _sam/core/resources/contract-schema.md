---
name: contract-schema
description: Canonical schema for SAM contract files. The seams between stories — typed, code-shaped, machine-checkable.
---

# Contract Schema

Contracts are the **typed seams** between stories. They are produced by Atlas in `plan` Phase 2 (`design-contracts`) and consumed by Titan (tests against them), Dyna (implements them), and Argus (gates on conformance).

A story builds in isolation; a contract is what makes the next story compose with it without rework.

---

## File location

Contracts live in the consumer project at:

```
sdocs/contracts/<area>/<contract-id>.md
```

- `area` is a short kebab-case grouping (e.g. `auth`, `api`, `db`, `events`)
- `contract-id` is a stable kebab-case identifier (e.g. `session-token`, `post-login`, `user-repo`)
- The full reference used in story frontmatter is `<area>.<contract-id>` (e.g. `auth.session-token`)
- Example: `sdocs/contracts/auth/session-token.md` → referenced as `auth.session-token`

---

## Frontmatter (required)

```yaml
---
id: auth.session-token                 # stable identifier; never renamed once a story references it
kind: type                              # type | api | event | repo | module
title: Session token shape              # one-line summary, no trailing period
status: stable                          # draft | stable | deprecated
owner_story: STORY-002                  # the story that produces this contract; null if foundational
version: 1                              # bump on breaking change; consumers pin
created: 2026-05-14                     # YYYY-MM-DD
---
```

**Field rules**
- `id` — assigned at creation, immutable. Even after refactoring, the id outlives the file.
- `kind` — drives which body sections are required (see below).
- `status`:
  - `draft` — Atlas designed it, no story has implemented it yet
  - `stable` — implemented and exercised by at least one story
  - `deprecated` — superseded; consumers must migrate
- `owner_story` — the story whose `produces:` list contains this contract. Exactly one. `null` only for contracts that pre-exist the planning run (legacy code).
- `version` — pinned in story `consumes:` entries via `id@version` when a breaking change is needed; otherwise consumers always read latest.

---

## Body — by kind

### kind: type

A data shape (TypeScript-flavored interface, struct, schema). Use the project's primary type language; if mixed, default to TypeScript.

```markdown
## Shape

\```ts
export interface SessionToken {
  userId: string;
  issuedAt: number;   // epoch ms
  expiresAt: number;  // epoch ms
  scopes: ReadonlyArray<'read' | 'write'>;
}
\```

## Invariants
- `expiresAt > issuedAt`
- `scopes` is non-empty
- `userId` matches the regex in `db.user-id`

## Notes
- Tokens are opaque to clients; only the auth module mints / validates them.
```

### kind: api

An HTTP / RPC endpoint. Use OpenAPI-flavored fragments — verb + path + request + response + errors.

```markdown
## Endpoint

\```
POST /api/auth/login
\```

## Request

\```ts
{ email: string; password: string; }
\```

## Response — 200

\```ts
{ token: string; expiresAt: number; }
\```

## Errors
- 400 — validation failed (invalid email format / missing password)
- 401 — credentials rejected
- 429 — rate limited (5 attempts / minute / IP)

## Headers
- Request: `Content-Type: application/json`
- Response: `Set-Cookie: session=<token>; HttpOnly; SameSite=Lax`
```

### kind: event

A domain event emitted on a bus / queue.

```markdown
## Event

\```
user.signed-up
\```

## Payload

\```ts
{ userId: string; email: string; signedUpAt: number; }
\```

## Emitters
- `STORY-003` — registration flow

## Subscribers
- `STORY-008` — welcome email
- `STORY-012` — analytics
```

### kind: repo

A repository / data-access interface — the methods a story exposes to other stories' code.

```markdown
## Interface

\```ts
export interface UserRepo {
  findByEmail(email: string): Promise<User | null>;
  create(input: NewUser): Promise<User>;
  setPasswordHash(userId: string, hash: string): Promise<void>;
}
\```

## Error semantics
- `findByEmail` returns `null` on miss; never throws for not-found
- `create` throws `DuplicateEmailError` on email conflict
- `setPasswordHash` is idempotent

## Notes
- Implementation backed by Postgres in production; in-memory in tests.
```

### kind: module

A module-level public surface (named exports) when the unit is bigger than a single interface.

```markdown
## Exports

\```ts
export { hashPassword, verifyPassword } from './password';
export { mintToken, validateToken } from './token';
export type { SessionToken } from './types';
\```

## Notes
- Internal helpers are not exported. Consumers must use the named exports above.
```

---

## How contracts flow through workflows

```
plan Phase 1 (validate-prd)  →  Atlas approves PRD
plan Phase 2 (design-contracts) →  Atlas writes sdocs/contracts/*
plan Phase 3 (generate-stories) →  Stories declare `produces:` / `consumes:` referencing contract ids
build-tdd RED (Titan)        →  imports `consumes:` contracts; tests assert against the contract shape
build-tdd GREEN (Dyna)       →  implements `produces:` contracts; exported types must match the contract body
build-tdd REFACTOR (Argus)   →  gate: "every `produces:` contract is satisfied by exports" — must check, not assume
```

---

## Validation rules

A contract is **valid** when:
- [ ] Frontmatter present and complete
- [ ] `id` matches the file path (`sdocs/contracts/<area>/<rest>.md` ↔ `id: <area>.<rest>`)
- [ ] Body has the section(s) required by its `kind`
- [ ] Code fences declare a language (`ts`, `json`, `yaml`, etc.)
- [ ] `owner_story` exists in `sdocs/stories/` (or is `null` for legacy)

A contract set (all of `sdocs/contracts/**`) is **valid** when:
- [ ] No two contracts share an `id`
- [ ] Every contract referenced by any story's `produces:` or `consumes:` exists
- [ ] Every contract has at most one `owner_story`
- [ ] Every contract is either `consumed` by some story or `produced` by an integration / foundational story (no orphan contracts)

`plan` MUST emit a valid contract set. `build-tdd` MUST refuse to start on a story whose `consumes:` references a missing or `deprecated` contract.

---

## Why contracts earn their place

Stories built in isolation drift. Two stories independently invent slightly different shapes of "the same thing" and both pass their tests. Integration breaks at the seam — but no test ever exercised the seam, so nothing failed earlier.

Contracts make seams machine-checkable:
- The shape is written once, in `sdocs/contracts/`
- Tests import it; implementations export against it
- Drift becomes a build error, not a runtime surprise during an integration story

This shifts integration cost from end-of-epic (expensive, late) to per-story (cheap, early).
