#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const home = process.env.HOME;
const canonical = path.join(home, '.agents', 'AGENTS.md');
const text = fs.readFileSync(canonical, 'utf8');

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
