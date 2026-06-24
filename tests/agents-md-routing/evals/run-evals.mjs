#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(new URL('../../..', import.meta.url).pathname);
const evalDir = path.join(repoRoot, 'tests/agents-md-routing/evals');
const config = JSON.parse(fs.readFileSync(path.join(evalDir, 'evals.json'), 'utf8'));
const caseTimeoutMs = Number(process.env.AGENTS_ROUTING_EVAL_TIMEOUT_MS || 90000);
const requestedCases = process.env.AGENTS_ROUTING_EVAL_CASES
  ? new Set(process.env.AGENTS_ROUTING_EVAL_CASES.split(',').map((item) => item.trim()).filter(Boolean))
  : null;
const cases = requestedCases
  ? config.cases.filter((testCase) => requestedCases.has(testCase.id))
  : config.cases;
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const outBase = process.env.AGENTS_ROUTING_EVAL_OUT_DIR
  ? path.resolve(process.env.AGENTS_ROUTING_EVAL_OUT_DIR)
  : path.join('/tmp', 'agents-md-routing-evals');
const outDir = path.join(outBase, runId);
fs.mkdirSync(outDir, { recursive: true });
const schemaPath = path.join(outDir, 'routing-output-schema.json');

const policyFiles = [
  'AGENTS.md',
  'README.md',
  'skills/workflow-help/SKILL.md',
  'skills/workflow-help/references/route-map.md',
];

const policyDigestPattern = /workflow-help|grill-me|to-prd|to-issues|readiness|ensure-worktree-ready|worktree readiness|project hooks|push dry-run|PASS|CONCERNS|FAIL|correct course|scope expands|deterministic|repeat work|script\/test\/hook\/eval|codebase-memory|context-mode|support tools|not stages|lavish|visual review|UI choices|UI\/components|design-system|design SSOT|atomic-ui|tokens|theme|hardcoded|react-doctor|fallow|clone groups|dupes|duplication|vercel-react-best-practices|sentry-workflow|sentry-cli|sentry-sdk-setup|sentry-feature-setup|security-review|performance-rescue|e2e|real UI|screenshots|events|regression command|thermo-nuclear-code-quality-review|maintainability|no-mistakes|committed|BMAD|menu codes|Treehouse|700|blast radius|surrounding issues|Report:|Why:|What:|Risk:|Proof:/i;

const policyText = policyFiles
  .map((rel) => {
    const fullPath = path.join(repoRoot, rel);
    const lines = fs.readFileSync(fullPath, 'utf8')
      .split('\n')
      .filter((line) => policyDigestPattern.test(line));
    return `# ${rel}\n${lines.join('\n')}`;
  })
  .join('\n\n');

const allKeys = Array.from(new Set(config.cases.flatMap((testCase) => [
  ...testCase.expectTrue,
  ...testCase.expectFalse,
])));

fs.writeFileSync(schemaPath, `${JSON.stringify({
  type: 'object',
  additionalProperties: false,
  required: allKeys,
  properties: Object.fromEntries(allKeys.map((key) => [key, {
    type: 'object',
    additionalProperties: false,
    required: ['value', 'reason'],
    properties: {
      value: { type: 'boolean' },
      reason: { type: 'string' },
    },
  }])),
}, null, 2)}\n`);

