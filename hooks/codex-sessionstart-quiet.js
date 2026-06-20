#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');

const EMPTY_SESSION_START = {
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: '',
  },
};

function writeEmptySessionStart() {
  process.stdout.write(`${JSON.stringify(EMPTY_SESSION_START)}\n`);
}

try {
  const input = fs.readFileSync(0, 'utf8');
  const result = spawnSync('context-mode', ['hook', 'codex', 'sessionstart'], {
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore'],
  });

  if (result.status === 0 && result.stdout.trim()) {
    const output = JSON.parse(result.stdout);
    output.hookSpecificOutput ??= {};
    output.hookSpecificOutput.hookEventName = 'SessionStart';
    output.hookSpecificOutput.additionalContext = '';
    process.stdout.write(`${JSON.stringify(output)}\n`);
  } else {
    writeEmptySessionStart();
  }
} catch {
  writeEmptySessionStart();
}
