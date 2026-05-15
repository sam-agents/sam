---
step: 9
name: demo
description: Lens records a video + screenshots + console + network of the working epic, AFTER the integration story passes. Evidence-only, not a gate input.
agents: [lens]
---

# Step 9: DEMO — Lens Records the Working Epic

**Agent:** Lens (Demo Recorder)

**Purpose:** Once the integration story in an epic has reached `status: done`, Lens drives a real browser through the user flow and captures the run as evidence so a human can review the working feature asynchronously and so the orchestrator has on-disk proof that the demo actually happened.

This step is **post-integration, epic-level, evidence-only.** It does not gate whether the seams compose — the integration story already did. It captures the working flow.

---

## ENTRY CONDITIONS

- All feature stories in the epic have `status: done`
- The epic's `kind: integration` story has `status: done`
- Dev servers are running (or `playwright.config.ts` can boot them via `webServer`)
- Project's `architecture-ref.md` indicates a web stack — see "Skip Rules" below

If any condition fails, halt with the offending state — do NOT silently skip.

---

## SKIP RULES

Lens auto-skips and writes `sdocs/evidence/<epic-id>/skip.md` when:

- The project has no client workspace AND no `index.html` AND no Vite/Next/Webpack config
- `architecture-ref.md` declares `ui: none` (or equivalent)
- The integration story body lacks a `## Demo Probes` section (which Atlas omits intentionally for non-web epics)

A skip is documented absence, not failure. It counts as gate pass.

---

## PROCESS

```
1. Detect web stack from architecture-ref.md and project layout. If non-web, write
   sdocs/evidence/<epic-id>/skip.md and exit success.
2. Ensure @playwright/test installed at project root; if missing:
   - npm install -D @playwright/test
   - npx playwright install chromium
3. Ensure playwright.config.ts exists at project root with:
   - testDir: ./tests/e2e
   - outputDir: ./sdocs/evidence/<epic-id>/playwright
   - use: { video: 'on', screenshot: 'on', trace: 'on' }
   - webServer: [server, client] entries with reuseExistingServer: true
4. Read the integration story's `## Demo Probes` section.
5. Generate tests/e2e/<epic-slug>.spec.ts:
   - beforeEach: reset application state (call the project's documented reset helper,
     or DELETE-all via API for repo-backed apps)
   - One test per declared probe sequence
   - page.on('console') → push to consoleMessages[]
   - page.on('pageerror') → push to consoleMessages[] with [pageerror] prefix
   - page.on('response') → push to networkLog[]
   - At each declared milestone: await page.screenshot({ path: 'sdocs/evidence/<epic-id>/screenshot-N-<name>.png', fullPage: true })
   - At end: writeFileSync console.log and network.json
   - Assert: no [pageerror] entries
6. Run `npx playwright test`.
7. Verify evidence files exist (see Gate Criteria).
8. Parse network.json — verify every probe declared by Atlas appears with the
   correct method, URL pattern, and status code.
9. Write sdocs/evidence/<epic-id>/lens-report.md — one-page summary linking the artifacts.
```

---

## EVIDENCE PACKAGE (target shape)

```
sdocs/evidence/<epic-id>/
├── lens-report.md
├── console.log
├── network.json
├── screenshot-1-<milestone>.png
├── screenshot-2-<milestone>.png
├── ... (one per declared probe milestone)
└── playwright/
    └── <test-name>/
        ├── video.webm
        ├── trace.zip
        └── (Playwright artifacts)
```

For skipped runs:

```
sdocs/evidence/<epic-id>/
└── skip.md
```

---

## GATE — DEMO PASSES WHEN

For a web-stack run:
- [ ] `playwright/.../video.webm` exists with size > 0
- [ ] `playwright/.../trace.zip` exists with size > 0
- [ ] One `screenshot-N-<name>.png` per declared probe milestone, all with size > 0
- [ ] `console.log` exists (may contain `[error]` from intentional 4xx — that's OK)
- [ ] `network.json` exists; every probe declared in `## Demo Probes` appears with matching method/URL/status
- [ ] No `[pageerror]` entries in console.log
- [ ] `lens-report.md` written summarizing the run

For a skipped run:
- [ ] `skip.md` written with a structured `reason: <…>` field

The orchestrator parses these files. Lens's prose claims do not gate.

---

## FAILURE MODES

- **Playwright run failed (test threw):** capture the failing screenshot + trace, block the epic, surface the assertion that failed and which probe milestone it was at.
- **Run passed but artifact missing:** Lens bug or Playwright config error. Block; do not let an empty evidence dir pass for "done."
- **Probe missing from network.json:** the user flow ran but the expected HTTP call didn't fire. Most often the integration story's `## Demo Probes` has drifted from the actual implementation. Block and surface the discrepancy.
- **`[pageerror]` captured:** uncaught JS exception in the browser. Real bug. Block. Attach the pageerror message and the screenshot from immediately before.
- **State reset fails:** integration test owns its preconditions; if it can't clear state, the recording isn't trustworthy. Fail with the specific reset error.
- **Chromium missing:** auto-install once; retry; persistent failure → block with install instructions.

---

## RETRY POLICY

DEMO retries differently from RED/GREEN/REFACTOR:

- **Max retries:** 1 (one auto-install retry; one auto-rerun for transient browser flakes)
- **No retry-loop on assertion failure** — a failing assertion is a real bug (or a drifted probe spec), not a flaky run. Block and surface.

---

## NEXT

On success → epic transitions to `status: done` (if not already), workflow exits.

On skip → epic transitions to `status: done`; skip.md documents the absence.

On failure → epic blocked at `phase: demo`. The integration story remains `done` (its own gate passed), but the epic cannot close until Lens has captured a clean run OR the integration story is updated and re-passed.
