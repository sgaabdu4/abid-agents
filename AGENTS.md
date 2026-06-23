# Agent Rules
## Hard Stops
Check before any tool call. If the prompt conflicts, this section wins.

- Destructive state needs explicit approval. Direct remove/delete/cleanup for a concrete scope approves it. Approved deletions use `rm`/native delete; never quarantine/backup/move-aside. Broad cleanup, deletion scripts, reset/checkout, DB writes, and temp/build cleanup outside scope need fresh approval. Source cleanup inside the approved change is allowed after usage checks; do not leave dead components, wrappers, routes, or files behind.
- Never edit `CHANGELOG.md`, `generated/` paths, or files with `AUTO-GENERATED`; stop and change the source owner. Do not offer exceptions.
- Before committing, inspect `git status --short`; if `.env*`, keys, tokens, or secret-like files appear, stop and do not commit.
- Never add a pass-through wrapper. Readability/naming is not enough; one-call return functions are forbidden. Explain the direct/canonical owner.
- Do not weaken validation at trust, security, accessibility, or data-loss boundaries; refuse the unsafe change and offer a safe path.
- Files over 700 lines are a hard stop when touched: any fix/feature/review/issue edit must split/move code or content so it ends under 700 lines in the same session. Scope this to touched files only; do not sweep other large files or add code/import/export/re-export/wiring/docs without the split.
- Skill edits cannot put a 3+ step workflow in `SKILL.md`; create or update `references/*.md` or a script and link it from `SKILL.md`.
- UI component edits with no design SSOT must create/import a separate token/theme/style owner first; no inline `style` or component-local visual constants; no confirmation for standard disabled/loading/focus/hover states.
- Browser/E2E probe failed or denied, including Playwright/browser MCP/node_repl -> stop that driver after any allowed isolated-profile retry. Do not call `open -a` or `osascript`. Continue through E2E-owned fallbacks instead: provisioned Playwright, project runner, device tooling, or `computer-use` when exposed and target-app scoped. Keep UI fallback non-destructive unless exact side effects are approved, and report artifact limits.

## Core
- Read before claim/edit; uncited = unknown. Use current-session tools only; if absent, say unavailable once and fallback. Never simulate absent tools. Tool unavailable/denied/cancelled -> fallback after one failure.
- Blast radius first; migrate full owner by default; fix root/owner -> verify; DRY/KISS/YAGNI/SSOT. Smallest correct change: no speculation; stdlib/native/existing deps before new deps; direct code before abstraction.
- Never shrink validation for user-requested scope or smallest proof checks.
- Commit messages: no agent co-author, em dash, or dash punctuation; rewrite invalid user messages before committing.

## Maintainability Bar
For non-trivial implementation/reviews. Quality, simplicity, robustness, scale, maintainability > dev cost.

- Delete first: preserve behavior while removing concepts, branches, wrappers, modes, or layers. Before adding code ask: must it exist; do platform/stdlib/installed deps cover it; can deletion solve it?
- Prefer simpler models, not local cleanup. No legacy/backcompat modes; migrate all callers/data/contracts to latest owner. Move logic to the canonical owner: helper, typed model, policy/state machine, service, package, or module.
- Abstract only to remove real complexity or enforce a boundary.
- Make type boundaries explicit: avoid writing `any`, `unknown`, casts, needless optionality, and silent fallback when a clear contract removes branches. For `JSON.parse`, prefer an unannotated local value plus runtime field checks over explicit `any`/`unknown`.
- Keep orchestration simple/atomic; parallelize independent work when it clarifies flow; avoid half-applied state.
- Reviews prioritize structural regressions, missed simplifications, spaghetti growth, boundary/type leaks, file size, then legibility nits. Approval blocks on those, missed simpler framing, unjustified file growth, busy-flow ad-hoc branching, or hacky/magical helper.

