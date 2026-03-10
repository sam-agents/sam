# SAM + Gemini CLI: User Guide

This guide explains how to use the **SAM (Smart Agent Manager)** autonomous TDD system directly within your **Gemini CLI** terminal.

---

## 1. Installation

To enable SAM agents in your current project, run the following command from your project root:

```bash
node sam/bin/cli.js --platform gemini
```

### What happens?
- It creates a `_sam/` directory containing all agent personas and TDD workflows.
- It generates Gemini-specific skills in `.gemini/skills/`.
- Gemini CLI will automatically detect these skills the next time you interact with it.

---

## 2. Meet the SAM Agent Team

Once installed, you can call upon specific agents by asking Gemini to "activate" their skill.

| Agent | Skill Name | Role | When to use |
| :--- | :--- | :--- | :--- |
| **SAM** | `sam-orchestrator` | Orchestrator | To start and manage the full TDD pipeline. |
| **Atlas** | `sam-atlas` | Architect | For PRD validation and technical design. |
| **Titan** | `sam-titan` | Test Architect | **RED Phase**: To write failing tests. |
| **Dyna** | `sam-dyna` | Developer | **GREEN Phase**: To make tests pass. |
| **Argus** | `sam-argus` | Reviewer | **REFACTOR Phase**: To improve code quality. |
| **Sage** | `sam-sage` | Writer | To generate READMEs and API documentation. |

---

## 3. Running the Autonomous TDD Pipeline

The most powerful way to use SAM is through the **Autonomous TDD Pipeline**. This transforms a feature description (PRD) into tested code without manual intervention for each step.

### Start the Pipeline
Simply provide a PRD or feature request and ask Gemini to use the SAM pipeline:

> "Use the `sam-tdd-pipeline` to implement a user authentication system based on this PRD: [link to file or text]"

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
  > "Ask `sam-argus` to review my latest changes in `src/auth.ts`."
- **Need tests for an existing file?**
  > "Activate `sam-titan` to write unit tests for `utils.js`."
- **Need a technical design?**
  > "Use `sam-atlas` to draft a system architecture for a new microservice."

---

## 5. Tips for Success
- **Context is King**: Ensure your PRDs are clear. The agents follow your instructions strictly.
- **Review the Logs**: You can watch the agents "think" as they move through the RED-GREEN-REFACTOR cycles.
- **Customization**: You can modify the agent personas in `_sam/agents/` to better fit your project's specific coding style.
