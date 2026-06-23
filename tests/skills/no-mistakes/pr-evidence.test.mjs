#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  buildEvidenceSection,
  extractLocalImagePaths,
  extractHostedImageMarkdown,
  hasLocalRefs,
  insertEvidenceSection,
  parseNoMistakesFixCommits,
  parseNoMistakesStatus,
  reviewThreadRowsFromGraphql,
  sanitizeBody,
} from '../../../skills/no-mistakes/scripts/repair-pr-evidence.mjs';

const body = `## Intent

Uploading Screen Recording 2026-06-22 at 21.37.28.mov...

## Screenshots

![old](https://github.com/user-attachments/assets/old)

## Testing

- Evidence: Desktop (local file: <code>/var/folders/x/no-mistakes-evidence/run/screenshots/desktop.png</code>)

<details>
<summary>Evidence ledger</summary>

\`\`\`text
{"path":"/Users/example/tmp/no-mistakes-evidence/screenshots/mobile.png","url":"http://127.0.0.1:3000/problems"}
\`\`\`
</details>

## Verification

- npm run build passed locally.
`;

const paths = extractLocalImagePaths(body);
assert.deepEqual(paths, [
  '/var/folders/x/no-mistakes-evidence/run/screenshots/desktop.png',
  '/Users/example/tmp/no-mistakes-evidence/screenshots/mobile.png',
]);
assert.deepEqual(extractHostedImageMarkdown(body), [
  '![old](https://github.com/user-attachments/assets/old)',
]);

const sanitized = sanitizeBody(body);
assert.ok(!hasLocalRefs(sanitized), 'sanitized body must not keep local-only evidence');
assert.ok(!sanitized.includes('Uploading Screen Recording'), 'upload placeholders must be removed');
assert.ok(!sanitized.includes('github.com/user-attachments/assets/old'), 'stale screenshot section must be replaced');

const statusRows = [
  ...parseNoMistakesStatus('run:\n  findings: none\n'),
  ...reviewThreadRowsFromGraphql({
    data: {
      repository: {
        pullRequest: {
          reviewThreads: {
            nodes: [
              {
                isResolved: false,
                path: 'views/problems.ejs',
                line: 114,
                comments: {
                  nodes: [{
                    url: 'https://github.com/a-s-abbas/lmtb/pull/3#discussion_r1',
                    body: 'External player links should use noopener noreferrer.',
                    author: { login: 'copilot-pull-request-reviewer' },
                  }],
                },
              },
            ],
          },
        },
      },
    },
  }),
  ...parseNoMistakesFixCommits(
    'a449a540000000000000000000000000000000000\tno-mistakes(review): Allow Problems board past contribution gate\n',
    'a-s-abbas/lmtb',
  ),
];
const section = buildEvidenceSection({
  screenshots: ['![Desktop board](https://github.com/user-attachments/assets/abc)'],
  statusRows,
  uploadError: '',
});
const repaired = insertEvidenceSection(sanitized, section);

assert.ok(repaired.includes('## No-mistakes Evidence'));
assert.ok(repaired.includes('![Desktop board](https://github.com/user-attachments/assets/abc)'));
assert.ok(repaired.includes('No open no-mistakes findings'));
assert.ok(repaired.includes('copilot-pull-request-reviewer: External player links should use noopener noreferrer.'));
assert.ok(repaired.includes('[views/problems.ejs:114](https://github.com/a-s-abbas/lmtb/pull/3#discussion_r1)'));
assert.ok(repaired.includes('Allow Problems board past contribution gate'));
assert.ok(repaired.includes('[a449a54](https://github.com/a-s-abbas/lmtb/commit/a449a540000000000000000000000000000000000)'));
assert.ok(!hasLocalRefs(repaired), 'repaired body must not contain local refs');

assert.deepEqual(
  reviewThreadRowsFromGraphql({
    data: {
      repository: {
        pullRequest: {
          reviewThreads: {
            nodes: [{ isResolved: true }],
          },
        },
      },
    },
  }),
  [{ status: 'Resolved', issue: 'No open GitHub review threads', evidence: '1 thread(s) checked' }],
);

console.log('no-mistakes pr evidence: pass');
