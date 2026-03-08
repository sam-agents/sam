# SAM - Smart Agent Manager

[![npm version](https://img.shields.io/npm/v/sam-agents.svg)](https://www.npmjs.com/package/sam-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/sam-agents.svg)](https://www.npmjs.com/package/sam-agents)

**Autonomous TDD agent system for Claude Code, Cursor, GitHub Copilot, and Antigravity.**

SAM orchestrates a team of specialized AI agents that transform your PRD into working, tested code using strict Test-Driven Development (RED-GREEN-REFACTOR).

## Quick Start

```bash
# Interactive mode (choose your platform)
npx sam-agents

# Or specify platform directly
npx sam-agents --platform claude       # Claude Code
npx sam-agents --platform cursor       # Cursor IDE
npx sam-agents --platform copilot      # GitHub Copilot
npx sam-agents --platform antigravity  # Google Antigravity
npx sam-agents --platform all          # All platforms
```

## Supported Platforms

| Platform | Install Command | Skill Format |
|----------|-----------------|--------------|
| **Claude Code** | `npx sam-agents --platform claude` | `/sam:` commands |
| **Cursor** | `npx sam-agents --platform cursor` | `@agent` mentions |
| **GitHub Copilot**| `npx sam-agents --platform copilot`| `copilot-integration/` |
| **Antigravity** | `npx sam-agents --platform antigravity` | `/sam-` skills |

## Why SAM?

| Feature | SAM | Traditional AI Coding |
|---------|-----|----------------------|
| **TDD-First** | Tests written before code | Code first, tests maybe |
| **BYOA** | Use your own AI subscription | Pay per API call (5-10x cost) |
| **Transparency** | Watch agents work in real-time | Black box |
| **Autonomous** | Minimal intervention after PRD | Constant hand-holding |
| **Multi-Platform** | Claude Code + Cursor + Copilot + Antigravity | Single platform lock-in |

## Available Agents

| Agent | Role | Claude Code | Cursor | Copilot | Antigravity |
|-------|------|-------------|--------|---------|-------------|
| **SAM** | Orchestrator | `/sam:core:agents:sam` | `@sam` | `Act as sam-orchestrator` | `/sam-orchestrator` |
| **Atlas** | System Architect | `/sam:sam:agents:atlas` | `@atlas` | `Act as sam-atlas` | `/sam-atlas` |
| **Titan** | Test Architect (RED) | `/sam:sam:agents:titan` | `@titan` | `Act as sam-titan` | `/sam-titan` |
| **Dyna** | Developer (GREEN) | `/sam:sam:agents:dyna` | `@dyna` | `Act as sam-dyna` | `/sam-dyna` |
| **Argus** | Code Reviewer (REFACTOR) | `/sam:sam:agents:argus` | `@argus` | `Act as sam-argus` | `/sam-argus` |
| **Cosmo** | CSS Reviewer (web apps) | `/sam:sam:agents:cosmo` | `@cosmo` | `Act as sam-cosmo` | `/sam-cosmo` |
| **Sage** | Technical Writer | `/sam:sam:agents:sage` | `@sage` | `Act as sam-sage` | `/sam-sage` |
| **Iris** | UX Designer | `/sam:sam:agents:iris` | `@iris` | `Act as sam-iris` | `/sam-iris` |

## The TDD Pipeline

| Platform | Command |
|----------|---------|
| Claude Code | `/sam:core:workflows:autonomous-tdd` |
| Cursor | `@sam-tdd` |
| GitHub Copilot | `Run SAM TDD pipeline` |
| Antigravity | `/sam-tdd-pipeline` |

### Pipeline Phases

1. **Validate PRD** - Atlas + Iris review requirements
2. **Generate Stories** - Break down into epics and user stories
3. **TDD Loop** - For each story:
   - **RED**: Titan writes failing tests
   - **GREEN**: Dyna writes minimal code to pass
   - **REFACTOR**: Argus improves code quality
   - **UI**: Iris reviews layout and fixes alignment (web apps only)
   - **CSS**: Cosmo reviews styling consistency (web apps only)
4. **Complete** - Sage generates documentation

## What Gets Installed

```
your-project/
├── _sam/                      # Agent definitions (shared)
│   ├── agents/                # Individual agent configs
│   └── core/workflows/        # TDD pipeline workflow
├── .claude/commands/sam/      # Claude Code skills
├── .cursor/rules/             # Cursor rules
├── copilot-integration/       # GitHub Copilot instructions
└── .agent/skills/             # Antigravity skills
```

## Requirements

- Node.js 16+
- One of:
  - [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)
  - [Cursor](https://cursor.com)
  - [GitHub Copilot](https://github.com/features/copilot)
  - [Google Antigravity](https://antigravity.google)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - see [LICENSE](LICENSE) for details.

---

Built with AI. Powered by TDD.
