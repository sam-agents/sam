---
name: scope
description: SAM Scope Workflow - Turns an idea, rough notes, or nothing at all into a PRD that plan can consume.
version: 1.0.0
---

# SAM Scope Workflow

**Goal:** Produce a PRD from whatever the user has — prose, notes, or only a vague idea. Always ship a draft on the first pass; let the user iterate to improve it.

**Your Role:** You are SAM orchestrating product discovery. You coordinate Iris (UX questions), Atlas (technical questions), and Sage (PRD drafting) to produce a PRD conforming to `_sam/core/resources/prd-schema.md`.

This workflow is **upstream of plan**. Output goes to `sdocs/prd.md` (or a path passed via `--out`). The PRD is what `plan` consumes; scope does not generate stories or code.

---

## CORE PHILOSOPHY

**Always produce a PRD draft, even with thin input.** The PRD is meant to be reacted to, not extracted whole from the user upfront. Gaps become Open Questions or explicit "TBD" placeholders — never missing sections. The user iterates to make it better; scope's job is to give them something to iterate on.

---

## INPUTS

```
/sam:core:workflows:scope                        # fully interactive, start from nothing
/sam:core:workflows:scope ./notes.md             # use rough notes / transcript as seed
/sam:core:workflows:scope "build a TODO app"     # inline prose as seed
```

Optional flags:
- `--out <path>` — where to write the PRD (default: `sdocs/prd.md`)
- `--non-interactive` — single-pass draft, no Q&A; uses only the input provided
- `--force` — overwrite an existing PRD at `<out>` without prompting

---

## OUTPUTS

- `sdocs/prd.md` (or `<out>`) — a valid PRD per `prd-schema.md`
- `sdocs/scope-log.md` (optional) — discovery conversation transcript, useful for refining later

`sdocs/` is created if it doesn't exist.

---

## SCHEMA CONTRACT

Every PRD written MUST be **valid** per `_sam/core/resources/prd-schema.md`:
- All 7 required sections present and non-empty
- At least one Goal and one Functional Requirement
- Frontmatter present with `status: draft` on first write (`reviewed` after refinement; `accepted` only when user explicitly accepts)

Gaps in user input do not justify missing sections — fill thin sections with honest "TBD" + the reason it's TBD, and add to Open Questions.

---

## PHASES

### Phase 1: Intake
**Load step:** `./steps/step-01-intake.md`

- Parse input (prose, file path, or nothing)
- Extract whatever the input gives you
- Map known fields to the PRD schema
- Identify which sections are thin / missing
- In `--non-interactive` mode: skip directly to Phase 4 with whatever was extracted

### Phase 2: UX Discovery (Iris)
**Load step:** `./steps/step-02-discover-ux.md`

- Iris asks targeted questions to fill gaps in: Users, Goals, Functional Requirements (user-facing behavior), Design
- Skip questions the input already answers — don't re-ask
- User can answer, defer ("TBD"), or skip

### Phase 3: Technical Discovery (Atlas)
**Load step:** `./steps/step-03-discover-tech.md`

- Atlas asks targeted questions to fill gaps in: Technical Constraints, Non-Functional Requirements, integrations, deployment context
- Surface technical concerns / red flags early (e.g., "this looks like it needs a streaming backend, is that available?")
- User can answer, defer, or skip

### Phase 4: Draft + Refine (Sage)
**Load step:** `./steps/step-04-draft.md`

- Sage writes the PRD matching the schema, drawing from intake + UX + tech findings
- Status: `draft`
- Present the PRD to the user
- User options: **accept** (status → `accepted`, exit), **revise section X** (re-runs Iris or Atlas on that section, then Sage redrafts), or **add info** (user provides more, Sage redrafts)
- Loop until user accepts. After 3 revision rounds, SAM nudges toward acceptance ("This looks ready to ship to plan — anything blocking acceptance?") but does not force-exit.

---

## EXIT STATES

### Success
PRD written to `<out>` with `status: accepted`. Output summary:

```
Scope complete.
PRD: sdocs/prd.md   (<n> revisions, status: accepted)
Open Questions: <n>   (carried into plan validation)

Next: /sam:core:workflows:plan sdocs/prd.md
   or: /sam:core:workflows:plan-n-build sdocs/prd.md
```

### Draft saved (user paused mid-refinement)
PRD written with `status: draft` or `reviewed`. User can resume by re-running scope on the same file:

```
/sam:core:workflows:scope sdocs/prd.md
```

scope detects an existing PRD and enters refinement mode directly.

### Refused (bad input)
- `<out>` exists and `--force` not set → halt, ask user to confirm overwrite
- `--non-interactive` mode but input is empty → halt; need at least a prompt or notes file

---

## NON-INTERACTIVE MODE

When invoked from inside `plan-n-build --from-idea`, scope runs in `--non-interactive` mode:
- Skip Phase 2 and Phase 3 Q&A
- Sage drafts directly from whatever the input contained
- Status: `draft` (never `accepted` — that requires explicit user approval)
- Open Questions section gets populated with every gap, so downstream `plan` knows what's unresolved
- Output PRD goes to `sdocs/prd.md` and the composer continues

The user can re-run `scope sdocs/prd.md` after the composer finishes to refine and accept.

---

## RESUMPTION

`scope <existing-prd-path>` detects a PRD already on disk and routes directly to Phase 4 (refine) — skipping intake / discovery unless the user asks to "redo discovery."

This makes scope idempotent and friendly to iteration: re-run as often as you like, refining sections each time.
