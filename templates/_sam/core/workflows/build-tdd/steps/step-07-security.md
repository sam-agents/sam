---
step: 7
name: security
description: Security review (opt-in via --security flag); secrets, CVEs, secure-coding violations
agents: [security-reviewer]
---

# Step 7: Security — Optional Security Review

**Agent:** Sentinel (Security Reviewer)

**Purpose:** Audit the changed code and dependency surface for security risks before marking the story `done`.

---

## ACTIVATION

This step is **opt-in**. It runs only when the workflow was invoked with `--security`:

```
/sam:core:workflows:build-tdd <story> --security
```

Otherwise the workflow skips this step entirely. `plan-n-build` may invoke security per-story or once at the end depending on its own flags.

---

## ENTRY CONDITIONS

- A11y step complete or skipped
- Story `status: in-progress`
- `--security` flag set

---

## SCOPE

```
1. Secrets:        scan changed files for hardcoded API keys, passwords, tokens
2. Dependencies:   audit lockfile additions / upgrades for known CVEs
3. Secure coding:  review changed code for injection, XSS, eval / shell, insecure defaults
```

Scope is bounded to **what this story changed** — Sentinel doesn't re-audit the whole project here. (For full audits, run Sentinel standalone or via `plan-n-build --security-audit-final`.)

---

## CHECKLIST

### Secrets and Credentials
- [ ] No API keys, passwords, or tokens in source or config
- [ ] No credentials in logs or error messages
- [ ] Env vars or secret manager for sensitive values

### Dependencies (delta only)
- [ ] No Critical / High CVEs in newly added direct dependencies
- [ ] Lockfile changes committed
- [ ] License compatibility acceptable

### Secure Coding (changed files only)
- [ ] No unchecked user input into `eval`, shell, or SQL
- [ ] Authn / authz on new sensitive endpoints
- [ ] Sensitive data not logged or surfaced in errors

---

## OUTPUT FORMAT

```markdown
## Sentinel Security Review: <STORY-ID>

### Findings: <n> (Critical: <n>, High: <n>, Medium: <n>, Low: <n>)

#### Critical
1. **<Title>** — `<file>:<line>`
   - Risk: <what could happen>
   - Remediation: <action>

#### High
...
```

---

## GATE — SECURITY PASSES WHEN

- [ ] No hardcoded secrets in changed files
- [ ] No Critical / High CVEs in new direct dependencies (or documented exception with rationale)
- [ ] No Critical secure-coding violations in changed code

On failure: increment retry; on third failure, set story `status: blocked` with phase `security`.

---

## NEXT

On pass / skip → workflow proceeds to `step-08-docs.md`.
