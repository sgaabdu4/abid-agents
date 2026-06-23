#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const home = process.env.HOME;
const canonical = path.join(home, '.agents', 'AGENTS.md');
const text = fs.readFileSync(canonical, 'utf8');
const maxAgentsTokens = 4000;

function assertIncludes(haystack, needle, message = `missing ${needle}`) {
  assert.ok(haystack.includes(needle), message);
}

assertIncludes(text, '## Final Change Report');
assertIncludes(text, '## Problem');
assertIncludes(text, '## Fixes');
assertIncludes(text, '## Blast radius');
assertIncludes(text, '## Testing');
assertIncludes(text, 'Root cause / requirement gap.');
assertIncludes(text, 'Files changed + specific changes.');
assertIncludes(text, 'Docs/config/agent assets:');
assertIncludes(text, 'Commands run: `<cmd>` -> pass/fail + key output');
assertIncludes(text, 'Not run: <cmd/test> - <reason + residual risk>');
assertIncludes(text, 'All repo changes: durable product/runtime content only.');
assertIncludes(text, 'Behavior change -> add/update smallest useful test where practical.');
assertIncludes(text, 'Docs/agent-rules-only change -> re-read changed file + run contract/symlink validation.');
assertIncludes(text, 'Source cleanup inside the approved change is allowed');
assertIncludes(text, 'do not leave dead components, wrappers, routes, or files behind');
assertIncludes(text, 'provisioned Playwright, project runner, device tooling, or `computer-use`');
assertIncludes(text, 'Missing visual evidence in no-mistakes/E2E is a fix gate');
assertIncludes(text, 'Keep UI fallback non-destructive unless exact side effects are approved');
assert.ok(!text.includes('Do not call `list_apps`, `open -a`, `computer-use`, or `osascript`'), 'E2E policy must not ban computer-use fallback');
assertIncludes(text, 'Files over 700 lines are a hard stop when touched');
assertIncludes(text, 'ends under 700 lines in the same session');
assertIncludes(text, 'Scope this to touched files only');
assertIncludes(text, 'Repeated failed fixes or trial-and-error discoveries count as durable project learning');
assertIncludes(text, 'stop local retry loops');
assertIncludes(text, 'load `repeated-failure-learning` before final');
assertIncludes(text, 'narrow routing-only rule -> nearest project `AGENTS.md`');
assertIncludes(text, 'never global');
assertIncludes(text, 'Workflow/skill/next-step/BMAD comparison questions -> `workflow-help`.');
assertIncludes(text, 'React/Next/perf/composition -> `react-doctor` + `fallow` + `vercel-react-best-practices`.');
assertIncludes(text, 'Sentry/observability/issues/setup -> `sentry-workflow` only');
assertIncludes(text, 'State readiness before implementation: `PASS`, `CONCERNS`, or `FAIL`');
assertIncludes(text, 'Correct course if scope expands midstream');
assertIncludes(text, '`codebase-memory`, `context-mode`, and `terse` are support tools, not stages.');

const workflowHelpSkill = path.join(home, '.agents', 'skills', 'workflow-help', 'SKILL.md');
const workflowHelpReference = path.join(home, '.agents', 'skills', 'workflow-help', 'references', 'route-map.md');
assert.ok(fs.existsSync(workflowHelpSkill), `${workflowHelpSkill} must exist`);
assert.ok(fs.existsSync(workflowHelpReference), `${workflowHelpReference} must exist`);
const workflowHelpSkillText = fs.readFileSync(workflowHelpSkill, 'utf8');
const workflowHelpReferenceText = fs.readFileSync(workflowHelpReference, 'utf8');
assertIncludes(workflowHelpSkillText, 'Routes work without treating support tools as stages.');
assertIncludes(workflowHelpSkillText, 'Load `references/route-map.md` before answering.');
assertIncludes(workflowHelpReferenceText, 'React/Next.js');
assertIncludes(workflowHelpReferenceText, '`react-doctor` + `fallow` + `vercel-react-best-practices`');
assertIncludes(workflowHelpReferenceText, '`sentry-workflow`');
assertIncludes(workflowHelpReferenceText, 'State readiness as `PASS`, `CONCERNS`, or `FAIL`');

