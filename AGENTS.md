# Agent Rules
## Core
- Read before claim/edit; uncited = unknown. Use current-session tools only; if absent, fallback or say unavailable. Ask before destructive actions. Never commit secrets or edit generated files/`CHANGELOG.md`.
- Blast radius first; default full owner migration; fix root cause/owner issue -> verify; DRY/KISS/YAGNI/SSOT. Smallest correct change: no speculation; stdlib/native/existing deps before new code/deps; direct code before abstraction.
- Never shrink validation at trust boundaries, security, accessibility, data-loss handling, user-requested scope, or smallest proof check.
- Write high signal: no filler/throat-clearing; preserve exact code/API/errors. Commit messages: no agent co-author. Touched file >700 lines: refactor by role/feature before adding unless project rule requires one file.

## Maintainability Bar
For non-trivial implementation/reviews. Quality, simplicity, robustness, scale, long-term maintainability over dev cost.

- Delete first: preserve behavior while removing concepts, branches, wrappers, modes, or layers. Before adding code ask: must it exist; do platform/stdlib/installed deps cover it; can deletion solve it?
- Prefer simpler models, not local cleanup. No legacy/backcompat modes; migrate all callers/data/contracts to latest owner. Move logic to the canonical owner: helper, typed model, policy/state machine, service, package, or module.
- Reject pass-through wrappers; abstract only to remove real complexity or enforce a boundary.
- Make type boundaries explicit: avoid `any`, `unknown`, casts, needless optionality, and silent fallback when a clear contract removes branches.
- Keep orchestration simple/atomic; parallelize independent work when it clarifies flow; avoid half-applied state.
- Reviews prioritize structural regressions, missed simplifications, spaghetti growth, boundary/type leaks, file size, then legibility nits. Approval blocks on those, missed simpler framing, unjustified file growth, busy-flow ad-hoc branching, or hacky/magical helper.

## Tool Routing
- Structure/callers/deps/impact/routes/symbols: CBM index first; cmd output/logs/tests/diffs/APIs/data processing: context-mode first.
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

## CBM
Use before raw text search for definitions/callers/callees/data flow/architecture/impact/dead code/routes. Parent may call CBM.

- Required order: index_repository(repo_path, mode="moderate") first (before it: no index_status, search, trace) -> list_projects and matching root_path -> detect_changes(project) as needed; use mode="full" for deep impact.
- Explore/trace: get_architecture -> search_graph -> get_code_snippet; exact-name search_graph -> trace_path -> search_code for dynamic/string refs.
- Tool purpose: search_graph symbols/routes/structure; trace_path callers/callees/data flow/cross-service; get_code_snippet exact source; search_code graph-enriched text; get_architecture package/service; query_graph custom Cypher/multi-hop.
- Tools: index_repository, index_status, list_projects, delete_project, search_graph, search_code, trace_path, detect_changes, query_graph, get_graph_schema, get_code_snippet, get_architecture, manage_adr, ingest_traces.
- Fallback only when MCP transport is closed: cbm cli <tool> '<json>'. CLI output is raw JSON and may include level=...; do not expect Claude-style .content[0].text.

## context-mode
Default for commands that read/query/list/test/build/diff/fetch/process data. Raw output floods context. Parent may call context-mode MCP.

- Tool map: ctx_batch_execute multiple cmds/output over 20 lines; ctx_execute one command/API/data script; ctx_execute_file large files/logs/JSON/CSV/source; ctx_fetch_and_index -> ctx_search web/docs; ctx_index(path) -> ctx_search local docs/artifacts; ctx_search(sort="timeline") after resume/compact; ctx_stats, ctx_doctor, ctx_upgrade, ctx_purge, ctx_insight admin.
- Think in code: analyze/count/filter in sandbox; print answer, not raw data; batch related ctx_search queries.
- File edits use Read/Edit/Write, not context-mode. Playwright/browser snapshots: save to file, then ctx_index(path) or ctx_execute_file(path). After /clear or /compact, context-mode persists; ctx purge only on explicit request.

## Map -> Process
- Map with CBM: `get_architecture`, `search_graph` incl `semantic_query`, `trace_path`, `search_code`.
- Output exact target files, symbols, routes, callers; do not dump dirs/raw code into context.
- Process with context-mode: feed target paths/symbols into `ctx_execute`, `ctx_batch_execute`, or `ctx_execute_file`; parse/count/filter/summarize in sandbox; print curated findings.

