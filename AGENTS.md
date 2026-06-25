# Agent Rules

## Stops
- Destructive state needs explicit approval. Concrete delete/remove/cleanup approves only that scope. Native delete; no quarantine. Broad cleanup, DB writes, reset/checkout, deletion scripts, temp/build cleanup need fresh approval.
- Never edit `CHANGELOG.md`, `generated/`, or `AUTO-GENERATED`; fix source.
- Pre-commit: `git status --short`; `.env*`, keys/tokens/secrets -> stop.
- No pure pass-through wrappers. Adapters need validation, transform, owner boundary, or platform integration.
- Do not weaken trust/security/a11y/data-loss validation.
- Touched/connected files >700 lines must end <700.
- `SKILL.md`: no 3+ step workflows; move to `references/*.md` or scripts.
- UI edits with no design SSOT: create/import token/theme/style owner first.
- Browser/E2E fail/deny -> one isolated retry, then E2E fallback or target-app `computer-use`.

## Core
- Read before claim/edit; uncited=unknown. Tool absent -> say once; fallback.
- Fix root owner. Prefer canonical behavior; delete concepts before modes/wrappers.
- Validation >= scope; violation -> lint/scanner/gate; repeat -> run/add script/test/hook/eval; GH CI -> parallel logs/jobs, batch fixes, least reruns.
- Commit msgs: no co-author, em dash, dash-only prefix, decorative dashes.
- Project AGENTS.md overrides global; repo facts only, <=600 o200k.

## Tools
- `codebase-memory`, `context-mode`, `terse` are support tools, not stages.
- Code map/callers/deps/routes/blast -> `codebase-memory-mcp cli <tool> '<json>'`; CLI absent -> static search.
- Logs/output/docs/data -> sandbox/index; no raw dumps.
- File edits: native tools or `apply_patch`; never context-mode.
- Shell: concise obs, git writes, approved mutation, focused verify; curated output.
- Web/current -> `tavily-cli` + URLs; fallback to available search.
- Subagents -> exposed tools only; use `tool_search`; else direct.

## Evidence
- Code/diff/PR/commit/log/doc/review/summary: read evidence pre claim.
- Diffs need hunks/functions/classes, not only stat/name/subject/oneline.
- Long summaries split `Verified`/`Inferred`/`Unknown`; cite path/line.
- Semantic edits: blast radius + surrounding issues; check callers, cross-pkg, schema/index, cache/storage, tests, routes. Docs-only: runtime trace N/A.

## Skills
- Load matching skills before answer/edit; let skills own detailed workflow.
- Flutter/Dart/Riverpod/Freezed/GoRouter/pubspec -> `building-flutter-apps`.
- Appwrite/Auth/TablesDB/Storage/Functions/Realtime -> `appwrite-backend`.
- Online/current info -> `tavily-cli`.
- Repeats -> `repeated-failure-learning`; skills/evals -> `skill-creator`.
- Workflow/skill/next-step -> `workflow-help`.
- Features -> `he-plan`/`he-implement`/`he-verify`; ship:`he-ship`; learn:`he-learn`.
- Hard bugs/failures/flakes/regressions -> `diagnosing-bugs`.
- Boundaries/interfaces/ownership/wrappers -> `codebase-design`.
- Post-`grill-me`: clear skip; brief `to-prd`; missing -> `to-issues`; sliced -> build; big -> both.
- React/Next/perf/dupes -> `react-doctor` + `fallow` dupes + `vercel-react-best-practices`.
- Tests/specs/QA/mutation -> `test-quality`.
- UI/components/design-system/tokens -> `atomic-ui` + `impeccable`.
- Sentry/observability/issues/setup -> `sentry-workflow` only.
- User-facing replies -> `terse`.

## Impl
- Scope repo/root, rules, skills, owner, blast radius, proof, risk.
- Non-trivial impl readiness: `PASS`/`CONCERNS`/`FAIL`.
- Scope expands -> `grill-me`/`to-prd`/`to-issues`/`codebase-design`.
- Tests -> `test-quality`; smallest verify; fix root cause.
- Docs/rules edits: re-read + contract/symlink validation.
- Report:
- Why: root cause/evidence.
- What: files/behavior.
- Risk: Direct callers; Cross-package; Schema/index; Cache/storage keys; Tests/fixtures; Routes/endpoints; Docs/config/agent assets.
- Proof: tests/gaps.
