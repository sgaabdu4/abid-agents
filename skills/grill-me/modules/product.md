# Product module

Use for product plan stage when mapped `run` or `brief`. During Q&A, update only `plan_draft.md`; write `01-product.md` only at stage close, user request, or final synthesis.

## Scope

Decide:
- Problem = pain/user job.
- User = who has the problem.
- Value prop = why this beats current workaround.
- MVP = smallest useful release.
- Non-goals = explicit exclusions.
- Success metric = observable outcome.
- Acceptance criteria = observable pass/fail conditions for MVP.
- Verification plan = tests/prototype/manual/eval checks that prove acceptance criteria.
- Assumptions = believed true but unproven.
- Constraints = time, budget, policy, data, platform.

Out of scope:
- Screen layout.
- Backend implementation.
- Final plan synthesis.

## Stage handoff plan

At stage close/final synthesis, `01-product.md` includes only relevant decisions:
- Product summary.
- Target user.
- Problem/job.
- MVP.
- Non-goals.
- Main pass/fail checks.
- Assumptions/constraints.
- Acceptance checks and verification only when known or needed.
- Product risks only when they affect decisions.
- Next-stage handoff for UI flow only when useful.

Clarity gate:
- User/problem clear enough for UI flow.
- MVP/non-goals defined.
- Success metric named or explicitly unknown.
- Assumptions and constraints captured.
- Acceptance criteria cover happy/fail/edge cases or blocker is named.
- Verification plan names tests/prototype/manual/eval path or blocker is named.

## Q pattern

Ask one parent decision at a time. Show a clear user-facing terminal card. Keep acceptance criteria, verification, evidence, and scenario details for stage close or final synthesis.

```text
Q<N>: Which <plain outcome/choice> matters here?

Meaning:
<explain the decision in one sentence, using the user's domain>

Why it matters:
This sets what must work before real users try it.

Suggested default:
<A/B/C> — <one clear reason>

Options:
A) <plain option tied to an observable outcome>

B) <plain option tied to an observable outcome>

C) <plain option, "all", or "Not sure — use the default">

Reply: A/B/C, "all", "use default", "not sure", "skip for now", or your own answer.
```

Internal notes for stage close/final synthesis: definitions, options/tradeoffs, acceptance criteria, verification/eval, evidence, why, scenario.

## Rules

- Define product terms in the handoff; expose only unavoidable terms in `Details (optional)`.
- Show tradeoffs as clear standalone options, not essays.
- If a term is fuzzy, canonicalize it in Decisions.
- Do not update `01-product.md` per question; record answers in `plan_draft.md` and summarize here only at stage close/final synthesis.
- Do not enter UI flow until product gate is `accepted`/`brief`, or the user explicitly parks/skips product decisions.
