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

Show a clear user-facing terminal card. Keep route/state evidence and edge cases for stage close or final synthesis.

```text
Q<N>: After <action>, where should <user> go next?

Meaning:
<explain what the user will see or do next>

Why it matters:
This fixes the screen flow before layout work.

Suggested default:
<A/B/C> — <one clear reason>

Options:
A) <plain destination/state>

B) <plain destination/state>

C) <plain destination/state or "Not sure — use the default">

Reply: A/B/C, "use default", "not sure", "skip for now", or your own answer.
```

Internal notes for stage close/final synthesis: screen/state definitions, options/tradeoffs, evidence, why, scenario.

## Rules

- Parent routes/screens before child components.
- Name exact route/screen/state.
- Include empty/loading/error/permission states before visual design.
- Do not update `02-ui-flow.md` per question; record answers in `plan_draft.md` and summarize here only at stage close/final synthesis.
- No tech-stack/backend choices here except route/runtime facts from existing code.
