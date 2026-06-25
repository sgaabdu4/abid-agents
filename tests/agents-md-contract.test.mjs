#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const home = process.env.HOME;
const repo = path.join(home, '.agents');
const canonical = path.join(repo, 'AGENTS.md');
const text = fs.readFileSync(canonical, 'utf8');
const maxAgentsTokens = 1000;

function assertIncludes(haystack, needle, message = `missing ${needle}`) {
  assert.ok(haystack.includes(needle), message);
}

function assertNotIncludes(haystack, needle, message = `unexpected ${needle}`) {
  assert.ok(!haystack.includes(needle), message);
}

assert.ok(text.startsWith('# Agent Rules\n\n## Stops\n'), 'AGENTS.md must start with rules, not prose preamble');
assertIncludes(text, 'Touched/connected files >700 lines must end <700');
assertIncludes(text, '`SKILL.md`: no 3+ step workflows');
assertIncludes(text, '`codebase-memory`, `context-mode`, `terse` are support tools, not stages.');
assertIncludes(text, 'repeat work -> run/add script/test/hook/eval');
assertIncludes(text, 'GH CI -> parallel logs/jobs, batch fixes, rerun least.');
assertIncludes(text, "codebase-memory-mcp cli <tool> '<json>'");
assertIncludes(text, 'Logs/output/docs/data -> sandbox/index; no raw dumps.');
assertIncludes(text, 'Semantic edits: blast radius + surrounding issues');
assertNotIncludes(text, 'This file is the gatekeeper');
assertNotIncludes(text, 'Skills and scripts own detailed workflows');
assertNotIncludes(text, 'codex-update-stack');
assertNotIncludes(text, 'codex-watchdog');
assertNotIncludes(text, 'Codex hooks stay limited');
assertNotIncludes(text, 'SessionStart');
assertNotIncludes(text, 'context-mode hook ...');
assertNotIncludes(text, 'ctx_doctor');
assertNotIncludes(text, 'codex-context-mode-health');
assertNotIncludes(text, '## Writing');
assertNotIncludes(text, 'brevity');
assertNotIncludes(text, 'exact-symbol');
assertNotIncludes(text, 'Load `terse`;');
assertNotIncludes(text, '## Final Change Report');
assertIncludes(text, 'Report:');
assertIncludes(text, 'Why: root cause/evidence.');
assertIncludes(text, 'What: files/behavior.');
assertIncludes(text, 'Risk: Direct callers; Cross-package; Schema/index; Cache/storage keys; Tests/fixtures; Routes/endpoints; Docs/config/agent assets.');
assertIncludes(text, 'Proof: tests/gaps.');
assertIncludes(text, 'Project AGENTS.md overrides global; repo facts only, <=600 o200k.');
assertIncludes(text, 'User-facing replies -> `terse`.');
assertIncludes(text, 'React/Next/perf/dupes -> `react-doctor` + `fallow` dupes + `vercel-react-best-practices`.');
assertIncludes(text, 'Sentry/observability/issues/setup -> `sentry-workflow` only.');
assertIncludes(text, 'Features -> Treehouse/`grill-me`, plan, build/verify loop; PR -> `no-mistakes`.');
assertIncludes(text, 'Post-`grill-me`: clear skip; brief `to-prd`; missing -> `to-issues`; sliced -> build; big -> both.');

const tokenCheck = spawnSync('python3', ['-c', `
import sys
import tiktoken

enc = tiktoken.get_encoding("o200k_base")
print(len(enc.encode(sys.stdin.read())))
`], { input: text, encoding: 'utf8' });
assert.equal(tokenCheck.status, 0, `tiktoken token check failed: ${tokenCheck.stderr.trim()}`);
const agentsTokens = Number.parseInt(tokenCheck.stdout.trim(), 10);
assert.ok(
  Number.isInteger(agentsTokens) && agentsTokens < maxAgentsTokens,
  `AGENTS.md token budget exceeded: ${agentsTokens} >= ${maxAgentsTokens}`,
);

const expectedSymlinks = [
  path.join(home, '.claude', 'AGENTS.md'),
  path.join(home, '.codex', 'AGENTS.md'),
  path.join(home, '.copilot', 'AGENTS.md'),
  path.join(home, '.pi', 'AGENTS.md'),
  path.join(home, '.pi', 'agent', 'AGENTS.md'),
];
const canonicalReal = fs.realpathSync(canonical);
for (const installed of expectedSymlinks) {
  const stat = fs.lstatSync(installed);
  assert.ok(stat.isSymbolicLink(), `${installed} must be a symlink`);
  assert.equal(fs.realpathSync(installed), canonicalReal, `${installed} must point to ${canonical}`);
}

