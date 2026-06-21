# Final plan module

Use when the interview is done or the user asks for an artifact. Do not ask the user to choose plan depth upfront; infer the smallest useful artifact from the conversation, then ask one clarification only if the output shape is still unclear.

## Inputs

Read fully:
- Durable session state: `docs/planning/<slug>/session_state.md`.
- Orchestrator draft answer ledger: `docs/planning/<slug>/plan_draft.md`.
- Existing temp stage handoffs only if they were created at stage close/artifact/final synthesis.
- Artifact files/paths that were created during visual-design/prototype stages.
- Relevant `CONTEXT.md`, `CONTEXT-MAP.md`, ADRs, and captured domain doc notes.

Do not expect a Stage Map in `plan_draft.md`; the draft is an answer ledger.
Do not create/read handoff files for skipped or n/a stages.

Need in the final artifact only when relevant to the user's goal:
- Decisions and Q&A needed to understand them.
- Artifacts and paths.
- Acceptance checks.
- Verification/evals.
- Requirement -> slice/task -> verification traceability when implementation is planned.
- High-risk controls when risk exists.
- Risks only when they affect decisions.
- Domain language changes and ADR candidates when they affect naming,
  contracts, docs, tests, or future work.
- Parked unknowns/blockers.

## Synthesis flow

1. Read session state + draft answer ledger + existing stage handoffs/artifacts
   if present.
2. Infer artifact depth from the user's request and gathered answers.
3. If output shape is still unclear, ask one Q: decision summary, implementation plan, visual design/prototype, or full spec.
4. Check active stages are fully clarified or unknowns are explicitly parked by the user.
5. Detect conflicts between draft, handoffs, artifacts, and user answers.
6. If conflict/blocker exists, ask one Q; do not finalize.
7. Write `docs/planning/<slug>/plan.md` as the canonical artifact, sized to the inferred need.
8. If requested or needed, update confirmed `CONTEXT.md` glossary terms or ADRs
   using `modules/domain-docs.md`.
9. Re-read `plan.md`; verify it contains the needed decisions, artifact refs, acceptance checks, verification/evals, domain docs, risks, unknowns, and traceability only where relevant.
10. List temp planning state for cleanup after verification:
   `session_state.md`, `plan_draft.md`, temp stage handoffs, empty `stages/`.
11. Preserve non-temp artifacts: visual design concepts, prototypes, mock data, fixtures, screenshots, diagrams, code, and user-created docs.

## Final plan requirements

`plan.md` includes only what is useful for the inferred artifact depth:
- Summary.
- Final assumptions.
- Decisions with short rationale.
- Q&A history only when needed to understand decisions.
- Artifact paths + current status.
- Domain language and ADR updates when relevant.
- Acceptance checks.
- Verification/evals.
- Traceability table only when implementation is planned.
- High-risk controls only when risk exists.
- Risks + mitigations only when they affect decisions.
- Parked unknowns + owner/next step.

Do not write `99-final-plan.md`; final synthesis lives in `plan.md`.

## Final plan sections

```md
# <Title> Plan

## Summary
## Code/Request Evidence
## Stage Map and Source Status
## Decisions
## Domain Language and ADRs
## Product Plan
## UI Flow
## Visual Design
## Prototype Tech Stack
## Prototype
## Backend/Infra Tech Stack
## Vertical Slices and Task Waves
## Acceptance Criteria
## Verification/Eval Plan
## Traceability
| Requirement | Slice/task | Acceptance criteria | Verification/eval |
|---|---|---|---|
## Artifacts
## High-Risk Controls
## Risks
## Unknowns
## Q&A
## Cleanup
```

Omit irrelevant stage sections unless they explain an important decision. Do not include boilerplate skipped/n/a sections.

## Rules

- Final plan is canonical. No required info may live only in a temp handoff/draft.
- Do not write "see handoff"; copy the useful content into `plan.md`.
- Use `modules/domain-docs.md` before writing glossary or ADR updates.
- Do not put implementation decisions in `CONTEXT.md`.
- Do not finish while a relevant handoff/artifact is `draft` or `blocked`.
- Do not finish until each active stage has acceptance checks + verification/eval where relevant, or an explicitly user-parked blocker/unknown.
- Trace requirements -> slices/tasks -> acceptance criteria -> verification/evals.
- High-risk schema/data/auth/security/deploy/stateful work needs human review, rollback/migration notes, telemetry/audit expectations.
- Keep evidence labels: code/docs/user quote/unknown.
- Do not invent certainty.
- Include file paths + localhost/device refs for artifacts.
- Do not clean up temp planning files without separate approval. If content is
  not copied or ownership is unclear, keep it and list why under `## Cleanup`.
- Final reply: `plan.md` path + cleanup status.
