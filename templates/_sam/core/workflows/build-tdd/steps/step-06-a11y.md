---
step: 6
name: a11y
description: Accessibility review of changed UI; gated on web-app detection
agents: [accessibility-reviewer]
---

# Step 6: A11y — Accessibility Review

**Agent:** Aria (Accessibility Reviewer)

**Purpose:** Review changed UI for semantic markup, keyboard navigation, labels, and contrast against WCAG AA.

---

## ACTIVATION

Aria runs its own activation check. Skip with a one-liner when no web app is detected:

```
ARIA SKIP: no web application detected. Accessibility review not applicable.
```

The workflow caller may also pass `--no-web-review` to force-skip.

---

## ENTRY CONDITIONS

- CSS step (Cosmo) complete or skipped
- Story `status: in-progress`

---

## CHECKLIST

### Semantics
- [ ] Buttons / links use `<button>` / `<a>`; no clickable `<div>`s without role + keyboard handling
- [ ] Headings form a logical hierarchy
- [ ] Landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`) or ARIA equivalents
- [ ] Lists use `<ul>` / `<ol>` / `<li>`; tables use proper headers

### Keyboard
- [ ] All interactive elements focusable
- [ ] Focus order is logical (tab order matches visual order)
- [ ] Focus is visible (outline or visible style)
- [ ] Modals / dialogs trap focus and return it on close
- [ ] Skip link for main content where applicable

### Labels and Descriptions
- [ ] Form inputs have associated labels (`for`/`id` or `aria-label`)
- [ ] Images have `alt` (or `alt=""` for decorative)
- [ ] Icon-only buttons have `aria-label` or sr-only text

### Color and Contrast
- [ ] Body text ≥ 4.5:1 contrast (WCAG AA)
- [ ] Large text ≥ 3:1
- [ ] Information not conveyed by color alone

### Motion
- [ ] `prefers-reduced-motion` respected for animations

---

## OUTPUT FORMAT

```markdown
## Aria A11y Review: <STORY-ID>

### Findings: <n> (Critical: <n>, High: <n>, Medium: <n>, Low: <n>)

#### Critical
1. **<Title>** — `<file>:<line>` — WCAG <criterion>
   - Impact: <who's affected and how>
   - Fix: <concrete action>

#### High
...

#### Medium / Low
...
```

---

## GATE — A11Y PASSES WHEN

- [ ] No Critical semantic or keyboard issues in changed UI
- [ ] Forms and interactive elements have labels (or equivalent)
- [ ] No focus traps in added modals / dialogs

On failure: increment retry; on third failure, set story `status: blocked` with phase `a11y`.

---

## NEXT

On pass / skip → workflow proceeds to `step-07-security.md` if `--security` was passed, otherwise to `step-08-docs.md`.
