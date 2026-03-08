# SAM Expansion: GitHub Copilot Support

This release introduces native integration for **GitHub Copilot Chat**, expanding the SAM ecosystem to another major AI platform alongside Claude Code, Cursor, and Antigravity.

## 🚀 Enhancements

### 1. New `copilot-integration/` Folder
SAM now generates a dedicated `copilot-integration/` directory in your project root. This folder contains:
- `instructions.md`: High-level instructions for GitHub Copilot.
- `agents/`: Detailed instruction files for every SAM agent.
- `references/`: Project design standards and workflows.

### 2. Manual Invocation System
Since GitHub Copilot doesn't always automatically load root files, users can now point Copilot specifically to the `copilot-integration/` folder for full context.

### 3. Integrated TDD Pipeline for Copilot
The autonomous TDD workflow is now accessible via Copilot Chat. By pointing Copilot to `copilot-integration/agents/sam-tdd-pipeline.md`, you can run full RED-GREEN-REFACTOR cycles directly in your editor.

### 4. Reference System
Following the pattern established for Gemini and Antigravity, the Copilot integration includes a `references/` directory containing:
- Project design standards.
- Detailed workflow definitions.
- Cross-agent documentation.

## 📦 How to Use

1.  **Install**: Update your SAM installation in any project:
    ```bash
    npx sam-agents --platform copilot
    ```
2.  **Invoke**: In GitHub Copilot Chat, simply ask:
    - `"Act as sam-atlas and review this PRD."`
    - `"Run the SAM TDD pipeline for this feature."`
    - `"Act as sam-titan and write failing tests for login.ts."`

## 🛠 Changes Included

- **`bin/cli.js`**: Added `generateCopilotSkills` logic and `copilot` platform support.
- **`README.md`**: Updated with Copilot invocation examples and support status.
- **`templates/_sam/docs/`**: Added `SAM_COPILOT_GUIDE.md` and `SAM_COPILOT_USAGE.md`.
- **`_sam/docs/`**: Updated root documentation for consistent cross-platform visibility.

---
*Empowering developers with autonomous TDD, everywhere.*
