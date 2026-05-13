---
name: quick-prd
description: SAM Quick PRD Workflow - Quill produces a valid PRD in one pass, making explicit assumptions where the user is silent.
version: 1.0.0
---

# SAM Quick PRD Workflow

**Goal:** Get a usable PRD in front of the user in minutes, not hours. Quill drafts on whatever the user provides and labels every default assumption so the user can correct what's wrong.

**Your Role:** You are SAM running a single-agent workflow. Quill is the only specialist invoked. The output PRD conforms to `_sam/core/resources/prd-schema.md` plus a `## Assumptions` section listing every default Quill picked.

This workflow is a **lightweight alternative to `scope`**. Same output schema, same downstream consumer (`plan`), but drafted by one agent in one pass. When the user wants real discovery, they should use `/sam:core:workflows:scope` instead.

---

## CORE PHILOSOPHY

**Assume, draft, label.** The user does not have to answer questions to get a PRD. Quill picks reasonable defaults and writes them down so they can be challenged. A draft with five wrong assumptions and a list of those assumptions is more valuable than no draft at all — the user can fix the wrong ones in seconds.

---

## INPUTS

```
/sam:core:workflows:quick-prd                              # interactive, ask up to 5 questions
/sam:core:workflows:quick-prd "build a TODO app"           # inline prose, draft straight through
/sam:core:workflows:quick-prd ./notes.md                   # use a notes file as seed
/sam:core:workflows:quick-prd --non-interactive "..."      # skip questions, defaults for everything
```

Optional flags:
- `--out <path>` — where to write the PRD (default: `sdocs/prd.md`)
- `--non-interactive` — never prompt; use only what was provided + defaults
- `--force` — overwrite an existing PRD at `<out>` without prompting

---

## OUTPUTS

- `sdocs/prd.md` (or `<out>`) — a valid PRD per `prd-schema.md`, with a `## Assumptions` section appended
- Frontmatter: `status: draft`, `source: quick-prd`

`sdocs/` is created if it doesn't exist.

---

## SCHEMA CONTRACT

Every PRD written MUST be **valid** per `_sam/core/resources/prd-schema.md`:
- All 7 required sections present and non-empty
- At least one Goal and one Functional Requirement
- Frontmatter present with `status: draft` on first write

**In addition**, Quick PRDs append a `## Assumptions` section after the required body. Each assumption is one line: assumed value + one-phrase reason. This section is what makes a Quick PRD safe — the user can see at a glance what Quill made up.

---

## PHASES

### Phase 1: Intake + Assume
**Load step:** `./steps/step-01-intake.md`

- Quill parses input (prose, file path, or nothing)
- For every PRD section the input does not address, Quill picks a reasonable default and records it
- In interactive mode, Quill identifies up to 3-5 *high-leverage* gaps and asks about them; defaults handle the rest
- In `--non-interactive` mode, all gaps become assumptions — no questions asked

### Phase 2: Draft
**Load step:** `./steps/step-02-draft.md`

- Quill writes the PRD to `<out>`, including the `## Assumptions` section
- Validates against `prd-schema.md` before writing
- Status: `draft`

### Phase 3: Confirm
**Load step:** `./steps/step-03-confirm.md`

- Show the user the PRD summary and the assumptions list
- User can: **accept** (exit), **correct <n>** (fix specific assumption, redraft once), or **expand** (rerun with more input)
- After at most one redraft, exit. Quick PRD is *one pass* by design — for deep iteration, the user should run `scope`.

---

## EXIT STATES

### Success
PRD written to `<out>` with `status: draft`. Output summary:

```
Quick PRD complete.
PRD: sdocs/prd.md   (status: draft, source: quick-prd)
Assumptions: <n>    (review and correct any that are wrong)
Open Questions: <n>

Next:
  - Refine: /sam:core:workflows:quick-prd sdocs/prd.md
  - Deep discovery: /sam:core:workflows:scope sdocs/prd.md
  - Plan: /sam:core:workflows:plan sdocs/prd.md
```

### Refused (bad input)
- `<out>` exists and `--force` not set → halt, ask user to confirm overwrite
- `--non-interactive` mode but input is empty → halt; need at least a one-line idea

---

## NON-INTERACTIVE MODE

When invoked with `--non-interactive`:
- Skip all prompts in Phase 1
- Every gap becomes an assumption with a default
- Skip Phase 3 confirmation; write directly and exit
- Use case: scripted PRD generation, testing, or chained from another workflow

---

## RESUMPTION

`quick-prd <existing-prd-path>` detects an existing PRD and routes to a single redraft pass:
- Re-read the PRD
- Treat the existing `## Assumptions` as the user's accepted defaults
- Apply any new input the user provides as corrections
- Bump `last_updated`, write, exit

For deep iterative refinement, route the user to `scope` instead — that's its job.