const keyDefinitions = [
  'usesWorkflowHelp: route unclear workflow or next-step questions to workflow-help',
  'keepsSupportToolsAsTools: treats codebase-memory, context-mode, and terse as support tools, not workflow stages',
  'treatsSupportToolsAsStages: incorrectly presents support tools as standalone workflow stages',
  'usesCodebaseMemoryAsSupport: uses codebase-memory for owners, callers, routes, structure, or blast radius',
  'usesContextModeAsSupport: uses context-mode for logs, diffs, tests, commands, APIs, or data processing',
  'usesExistingAcceptedSlices: recognizes that accepted vertical slices or task waves in plan.md are enough to move toward readiness and implementation',
  'avoidsRedundantToIssues: does not require to-issues when an accepted plan already contains agent-ready slices',
  'requiresToIssuesForExistingSlices: incorrectly treats to-issues as mandatory after grill-me even though plan.md already has accepted slices',
  'usesToIssuesForMissingSlices: routes to-issues when the post-grill-me plan lacks vertical slices, task waves, or agent-ready issue breakdown',
  'usesToIssuesForRequestedIssueCards: routes to-issues when the user explicitly asks to turn accepted slices into separate issue or tracker cards',
  'usesToPrdAndToIssuesForBigWork: routes broad unsliced work through to-prd and then to-issues before build',
  'usesLavishForVisualUiDecisions: uses Lavish or lavish-axi for UI flow or visual choices that cannot be judged from text',
  'keepsLavishAsSupportTool: treats Lavish as a support tool inside grill-me, not as its own Plan/Implement/Verify stage',
  'treatsLavishAsRequiredStage: incorrectly requires Lavish for every feature or makes it a standalone workflow stage',
  'usesAtomicUi: includes atomic-ui for UI components, reusable controls, design-system, token, or styling work',
  'checksDesignSsot: the policy explicitly requires locating or creating the UI design SSOT, such as tokens, theme, primitives, component library, or atomic hierarchy, before reusable UI styling edits',
  'skipsDesignSsot: incorrectly allows UI styling or reusable component work without checking or creating the project-local design SSOT',
  'usesReactDoctor: includes react-doctor for React or Next.js implementation/review',
  'usesFallow: includes fallow for JS/TS code health, cleanup, risk, or architecture checks',
  'usesFallowCloneGroups: the policy explicitly requires fallow duplication or clone-group checks such as fallow dupes, clone groups, or duplicated components for React/JS/TS code health; generic fallow is not enough',
  'usesReactDoctorWithoutFallow: incorrectly runs React Doctor alone for React app code health when fallow is also required',
  'skipsFallowCloneGroups: incorrectly omits fallow duplication or clone-group checks when duplication or copy-paste is part of the React/JS/TS request',
  'usesVercelReactBestPractices: includes Vercel React best-practices for React/Next performance guidance',
  'usesOnlyGenericReactRoute: says only generic React skills or only react-doctor when the policy requires the full React route',
  'usesSentryWorkflow: routes all Sentry or observability work through sentry-workflow',
  'exposesSentrySetupSubskills: exposes sentry-sdk-setup or sentry-feature-setup as the user-facing route',
  'exposesSentryCliAsUserRoute: exposes sentry-cli as the user-facing route',
  'usesE2E: routes real UI flow proof to e2e',
  'requiresRealUiProof: requires a real browser/app/device flow, not just unit tests or curl',
  'requiresArtifactsOrRegressionCommand: requires screenshots/events/video/artifacts or a runnable regression command for UI proof',
  'allowsUnitTestsAsE2E: incorrectly allows unit tests alone to count as E2E proof',
  'usesThermoNuclearReview: routes strict maintainability PR/diff review to thermo-nuclear-code-quality-review',
  'treatsThermoAsPolishOnly: incorrectly treats thermo review as optional cosmetic polish',
  'usesSecurityReviewWhenTouched: routes security, auth, secrets, or data-exposure risk to security-review when requested or touched',
  'usesPerformanceRescueWhenTouched: routes latency, bundle, query, or efficiency risk to performance-rescue when requested or touched',
  'keepsRiskReviewsConditional: treats security-review and performance-rescue as conditional reviews for requested or touched risks, not default stages',
  'runsRiskReviewsBeforeThermo: places conditional security/performance reviews before thermo-nuclear-code-quality-review in the verify loop',
  'treatsRiskReviewsAsDefaultStages: incorrectly requires security-review or performance-rescue for every feature regardless of touched risk',
  'usesVerifyLoop: requires a local verify loop between implementation and proof until blockers are gone',
  'usesDeterministicOwner: runs an existing deterministic owner such as a script, test, hook, or eval before fresh reasoning for known repeat work',
  'createsDeterministicOwnerForRecurringWork: adds a script, test, hook, or eval when a recurring deterministic process has no owner yet',
  'skipsDeterministicOwner: incorrectly uses fresh LLM-only reasoning while an existing deterministic owner should run',
  'createsPassThroughWrapper: incorrectly adds a wrapper that only passes through to another command without validation, transformation, owner boundary, or integration',
  'runsThermoBeforeE2E: runs thermo-nuclear-code-quality-review before expensive E2E in the local verify loop',
  'runsE2ELastWhenNeeded: runs E2E last when a user-visible flow changed',
  'loopsBackAfterVerificationFailure: sends tests, review, or E2E failures back to implementation and reruns affected proof',
  'waitsForCleanLoopBeforeNoMistakes: requires clean tests/review/required E2E plus committed work before no-mistakes',
  'runsNoMistakesBeforeCleanLoop: incorrectly runs no-mistakes before the local verify loop is clean',
  'usesReadinessGate: requires readiness before implementation',
  'readinessConcernsOrFail: marks weak readiness as CONCERNS or FAIL instead of PASS',
  'usesGrillMeWhenAmbiguous: routes ambiguous feature scope to grill-me',
  'startsImplementationWithUnknowns: starts coding despite missing outcome, owner, blast radius, proof path, or risk routing',
  'usesTreehouseWorkspace: names Treehouse worktree or isolated branch as the place for feature planning/coding before implementation proceeds',
  'skipsWorkspaceIsolation: incorrectly starts feature implementation without Treehouse/worktree/branch isolation',
  'usesWorktreeReadyGuard: runs or requires scripts/ensure-worktree-ready.sh after worktree creation or before final gate validation',
  'skipsWorktreeReadyGuard: incorrectly trusts a worktree, no-mistakes checkout, or push dry-run without the worktree readiness guard',
  'requiresProjectHooksBeforeDryRun: states push dry-run only counts after project hooks are active',
  'treatsDryRunAsSufficientAlone: incorrectly treats git push --dry-run or explicit refspec dry-run as sufficient without proving project hooks',
  'correctsCourseOnScopeExpansion: stops and reroutes when scope expands midstream',
  'routesBackToPlanning: uses grill-me, to-prd, to-issues, or codebase-design for expanded or unclear scope',
  'silentlyExpandsScope: continues implementation after scope expansion without rerouting',
  'usesNoMistakes: routes committed validation, push, PR, or CI to no-mistakes',
  'endsAtNoMistakes: feature-to-PR flow ends at no-mistakes after implementation/review proof',
  'requiresCommittedWorkBeforeNoMistakes: states no-mistakes validates committed implementation work',
  'usesNoMistakesBeforeImplementation: incorrectly starts no-mistakes before implementation proof',
  'mapsBmadToLocalSkills: maps BMAD-style requests to local skills and workflow names',
  'usesBmadMenuCodes: follows BMAD persona/menu codes as local workflow commands',
  'requires700LineSplit: requires touched or connected files over 700 lines to be split below 700 lines',
  'skips700LineSplit: incorrectly leaves a touched or connected file over 700 lines unchanged',
  'requiresBlastRadius: requires semantic changes to include blast radius analysis',
  'fixesSurroundingIssues: requires surrounding issues found in blast radius to be fixed',
  'skipsBlastRadius: incorrectly allows semantic edits without blast radius analysis',
  'usesCompactReportTemplate: reports using Why, What, Risk, and Proof fields',
  'usesLongReportTemplate: incorrectly reports using the old long Problem/Fixes/Blast radius/Testing template',
].join('\n');

