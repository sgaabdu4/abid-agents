# UI flow module

Use for UI flow stage when mapped `run` or `brief`. During Q&A, update only `plan_draft.md`; write `02-ui-flow.md` only at stage close, user request, or final synthesis.

## Scope

Map:
- Screens/routes.
- Entry points.
- Primary journey.
- Empty/loading/error/success states.
- Permissions/auth gates.
- Back/cancel/retry paths.

Out of scope:
- Visual layout details.
- Prototype implementation.
- Backend/infra selection.

## Stage handoff plan

At stage close/final synthesis, `02-ui-flow.md` includes only relevant decisions:
- Screen/route inventory.
- Entry points.
- Primary journey steps.
- Required states: empty/loading/error/success/permission.
- Navigation rules.
- Next-stage handoff for visual design only when useful.

Clarity gate:
- Parent screens/routes named.
- Primary journey ordered.
- Required states captured.
- Permissions/auth gates named or marked n/a.

## Q pattern

Use `modules/questions.md`. Ask one route, state, permission, or recovery
decision at a time. Keep route/state evidence, tradeoffs, why, and edge cases
for `session_state.md`, stage close, or final synthesis.

## Rules

- Parent routes/screens before child components.
- Name exact route/screen/state.
- Include empty/loading/error/permission states before visual design.
- Do not update `02-ui-flow.md` per question; record answers in `plan_draft.md` and summarize here only at stage close/final synthesis.
- No tech-stack/backend choices here except route/runtime facts from existing code.
