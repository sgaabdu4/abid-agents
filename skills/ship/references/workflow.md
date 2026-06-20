# Ship Workflow Details

## Plan Schema

`docs/ship-plan.md`:

```md
# Ship Plan: <feature>
## Spec
<what + why>
## Constraints
- <user rules + discovered constraints>
## Edge cases
- <must-handle>
## Tasks
### task-1: <name>
- branch: `ship/<feature>/task-1-<slug>`
- exclusive_files: [...]
- shared_files: [...]
- depends_on: [...]
- spec: <2-3 sentences>
- tests: <cases/files>
- acceptance: <green gates>
## Merge order
<topological waves; no same-wave shared file writes>
## Test plan
<per-task + integration smoke>
```

Validate no `exclusive_files` conflicts, cycles, missing tests, or same-wave shared-file collisions. Run advisor if available.

## Discovery Agents

Default: architecture, edge-case hunter, reuse auditor, staff engineer, QA. Add Flutter, React/Next, web UI, Appwrite, security, perf, or UX reviewers only when the stack/surface changed. Cap parallelism at 5.

## Dispatch Prompt

Each worktree gets `TASK.md` with the task block and expanded commands:

```text
Read ../../docs/ship-plan.md.
Write only exclusive_files plus append/register-only shared_files.
TDD when practical.
Run listed gates.
Commit on green.
Final line: DONE or BLOCKED: <reason>.
```

## Worktrees

Create from latest `BASE_BRANCH`:

```bash
git worktree add .claude/worktrees/ship-<task-id> -b ship/<feature>/task-<id> "$BASE_BRANCH"
```

Run subprocess output to files, not raw context. Monitor each task separately.

## Merge Gate

For each completed task:

1. Rerun task tests/lint/typecheck in the worktree.
2. Rebase on `BASE_BRANCH`.
3. In main checkout, fast-forward merge task branch into `BASE_BRANCH`.
4. Remove clean worktree and delete task branch.

If red/conflict/block: keep worktree, log in `docs/ship-report.md`, continue independent tasks.

## Recovery

- Dirty start: ask user commit/stash.
- Agent error: retry once, then skip with note.
- Partition conflict/cycle: repartition before user gate.
- User abort: delete plan and stop.
- Tests red/conflict: hold worktree and report.
