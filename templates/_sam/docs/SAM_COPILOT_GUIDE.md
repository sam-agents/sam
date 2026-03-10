# SAM Copilot Integration Guide

## Overview
SAM (Smart Agent Manager) integrates with GitHub Copilot Chat, enabling developers to leverage autonomous TDD workflows within VS Code and other Copilot-enabled IDEs.

## Installation

```bash
npx sam-agents --platform copilot
```

This generates a `copilot-integration/` directory containing:
- `instructions.md` — High-level instructions for GitHub Copilot
- `agents/` — Detailed instruction files for every SAM agent
- `references/` — Project design standards and workflows

## How It Works

GitHub Copilot doesn't have a native plugin/skill system like Claude Code or Cursor. Instead, SAM generates markdown instruction files that you can reference in Copilot Chat conversations.

### Invoking Agents

In GitHub Copilot Chat, ask Copilot to adopt a SAM agent persona:

```
"Act as sam-atlas and review this PRD."
"Act as sam-titan and write failing tests for login.ts."
"Act as sam-dyna and implement the login feature to pass the tests."
"Act as sam-argus and review the code changes."
```

### Running the TDD Pipeline

```
"Run the SAM TDD pipeline for this feature."
```

Or point Copilot to the pipeline workflow:
```
"Follow the instructions in copilot-integration/agents/sam-tdd-pipeline.md"
```

## Available Agents

| Agent | Invocation | Role |
|-------|-----------|------|
| SAM Orchestrator | `Act as sam-orchestrator` | Pipeline coordinator |
| Atlas | `Act as sam-atlas` | System Architect |
| Titan | `Act as sam-titan` | Test Architect (RED) |
| Dyna | `Act as sam-dyna` | Developer (GREEN) |
| Argus | `Act as sam-argus` | Code Reviewer (REFACTOR) |
| Cosmo | `Act as sam-cosmo` | CSS Reviewer |
| Sage | `Act as sam-sage` | Technical Writer |
| Iris | `Act as sam-iris` | UX Designer |

## Tips

- Point Copilot to `copilot-integration/instructions.md` at the start of a session for full context
- Reference specific agent files for deep persona adoption
- Works best with GitHub Copilot Chat in VS Code
