---
step: 5
name: css
description: CSS consistency review (static analysis); gated on web-app detection
agents: [css-reviewer]
---

# Step 5: CSS — Consistency Review

**Agent:** Cosmo (CSS Reviewer)

**Purpose:** Static analysis of styling for inconsistencies, anti-patterns, and deviations from design tokens.

---

## ACTIVATION

Cosmo runs its own activation check. Skip with a one-liner when no web app is detected:

```
COSMO SKIP: no web application detected. CSS review not applicable.
```

The workflow caller may also pass `--no-web-review` to force-skip.

---

## SCOPE

**Cosmo CAN detect:**
- Inconsistent spacing (mixing `15px` and `16px`)
- Missing flex / grid alignment
- Magic numbers off the spacing scale
- Hardcoded colors instead of tokens / CSS variables
- Mixed units and naming conventions
- Inconsistent breakpoints

**Cosmo CANNOT detect:**
- Actual rendering issues (needs a real browser)
- Cross-browser differences
- Issues only visible at specific viewports
- Whether something "looks right" visually

Real visual QA belongs to Percy / Chromatic / Playwright visual regression — not this step.

---

## ENTRY CONDITIONS

- UI step (Iris) complete or skipped
- Story `status: in-progress`

---

## CHECKLIST

### Layout
- [ ] Flex containers set `align-items` and `justify-content`
- [ ] Grid layouts set explicit `gap`
- [ ] Consistent alignment patterns across similar components

### Spacing
- [ ] Margins / padding follow the project's scale (4 / 8 / 16 / 24 / 32 …)
- [ ] No magic numbers (13px, 27px, 47px = red flags)
- [ ] Spacing tokens used where defined

### Typography
- [ ] Sizes use `rem` / `em`, not fixed px
- [ ] Line height set (1.4–1.6 for body)
- [ ] Heading hierarchy consistent
- [ ] Font family from tokens

### Components
- [ ] Buttons / inputs / cards share styling approach
- [ ] Border radius consistent
- [ ] Colors from defined palette / variables

### Tailwind-specific (if applicable)
- [ ] Consistent utility classes (`p-4`, `m-2`, `gap-4`)
- [ ] Responsive prefixes (`sm:`, `md:`, `lg:`) used consistently
- [ ] Custom values defined in `tailwind.config.js`, not as arbitrary values (`[15px]`)
- [ ] No mixing of arbitrary and scale values

### Design Standards Compliance (when standards available)
- [ ] Tokens used for colors / spacing / typography
- [ ] Required component states implemented
- [ ] Dark mode applied consistently if required
- [ ] Custom fonts loaded and configured

---

## OUTPUT FORMAT

```markdown
## Cosmo CSS Review: <STORY-ID>

**Project type:** <React/Vue/Next/etc.>
**CSS approach:** <Tailwind / CSS Modules / styled-components / etc.>
**Files reviewed:** <count>

### Inconsistencies
| Location | Found | Expected | Severity |
|----------|-------|----------|----------|
| file.css:12 | 15px | 16px (scale) | Warning |

### Anti-patterns
1. <file>:<line> — <issue>
   - Current: `<code>`
   - Fix: `<suggested>`

### Summary
- Spacing: <n>
- Colors: <n>
- Alignment: <n>
- Other: <n>
```

---

## GATE — CSS PASSES WHEN

- [ ] No Critical inconsistencies (mismatched scale, hardcoded design-system colors)
- [ ] No anti-patterns introduced by this story

On failure: increment retry; on third failure, set story `status: blocked` with phase `css`.

---

## NEXT

On pass / skip → workflow proceeds to `step-06-a11y.md`.
