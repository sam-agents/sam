# SAM (Smart Agent Manager) - Deployment & Usage Guide

This guide explains how to set up, test, and run SAM for both local development and production environments.

---

## 1. Prerequisites
- **Node.js**: Version 16.0.0 or higher.
- **Gemini CLI**: Ensure you have the Gemini CLI installed and configured.

---

## 2. Local Development & Testing

Use this approach if you are modifying the SAM source code or want to verify changes before a full deployment.

### Step 1: Clone and Install Dependencies
```bash
git clone https://github.com/sam-agents/sam.git
cd sam/sam
npm install
```

### Step 2: Run Verification Tests
We have included a robustness script that verifies the CLI's installation logic and agent skill generation.
```bash
npm test
```
*This will run `verify_sam_gemini.js` and report on the integrity of the generated files.*

### Step 3: Run from Source
You can run the SAM installer directly from the `bin/cli.js` file:
```bash
node bin/cli.js --platform gemini [target-directory]
```

---

## 3. Production Usage

Use this approach to install SAM agents into any of your active projects.

### Method A: Using npx (Recommended)
This is the fastest way to add SAM to your project without a permanent global installation.
```bash
npx sam-agents --platform gemini
```

### Method B: Global Installation
```bash
npm install -g sam-agents
sam-agents --platform gemini
```

### What is Installed?
- **`_sam/`**: Shared agent personas and TDD workflows.
- **`.gemini/skills/`**: The skill definitions that the Gemini CLI uses to "activate" agents.

---

## 4. How to Use SAM Agents

Once installed, the Gemini CLI will automatically detect the new skills. You can interact with the agents using natural language.

### A. The Autonomous Pipeline (Full Automation)
To have SAM manage the entire RED-GREEN-REFACTOR cycle for a new feature:
> "Use the `sam-tdd-pipeline` to implement a [feature name] based on [PRD/file]."

### B. Individual Agent Tasks (Manual Control)
You can call specific agents for targeted tasks:
- **Architectural Review**: "Ask `sam-atlas` to review the technical design of my current project."
- **Writing Tests (RED)**: "Use `sam-titan` to write failing unit tests for `src/user-service.ts`."
- **Implementing Code (GREEN)**: "Ask `sam-dyna` to make the failing tests in `tests/auth.test.ts` pass."
- **Code Review (REFACTOR)**: "Use `sam-argus` to perform a code review on my latest commit."

---

## 5. Troubleshooting
- **Skills not detected**: Ensure you are running Gemini CLI from the project root where `.gemini/skills/` was generated.
- **Node Version Error**: SAM requires Node.js 16+. Check your version with `node -v`.
- **Permission Errors**: If you encounter permission issues during installation, ensure you have write access to the target directory.
