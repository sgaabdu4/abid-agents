# Mode inference module

Load this before building a stage map or when the requested depth is unclear.

## Goal

Infer the smallest useful depth from the user's words, supplied context, and
code evidence. Do not show a mode menu. Ask one clarification only if the
requested depth is genuinely ambiguous or contradictory.

Modes are generic depth caps, not domain-specific workflows.

## Modes

- `auto`: default. Infer mode from the request.
- `align` / `lite`: decision alignment + plan only. Use for "plan",
  "plan for X", "approach", "align", "what's best", "strategy",
  "compare options", or "no prototype/build" requests. Read supplied
  docs/pages/code first when they matter. Ask only decision-critical Qs.
  Cap: no visual design, no prototype tech, no prototype, and no design/code
  artifact build unless the user explicitly asks.
- `build-plan`: implementation sequencing + verification. Use when the user
  wants to build/ship/implement but does not ask for visual exploration or a
  prototype. Run product/backend/UI briefs only where unclear or touched; run
  vertical slices/evals.
- `full`: full discovery-to-plan pipeline. Use for broad greenfield apps/sites,
  ambiguous major product work, or explicit "full grill me" requests.
- `review`: inspect existing plan/spec/docs/code, find gaps/risks, ask focused
  Qs, and produce findings or a revised plan. Do not create design/prototype
  artifacts unless requested.

## Rules

- If the user names a mode, honor it unless it conflicts with a stated goal.
- If the user says "just", "only", "no prototype", "no build", or "plan plan",
  treat that as an `align` cap.
- Domain words like migration, auth, billing, onboarding, redesign, refactor, or
  data cleanup do not create modes. They shape the stage map inside the inferred
  mode.
- Mode cap overrides the greenfield/full default. Example: greenfield + "just
  align on approach" = `align`, not `full`.
- Existing/supplied docs/pages/code used for alignment are part of intake and
  final plan evidence. Do not invent a new stage file for a one-off context
  audit.
- Build artifacts only in `full`, explicit prototype/design requests, or when
  the user approves expanding the mode.

## Stage Map

```md
## Stage Map
- Product plan: <run | brief | skip> - <why/evidence>
- UI flow: <run | brief | skip | n/a> - <why/evidence>
- Visual design: <run | brief | skip | n/a> - <why/evidence>
- Prototype tech stack: <run | brief | skip | n/a> - <why/evidence>
- Prototype: <run | brief | skip | n/a> - <why/evidence>
- Backend/infra tech stack: <run | brief | skip> - <why/evidence>
- Vertical slices/evals: <run | brief | skip | n/a> - <why/evidence>
```

## Defaults

- `align` / `lite`: run/brief only the stages needed to decide the approach and
  write the plan. Usually product/current-state/target-state questions,
  constraints, options, risks, validation, and final plan. UI/backend/slices are
  brief only when the decision touches them. Visual design, prototype tech, and
  prototype are `n/a` unless explicitly requested.
- `build-plan`: product brief if unclear; UI/backend only when touched; visual
  design/prototype `n/a` unless requested or needed to reduce a risky UX
  unknown; vertical slices/evals run.
- `full` + greenfield UI: run all, including visual design directions,
  prototype tech stack, styled mock-data full-flow prototype, and vertical
  slices/evals.
- `review`: inspect supplied/current artifacts first; run/brief only stages
  needed to explain gaps, risks, contradictions, and next decisions; no design
  or prototype artifacts by default.
- Existing non-greenfield feature: run only stages touched by the change;
  skip/brief already-decided product, UI, visual design, prototype, and backend
  sections with evidence; run vertical slices/evals if implementation is
  requested.
- Existing UI feature: product brief if problem/success criteria are unclear;
  UI flow only if navigation/state changes; visual design only if surface/style
  changes or user needs style choice; prototype tech/prototype only if requested
  or risky UX needs validation; backend/infra only if
  API/schema/auth/storage/realtime/infra changes; vertical slices/evals for
  delivery planning.
- Backend/API/infra: product brief; UI/visual-design/prototype tech/prototype
  n/a unless user-facing flow/design is part of the request; backend/infra tech
  run; vertical slices/evals run for build planning.