if (requestedCases && cases.length !== requestedCases.size) {
  const found = new Set(cases.map((testCase) => testCase.id));
  const missing = Array.from(requestedCases).filter((id) => !found.has(id));
  throw new Error(`Unknown eval case(s): ${missing.join(', ')}`);
}

function promptFor(testCase, retryNote = '') {
  return `You are evaluating local .agents workflow routing policy.
Do not use tools. Use only the policy text below.
Return JSON only, with every key below as a boolean and a short "reason" string.
Return one JSON object with every key exactly once.
For each key, use this exact shape: "<key>": {"value": true_or_false, "reason": "short reason"}.
Set each key for this user request, not merely because the policy mentions the concept.
Classify what the policy requires the agent to do for the request.
${retryNote}
Keys: ${allKeys.join(', ')}
Definitions:
${keyDefinitions}
Policy:
${policyText}

User request: ${testCase.prompt}`;
}

function extractJson(stdout) {
  const start = stdout.indexOf('{');
  if (start === -1) throw new Error('No JSON object found in stdout');
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < stdout.length; index += 1) {
    const char = stdout[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return JSON.parse(stdout.slice(start, index + 1));
    }
  }
  throw new Error('No complete JSON object found in stdout');
}

function boolValue(parsed, key) {
  const value = parsed[key];
  if (typeof value === 'boolean') return value;
  if (value && typeof value === 'object' && typeof value.value === 'boolean') return value.value;
  if (value && typeof value === 'object' && typeof value.boolean === 'boolean') return value.boolean;
  if (value && typeof value === 'object' && typeof value.required === 'boolean') return value.required;
  return value;
}

function runCase(testCase) {
  const caseDir = path.join(outDir, testCase.id);
  fs.mkdirSync(caseDir, { recursive: true });
  let errors = [];
  let parsed = {};
  let attempts = [];

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const retryNote = attempt === 1
      ? ''
      : 'Retry note: your previous answer omitted required keys. Return every key in the requested object shape.';
    const prompt = promptFor(testCase, retryNote);
    const outputPath = path.join(caseDir, attempt === 1 ? 'output.json' : `output-attempt-${attempt}.json`);
    fs.writeFileSync(path.join(caseDir, attempt === 1 ? 'prompt.txt' : `prompt-attempt-${attempt}.txt`), prompt);

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
      '--output-schema',
      schemaPath,
      '-o',
      outputPath,
      '-',
    ], {
      cwd: process.env.TMPDIR || '/tmp',
      input: prompt,
      encoding: 'utf8',
      timeout: caseTimeoutMs,
      maxBuffer: 1024 * 1024 * 4,
    });

    fs.writeFileSync(path.join(caseDir, attempt === 1 ? 'stdout.txt' : `stdout-attempt-${attempt}.txt`), result.stdout || '');
    fs.writeFileSync(path.join(caseDir, attempt === 1 ? 'stderr.txt' : `stderr-attempt-${attempt}.txt`), result.stderr || '');

    errors = [];
    parsed = {};
    if (result.error) errors.push(result.error.message);
    if (result.status !== 0) errors.push(`codex exit status ${result.status}`);
    try {
      parsed = fs.existsSync(outputPath)
        ? JSON.parse(fs.readFileSync(outputPath, 'utf8'))
        : extractJson(result.stdout || '');
    } catch (error) {
      errors.push(error.message);
    }

    const missingKeys = allKeys.filter((key) => boolValue(parsed, key) === undefined);
    attempts.push({ attempt, missingKeys });
    if (missingKeys.length && attempt === 1) continue;
    break;
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
    attempts,
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
console.log(`results: ${outDir}`);
console.log(`passed: ${summary.passed}/${summary.total}`);
for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.id}${result.errors.length ? `: ${result.errors.join('; ')}` : ''}`);
}
process.exit(summary.passed === summary.total ? 0 : 1);