const repeatedFailureSkill = path.join(home, '.agents', 'skills', 'repeated-failure-learning', 'SKILL.md');
const repeatedFailureReference = path.join(home, '.agents', 'skills', 'repeated-failure-learning', 'references', 'capture.md');
assert.ok(fs.existsSync(repeatedFailureSkill), `${repeatedFailureSkill} must exist`);
assert.ok(fs.existsSync(repeatedFailureReference), `${repeatedFailureReference} must exist`);
const repeatedFailureSkillText = fs.readFileSync(repeatedFailureSkill, 'utf8');
const repeatedFailureReferenceText = fs.readFileSync(repeatedFailureReference, 'utf8');
assertIncludes(repeatedFailureSkillText, 'trial-and-error process discovery');
assertIncludes(repeatedFailureSkillText, 'Read `references/capture.md` and follow it.');
assertIncludes(repeatedFailureReferenceText, 'same class of problem failed at least twice');
assertIncludes(repeatedFailureReferenceText, 'non-obvious process was discovered through trial and error');
assertIncludes(repeatedFailureReferenceText, 'create or update `skills/<topic>/SKILL.md`');
assertIncludes(repeatedFailureReferenceText, 'append the rule to the nearest project `AGENTS.md`');

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

const installText = fs.readFileSync(path.join(home, '.agents', 'scripts', 'install.sh'), 'utf8');
const mcpInstallText = fs.readFileSync(path.join(home, '.agents', 'scripts', 'install-mcp-tools.sh'), 'utf8');
const setupText = fs.readFileSync(path.join(home, '.agents', 'scripts', 'setup.sh'), 'utf8');
const watchdogText = fs.readFileSync(path.join(home, '.agents', 'codex', 'bin', 'codex-watchdog'), 'utf8');
const healthText = fs.readFileSync(path.join(home, '.agents', 'codex', 'bin', 'codex-health'), 'utf8');
const updateStackPath = path.join(home, '.agents', 'codex', 'bin', 'codex-update-stack');
const updateStackText = fs.readFileSync(updateStackPath, 'utf8');
const autoSyncText = fs.readFileSync(path.join(home, '.agents', 'scripts', 'auto-sync.sh'), 'utf8');
const cronText = fs.readFileSync(path.join(home, '.agents', 'scripts', 'install-cron.sh'), 'utf8');
const cleanupPath = path.join(home, '.agents', 'codex', 'bin', 'codex-cleanup');
const cbmProbePath = path.join(home, '.agents', 'scripts', 'probe-codebase-memory-mcp.mjs');
assert.ok(fs.existsSync(cleanupPath), `${cleanupPath} must exist`);
assert.ok(fs.statSync(cleanupPath).mode & 0o111, `${cleanupPath} must be executable`);
assert.ok(fs.existsSync(cbmProbePath), `${cbmProbePath} must exist`);
assert.ok(fs.statSync(cbmProbePath).mode & 0o111, `${cbmProbePath} must be executable`);
assert.ok(fs.existsSync(updateStackPath), `${updateStackPath} must exist`);
assert.ok(fs.statSync(updateStackPath).mode & 0o111, `${updateStackPath} must be executable`);
assertIncludes(setupText, '--prereqs-only', 'setup.sh must expose a prerequisite-only mode');
assertIncludes(setupText, 'NONINTERACTIVE=1', 'setup.sh must install Homebrew noninteractively');
assertIncludes(setupText, 'brew install "${packages[@]}"', 'setup.sh must install missing brew packages');
assertIncludes(setupText, 'brew tap dart-lang/dart', 'setup.sh must install Dart from the official Homebrew tap');
assertIncludes(setupText, 'git clone --depth 1 -b stable https://github.com/flutter/flutter.git', 'setup.sh must install missing Flutter');
assertIncludes(setupText, 'wait_for_job "$install_pid"', 'setup.sh must wait for the install job');
assertIncludes(setupText, 'wait_for_job "$no_mistakes_pid"', 'setup.sh must wait for the no-mistakes job');
assertIncludes(setupText, 'ABID_AGENTS_SKIP_NPM_INSTALL=1 ABID_AGENTS_SKIP_SUBMODULE_INIT=1 "$ROOT/scripts/install.sh"', 'setup.sh final restore must skip package work');
assertIncludes(setupText, 'ABID_AGENTS_SKIP_FLUTTER_INSTALL', 'setup.sh must allow Flutter install to be skipped');
assertIncludes(installText, '"$ROOT/scripts/setup.sh" --prereqs-only', 'install.sh must repair missing prerequisites');
assertIncludes(installText, 'codex-cleanup', 'install.sh must install codex-cleanup');
assertIncludes(installText, 'codex-update-stack', 'install.sh must install codex-update-stack');
assertIncludes(installText, 'CODEX_CBM_COMMAND', 'install.sh must pass a resolved CBM command into Codex config');
assertIncludes(installText, 'command -v codebase-memory-mcp', 'install.sh must resolve the CBM executable path');
assertIncludes(watchdogText, 'codex-cleanup', 'codex-watchdog must run codex-cleanup');
assertIncludes(watchdogText, 'codex-stack-signature.json', 'codex-watchdog must track Codex stack drift');
assertIncludes(watchdogText, 'CODEX_WATCHDOG_AUTO_REPAIR_MANUAL_UPDATES', 'codex-watchdog manual repair must be configurable');
assertIncludes(watchdogText, 'CODEX_WATCHDOG_REPAIR_MIN_INTERVAL_SECONDS', 'codex-watchdog repair retry interval must be configurable');
assertIncludes(watchdogText, '"$update_stack_bin" --repair', 'codex-watchdog must auto-repair manual update drift');
assertIncludes(watchdogText, '$HOME_DIR/flutter/bin', 'codex-watchdog PATH must resolve dart MCP');
assertIncludes(mcpInstallText, 'ln -s "$npm_bin" "$candidate"', 'CBM setup must link to npm binary');
assertIncludes(mcpInstallText, '"$root/scripts/setup.sh" --prereqs-only', 'MCP install must repair missing npm through setup');
assertIncludes(mcpInstallText, 'npm not found after prerequisite install', 'MCP install must report prereq repair failure clearly');
assert.ok(!mcpInstallText.includes('.backup.'), 'CBM setup must not keep backup binaries');
assertIncludes(updateStackText, '"$ROOT/scripts/install.sh"', 'codex-update-stack must run setup after package updates');
assertIncludes(updateStackText, '--after-manual-update', 'codex-update-stack must support a manual update repair mode');
assertIncludes(updateStackText, 'ABID_AGENTS_SKIP_SUBMODULE_INIT="${ABID_AGENTS_SKIP_SUBMODULE_INIT:-1}"');
assertIncludes(updateStackText, 'Repairing Codex stack after manual update');
assertIncludes(updateStackText, '$HOME/flutter/bin', 'codex-update-stack PATH must resolve dart MCP');
assertIncludes(updateStackText, 'required_ok = ("config.load", "mcp.config", "state.paths")');
assertIncludes(updateStackText, 'codex doctor ok: filesystem sandbox=unrestricted approval=Never');
assertIncludes(updateStackText, 'codex hooks ok: SessionStart disabled context-mode hooks absent');
assertIncludes(updateStackText, 'Codex SessionStart hook must stay disabled.');
assertIncludes(updateStackText, 'probe-codebase-memory-mcp.mjs');
assertIncludes(updateStackText, 'context-mode doctor');
assertIncludes(updateStackText, '"CONTEXT_MODE_PLATFORM": "codex"');
assertIncludes(updateStackText, 'context-mode hooks intentionally absent');
assertIncludes(updateStackText, 'codex-health');
assertIncludes(updateStackText, 'codex-health summary:');
assertIncludes(healthText, 'codex-update-stack --repair', 'codex-health must tell users how to repair after manual updates');
assertIncludes(autoSyncText, 'refresh_local_install', 'auto-sync must refresh installed scripts after pulls');
assertIncludes(autoSyncText, 'ABID_AGENTS_SKIP_NPM_INSTALL=1', 'auto-sync refresh must not run package updates');
assertIncludes(cronText, 'codex-update-stack', 'cron installer must schedule codex stack updates');
assertIncludes(cronText, 'ABID_AGENTS_CODEX_STACK_CRON_SCHEDULE', 'codex stack cron schedule must be configurable');
assertIncludes(cronText, 'ABID_AGENTS_SKIP_CODEX_STACK_CRON', 'codex stack cron must be skippable');
assertIncludes(cronText, '$HOME/flutter/bin', 'cron PATH must resolve Flutter Dart');
assertIncludes(cronText, '$HOME/.pub-cache/bin', 'cron PATH must resolve pub cache tools');

console.log('agents-md-contract: pass');