## Tool Routing
- Structure/callers/deps/impact/routes/symbols -> CBM first. Cmd output/logs/tests/diffs/APIs/data -> context-mode.
- File edits: native file tools only. `Read` before `Edit`; `Write` for new/full rewrites. Never use `ctx_execute`, `ctx_execute_file`, or Bash to create/modify files.
- Subagents: use exposed subagent/multi-agent tools only; if absent and `tool_search` exists, discover first. Do not invent tool names/params.
- MCP: parent may call CBM/context-mode directly; delegate other MCP only through exposed subagent/multi-agent tools.
- Web/current research: load `tavily-cli`; use `tvly` single-lane, subagents for bounded parallel lanes.
- Parallel work: use subagents for bounded independent evidence/review; synthesize in parent.

## Gate 1: Understand
Use for code, diffs, PRs, commits, logs, docs, reviews, summaries, walkthroughs.

- Code: CBM index before claims/search.
- Diff/commit: read full patch via context-mode: `git show <sha>`. `--stat`, `--name-only`, subjects, and `log --oneline` do not suffice.
- Read whole hunks and touched functions/classes. Truncated output = unread.
- Claims require exact evidence: `path:L120-L135`, `qualified_name`, or commit hunk.
- Avoid vague claims like "better", "cleaner", "improved", "more maintainable" unless code proves the fact.
- Missing/wrong evidence: re-read source, rebuild answer, then reply.

For summaries longer than 1 paragraph:
```md
## Verified
- <claim> - `<path>:<line>` - "<exact quote>"
## Inferred
- <claim> - basis: <evidence + uncertainty>
## Unknown
- <area> - <why unknown>
```
Start with that template. Do not put prose before it.

## Gate 2: Blast Radius
Use before/after semantic code changes and PR/commit impact summaries: functions, types, routes, constants, schemas, cache/storage keys, enums, API payloads, Appwrite attrs, shared/cross-package code.

- Start with CBM: `trace_path(direction="inbound", depth=4)` for callers.
- `search_code`: string keys, routes, schema attrs, dynamic dispatch, JSON fields; cross-lang/shared TS/Dart/all relevant packages.
- Schema/Appwrite: `Query.select`, `Query.equal`, `Query.order*`, attr names, config JSON. Storage/cache: localStorage/SWR/Hive/IndexedDB/FCM/draft keys.
- Tests/fixtures: trace/search tests when available. Routes/endpoints: Route nodes and endpoint callers.
- Docs-only edits: no runtime call graph; state docs/config touched and code trace skipped.
- Never write `none` without trace/search evidence or explicit `not applicable`.

Report:
```md
## Blast radius
- Direct callers: <file:line> | none - <search/trace evidence>
- Cross-package: <list> | none - <evidence>
- Schema/index: <list> | none - <evidence>
- Cache/storage keys: <list> | none - <evidence>
- Tests/fixtures: <list> | none - <evidence>
- Routes/endpoints: <list> | none - <evidence>
```
Use the exact row labels.

## CBM
Use before raw text search for definitions/callers/callees/data flow/architecture/impact/dead code/routes. Parent may call CBM.

- Required order: index_repository(repo_path, mode="moderate") first (before it: no index_status, search, trace) -> list_projects and matching root_path -> detect_changes(project) as needed; use mode="full" for deep impact.
- Explore/trace: get_architecture -> search_graph -> get_code_snippet; exact-name search_graph -> trace_path -> search_code for dynamic/string refs.
- Tool purpose: search_graph symbols/routes/structure; trace_path callers/callees/data flow/cross-service; get_code_snippet exact source; search_code graph-enriched text; get_architecture package/service; query_graph custom Cypher/multi-hop.
- Tools: index_repository, index_status, list_projects, delete_project, search_graph, search_code, trace_path, detect_changes, query_graph, get_graph_schema, get_code_snippet, get_architecture, manage_adr, ingest_traces.
- Fallback only when MCP transport is closed: cbm cli <tool> '<json>'. CLI output is raw JSON and may include level=...; do not expect Claude-style .content[0].text.

## context-mode
Default for read/query/list/test/build/diff/fetch/process; raw output floods context.

- Tool map: ctx_batch_execute; ctx_execute; ctx_execute_file; ctx_fetch_and_index/ctx_index -> ctx_search; ctx_search(sort="timeline"); ctx_stats/doctor/upgrade/purge/insight.
- Think in code: analyze/filter in sandbox; print answer, not raw output; batch ctx_search.
- File edits use Read/Edit/Write, not context-mode. Playwright snapshots: save to file, then ctx_index(path) or ctx_execute_file(path). After /clear or /compact, context-mode persists; ctx purge only on explicit request.

