# Orchestration module

Load after mode inference when conducting a grill-me session, resuming a draft,
closing a stage, or writing the final plan.

## Before Qs

- If user says greenfield/new app/empty repo, skip repo research and ask Q1
  immediately. Do not run CBM/context-mode/list/index/architecture first.
- For greenfield, infer code reality from the user; optionally note `greenfield
  assumed` in draft after the user answers.
- If existing code matters or user asks to modify/review existing code, ground
  the session in the actual request + repo.
- Existing code path: use CBM first (`list_projects` -> status/index ->
  architecture -> search/trace), then read relevant code/docs before asking.
- Do not ask what code can answer. Inspect only for existing-code tasks.
- Q1 must resolve the highest-impact unknown that request context cannot answer.
- No evidence = `unknown`.
- No codebase = do not research; ask a request-specific product/constraint Q.

## Intake

Goal: build a stage map inside the inferred mode cap, not solve everything.
Ask one Q at a time.

First Q rules:
- Start from the user's concrete ask. Do not open with generic "what are we
  building?" if the ask names it.
- If a slug/title is inferable from the ask, infer it; ask only if ambiguous or
  conflicting.
- Prefer a domain/tech decision tied to the target area, e.g.
  screen/route/entity/API boundary/data source/success metric.
- Generic intake Qs are allowed only when they unblock all later work and cannot
  be inferred from request/code.

Stage skipping:
- Skip sections aggressively when request + code evidence show they are
  irrelevant or already decided.
- For `skip`/`n/a`, record reason/evidence in Stage Map only; do not create a
  stage file.
- Use `brief` only when a lightweight decision record is useful; do not ask
  full-stage Qs for `brief`.
- Use `n/a` when a stage cannot apply, e.g. backend-only work has no
  UI/prototype stage.
- Use `run` only for unresolved decisions, requested artifacts, risky UX/API
  choices, or changed surfaces.

Classify:
- Work type: product, feature, redesign, refactor, API/schema, infra, launch.
- Code reality: greenfield or existing.
- UI need: user-facing UI or backend-only.
- Runtime: web, Flutter, native, desktop, CLI, API.
- Visual design mode: 2-4 style directions, styled key screens, existing design
  system, skip, n/a.
- Prototype tech stack: target frontend/runtime, existing app stack, static
  HTML/CSS, Flutter/native, skip, n/a.
- Prototype mode: mock-data clickable/local flow, existing prototype, skip, n/a.
- Mock-data scope: happy, empty, loading, error, permission, offline/failure.
- Tech split: prototype/frontend tech stack before prototype; backend/infra
  stack after prototype approval.
- Certainty: fixed vs undecided.
- Delivery plan: vertical slices, task waves, acceptance criteria,
  verification/evals.
- Desired artifact: product plan, impl plan, visual design directions, styled
  prototype, implementation plan, all.

## Files

- Ensure `docs/planning/<slug>/`; infer slug from request when safe. Ask only if
  ambiguous/conflicting.
- Orchestrator draft: `docs/planning/<slug>/plan_draft.md`.
- Temp stage handoffs: create lazily only when a stage closes, an artifact is
  written, or final plan synthesis needs it; never for simple Q&A turns; never
  for `skip`/`n/a`.
  - Intake: `docs/planning/<slug>/stages/00-intake.md`.
  - Product: `docs/planning/<slug>/stages/01-product.md`.
  - UI flow: `docs/planning/<slug>/stages/02-ui-flow.md`.
  - Visual design: `docs/planning/<slug>/stages/03-visual-design.md`.
  - Prototype tech stack: `docs/planning/<slug>/stages/04-prototype-tech.md`.
  - Prototype: `docs/planning/<slug>/stages/05-prototype.md`.
  - Backend/infra tech: `docs/planning/<slug>/stages/06-backend-tech.md`.
  - Vertical slices/evals: `docs/planning/<slug>/stages/07-vertical-slices.md`.
- Final plan: `docs/planning/<slug>/plan.md` - canonical, self-contained.
- Do not create `docs/planning/<slug>/stages/99-final-plan.md`; final synthesis
  lives in `plan.md`.
- Legacy compatibility: if old draft/handoff paths exist, read them, copy needed
  content into `plan.md` or current temp paths, then delete temp duplicates when
  safe.
- Web visual design concepts: `docs/planning/visual-design/<slug>/`.
- Web prototypes: `docs/planning/prototypes/<slug>/`.
- Flutter visual design concepts: prefer `lib/visual_design/<slug>/` or
  `lib/main_visual_design.dart`.
- Flutter prototypes: prefer `lib/prototypes/<slug>/` or
  `lib/main_prototype.dart`.
- Mock data: keep near prototype (`mock-data.*`, `fixtures.*`, or
  `mock_data.dart`).
- File edits via native file tools only; shell/context-mode only run/verify.
- During interview, update only `plan_draft.md` as a tiny answer log. Do not
  update stage handoffs per question.

