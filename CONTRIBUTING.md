# Contributing to SAM

Thank you for your interest in contributing to SAM! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in [GitHub Issues](https://github.com/sam-agents/sam/issues)
2. If not, create a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Node version, Claude Code version)

### Suggesting Features

1. Open a [GitHub Issue](https://github.com/sam-agents/sam/issues) with the `enhancement` label
2. Describe the feature and its use case
3. Explain how it fits with SAM's TDD-first philosophy

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test your changes locally with `npx . ./test-project`
5. Commit with a clear message: `git commit -m "Add: your feature description"`
6. Push to your fork: `git push origin feature/your-feature`
7. Open a Pull Request

### Code Style

- Keep agent definitions clear and focused
- Follow existing markdown formatting in agent files
- Use descriptive names for workflows and steps

### Testing Your Changes

```bash
# Test the CLI locally
node bin/cli.js ./test-folder

# Verify installed files
ls -la ./test-folder/_sam
ls -la ./test-folder/.claude/commands/sam
```

## Development Setup

```bash
# Clone the repo
git clone https://github.com/sam-agents/sam.git
cd sam

# Test locally
node bin/cli.js ./test-project
```

## Agent Contribution Guidelines

When adding or modifying agents:

1. **Maintain TDD focus** - Every agent should support the RED-GREEN-REFACTOR cycle
2. **Clear responsibilities** - Each agent has a specific role; don't overlap
3. **Consistent personality** - Agents have distinct communication styles
4. **Update manifests** - Keep `_sam/_config/agent-manifest.csv` in sync

## Questions?

Open an issue or start a discussion. We're happy to help!

---

Thank you for helping make SAM better!
