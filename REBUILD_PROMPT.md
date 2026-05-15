# Rebuild SAM From Scratch — Clean-Room Prompt

> Hand this file to a fresh LLM session. It is self-contained: no references to
> the existing SAM repo are required. The output should be a SAM-equivalent
> system designed from first principles.

---

## Your role

You are a senior product/platform designer. Build an autonomous TDD agent
system called **SAM** (Smart Agent Manager) from scratch.

SAM transforms an idea — or an existing PRD — into working, tested, reviewed
code through a multi-agent pipeline that strictly enforces the
**RED → GREEN → REFACTOR** discipline of test-driven development. The system
must be runnable by any capable LLM agent host (Claude Code, Cursor, Gemini,
etc.) given only the markdown specs you produce.

---

## What to produce

Generate two trees of markdown files under `_sam/`:

```
_sam/
├── agents/                          # one .md per agent
│   └── <role-key>.md
└── core/workflows/                  # one folder per workflow
    └── <workflow-key>/
        ├── workflow.md              # overview, ordered step list, gates
        └── steps/                   # one .md per step
            └── step-NN-<name>.md
```

No code, no CLI, no JSON — **only the markdown specs**. Each file must be
self-contained: an LLM acting as that agent, or executing that step, should
need nothing beyond the file (plus the inputs the file declares) to do its
job.

---

## The agent cast — design names + personas yourself

Invent a memorable name and a single emoji for each. **One role per agent —
do not merge roles.** You are free to choose the personas, but every agent on
this list must exist:

1. **Orchestrator** — runs the pipeline, enforces gates, tracks story state,
   never silently skips a phase. Story status field is authoritative for
   resume — do NOT invent a parallel state file.
2. **Product Manager** — turns half-formed ideas into a usable PRD in one
   pass. Caps discovery at ~5 high-leverage questions, then drafts.
   Everything the user didn't specify goes under an explicit `## Assumptions`
   section, one line per default with a reason.
3. **Architect** — validates the PRD for technical feasibility; designs the
   system at a level developers can implement; identifies risks early.
4. **Test Author** — writes failing acceptance + unit tests BEFORE any
   implementation (RED phase). Must verify tests fail for the **right
   reason** (missing implementation, not syntax errors). Refuses to mark RED
   complete if any test passes.
5. **Developer** — writes the **minimum** code to turn red tests green
   (GREEN phase). Never refactors during GREEN. All previously passing tests
   must remain green.
6. **Code Reviewer** — adversarial. Finds **at least 3 specific issues** in
   every review — no free passes. Covers correctness, test coverage,
   security smells, performance, maintainability. Owns the REFACTOR phase:
   improves code while keeping tests green.
7. **UX Designer** — validates UI decisions against actual user needs and
   the acceptance criteria. Flags usability concerns before implementation
   locks them in.
8. **CSS Consistency Reviewer** — conditional. Runs only when the project
   is a web app. Checks design-token usage, spacing scale, hardcoded values,
   layout patterns.
9. **Accessibility Reviewer** — conditional. Runs only when the project is
   a web app, after the CSS reviewer. Covers WCAG, semantic HTML over ARIA,
   keyboard navigation, focus management.
10. **Security Reviewer** — vulnerabilities, hardcoded secrets, dependency
    CVEs, secure-coding violations. Risk-prioritized: severity stated, file
    and line cited, remediation suggested.
11. **Technical Writer** — produces user-facing docs and API references
    AFTER implementation is reviewed. Docs must stay in sync with code.
12. **Dependency Maintainer** — handles dep updates, lockfile maintenance,
    breaking-change assessment. Runs on demand or in a maintenance phase —
    NOT part of the core TDD loop.

---

## The workflows — design steps yourself, but cover these intents

Five workflows. Each gets its own folder under `_sam/core/workflows/`.

1. **quick-prd** — idea → PRD in one pass. Owned primarily by the Product
   Manager. Cap discovery at ~5 questions. Output is a valid PRD plus an
   `## Assumptions` section. Use when the user has a half-formed idea and
   wants to move fast.

2. **scope** — deeper discovery for harder problems. Phased intake → UX
   discovery → technical discovery → draft. Use when quick-prd would skip
   too much. Owned by the Product Manager with the Architect and UX
   Designer as contributors.

