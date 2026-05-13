---
step: 4
name: ui
description: UX review for stories with UI; gated on web-app detection
agents: [ux-designer]
---

# Step 4: UI — UX Validation

**Agent:** Iris (UX Designer)

**Purpose:** Validate that the implementation serves the user, conforms to design standards, and matches the UX intent of the story.

---

## ACTIVATION

Run this step ONLY when **both** are true:
1. Web app is detected in the consumer project (React / Vue / Angular / Next / etc., HTML / CSS files, or framework configs)
2. The story touches UI (form, page, component, navigation, or user-facing message)

If neither applies, skip and proceed to the next conditional step. Print one-line skip reason.

The workflow caller may also pass `--no-web-review` to force-skip all of steps 4–6.

---

## ENTRY CONDITIONS

- REFACTOR phase complete
- Story `status: in-progress`

---

## PROCESS

```
1. Identify UX-related AC in the story
2. Read `## Design Standards` section (or fall back to architecture-ref.md → SAM defaults)
3. Review the implementation against AC and design standards
4. Check:
   - User flow correctness
   - Accessibility basics (keyboard, labels, ARIA — deeper a11y in Aria step)
   - Usability (clear CTAs, error states, loading states)
   - Responsive design
5. Categorize findings by severity
6. Provide actionable fix suggestions
```

---

## UX CHECKLIST

### User Flow
- [ ] Matches expected journey from AC
- [ ] Clear calls to action
- [ ] Logical navigation
- [ ] Feedback on user actions (success / error / loading)

### Design Standards Compliance
- [ ] Typography per resolved standards (font family, scale, weight)
- [ ] Colors via design tokens, not hardcoded
- [ ] Spacing on the defined scale
- [ ] Component states implemented (hover, focus, disabled, loading, empty, error)

### Responsive
- [ ] Mobile-friendly layout
- [ ] Touch targets ≥ 44×44px
- [ ] Readable type sizes
- [ ] Breakpoints respected

---

## SEVERITY

| Level | Description | Action |
|-------|-------------|--------|
| Critical | Blocks user task completion | Must fix before phase passes |
| Major | Significant usability issue | Should fix before phase passes |
| Minor | Polish | Document for follow-up |
| Suggestion | Nice-to-have | Note in story comments |

---

## GATE — UI PASSES WHEN

- [ ] No Critical issues
- [ ] No Major issues, or all auto-fixed
- [ ] Design-standards deviations flagged as Major or higher are addressed

On gate failure: increment retry; on third failure, set story `status: blocked` with phase `ui`.

---

## NEXT

On pass / skip → workflow proceeds to `step-05-css.md`.