const claudeFile = path.join(home, '.claude', 'CLAUDE.md');
if (fs.existsSync(claudeFile)) {
  const claudeText = fs.readFileSync(claudeFile, 'utf8');
  assertIncludes(claudeText, '@AGENTS.md', `${claudeFile} must include @AGENTS.md`);
}

const installText = fs.readFileSync(path.join(repo, 'scripts', 'install.sh'), 'utf8');
const mcpInstallText = fs.readFileSync(path.join(repo, 'scripts', 'install-mcp-tools.sh'), 'utf8');
const setupText = fs.readFileSync(path.join(repo, 'scripts', 'setup.sh'), 'utf8');
const readmeText = fs.readFileSync(path.join(repo, 'README.md'), 'utf8');
const routeMapText = fs.readFileSync(path.join(repo, 'skills', 'workflow-help', 'references', 'route-map.md'), 'utf8');
const featureFlowHtml = fs.readFileSync(path.join(repo, 'docs', 'feature-to-no-mistakes-flow.html'), 'utf8');
const grillFinalPlanText = fs.readFileSync(path.join(repo, 'skills', 'grill-me', 'modules', 'final-plan.md'), 'utf8');
const grillUiFlowText = fs.readFileSync(path.join(repo, 'skills', 'grill-me', 'modules', 'ui-flow.md'), 'utf8');
const grillVisualDesignText = fs.readFileSync(path.join(repo, 'skills', 'grill-me', 'modules', 'visual-design.md'), 'utf8');
const watchdogText = fs.readFileSync(path.join(repo, 'codex', 'bin', 'codex-watchdog'), 'utf8');
const healthText = fs.readFileSync(path.join(repo, 'codex', 'bin', 'codex-health'), 'utf8');
const updateStackPath = path.join(repo, 'codex', 'bin', 'codex-update-stack');
const updateStackText = fs.readFileSync(updateStackPath, 'utf8');
const contextHealthPath = path.join(repo, 'codex', 'bin', 'codex-context-mode-health');
const contextHealthText = fs.readFileSync(contextHealthPath, 'utf8');
const cleanupPath = path.join(repo, 'codex', 'bin', 'codex-cleanup');
const cleanupText = fs.readFileSync(cleanupPath, 'utf8');
const cbmProbePath = path.join(repo, 'scripts', 'probe-codebase-memory-mcp.mjs');
const cbmProbeText = fs.readFileSync(cbmProbePath, 'utf8');
const contextProbePath = path.join(repo, 'scripts', 'probe-context-mode-mcp.mjs');
const contextProbeText = fs.readFileSync(contextProbePath, 'utf8');
const routingEvalText = fs.readFileSync(path.join(repo, 'tests', 'agents-md-routing', 'evals', 'run-evals.mjs'), 'utf8');
const markdownHygienePath = path.join(repo, 'scripts', 'check-markdown-hygiene.mjs');
const markdownHygieneText = fs.readFileSync(markdownHygienePath, 'utf8');
const deterministicOwnerPath = path.join(repo, 'scripts', 'find-deterministic-owner.mjs');
const deterministicOwnerText = fs.readFileSync(deterministicOwnerPath, 'utf8');
const worktreeReadyPath = path.join(repo, 'scripts', 'ensure-worktree-ready.sh');
const worktreeReadyText = fs.readFileSync(worktreeReadyPath, 'utf8');
const autoSyncText = fs.readFileSync(path.join(repo, 'scripts', 'auto-sync.sh'), 'utf8');
const cronText = fs.readFileSync(path.join(repo, 'scripts', 'install-cron.sh'), 'utf8');
const treehouseSkillText = fs.readFileSync(path.join(repo, 'skills', 'treehouse', 'SKILL.md'), 'utf8');
const noMistakesSkillText = fs.readFileSync(path.join(repo, 'skills', 'no-mistakes', 'SKILL.md'), 'utf8');
const noMistakesAxiText = fs.readFileSync(path.join(repo, 'skills', 'no-mistakes', 'references', 'axi-workflow.md'), 'utf8');

