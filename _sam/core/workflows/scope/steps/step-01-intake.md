---
step: 1
name: intake
description: Parse the input, extract whatever fields are given, and identify gaps against the PRD schema
agents: [sam]
---

# Step 1: Intake

**Purpose:** Take whatever the user provided (prose, notes file, or nothing) and extract everything useful before any discovery questions are asked. Avoid re-asking what the user already told you.

---

## ENTRY CONDITIONS

- One of:
  - Inline prose argument
  - A path to a notes / transcript / partial-PRD file
  - Empty (fully interactive mode)
- `sdocs/` directory exists or can be created

---

## PROCESS

### 1.1 Detect input type

```
if input is empty:
    mode = "blank-slate"
elif input looks like a file path AND the file exists:
    mode = "from-file"
    content = read(input)
elif input is prose:
    mode = "from-prose"
    content = input
else:
    halt with "input is neither a readable file nor usable prose"
```

If the file appears to already be a PRD (has the required sections), route directly to refinement (`step-04-draft.md`) instead of running discovery again. Detect this by checking for `## Overview` + `## Goals` + `## Functional Requirements` headers.

### 1.2 Extract what's given

Pass the content to a structured-extraction pass. For each PRD schema field, try to populate it from the input:

| PRD Section | Look for |
|-------------|----------|
| `title` | First H1, filename, first noun phrase |
| `Overview` | Opening paragraph; "what" and "why" statements |
| `Goals` | "We want to...", "Users should be able to...", bullet lists of objectives |
| `Non-Goals` | "Out of scope", "not doing", explicit exclusions |
| `Users` | Personas, "as a... I want...", references to user types |
| `Functional Requirements` | Feature lists, bullet points of capabilities, "the system must..." |
| `Non-Functional Requirements` | Performance numbers, security mentions, a11y references |
| `Technical Constraints` | Stack mentions, deployment targets, integration requirements |
| `Design` | Wireframe references, design system mentions, mockup links |

Don't hallucinate. If a section isn't supported by the input, mark it `TBD` and add it to the Open Questions list.

### 1.3 Identify gaps

Produce a gap report:

```yaml
gaps:
  required_thin:        # required sections with weak or missing content
    - Users
    - Functional Requirements
  required_missing: []  # required sections with nothing at all
  optional_present: []  # optional sections we found content for
  open_questions: []    # things explicitly raised as unknowns by the input
```

This drives which questions Iris and Atlas need to ask in Phases 2 and 3.

### 1.4 Decide routing

```
if mode == "blank-slate":
    -> Phase 2 (Iris asks everything from scratch)
elif --non-interactive flag is set:
    -> Phase 4 (Sage drafts from whatever was extracted, gaps become Open Questions)
elif content is already a valid PRD:
    -> Phase 4 (refinement loop)
else:
    -> Phase 2 (Iris fills UX gaps), then Phase 3 (Atlas fills tech gaps), then Phase 4
```

---

## OUTPUT

A structured intake summary in workflow context:

```yaml
intake:
  mode: blank-slate | from-file | from-prose
  title_hint: <extracted>
  extracted_sections:
    overview: <text or null>
    goals: [<bullets>]
    # ... per schema
  gaps:
    required_thin: [...]
    required_missing: [...]
    optional_present: [...]
    open_questions: [...]
```

Plus a short user-facing summary:

```
Intake complete.
From: <input source>
Extracted: <n> populated sections, <n> gaps to fill.
```

---

## NEXT STEP

Per routing decision above. Default path: `step-02-discover-ux.md`.
