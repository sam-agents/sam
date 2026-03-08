# GEMINI.md - SAM (Smart Agent Manager)

## Project Overview
SAM (Smart Agent Manager) is an autonomous TDD (Test-Driven Development) agent system designed to orchestrate a team of specialized AI agents. It integrates with AI coding tools like **Claude Code**, **Cursor**, **GitHub Copilot**, and **Google Antigravity** to transform requirements (PRDs) into tested, working code using a strict RED-GREEN-REFACTOR workflow.

### Core Technologies
- **Node.js**: The CLI tool is built with Node.js (>= 16.0.0).
- **Markdown**: Agent definitions, instructions, and workflows are defined in Markdown files.
- **AI Platforms**: Native integrations for Claude Code (skills), Cursor (rules), GitHub Copilot (instructions), and Antigravity (skills).
- **TDD Workflow**: Orchestrates a pipeline involving Atlas (Architect), Titan (Test Architect), Dyna (Developer), Argus (Reviewer), and other specialized agents.

### Key Directory Structure
- `sam/`: The main project directory.
    - `bin/cli.js`: The entry point for the `sam-agents` CLI tool. Handles installation and platform-specific configuration generation.
    - `templates/`: Contains the source templates for agent definitions and platform integrations.
        - `_sam/`: Shared agent personas and TDD workflows.
        - `.claude/`: Claude Code specific command definitions.
    - `_sam/`: The active agent configuration for the current project (mirrors `templates/_sam`).
    - `.claude/`: The active Claude Code skills for the current project (mirrors `templates/.claude`).

## Building and Running

### Installation
The tool is designed to be run via `npx` or installed globally:
```bash
# Run interactively
npx sam-agents

# Install for a specific platform
npx sam-agents --platform gemini
npx sam-agents --platform claude
npx sam-agents --platform cursor
npx sam-agents --platform copilot
npx sam-agents --platform antigravity
npx sam-agents --platform all
```

### Development / Local Execution
To run the CLI tool from the source:
```bash
# In the sam/ directory
node bin/cli.js [options] [target-directory]
```

### Key Commands
- `--platform <name>`: Specify the target platform (gemini, claude, cursor, copilot, antigravity, all).
- `--help, -h`: Show help message.
- `--version, -v`: Show version number.

## Development Conventions

### Agent Personas
Agents are defined in `_sam/agents/` using Markdown. Each agent has a specific role, identity, and set of responsibilities.
- **Atlas (Architect)**: Validates PRDs and technical feasibility.
- **Titan (Test Architect)**: Writes failing tests (RED phase).
- **Dyna (Developer)**: Writes minimal code to pass tests (GREEN phase).
- **Argus (Reviewer)**: Improves code quality (REFACTOR phase).
- **Sage (Tech Writer)**: Generates documentation.

### TDD Pipeline
All development should follow the autonomous TDD pipeline:
1. **Validate PRD**: Architecture and UX review.
2. **Generate Stories**: Breakdown into epics and user stories with acceptance criteria.
3. **TDD Loop**:
    - **RED**: Write failing tests.
    - **GREEN**: Implement minimal code.
    - **REFACTOR**: Code review and quality improvements.
    - **UI/CSS**: Layout and styling consistency checks.
4. **Complete**: Documentation and final handoff.

### Platform-Specific Integrations
- **Gemini CLI**: Uses `.gemini/skills/` to define agent skills. Use `activate_skill('sam-orchestrator')` to start the pipeline.
- **Claude Code**: Uses `.claude/commands/sam/` to define `/sam:` commands.
- **Cursor**: Uses `.cursor/rules/` to define `@agent` rules (generated as `.mdc` files).
- **GitHub Copilot**: Uses `copilot-integration/instructions.md` to define instructions and agent personas.
- **Antigravity**: Uses `.agent/skills/` to define `/sam-` skills.

### Contribution Guidelines
- New agents or workflows should be added to `templates/_sam/`.
- Platform-specific logic for generating rules/skills should be updated in `bin/cli.js`.
- Always verify changes by running the CLI tool and checking the generated output in the target directory.
