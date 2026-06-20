---
name: ship
description: >-
  Plan, refine, implement, verify, and merge a feature through isolated
  worktrees with user-gated planning and wave-based task dispatch.
---

# Ship

Codex-native feature pipeline. Use only when invoked explicitly with `$ship` or when the user asks for this workflow.

## Guardrails

- Stop between phases on failure.
- Start from the current branch as `BASE_BRANCH`; never assume `main`.
- Dirty tree at start -> stop and ask.
- User gate is mandatory after plan synthesis and before dispatch.
- Never push, force-push, bypass hooks, or auto-merge to protected/default branches without explicit confirmation.
- Worktrees write only assigned `exclusive_files` and append/register-only `shared_files`.

## Phases

1. Bootstrap: index repo, detect stack, discover test/lint/typecheck commands, capture `BASE_BRANCH`.
2. Discovery: parallel agents when available for architecture, edge cases, reuse, staff review, QA, plus stack-specific reviewers.
3. Synthesis: write `docs/ship-plan.md` with spec, constraints, edge cases, task partitions, tests, merge order, and dispatch waves.
4. Refine: show summary and advisor notes; loop until user approves or aborts.
5. Dispatch: create one worktree per task, process waves serially, run tasks in parallel within a wave.
6. Merge gate: rerun task checks, rebase on latest `BASE_BRANCH`, fast-forward merge green tasks, hold failed/conflicted worktrees.
7. Report: write `docs/ship-report.md` with merged commits, held tasks, smoke result, and next steps.

## Details

Read `references/workflow.md` before Phase 2. It contains the plan schema, dispatch prompt, merge commands, failure recovery table, and report format.
