#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repo = path.join(process.env.HOME, '.agents');
const installScript = fs.readFileSync(path.join(repo, 'scripts', 'install.sh'), 'utf8');
const setupScript = fs.readFileSync(path.join(repo, 'scripts', 'setup.sh'), 'utf8');
const setupNewUserScript = fs.readFileSync(path.join(repo, 'scripts', 'setup-new-user.sh'), 'utf8');
const autoSyncScript = fs.readFileSync(path.join(repo, 'scripts', 'auto-sync.sh'), 'utf8');
const cronScript = fs.readFileSync(path.join(repo, 'scripts', 'install-cron.sh'), 'utf8');
const subtreeSyncScript = fs.readFileSync(path.join(repo, 'scripts', 'sync-subtrees.sh'), 'utf8');
const submoduleScript = fs.readFileSync(path.join(repo, 'scripts', 'update-submodules.sh'), 'utf8');
const codexWatchdog = fs.readFileSync(path.join(repo, 'codex', 'bin', 'codex-watchdog'), 'utf8');
const codexHealth = fs.readFileSync(path.join(repo, 'codex', 'bin', 'codex-health'), 'utf8');

assert.ok(installScript.includes('install_hook post-merge'), 'installer must create post-merge hook');
assert.ok(installScript.includes('install_hook post-rewrite'), 'installer must create post-rewrite hook for pull --rebase');
assert.ok(installScript.includes('install_hook pre-push'), 'installer must create pre-push hook');
assert.ok(installScript.includes('scripts/update-submodules.sh'), 'installer and hooks must update submodules');
assert.ok(installScript.includes('config --local pull.rebase false'), 'installer must disable pull rebases for this repo');
assert.ok(installScript.includes('config --local pull.ff only'), 'installer must force fast-forward-only pulls for this repo');
assert.ok(installScript.includes('ABID_AGENTS_SKIP_SUBMODULE_INIT'), 'installer must support skipping submodule init');
assert.ok(installScript.includes('ABID_AGENTS_SKIP_SUBMODULE_UPDATE'), 'pull hooks must support skipping submodule updates');
assert.ok(installScript.includes('ABID_AGENTS_CHECK_SUBMODULES_BEFORE_PUSH'), 'pre-push submodule status must be opt-in');
assert.ok(installScript.includes('install_codex_watchdog'), 'installer must install the Codex watchdog');
assert.ok(installScript.includes('dev.abid-agents.codex-watchdog'), 'installer must install the Codex watchdog LaunchAgent');
assert.ok(installScript.includes('launchctl bootstrap'), 'installer must load the Codex watchdog when missing');
assert.ok(installScript.includes('install_managed_block'), 'installer must preserve agent files with a managed block');
assert.ok(installScript.includes('BEGIN managed by abid-agents'), 'managed block must be marker-deduped');
assert.ok(installScript.includes('Preserving existing file'), 'installer must preserve existing non-managed config files');
assert.ok(!installScript.includes('rm "$target"'), 'installer must not remove existing linked targets');
assert.ok(setupScript.includes('git clone --recurse-submodules'), 'new-user setup must clone with submodules');
assert.ok(setupScript.includes('scripts/install.sh'), 'new-user setup must run the main installer');
assert.ok(setupScript.includes('no-mistakes'), 'new-user setup must install or initialize no-mistakes');
assert.ok(setupScript.includes('ask_yes_no'), 'setup must ask questions when interactive');
assert.ok(setupScript.includes('ABID_AGENTS_SETUP_NO_MISTAKES'), 'setup must allow non-interactive no-mistakes choice');
assert.ok(setupScript.includes('ABID_AGENTS_ENABLE_CRON'), 'setup must allow cron choice');
assert.ok(setupScript.includes('ABID_AGENTS_NO_MISTAKES_REPOS'), 'new-user setup must support extra no-mistakes repo init');
assert.ok(setupNewUserScript.includes('exec "$SCRIPT_DIR/setup.sh" "$@"'), 'legacy setup-new-user script must delegate to canonical setup');
assert.ok(installScript.includes('"${1:-}" != "rebase"'), 'post-rewrite hook must only react to rebase rewrites');
assert.ok(
  installScript.includes('Blocked push: reachable git history contains private path or secret-like references.'),
  'pre-push hook must block private path or secret-like history matches'
);
assert.ok(installScript.includes('scan_history_fixed'), 'pre-push history scan must avoid giant revision argv');
assert.ok(autoSyncScript.includes('git rev-parse --git-path agent-config-auto-sync.lock'), 'auto-sync lock must be repo-local');
assert.ok(autoSyncScript.includes('git pull --ff-only origin main'), 'auto-sync must pull main with ff-only');
assert.ok(autoSyncScript.includes('scripts/update-submodules.sh" --remote'), 'auto-sync must bump submodules to tracked upstreams');
assert.ok(autoSyncScript.includes('ABID_AGENTS_SKIP_SUBMODULE_BUMP'), 'auto-sync must allow disabling upstream submodule bumps');
assert.ok(autoSyncScript.includes('ABID_AGENTS_SKIP_NO_MISTAKES_UPDATE'), 'auto-sync must allow disabling no-mistakes updates');
assert.ok(autoSyncScript.includes('ABID_AGENTS_NO_MISTAKES_BIN'), 'auto-sync must allow overriding the no-mistakes binary path');
assert.ok(autoSyncScript.includes('NO_MISTAKES_NO_UPDATE_CHECK=1'), 'auto-sync must avoid nested no-mistakes update checks');
assert.ok(autoSyncScript.includes('update --yes'), 'auto-sync must update no-mistakes non-interactively');
assert.ok(autoSyncScript.includes('git commit -m "Auto-update skill submodules"'), 'auto-sync must commit changed submodule pins');
assert.ok(autoSyncScript.includes('git push --recurse-submodules=check origin main'), 'auto-sync must push bumped submodule pins safely');
assert.ok(
  autoSyncScript.includes('private path or secret-like reference found after submodule update'),
  'auto-sync must block secret-like submodule updates before committing'
);
assert.ok(cronScript.includes('# BEGIN agent-config auto-sync'), 'cron installer must manage a marked crontab block');
assert.ok(cronScript.includes('scripts/auto-sync.sh'), 'cron installer must run auto-sync');
assert.ok(cronScript.includes('Agent-config auto-sync cron already installed'), 'cron installer must no-op when current cron matches');
assert.ok(cronScript.includes('ABID_AGENTS_CRON_INSTALL_TIMEOUT_SECONDS'), 'cron installer must bound crontab writes');
assert.ok(cronScript.includes('crontab "$TMP_CRON"'), 'cron installer must install a temp crontab file');
assert.ok(subtreeSyncScript.includes('Subtree skills migrated to submodules'), 'legacy subtree command must explain migration');
assert.ok(subtreeSyncScript.includes('scripts/update-submodules.sh" --remote'), 'legacy subtree command must route to submodule updates');
assert.ok(submoduleScript.includes('git submodule update --init --recursive'), 'submodule script must initialize pinned submodules');
assert.ok(submoduleScript.includes('git submodule update --init --remote --recursive'), 'submodule script must support explicit upstream bumps');
assert.ok(submoduleScript.includes('Refusing submodule update'), 'remote submodule update must refuse dirty tracked state');
assert.ok(submoduleScript.includes('sparse-checkout set "$source"'), 'submodule script must sparse-checkout only skill source paths');
assert.ok(
  submoduleScript.includes('vendor/skill-upstreams/sentry-cli:plugins/sentry-cli/skills/sentry-cli'),
  'submodule script must update the official Sentry CLI skill path'
);
assert.ok(
  submoduleScript.includes('vendor/skill-upstreams/sentry-for-ai:skills'),
  'submodule script must update the official Sentry for AI skill tree'
);
assert.ok(codexWatchdog.includes('CODEX_WATCHDOG_KILL_ORPHANS'), 'watchdog must reap orphaned MCP processes');
assert.ok(codexWatchdog.includes('CODEX_WATCHDOG_KILL_CODEX_APP_ON_STORM'), 'watchdog must handle severe Codex.app storms');
assert.ok(codexWatchdog.includes('policy_cpu'), 'watchdog must use syspolicyd/trustd as storm evidence');
assert.ok(codexHealth.includes('mcp counts:'), 'codex-health must report MCP counts');

