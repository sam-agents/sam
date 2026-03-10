# SAM + Gemini CLI: Advanced Usage Guide

This guide provides specific instructions and example prompts for using the **SAM (Smart Agent Manager)** ecosystem within the **Gemini CLI**.

---

## 1. Core Concept: Skill Activation

In Gemini CLI, SAM agents are implemented as **Skills**. You can invoke them in two ways:

1.  **Natural Language**: "Use the `sam-atlas` skill to review this PRD."
2.  **Explicit Tool Call**: `activate_skill('sam-orchestrator')` (Best for starting complex workflows).

---

## 2. Available SAM Skills

| Skill Name | Agent Name | Phase | Primary Task |
| :--- | :--- | :--- | :--- |
| `sam-orchestrator` | **SAM** | Master | Manages the full pipeline and `pipeline-status.yaml`. |
| `sam-atlas` | **Atlas** | Planning | Validates PRDs, creates `architecture-ref.md`. |
| `sam-titan` | **Titan** | **RED** | Writes failing test files based on acceptance criteria. |
| `sam-dyna` | **Dyna** | **GREEN** | Implements code to pass tests (minimal changes). |
| `sam-argus` | **Argus** | **REFACTOR**| Reviews code, fixes linting, and improves quality. |
| `sam-sage` | **Sage** | Completion| Generates `README.md` and API docs. |
| `sam-iris` | **Iris** | UI/UX | Validates interface design and UX flow. |
| `sam-cosmo` | **Cosmo** | CSS | Reviews CSS consistency and theme adherence. |

---

## 3. The Autonomous TDD Pipeline

To run the full pipeline from a single PRD to finished code, use the `sam-tdd-pipeline` skill or start with the orchestrator.

### Example Prompt:
> "Run the `sam-tdd-pipeline` for the feature described in `docs/prd-feature-x.md`. Follow the full RED-GREEN-REFACTOR cycle for every user story."

---

## 4. Manual/Surgical Usage

You can call agents individually for specific tasks without running the full pipeline.

### RED Phase (Testing)
> "Activate `sam-titan` and have it write failing Vitest unit tests for the authentication logic in `src/auth/logic.ts` based on the requirements in `_sam/stories/story-01.md`."

### GREEN Phase (Implementation)
> "Use `sam-dyna` to implement the minimal code required to make the tests in `src/auth/__tests__/logic.test.ts` pass. Do not refactor yet."

### REFACTOR Phase (Review)
> "Ask `sam-argus` to review `src/auth/logic.ts`. Focus on type safety, error handling, and adherence to our project's coding standards."

---

## 5. How Agents Use Documentation

Every SAM skill now has a `references/` folder that the agent automatically reads upon activation. This folder contains:
- **`docs/`**: Core guides (`GEMINI.md`, `SAM_GEMINI_GUIDE.md`).
- **`agents/`**: Definitions for all other agents (enabling cross-agent awareness).
- **`workflow.md`**: The exact steps for the TDD pipeline.
- **`design-standards.md`**: UI/UX requirements for the project.

**Tip:** If an agent seems "lost," remind it to check its `references/` folder.

---

## 6. Tips for Gemini CLI
- **Parallelism**: Gemini CLI can run multiple searches in parallel. SAM agents take advantage of this to understand your codebase quickly.
- **Context Management**: For very large features, provide the PRD path rather than pasting the whole text to keep the conversation history clean.
- **Validation**: Always run the project's test command (e.g., `npm test`) after `sam-dyna` finishes to verify the "GREEN" state.
