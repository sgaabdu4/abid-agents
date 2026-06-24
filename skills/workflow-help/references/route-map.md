# Workflow Route Map

## Core Path

| Stage | When | Do | Exit |
| --- | --- | --- | --- |
| Plan | New feature or unclear work starts. | Create a Treehouse worktree before planning/coding, then run `"$HOME/.agents/scripts/ensure-worktree-ready.sh" <path>`. Use `grill-me` when outcome, scope, proof, or risk is unclear. For UI choices that cannot be judged from text, use Lavish inside Grill Me as a visual review surface. Pick the lightest artifact: none, `to-prd`, `to-issues` only for missing agent-ready slices, or both. State `PASS`, `CONCERNS`, or `FAIL`. | Owner, blast radius, proof path, risk routing, and next action are known. |
| Implement | Readiness is `PASS` and code changes are needed. | Change the canonical owner. Use `codebase-design` only when owner or abstraction shape is unclear. Add exact specialist skills by touched area. | Root owner changed, not wrappers, temporary modes, hidden fallbacks, or weak validation. |
| Verify loop | Implementation or review fixes changed behavior. | Run targeted tests and use `test-quality` for test design or gap review. Run `security-review` or `performance-rescue` when requested or when those risks were touched, then `thermo-nuclear-code-quality-review`, then `e2e` last when a user-visible flow changed. Loop back to Implement until tests, reviews, and required E2E are clean. | Affected proof was rerun, no known blockers remain, and required artifacts exist. |
| Final gate | Local verify loop is clean and work is committed. | Run `"$HOME/.agents/scripts/ensure-worktree-ready.sh" .`, then use `no-mistakes`; respond to its findings through its own loop. Dry-run push only counts after project hooks are active. | Automated review, checks, PR, and CI evidence. |

## Exact Specialist Routing

| Touched area | Use |
| --- | --- |
| UI/components/design polish | `atomic-ui` + `impeccable` |
| UI flow or visual decision artifact | `lavish-axi` as a support tool inside `grill-me`; load `vendor/skill-upstreams/lavish-axi/skills/lavish/SKILL.md` |
| React app/Next.js | `react-doctor` + `fallow` for JS/TS health; include `fallow dupes` / clone-group checks for duplication or copy-paste; use `vercel-react-best-practices` for performance/composition |
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
- `to-issues` is being treated as required when the accepted `plan.md` already has vertical slices or task waves
- a support tool is being treated like a workflow stage
- `no-mistakes` is being used before the local verify loop is clean and committed
- push dry-run is trusted before `ensure-worktree-ready.sh` proves project hooks
- BMAD persona/menu-code wording hides the local skill route

Reroute to `grill-me`, `to-prd`, or `to-issues` when scope is unclear or required artifacts are missing.
Create the Treehouse worktree before feature planning/coding.
Run `"$HOME/.agents/scripts/ensure-worktree-ready.sh"` after worktree creation and before `no-mistakes`.
Reroute to `codebase-design` when owner or abstraction shape is unclear.
Reroute back to Implement when tests, review, or E2E find blockers.
Reroute to `no-mistakes` only after committed implementation work is ready for the gate.
