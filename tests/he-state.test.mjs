import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repo = path.resolve(new URL('..', import.meta.url).pathname);
const script = path.join(repo, 'scripts', 'he-state.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'he-state-'));

function run(state) {
  const file = path.join(tmp, `${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`);
  return spawnSync('node', [script, 'validate', file], { encoding: 'utf8' });
}

const doneReceipt = {
  stage: 'he-plan',
  state: 'docs/planning/filters/he-state.json',
  decision: 'PASS',
  ownerProof: ['src/filters.ts', 'npm test -- filters'],
  artifacts: ['docs/planning/filters/he-state.json'],
  blocker: 'none',
  next: 'ready for /he:implement: yes',
};

const valid = {
  schema: 'he-state/v1',
  feature: 'filters',
  updatedAt: '2026-06-25T00:00:00.000Z',
  stage: 'he-plan',
  stageIndex: 1,
  status: 'ready',
  currentStep: 'handoff',
  next: { target: '/he:implement', ready: true, reason: 'plan passed' },
  steps: [
    { id: '1', title: 'Find owner', status: 'done', receipt: doneReceipt },
    { id: '2', title: 'Choose proof', status: 'done', receipt: doneReceipt },
  ],
  findings: [],
  guardrails: [],
  decisions: [],
  blockers: [],
};

let result = run(valid);
assert.equal(result.status, 0, result.stderr);
assert.match(result.stdout, /he-state: pass/);

result = run({
  ...valid,
  steps: [
    { id: '1', title: 'Find owner', status: 'done', receipt: doneReceipt },
    { id: '2', title: 'Choose proof', status: 'pending' },
  ],
});
assert.notEqual(result.status, 0);
assert.match(result.stderr, /next\.ready cannot be true/);

result = run({
  ...valid,
  steps: [{ id: '1', title: 'Find owner', status: 'done' }],
});
assert.notEqual(result.status, 0);
assert.match(result.stderr, /receipt is required/);

result = run({
  ...valid,
  findings: [{
    id: 'finding-1',
    stage: 'he-plan',
    summary: 'Owner is unclear',
    ownerStage: 'he-plan',
    ownerProof: [],
    artifacts: [],
    status: 'open',
    blocking: true,
  }],
});
assert.notEqual(result.status, 0);
assert.match(result.stderr, /blocking findings are unresolved/);

result = run({
  ...valid,
  stage: 'he-ship',
  stageIndex: 4,
  next: { target: 'loop-complete', ready: true, reason: 'ship clean and no learning needed' },
  steps: [
    {
      id: '1',
      title: 'Gate passed',
      status: 'done',
      receipt: { ...doneReceipt, stage: 'he-ship', next: 'loop complete: yes' },
    },
  ],
});
assert.equal(result.status, 0, result.stderr);

result = run({
  ...valid,
  stage: 'he-ship',
  stageIndex: 4,
  next: { target: 'loop-complete', ready: true, reason: 'ship clean' },
  steps: [
    {
      id: '1',
      title: 'Gate passed',
      status: 'done',
      receipt: { ...doneReceipt, stage: 'he-ship', next: 'loop complete: yes' },
    },
  ],
  findings: [{
    id: 'learn-1',
    stage: 'he-ship',
    summary: 'Repeated PR evidence miss needs a guard',
    ownerStage: 'he-learn',
    ownerProof: ['skills/no-mistakes/scripts/repair-pr-evidence.mjs'],
    artifacts: [],
    status: 'open',
  }],
});
assert.notEqual(result.status, 0);
assert.match(result.stderr, /cannot skip he-learn/);

result = run({
  ...valid,
  stage: 'he-ship',
  stageIndex: 4,
  next: { target: '/he:learn', ready: true, reason: 'learning needed' },
  steps: [
    {
      id: '1',
      title: 'Gate passed',
      status: 'done',
      receipt: { ...doneReceipt, stage: 'he-ship', next: 'ready for /he:learn: yes' },
    },
  ],
  findings: [{
    id: 'learn-1',
    stage: 'he-ship',
    summary: 'Repeated PR evidence miss needs a guard',
    ownerStage: 'he-learn',
    ownerProof: ['skills/no-mistakes/scripts/repair-pr-evidence.mjs'],
    artifacts: [],
    status: 'open',
  }],
});
assert.equal(result.status, 0, result.stderr);

result = run({
  ...valid,
  stage: 'he-verify',
  stageIndex: 3,
  next: { target: '/he:ship', ready: true, reason: 'proof clean' },
  steps: [
    {
      id: '1',
      title: 'Proof passed',
      status: 'done',
      receipt: { ...doneReceipt, stage: 'he-verify', next: 'ready for /he:ship: yes' },
    },
  ],
  guardrails: [{
    id: 'react-prepush',
    stage: 'he-implement',
    kind: 'hook',
    owner: '.githooks/pre-push',
    command: 'npm run qa',
    status: 'active',
    evidence: ['.githooks/pre-push'],
    blocksPush: true,
  }],
});
assert.notEqual(result.status, 0);
assert.match(result.stderr, /requires push-blocking guardrails/);

result = run({
  ...valid,
  stage: 'he-verify',
  stageIndex: 3,
  next: { target: '/he:ship', ready: true, reason: 'proof clean' },
  steps: [
    {
      id: '1',
      title: 'Proof passed',
      status: 'done',
      receipt: { ...doneReceipt, stage: 'he-verify', next: 'ready for /he:ship: yes' },
    },
  ],
  guardrails: [{
    id: 'react-prepush',
    stage: 'he-implement',
    kind: 'hook',
    owner: '.githooks/pre-push',
    command: 'npm run qa',
    status: 'passed',
    evidence: ['npm run qa'],
    blocksPush: true,
  }],
});
assert.equal(result.status, 0, result.stderr);

console.log('he-state-test: pass');
