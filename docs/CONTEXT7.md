# Using SAM with Context7

SAM can install its agents and TDD pipeline as **Context7 / Universal Agent Skills** so you can use them with the Context7 MCP server, Context7 CLI, and any client that supports the [Agent Skills](https://agentskills.io/) spec (e.g. Gemini CLI, GitHub Copilot, and other Context7-compatible tools).

## Install SAM for Context7

Install SAM skills into the Universal path (`.agents/skills/`):

```bash
npx sam-agents --platform context7
# or into a specific directory:
npx sam-agents --platform context7 ./my-project
```

This creates `.agents/skills/` in your project with one directory per SAM agent and the `sam-tdd-pipeline` workflow, each containing a `SKILL.md` (Agent Skills format) and a `references/` folder with the full agent definition.

## Where skills are installed

| Target        | Path               | Used by |
|---------------|--------------------|--------|
| Project       | `.agents/skills/`  | Context7 CLI, Gemini CLI, GitHub Copilot, and other Universal clients |
| (Global)      | `~/.config/agents/skills/` | When using Context7 CLI with `--global` |

SAM only writes to the **project** directory (`.agents/skills/`). For global installs, use the [Context7 CLI](https://context7.com/docs/skills) after SAM has published skills to a registry, or symlink/copy `.agents/skills/` into `~/.config/agents/skills/` if your client reads from there.

## Using Context7 MCP server with SAM

The [Context7 MCP server](https://context7.com/docs) provides up-to-date documentation and code examples for libraries. You can use it **together** with SAM:

1. **Install SAM skills** in the same project:
   ```bash
   npx sam-agents --platform context7
   ```
2. **Enable the Context7 MCP server** in your IDE (Cursor, etc.) so the model can call `query-docs` / `resolve-library-id` for library docs.
3. When you run the SAM TDD pipeline or an agent (e.g. Dyna, Argus), the model can use Context7 tools to look up framework or library docs as needed.

No extra config is required: SAM skills live in `.agents/skills/`, and Context7 MCP runs as a separate server. Your AI assistant can use both SAM instructions and Context7 documentation in the same session.

## How to add Context7 support to your own project

If you maintain a tool (like SAM) that wants to ship skills for Context7-compatible clients:

1. **Use the Agent Skills format**
   - Each skill is a directory with at least a `SKILL.md` file.
   - `SKILL.md` must have YAML frontmatter with `name` and `description`, then markdown body for the assistant.

2. **Install path**
   - For **Universal** clients (Context7 CLI, Gemini CLI, Copilot, etc.): write skills to **`.agents/skills/`** in the project (or document `~/.config/agents/skills/` for global).
   - Other clients: Context7 docs list [Claude Code `.claude/skills/`, Cursor `.cursor/skills/`, Antigravity `.agent/skills/`](https://context7.com/docs/skills#supported-clients).

3. **Structure**
   ```
   .agents/skills/
   ├── my-skill/
   │   ├── SKILL.md       # required: name, description + instructions
   │   └── references/   # optional: extra files the skill can refer to
   │       └── agent.md
   └── my-other-skill/
       └── SKILL.md
   ```

4. **Publishing to Context7 registry (optional)**  
   To allow installs via `npx ctx7 skills install /org/repo skill-name`, your repo should follow the [Context7 Skills Registry](https://context7.com/docs/skills) expectations (skills in a standard layout so the registry can index them).

## References

- [Context7 Skills docs](https://context7.com/docs/skills) — install, search, and supported clients
- [Agent Skills spec](https://agentskills.io/) — open standard for skill format
- [Context7 CLI](https://context7.com/docs/skills#cli-commands) — `npx ctx7 skills search`, `npx ctx7 skills install`, etc.
