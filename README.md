# SAM - Smart Agent Manager

[![npm version](https://img.shields.io/npm/v/sam-agents.svg)](https://www.npmjs.com/package/sam-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/sam-agents.svg)](https://www.npmjs.com/package/sam-agents)

**Autonomous TDD agent system for Claude Code and Cursor.**

SAM orchestrates a team of specialized AI agents that transform your PRD into working, tested code using strict Test-Driven Development (RED-GREEN-REFACTOR).

## Quick Start

```bash
# For Claude Code (default)
npx sam-agents

# For Cursor
npx sam-agents --platform cursor

# For all platforms
npx sam-agents --platform all
```

## Supported Platforms

| Platform | Install Command | Skill Format |
|----------|-----------------|--------------|
| **Claude Code** | `npx sam-agents` | `/sam:` commands |
| **Cursor** | `npx sam-agents --platform cursor` | `@agent` mentions |

## Why SAM?

| Feature | SAM | Traditional AI Coding |
|---------|-----|----------------------|
| **TDD-First** | Tests written before code | Code first, tests maybe |
| **BYOA** | Use your own AI subscription | Pay per API call (5-10x cost) |
| **Transparency** | Watch agents work in real-time | Black box |
| **Autonomous** | Minimal intervention after PRD | Constant hand-holding |
| **Multi-Platform** | Claude Code + Cursor | Single platform lock-in |

## Available Agents

| Agent | Claude Code | Cursor | Role |
|-------|-------------|--------|------|
| **SAM** | `/sam:core:agents:sam` | `@sam` | Orchestrator |
| **Atlas** | `/sam:sam:agents:atlas` | `@atlas` | System Architect |
| **Titan** | `/sam:sam:agents:titan` | `@titan` | Test Architect (RED) |
| **Dyna** | `/sam:sam:agents:dyna` | `@dyna` | Developer (GREEN) |
| **Argus** | `/sam:sam:agents:argus` | `@argus` | Code Reviewer (REFACTOR) |
| **Sage** | `/sam:sam:agents:sage` | `@sage` | Technical Writer |
| **Iris** | `/sam:sam:agents:iris` | `@iris` | UX Designer |

## The TDD Pipeline

**Claude Code:** `/sam:core:workflows:autonomous-tdd`
**Cursor:** `@sam-tdd`

1. **Validate PRD** - Atlas + Iris review requirements
2. **Generate Stories** - Break down into epics and user stories
3. **TDD Loop** - For each story:
   - **RED**: Titan writes failing tests
   - **GREEN**: Dyna writes minimal code to pass
   - **REFACTOR**: Argus improves code quality
4. **Complete** - Sage generates documentation

## What Gets Installed

```
your-project/
├── _sam/                      # Agent definitions (shared)
│   ├── agents/                # Individual agent configs
│   └── core/workflows/        # TDD pipeline workflow
├── .claude/commands/sam/      # Claude Code skills (--platform claude)
└── .cursor/rules/             # Cursor rules (--platform cursor)
```

## Requirements

- Node.js 16+
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) or [Cursor](https://cursor.com)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - see [LICENSE](LICENSE) for details.

---

Built with AI. Powered by TDD.
