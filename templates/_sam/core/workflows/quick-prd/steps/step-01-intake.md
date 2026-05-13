---
step: 1
name: intake
description: Quill parses input, extracts what's stated, and picks defaults for everything else
agents: [product-manager]
---

# Step 1: Intake + Assume

**Agent:** Quill (Product Manager)

**Purpose:** Read whatever the user gave you, extract every PRD-relevant fact stated, and for everything else pick a reasonable default — recording each default so it can be corrected later. Do not stall waiting for the user to fill in blanks.

---

## ENTRY CONDITIONS

- One of:
  - Inline prose argument
  - A path to a notes / transcript / partial-PRD file
  - Empty (interactive mode only)
- `sdocs/` exists or can be created

---

## PROCESS

### 1.1 Detect input type

```
if input is empty:
    if --non-interactive:
        halt: "Quick PRD needs at least a one-line idea in non-interactive mode."
    else:
        mode = "interactive-blank"
elif input looks like a file path AND the file exists:
    if file is already a valid PRD (has the 7 required sections):
        mode = "refine-existing"
        route to step-02-draft.md with the PRD as base
    else:
        mode = "from-file"
        content = read(input)
elif input is prose:
    mode = "from-prose"
    content = input
else:
    halt: "Input is neither a readable file nor usable prose."
```

### 1.2 Extract what's stated

Walk the input once and pull out anything that maps to a PRD section:

| PRD Section                  | Look for                                                          |
|------------------------------|-------------------------------------------------------------------|
| `title`                      | First H1, filename, first noun phrase                             |
| `Overview`                   | Opening paragraph; what + why                                     |
| `Goals`                      | "We want…", "Users should…", bullet objectives                    |
| `Non-Goals`                  | "Out of scope", "not doing", explicit exclusions                  |
| `Users`                      | Personas, "as a…", references to user types                       |
| `Functional Requirements`    | Feature lists, "the system must…", capabilities                   |
| `Non-Functional Requirements`| Performance numbers, security, a11y, scale                        |
| `Technical Constraints`      | Stack mentions, deployment, integrations                          |
| `Design`                     | Wireframe references, design system, mockup links                 |

Don't hallucinate from the input. If it's not stated, mark the field for the assumption pass.

### 1.3 Assume the rest

For every required section that's empty after extraction, Quill picks a default. The goal is "most likely correct given what *is* stated" — not "most generic."

Default-picking heuristics:

| Field                       | Heuristic                                                              | Default examples                                                |
|-----------------------------|------------------------------------------------------------------------|-----------------------------------------------------------------|
| Platform                    | "users sign in / browse / view"  → web. "phone / mobile" → mobile.     | Web app (React + Fastify) — matches SAM's common stack         |
| Users                       | If only one user type implied                                           | Single end-user persona, no admin in v1                         |
| Auth                        | If users are mentioned but no auth specified                            | Email + password, no SSO in v1                                  |
| Scale                       | No scale numbers given                                                  | < 10K users in v1 (PMF phase)                                   |
| Deployment                  | No infra mentioned                                                      | Cloud-hosted, single region, standard SaaS                      |
| Persistence                 | Data implied but no DB mentioned                                        | MongoDB (matches SAM stack)                                     |
| Design                      | UI implied but no design mentioned                                      | Apply `_sam/core/resources/default-design-standards.md`         |
| Non-Functional Requirements | Nothing said about performance / security / a11y                        | p95 < 500ms, WCAG 2.1 AA for UI, password hashing if auth       |

When a heuristic doesn't fit, pick the simplest plausible answer and label it.

Build the assumption list:

```yaml
assumptions:
  - field: Platform
    value: "Web app (React + Fastify)"
    reason: "Input mentioned 'users sign in' → assumed browser-based"
  - field: Auth
    value: "Email + password, no SSO in v1"
    reason: "Auth implied but not specified; defaulted to simplest"
  # ...
```

### 1.4 Decide whether to ask

In interactive mode (default), ask up to 3-5 questions, but **only** about gaps where:
- The default would meaningfully change the shape of the PRD if wrong (e.g., "is this a web app or a mobile app?")
- AND the answer is hard for Quill to guess from the input alone

Skip questions about:
- Things the input already addresses
- Low-stakes defaults (formatting, copy choices, minor non-functionals)
- Anything that can reasonably live as an assumption + open question

If interactive mode but no high-leverage gaps remain → skip questions, proceed straight to draft.

In `--non-interactive` mode, never ask. Every gap becomes an assumption.

### 1.5 Output structured intake

```yaml
intake:
  mode: from-prose | from-file | interactive-blank | refine-existing
  title_hint: <extracted or default>
  extracted_sections:
    overview: <text or null>
    goals: [...]
    # … per schema
  assumptions:
    - field: ...
      value: ...
      reason: ...
  open_questions: [...]   # genuinely unresolved, distinct from assumptions
```

Plus a short user-facing note:

```
Intake done.
From: <input source>
Stated: <n> sections populated from input.
Assumed: <n> defaults — you'll see and can correct them on the draft.
<If interactive and questions to ask: present them here, max 5.>
```

---

## NEXT STEP

`step-02-draft.md` — Quill writes the PRD using extracted facts + assumptions.
