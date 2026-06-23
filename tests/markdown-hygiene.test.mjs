#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repo = path.join(process.env.HOME, '.agents');
const checker = path.join(repo, 'scripts', 'check-markdown-hygiene.mjs');

const pass = spawnSync(checker, {
  cwd: repo,
  encoding: 'utf8',
});
assert.equal(pass.status, 0, `markdown hygiene should pass current repo:\n${pass.stderr}`);
assert.match(pass.stdout, /markdown-hygiene: pass/);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-hygiene-'));
fs.mkdirSync(path.join(tmp, 'skills', 'demo'), { recursive: true });
fs.writeFileSync(
  path.join(tmp, 'AGENTS.md'),
  '# Agent Rules\n\n## Stops\nThis arbitrary explanation is not a rule and should fail.\n- Rule.\n',
);
fs.writeFileSync(path.join(tmp, 'skills', 'demo', 'SKILL.md'), '# Demo\n');

const fail = spawnSync(checker, {
  cwd: tmp,
  env: { ...process.env, AGENTS_HYGIENE_ROOT: tmp },
  encoding: 'utf8',
});
assert.notEqual(fail.status, 0, 'checker must fail prompt prose in AGENTS.md');
assert.match(fail.stderr, /free prose/);
assert.match(fail.stderr, /bullet, heading, or fenced template/);

const leakTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-hygiene-leak-'));
fs.writeFileSync(path.join(leakTmp, 'AGENTS.md'), '# Agent Rules\n\n## Stops\n- Rule.\n');
fs.writeFileSync(path.join(leakTmp, 'README.md'), 'This session said to use /Users/abid/tmp.\n');
const leak = spawnSync(checker, {
  cwd: leakTmp,
  env: { ...process.env, AGENTS_HYGIENE_ROOT: leakTmp },
  encoding: 'utf8',
});
assert.notEqual(leak.status, 0, 'checker must fail ownerless leakage in any Markdown file');
assert.match(leak.stderr, /local machine path requires explicit/);
assert.match(leak.stderr, /conversation state requires explicit/);

console.log('markdown-hygiene-test: pass');
