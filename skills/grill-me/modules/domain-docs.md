# Domain docs module

Load only for existing-code/doc-backed grilling, fuzzy domain terms, ADR
conflicts/candidates, or final synthesis that may update docs.

## Read pass

- If repo/docs exploration is already needed, silently check for
  `CONTEXT-MAP.md`, `CONTEXT.md`, relevant `docs/adr/`, and context-local ADRs
  near the touched area. Missing docs are not a blocker; do not ask to create
  them up front.
- Use glossary vocabulary in questions, plans, issue/brief titles, tests, and
  artifacts. Respect `_Avoid_` synonyms.
- If user claims, code, glossary, or ADRs conflict, surface the conflict with
  evidence. Ask one Q only when the conflict blocks the next decision.

## Active refinement

- Treat fuzzy terms as product/code risk. Capture the canonical term, one or two
  sentence definition, avoided synonyms, and boundary.
- Stress domain relationships with concrete scenarios: cardinality, lifecycle
  status, empty state, delete/archive behavior, ownership, permissions, and
  cross-context handoff.
- Cross-check user statements against code/docs before asking what evidence can
  answer.

## Capture

During interview, do not edit `CONTEXT.md` or ADRs unless the user asks. Record
confirmed terms and ADR candidates in `session_state.md`, `plan_draft.md`, a
stage handoff, or final plan, whichever is active.

Use this compact format:

```md
Domain term: <Term> - <tight project-specific meaning>
Avoid: <synonyms to avoid | none>
ADR candidate: <title> - hard to reverse: <yes/no>; surprising: <yes/no>;
tradeoff: <yes/no>; decision: <short decision>
```

## Synthesis

- `CONTEXT.md` is a glossary only. Keep definitions project-specific, tight, and
  free of implementation decisions.
- Write or update glossary terms only when confirmed by the user or evidence.
- Offer/create an ADR only when all are true: hard to reverse, surprising
  without context, and a real tradeoff.
- Keep ADRs short: decision title plus one to three sentences of context,
  decision, and reason. Add options/consequences only when they carry value.