for (const executable of [cleanupPath, updateStackPath, contextHealthPath, cbmProbePath, contextProbePath, markdownHygienePath, deterministicOwnerPath, worktreeReadyPath]) {
  assert.ok(fs.existsSync(executable), `${executable} must exist`);
  assert.ok(fs.statSync(executable).mode & 0o111, `${executable} must be executable`);
}

assertIncludes(setupText, '--prereqs-only', 'setup.sh must expose a prerequisite-only mode');
assertIncludes(setupText, 'ABID_AGENTS_ALLOW_HOMEBREW_BOOTSTRAP');
assertNotIncludes(setupText, 'ABID_AGENTS_SKIP_HOMEBREW_INSTALL');
assertIncludes(readmeText, 'curl -fsSLO https://raw.githubusercontent.com/sgaabdu4/abid-agents/main/scripts/setup.sh && bash setup.sh');
assertNotIncludes(readmeText, 'less setup.sh && bash setup.sh');
assertNotIncludes(readmeText, 'curl -fsSL https://raw.githubusercontent.com/sgaabdu4/abid-agents/main/scripts/setup.sh | bash');
assertIncludes(readmeText, 'scripts/ensure-worktree-ready.sh');
assertIncludes(readmeText, 'when slices are missing or should be published as work items');
assertIncludes(readmeText, 'React app or Next.js implementation/review');
assertIncludes(readmeText, 'include `fallow dupes` / clone-group checks for duplication');
assertIncludes(routeMapText, 'Create a Treehouse worktree before planning/coding, then run');
assertIncludes(routeMapText, 'Repeat work runs its deterministic owner first');
assertIncludes(routeMapText, 'if recurring and missing, add script/test/hook/eval');
assertIncludes(routeMapText, 'known repeat work skips an existing deterministic owner');
assertIncludes(routeMapText, 'ensure-worktree-ready.sh');
assertIncludes(routeMapText, 'Dry-run push only counts after project hooks are active.');
assertIncludes(routeMapText, 'For GitHub Actions/`gh` CI, parallelize independent log reads/jobs where possible, batch fixes locally, and rerun the fewest checks.');
assertIncludes(routeMapText, 'For UI choices that cannot be judged from text, inspect the project design SSOT and use a local component/state artifact inside Grill Me.');
assertIncludes(routeMapText, '`to-issues` only for missing agent-ready slices');
assertIncludes(routeMapText, 'when the accepted `plan.md` already has vertical slices or task waves');
assertIncludes(routeMapText, '`grill-me` with `atomic-ui` + `impeccable`');
assertIncludes(routeMapText, 'Create the Treehouse worktree before feature planning/coding.');
assertIncludes(routeMapText, 'Reroute to `no-mistakes` only after committed implementation work is ready for the gate.');
assertIncludes(routeMapText, 'Run `security-review` or `performance-rescue` when requested or when those risks were touched, then `thermo-nuclear-code-quality-review`, then `e2e` last');
assertIncludes(routeMapText, 'Loop back to Implement until tests, reviews, and required E2E are clean.');
assertIncludes(routeMapText, 'React app/Next.js');
assertIncludes(routeMapText, 'include `fallow dupes` / clone-group checks for duplication or copy-paste');
assertIncludes(featureFlowHtml, 'Plan, Implement, Verify');
assertIncludes(featureFlowHtml, 'component/state artifacts help UI choices when text is not enough');
assertIncludes(featureFlowHtml, 'ensure-worktree-ready.sh');
assertIncludes(featureFlowHtml, 'push dry-run only counts after project hooks are active');
assertIncludes(featureFlowHtml, 'Need missing slices');
assertIncludes(featureFlowHtml, 'Plan has slices');
assertIncludes(featureFlowHtml, 'do not rerun <code>/to-issues</code>');
assertIncludes(featureFlowHtml, 'Need UI review');
assertIncludes(featureFlowHtml, 'Use <code>atomic-ui</code> and <code>impeccable</code> inside <code>/grill-me</code>.');
assertIncludes(featureFlowHtml, 'Implement with touched-area skills');
assertIncludes(featureFlowHtml, 'fallow dupes --format json --quiet');
assertIncludes(featureFlowHtml, 'locate or create the design SSOT before reusable styling');
assertIncludes(featureFlowHtml, 'React app touched');
assertIncludes(featureFlowHtml, 'duplication used dupes or clone-group checks');
assertIncludes(featureFlowHtml, 'Run tests, requested or touched risk reviews, thermo review, then E2E.');
assertIncludes(featureFlowHtml, '/security-review');
assertIncludes(featureFlowHtml, '/performance-rescue');
assertIncludes(featureFlowHtml, '3b. Risk reviews');
assertIncludes(featureFlowHtml, 'Security/perf if requested or touched.');
assertIncludes(featureFlowHtml, '3c. Thermo review');
assertIncludes(featureFlowHtml, '3d. E2E');
assertIncludes(featureFlowHtml, 'If any fail: back to 2. Implement, then rerun Verify.');
assertIncludes(featureFlowHtml, 'Pass: go to 4. Final Gate.');
assertIncludes(featureFlowHtml, 'local verify loop is clean');
assertIncludes(featureFlowHtml, 'no-mistakes');
assertIncludes(grillFinalPlanText, 'Sliced plan -> readiness');
assertIncludes(grillFinalPlanText, '`to-issues` only for missing');
assertNotIncludes(fs.readFileSync(path.join(repo, '.gitmodules'), 'utf8'), 'vendor/skill-upstreams/lavish-axi');
assert.ok(!fs.existsSync(path.join(repo, 'vendor', 'skill-upstreams', 'lavish-axi')), 'Lavish upstream skill must not be vendored');
assertIncludes(grillUiFlowText, 'project-local route/component/state');
assertIncludes(grillUiFlowText, 'artifact first');
assertIncludes(grillUiFlowText, 'wireflows/maps/state boards, not visual direction');
assertIncludes(grillUiFlowText, '`atomic-ui` and `impeccable`');
assertIncludes(grillVisualDesignText, 'Project-local direction boards');
assertIncludes(grillVisualDesignText, 'subject-project');
assertIncludes(grillVisualDesignText, 'tokens/components/CSS vars');
assertIncludes(grillVisualDesignText, 'project-local token/component owner');
assertIncludes(setupText, 'install_or_update_treehouse');
assertIncludes(setupText, 'ensure_worktree_ready_repo');
assertIncludes(setupText, 'ABID_AGENTS_SKIP_WORKTREE_READY');
assertIncludes(setupText, 'ABID_AGENTS_WORKTREE_READY_INSTALL');
assertIncludes(setupText, 'ABID_AGENTS_SETUP_TREEHOUSE');
assertIncludes(setupText, 'ABID_AGENTS_SKIP_TREEHOUSE');
assertIncludes(setupText, 'https://kunchenguid.github.io/treehouse/install.sh');
assertIncludes(readmeText, '[`Treehouse`](https://github.com/kunchenguid/treehouse)');
assertIncludes(setupText, 'install_python_prerequisites');
assertIncludes(setupText, 'python3 -m pip install --user tiktoken');
assertIncludes(setupText, 'ABID_AGENTS_SKIP_NPM_INSTALL=1 ABID_AGENTS_SKIP_SUBMODULE_INIT=1 "$ROOT/scripts/install.sh"');
assertIncludes(installText, '"$ROOT/scripts/setup.sh" --prereqs-only');
assertIncludes(installText, 'codex-context-mode-health', 'install.sh must install the no-hooks context-mode health check');
assertIncludes(installText, 'ensure_claude_stub', 'install.sh must keep Claude reduced to AGENTS.md plus CLAUDE.md');
assertNotIncludes(installText, '"$HOME/.claude/skills"', 'install.sh must not repopulate Claude skills');
assertIncludes(installText, 'CODEX_CBM_COMMAND', 'install.sh must pass a resolved CBM command into Codex config');
assertIncludes(installText, '$HOME/.codex/bin/codebase-memory-mcp', 'install.sh must point Codex at the stable CBM binary copy');
assertIncludes(installText, 'resolve_codebase_memory_mcp_command', 'install.sh must resolve CBM through the stable command owner');
assertIncludes(installText, 'default_mode_request_user_input', 'install.sh must sync Codex request-user-input feature into ~/.codex/config.toml');
assertIncludes(installText, 'mcp_servers.context-mode', 'install.sh must keep context-mode MCP registered');
assertIncludes(installText, 'CONTEXT_MODE_DIR', 'install.sh must pin context-mode storage outside ~/.claude');
assertIncludes(mcpInstallText, 'ABID_AGENTS_CONTEXT_MODE_VERSION');
assertIncludes(mcpInstallText, '"context-mode@$context_mode_version"');
assertIncludes(mcpInstallText, '"codebase-memory-mcp@$cbm_version"');
assertIncludes(mcpInstallText, '"@openai/codex@$codex_version"');
assertIncludes(setupText, 'ABID_AGENTS_NO_MISTAKES_VERSION');
assertIncludes(mcpInstallText, 'ln -s "$npm_bin" "$candidate"', 'CBM setup must link to npm binary');
assert.ok(!mcpInstallText.includes('.backup.'), 'CBM setup must not keep backup binaries');

