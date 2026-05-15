# SAM (sam-agents)

Autonomous TDD agent system distributed as an npm CLI. Installs agent definitions and per-platform skills into target projects (Claude Code, Cursor, Gemini CLI, GitHub Copilot, Antigravity).

This is a **template-generation tool**, not a runtime app — there are no unit tests, only verification scripts.

## Layout

```
bin/cli.js              # CLI entry point — install logic + per-platform generators
_sam/                   # Source of truth: agent definitions + workflows
  agents/               # Individual agent configs (architect, dev, reviewer, test, etc.)
  core/workflows/       # Autonomous TDD pipeline (step-01 … step-04)
  _config/              # Manifests (agent-manifest.csv, manifest.yaml)
  docs/                 # Per-platform guides (GEMINI, COPILOT, DEPLOYMENT)
templates/_sam/         # Mirror of _sam/ — what gets shipped to consumers
templates/.claude/      # Claude Code command wrappers
scripts/                # sync-templates, verify-sync, verify-manifest, verify-gemini
```

## The `_sam/` ↔ `templates/_sam/` rule

`_sam/` is the single source of truth. `templates/_sam/` is a generated mirror that ships in the npm package.

- **Edit `_sam/` only**, then run `npm run sync-templates` before committing.
- `npm test` runs `verify-sync.js` and will fail CI if they drift.
- Never hand-edit `templates/_sam/`.

## Commands

```bash
npm test                  # verify-manifest + verify-sync + verify-gemini
npm run sync-templates    # _sam/ → templates/_sam/
node bin/cli.js --platform all ./test-project   # manual smoke test
```

## Adding or editing an agent

1. Edit (or create) the markdown file under `_sam/agents/`.
2. If new: add a row to `_sam/_config/agent-manifest.csv` and register it in the platform agent lists in `bin/cli.js` (`generateCursorRules`, `generateAntigravitySkills`, `generateGeminiSkills`).
3. Run `npm run sync-templates`, then `npm test`.
4. Smoke-test with `node bin/cli.js --platform all ./test-project`.

## Agent file format

YAML frontmatter (`name`, `displayName`, `title`, `icon`) followed by sections: Core Responsibilities, Communication Style, Principles, In Autonomous Pipeline, Error Handling. See [AGENTS.md](AGENTS.md) for the full template and JS style rules for `bin/cli.js`.

## Publishing to npm

Releases are automated via GitHub Actions — **never run `npm publish` locally**. There is no local npm login; the workflow uses a repo-scoped `NPM_TOKEN` secret.

The flow:

1. Make sure `main` is clean and `npm test` passes locally.
2. Bump the version (this creates a commit + git tag automatically):
   ```bash
   npm version patch   # bug fix
   npm version minor   # new feature, backwards-compatible
   npm version major   # breaking change
   ```
3. Push the commit and tag:
   ```bash
   git push origin main --follow-tags
   ```
4. Create a GitHub Release pointing at the new tag (UI or `gh release create vX.Y.Z --generate-notes`). Publishing the release triggers `.github/workflows/publish.yml`, which runs `npm publish --access public --provenance`.
5. Verify with `npm view sam-agents version` after the workflow finishes.

If the workflow fails (e.g. token expired, version conflict), fix the underlying issue and re-publish the release from the GitHub UI — do not work around it by publishing locally.

## Notes

- Agent file names are lowercase-with-hyphens (e.g. `tech-writer.md`); display names are Title case (Dyna, Titan, Argus, …).
- Per-platform skill folders (`.claude/commands/sam/`, `.cursor/rules/`, `.gemini/skills/`, `.agent/skills/`, `copilot-integration/`) are *outputs* of the CLI on a consumer project, not inputs here.
