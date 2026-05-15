---
step: 1
name: validate-addendum
description: Atlas reads the addendum against existing PRD + architecture + contracts and determines whether it can land additively
agents: [architect]
---

# Step 1: Validate Addendum

**Agent:** Atlas (System Architect)

**Purpose:** Decide whether the proposed addendum can land additively on the existing system or whether it requires a redesign. Surface compatibility risks BEFORE any new artifact is written.

This step is the gate that distinguishes `extend` from a full re-`plan`. Get it wrong and `extend` will silently corrupt the contract set. Get it right and Phases 2 and 3 are mechanical.

---

## ENTRY CONDITIONS

- `<addendum>.md` provided and readable
- Existing `sdocs/prd.md`, `sdocs/architecture-ref.md`, `sdocs/contracts/INDEX.md` all exist
- At least one story in `sdocs/stories/` with `status: done` (otherwise the user wanted `plan`, not `extend`)

If any precondition fails, halt and tell the user which file is missing.

---

## REQUIRED READING

Before any analysis:
- The addendum itself
- `sdocs/prd.md` — especially `## Features` and `## Out of Scope` (the addendum may overlap)
- `sdocs/architecture-ref.md` — `## Key Architectural Decisions` and `## System Shape`
- `sdocs/contracts/INDEX.md` — the contract inventory
- For each contract in INDEX: at minimum scan the frontmatter; read the body if the addendum names the contract id
- A sample of done stories — enough to understand the existing story granularity and naming conventions

---

## PROCESS

### 1.1 Parse Addendum

Extract:
- Feature name and slug
- Purpose
- User-visible change (or "internal")
- Affected areas (existing features / contracts named)
- New ACs
- Out of scope
- Compatibility statement (breaking change? if yes, named?)

### 1.2 Compatibility Analysis

For each existing contract the addendum references (explicitly or by implication):

```yaml
contract: <id>
addendum_change: new | additive | breaking | obsolete
rationale: <one sentence>
producer_story: <id, from contract frontmatter>
consumer_stories: <list, from INDEX>
producer_action: none | flag-for-review | rewrite-required
```

For each existing story type that the addendum might touch:

```yaml
existing_story: <id>
likely_impact: none | re-test-only | needs-modification | blocked-by-addendum
rationale: <one sentence>
```

### 1.3 Architectural Fit

Check the addendum against `## Key Architectural Decisions` in architecture-ref.md:
- Does the addendum require a new persistence layer not contemplated by the original architecture?
- Does it introduce a new external dependency or service?
- Does it require changing the deployment shape (new ports, new processes)?
- Does it introduce concurrency or scale concerns the original architecture didn't address?

If any answer is yes, surface it explicitly. These are signals that `extend` may not be the right choice — but they don't automatically disqualify it. Atlas makes the recommendation; user makes the call.

### 1.4 Compatibility Verdict

```yaml
verdict:
  status: proceed | proceed-with-risk | refuse
  rationale: <one paragraph>

if proceed:
  - addendum lands additively; no production breakage expected
  - existing done stories stay done

if proceed-with-risk:
  - addendum lands additively BUT names specific risks that should be reviewed
  - user is asked to confirm before Phases 2/3 proceed
  - typical: breaking contract change with a documented migration path

if refuse:
  - addendum cannot land additively; would require plan --force OR addendum splitting
  - Atlas suggests how to split, OR recommends a full re-plan
  - Phases 2 and 3 do NOT run
```

### 1.5 Archive the Addendum

Copy the input addendum to `sdocs/addenda/<YYYY-MM-DD>-<slug>.md` (filename derived from the feature name in the addendum's top-level `# ` heading). This is the immutable record of what was requested.

### 1.6 Write Validation Report

Write `sdocs/addenda/<YYYY-MM-DD>-<slug>-validation.md`:

```markdown
---
addendum: <YYYY-MM-DD>-<slug>.md
phase: extend-step-1
status: proceed | proceed-with-risk | refuse
date: <today>
---

# Addendum Validation — <feature name>

## Verdict
<one paragraph>

## Compatibility Matrix

### Contracts
| Contract | Change | Producer | Action |
|----------|--------|----------|--------|
| api.todo | additive | STORY-001 | flag-for-review |
| api.tag-set | new | (TBD STORY-NNN) | — |

### Existing stories impacted
| Story | Impact | Note |
|-------|--------|------|
| STORY-002 | re-test-only | extension is read-side only |

## Risks
- <list, if any>

## Recommendations
- <Atlas's recommendation if proceed-with-risk>
```

---

## GATE — VALIDATION PASSES WHEN

- [ ] Verdict is `proceed` OR `proceed-with-risk` (refuse halts)
- [ ] Every contract the addendum touches has a classification (new / additive / breaking / obsolete)
- [ ] Every existing story potentially affected has an impact note
- [ ] Validation report written; addendum archived
- [ ] No risks of severity higher than the addendum's stated `Compatibility` section claimed

---

## NEXT

- **proceed** → Phase 2 (`step-02-evolve-contracts.md`)
- **proceed-with-risk** → halt and surface the risks to the user; resume Phase 2 on explicit confirmation
- **refuse** → halt; do not write contracts or stories
