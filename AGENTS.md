# AGENTS.md - Agent Coding Guidelines for SAM

This file provides guidelines for agentic coding agents operating in this repository.

---

## Project Overview

SAM (Smart Agent Manager) is an autonomous TDD agent system that generates agent configurations for Claude Code, Cursor IDE, Antigravity, and Gemini CLI. The project consists of:
- **CLI** (`bin/cli.js`) - Node.js CLI tool that installs agent configurations
- **Templates** (`templates/`) - Agent definitions in markdown format
- **Shared configs** (`_sam/`) - Agent definitions used across all platforms

---

## Build / Lint / Test Commands

### Testing the CLI

```bash
# Test CLI locally (interactive mode)
node bin/cli.js

# Test CLI with specific platform
node bin/cli.js --platform claude ./test-project
node bin/cli.js --platform cursor ./test-project
node bin/cli.js --platform antigravity ./test-project
node bin/cli.js --platform gemini ./test-project
node bin/cli.js --platform all ./test-project

# Test with target directory
node bin/cli.js ./my-project
node bin/cli.js --platform cursor ./my-project
```

### Running a Single Test

Formal test suites are available for specific platforms:
1. **Gemini CLI**: `npm test` runs `scripts/verify-gemini.js` to validate skill generation.

Manual testing is done by:
1. Creating a test directory: `mkdir test-project`
2. Running the CLI: `node bin/cli.js --platform <platform> ./test-project`
3. Verifying output files:
   ```bash
   ls -la ./test-project/_sam
   ls -la ./test-project/.claude/commands/sam   # for Claude Code
   ls -la ./test-project/.cursor/rules/         # for Cursor
   ls -la ./test-project/.agent/skills/         # for Antigravity
   ls -la ./test-project/.gemini/skills/        # for Gemini CLI
   ```

### Publishing

```bash
# Publish to npm (requires authentication)
npm publish --access public --provenance
```

---

## Code Style Guidelines

### JavaScript (CLI)

Follow these conventions in `bin/cli.js`:

1. **Formatting**
   - 2-space indentation
   - No semicolons at line endings
   - Single quotes for strings
   - Trailing commas in multi-line objects/arrays

2. **Naming Conventions**
   - `camelCase` for functions and variables
   - `UPPER_SNAKE_CASE` for constants (e.g., `PLATFORMS`)
   - Descriptive names: `copyRecursive`, `generateCursorRules`

3. **Functions**
   - Keep functions under 50 lines
   - Single responsibility: `install()`, `promptPlatform()`, `showHelp()`
   - Use async/await for Promises

4. **Error Handling**
   - Use `process.exit(1)` for fatal errors
   - Log errors with color codes: `log('Error: ...', RED)`
   - Validate inputs early with clear error messages

5. **Colors/Output**
   - Use ANSI escape codes for colored output
   - Constants defined at top: `CYAN`, `GREEN`, `YELLOW`, `RED`, `RESET`, `BOLD`, `DIM`

### Markdown Files (Agent Definitions)

Agent files use YAML frontmatter and follow this structure:

```markdown
---
name: <agent-key>
displayName: <AgentName>
title: <Agent Role>
icon: "<emoji>"
---

# <AgentName> - <Role Title>

**Role:** <Brief role description>

**Identity:** <Detailed persona description>

---

## Core Responsibilities

1. **Responsibility 1** - Description
2. **Responsibility 2** - Description

---

## Communication Style

<Style guidelines with examples>

---

## Principles

- **Principle 1** - Description
- **Principle 2** - Description

---

## In Autonomous Pipeline

### When Invoked
- <Trigger conditions>

### Inputs Required
- <Required inputs>

### Process
```
1. Step one
2. Step two
```

### Outputs
- <Expected outputs>

### Gate Criteria
- [ ] Criterion 1
- [ ] Criterion 2

---

## Error Handling

- **Error scenario:** Handling approach
```

### YAML Frontmatter Guidelines

- Use 2-space indentation in YAML
- Include: name, displayName, title, icon
- Icon should be a single emoji in quotes

### Content Conventions

- Use `---` (thematic breaks) to separate sections
- Use `**bold**` for emphasis on key terms
- Use `-` for bullet lists
- Use `[ ]` for unchecked checkboxes in gate criteria
- Use code blocks (backticks) for file paths, code references
- Use triple-backtick code blocks for process steps

### Naming Conventions

- Agent names: lowercase with hyphens (e.g., `sam-master`, `dev`, `test`)
- Display names: Title case (e.g., "Dyna", "Titan")
- File names: lowercase with hyphens (e.g., `sam-master.md`, `tech-writer.md`)

---

## Project Structure

```
sam/
├── bin/
│   └── cli.js              # Main CLI entry point
├── templates/              # Platform-specific templates
│   ├── _sam/               # Shared agent definitions
│   │   ├── agents/         # Individual agent configs
│   │   ├── core/          # Core workflows and master agent
│   │   └── _config/       # Manifests and customizations
│   ├── .claude/           # Claude Code commands
│   └── .cursor/           # Cursor rules template
├── _sam/                  # Generated files (from templates)
├── package.json
├── README.md
└── CONTRIBUTING.md
```

---

## Configuration Files

### Agent Manifests

- `_sam/_config/agent-manifest.csv` - Agent metadata
- `_sam/_config/manifest.yaml` - Full configuration
- `_sam/_config/agents/*.customize.yaml` - Platform-specific customizations

When adding new agents:
1. Add agent definition to `_sam/agents/` directory
2. Update `_sam/_config/agent-manifest.csv`
3. Add to platform agent lists in `bin/cli.js` (if applicable)

---

## Cursor Rules Format

Cursor rules are generated in `bin/cli.js:generateCursorRules()` and use `.mdc` format:

```markdown
---
description: <Agent description>
globs: ["**/*"]
alwaysApply: false
---

# <Agent Name>

When the user mentions "@<agent>" or asks for <description>, adopt this persona:

<agent-content>

## Invocation
To use this agent, mention @<agent> in your message.
```

---

## Antigravity Skills Format

Skills are generated in `bin/cli.js:generateAntigravitySkills()` with directory structure:

```
.agent/skills/<skill-name>/
├── SKILL.md              # Skill definition
└── references/
    └── agent.md          # Full agent content
```

---

## Gemini Skills Format

Skills are generated in `bin/cli.js:generateGeminiSkills()` with directory structure:

```
.gemini/skills/<skill-name>/
├── SKILL.md              # Skill definition
└── references/
    └── agent.md          # Full agent content
```

Commands are copied from `templates/.gemini/commands/` to `.gemini/commands/`.

---

## Common Tasks

### Adding a New Agent

1. Create markdown file in `templates/_sam/agents/`
2. Add YAML frontmatter with name, displayName, title, icon
3. Populate sections: Core Responsibilities, Communication Style, Principles, Pipeline, Error Handling
4. Update agent lists in `bin/cli.js` (both generateCursorRules and generateAntigravitySkills)
5. Add entry to `_sam/_config/agent-manifest.csv`
6. Test with `node bin/cli.js --platform all ./test-project`

### Modifying the CLI

1. Edit `bin/cli.js`
2. Test changes: `node bin/cli.js ./test-project`
3. Verify generated files in test directory
4. No formal linting - follow JavaScript conventions above

---

## Notes

- This is a template-generation tool, not an application with runtime tests
- Agent definitions are markdown-based, not code
- Platform integrations (Claude/Cursor/Antigravity) are generated from shared `_sam` definitions
- Manual testing via CLI output verification is the primary testing approach
