---
step: 4
name: draft
description: Sage drafts the PRD; user reviews and iterates until accepted
agents: [tech-writer]
---

# Step 4: Draft + Refine

**Agent:** Sage (Technical Writer)

**Purpose:** Write a PRD that conforms to `prd-schema.md`, drawing on intake + UX discovery + tech discovery. Then loop with the user: accept, revise, or expand. Always ship a draft on the first pass — even if half the sections are "TBD."

---

## ENTRY CONDITIONS

- Intake complete; UX and tech discovery either complete or skipped
- At minimum, intake produced a `title_hint` and partial `extracted_sections`

---

## PROCESS

### 4.1 Draft

```
1. Read intake + ux_discovery + tech_discovery from workflow context
2. Write the PRD matching prd-schema.md, in this order:
   - Frontmatter (status: draft, source: scope, created/last_updated today, title from intake)
   - Overview, Goals, Non-Goals, Users, Functional Requirements,
     Non-Functional Requirements, Technical Constraints (all required)
   - Design, Out of Scope, Success Metrics, Open Questions (optional, include any that have content)
3. For every section with thin or missing input, write the section anyway:
   - State what IS known
   - Mark gaps as "TBD: <reason it's TBD>"
   - Add a corresponding Open Question
4. Surface Atlas's feasibility flags as Open Questions with his rationale
5. Validate the draft against prd-schema.md (all 7 required sections non-empty)
6. Write to <out> path (default: sdocs/prd.md)
```

**Never refuse to draft because input is thin.** Thin sections with honest "TBD" notes are the deliverable — they give the user something to react to.

### 4.2 Present

Show the PRD to the user and offer options:

```
PRD drafted to sdocs/prd.md (status: draft)

Required sections: 7/7 populated
Open Questions: <n>

Options:
  accept       — mark status: accepted, exit
  revise <section>  — re-run discovery on that section, redraft
  add <text>   — append info / corrections, redraft
  show         — re-display the PRD
  exit         — save as draft, exit (resume later)
```

### 4.3 Refine loop

User chooses an action:

- **accept**: bump status → `accepted`, last_updated → today; write; exit successfully.
- **revise <section>**: route to Iris (for UX-side sections) or Atlas (for tech-side sections), capture new input, Sage redrafts that section + any sections affected. Bump version (0.1 → 0.2 → ...).
- **add <text>**: treat as additional intake, redraft any sections it touches.
- **show**: re-display.
- **exit**: write with status: `draft` or `reviewed` (whichever it was), exit. User can resume with `/sam:core:workflows:scope <path-to-this-prd>`.

### 4.4 The 3-round nudge

After the user has gone through 3 revision rounds without accepting, SAM speaks up:

> *SAM:* "This PRD is in good shape — 3 rounds in. The remaining Open Questions can be addressed during planning or implementation rather than scope. Want to accept and move to `plan`, or keep refining?"

Nudge, don't force. If the user wants a 4th round, do it.

---

## DRAFTING STYLE

- Write the way a senior PM writes — plain, specific, no marketing fluff.
- Each Goal is testable in principle ("users sign up in < 30 seconds" not "delightful signup").
- Each Functional Requirement has enough behavior that `plan` can derive ACs (a behavior verb + a constraint).
- Open Questions are honest. "Should we support OAuth in v1?" beats "OAuth strategy TBD."
- Use the user's own language when they've given it. Don't translate into corporate-speak.

---

## VALIDATION GATE

Before writing the file, verify against `prd-schema.md`:

- [ ] Frontmatter present with title, version, status, created, last_updated, source: scope
- [ ] All 7 required sections present and non-empty (even if thin/TBD)
- [ ] At least one Goal listed
- [ ] At least one Functional Requirement listed
- [ ] If frontmatter has `status`, it's one of draft/reviewed/accepted

Halt with a clear error if validation fails. This should not happen if drafting was done correctly; it's a safety net.

---

## EXIT

### Accepted
Write PRD with `status: accepted`. Print:

```
Scope complete.
PRD: sdocs/prd.md   (<n> revisions)
Open Questions: <n>   (carried into plan validation)

Next: /sam:core:workflows:plan sdocs/prd.md
   or: /sam:core:workflows:plan-n-build sdocs/prd.md
```

### Saved as draft
Write PRD with `status: draft` or `reviewed`. Print:

```
PRD saved as <status> to sdocs/prd.md.
Resume anytime: /sam:core:workflows:scope sdocs/prd.md
```

### Refused (validation gate failed)
Halt without writing. Print the failed validation rule and the section that failed. (Should not happen in normal operation.)
