---
step: 3
name: refactor
description: Adversarial code review with auto-fix; keep all tests green and build succeeding
agents: [reviewer]
---

# Step 3: REFACTOR — Review and Improve

**Agent:** Argus (Code Reviewer)

**Purpose:** Improve code quality without breaking the green tests. Find a minimum of 3 specific issues per review, auto-fix what's possible, and document what isn't.

---

## ENTRY CONDITIONS

- GREEN phase complete: full test suite passing, build succeeding
- Story `status: in-progress`

---

## PROCESS

```
1. Verify GREEN state (run full test suite + build)
2. Adversarial review across:
   - Correctness vs acceptance criteria
   - Test coverage completeness
   - Integration completeness (entry-point wiring, providers, env config)
   - Security (OWASP top 10)
   - Performance
   - Maintainability
3. Document every issue with file:line and severity (Critical / Moderate / Minor)
4. Minimum 3 issues; if you can't find 3, look harder at security, edge cases, performance
5. Auto-fix where possible; after each fix:
   - Re-run FULL test suite
   - If tests break: revert the fix, log it as needing manual attention
6. Verify build still succeeds after refactoring
7. Confirm entry-point wiring still intact
8. Document remaining manual items
```

---

## REVIEW CHECKLIST

### Correctness
- [ ] Matches every AC in the story
- [ ] Edge cases from `## Test Approach` are exercised
- [ ] Error paths are intentional, not accidental

### Contract conformance
- [ ] Every contract in the story's `produces:` is satisfied by real exports — names, signatures, error semantics match the contract body exactly
- [ ] Every contract's invariants are exercised by at least one test
- [ ] No type or interface redeclared locally that should be imported from a `consumes:` contract
- [ ] Producer story has flipped each `produces:` contract from `status: draft` to `status: stable`

### Testing
- [ ] All AC have tests (already enforced by RED, re-verify)
- [ ] Unit tests cover internal logic not exercised by AC tests
- [ ] No untested branches in changed code
- [ ] Tests assert behavior, not implementation details

### Integration
- [ ] Build succeeds
- [ ] App entry point has all required providers / routers wired (not just test wrappers)
- [ ] Env / CORS / port config correct
- [ ] No test-only wrappers masking missing production wiring

### Security (OWASP Top 10)
- [ ] No injection (SQL, command, template)
- [ ] Auth + authz on sensitive operations
- [ ] No hardcoded secrets
- [ ] Sensitive data not logged

### Performance
- [ ] No N+1 queries
- [ ] No accidental quadratic loops
- [ ] Caching applied where appropriate
- [ ] No obvious memory leaks

### Maintainability
- [ ] Clear naming
- [ ] No code duplication introduced
- [ ] Abstractions justified (no speculative generality)

---

## OUTPUT FORMAT

```markdown
## Code Review: <STORY-ID>

### Issues Found: <n> (Critical: <n>, Moderate: <n>, Minor: <n>)

#### Critical
1. **<Title>** — `<file>:<line>`
   - Risk: <impact>
   - Fix: <action taken or "manual review required">
   - Tests after fix: <pass/fail>

#### Moderate
...

#### Minor
...

### Final Verification
- Full test suite: ✓ <n> passing
- Build: ✓
- Entry point wiring: ✓
```

---

## GATE — REFACTOR PASSES WHEN

- [ ] At least 3 issues documented
- [ ] No Critical or Moderate issues remaining
- [ ] Full test suite passing
- [ ] Build succeeding
- [ ] Entry-point wiring intact
- [ ] Every `produces:` contract verified against actual exports — drift between contract and implementation is a Critical issue
- [ ] No locally-redeclared types where a `consumes:` import was available — drift between consumer and producer is a Critical issue

If Critical / Moderate issues remain after auto-fix: increment retry count; on third failure, set story `status: blocked` with phase `refactor`.

---

## NEXT

On pass → workflow proceeds to web review (`step-04-ui.md`) when applicable, otherwise to `step-08-docs.md`.