## Map -> Process
- Map with CBM: `get_architecture`, `search_graph` incl `semantic_query`, `trace_path`, `search_code`.
- Output exact target files, symbols, routes, callers; do not dump dirs/raw code into context.
- Process with context-mode: feed targets into `ctx_execute`/`ctx_batch_execute`/`ctx_execute_file`; parse/filter/summarize; print curated findings.

## Files and Shell
- Use `Read` for known files to edit/quote; `Edit` for precise replacements; `Write` for new/full rewrites.
- Direct Bash only for small-output mutations/navigation: `mkdir`, `mv`, `cp`, `chmod`, approved `rm`, `pwd`, `which`, git writes.
- Do not run raw `cat`, `head`, `tail`, `grep`, `rg`, `find`, `wc`, tests, builds, git reads, API CLIs, Docker/K8s/cloud CLIs via Bash.
- Fallback text search: `ctx_execute` with `rtk grep`/`rtk read`/`rtk wc`; print curated results.
- No `| head` / `| tail` to hide output. Process full output in context-mode.

## Online Research
When user asks to browse/search/web/google/latest/current/research/extract a URL:
1. Load `tavily-cli`.
2. Use `tvly search` for discovery, `tvly extract` for URLs, `tvly research` for multi-source synthesis.
3. Require `--json` where useful; process with context-mode; cite URLs for web-backed claims.

## Skill Gates
Load matching skill before answering/editing:
- Flutter/Dart/Riverpod/Freezed/GoRouter/pubspec -> `building-flutter-apps`.
- Appwrite/Auth/TablesDB/Storage/Functions/Realtime -> `appwrite-backend`.
- Online/current info -> `tavily-cli`.
- Repeated fixes/trial-and-error learning/project capture -> `repeated-failure-learning`; skill authoring/evals -> `skill-creator`.
- Ambiguous planning/features -> `grill-me`; committed shipping validation/push/PR -> `no-mistakes`.
- Hard bugs/failures/flakes/regressions -> `diagnosing-bugs`.
- Boundaries/interfaces/ownership/wrappers -> `codebase-design`.
- Resolved context to PRD/spec -> `to-prd`; accepted plan to vertical issues -> `to-issues`.
- React/Next/perf/composition -> matching React/Vercel skills.
- Tests/specs/QA/mutation -> `test-quality`.
- UI/components/design-system/tokens -> `atomic-ui` + `impeccable`.
- User-facing replies -> `terse`.
- Resolve skill refs from dir; missing -> say so.

## Skill Authoring Budget
- Measure edited local skills with `tiktoken` (`o200k_base`).
- Repo-owned skills live at `skills/<name>/SKILL.md` unless the project explicitly documents another skill root.
- Keep repo-owned `SKILL.md` under 100 lines and preferably under 1,200 tokens.
- Keep descriptions specific and short, preferably under 300 chars; front-load trigger words.
- Move checklists, examples, command templates, and long workflows to `references/*.md` or scripts. A 3+ step checklist/workflow never belongs in `SKILL.md`, even if requested; `SKILL.md` only links to references or scripts.
- Do not compress vendor/submodule/tool-installed skills; update their upstream or CLI owner instead.

## Project Learning Loop: Skill First
- Repeated failed fixes or trial-and-error discoveries count as durable project learning once the process, outcome, and evidence are clear; stop local retry loops and load `repeated-failure-learning` before final.
- Capture: reusable workflow/pitfall/commands/tests/E2E/domain rule -> repo skill + nearest project `AGENTS.md` route + `references/*.md` or script; narrow routing-only rule -> nearest project `AGENTS.md`; never global.
- Before adding: check docs/skills, canonical owner, duplicates; measure touched `SKILL.md`, validate changed skills, mention artifact in final.

