---
name: prd-schema
description: Canonical schema for SAM PRD files. Written by scope workflow, read by plan workflow.
---

# PRD Schema

The contract between `scope` (writes PRDs from ideas) and `plan` (consumes PRDs to produce stories). A scope-generated PRD MUST conform to this schema. Hand-written PRDs SHOULD conform, but `plan` is lenient — it only halts when *required* sections are missing or empty.

---

## File location

Default: `sdocs/prd.md`. The location can be overridden via `--out`.

If `sdocs/` doesn't exist when scope runs, it is created.

---

## Frontmatter (optional but encouraged)

```yaml
---
title: User Authentication           # one-line feature/product name
version: 0.1                          # bump on each accepted revision
status: draft | reviewed | accepted   # draft = scope just wrote it; accepted = user approved
created: 2026-05-13                   # YYYY-MM-DD, set on first write
last_updated: 2026-05-13              # bumped on each revision
source: scope | hand-written | imported   # how this PRD came to exist
owner: <person, team, or role>        # optional, who owns the spec
---
```

`source: scope` tells downstream workflows that this PRD was machine-drafted from an idea — useful context for `plan` when deciding how aggressively to question assumptions.

---

## Body (required sections, in this order)

### `## Overview`
One paragraph. What is this, and why are we building it? Reader should know in 30 seconds whether to keep reading.

### `## Goals`
Bulleted, measurable when possible. Each goal should answer "what does success look like?"

```markdown
- Users can sign up with email + password in under 30 seconds
- Returning users authenticate without re-entering credentials within session window
```

### `## Non-Goals`
Bulleted, explicit. What this PRD is **not** covering. Prevents scope creep at planning time.

### `## Users`
Personas and primary user journey. At minimum: who, what problem, what they do today, what changes.

### `## Functional Requirements`
The features the system must support, with enough behavioral evidence that `plan` can derive testable acceptance criteria. Each requirement should be a self-contained capability, not an implementation detail.

```markdown
- **Email + password signup**: a new user can create an account with a valid email and a password meeting <policy>. The system must reject duplicate emails and weak passwords.
- **Password reset via email**: a user who has forgotten their password can request a reset link sent to their registered email, valid for <duration>.
```

### `## Non-Functional Requirements`
Performance, security, accessibility, scale, reliability. Cross-cutting concerns that apply across features.

```markdown
- Auth endpoints respond within p95 < 200ms under normal load
- WCAG 2.1 AA for all auth-facing UI
- Passwords stored hashed with bcrypt or stronger
```

### `## Technical Constraints`
Required stack, integrations, deployment context. Things the engineer doesn't get to choose.

```markdown
- Backend: existing Fastify + MongoDB stack
- Auth provider: must integrate with our existing JWT session middleware
- Deployment: AWS via the standard CI pipeline
```

---

## Body (optional sections, append after required ones in this order)

### `## Design`
UX/visual guidance — wireframes, design system reference, copy, microcopy. Iris reads this section in `plan` Step 1 to resolve design standards. Absent → SAM defaults from `_sam/core/resources/default-design-standards.md` apply.

### `## Out of Scope`
Explicit non-features, often with rationale ("deferred to v2", "covered by separate initiative"). Distinct from Non-Goals: out-of-scope is feature-level; non-goals are higher-level.

### `## Success Metrics`
How we'll measure whether this worked after shipping. KPIs, conversion targets, qualitative signals.

### `## Open Questions`
Known unknowns scope couldn't resolve. The honest acknowledgment that some things aren't decided yet. `plan` will flag these during Step 1 validation.

```markdown
- Should we support social login (Google, GitHub) in v1, or defer?
- What's the password complexity policy — match competitors or define our own?
```

---

## Validation rules

A PRD is **valid** when:
- [ ] All 7 required sections are present and non-empty
- [ ] At least one Goal is listed
- [ ] At least one Functional Requirement is listed
- [ ] If frontmatter is present, `status` is one of the allowed values

A PRD is **complete enough for `plan`** when:
- [ ] Valid (above)
- [ ] Each Functional Requirement has enough behavioral detail to derive acceptance criteria — vague "support payments" doesn't qualify; "accept credit-card payments via Stripe with email receipt" does

`scope` produces a *valid* PRD on every run, even with minimal input — gaps become explicit Open Questions or empty-but-present sections. `plan` may halt if the PRD isn't "complete enough" and recommend re-running `scope` to refine.

---

## Iteration philosophy

A PRD doesn't have to be right on the first pass. `scope`'s job is to **produce a draft that's good enough to react to**, not to extract perfection from the user upfront. The intended loop:

```
scope → draft PRD → user reads → user provides more info → scope again → better PRD
```

This is why every required section gets populated, even thinly — an explicit "TBD with reasoning" beats a missing section, because the user can see what's missing and improve it.
