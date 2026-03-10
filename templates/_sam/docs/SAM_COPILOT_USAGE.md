# SAM Copilot Usage Examples

## Quick Start

### 1. Install SAM for Copilot
```bash
npx sam-agents --platform copilot
```

### 2. Open Copilot Chat in VS Code

### 3. Point Copilot to SAM Instructions
```
Please read copilot-integration/instructions.md and follow the SAM agent system.
```

## Usage Examples

### Architecture Review
```
Act as sam-atlas. Review the architecture of this project and identify any concerns
with the current structure.
```

### Writing Tests (RED Phase)
```
Act as sam-titan. Write failing tests for the user authentication feature based on
the acceptance criteria in the PRD.
```

### Implementation (GREEN Phase)
```
Act as sam-dyna. Implement the minimum code needed to make the failing authentication
tests pass.
```

### Code Review (REFACTOR Phase)
```
Act as sam-argus. Review the authentication implementation for code quality,
best practices, and potential improvements.
```

### CSS Review
```
Act as sam-cosmo. Review the CSS in the login page for consistency, spacing scale
violations, and styling anti-patterns.
```

### UX Review
```
Act as sam-iris. Review the UX of the login flow and suggest improvements for
usability and accessibility.
```

### Documentation
```
Act as sam-sage. Generate API documentation for the authentication module.
```

### Full TDD Pipeline
```
Act as sam-orchestrator. Run the full TDD pipeline for the feature described in prd.md.
Follow the workflow in copilot-integration/agents/sam-tdd-pipeline.md.
```

## Tips for Best Results

1. **Be specific** — Reference file paths and feature names
2. **One agent at a time** — Switch personas explicitly between phases
3. **Reference the instructions** — Point Copilot to the agent markdown files for deeper context
4. **Follow TDD order** — RED (tests first) → GREEN (implementation) → REFACTOR (review)