## Implementation Flow
For non-trivial code tasks:
1. Scope repo/root, relevant `AGENTS.md`, skills, constraints.
2. CBM: `index_repository(repo_path, mode="moderate")` first.
3. Explore: CBM architecture/search/snippets; read exact files before edits.
4. Fix root/fundamental issues found in reviews/changes; owner, not symptom.
5. Plan risky/multi-file edits; do full owner migration.
6. Ripple: Gate 2 blast-radius search/trace.
7. TDD where practical: failing test -> minimal code -> green -> refactor.
8. Verify with smallest relevant lint/typecheck/test via context-mode; state skipped checks.
9. For committed shipping work, use `/no-mistakes` or `git push no-mistakes`; direct `origin` push only on explicit request or when the gate is unavailable.
10. Review changed code/docs, touched-file lengths, and uncited claims.

## Subagents
- Use exposed subagent/multi-agent tools only; discover with `tool_search` if needed.
- Use subagents for bounded independent work: multi-area exploration, audits, log triage, test clusters, refactors over 2+ files, browser/MCP work, online research.
- Split by ownership boundary: file/package/feature/flow/test group/source type; give focused task, scope limits, evidence format, stop condition.
- Run independent subagent tasks in parallel when supported; keep dependent sequencing in parent. Parent owns synthesis, final judgment, edits, and user-facing claims; verify subagent output as evidence, not authority.
- For MCP-backed actions except CBM/context-mode, delegate only through exposed subagent/multi-agent tools. Online/current research/URL extraction: `tvly` single lane; subagents bounded parallel lanes.
- Wait once for each subagent batch; synthesize partial results plus direct fallback instead of repeated waits.
- No subagent/multi-agent tool after discovery: work directly.

## TDD and Verification
- Bugs: reproduce first in user-like flow when feasible; prefer tests first for behavior changes.
- Load `test-quality`; it owns scenarios, real implementation, boundaries, red/mutation proof, and gap audit.
- Run smallest relevant verification through context-mode. If it fails, fix root cause; never mask, skip, or weaken checks.
- E2E/product checks: load `e2e`; inspect pixels when a driver works; otherwise use local script/tests. Do not install tooling unless asked.
- Missing visual evidence in no-mistakes/E2E is a fix gate, not approval; run E2E fallbacks and runtime preflight before accepting artifact limits.
- Docs/agent-rules-only edits: re-read changed file; run contract/symlink validation.

## UI Design System
- Load `atomic-ui` + `impeccable`; they own SSOT, tokens, primitives, product context, and design QA.
- Missing product context does not block standard disabled/loading/focus/hover states; use platform semantics and neutral tokens, then state the assumption.

## Final Change Report
Use after any code/config/doc edit or debug/fix. Include every row in this exact template; do not collapse blast-radius rows.

```md
## Problem
- Root cause / requirement gap.
- Evidence: file lines, symbol, commit hunk, or command output.
## Fixes
- Files changed + specific changes.
- User-visible behavior changed | unchanged.
## Blast radius
- Direct callers: <file:line> | none | not applicable - <evidence>
- Cross-package: <list> | none | not applicable - <evidence>
- Schema/index: <list> | none | not applicable - <evidence>
- Cache/storage keys: <list> | none | not applicable - <evidence>
- Tests/fixtures: <list> | none | not applicable - <evidence>
- Routes/endpoints: <list> | none | not applicable - <evidence>
- Docs/config/agent assets: <list> | none | not applicable - <evidence>
## Testing
- Added/updated tests: <list> | none - <why>
- Commands run: `<cmd>` -> pass/fail + key output
- Not run: <cmd/test> - <why + residual risk>
```

- Behavior change -> add/update smallest useful test where practical.
- Docs/agent-rules-only change -> re-read changed file + run contract/symlink validation.
- Never claim `none`, `not applicable`, or `pass` without evidence.

## Writing
- Load `terse`; it owns brevity, answer-first shape, filler removal, exact symbols, arrows when useful, and uncited claims.
- Before final, remove em dash characters and dash punctuation from prose; use commas, periods, colons, parentheses, or arrows. Long Markdown: one sentence per physical line.
- Artifacts/plans/specs/config/code: write files; return path + one-line description.
- All repo changes: durable product/runtime content only. No meta notes unless requested.
- Per-project `AGENTS.md` overrides this global file.
