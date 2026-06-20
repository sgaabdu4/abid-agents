# Agent Rules

## Core
- Read before claim/edit. If you cannot cite it, mark unknown.
- Use only current-session tools. If a named tool is absent, use the fallback here or say unavailable.
- Ask before destructive actions. Never commit secrets.
- Blast radius first; default full owner migration. Fix root cause/owner issue -> verify. DRY/KISS/YAGNI/SSOT.
- Default to the smallest correct change: skip speculative work, use stdlib/native/existing deps before new code/deps, direct code before abstraction.
- Never shrink away validation at trust boundaries, security, accessibility, data-loss handling, user-requested scope, or the smallest proof check.
- Write with high signal: no filler, no throat-clearing, exact code/API/errors preserved.
- Touched file >700 lines: refactor by role/feature before adding, unless a project rule requires one file.

## Maintainability Bar
For non-trivial implementation/reviews.

- Search for the code-judo move: preserve behavior while deleting concepts, branches, wrappers, modes, or layers.
- Before adding code, ask: does this need to exist, does the platform/stdlib already do it, does an installed dependency already cover it, can deletion solve it?
- Prefer simpler models, not local cleanup only.
- No legacy/backcompat modes; migrate all callers/data/contracts to latest owner model.
- Move logic to the canonical owner: existing helper, typed model, policy/state machine, service, package, or module that owns the concept.
- Reject abstractions that only wrap/pass through. Keep direct code unless the abstraction removes meaningful complexity or enforces a boundary.
- Push type boundaries explicit: avoid `any`, `unknown`, casts, unnecessary optionality, and silent fallback when a clear contract can remove branches.
- Keep orchestration simple and atomic: run independent work in parallel when it clarifies flow; avoid partial updates that leave state half-applied.
- For reviews, prioritize structural regressions, missed simplifications, spaghetti growth, boundary/type leaks, file-size concerns, then legibility nits.
- Approval requires no clear structural regression, no obvious simpler framing, no unjustified file growth, no ad-hoc branching in busy flows, and no hacky/magical helper.

## Tool Routing
- Code structure, callers, deps, impact, routes, symbols: CBM index first.
- Cmd output, logs, tests, diffs, APIs, data processing: context-mode first.
- File edits: native file tools only. `Read` before `Edit`; `Write` for new files/full rewrites.
- Never use `ctx_execute`, `ctx_execute_file`, or Bash to create/modify files.
- Subagents: use only exposed subagent/multi-agent tools; if absent and `tool_search` exists, discover first. Do not invent tool names or params.
- MCP isolation: parent may call CBM/context-mode directly. Delegate other MCP work only through exposed subagent/multi-agent tools.
- Web/current research: load `tavily-cli`; use `tvly` directly unless explicit parallel delegation is requested and available.
- Parallelizable work: use subagents only when explicitly requested or required, then synthesize in the parent.

## Gate 1: Understand
Use for code, diffs, PRs, commits, logs, docs, reviews, summaries, walkthroughs.

- Code: CBM index before claims/search.
- Diff/commit: read full patch via context-mode: `git show <sha>`. `--stat`, `--name-only`, subjects, and `log --oneline` are insufficient.
- Read whole hunks and touched functions/classes. Truncated output = unread.
- Claims require exact evidence: `path:L120-L135`, `qualified_name`, or commit hunk.
- Avoid vague claims like "better", "cleaner", "improved", "more maintainable" unless code proves a specific fact.
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
- `search_code`: string keys, routes, schema attrs, dynamic dispatch, JSON fields.
- Cross-lang/shared: search TS/Dart/all relevant packages.
- Schema/Appwrite: search `Query.select`, `Query.equal`, `Query.order*`, attr names, config JSON.
- Storage/cache: search localStorage/SWR/Hive/IndexedDB/FCM/draft keys.
- Tests/fixtures: trace/search tests when available.
- Routes/endpoints: search Route nodes and endpoint callers.
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
Use before raw text search for definitions, callers, callees, data flow, architecture, impact, dead code, routes. CBM MCP is allowed in parent.

