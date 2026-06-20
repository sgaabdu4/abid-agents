#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const home = process.env.HOME;
const canonical = path.join(home, '.agents', 'codex', 'hooks.json');
const hooks = JSON.parse(fs.readFileSync(canonical, 'utf8')).hooks;
const quietSessionStart = path.join(home, '.agents', 'hooks', 'codex-sessionstart-quiet.js');

assert.ok(hooks.PreToolUse, 'PreToolUse hook must exist');
assert.ok(hooks.SessionStart, 'SessionStart hook must exist');
assert.ok(hooks.PreCompact, 'PreCompact hook must exist');
assert.ok(hooks.UserPromptSubmit, 'UserPromptSubmit hook must exist');
assert.ok(hooks.Stop, 'Stop hook must exist');
assert.equal(hooks.PostToolUse, undefined, 'global PostToolUse hook must stay disabled');

const serializedPreToolUse = JSON.stringify(hooks.PreToolUse);
assert.ok(
  serializedPreToolUse.includes('security-pretooluse.js'),
  'security PreToolUse hook must stay wired',
);
assert.ok(
  serializedPreToolUse.includes('context-mode hook codex pretooluse'),
  'context-mode PreToolUse memory hook must stay wired',
);
assert.ok(
  JSON.stringify(hooks.SessionStart).includes('codex-sessionstart-quiet.js'),
  'SessionStart must run through the quiet continuity wrapper',
);
assert.ok(
  !JSON.stringify(hooks.SessionStart).includes('context-mode hook codex sessionstart'),
  'SessionStart config must not inject raw context-mode additionalContext',
);
assert.ok(
  JSON.stringify(hooks).includes('context-mode hook codex userpromptsubmit'),
  'context-mode UserPromptSubmit continuity hook must stay wired',
);
assert.ok(fs.existsSync(quietSessionStart), 'quiet SessionStart wrapper must exist');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-sessionstart-quiet-'));
const fakeContextMode = path.join(tmpDir, 'context-mode');
fs.writeFileSync(
  fakeContextMode,
  [
    '#!/usr/bin/env node',
    'process.stdin.resume();',
    'process.stdin.on("end", () => {',
    '  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "too many tokens" } }) + "\\n");',
    '});',
  ].join('\n'),
  { mode: 0o755 },
);

const wrapperRun = spawnSync('node', [quietSessionStart], {
  input: '{}\n',
  encoding: 'utf8',
  env: {
    ...process.env,
    PATH: `${tmpDir}${path.delimiter}${process.env.PATH ?? ''}`,
  },
});
assert.equal(wrapperRun.status, 0, 'quiet SessionStart wrapper must exit cleanly');
const wrapperOutput = JSON.parse(wrapperRun.stdout);
assert.equal(wrapperOutput.hookSpecificOutput?.hookEventName, 'SessionStart');
assert.equal(wrapperOutput.hookSpecificOutput?.additionalContext, '');

const installed = path.join(home, '.codex', 'hooks.json');
if (fs.existsSync(installed)) {
  const stat = fs.lstatSync(installed);
  assert.ok(stat.isSymbolicLink(), `${installed} must be a symlink`);
  assert.equal(fs.realpathSync(installed), fs.realpathSync(canonical), `${installed} must point to ${canonical}`);
}

console.log('codex-hooks-contract: pass');