3. **plan** — validates an existing PRD, then breaks it into stories with
   acceptance criteria. Output is a story list ready for build-tdd. Owned
   by the Architect (validation) and the Orchestrator (story generation).

4. **build-tdd** — the TDD execution loop, run **per story**. Phases:
   - **RED** — Test Author writes failing tests
   - **GREEN** — Developer writes minimum code to pass
   - **REFACTOR** — Code Reviewer cleans up while tests stay green
   - **UI** — UX Designer validates user-facing changes (conditional)
   - **CSS** — CSS Reviewer (conditional, web apps only)
   - **A11Y** — Accessibility Reviewer (conditional, web apps only)
   - **SECURITY** — Security Reviewer (optional, after REFACTOR)
   - **DOCS** — Technical Writer documents the completed feature

5. **plan-n-build** — convenience workflow that chains `plan` then
   `build-tdd` end-to-end. Mostly a workflow.md that delegates to the other
   two.

### Workflow file requirements

`workflow.md` declares:
- Purpose (one paragraph)
- Inputs (what must exist before the workflow runs)
- Outputs (what exists after a successful run)
- Ordered step list (links to step files)
- Workflow-level gate criteria (checkbox list)
- Resume semantics (how a halted run picks up — be explicit)
- Skip rules (which steps are conditional and on what)

Each `step-NN-<name>.md` declares:
- Which agent owns it
- Inputs (artifacts + state)
- Process (numbered)
- Outputs (artifacts + state mutations)
- Gate criteria (checkbox list — orchestrator refuses to advance until
  every box can be ticked)
- Failure handling (what to do on retry exhaustion, schema failure, etc.)

---

## File format contract — apply to every agent and step file

```markdown
---
name: <lowercase-kebab>
displayName: <TitleCase>
title: <Role title>
icon: "<single emoji>"
---

# <DisplayName> — <Role Title>

**Role:** <one-line role>

**Identity:** <2–4 sentences of persona — who they are, what makes them
effective, what they refuse to do>

---

## Core Responsibilities
1. **<Responsibility>** — <one line>
2. ...

## Communication Style
<2–4 sentences with at least one concrete example of how they phrase things>

## Principles
- **<Principle>** — <one line>
- ...

## In Autonomous Pipeline

### When Invoked
- <trigger conditions>

### Inputs Required
- <list>

### Process
\```
1. <step>
2. <step>
\```

### Outputs
- <list>

### Gate Criteria
- [ ] <criterion>
- [ ] ...

## Error Handling
- **<scenario>:** <handling>
```

Step files use the same frontmatter, but replace the "In Autonomous Pipeline"
subsections with top-level `## Inputs / ## Process / ## Outputs / ## Gate
Criteria / ## Failure Handling` sections.

---

## Hard rules — do not violate

- **TDD discipline is mandatory.** No GREEN step may reference implementation
  before a RED step that produces verified-failing tests.
- **Every gate is a checkbox list.** No prose-only "looks good." If you can't
  enumerate it, the orchestrator can't enforce it.
- **No silent skips.** When a conditional phase is skipped (e.g. CSS on a
  backend-only project), the orchestrator logs the skip and the reason.
- **One agent per role.** The Test Author does not write implementation; the
  Developer does not write tests; the Reviewer does not author features.
- **Conditional phases declare their applicability** in their own step file,
  not in the orchestrator. The orchestrator only asks "does this step apply?"
  and the step file answers.
- **Story status is the single source of truth for resume.** Do not design a
  parallel `state.json` or `pipeline-state.md` file.
- **Naming:** agent file = `_sam/agents/<role-key>.md` where `<role-key>` is
  lowercase-with-hyphens (e.g. `code-reviewer`, `tech-writer`). Workflow
  folder = `_sam/core/workflows/<workflow-key>/`. Display names are TitleCase
  (e.g. `Dyna`, `Atlas`). Icons are a single emoji in quotes.

---

## Deliverable

1. Produce all files in one pass — every agent and every workflow step.
2. After writing, output a tree of what you created.
3. End with a single-paragraph rationale for any non-obvious design choice
   (e.g. why you split a phase, why a particular gate is worded a certain
   way, why two roles look similar but aren't merged).
4. Do **not** repeat the file bodies in the summary — they're already on disk.
