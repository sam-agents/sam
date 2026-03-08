# SAM + GitHub Copilot: Advanced Usage Guide

This guide provides specific instructions and example prompts for using the **SAM (Smart Agent Manager)** ecosystem with **GitHub Copilot Chat**.

---

## 1. Core Concept: Custom Instructions

In GitHub Copilot, SAM agents are supported via instructions in `copilot-integration/instructions.md`. This file tells Copilot about the available agents and where to find their detailed definitions in the `copilot-integration/agents/` directory.

---

## 2. Available SAM Agents

| Agent Persona | Role | Primary Task |
| :--- | :--- | :--- |
| `sam-orchestrator` | **SAM** | Manages the full pipeline and coordinates other agents. |
| `sam-atlas` | **Atlas** | Validates PRDs and creates technical designs. |
| `sam-titan` | **Titan** | **RED Phase**: Writes failing tests. |
| `sam-dyna` | **Dyna** | **GREEN Phase**: Implements code to pass tests. |
| `sam-argus` | **Argus** | **REFACTOR Phase**: Reviews code and improves quality. |
| `sam-sage` | **Sage** | **Docs**: Generates READMEs and API documentation. |
| `sam-iris` | **Iris** | **UX**: Validates interface design and UX flow. |
| `sam-cosmo` | **Cosmo** | **CSS**: Reviews styling consistency. |

---

## 3. The Autonomous TDD Pipeline

To run the full pipeline, ask Copilot to "run the SAM TDD pipeline".

### Example Prompt:
> "Run the SAM TDD pipeline for the feature described in `docs/prd-feature-x.md`. Follow the full RED-GREEN-REFACTOR cycle for every user story."

---

## 4. Manual/Surgical Usage

You can call agents individually for specific tasks.

### RED Phase (Testing)
> "Act as `sam-titan` and write failing tests for `src/auth/login.ts` based on the acceptance criteria in `_sam/stories/story-01.md`."

### GREEN Phase (Implementation)
> "Act as `sam-dyna` and implement the minimal code required to make the tests in `src/auth/__tests__/login.test.ts` pass."

### REFACTOR Phase (Review)
> "Act as `sam-argus` and review `src/auth/login.ts`. Focus on code quality and adherence to our standards."

---

## 5. Agent References

Every agent has access to a `references/` folder at `copilot-integration/references/`. This contains:
- **`docs/`**: Core guides including this usage guide.
- **`agents/`**: Definitions for all agents.
- **`workflow.md`**: The TDD pipeline definition.
- **`design-standards.md`**: Project styling requirements.

**Tip:** If Copilot seems to forget its role, you can say: "Check your instructions in `copilot-integration/instructions.md` and the agent definitions in `copilot-integration/agents/`."

---

## 6. Tips for GitHub Copilot
- **Be Explicit**: Always use the "Act as [agent-name]" prefix for best results.
- **File References**: Use `#` to reference specific files in Copilot Chat (if supported by your IDE) to provide better context.
- **Validation**: After an agent implements code, always run your local tests to verify the results.
