---
name: he-plan
description: Use for /he:plan; stage 1 readiness with Treehouse, Grill Me, owner, proof path, PASS/FAIL.
---

# he-plan

Stage 1/5. Use for `/he:plan` before implementation. Finish the gate; do not timebox it.

Read `../workflow-help/references/route-map.md`, `../treehouse/SKILL.md`, and `../grill-me/SKILL.md` before acting. Also read existing `PRODUCT.md`, `DESIGN.md`, and the project token/design-system owner when present.

## Contract

- Create/update `he-state.json`; every internal step updates `steps[]`; every concern/failure updates `findings[]`; validate it before any ready-yes handoff
- Before `PASS`, run `check-project-context-gates.mjs --require-all`; ensure `PRODUCT.md`, `DESIGN.md`, and the token/design-system owner exist and are current. Product changes update `PRODUCT.md`; design/UI/token changes update `DESIGN.md` and the token owner. Put their paths/status in the plan artifact and `he-state.json.context`
- Reduce context rot by treating `he-state.json` as the resume source. Record only current state, receipts, open findings, guardrails, artifacts, and next-stage readiness; do not depend on transcript memory
- Treehouse + `ensure-worktree-ready.sh` gate non-trivial work; skip only small clear work
- Use `grill-me` when outcome, scope, proof, risk, UI flow, or visual direction is unclear; do not duplicate its workflow. Let Grill Me own `session_state.md`, stage map, and one-question loop, then record only the decision, blocker, or artifact path in `he-state.json`
- For unclear UI, use Grill Me UI flow or visual design stages with `atomic-ui` + `impeccable`; ask as many one-by-one Qs as needed until aligned or explicitly parked
- Choose none, `to-prd`, `to-issues`, or both only after Grill Me/artifact needs are resolved
- Failure loop: stay in `he-plan` until missing owner, scope, proof, or risk is resolved
- Exit with the stage receipt: state path, decision, owner/proof, artifacts, blocker, and `Next: ready for /he:implement: yes/no`. No transcript dump; next stage can start a fresh thread from state
