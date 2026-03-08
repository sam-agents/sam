# SAM + GitHub Copilot: User Guide

This guide explains how to use the **SAM (Smart Agent Manager)** autonomous TDD system with **GitHub Copilot Chat**.

---

## 1. Installation

To enable SAM agents in your current project, run the following command from your project root:

```bash
node sam/bin/cli.js --platform copilot
```

### What happens?
- It creates a `_sam/` directory containing all agent personas and TDD workflows.
- It generates a `copilot-integration/` directory containing all SAM instructions, agent definitions, and references.
- `copilot-integration/instructions.md` serves as the primary entry point for Copilot.

---

## 2. Meet the SAM Agent Team

You can call upon specific agents by asking Copilot to "act as" them. Point Copilot to `copilot-integration/instructions.md` if it needs context.

| Agent | Invocation | Role | When to use |
| :--- | :--- | :--- | :--- |
| **SAM** | `Act as sam-orchestrator` | Orchestrator | To start and manage the full TDD pipeline. |
| **Atlas** | `Act as sam-atlas` | Architect | For PRD validation and technical design. |
| **Titan** | `Act as sam-titan` | Test Architect | **RED Phase**: To write failing tests. |
| **Dyna** | `Act as sam-dyna` | Developer | **GREEN Phase**: To make tests pass. |
| **Argus** | `Act as sam-argus` | Reviewer | **REFACTOR Phase**: To improve code quality. |
| **Sage** | `Act as sam-sage` | Writer | To generate READMEs and API documentation. |

---

## 3. Running the Autonomous TDD Pipeline

The most powerful way to use SAM is through the **Autonomous TDD Pipeline**.

### Start the Pipeline
Simply provide a PRD or feature request and ask Copilot to run the SAM pipeline:

> "Run the SAM TDD pipeline to implement a user authentication system based on this PRD: [link to file or text]"

### The Workflow Steps
1.  **Validate**: `sam-atlas` checks your requirements for technical gaps.
2.  **Stories**: The system breaks the PRD into small, actionable user stories.
3.  **TDD Loop** (Repeats for every story):
    -   **RED**: `sam-titan` writes a failing test.
    -   **GREEN**: `sam-dyna` writes the minimal code to pass.
    -   **REFACTOR**: `sam-argus` cleans up the code.
4.  **Complete**: `sam-sage` updates your documentation.

---

## 4. Manual Agent Invocation

If you don't want the full pipeline, you can use individual agents for specific tasks:

- **Need a code review?**
  > "Act as sam-argus and review my latest changes in src/auth.ts."
- **Need tests for an existing file?**
  > "Act as sam-titan and write unit tests for utils.js."
- **Need a technical design?**
  > "Act as sam-atlas and draft a system architecture for a new microservice."

---

## 5. Tips for Success
- **Reference the Instructions**: If Copilot seems to forget its role, remind it: "Refer to the instructions in copilot-integration/instructions.md".
- **Be Explicit**: Copilot works best when you explicitly tell it which agent persona to adopt.
- **Customization**: You can modify the agent personas in `_sam/agents/` to better fit your project's specific coding style.
