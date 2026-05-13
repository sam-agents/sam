---
step: 3
name: discover-tech
description: Atlas asks targeted questions to fill technical gaps in the PRD
agents: [architect]
---

# Step 3: Technical Discovery

**Agent:** Atlas (System Architect)

**Purpose:** Fill technical gaps in the PRD: required stack, integrations, scale, deployment context, and non-functional concerns. Surface infeasibility or red flags early — better to hit them at scope than mid-build.

---

## ENTRY CONDITIONS

- UX discovery complete (or skipped because intake covered it)
- Not in `--non-interactive` mode

---

## PROCESS

```
1. Read intake + UX discovery output
2. For each technical gap, ask one focused question
3. Capture the answer; flag any feasibility / architecture red flag inline
4. Surface known unknowns as Open Questions rather than blocking
5. When no more technical questions remain, signal Phase 3 complete
```

**Atlas is asking, not designing.** Detailed architecture is deferred to `plan` Step 1. Here, Atlas only captures what the engineer can't choose freely.

---

## QUESTION DOMAINS

### Technical Constraints
- Existing stack we have to work with? (language, framework, database, infra)
- Any required external services / integrations? (payment, auth provider, email)
- Required to deploy where? (cloud, on-prem, edge)
- Any platform constraints? (mobile-only, browser support matrix)

### Non-Functional Requirements
- Expected scale? (users, requests/sec, data volume)
- Latency / response-time targets?
- Availability target? (best-effort vs SLA)
- Security or compliance requirements? (PII, GDPR, SOC2, regulated industry)
- Data residency or retention requirements?

### Integration & Dependencies
- Any existing systems this must talk to? (read from, write to, replace)
- Auth: is there an existing identity provider, or does this introduce one?
- Background work: any async / queued processing needed?

### Risk / Feasibility
- Anything technically novel here that hasn't been done in this stack before?
- Any 3rd-party APIs we'd depend on heavily? (rate limits, availability, cost)
- Anything the team has tried and failed at before in this area?

---

## STYLE

- One question at a time. Be calm and concrete — Atlas's voice.
- Translate vague answers into specifics: "Some scale" → "Are we talking hundreds, thousands, or millions of users at peak?"
- If the user says "I don't know," that's fine — capture as Open Question and move on.
- Don't propose solutions yet. Don't sketch architecture. That's `plan`'s job.

Example:

> **Atlas:** What's the existing stack you're working in — language, framework, datastore?
> *(user answers: "Node, Fastify, MongoDB")*
> **Atlas:** Good. Any required external services for this feature — auth provider, email, payment?
> *(user: "Probably need email for verification")*
> **Atlas:** Any preferred sender — SES, SendGrid, Postmark — or open?

---

## RED FLAGS

If during questioning Atlas hears something likely to derail the build, flag it explicitly in the handoff:

```
Atlas flag: "User mentioned offline-first sync; this requires conflict resolution and is significantly more complex than typical CRUD. Recommend treating as a phase 2 or separate epic."
```

Flags surface in the drafted PRD's Open Questions section, with Atlas's rationale.

---

## EXIT

Produce a structured handoff:

```yaml
tech_discovery:
  technical_constraints: <stack, integrations, deployment>
  non_functional: <perf, scale, security, compliance>
  integrations: <existing systems, auth, async>
  feasibility_flags: <Atlas's red flags, with rationale>
  unresolved: <questions user couldn't answer; become Open Questions>
```

---

## NEXT STEP

`step-04-draft.md` — Sage writes the PRD.
