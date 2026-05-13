---
name: epic-schema
description: Canonical schema for SAM epic files. Epics group related stories; they are a navigation aid, not an execution unit.
---

# Epic Schema

Epics are lightweight groupings of stories. Execution happens at the story level — the TDD workflow never reads an epic file directly. Epics exist so humans (and agents) can see how stories cluster.

---

## File location

```
sdocs/epics/EPIC-<NNN>-<slug>.md
```

- `NNN` is zero-padded sequential
- `slug` is short kebab-case (e.g. `authentication`, `dashboard`)
- Example: `sdocs/epics/EPIC-001-authentication.md`

---

## Frontmatter (required)

```yaml
---
id: EPIC-001
title: User Authentication
status: planned                       # planned | in-progress | done
prd: ../../prd.md                     # relative path to PRD (or null)
prd_sections: ["3.1", "3.2"]          # PRD section references (optional)
depends_on: []                        # other epic ids that must complete first
created: 2026-05-13
---
```

**Status semantics** (derived, not hand-edited):
- `planned` — no child stories started
- `in-progress` — at least one child story is `in-progress` or `done`
- `done` — all child stories are `done`

`plan-n-build` may update epic status as it progresses, but story status remains authoritative.

---

## Body (required sections)

```markdown
## Description
One paragraph: what this epic covers and why it exists as a unit.

## Stories
- STORY-001 — User can log in with email and password
- STORY-002 — User can log out
- STORY-003 — User can reset password

## Out of Scope
- 2FA enrollment (deferred to EPIC-004)
- SSO (separate initiative)
```

---

## Validation rules

- [ ] Every story listed exists in `sdocs/stories/`
- [ ] Every story with `epic: EPIC-001` is listed here (no orphans, no phantoms)
- [ ] `depends_on` is acyclic across all epics

`plan` is responsible for maintaining this invariant when it writes/updates epics.
