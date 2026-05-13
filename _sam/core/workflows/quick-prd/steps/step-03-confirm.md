---
step: 3
name: confirm
description: Show the user the assumptions list, accept one round of corrections, then exit
agents: [product-manager]
---

# Step 3: Confirm

**Agent:** Quill (Product Manager)

**Purpose:** Give the user a single, fast chance to correct wrong assumptions before exit. Quick PRD is one-pass by design — for deeper iteration, the user runs `scope`.

---

## ENTRY CONDITIONS

- Step 2 wrote a valid PRD to `<out>` with `status: draft`
- Workflow is running in interactive mode (skip this step in `--non-interactive`)

---

## PROCESS

### 3.1 Present

Show the user the assumption list and offer options:

```
Quick PRD ready: <out>   (status: draft, source: quick-prd)

Assumptions Quill made (correct any that are wrong):
  1. <Field>: <value> — <reason>
  2. <Field>: <value> — <reason>
  3. <Field>: <value> — <reason>
  ...

Open Questions (carried forward, not blocking):
  - <question>
  - <question>

Options:
  accept                  — keep as-is, exit
  correct <n> <new value> — fix assumption n, redraft once, exit
  expand <text>           — add more info, redraft once, exit
  show                    — re-display the PRD
```

### 3.2 Handle the response

- **accept**: Print the success message from `workflow.md`. Exit.
- **correct <n> <new value>**:
  - Update `intake.assumptions[n]` to the corrected value (or move to a stated section if the user provided real data, not just a different default)
  - Re-run Step 2 (draft) once
  - Exit. Do not loop further — Quick PRD is one round of corrections, full stop.
- **expand <text>**:
  - Treat the new text as additional intake; re-extract any sections it touches; demote any superseded assumptions
  - Re-run Step 2 (draft) once
  - Exit.
- **show**: Re-display the PRD content from `<out>`. Re-prompt the same options.

### 3.3 The one-round rule

Quick PRD allows **at most one redraft** in confirm. If the user wants further iteration after that, route them:

> *Quill:* "That's the one redraft I do in Quick mode. For deeper iteration, run `/sam:core:workflows:scope sdocs/prd.md` — it'll do real UX and tech discovery on this PRD. For planning straight from here, `/sam:core:workflows:plan sdocs/prd.md`."

This is a feature, not a limitation. Quick PRD's promise is *speed*. If the user needs depth, they need a different tool.

---

## EXIT

Print the success message from `workflow.md`:

```
Quick PRD complete.
PRD: <out>   (status: draft, source: quick-prd)
Assumptions: <n>    (review and correct any that are wrong)
Open Questions: <n>

Next:
  - Refine: /sam:core:workflows:quick-prd <out>
  - Deep discovery: /sam:core:workflows:scope <out>
  - Plan: /sam:core:workflows:plan <out>
```
