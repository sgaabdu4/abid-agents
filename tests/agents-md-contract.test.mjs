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
assertIncludes(text, 'Not run: <cmd/test> - <why + residual risk>');
assertIncludes(text, 'Behavior change -> add/update smallest useful test where practical.');
assertIncludes(text, 'Docs/agent-rules-only change -> re-read changed file + run contract/symlink validation.');
assertIncludes(text, 'Multiple failed fix attempts on the same class of problem count as a verified repeatable miss');
assertIncludes(text, 'Stop retrying local fixes only');
assertIncludes(text, 'append a narrow routing-only rule to the nearest project `AGENTS.md`');
assertIncludes(text, '`AGENTS.md`-only learning is valid only for narrow project routing rules');

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

const expectedLinks = [
  path.join(home, '.pi', 'agent', 'AGENTS.md'),
  path.join(home, '.pi', 'AGENTS.md'),
  path.join(home, '.claude', 'AGENTS.md'),
  path.join(home, '.codex', 'AGENTS.md'),
  path.join(home, '.copilot', 'AGENTS.md'),
];

const canonicalReal = fs.realpathSync(canonical);
for (const link of expectedLinks) {
  const stat = fs.lstatSync(link);
  assert.ok(stat.isSymbolicLink(), `${link} must be a symlink`);
  assert.equal(fs.realpathSync(link), canonicalReal, `${link} must point to ${canonical}`);
}

const claudeFile = path.join(home, '.claude', 'CLAUDE.md');
if (fs.existsSync(claudeFile)) {
  const claudeText = fs.readFileSync(claudeFile, 'utf8');
  assertIncludes(claudeText, '@AGENTS.md', `${claudeFile} must include @AGENTS.md`);
}

console.log('agents-md-contract: pass');
