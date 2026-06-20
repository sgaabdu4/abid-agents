#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const hook = path.join(process.env.HOME, '.agents', 'hooks', 'security-pretooluse.js');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'security-pretooluse-env-'));
const logDir = path.join(tempRoot, 'logs');

function runHook(payload) {
  const result = spawnSync('node', [hook], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, AGENT_HOOK_LOG_DIR: logDir },
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout || '{}');
}

function assertDenied(payload, id) {
  const output = runHook(payload);
  assert.equal(output.permissionDecision, 'deny');
  assert.match(output.permissionDecisionReason, new RegExp(`\\[${id}\\]`));
}

function assertAllowed(payload) {
  const output = runHook(payload);
  assert.deepEqual(output, {});
}

assertDenied({
  tool_name: 'Read',
  tool_input: { file_path: '/tmp/.env.local' },
}, 'env-file');

assertDenied({
  tool_name: 'Bash',
  tool_input: { command: 'node --env-file=.env.local scripts/run.ts' },
  cwd: '/tmp',
}, 'env-file-loader');

assertAllowed({
  tool_name: 'Bash',
  tool_input: { command: 'cat .env.example' },
  cwd: '/tmp',
});

fs.rmSync(tempRoot, { recursive: true, force: true });

console.log('security-pretooluse-env: pass');