## Files and Shell
- Use `Read` for known files to edit/quote; `Edit` for precise replacements; `Write` for new/full rewrites.
- Direct Bash only for guaranteed-small-output mutations/navigation: `mkdir`, `mv`, `cp`, `rm`, `chmod`, `pwd`, `which`, git writes.
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
- Skills/diagnostics -> `skill-creator`; update `.agents/skills/`; no secrets/speculation.
- React/Next/perf/composition -> matching React/Vercel skills.
- Tests/specs/QA/mutation -> `test-quality`.
- UI/components/design-system/tokens -> `atomic-ui` + `impeccable`.
- User-facing replies -> `terse`.
- Resolve skill refs from dir; missing -> say so.

## Skill Authoring Budget
- Measure edited local skills with `tiktoken` (`o200k_base`).
- Keep repo-owned `SKILL.md` under 100 lines and preferably under 1,200 tokens.
- Keep descriptions specific and short, preferably under 300 chars; front-load trigger words.
- Move checklists, examples, command templates, and long workflows to `references/*.md` or scripts.
- Do not compress vendor/submodule skills; update their upstream instead.

## Project Learning Loop
- Verified repeatable miss -> update nearest project `AGENTS.md` and owning repo skill; if none, create one with concise trigger description. Details go in `references/*.md` or scripts; global `AGENTS.md` only for cross-repo rules.
- Keep `AGENTS.md` to triggers/routing. Store repo-specific commands/tests/E2E/domain workflows/pitfalls/problem -> fix notes in skill references/scripts for on-demand loading. Before adding, check docs/skills, update canonical owner, avoid duplicates, measure touched `SKILL.md`, validate new/changed skills, mention artifact in final report.

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
9. Review changed code/docs, touched-file lengths, and uncited claims.

## Subagents
- Use exposed subagent/multi-agent tools only; discover with `tool_search` if needed.
- Use subagents proactively for bounded independent work: multi-area exploration, audits, large log triage, test failure clusters, refactors over 2+ files, browser/MCP work, online research.
- Split by ownership boundary: file/package/feature/flow/test group/source type; give focused task, scope limits, evidence format, stop condition.
- Run independent subagent tasks in parallel when supported; keep dependent sequencing in parent. Parent owns synthesis, final judgment, edits, and user-facing claims; verify subagent output as evidence, not authority.
- For MCP-backed actions except CBM/context-mode, delegate only through exposed subagent/multi-agent tools. Online/current research/URL extraction: `tvly` single lane; subagents bounded parallel lanes.
- No subagent/multi-agent tool after discovery: work directly.

## TDD and Verification
- Bugs: reproduce first in E2E/user-like flow when feasible. Prefer tests first for behavior changes.
- Derive tests from requirements/public API; list happy/fail/boundary scenarios when practical.
- Test real implementation; mock only external boundaries. Assert public outputs, state/effects, and errors.
- After implementation, audit requirements/diff for missed cases; prove risky logic via red test or mutation drill.
- Run smallest relevant verification through context-mode.
- If verification fails, fix root cause; never mask, skip, or weaken checks. E2E/product checks: inspect pixels; fix visible UI/lint/test/flakiness issues, even incidental.
- Docs/agent-rules-only edits: re-read changed file; run contract/symlink validation.

## UI Design System
- UI work: find existing SSOT first: tokens, theme, primitives, components. Reuse it.
- If absent, create the smallest project-local SSOT before screens; avoid reusable hardcoded color/space/type.

## Final Change Report
Use after any code/config/doc edit or debug/fix. Keep it terse and evidence-backed.

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
- Answer first. Bullets over prose. Terse, concrete, active voice. No em dash; use plain `-`. Long Markdown: keep structure; one sentence per physical line.
- No filler/puffery: robust, seamless, leverage, delve, pivotal, groundbreaking, multifaceted, foster, tapestry.
- Cite files/lines for factual claims.
- Artifacts/plans/specs/config/code: write files; return path + one-line description.
- Artifacts/docs/configs/instruction files: reader/runtime content only. No edit meta, file size, refactor rationale, module-org notes, or future cleanup unless requested.
- Per-project `AGENTS.md` overrides this global file.
