# v0.7.0 — Scope workflow + four-workflow split

This release reshapes the SAM pipeline. The single monolithic `autonomous-tdd` workflow is split into four composable workflows, a new upstream `scope` workflow handles users who don't have a PRD yet, and all generated artifacts now write to `sdocs/`.

## Breaking changes

- **`autonomous-tdd` is gone.** Replaced by three workflows: `plan` (PRD → epics + stories), `build-tdd` (one story → tested code), and `plan-n-build` (full composer). Existing invocations of `/sam:core:workflows:autonomous-tdd` must switch to `/sam:core:workflows:plan-n-build`.
- **Artifacts moved to `sdocs/`.** Stories, epics, architecture-ref, run reports, and the PRD itself now write to `sdocs/` in the consumer project — honoring the existing `output_folder` config. The old `sdocs/autonomous-runs/<timestamp>/` path is gone.
- **Per-platform command names changed.** `/sam-tdd-pipeline` and `@sam-tdd` are replaced by per-workflow names: `sam-plan`, `sam-build-tdd`, `sam-plan-n-build`, plus the new `sam-scope`.

## Added

- **`scope` workflow** — for users without a PRD. Takes prose, rough notes, or no input at all and produces a draft PRD via interactive discovery (Iris on UX, Atlas on technical constraints, Sage drafting). Always ships a draft on the first pass; gaps become honest "TBD" notes plus Open Questions you can iterate on. PRD `status` tracks `draft` → `reviewed` → `accepted`.
- **`--from-idea` flag on `plan-n-build`** — one-shot path for users with only an idea. Prepends `scope` in non-interactive mode to draft a PRD before planning. Preserves the composer's "no human prompts" contract.
- **Canonical schemas as explicit contracts.** Three new schema files in `_sam/core/resources/` define the seams between workflows: `prd-schema.md`, `story-schema.md`, `epic-schema.md`. Workflows refuse to operate on invalid artifacts.
- **Sage gains Mode 0 (PRD drafting)** in addition to per-story changelog (Mode 1) and comprehensive feature docs (Mode 2).
- **Per-workflow commands across all five platforms** — Claude Code, Cursor, Antigravity, Gemini CLI, and GitHub Copilot all get distinct invocations per workflow.

## Changed

- **Story `status` field is now authoritative for resume.** No separate `pipeline-status.yaml` to drift. `plan-n-build --resume` reads each story's frontmatter to know what's done.
- **`bin/cli.js` refactored.** A shared `WORKFLOWS` constant replaces the per-generator workflow blocks that previously had to be kept in sync by hand.
- **`verify-gemini.js` updated** to check for 11 agents + 4 workflows = 15 skills.
- **README rewritten** for the four-workflow model with a per-platform invocation matrix and the typical-flow callout.

## Migration

For existing users with a working `autonomous-tdd` setup:

1. Reinstall: `npx sam-agents@0.7.0 --platform <yours>`
2. Replace any `/sam:core:workflows:autonomous-tdd <prd>` invocations with `/sam:core:workflows:plan-n-build <prd>`
3. References to `sam-tdd-pipeline` or `@sam-tdd` in your tooling/docs become `sam-plan-n-build` / `@sam-plan-n-build` (or a more granular workflow command)
4. Generated artifacts now appear in `sdocs/` instead of `sdocs/autonomous-runs/<timestamp>/` — adjust any scripts that read from the old path

## Known leftover

`_sam/docs/SAM_GEMINI_USAGE.md` and `SAM_COPILOT_USAGE.md` still reference `sam-tdd-pipeline` from the old design. Informational docs only — slated for cleanup in a follow-up release.
