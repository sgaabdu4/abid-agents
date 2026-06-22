#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(new URL('../../../..', import.meta.url).pathname);
const evalDir = path.join(repoRoot, 'tests/skills/e2e/evals');
const config = JSON.parse(fs.readFileSync(path.join(evalDir, 'evals.json'), 'utf8'));
const caseTimeoutMs = Number(process.env.E2E_EVAL_TIMEOUT_MS || 90000);
const requestedCases = process.env.E2E_EVAL_CASES
  ? new Set(process.env.E2E_EVAL_CASES.split(',').map((item) => item.trim()).filter(Boolean))
  : null;
const cases = requestedCases
  ? config.cases.filter((testCase) => requestedCases.has(testCase.id))
  : config.cases;
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(evalDir, 'results', runId);
fs.mkdirSync(outDir, { recursive: true });
const policyFiles = [
  'skills/e2e/SKILL.md',
  'skills/e2e/references/defaults.md',
  'skills/e2e/references/browser-first.md',
  'skills/e2e/references/capture-artifacts.md',
  'skills/e2e/references/runbook.md',
  'skills/e2e/references/dogfood.md',
];
const policyDigestPattern = /auto-full-safe|ask only|Browser first|Chrome|signed-in|Flutter|device|native|Playwright|last resort|probe|local scripts|events\\.jsonl|video|click|cursor|2x|recap|project\\.json|project-pack|scaffold|check-e2e-project|logs|logging|regression|approval|prod|payment|delete|report-only|dogfood|Artifact Checker|zero UI|No prod|No writes|No destructive/i;
const policyText = policyFiles
  .map((rel) => {
    const lines = fs.readFileSync(path.join(repoRoot, rel), 'utf8')
      .split('\n')
      .filter((line) => policyDigestPattern.test(line));
    return `# ${rel}\n${lines.join('\n')}`;
  })
  .join('\n\n');

const allKeys = Array.from(new Set(config.cases.flatMap((testCase) => [
  ...testCase.expectTrue,
  ...testCase.expectFalse,
])));
const keyDefinitions = [
  'usesSkill: this request should use the E2E skill policy',
  'autoFullSafe: default to the full safe run without a long intake',
  'browserFirst: choose Codex Browser as the primary driver for this specific request',
  'chromeForSignedIn: choose Chrome/profile tooling for signed-in browser state',
  'flutterDeviceForMobile: choose Flutter/device/native tooling for this request',
  'playwrightFirst: choose standalone Playwright before Browser/device tooling',
  'playwrightLast: keep standalone Playwright as fallback or CI artifact work',
  'capturesClickVideo: require click/action ledger plus video or fallback artifact',
  'creates2xCursorRecap: require a final 2x speed recap video with visible cursor and click bloom when video is supported',
  'createsProjectPack: scaffold or update docs/e2e project pack files for first-run repo knowledge',
  'runsProjectPackCheck: check docs/e2e project pack before asking questions or running flows',
  'capturesLogs: capture browser console, server, device, test runner, or app logs when available',
  'runsRegressionGate: require impacted E2E rerun plus existing regression command',
  'destructiveNeedsApproval: ask approval before destructive, prod, payment, or external write effects',
  'destructiveWithoutApproval: perform risky side effects without approval',
  'stopsAfterProbeFailure: stop UI automation probing after a failed Browser/Playwright/node_repl probe',
  'usesLocalScriptsAfterProbeFailure: fall back to local scripts/tests/inspection after probe failure',
  'keepsProbingFailedBrowser: keep trying unrelated UI automation after a failed probe',
  'reportOnlyNoPatch: report-only mode makes no patches',
  'patchesInReportOnly: patch code despite report-only mode',
  'dogfoodsFixture: use a tiny local fixture and artifact checker for skill dogfooding',
  'requiresLongQuestionnaire: ask a long intake questionnaire before doing safe defaults',
  'zeroUiPassAllowed: allow zero UI calls to count as a passing E2E run',
].join('\n');

if (requestedCases && cases.length !== requestedCases.size) {
  const found = new Set(cases.map((testCase) => testCase.id));
  const missing = Array.from(requestedCases).filter((id) => !found.has(id));
  throw new Error(`Unknown eval case(s): ${missing.join(', ')}`);
}

function promptFor(testCase) {
  return `You are evaluating this Codex E2E skill policy.
Do not use tools. Use only the policy text below.
Return JSON only, with every key below as a boolean and a short "reason" string.
Set each key for this user request, not merely because the policy mentions the concept.
Keys: ${allKeys.join(', ')}
Definitions:
${keyDefinitions}
Policy:
${policyText}

User request: ${testCase.prompt}`;
}

function extractJson(stdout) {
  const start = stdout.indexOf('{');
  const end = stdout.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in stdout');
  }
  return JSON.parse(stdout.slice(start, end + 1));
}

function boolValue(parsed, key) {
  const value = parsed[key];
  if (typeof value === 'boolean') return value;
  if (value && typeof value === 'object' && typeof value.value === 'boolean') return value.value;
  if (value && typeof value === 'object' && typeof value.boolean === 'boolean') return value.boolean;
  return value;
}

function runCase(testCase) {
  const prompt = promptFor(testCase);
  const caseDir = path.join(outDir, testCase.id);
  fs.mkdirSync(caseDir, { recursive: true });
  fs.writeFileSync(path.join(caseDir, 'prompt.txt'), prompt);

  const result = spawnSync('codex', [
    'exec',
    '-m',
    config.model,
    '--sandbox',
    'read-only',
    '--skip-git-repo-check',
    '--ignore-user-config',
    '--color',
    'never',
    '-',
  ], {
    cwd: process.env.TMPDIR || '/tmp',
    input: prompt,
    encoding: 'utf8',
    timeout: caseTimeoutMs,
    maxBuffer: 1024 * 1024 * 4,
  });

  fs.writeFileSync(path.join(caseDir, 'stdout.txt'), result.stdout || '');
  fs.writeFileSync(path.join(caseDir, 'stderr.txt'), result.stderr || '');

  const errors = [];
  let parsed = {};
  if (result.error) errors.push(result.error.message);
  if (result.status !== 0) errors.push(`codex exit status ${result.status}`);
  try {
    parsed = extractJson(result.stdout || '');
  } catch (error) {
    errors.push(error.message);
  }

  for (const key of testCase.expectTrue) {
    if (boolValue(parsed, key) !== true) errors.push(`${key} expected true, got ${JSON.stringify(parsed[key])}`);
  }
  for (const key of testCase.expectFalse) {
    if (boolValue(parsed, key) !== false) errors.push(`${key} expected false, got ${JSON.stringify(parsed[key])}`);
  }

  const summary = {
    id: testCase.id,
    passed: errors.length === 0,
    errors,
    parsed,
  };
  fs.writeFileSync(path.join(caseDir, 'result.json'), `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}

const results = cases.map(runCase);
const summary = {
  runId,
  model: config.model,
  passed: results.filter((result) => result.passed).length,
  total: results.length,
  results,
};

fs.writeFileSync(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(`results: ${path.relative(repoRoot, outDir)}`);
console.log(`passed: ${summary.passed}/${summary.total}`);
for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.id}${result.errors.length ? `: ${result.errors.join('; ')}` : ''}`);
}
process.exit(summary.passed === summary.total ? 0 : 1);
