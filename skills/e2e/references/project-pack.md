# Project Pack

Use this before the first E2E run in a repo and before reusing saved auth, flows, or log commands.

## Purpose

Persist the boring first-run knowledge in the project so future E2E checks start from known safe defaults instead of rediscovering login, target URLs, critical flows, and logs.

## Files

```text
docs/e2e/
  project.json
  auth.md
  logging.md
  regression.md
  issues.md
  flows/README.md
```

`project.json` is the index.
Markdown files hold human-readable setup, safe test data, flow notes, and commands.
Do not store passwords, tokens, cookies, private session dumps, or real customer data.

## First Run

Run:

```bash
node <skill-dir>/scripts/scaffold-e2e-project.mjs --root <repo>
node <skill-dir>/scripts/check-e2e-project.mjs --root <repo>
```

Then fill only what the current run can verify:

- target URL or start command;
- login method and test account owner, without secrets;
- reusable authenticated-state path when safe and intentionally saved;
- critical flows, especially login, primary happy path, settings/account, and write-heavy areas;
- console/server/network log commands;
- regression commands that should run after E2E fixes.

## Reuse Rule

Every later E2E run checks `docs/e2e/project.json` first.
If the pack exists, reuse known target, auth notes, flows, log commands, and regression commands before asking the user.
If the pack is incomplete, update it from verified facts only and mark unknowns plainly.

## Auth State

Saved auth state is allowed only as a path reference to a safe local artifact.
The repo pack may say where state is expected, but it must not commit raw cookies, tokens, or credentials.

## Logs

Capture logs for each run when available:

- browser console and network errors;
- dev server output;
- mobile/device logs;
- existing test runner output;
- app-specific audit/event logs when safe.

The final report must say which logs were captured and which were unavailable.
