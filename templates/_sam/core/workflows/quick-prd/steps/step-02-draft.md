---
step: 2
name: draft
description: Quill writes the PRD to disk, including the Assumptions section
agents: [product-manager]
---

# Step 2: Draft

**Agent:** Quill (Product Manager)

**Purpose:** Turn the intake (extracted facts + assumptions) into a valid PRD on disk. Single pass. Validate before writing.

---

## ENTRY CONDITIONS

- Step 1 produced an `intake` block with `extracted_sections`, `assumptions`, and `open_questions`
- `<out>` path is known (default `sdocs/prd.md`)
- Either `<out>` does not exist, OR `--force` was passed, OR the user confirmed overwrite

---

## PROCESS

### 2.1 Compose the PRD

Write the PRD in this exact order:

1. **Frontmatter**
   ```yaml
   ---
   title: <intake.title_hint>
   version: 0.1
   status: draft
   created: <today YYYY-MM-DD>
   last_updated: <today YYYY-MM-DD>
   source: quick-prd
   ---
   ```

2. **Required body sections** (per `prd-schema.md`, in this order):
   - `## Overview`
   - `## Goals`
   - `## Non-Goals`
   - `## Users`
   - `## Functional Requirements`
   - `## Non-Functional Requirements`
   - `## Technical Constraints`

   For each section:
   - If the input populated it → use that content, lightly cleaned up
   - If Quill assumed it → write the assumed value as the section content (don't write "TBD" — the assumption *is* the content)
   - Each Goal and each Functional Requirement must be testable in principle (a behavior + a constraint, not a vibe)

3. **Optional body sections** (only include if there's content):
   - `## Design` — if input mentioned design or Quill assumed default standards
   - `## Out of Scope` — if explicit exclusions were stated
   - `## Success Metrics` — only if input gave measurable signals; Quill does not invent KPIs
   - `## Open Questions` — anything in `intake.open_questions`

4. **Quill's signature section** (always include, after all body sections):
   ```markdown
   ## Assumptions

   Quill made the following defaults because the input did not specify them.
   Correct any that are wrong before handing this PRD to `plan`.

   - **<Field>: <value>.** <one-line reason>
   - **<Field>: <value>.** <one-line reason>
   ```

   One bullet per `intake.assumptions[]` entry.

### 2.2 Drafting style

- Plain, specific, no marketing language. "Users sign up in < 30 seconds" not "delightful onboarding."
- Each Functional Requirement has a behavior verb + a constraint. Enough detail that `plan` can derive an AC.
- Use the user's own language when they gave it. Don't translate into corporate-speak.
- Honest assumptions. "Email + password, no SSO" beats "auth strategy TBD."

### 2.3 Validate before writing

Run the `prd-schema.md` validation checklist in memory:

- [ ] Frontmatter has `title`, `version`, `status: draft`, `created`, `last_updated`, `source: quick-prd`
- [ ] All 7 required sections present and non-empty
- [ ] At least one Goal listed
- [ ] At least one Functional Requirement listed
- [ ] `## Assumptions` section present (Quick PRD signature requirement)

If any check fails, halt with the failed rule and the offending section. Do not write a malformed PRD to disk.

### 2.4 Write

```
ensure sdocs/ exists (create if not)
write <out>
```

If `<out>` already existed and `--force` was set, overwrite. If the user confirmed overwrite in Step 1, overwrite.

### 2.5 Print summary

```
Quick PRD drafted to <out>.
  Required sections: 7/7
  Assumptions:       <n>
  Open Questions:    <n>
```

---

## NEXT STEP

In interactive mode → `step-03-confirm.md` (one round of corrections, then exit).
In `--non-interactive` mode → exit immediately with the success message from `workflow.md`.
