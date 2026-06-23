# Workflow Route Map

## Core Path

| Stage | When | Do | Exit |
| --- | --- | --- | --- |
| Plan | New feature or unclear work starts. | Create a Treehouse worktree before planning/coding. Use `grill-me` when outcome, scope, proof, or risk is unclear. Pick the lightest artifact: none, `to-prd`, `to-issues`, or both. State `PASS`, `CONCERNS`, or `FAIL`. | Owner, blast radius, proof path, risk routing, and next action are known. |
| Implement | Readiness is `PASS` and code changes are needed. | Change the canonical owner. Use `codebase-design` only when owner or abstraction shape is unclear. Add exact specialist skills by touched area. | Root owner changed, not wrappers, temporary modes, hidden fallbacks, or weak validation. |
| Verify loop | Implementation or review fixes changed behavior. | Run targeted tests and use `test-quality` for test design or gap review. Run `security-review` or `performance-rescue` when requested or when those risks were touched, then `thermo-nuclear-code-quality-review`, then `e2e` last when a user-visible flow changed. Loop back to Implement until tests, reviews, and required E2E are clean. | Affected proof was rerun, no known blockers remain, and required artifacts exist. |
| Final gate | Local verify loop is clean and work is committed. | Use `no-mistakes`; respond to its findings through its own loop. | Automated review, checks, PR, and CI evidence. |

## Exact Specialist Routing

| Touched area | Use |
| --- | --- |
| UI/components/design polish | `atomic-ui` + `impeccable` |
| React/Next.js | `react-doctor` + `fallow` + `vercel-react-best-practices` |
| Flutter/Dart app | `building-flutter-apps` |
| Appwrite | `appwrite-backend` |
| Sentry/observability | `sentry-workflow` |
| Security/auth/secrets/data exposure | `security-review` |
| Performance/latency/bundles/queries | `performance-rescue` |
| PDF/deck/report artifact | `create-pdf` |
| Product video/demo | `product-demo-video` |
| Current web research or URLs | `tavily-cli` |

## Correct Course

Stop and reroute when:

- scope expands mid-implementation
- the owner or blast radius is unknown
- new feature work has no Treehouse worktree
- a support tool is being treated like a workflow stage
- `no-mistakes` is being used before the local verify loop is clean and committed
- BMAD persona/menu-code wording hides the local skill route

Reroute to `grill-me`, `to-prd`, or `to-issues` when scope is unclear.
Create the Treehouse worktree before feature planning/coding.
Reroute to `codebase-design` when owner or abstraction shape is unclear.
Reroute back to Implement when tests, review, or E2E find blockers.
Reroute to `no-mistakes` only after committed implementation work is ready for the gate.
