#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.env.HOME, '.agents');
const files = [
  'skills/no-mistakes/SKILL.md',
  'skills/no-mistakes/references/axi-workflow.md',
  'skills/no-mistakes/references/pr-evidence.md',
  'skills/no-mistakes/scripts/repair-pr-evidence.mjs',
].map((relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8'));
const text = files.join('\n');

const requiredCoverage = [
  'Read `references/axi-workflow.md` before starting',
  'Read `references/pr-evidence.md` before finalizing',
  'Validate-only',
  'Task-first',
  'committed on a feature branch',
  'Never run the pipeline from the default branch',
  'no-mistakes init',
  'no-mistakes doctor',
  'active run',
  'another branch',
  'Pass `--intent` every time',
  'The intent is the user',
  'gate:',
  'auto-fix',
  'no-op',
  'ask-user',
  'no-mistakes axi respond --action fix',
  'no-mistakes axi respond --action approve',
  'no-mistakes axi respond --action skip',
  'Do not manually edit code while the active gate is waiting',
  '--add-finding',
  '--step <name>',
  '--yes',
  'checks-passed',
  'failed` or `cancelled',
  'do not wait for human merge',
  'no-mistakes axi status',
  'no-mistakes axi logs --step <name> --full',
  'no-mistakes axi abort',
  'no-mistakes rerun',
  'Output is TOON',
  'Follow `help` lines',
  'Exit codes',
  'Pipeline findings and fixes',
  'hosted screenshots',
  'no local paths',
  'clear resolved/open issue status',
  'github.com/user-attachments',
  'findings: none',
];

for (const snippet of requiredCoverage) {
  assert.ok(text.includes(snippet), `missing no-mistakes coverage: ${snippet}`);
}

const personalHomePath = ['/Users', 'abid'].join('/');
assert.ok(!text.includes(personalHomePath), 'no-mistakes skill files must not contain personal absolute paths');

console.log('no-mistakes migration coverage: pass');
