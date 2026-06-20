---
name: e2e
description: >-
  Guided or unattended E2E sweep for Flutter/web apps. Use for real UI
  smoke/regression flows, browser/device runs, screenshots, triage, fixes, and
  auditable reports.
---

# E2E

Run real UI only. Unit tests, typechecks, static scans, and `curl` can support the run, but never count as E2E proof.

## Intake

Ask one concise block before tools unless already answered:

1. Mode: `guided` or `auto`?
2. Scope: `full`, `diff`, or route/path/flow?
3. Stack/target: Flutter or web? device/browser? URL or start server?
4. Auth/test data: credentials, roles, seeded data, tenant/env?
5. Risk limits: writes/deletes, email/SMS, payments, prod services?
6. Coverage: smoke only, or inputs/state/nav/network/permissions too?
7. Fix policy: report-only, propose patches, or auto-patch? screenshots `fail|all`, video, parallel count?

Defaults: guided, dirty tree -> diff else full, non-prod/no destructive side effects, happy path plus high-risk edges, propose patches in guided, auto-patch in auto, screenshots fail, no video, parallel max 3.

## Rules

- Abort if no UI driver/browser/device can run.
- Each checked step needs UI-drive evidence.
- Use real app/device/browser; no SUT mocks.
- Halt on first failure, triage, then continue only after decision/fix/skip.
- Artifacts go under `docs/e2e/<RUN_ID>/`; never overwrite prior runs.
- Patch only after cause/ripple checks; mark resolved only after relevant verification is green.
- Cleanup anything this run started.

## Runbook

Read `references/runbook.md` after intake. It contains artifact schema, discovery/planning, runner prompt, failure triage, report format, and cleanup.

## Exit

Final output: report path, flow/step totals, failures fixed/escalated/spec-gapped, UI tool-call audit, and skipped checks.