## Handoff model

- Fast interview mode is default.
- While asking Qs, do not create/update stage handoffs. Append only the user's
  answer + confirmed decision to `plan_draft.md`.
- Create a stage handoff only when:
  - leaving a stage and the summary is needed for the next stage,
  - an artifact exists (visual design/prototype/etc.),
  - risk/control details cannot fit in the tiny draft,
  - user asks for docs/status,
  - final plan synthesis starts.
- Handoffs are compact summaries, not transcripts. Copy decisions from the
  draft; do not restate every option/suggested default.
- `skip`/`n/a` stages have no handoff.
- If a handoff conflicts with user answers, ask one Q; do not silently choose.
- If a module asks for many handoff details, treat that as final synthesis
  guidance. Interim handoff max: status, decisions, open blockers, artifacts,
  next.

## Clarification depth

- Full clarification beats speed. There is no question-count limit.
- Still ask one Q at a time. Ask as many one-by-one Qs as needed.
- Fast interview mode means minimal docs, not fewer questions.
- Do not move to the next stage while important unknowns remain.
- A stage is clear only when the needed user behavior, boundaries, constraints,
  non-goals, acceptance checks, and risky edge cases are decided or explicitly
  parked by the user.
- If an answer creates a contradiction, vague term, missing decision, or
  risk/control gap, ask another Q immediately.
- Final `plan.md` may contain unknowns only when the user explicitly says to
  leave them unknown/later.

## Stage clarity gates

Internal only. Ask Qs until each active stage gate passes or the user explicitly
parks an unknown.

- Intake: goal, target users, runtime/platform, requested artifact, and hard
  constraints are clear enough to start.
- Product: user/job, MVP, non-goals, success/fail checks, constraints, and
  high-risk edge cases are clear.
- UI flow: entry points, main path, empty/loading/error/success states,
  permissions, and recovery paths are clear.
- Visual design: style direction, target key screens/flow moments, theme/color
  strategy, typography/density, accessibility constraints, and review method are
  clear.
- Prototype tech stack: runtime, mock boundary, mock data shape, preview method,
  and fidelity gaps are clear.
- Prototype: covered states, mock data, minimal token/component system, artifact
  path, preview status, and approval/blockers are clear.
- Backend/infra: data ownership, auth/roles, APIs/events/notifications, storage,
  deploy/env, rollback, and observability are clear.
- Vertical slices/evals: slice order, dependencies, acceptance checks,
  verification, parallel-safe waves, and risk controls are clear.

## Artifact depth

- Do not ask the user to choose `lite`, `build-plan`, or `full` upfront when the
  request already implies depth.
- If the user explicitly says `lite`, `align`, `build-plan`, `full`, or
  `review`, use that as the starting cap.
- Infer artifact depth from the conversation and what the user asks for.
- During interview, gather decisions first; the output shape emerges from
  answers.
- Near synthesis, if the needed artifact is still unclear, ask one plain Q:
  "What should I produce next?" with options like decision summary,
  implementation plan, visual design/prototype, or full spec.
- Default to the smallest useful artifact that satisfies the user's goal; expand
  only when implementation/risk/detail requires it.

## Stage close refinement

- At the end of each stage, refine before moving on.
- Refinement = convert the answer ledger into a compact stage summary/handoff or
  compact draft section.
- Refine only after the clarity gate passes, or after the user explicitly parks
  remaining unknowns.
- If refinement reveals a blocker, ask one clarification Q using the terminal
  card, then refine again.
- Repeat one-at-a-time clarification until the blocker is resolved or the user
  parks it.
- If no blocker, silently write the compact refined summary and immediately ask
  the first Q of the next stage.
- Do not paste the refined doc to the user unless they ask; just continue the
  interview.

Draft minimum:

```md
# <Title> Draft

## Current
- Stage: <stage>
- Next: <plain next Q>

## Answers
| # | Question | Answer |
|---|---|---|
| <N> | <plain question> | <user answer> |

## Decisions
- <confirmed decision>
```

Draft rules:
- `plan_draft.md` is an answer ledger, not a plan. Target <= 60 lines / 4 KB.
- Record only: current stage, next Q, user answers, confirmed decisions.
- Do not store recommendations, rejected options, definitions, evidence,
  scenarios, acceptance criteria, verification, risks, or stage maps during
  interview.
- If the draft grows too long, summarize older answers into short decisions and
  keep asking.
- Detailed rationale belongs only in final `plan.md` or a stage handoff created
  at stage close.

## Stage flow

Run only stages mapped `run` or `brief`. Treat stages as interview phases, not
doc-writing phases.

1. Intake - ask Qs; update only answer ledger; refine at stage end.
2. Product plan - load `modules/product.md`; ask Qs; update only answer ledger;
   refine at stage end.
3. UI flow - load `modules/ui-flow.md`; ask Qs; update only answer ledger;
   refine at stage end.
