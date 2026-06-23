---
name: no-mistakes
description: Validate your code changes through the no-mistakes pipeline - automated code review, tests, lint, docs, push, PR, and CI - before they reach the configured push target. Use when the user asks to run no-mistakes, gate or ship or validate their changes, push safely, asks you to do a task and then validate it, or invokes /no-mistakes.
user-invocable: true
---

# no-mistakes

Use `no-mistakes` when the user asks to validate, gate, ship, push safely, open
or update a PR through the no-mistakes process, or invokes `/no-mistakes`.

Read `references/axi-workflow.md` before starting, resuming, or responding to a
pipeline run.

Read `references/pr-evidence.md` before finalizing any PR-backed run.

## Non-negotiables

- Run `no-mistakes axi` first and respect any active run state.
- Work must be committed on a feature branch before `axi run` validates it.
- Pass a rich `--intent` in the user's words, including product decisions that
  are not obvious from the diff.
- At gates, let the pipeline own its findings and fixes. Use `axi respond`
  instead of manually editing while the run is waiting.
- Escalate `ask-user` findings verbatim unless the user gave clear unattended
  consent such as `--yes`.
- On `checks-passed` or `passed`, report what was validated, what was found,
  and every pipeline fix applied.
- Before finalizing a PR-backed run, repair the PR evidence section so it has
  hosted screenshots, no local paths, and clear screenshot and no-mistakes
  status.
- Only check GitHub review threads after external PR review has run or the user
  explicitly asks for comment handling.

## Common commands

```sh
no-mistakes axi
no-mistakes axi run --intent "<user goal and relevant decisions>"
no-mistakes axi respond --action fix --findings <ids>
no-mistakes axi respond --action approve
no-mistakes axi status
no-mistakes axi logs --step <name> --full
node "$HOME/.agents/skills/no-mistakes/scripts/repair-pr-evidence.mjs"
```

If a command fails, read the returned `help` lines and continue from the exact
state reported by `no-mistakes`.
