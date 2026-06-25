#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repo = path.resolve(new URL('..', import.meta.url).pathname);
const script = path.join(repo, 'scripts', 'check-generated-assets.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'generated-assets-'));
const html = path.join(tmp, 'docs/project-workflow-gates.html');
const png = path.join(tmp, 'docs/images/project-workflow-gates.png');

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

function run() {
  return spawnSync('node', [script, tmp], { encoding: 'utf8' });
}

write(html, '<!doctype html><title>Hard Eng</title>\n');
let result = run();
assert.notEqual(result.status, 0);
assert.match(result.stderr, /missing/);

write(png, 'png');
const old = new Date(Date.now() - 5000);
fs.utimesSync(png, old, old);
result = run();
assert.notEqual(result.status, 0);
assert.match(result.stderr, /older than/);

write(png, 'fresh-png');
result = run();
assert.equal(result.status, 0, result.stderr);
assert.match(result.stdout, /generated-assets: pass/);

console.log('generated-assets-test: pass');
