#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const pairs = [
  ['docs/project-workflow-gates.html', 'docs/images/project-workflow-gates.png'],
];
const blockers = [];

for (const [source, output] of pairs) {
  const sourcePath = path.join(root, source);
  const outputPath = path.join(root, output);
  if (!fs.existsSync(sourcePath)) continue;
  if (!fs.existsSync(outputPath)) {
    blockers.push(`${output} missing for ${source}`);
    continue;
  }
  if (fs.statSync(outputPath).mtimeMs + 1000 < fs.statSync(sourcePath).mtimeMs) {
    blockers.push(`${output} is older than ${source}`);
  }
}

if (blockers.length) {
  console.error('generated-assets: fail');
  for (const blocker of blockers) console.error(`blocker: ${blocker}`);
  process.exit(1);
}

console.log('generated-assets: pass');
