# SAM - Smart Agent Manager

[![npm version](https://img.shields.io/npm/v/sam-agents.svg)](https://www.npmjs.com/package/sam-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/sam-agents.svg)](https://www.npmjs.com/package/sam-agents)

**Autonomous TDD agent system for Claude Code, Cursor, Gemini CLI, GitHub Copilot, and Antigravity.**

SAM orchestrates a team of specialized AI agents that transform an idea or PRD into working, tested code using strict Test-Driven Development (RED-GREEN-REFACTOR). Don't have a PRD yet? Start with `scope` — SAM will help you draft one.

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

## Why SAM?

| Feature | SAM | Traditional AI Coding |
|---------|-----|----------------------|
| **TDD-First** | Tests written before code | Code first, tests maybe |
| **BYOA** | Use your own AI subscription | Pay per API call (5-10x cost) |
| **Transparency** | Watch agents work in real-time | Black box |
| **Autonomous** | Minimal intervention after PRD | Constant hand-holding |
| **Multi-Platform** | Claude Code + Cursor + Gemini + Copilot + Antigravity | Single platform lock-in |

## Available Agents

| Agent | Role | Claude Code | Cursor | Gemini | Copilot | Antigravity |
|-------|------|-------------|--------|--------|---------|-------------|
| **SAM** | Orchestrator | `/sam:core:agents:sam` | `@sam` | `sam-orchestrator` | `Act as sam-orchestrator` | `/sam-orchestrator` |
| **Atlas** | System Architect | `/sam:sam:agents:atlas` | `@atlas` | `sam-atlas` | `Act as sam-atlas` | `/sam-atlas` |
| **Titan** | Test Architect (RED) | `/sam:sam:agents:titan` | `@titan` | `sam-titan` | `Act as sam-titan` | `/sam-titan` |
| **Dyna** | Developer (GREEN) | `/sam:sam:agents:dyna` | `@dyna` | `sam-dyna` | `Act as sam-dyna` | `/sam-dyna` |
| **Argus** | Code Reviewer (REFACTOR) | `/sam:sam:agents:argus` | `@argus` | `sam-argus` | `Act as sam-argus` | `/sam-argus` |
| **Cosmo** | CSS Reviewer (web apps) | `/sam:sam:agents:cosmo` | `@cosmo` | `sam-cosmo` | `Act as sam-cosmo` | `/sam-cosmo` |
| **Sentinel** | Security Reviewer (optional) | `/sam:sam:agents:sentinel` | `@sentinel` | `sam-sentinel` | `Act as sam-sentinel` | `/sam-sentinel` |
| **Aria** | Accessibility Reviewer (web apps) | `/sam:sam:agents:aria` | `@aria` | `sam-aria` | `Act as sam-aria` | `/sam-aria` |
| **Upkeep** | Dependency Maintenance (on demand) | `/sam:sam:agents:upkeep` | `@upkeep` | `sam-upkeep` | `Act as sam-upkeep` | `/sam-upkeep` |
| **Sage** | Technical Writer | `/sam:sam:agents:sage` | `@sage` | `sam-sage` | `Act as sam-sage` | `/sam-sage` |
| **Iris** | UX Designer | `/sam:sam:agents:iris` | `@iris` | `sam-iris` | `Act as sam-iris` | `/sam-iris` |

## Workflows

SAM ships four composable workflows. Run any of them on its own, or use `plan-n-build` for the one-shot experience (add `--from-idea` if you don't have a PRD yet).

| Workflow | Goal | Output |
|----------|------|--------|
| **scope** | Idea, rough notes, or nothing → a draft PRD you can iterate on | `sdocs/prd.md` |
| **plan** | Validate a PRD and decompose it into epics and stories | `sdocs/epics/`, `sdocs/stories/`, `sdocs/architecture-ref.md` |
| **build-tdd** | Implement a single story via RED-GREEN-REFACTOR + conditional review | Working code, tests, changelog entry |
| **plan-n-build** | Compose plan + build-tdd over every story + comprehensive docs | Full project + `docs/features/` + release notes |

Typical flow: **scope → plan → build-tdd** (manual stepping), or **`plan-n-build`** end-to-end. With `--from-idea`, plan-n-build prepends scope automatically (non-interactive).

### Invocation per platform

| Platform | scope | plan | build-tdd | plan-n-build |
|----------|-------|------|-----------|--------------|
| Claude Code | `/sam:core:workflows:scope <idea>` | `/sam:core:workflows:plan <prd>` | `/sam:core:workflows:build-tdd <story>` | `/sam:core:workflows:plan-n-build <prd>` |
| Cursor | `@sam-scope` | `@sam-plan` | `@sam-build-tdd` | `@sam-plan-n-build` |
| Gemini CLI | `sam-scope` | `sam-plan` | `sam-build-tdd` | `sam-plan-n-build` |
| GitHub Copilot | `Run sam-scope` | `Run sam-plan` | `Run sam-build-tdd` | `Run sam-plan-n-build` |
| Antigravity | `/sam-scope` | `/sam-plan` | `/sam-build-tdd` | `/sam-plan-n-build` |

### Inside `scope`: idea → PRD

`scope` accepts prose, a notes file, or nothing at all. SAM orchestrates Iris (UX questions) and Atlas (technical questions) to fill gaps, then Sage drafts a PRD conforming to [`prd-schema.md`](_sam/core/resources/prd-schema.md). Always produces a draft on the first pass — even thin sections become honest "TBD" notes plus Open Questions you can iterate on.

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

Story `status` (in YAML frontmatter: `ready` → `in-progress` → `done` / `blocked`) is the single source of truth. Interrupted runs resume cleanly with `plan-n-build --resume`.

## What Gets Installed

```
your-project/
├── _sam/                      # Agent and workflow definitions (shared across platforms)
│   ├── agents/                # Atlas, Titan, Dyna, Argus, ...
│   ├── core/agents/           # SAM orchestrator
│   ├── core/resources/        # prd-schema, story-schema, epic-schema, design defaults
│   └── core/workflows/        # scope/, plan/, build-tdd/, plan-n-build/
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
