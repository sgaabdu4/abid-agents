# Agent Rules

## Stops
- Destructive state needs explicit approval. Concrete delete/remove/cleanup approves only that scope. Native delete; no quarantine. Broad cleanup, DB writes, reset/checkout, deletion scripts, and temp/build cleanup outside scope need fresh approval.
- Never edit `CHANGELOG.md`, `generated/`, or `AUTO-GENERATED`; fix source.
- Pre-commit: inspect `git status --short`; if `.env*`, keys/tokens/secret-like files appear, stop.
- No pure pass-through wrappers. Adapters need validation, transform, owner boundary, or platform integration.
- Do not weaken trust/security/a11y/data-loss validation.
- Touched/connected files >700 lines must end <700.
- `SKILL.md`: no 3+ step workflows; move to `references/*.md` or scripts.
- UI edits with no design SSOT: create/import token/theme/style owner first.
- Browser/E2E driver fail/deny -> stop after one isolated-profile retry; use E2E fallbacks or target-app `computer-use`.

## Core
- Read before claim/edit; uncited=unknown. Tool absent -> say once + fallback.
- Fix root owner. Prefer deleting concepts or moving behavior to canonical owner over modes/wrappers.
- Validation >= requested scope + smallest useful proof.
- Commit msgs: no agent co-author, em dash, dash-only subject prefix, decorative dash punctuation.
- Project `AGENTS.md` overrides global.

## Tools
- `codebase-memory`, `context-mode`, `terse` are support tools, not stages.
- Code map/callers/deps/routes/blast -> CBM. If CBM MCP closed -> `codebase-memory-mcp cli <tool> '<json>'`; else static search.
- Logs/output/docs/data -> sandbox/index; no raw dumps.
- File edits: native tools or `apply_patch`; never context-mode.
- Shell: concise obs, git writes, approved mutation, focused verify; curate output.
- Web/current -> `tavily-cli` + URLs; fallback to available search.
- Subagents -> exposed tools only; use `tool_search`; else work directly.

## Evidence
- Code/diff/PR/commit/log/doc/review/summary/walkthrough: read evidence pre claim.
- Diffs need hunks/functions/classes, not only stat/name/subject/oneline.
- Long summaries split `Verified`/`Inferred`/`Unknown`; cite path/line/quote.
- Semantic edits: blast radius + surrounding issues; check callers, cross-pkg, schema/index, cache/storage, tests/fixtures, routes. Docs-only: runtime trace N/A.

## Skills
- Load matching skills before answer/edit; let skills own detailed workflow.
- Flutter/Dart/Riverpod/Freezed/GoRouter/pubspec -> `building-flutter-apps`.
- Appwrite/Auth/TablesDB/Storage/Functions/Realtime -> `appwrite-backend`.
- Online/current info -> `tavily-cli`.
- Repeated fixes/project learning -> `repeated-failure-learning`; skill authoring/evals -> `skill-creator`.
- Workflow/skill/next-step/BMAD comparison -> `workflow-help`.
- Ambiguous planning/features -> `grill-me`; shipping validation/push/PR -> `no-mistakes`.
- Hard bugs/failures/flakes/regressions -> `diagnosing-bugs`.
- Boundaries/interfaces/ownership/wrappers -> `codebase-design`.
- Resolved context -> PRD/spec -> `to-prd`; accepted plan -> issues -> `to-issues`.
- React/Next/perf/composition -> `react-doctor` + `fallow` + `vercel-react-best-practices`.
- Tests/specs/QA/mutation -> `test-quality`.
- UI/components/design-system/tokens -> `atomic-ui` + `impeccable`.
- Sentry/observability/issues/setup -> `sentry-workflow` only.
- User-facing replies -> `terse`.

## Impl
- Scope repo/root, `AGENTS.md`, skills, constraints, owner, blast radius, proof, risk.
- Non-trivial impl readiness: `PASS`/`CONCERNS`/`FAIL`.
- Scope expands -> `grill-me`/`to-prd`/`to-issues`/`codebase-design`.
- Tests -> `test-quality`; run smallest verify; fix root cause, not check.
- Docs/rules edits: re-read + contract/symlink validation.
- Report:
- Why: root cause/evidence.
- What: files/behavior.
- Risk: blast radius.
- Proof: tests/gaps.