const prePushHook = path.join(repo, '.git', 'hooks', 'pre-push');
if (fs.existsSync(prePushHook)) {
  const stat = fs.statSync(prePushHook);
  const text = fs.readFileSync(prePushHook, 'utf8');
  assert.ok((stat.mode & 0o111) !== 0, 'installed pre-push hook must be executable');
  assert.ok(text.includes('ABID_AGENTS_CHECK_SUBMODULES_BEFORE_PUSH'), 'installed pre-push hook must keep submodule status opt-in');
  assert.ok(text.includes('Blocked push: reachable git history contains private path or secret-like references.'));
}

const postRewriteHook = path.join(repo, '.git', 'hooks', 'post-rewrite');
if (fs.existsSync(postRewriteHook)) {
  const stat = fs.statSync(postRewriteHook);
  const text = fs.readFileSync(postRewriteHook, 'utf8');
  assert.ok((stat.mode & 0o111) !== 0, 'installed post-rewrite hook must be executable');
  assert.ok(text.includes('"${1:-}" != "rebase"'), 'installed post-rewrite hook must only handle rebases');
  assert.ok(text.includes('scripts/update-submodules.sh'), 'installed post-rewrite hook must update pinned submodules');
  assert.ok(text.includes('ABID_AGENTS_SKIP_SUBMODULE_UPDATE'), 'installed post-rewrite hook must support skipping submodule updates');
}

for (const relativePath of ['scripts/auto-sync.sh', 'scripts/install-cron.sh', 'scripts/update-submodules.sh', 'scripts/setup.sh', 'scripts/setup-new-user.sh', 'codex/bin/codex-watchdog', 'codex/bin/codex-health']) {
  const stat = fs.statSync(path.join(repo, relativePath));
  assert.ok((stat.mode & 0o111) !== 0, `${relativePath} must be executable`);
}

console.log('git-hooks-contract: pass');