assertIncludes(watchdogText, 'codex-cleanup', 'codex-watchdog must run codex-cleanup');
assertIncludes(watchdogText, 'codex-stack-signature.json', 'codex-watchdog must track Codex stack drift');
assertIncludes(cleanupText, 'SkyComputerUseClient', 'codex-cleanup must trim duplicate computer-use MCP children');
assertIncludes(cleanupText, '/node_repl', 'codex-cleanup must trim duplicate node_repl children');
assertIncludes(cleanupText, 'CODEX_CLEANUP_MCP_CHILD_LIMIT', 'codex-cleanup must cap duplicate MCP children per helper kind');
assertIncludes(cleanupText, 'CODEX_CLEANUP_REPAIR_GLOBAL_STATE', 'codex-cleanup must keep Codex global-state repair opt-in');
assertIncludes(cleanupText, 'CODEX_CLEANUP_DELETE_STALE_THREAD_ROWS', 'codex-cleanup must keep stale thread row deletion opt-in');
assertIncludes(cleanupText, 'stale_codex_cli_groups', 'codex-cleanup must report stale Codex CLI group cleanup');
assertIncludes(cleanupText, 'CODEX_CLEANUP_STALE_CLI_CWDS', 'codex-cleanup must keep stale CLI cleanup scoped by cwd');
assertIncludes(cleanupText, 'CODEX_CLEANUP_STALE_CLI_MAX_AGE_SECONDS', 'codex-cleanup must keep stale CLI cleanup age-gated');
assertIncludes(cleanupText, 'os.killpg', 'codex-cleanup must terminate stale Codex CLI process groups');
assertIncludes(installText, '<integer>60</integer>', 'installed watchdog must run cleanup every minute');
assertIncludes(installText, '<key>CODEX_CLEANUP_STALE_CLI_CWDS</key>', 'installed watchdog must scope stale CLI cleanup to this repo');
assertIncludes(installText, '<string>$ROOT</string>', 'installed watchdog must pass the repo root to stale CLI cleanup');
assertIncludes(installText, '<key>CODEX_CLEANUP_STALE_CLI_MAX_AGE_SECONDS</key>', 'installed watchdog must set the stale CLI age threshold');
assertIncludes(installText, '<string>21600</string>', 'installed watchdog must clean stale repo CLI groups after six hours');
assertIncludes(updateStackText, '"$ROOT/scripts/install.sh"', 'codex-update-stack must run setup after package updates');
assertIncludes(updateStackText, 'probe-codebase-memory-mcp.mjs');
assertIncludes(updateStackText, '$HOME/.codex/bin/codebase-memory-mcp', 'codex-update-stack must probe the stable CBM command');
assertIncludes(updateStackText, 'CBM_MCP_PROBE_TIMEOUT_MS="${CBM_MCP_PROBE_TIMEOUT_MS:-30000}"');
assertIncludes(updateStackText, 'codex-context-mode-health');
assertIncludes(cbmProbeText, '.codex/bin/codebase-memory-mcp', 'CBM probe must prefer the stable Codex-owned command');
assertIncludes(cbmProbeText, "CBM_MCP_PROBE_TIMEOUT_MS ?? '30000'", 'CBM probe must allow slow cold starts');
assertNotIncludes(updateStackText, '["context-mode", "doctor"]', 'codex-update-stack must not call raw context-mode doctor');
assertNotIncludes(updateStackText, 'context-mode doctor missing required PASS checks');
assertIncludes(healthText, 'context-mode no-hooks:');
assertIncludes(healthText, 'codex-context-mode-health');
assertIncludes(healthText, 'details=(checks.get("mcp.config") or {}).get("details") or {}');
assertIncludes(contextHealthText, 'context-mode no-hooks config ok: MCP registered; storage pinned to ~/.codex/context-mode; Codex context-mode hooks absent');
assertIncludes(contextHealthText, 'CONTEXT_MODE_DIR');
assertIncludes(contextHealthText, 'probe-context-mode-mcp.mjs');
assertIncludes(contextProbeText, 'ctx_execute');
assertIncludes(contextProbeText, 'ctx_search');
assertIncludes(contextProbeText, 'ctx_stats');
assertIncludes(routingEvalText, 'AGENTS_ROUTING_EVAL_OUT_DIR');
assertIncludes(routingEvalText, "path.join('/tmp', 'agents-md-routing-evals')");
assertIncludes(markdownHygieneText, 'free prose; use a bullet, heading, or fenced template');
assertIncludes(markdownHygieneText, 'must stay at or under ${maxAgentsLines} lines');
assertIncludes(markdownHygieneText, 'must stay at or under ${maxAgentsTokens} tokens');
assertIncludes(markdownHygieneText, 'requires explicit markdown-hygiene:');
assertIncludes(markdownHygieneText, 'allow-local-machine-paths');
assertIncludes(markdownHygieneText, 'allow-conversation-state');
assertIncludes(markdownHygieneText, 'allow-setup-internals');
assertIncludes(deterministicOwnerText, 'package scripts, scripts, tests, hooks');
assertIncludes(deterministicOwnerText, 'Run matching owners before fresh LLM reasoning.');
assertIncludes(deterministicOwnerText, 'package.json');
assertIncludes(worktreeReadyText, 'detect_hook_owner');
assertIncludes(worktreeReadyText, '.husky/_');
assertIncludes(worktreeReadyText, '.githooks');
assertIncludes(worktreeReadyText, '.git-hooks');
assertIncludes(worktreeReadyText, '/.no-mistakes/repos/');
assertIncludes(worktreeReadyText, 'hook_path_is_private_or_gate');
assertIncludes(worktreeReadyText, 'npm --prefix "$repo" run prepare --if-present');
assertIncludes(treehouseSkillText, 'ensure-worktree-ready.sh');
assertIncludes(noMistakesSkillText, 'ensure-worktree-ready.sh');
assertIncludes(noMistakesSkillText, 'For GitHub Actions/`gh` CI failures, inspect logs in parallel where possible');
assertIncludes(noMistakesAxiText, 'explicit refspec');
assertIncludes(noMistakesAxiText, 'For GitHub Actions or `gh` CI failures, inspect all failing checks/logs before');
assertIncludes(noMistakesAxiText, 'batch fixes into one local verify loop, and rerun only the needed workflows/checks');

