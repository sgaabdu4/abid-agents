# Final plan module

Use when the interview is done or the user asks for an artifact. Infer the
smallest useful artifact; ask one clarification only if output shape is unclear.

## Inputs

Read fully:
- Durable session state: `docs/planning/<slug>/session_state.md`.
- Orchestrator draft answer ledger: `docs/planning/<slug>/plan_draft.md`.
- Existing temp stage handoffs only if they were created at stage close/artifact/final synthesis.
- Artifact files/paths that were created during visual-design/prototype stages.
- Relevant `CONTEXT.md`, `CONTEXT-MAP.md`, ADRs, and captured domain doc notes.

Do not expect a Stage Map in `plan_draft.md`; the draft is an answer ledger.
Do not create/read handoff files for skipped or n/a stages.

Include only goal-relevant decisions, needed Q&A, paths, acceptance checks,
verification, implementation traceability, high-risk controls, material
risks, domain/ADR changes, and parked unknowns.

## Synthesis flow

1. Read session state + draft answer ledger + existing stage handoffs/artifacts
   if present.
2. Infer artifact depth from the request and gathered answers.
3. If output shape is still unclear, ask one Q: decision summary, implementation plan, visual design/prototype, or full spec.
4. Check active stages are fully clarified or unknowns are explicitly parked by the user.
5. Detect conflicts between draft, handoffs, artifacts, and user answers.
6. If conflict/blocker exists, ask one Q; do not finalize.
7. Write `docs/planning/<slug>/plan.md` as the canonical artifact, sized to need.
8. If requested or needed, update confirmed `CONTEXT.md` glossary terms or ADRs
   using `modules/domain-docs.md`.
9. Re-read `plan.md`; verify it contains the needed decisions, artifact refs, acceptance checks, verification, domain docs, risks, unknowns, and traceability only where relevant.
10. List temp planning state for cleanup after verification:
   `session_state.md`, `plan_draft.md`, temp stage handoffs, empty `stages/`.
11. Preserve non-temp artifacts: designs, prototypes, mock data, fixtures,
    screenshots, diagrams, code, and user-created docs.
12. End with a plain handoff: what was produced, cleanup status, and the next
    likely user choices. For build-plan, include implement now, review/edit
    plan, or stop with the plan.

## Final plan requirements

`plan.md` includes only what the inferred artifact needs:
summary, assumptions, decisions, needed Q&A, artifact paths/status, relevant
domain or ADR updates, acceptance checks, verification, implementation
traceability, high-risk controls, material risks, parked unknowns, owner/next.

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
## Verification Plan
## Traceability
| Requirement | Slice/task | Acceptance criteria | Verification |
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
- Do not finish until each active stage has acceptance checks + verification where relevant, or an explicitly user-parked blocker/unknown.
- Trace requirements -> slices/tasks -> acceptance criteria -> verification.
- High-risk schema/data/auth/security/deploy/stateful work needs human review, rollback/migration notes, telemetry/audit expectations.
- Keep evidence labels: code/docs/user quote/unknown.
- Do not invent certainty.
- Include file paths + localhost/device refs for artifacts.
- Do not clean up temp planning files without separate approval. If content is
  not copied or ownership is unclear, keep it and list why under `## Cleanup`.
- Final reply: `plan.md` path + cleanup status + next-step handoff.
- Do not end with only a generic docs/config change report after writing
  `plan.md`; the user should know what can happen next.
