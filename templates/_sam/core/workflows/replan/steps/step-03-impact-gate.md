---
step: 3
name: impact-gate
description: Present the impact summary to the user and require explicit confirmation before applying any changes to contracts or stories
agents: [architect]
---

# Step 3: Impact Summary Gate (User Confirmation)

**Agent:** Atlas (System Architect)

**Purpose:** Present a human-readable impact summary derived from the Step 2 analysis report and require explicit user confirmation before any file modifications occur. This is the safety net — if the user declines, the workflow halts cleanly with zero side effects.

---

## ENTRY CONDITIONS

- Step 2 impact analysis report exists at `sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md`
- The analysis report contains a valid `impact_summary` section with all required counts
- No file modifications have been made yet — Steps 1 and 2 are read-only analysis steps

If the analysis report is missing or malformed, halt with an error directing the user to re-run Step 2.

---

## REQUIRED READING

Before presenting the summary:
- `sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md` — the full impact analysis from Step 2 (read in full)
- The `impact_summary` section specifically — extract all counts
- The `Full Impact Matrix` section — needed for the detailed breakdown

---

## PROCESS

### 3.1 Extract Impact Counts

Read the impact summary statistics from the Step 2 analysis report and validate internal consistency:

```yaml
counts:
  contracts_affected: <N>
  contracts_to_version_bump: <N>
  contracts_to_deprecate: <N>
  contracts_to_update_in_place: <N>

  stories_affected: <N>
  stories_to_rebuild: <N>          # done/in-progress → needs-rebuild
  stories_to_obsolete: <N>
  stories_to_update: <N>           # draft/ready → update-in-place

  done_stories_invalidated: <N>    # critical — prominently highlighted
  new_stories_to_create: <N>       # from added requirements
  new_contracts_to_create: <N>     # from added requirements
```

Verify that:
- `contracts_affected = contracts_to_version_bump + contracts_to_deprecate + contracts_to_update_in_place`
- `stories_affected = stories_to_rebuild + stories_to_obsolete + stories_to_update`

If counts are inconsistent, halt and report the discrepancy — do not present a misleading summary.

### 3.2 Format the Impact Summary

Present the summary to the user in this exact format:

```
═══════════════════════════════════════════════════════
  REPLAN IMPACT SUMMARY — <slug>
═══════════════════════════════════════════════════════

  Contracts
    Version bump:     <N>  (stable contracts with modified requirements)
    Deprecate:        <N>  (contracts tied to removed requirements)
    Update in place:  <N>  (draft contracts — no version bump needed)
    New:              <N>  (from added requirements)

  Stories
    Mark needs-rebuild: <N>  (done/in-progress stories to revisit)
    Mark obsolete:      <N>  (stories tied to removed requirements)
    Update in place:    <N>  (draft/ready stories — edit ACs and notes)
    New:                <N>  (from added requirements)

  ⚠ Done stories invalidated: <N>
    These stories were previously completed and will require
    a build-tdd pass after replan completes.

═══════════════════════════════════════════════════════
```

If `done_stories_invalidated > 0`, also list the specific story IDs and their current titles:

```
  Stories requiring rebuild:
    - STORY-003: <title>  (done → needs-rebuild)
    - STORY-007: <title>  (done → needs-rebuild)
```

If `stories_to_obsolete > 0`, list the specific stories being retired:

```
  Stories being retired:
    - STORY-005: <title>  (→ obsolete, code preserved)
    - STORY-009: <title>  (→ obsolete, code preserved)
```

If `contracts_to_deprecate > 0`, list the contracts being deprecated:

```
  Contracts being deprecated:
    - CONTRACT-<id>: <title>  (→ deprecated, body preserved)
```

### 3.3 Check for High-Impact Warning

If the Step 2 analysis flagged a massive blast radius (>50% of done stories invalidated), repeat the warning prominently:

```
  ⚠⚠ HIGH IMPACT WARNING ⚠⚠
  More than 50% of completed stories will be invalidated.
  Consider using `plan --force` for a full rebuild instead.
```

### 3.4 Prompt for Confirmation

After the summary, present the user with an explicit choice:

```
  This replan will modify the files listed above.
  No code will be deleted — only metadata (status fields) will change.

  Options:
    proceed   — apply all changes listed above
    abort     — halt replan with no file modifications
    detail    — show the full impact matrix before deciding
```

**Handling each response:**

- **`proceed`**: Record the confirmation and advance to Step 4. Log:
  ```
  ✓ User confirmed replan. Proceeding to apply changes.
  ```

- **`abort`**: Halt the workflow immediately. Print:
  ```
  Replan aborted by user. No files were modified.
  The impact analysis is preserved at:
    sdocs/replans/<YYYY-MM-DD>-<slug>-analysis.md

  To re-run with a different revised PRD:
    /sam:core:workflows:replan <new-revised-prd.md>

  To apply this replan without the gate:
    /sam:core:workflows:replan <revised-prd.md> --force
  ```
  Exit with zero side effects. The analysis file from Steps 1–2 remains as documentation.

- **`detail`**: Display the full `Full Impact Matrix` table from the analysis report. Then re-prompt the same `proceed / abort` choice (no recursive `detail` — show it once).

### 3.5 Handle --force Flag

If the workflow was invoked with `--force`:
- Still print the impact summary (for the log / audit trail)
- Skip the confirmation prompt
- Log: `--force flag set. Skipping confirmation gate.`
- Proceed directly to Step 4

### 3.6 Record Gate Outcome

Append the gate outcome to the analysis report:

```markdown
## Gate 3: User Confirmation

- **Date:** <timestamp>
- **Outcome:** confirmed | aborted | force-skipped
- **Done stories invalidated:** <N>
- **User response:** <proceed | abort | --force>
```

This creates an audit trail of whether the user explicitly approved the changes.

---

## GATE — IMPACT GATE PASSES WHEN

- [ ] Impact summary was presented to the user with all counts from Step 2
- [ ] Counts are internally consistent (verified before display)
- [ ] User explicitly responded `proceed` OR `--force` flag was set
- [ ] If user responded `abort`, workflow halted with zero file modifications
- [ ] Gate outcome is appended to the analysis report
- [ ] No files outside `sdocs/replans/` were modified during this step

---

## FAILURE MODES

- **Missing analysis report:** Halt with error — cannot present a summary without data. Direct user to re-run from Step 1.
- **Inconsistent counts:** Halt with error showing the inconsistency. Do not present a misleading summary. Direct user to re-run Step 2.
- **User does not respond:** In non-interactive contexts, treat as `abort`. Never default to `proceed` — confirmation must be explicit.
- **Unexpected input:** If the user responds with something other than `proceed`, `abort`, or `detail`, re-prompt once with the valid options. If the second response is also unrecognized, treat as `abort` and halt safely.

---

## NEXT

→ Step 4: Apply Per-Category Changes (`step-04-apply-changes.md`)

Once the user confirms, Atlas proceeds to apply the classified actions from the impact matrix: updating stories and contracts in place, bumping versions, setting statuses to `needs-rebuild` or `obsolete`, and deprecating contracts. The impact matrix from Step 2 is the authoritative input — Step 4 does not re-derive impact, it executes it.
