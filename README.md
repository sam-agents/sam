# SAM - Smart Agent Manager

[![npm version](https://img.shields.io/npm/v/@sam-agents/sam.svg)](https://www.npmjs.com/package/@sam-agents/sam)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/@sam-agents/sam.svg)](https://www.npmjs.com/package/@sam-agents/sam)

**Autonomous TDD agent system for Claude Code CLI.**

SAM orchestrates a team of specialized AI agents that transform your PRD into working, tested code using strict Test-Driven Development (RED-GREEN-REFACTOR).

## Quick Start

```bash
npx @sam-agents/sam
```

This installs SAM agents into your current project. Restart Claude Code to load the skills.

## Why SAM?

| Feature | SAM | Traditional AI Coding |
|---------|-----|----------------------|
| **TDD-First** | Tests written before code | Code first, tests maybe |
| **BYOA** | Use your own Claude Code subscription | Pay per API call (5-10x cost) |
| **Transparency** | Watch agents work in real-time | Black box |
| **Autonomous** | Minimal intervention after PRD | Constant hand-holding |

## Available Agents

| Agent | Command | Role |
|-------|---------|------|
| **SAM** | `/sam:core:agents:sam` | Orchestrator - coordinates the pipeline |
| **Atlas** | `/sam:sam:agents:atlas` | System Architect - technical design |
| **Titan** | `/sam:sam:agents:titan` | Test Architect - writes failing tests (RED) |
| **Dyna** | `/sam:sam:agents:dyna` | Developer - makes tests pass (GREEN) |
| **Argus** | `/sam:sam:agents:argus` | Code Reviewer - refactors (REFACTOR) |
| **Sage** | `/sam:sam:agents:sage` | Technical Writer - documentation |
| **Iris** | `/sam:sam:agents:iris` | UX Designer - user experience |

## The TDD Pipeline

```
/sam:core:workflows:autonomous-tdd
```

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
├── _sam/                      # Agent definitions
│   ├── agents/                # Individual agent configs
│   └── core/workflows/        # TDD pipeline workflow
└── .claude/commands/sam/      # Claude Code skill registration
```

## Requirements

- Node.js 16+
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - see [LICENSE](LICENSE) for details.

---

Built with Claude Code. Powered by TDD.
