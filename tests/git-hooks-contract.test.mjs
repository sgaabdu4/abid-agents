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
const securityHook = fs.readFileSync(path.join(repo, 'hooks', 'security-pretooluse.js'), 'utf8');
const dangerousHook = fs.readFileSync(path.join(repo, 'hooks', 'claude-code-hooks', 'block-dangerous-commands.js'), 'utf8');

assert.ok(installScript.includes('install_hook post-merge'), 'installer must create post-merge hook');
assert.ok(installScript.includes('install_hook post-rewrite'), 'installer must create post-rewrite hook for pull --rebase');
assert.ok(installScript.includes('install_hook pre-commit'), 'installer must create pre-commit hook');
assert.ok(installScript.includes('install_hook pre-push'), 'installer must create pre-push hook');
assert.ok(
  installScript.includes('hooks_dir="$ROOT/$hooks_dir"'),
  'installer must make relative git hook paths repo-absolute for LaunchAgent cwd safety'
);
assert.ok(installScript.includes('scripts/update-submodules.sh'), 'installer and hooks must update submodules');
assert.ok(installScript.includes('config --local pull.rebase false'), 'installer must disable pull rebases for this repo');
assert.ok(installScript.includes('config --local pull.ff only'), 'installer must force fast-forward-only pulls for this repo');
assert.ok(installScript.includes('ABID_AGENTS_SKIP_SUBMODULE_INIT'), 'installer must support skipping submodule init');
assert.ok(installScript.includes('ABID_AGENTS_SKIP_SUBMODULE_UPDATE'), 'pull hooks must support skipping submodule updates');
assert.ok(installScript.includes('ABID_AGENTS_CHECK_SUBMODULES_BEFORE_PUSH'), 'pre-push submodule status must be opt-in');
assert.ok(installScript.includes('install_codex_watchdog'), 'installer must install the Codex watchdog');
assert.ok(installScript.includes('dev.abid-agents.codex-watchdog'), 'installer must install the Codex watchdog LaunchAgent');
assert.ok(installScript.includes('launchctl bootstrap'), 'installer must load the Codex watchdog when missing');
assert.ok(installScript.includes('replace_with_link_file "$ROOT/AGENTS.md" "$HOME/.codex/AGENTS.md"'), 'installer must link Codex AGENTS.md to the canonical file');
assert.ok(installScript.includes('replace_with_link_file "$ROOT/AGENTS.md" "$HOME/.claude/AGENTS.md"'), 'installer must link Claude AGENTS.md to the canonical file');
assert.ok(installScript.includes('replace_with_link_file "$ROOT/AGENTS.md" "$HOME/.copilot/AGENTS.md"'), 'installer must link Copilot AGENTS.md to the canonical file');
assert.ok(installScript.includes('replace_with_link_file "$ROOT/AGENTS.md" "$HOME/.pi/AGENTS.md"'), 'installer must link Pi AGENTS.md to the canonical file');
assert.ok(!installScript.includes('install_managed_block'), 'installer must not install copied AGENTS.md managed blocks');
assert.ok(installScript.includes('scripts/check-markdown-hygiene.mjs'), 'pre-commit hook must run Markdown hygiene');
assert.ok(installScript.includes('Blocked commit: staged forbidden files must not be edited.'), 'pre-commit hook must block forbidden edited files');
assert.ok(installScript.includes('Blocked commit: staged files over 700 lines must be split below 700.'), 'pre-commit hook must block staged files over 700 lines');
assert.ok(installScript.includes('Blocked commit: staged content contains secret-like values.'), 'pre-commit hook must block secret-like staged values');
assert.ok(installScript.includes('[[ "$mode" == "160000" ]]'), 'pre-commit hook must skip staged submodule gitlinks');
assert.ok(installScript.includes("':!scripts/check-markdown-hygiene.mjs'"), 'pre-commit private-path scan must not flag the checker pattern');
assert.ok(installScript.includes("':!tests/markdown-hygiene.test.mjs'"), 'pre-commit private-path scan must not flag the hygiene test fixture');
assert.ok(installScript.includes('Preserving existing file'), 'installer must preserve existing non-managed config files');
assert.ok(!installScript.includes('rm "$target"'), 'installer must not remove existing linked targets');
assert.ok(setupScript.includes('git clone --recurse-submodules'), 'new-user setup must clone with submodules');
assert.ok(setupScript.includes('scripts/install.sh'), 'new-user setup must run the main installer');
assert.ok(setupScript.includes('no-mistakes'), 'new-user setup must install or initialize no-mistakes');
assert.ok(setupScript.includes('install_or_update_treehouse'), 'setup must install or update Treehouse');
assert.ok(setupScript.includes('ABID_AGENTS_SETUP_TREEHOUSE'), 'setup must allow non-interactive Treehouse choice');
assert.ok(setupScript.includes('ABID_AGENTS_SKIP_TREEHOUSE'), 'setup must allow skipping Treehouse install');
assert.ok(setupScript.includes('https://kunchenguid.github.io/treehouse/install.sh'), 'setup must use Treehouse upstream installer');
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
assert.ok(installScript.includes("awk -F: '{ print $1 \":\" $2 \":\" $3 }'"), 'pre-push hook must avoid printing matched secret content');
assert.ok(installScript.includes('scan_history_fixed'), 'pre-push history scan must avoid giant revision argv');
assert.ok(autoSyncScript.includes('git rev-parse --git-path agent-config-auto-sync.lock'), 'auto-sync lock must be repo-local');
assert.ok(autoSyncScript.includes('git pull --ff-only origin main'), 'auto-sync must pull main with ff-only');
assert.ok(autoSyncScript.includes('scripts/update-submodules.sh" --remote'), 'auto-sync must bump submodules to tracked upstreams');
assert.ok(autoSyncScript.includes('ABID_AGENTS_SKIP_SUBMODULE_BUMP'), 'auto-sync must allow disabling upstream submodule bumps');
assert.ok(autoSyncScript.includes('ABID_AGENTS_SKIP_NO_MISTAKES_UPDATE'), 'auto-sync must allow disabling no-mistakes updates');
assert.ok(autoSyncScript.includes('ABID_AGENTS_NO_MISTAKES_BIN'), 'auto-sync must allow overriding the no-mistakes binary path');
assert.ok(autoSyncScript.includes('update_treehouse'), 'auto-sync must update Treehouse');
assert.ok(autoSyncScript.includes('ABID_AGENTS_SKIP_TREEHOUSE_UPDATE'), 'auto-sync must allow disabling Treehouse updates');
assert.ok(autoSyncScript.includes('ABID_AGENTS_TREEHOUSE_BIN'), 'auto-sync must allow overriding the Treehouse binary path');
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
assert.ok(codexWatchdog.includes('CODEX_WATCHDOG_KILL_ORPHANS:-0'), 'watchdog must not kill orphan MCP processes by default');
assert.ok(codexWatchdog.includes('CODEX_WATCHDOG_KILL_CODEX_APP_ON_STORM:-0'), 'watchdog must not kill Codex.app by default');
assert.ok(installScript.includes('<key>CODEX_WATCHDOG_KILL_ORPHANS</key>\n    <string>0</string>'), 'installed watchdog must keep orphan killing opt-in');
assert.ok(installScript.includes('<key>CODEX_WATCHDOG_KILL_CODEX_APP_ON_STORM</key>\n    <string>0</string>'), 'installed watchdog must keep Codex.app killing opt-in');
assert.ok(codexWatchdog.includes('policy_cpu'), 'watchdog must use syspolicyd/trustd as storm evidence');
assert.ok(codexHealth.includes('mcp counts:'), 'codex-health must report MCP counts');
assert.ok(codexHealth.includes('mcp.config'), 'codex-health must read MCP count from doctor check details');
assert.ok(securityHook.includes('sanitizeLogData(data)'), 'security hook logs must be sanitized before writing');
assert.ok(dangerousHook.includes('sanitizeLogData(data)'), 'dangerous command hook logs must be sanitized before writing');