4. Visual design - load `modules/visual-design.md`; choose 2-4 style directions
   and write styled key-screen/flow concepts when needed; compact artifact note;
   refine at stage end.
5. Prototype tech stack - load `modules/prototype-tech.md`; ask Qs; update only
   answer ledger; refine at stage end.
6. Mock-data prototype - load `modules/prototype.md`; write artifact when
   approved; compact artifact note; refine at stage end.
7. Backend/infra tech stack - load `modules/backend-tech.md`; ask Qs; update
   only answer ledger; refine at stage end.
8. Vertical slices/evals - load `modules/vertical-slices.md`; ask Qs; update
   only answer ledger; refine at stage end.
9. Final plan - load `modules/final-plan.md` only when user wants the plan or
   interview is done. Synthesize answers into `plan.md`; create handoffs only if
   needed for artifacts/risk traceability.

Do not create `00-intake.md`-`07-vertical-slices.md` just because a stage is
active; create/refine the relevant handoff only at stage end or
artifact/final synthesis.

## Loop

Each turn:
1. If first turn + greenfield/new app/empty repo: ask Q1 immediately; no repo
   research, no CBM, no indexing.
2. If continuing, read `plan_draft.md` only. Do not read/write stage handoffs
   unless closing a stage, using artifacts, or finalizing.
3. If existing code matters, perform codebase grounding before Q1.
4. If intake incomplete, ask the most relevant unanswered intake Q; never a
   boilerplate Q when request context points elsewhere.
5. Else load only the relevant stage module; do not load
   `modules/stage-handoff.md` unless writing a handoff.
6. Ask next stage Q using `modules/questions.md`.
7. Visible reply during interview = question only. Do not paste
   draft/status/handoff unless user asks.
8. After user answers, append/update one row in `plan_draft.md` and one short
   decision if confirmed.
9. If the stage is not fully clear, ask the next clarification Q immediately. No
   question-count limit.
10. If the stage is fully clear, refine the stage summary/handoff now. If
    refinement exposes a blocker, ask one clarification Q and repeat.
11. Ask next Q immediately after the minimal write/refinement.
12. Keep all metadata out of the draft until final plan/handoff synthesis.

## Global rules

- Never batch Qs.
- Ask as many one-by-one Qs as needed for full clarification; do not optimize for
  fewer questions.
- Greenfield means question-first: no repo research, no indexing, no
  architecture scan unless user asks.
- During interview, visible reply is only the next question; no draft/status
  summary unless user asks.
- During interview, docs are answer-ledger only. No stage handoffs, stage maps,
  risks, evidence, or acceptance criteria in `plan_draft.md`.
- Intake before skipping stages unless code proves n/a; after intake, skip any
  non-needed stage with evidence.
- `skip`/`n/a` stages create no stage file; final plan carries their evidence if
  needed.
- If user answers `all/both/all important`, accept it when feasible; do not
  re-ask the same ranking. Next Q must ask a concrete behavior, boundary, or
  risk control.
- Visual design is an impeccable-backed selection gate: run/load impeccable
  setup, create or refresh PRODUCT.md via teach when missing, offer DESIGN.md
  via document when missing, show 2-4 meaningfully different styled directions,
  let the user pick/merge/customize/accept default, then build the full-flow
  prototype in that chosen style.
- Full-flow UI prototypes are token-first and atomic by default: minimal
  semantic tokens, atoms, molecules, organisms/templates, pages; reuse
  components across states and keep the taxonomy proportional to the prototype.
- No full-flow UI prototype before visual direction is chosen and prototype tech
  stack is decided, unless the user explicitly says to skip visual design.
- No backend/infra tech stack before product + UI flow + visual design alignment
  + approved prototype when prototype runs.
- No backend/API/auth/storage/realtime integration before the mock-data prototype
  is approved.
- No final plan until every `run`/`brief` stage is fully clarified: acceptance
  criteria + verification/eval strategy + risky edge cases, or an explicit
  user-approved parked unknown.
- Final plan must be self-contained: summary, decisions, Q&A, artifact refs,
  acceptance criteria, verification/evals, risks, unknowns, traceability.
- Do not write `99-final-plan.md`; write `plan.md` only.
- Schema/data/auth/security/deploy/stateful changes require human review gate,
  rollback/migration notes, and telemetry/audit expectations.
- Resolve parent decisions before child decisions.
- Replace fuzzy terms with canonical terms.
- Surface contradictions with evidence.
- Within the inferred mode cap, do not stop early. Skip irrelevant stages;
  continue until answers/decisions are enough for the requested artifact.
- Stop at the inferred mode cap. A capped `align` session can finish with a plan
  after options, risks, and validation are clear; it must not drift into visual
  design, prototype, or build planning unless the user expands scope.
- Finish only after final plan write, self-contained verification, and cleanup
  of temp draft/handoffs that were safely absorbed.