assertIncludes(autoSyncText, 'refresh_local_install', 'auto-sync must refresh installed scripts after pulls');
assertIncludes(autoSyncText, 'ABID_AGENTS_SKIP_NPM_INSTALL=1', 'auto-sync refresh must not run package updates');
assertIncludes(autoSyncText, 'ABID_AGENTS_SKIP_PREREQ_INSTALL=1', 'auto-sync refresh must not run prerequisite installers from cron');
assertIncludes(autoSyncText, 'update_treehouse', 'auto-sync must update Treehouse when installed');
assertNotIncludes(fs.readFileSync(path.join(repo, 'scripts', 'update-submodules.sh'), 'utf8'), 'vendor/skill-upstreams/lavish-axi:skills/lavish', 'submodule updater must not manage removed Lavish sparse checkout');
assertIncludes(autoSyncText, 'ABID_AGENTS_SKIP_TREEHOUSE_UPDATE', 'auto-sync must allow skipping Treehouse update');
assertIncludes(autoSyncText, 'ABID_AGENTS_TREEHOUSE_BIN', 'auto-sync must allow overriding Treehouse binary');
assertIncludes(autoSyncText, '"$binary" update', 'auto-sync must call treehouse update through the resolved binary');
assertIncludes(autoSyncText, 'git diff --name-only -- .gitmodules vendor/skill-upstreams', 'auto-sync private-path scans must stay scoped to submodule update outputs');
assertIncludes(cronText, 'codex-update-stack', 'cron installer must schedule codex stack updates');
assertIncludes(cronText, 'ABID_AGENTS_CODEX_STACK_CRON_SCHEDULE', 'codex stack cron schedule must be configurable');
assertIncludes(cronText, 'ABID_AGENTS_SKIP_CODEX_STACK_CRON', 'codex stack cron must be skippable');

console.log('agents-md-contract: pass');