- Setup: `index_repository(repo_path, mode="moderate")` first. Before it: no `index_status`, search, or trace.
- Then `list_projects` -> matching `root_path`; use `detect_changes(project)` as needed. Use `mode="full"` for deep impact.
- Explore: `get_architecture` -> `search_graph` -> `get_code_snippet`.
- Trace: `search_graph` exact name -> `trace_path` -> `search_code` for dynamic/string refs.
- Tool order: `search_graph` symbols/routes/structure; `trace_path` callers/callees/data flow/cross-service; `get_code_snippet` exact source; `search_code` graph-enriched text; `get_architecture` package/service structure; `query_graph` custom Cypher/multi-hop.
- Tools: `index_repository`, `index_status`, `list_projects`, `delete_project`, `search_graph`, `search_code`, `trace_path`, `detect_changes`, `query_graph`, `get_graph_schema`, `get_code_snippet`, `get_architecture`, `manage_adr`, `ingest_traces`.
- Fallback only when MCP transport is closed: `cbm cli <tool> '<json>'`. CLI output is raw JSON and may include `level=...` log lines; do not expect Claude-style `.content[0].text`.

## context-mode
Default for commands that read/query/list/test/build/diff/fetch/process data. Raw output floods context. context-mode MCP is allowed in parent.

- Use `ctx_batch_execute` for multiple cmds/output over 20 lines; `ctx_execute` for one command/API/data-processing script; `ctx_execute_file` for large files/logs/JSON/CSV/source; `ctx_fetch_and_index` -> `ctx_search` for web/docs; `ctx_index(path)` -> `ctx_search` for local docs/artifacts; `ctx_search(sort="timeline")` after resume/compact; `ctx_stats`, `ctx_doctor`, `ctx_upgrade`, `ctx_purge`, `ctx_insight` for admin.
- Think in code: analyze/count/filter in sandbox; print answer, not raw data.
- Batch related `ctx_search` queries in one call.
- File edits use `Read`/`Edit`/`Write`, not context-mode.
- Playwright/browser snapshots: save to file, then `ctx_index(path)` or `ctx_execute_file(path)`.
- After `/clear` or `/compact`, context-mode persists; use `ctx purge` only on explicit request.

## Map -> Process
- Map with CBM: `get_architecture`, `search_graph` incl `semantic_query`, `trace_path`, `search_code`.
- Output exact target files, symbols, routes, callers. Do not dump dirs/raw code into context.
- Process with context-mode: feed target paths/symbols into `ctx_execute`, `ctx_batch_execute`, or `ctx_execute_file`.
- Parse/count/filter/summarize in sandbox. Print curated findings only.

## Files and Shell
- Use `Read` for known files you will edit or quote.
- Use `Edit` for precise replacements; one call may contain multiple disjoint edits.
- Use `Write` for new files/full rewrites.
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
- Prefer subagents for independent, parallelizable work when explicit-use rules allow it: multi-area codebase exploration, audits, large log triage, test failure clustering, refactors over 2+ files, browser/MCP work, and online research.
- Split work by clear ownership boundaries: file/package/feature/flow/test group/source type. Give each subagent a focused task, scope limits, expected evidence format, and stop condition.
- Run independent subagent tasks in parallel when supported. Keep dependent sequencing in parent.
- Parent owns synthesis, final judgment, edits, and user-facing claims. Treat subagent output as evidence to verify, not as authority.
- For MCP-backed actions except CBM/context-mode, delegate only through exposed subagent/multi-agent tools.
- For online/current research and URL extraction, use `tvly` directly unless explicit parallel delegation is requested and available.
- No subagent/multi-agent tool after discovery: work directly.

## TDD and Verification
- Prefer tests first for behavior changes.
- Derive tests from requirements/public API; list happy/fail/boundary scenarios when practical.
- Test real implementation; mock only external boundaries. Assert public outputs, state/effects, and errors.
- After implementation, audit requirements/diff for missed cases; prove risky logic via red test or mutation drill.
- Run smallest relevant verification through context-mode.
- If verification fails, fix root cause; never mask, skip, or weaken checks.
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
- Answer first. Bullets over prose. Terse, concrete, active voice.
- No filler/puffery: robust, seamless, leverage, delve, pivotal, groundbreaking, multifaceted, foster, tapestry.
- Cite files/lines for factual claims.
- Artifacts/plans/specs/config/code: write files; return path + one-line description.
- Artifacts/docs/configs/instruction files: include only reader/runtime content. No edit meta, file size, refactor rationale, module-org notes, or future cleanup unless requested.
- Per-project `AGENTS.md` overrides this global file.
