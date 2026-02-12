---
step: 2
name: generate-stories
description: Generate epics and user stories from validated PRD
agents: [sam-master]
---

# Step 2: Generate Stories

**Purpose:** Break down the validated PRD into implementable epics and user stories with clear, testable acceptance criteria.

---

## ENTRY CONDITIONS

- Phase 1 validation passed
- PRD parsed and available in context
- Architect recommendations available

---

## PROCESS

### 2.1 Analyze PRD Structure

```
1. Identify major feature areas (candidates for epics)
2. Group related requirements
3. Identify dependencies between features
4. Note technical constraints from architect review
```

### 2.2 Create Epics

**For each major feature area:**

```yaml
epic:
  id: "epic-1"
  title: "User Authentication"
  description: "All features related to user authentication and session management"
  prd_sections: ["3.1", "3.2"]  # Reference to PRD sections
  stories: []  # To be populated
  dependencies: []  # Other epics this depends on
```

### 2.3 Break Down into Stories

**For each epic, create user stories:**

```markdown
# Story: epic-1-story-1

## Title
User can log in with email and password

## Epic
User Authentication (epic-1)

## User Story
As a registered user
I want to log in with my email and password
So that I can access my account

## Acceptance Criteria

### AC1: Successful Login
- GIVEN a registered user with valid credentials
- WHEN they submit email and password
- THEN they are authenticated and redirected to dashboard

### AC2: Invalid Credentials
- GIVEN a user with invalid credentials
- WHEN they submit email and password
- THEN they see an error message "Invalid email or password"
- AND they remain on the login page

### AC3: Empty Fields
- GIVEN the login form
- WHEN user submits with empty email or password
- THEN they see validation error for the empty field(s)

## Technical Notes
- Use JWT for session management (per architect)
- Rate limit: 5 attempts per minute

## Tasks
- [ ] Task 1: Create login API endpoint
- [ ] Task 2: Implement credential validation
- [ ] Task 3: Generate and return JWT
- [ ] Task 4: Create login form component
- [ ] Task 5: Handle error states

## Dependencies
- None (first story)

## Status
pending
```

### 2.4 Story Sizing and Ordering

**Apply sizing heuristics:**

| Size | Criteria |
|------|----------|
| Small | 1-3 tasks, single component, ≤1 day |
| Medium | 4-6 tasks, multiple components, 1-2 days |
| Large | 7+ tasks, consider splitting |

**Ordering rules:**
1. Dependencies first
2. Foundation before features
3. Happy path before edge cases
4. Core functionality before polish

### 2.5 Write Story Files

**Create story files in run directory:**

```
sdocs/autonomous-runs/<run-id>/stories/
├── epic-1-story-1.md
├── epic-1-story-2.md
├── epic-2-story-1.md
└── ...
```

### 2.6 Generate Story Queue File

**Create `story-queue.txt` in the run directory** for multi-pass pipeline orchestration.

This file allows an external orchestrator to execute stories one at a time, each with a fresh context window.

**Format:** One story per line, pipe-delimited:

```
STORY_ID|STORY_FILE_PATH|DEPENDENCY_IDS
```

- `STORY_ID`: The story identifier (e.g., `epic-1-story-1`)
- `STORY_FILE_PATH`: Relative path to the story file from the run directory (e.g., `stories/epic-1-story-1.md`)
- `DEPENDENCY_IDS`: Comma-separated list of story IDs that must be completed first (empty if no dependencies)

**Example:**

```
epic-1-story-1|stories/epic-1-story-1.md|
epic-1-story-2|stories/epic-1-story-2.md|epic-1-story-1
epic-2-story-1|stories/epic-2-story-1.md|
epic-2-story-2|stories/epic-2-story-2.md|epic-2-story-1
epic-3-story-1|stories/epic-3-story-1.md|epic-1-story-1,epic-2-story-1
```

**Rules:**
- Stories MUST be in **topological order** (dependencies before dependents)
- Foundation stories (project setup, database, base config) come first
- Lines starting with `#` are comments
- Include stories for ALL PRD features — backend, frontend, integrations, everything

**Story file template:**

```markdown
---
id: epic-1-story-1
epic: epic-1
title: "User can log in with email and password"
status: pending
priority: 1
size: medium
dependencies: []
---

# User can log in with email and password

## User Story
As a registered user
I want to log in with my email and password
So that I can access my account

## Acceptance Criteria

### AC1: Successful Login
- GIVEN a registered user with valid credentials
- WHEN they submit email and password
- THEN they are authenticated and redirected to dashboard

### AC2: Invalid Credentials
- GIVEN a user with invalid credentials
- WHEN they submit email and password
- THEN they see an error message "Invalid email or password"
- AND they remain on the login page

### AC3: Empty Fields Validation
- GIVEN the login form
- WHEN user submits with empty email or password
- THEN they see validation error for the empty field(s)

## Technical Notes
[Notes from architect review]

## Tasks
- [ ] Task 1: Create login API endpoint
- [ ] Task 2: Implement credential validation
- [ ] Task 3: Generate and return JWT
- [ ] Task 4: Create login form component
- [ ] Task 5: Handle error states

## Test Coverage
- [ ] Acceptance tests (RED phase)
- [ ] Unit tests (GREEN phase)

## Review Checklist
- [ ] Code review passed
- [ ] All tests passing
- [ ] No security issues
```

---

## UPDATE STATE

```yaml
# Update pipeline-status.yaml
current_phase: "implementation"
stories:
  - id: "epic-1-story-1"
    title: "User can log in with email and password"
    epic: "epic-1"
    status: "pending"
    priority: 1
    file_path: "stories/epic-1-story-1.md"

  - id: "epic-1-story-2"
    title: "User can reset password"
    epic: "epic-1"
    status: "pending"
    priority: 2
    file_path: "stories/epic-1-story-2.md"
    dependencies: ["epic-1-story-1"]
```

---

## VALIDATION

Before proceeding, verify:

- [ ] All PRD features have corresponding stories
- [ ] Each story has ≥1 acceptance criterion
- [ ] Acceptance criteria follow GIVEN-WHEN-THEN format
- [ ] Dependencies are acyclic (no circular deps)
- [ ] Stories are appropriately sized
- [ ] Priority order respects dependencies

---

## OUTPUT SUMMARY

```markdown
## Story Generation Complete

### Epics Created: 3
1. epic-1: User Authentication (4 stories)
2. epic-2: Dashboard (3 stories)
3. epic-3: Settings (2 stories)

### Stories Created: 9
| ID | Title | Size | Dependencies |
|----|-------|------|--------------|
| epic-1-story-1 | User can log in | M | None |
| epic-1-story-2 | User can reset password | M | story-1 |
| ... | ... | ... | ... |

### Implementation Order
1. epic-1-story-1 (no deps)
2. epic-1-story-2 (after story-1)
3. ...

### Ready for TDD Loop
Proceeding to Phase 3: Implementation
```

---

## AUTONOMOUS BEHAVIOR

In autonomous mode:
- Generate all stories without prompts
- Apply sensible defaults for sizing
- Order by dependencies automatically
- Proceed to Phase 3 immediately upon completion

---

## NEXT STEP

On story generation complete → Load `step-03-tdd-loop.md`
