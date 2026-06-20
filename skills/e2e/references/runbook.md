# E2E Runbook

## Artifacts

```text
docs/e2e/<RUN_ID>/
  state.json
  plans/INDEX.md
  plans/<flow>.md
  issues.md
  screenshots/<flow>/<step>_<status>.png
  report.md
```

`state.json` tracks run id, scope, stack, mode, fix policy, screenshot policy, risk limits, device/url/session/process ids, flow statuses, tool-call counts, and retry counts.

## Setup

1. Create `RUN_ID=${PI_SESSION_ID:-$(date -u +%Y%m%dT%H%M%SZ)}`.
2. Make artifact dirs.
3. Index/map code with CBM first.
4. Detect stack from target plus `pubspec.yaml`/`package.json`.
5. Gate tools: Flutter UI driver/device and analyzer, or browser automation for web.
6. Boot app: reuse supplied URL/server when live; otherwise start a dev server and store its process id.

## Discovery

- `full`: graph routes/screens/views; prioritize auth, checkout/payment, settings/account, write-heavy flows, recent incidents.
- `diff`: changed files/symbols -> inbound dependency trace depth 4 -> impacted screens/routes.
- specific target: one rooted flow plus downstream screens/actions.

## Plan Template

Each flow plan should be 5-12 steps. Include only relevant axes:

- happy path
- inputs and validation
- loading/empty/error/offline state
- navigation/deep links/auth gates
- concurrency/network/timeout/session expiry
- permissions/roles

Use `[ ]`, `[x]`, and `[~] (n/a/spec: reason)`.

## Runner Prompt

```text
Run E2E flow <flow>.
plan-file: <ARTIFACTS>/plans/<flow>.md
issues-file: <ARTIFACTS>/issues.md
screenshot-dir: <ARTIFACTS>/screenshots/<flow>/
screenshot-policy: <fail|all>
run-id: <RUN_ID>
device-id/dev-url/session-name: <value>
risk-limits: <limits>

Drive real UI only. Per step: action -> settle -> verify -> screenshot if policy.
Tick [x] only with UI tool evidence. Halt on first FAIL, append issue, return <=150 words: status, counts, UI tool-call count, screenshot paths.
```

## Issue Block

Append atomically:

```md
## <flow>/<step> - <RUN_ID>
Step: <plan line>
Repro: <minimal sequence>
File hint: <screen/component:line via trace>
Logs: <short decisive lines>
Screenshot: <path>
Tool calls so far: <N>
Category: regression | spec-gap | flake
Proposed fix: <one line>
- [ ] resolved
```

## Triage

- Regression: app error/log/stack or changed file involvement.
- Spec-gap: expected UI absent and no app error.
- Flake: timing/network; one retry passes without code.

Guided mode asks before category/fix. Auto mode uses the heuristic, patches regressions, marks spec gaps, retries flakes once, then escalates after 3 failed loops.

## Report

Include status, totals, per-flow summary, tool-call audit, fixes, risk controls, advisor notes when available, artifact paths, skipped checks, and cleanup result. Any flow with zero UI calls makes the run invalid.