const prePushHook = path.join(repo, '.git', 'hooks', 'pre-push');
if (fs.existsSync(prePushHook)) {
  const stat = fs.statSync(prePushHook);
  const text = fs.readFileSync(prePushHook, 'utf8');
  assert.ok((stat.mode & 0o111) !== 0, 'installed pre-push hook must be executable');
  assert.ok(text.includes('ABID_AGENTS_CHECK_SUBMODULES_BEFORE_PUSH'), 'installed pre-push hook must keep submodule status opt-in');
  assert.ok(text.includes('Blocked push: reachable git history contains private path or secret-like references.'));
}

const preCommitHook = path.join(repo, '.git', 'hooks', 'pre-commit');
if (fs.existsSync(preCommitHook)) {
  const stat = fs.statSync(preCommitHook);
  const text = fs.readFileSync(preCommitHook, 'utf8');
  assert.ok((stat.mode & 0o111) !== 0, 'installed pre-commit hook must be executable');
  assert.ok(text.includes('scripts/check-markdown-hygiene.mjs'), 'installed pre-commit hook must run Markdown hygiene');
  assert.ok(text.includes('Blocked commit: staged forbidden files must not be edited.'), 'installed pre-commit hook must block forbidden files');
  assert.ok(text.includes('Blocked commit: staged files over 700 lines must be split below 700.'), 'installed pre-commit hook must block staged files over 700 lines');
  assert.ok(text.includes('Blocked commit: staged content contains secret-like values.'), 'installed pre-commit hook must block secret-like values');
  assert.ok(text.includes('[[ "$mode" == "160000" ]]'), 'installed pre-commit hook must skip staged submodule gitlinks');
  assert.ok(text.includes("':!scripts/check-markdown-hygiene.mjs'"), 'installed pre-commit hook must ignore checker pattern file');
  assert.ok(text.includes("':!tests/markdown-hygiene.test.mjs'"), 'installed pre-commit hook must ignore test fixture pattern file');
  assert.ok(text.includes('Blocked commit: staged content contains private project/local path references.'));
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
