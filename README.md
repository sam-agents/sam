# SAM - Smart Agent Manager

[![npm version](https://img.shields.io/npm/v/sam-agents.svg)](https://www.npmjs.com/package/sam-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/sam-agents.svg)](https://www.npmjs.com/package/sam-agents)

**Autonomous TDD agent system for Claude Code, Cursor, Gemini CLI, GitHub Copilot, and Antigravity.**

SAM orchestrates a team of specialized AI agents that transform an idea or PRD into working, tested code using strict Test-Driven Development (RED-GREEN-REFACTOR). Don't have a PRD yet? Start with `quick-prd` (one-pass draft) or `scope` (full discovery) — SAM will help you draft one.

### See it work — [`sam-agents/example-todo`](https://github.com/sam-agents/example-todo)

A working todo app built by SAM in **14 minutes** from a single markdown PRD. Every artifact is committed: PRD, contracts, stories, source, tests, and the post-integration screenshots + network log + video that Lens captured. Browse it in 90 seconds to see exactly what SAM produces.

![Todo app screenshot from the example-todo Lens evidence](https://raw.githubusercontent.com/sam-agents/example-todo/main/sdocs/evidence/EPIC-001/screenshot-2-added.png)

## What makes SAM different

Three things, ranked by how much they save you.

### 1. Contracts come before stories

Every cross-file seam (API endpoint, shared type, repo interface, event shape) is a typed markdown contract that **Atlas** writes *before* any story is generated. Stories declare which contracts they `produces` and `consumes`. When the frontend imports a type the backend produces, TypeScript enforces it across the codebase. **Integration drift becomes a compile error**, not a Friday-night incident. See [`sdocs/contracts/`](https://github.com/sam-agents/example-todo/tree/main/sdocs/contracts) in the example.

### 2. TDD is a hard boundary, not a suggestion

Agent roles enforce RED → GREEN → REFACTOR. **Titan** writes failing tests for every acceptance criterion. **Dyna** writes the minimum code to pass them. **Argus** refactors against quality rules. No agent can shortcut. If you've watched AI write tests *after* the code, this is the opposite.

### 3. Lens proves it on disk

After the per-epic integration story passes, **Lens** drives a real headless Chrome end-to-end. Video, per-milestone screenshots, network log, console log — all committed to `sdocs/evidence/`. The agents do not say "I tested it." The files on disk say it. See [`sdocs/evidence/EPIC-001/`](https://github.com/sam-agents/example-todo/tree/main/sdocs/evidence/EPIC-001) in the example.

## Quick Start

```bash
# Interactive mode (choose your platform)
npx sam-agents

# Or specify platform directly
npx sam-agents --platform claude       # Claude Code
npx sam-agents --platform cursor       # Cursor IDE
npx sam-agents --platform antigravity  # Google Antigravity
npx sam-agents --platform gemini       # Gemini CLI
npx sam-agents --platform copilot      # GitHub Copilot
npx sam-agents --platform all          # All platforms
```

## Supported Platforms

| Platform | Install Command | Skill Format |
|----------|-----------------|--------------|
| **Claude Code** | `npx sam-agents --platform claude` | `/sam:` commands |
| **Cursor** | `npx sam-agents --platform cursor` | `@agent` mentions |
| **Gemini CLI** | `npx sam-agents --platform gemini` | `.gemini/skills/` |
| **GitHub Copilot** | `npx sam-agents --platform copilot` | `copilot-integration/` |
| **Antigravity** | `npx sam-agents --platform antigravity` | `/sam-` skills |

## How does it compare?

| | SAM | Cursor agents | Cline / Continue | Aider | Claude Code skills | Copilot Workspace | Devin |
|---|---|---|---|---|---|---|---|
| **TDD enforced by agent roles** | Yes | No | No | Optional | No | No | No |
| **PRD as input artifact** | Markdown | No | No | No | No | Spec | Task |
| **Typed contracts between stories** | Yes | No | No | No | No | No | No |
| **Post-integration evidence (video, network, console)** | Lens | No | No | No | No | No | No |
| **Bring Your Own Agent (BYOA)** | Your subscription | Cursor | Multi-provider | Multi-provider | Claude | Copilot | Hosted, paid |
| **Multi-IDE / CLI parity** | 5 platforms | 1 | 2 | CLI | 1 | 1 | Web |
| **Markdown protocol (auditable artifacts)** | Yes | No | No | No | No | No | Partial |

SAM is the only one of these that treats integration as a first-class artifact and produces evidence you can ship to a stakeholder.

## The agents

13 specialists with narrow lanes — specialization over generality. Each agent's full persona lives in [`_sam/agents/`](_sam/agents/).

| Agent | Role |
|---|---|
| **SAM** | Orchestrator — runs the whole pipeline |
| **Quill** | Product Manager — drafts a quick-PRD in one pass with explicit assumptions |
| **Iris** | UX Designer — drives `scope` discovery + UI review during build |
| **Atlas** | System Architect — designs typed contracts before stories |
| **Titan** | Test Architect — writes failing tests for every AC (RED) |
| **Dyna** | Developer — minimum code to make tests pass (GREEN) |
| **Argus** | Code Reviewer — adversarial review + refactor (REFACTOR) |
| **Cosmo** | CSS Reviewer — styling consistency *(web only)* |
| **Aria** | Accessibility Reviewer — semantics, keyboard, contrast *(web only)* |
| **Sentinel** | Security Reviewer — secrets, CVEs, secure coding *(opt-in)* |
| **Upkeep** | Dependency Maintenance — on demand |
| **Sage** | Technical Writer — changelogs and release notes |
| **Lens** | Demo Recorder — real-browser video + screenshots + network + console after integration *(web only)* |

Per-platform invocation is in the [Invocation per platform](#invocation-per-platform) table below.

## Workflows

SAM ships six composable workflows. Run any of them on its own, or use `plan-n-build` for the one-shot experience (add `--from-idea` if you don't have a PRD yet).

| Workflow | Goal | Output |
|----------|------|--------|
| **quick-prd** | Idea → draft PRD in one pass (Quill, with explicit assumptions for unstated details) | `sdocs/prd.md` (+ `## Assumptions`) |
| **scope** | Idea, rough notes, or nothing → PRD via full UX + technical discovery | `sdocs/prd.md` (+ `## Open Questions`) |
| **plan** | Validate a PRD, design contracts, decompose into epics and stories | `sdocs/contracts/`, `sdocs/epics/`, `sdocs/stories/`, `sdocs/architecture-ref.md` |
| **build-tdd** | Implement a single story via RED-GREEN-REFACTOR + conditional review + Lens demo for the integration story | Working code, tests, changelog entry, `sdocs/evidence/` for integration stories |
| **plan-n-build** | Compose plan + build-tdd over every story + comprehensive docs | Full project + `docs/features/` + release notes |
| **extend** | Add features to an existing project after v1 — evolves contracts (with version bumps), appends stories, merges the addendum into `prd.md` | New contracts/stories appended, `prd.md` change log updated |

Typical flow: **quick-prd or scope → plan → build-tdd** (manual stepping), or **`plan-n-build`** end-to-end. With `--from-idea`, plan-n-build prepends scope automatically (non-interactive). Iterate after v1 with **`extend`**.

### quick-prd vs scope

Both produce a valid PRD conforming to `prd-schema.md`. They differ in how they handle unknowns.

| | `quick-prd` (Quill) | `scope` (Iris + Atlas + Sage) |
|--|---------------------|-------------------------------|
| Discovery depth | 0–5 focused questions | Full UX + technical Q&A |
| Unknown handling | Default + label as **Assumption** | Capture as **Open Question** |
| Time | Minutes | Working session |
| Best for | "Give me a starting PRD I can react to" | "Let's work this out properly" |

Quick-PRD's `## Assumptions` block lets you scan the defaults and reject any that are wrong in seconds. Scope's `## Open Questions` block surfaces things the discovery loop couldn't resolve.

### Invocation per platform

| Platform | quick-prd | scope | plan | build-tdd | plan-n-build | extend |
|----------|-----------|-------|------|-----------|--------------|--------|
| Claude Code | `/sam:core:workflows:quick-prd <idea>` | `/sam:core:workflows:scope <idea>` | `/sam:core:workflows:plan <prd>` | `/sam:core:workflows:build-tdd <story>` | `/sam:core:workflows:plan-n-build <prd>` | `/sam:core:workflows:extend <addendum>` |
| Cursor | `@sam-quick-prd` | `@sam-scope` | `@sam-plan` | `@sam-build-tdd` | `@sam-plan-n-build` | `@sam-extend` |
| Gemini CLI | `sam-quick-prd` | `sam-scope` | `sam-plan` | `sam-build-tdd` | `sam-plan-n-build` | `sam-extend` |
| GitHub Copilot | `Run sam-quick-prd` | `Run sam-scope` | `Run sam-plan` | `Run sam-build-tdd` | `Run sam-plan-n-build` | `Run sam-extend` |
| Antigravity | `/sam-quick-prd` | `/sam-scope` | `/sam-plan` | `/sam-build-tdd` | `/sam-plan-n-build` | `/sam-extend` |

### Inside `build-tdd`: the TDD loop

For each story, in order:

1. **RED** — Titan writes failing tests covering every acceptance criterion
2. **GREEN** — Dyna writes the minimum code to make tests pass, then verifies the build
3. **REFACTOR** — Argus runs an adversarial review and auto-fixes issues
4. **UI** — Iris validates UX against design standards *(web apps only)*
5. **CSS** — Cosmo checks styling consistency *(web apps only)*
6. **A11y** — Aria reviews semantics, keyboard, and contrast *(web apps only)*
7. **Security** — Sentinel audits secrets, CVEs, and secure coding *(opt-in via `--security`)*
8. **Docs** — Sage appends a changelog entry for the story

After all stories in an epic are done, the **integration story** runs the whole epic against real HTTP — no mocks. Once it passes, **Lens** drives a real headless Chrome and captures the demo (video + screenshots + network + console) into `sdocs/evidence/<EPIC-ID>/`. The integration story is the gate; Lens proves it on disk.

Story `status` (in YAML frontmatter: `ready` → `in-progress` → `done` / `blocked`) is the single source of truth. Interrupted runs resume cleanly with `plan-n-build --resume`.

## What Gets Installed

```
your-project/
├── _sam/                      # Agent and workflow definitions (shared across platforms)
│   ├── agents/                # Atlas, Titan, Dyna, Argus, ...
│   ├── core/agents/           # SAM orchestrator
│   ├── core/resources/        # prd-schema, story-schema, epic-schema, design defaults
│   └── core/workflows/        # quick-prd/, scope/, plan/, build-tdd/, plan-n-build/, extend/
├── .claude/commands/sam/      # Claude Code slash commands
├── .cursor/rules/             # Cursor @mention rules
├── .gemini/skills/            # Gemini CLI skills
├── copilot-integration/       # GitHub Copilot instructions
└── .agent/skills/             # Antigravity skills
```

Workflows write their output to `sdocs/` in your project root (`prd.md`, epics, stories, architecture refs, run reports). This is generated content — not installed by the CLI.

## Requirements

- Node.js 16+
- One of:
  - [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)
  - [Cursor](https://cursor.com)
  - [Gemini CLI](https://github.com/google-gemini/gemini-cli)
  - [GitHub Copilot](https://github.com/features/copilot)
  - [Google Antigravity](https://antigravity.google)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - see [LICENSE](LICENSE) for details.

---

Built with AI. Powered by TDD.
