# Workflow Route Map

## Core Path

| Stage | When | Do | Proof |
| --- | --- | --- | --- |
| Clarify | Outcome, scope, or risk is unclear. | Use `grill-me`; inspect code evidence when code affects the answer. | One resolved next question or an accepted plan. |
| Brief | Work is understood enough to shape. | Use a short plan, `to-prd`, or `to-issues` based on size. State readiness as `PASS`, `CONCERNS`, or `FAIL`. | Outcome, owner, blast radius, proof path, and risk routing are known. |
| Workspace | Implementation will start. | Create a feature branch or Treehouse worktree. | Work happens in an isolated branch/worktree. |
| Implement | Code changes are needed. | Use `codebase-design`; add exact specialist skills by touched area. | Root owner changed, not wrappers or temporary modes. |
| Prove | Behavior changed. | Use `test-quality`; use `e2e` when a user flow changed. | Tests or real UI proof with artifacts, a regression command, and a 2x video for UI or phone E2E. |
| Review | Meaningful code changed. | Use `thermo-nuclear-code-quality-review`; add risk reviews only when relevant. | No blocking maintainability, security, performance, or framework issues remain. |
| Ship | Work is committed. | Use `no-mistakes`. | Automated review, checks, PR, and CI evidence. |

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
- a support tool is being treated like a workflow stage
- `no-mistakes` is being used before implementation proof
- BMAD persona/menu-code wording hides the local skill route

Reroute to `grill-me`, `to-prd`, or `to-issues` when scope is unclear.
Reroute to `codebase-design` when owner or abstraction shape is unclear.
Reroute to `no-mistakes` only after committed implementation work is ready for the gate.
