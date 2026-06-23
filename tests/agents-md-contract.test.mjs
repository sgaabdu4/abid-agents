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

console.log('agents-md-contract: pass');
