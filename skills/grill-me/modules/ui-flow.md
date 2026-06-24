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
- Low-fi Lavish review when text cannot resolve the flow.

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
- Lavish/wireflow path + status when used.
- Next-stage handoff for visual design only when useful.

Clarity gate:
- Parent screens/routes named.
- Primary journey ordered.
- Required states captured.
- Permissions/auth gates named or marked n/a.
- Any needed visual flow artifact is reviewed, or explicitly skipped.

## Q pattern

Use `modules/questions.md`. Ask one route/state/permission/recovery decision at
a time. If text is insufficient, create a low-fi Lavish wireflow first; show
artifact/status, then ask one flow Q.

## Rules

- Parent routes/screens before child components.
- Name exact route/screen/state.
- Include empty/loading/error/permission states before visual design.
- Lavish UI-flow artifacts are wireflows/maps, not visual direction or
  prototype. Use existing routes/components/tokens when available; otherwise
  mark them representative.
- For Lavish wireflows, read
  `vendor/skill-upstreams/lavish-axi/skills/lavish/SKILL.md` and playbooks
  `diagram`, `comparison`, and `input`.
- Fix Lavish `layout_warnings` before asking the user to review.
- Do not update `02-ui-flow.md` per Q; record answers in `plan_draft.md` and summarize only at stage close/final synthesis.
- No tech-stack/backend choices here except route/runtime facts from existing code.
