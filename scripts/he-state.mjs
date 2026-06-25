#!/usr/bin/env node
import fs from 'node:fs';

const stages = new Map([
  ['he-plan', { index: 1, nextTargets: ['/he:implement'] }],
  ['he-implement', { index: 2, nextTargets: ['/he:verify'] }],
  ['he-verify', { index: 3, nextTargets: ['/he:ship'] }],
  ['he-ship', { index: 4, nextTargets: ['/he:learn', 'loop-complete'] }],
  ['he-learn', { index: 5, nextTargets: ['loop-complete'] }],
]);
const statuses = new Set(['pending', 'in_progress', 'done', 'blocked', 'skipped']);
const stateStatuses = new Set(['in_progress', 'blocked', 'ready', 'complete']);
const findingStatuses = new Set(['open', 'owned', 'fixed', 'blocked', 'accepted']);
const guardrailKinds = new Set(['script', 'test', 'lint', 'scanner', 'hook', 'eval', 'ci', 'manual']);
const guardrailStatuses = new Set(['planned', 'active', 'passed', 'failed', 'blocked', 'skipped']);
const contextStatuses = new Set(['current', 'updated', 'created']);
const legacyCommandPattern = /(^|[^A-Za-z0-9_])\/?aa:[a-z][a-z-]*/i;

function template() {
  return {
    schema: 'he-state/v1',
    feature: 'feature-slug',
    updatedAt: new Date().toISOString(),
    stage: 'he-plan',
    stageIndex: 1,
    status: 'in_progress',
    currentStep: 'define-owner-proof',
    next: { target: '/he:implement', ready: false, reason: 'planning not complete' },
    steps: [
      { id: '1', title: 'Define owner and proof', status: 'in_progress' },
      { id: '2', title: 'Choose planning artifact', status: 'pending' },
    ],
    findings: [],
    guardrails: [],
    context: {
      product: { path: 'PRODUCT.md', status: 'current' },
      design: { path: 'DESIGN.md', status: 'current' },
      tokenOwner: { path: 'docs/design/tokens.css', status: 'current' },
    },
    decisions: [],
    blockers: [],
  };
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function expectedTargets(stage) {
  return stage.nextTargets.join(' or ');
}

function collectLegacyCommands(value, pointer = '$', hits = []) {
  if (typeof value === 'string') {
    if (legacyCommandPattern.test(value)) hits.push(pointer);
    return hits;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectLegacyCommands(item, `${pointer}[${index}]`, hits));
    return hits;
  }
  if (isObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      collectLegacyCommands(item, `${pointer}.${key}`, hits);
    }
  }
  return hits;
}

function validate(state) {
  const errors = [];
  if (!isObject(state)) return ['state must be a JSON object'];
  for (const pointer of collectLegacyCommands(state)) {
    errors.push(`legacy /aa command must not appear in state at ${pointer}; use /he:*`);
  }
  if (state.schema !== 'he-state/v1') errors.push('schema must be he-state/v1');
  if (typeof state.feature !== 'string' || !state.feature.trim()) errors.push('feature is required');
  if (typeof state.updatedAt !== 'string' || !state.updatedAt.trim()) errors.push('updatedAt is required');
  const stage = stages.get(state.stage);
  if (!stage) errors.push('stage must be one of he-plan, he-implement, he-verify, he-ship, he-learn');
  if (stage && state.stageIndex !== stage.index) errors.push(`stageIndex must be ${stage.index} for ${state.stage}`);
  if (!stateStatuses.has(state.status)) errors.push('status must be in_progress, blocked, ready, or complete');
  if (typeof state.currentStep !== 'string' || !state.currentStep.trim()) errors.push('currentStep is required');
  if (!isObject(state.next)) {
    errors.push('next is required');
  } else {
    if (typeof state.next.target !== 'string' || !state.next.target.trim()) errors.push('next.target is required');
    if (stage && !stage.nextTargets.includes(state.next.target)) errors.push(`next.target must be ${expectedTargets(stage)} for ${state.stage}`);
    if (typeof state.next.ready !== 'boolean') errors.push('next.ready must be boolean');
  }
  if (!Array.isArray(state.findings)) {
    errors.push('findings must be an array');
  } else {
    for (const [index, finding] of state.findings.entries()) {
      if (!isObject(finding)) {
        errors.push(`findings[${index}] must be an object`);
        continue;
      }
      for (const key of ['id', 'stage', 'summary', 'ownerStage', 'status']) {
        if (typeof finding[key] !== 'string' || !finding[key].trim()) errors.push(`findings[${index}].${key} is required`);
      }
      if (finding.status && !findingStatuses.has(finding.status)) errors.push(`findings[${index}].status is invalid`);
      if (finding.stage && !stages.has(finding.stage)) errors.push(`findings[${index}].stage is invalid`);
      if (finding.ownerStage && !stages.has(finding.ownerStage)) errors.push(`findings[${index}].ownerStage is invalid`);
      if (finding.owner !== undefined && typeof finding.owner !== 'string') errors.push(`findings[${index}].owner must be a string`);
      if (!stringArray(finding.ownerProof)) errors.push(`findings[${index}].ownerProof must be string[]`);
      if (!stringArray(finding.artifacts)) errors.push(`findings[${index}].artifacts must be string[]`);
      if (finding.guardrailId !== undefined && typeof finding.guardrailId !== 'string') errors.push(`findings[${index}].guardrailId must be a string`);
      if (finding.blocking !== undefined && typeof finding.blocking !== 'boolean') errors.push(`findings[${index}].blocking must be boolean`);
    }
  }
  if (!Array.isArray(state.guardrails)) {
    errors.push('guardrails must be an array');
  } else {
    for (const [index, guardrail] of state.guardrails.entries()) {
      if (!isObject(guardrail)) {
        errors.push(`guardrails[${index}] must be an object`);
        continue;
      }
      for (const key of ['id', 'stage', 'kind', 'owner', 'command', 'status']) {
        if (typeof guardrail[key] !== 'string' || !guardrail[key].trim()) errors.push(`guardrails[${index}].${key} is required`);
      }
      if (guardrail.kind && !guardrailKinds.has(guardrail.kind)) errors.push(`guardrails[${index}].kind is invalid`);
      if (guardrail.status && !guardrailStatuses.has(guardrail.status)) errors.push(`guardrails[${index}].status is invalid`);
      if (guardrail.stage && !stages.has(guardrail.stage)) errors.push(`guardrails[${index}].stage is invalid`);
      if (!stringArray(guardrail.evidence)) errors.push(`guardrails[${index}].evidence must be string[]`);
      if (guardrail.blocksPush !== undefined && typeof guardrail.blocksPush !== 'boolean') errors.push(`guardrails[${index}].blocksPush must be boolean`);
      if (['passed', 'failed', 'blocked', 'skipped'].includes(guardrail.status) && guardrail.evidence?.length === 0) {
        errors.push(`guardrails[${index}].evidence is required for ${guardrail.status}`);
      }
    }
  }
  if (state.context !== undefined) {
    if (!isObject(state.context)) {
      errors.push('context must be an object');
    } else {
      for (const key of ['product', 'design', 'tokenOwner']) {
        const entry = state.context[key];
        if (!isObject(entry)) {
          errors.push(`context.${key} is required`);
          continue;
        }
        if (typeof entry.path !== 'string' || !entry.path.trim()) errors.push(`context.${key}.path is required`);
        if (!contextStatuses.has(entry.status)) errors.push(`context.${key}.status must be current, updated, or created`);
      }
    }
  }
  if (!Array.isArray(state.steps) || state.steps.length === 0) {
    errors.push('steps must be a non-empty array');
  } else {
    const inProgress = state.steps.filter((step) => step?.status === 'in_progress');
    if (inProgress.length > 1) errors.push('only one step can be in_progress');
    for (const [index, step] of state.steps.entries()) {
      if (!isObject(step)) {
        errors.push(`steps[${index}] must be an object`);
        continue;
      }
      if (typeof step.id !== 'string' || !step.id.trim()) errors.push(`steps[${index}].id is required`);
      if (typeof step.title !== 'string' || !step.title.trim()) errors.push(`steps[${index}].title is required`);
      if (!statuses.has(step.status)) errors.push(`steps[${index}].status is invalid`);
      if (['done', 'blocked'].includes(step.status)) {
        const receipt = step.receipt;
        if (!isObject(receipt)) {
          errors.push(`steps[${index}].receipt is required for ${step.status}`);
          continue;
        }
        for (const key of ['stage', 'state', 'decision', 'blocker', 'next']) {
          if (typeof receipt[key] !== 'string') errors.push(`steps[${index}].receipt.${key} must be a string`);
        }
        if (!stringArray(receipt.ownerProof)) errors.push(`steps[${index}].receipt.ownerProof must be string[]`);
        if (!stringArray(receipt.artifacts)) errors.push(`steps[${index}].receipt.artifacts must be string[]`);
      }
    }
    if (state.next?.ready === true) {
      const unfinished = state.steps.filter((step) => ['pending', 'in_progress', 'blocked'].includes(step.status));
      if (unfinished.length) errors.push('next.ready cannot be true while steps are pending, in_progress, or blocked');
      if (!['ready', 'complete'].includes(state.status)) errors.push('state.status must be ready or complete when next.ready is true');
      const blockingFindings = state.findings?.filter((finding) => finding?.blocking === true && ['open', 'owned', 'blocked'].includes(finding.status));
      if (blockingFindings?.length) errors.push('next.ready cannot be true while blocking findings are unresolved');
      const unresolvedLearning = state.findings?.filter((finding) => finding?.ownerStage === 'he-learn' && ['open', 'owned', 'blocked'].includes(finding.status));
      if (state.stage === 'he-ship' && state.next?.target === 'loop-complete' && unresolvedLearning?.length) {
        errors.push('he-ship cannot skip he-learn while learning findings are unresolved');
      }
      if (state.stage === 'he-ship' && state.next?.target === '/he:learn' && !unresolvedLearning?.length) {
        errors.push('he-ship should target loop-complete when there are no unresolved learning findings');
      }
      if (state.stage === 'he-plan') {
        const context = state.context;
        for (const key of ['product', 'design', 'tokenOwner']) {
          if (!context?.[key] || !contextStatuses.has(context[key].status)) {
            errors.push(`he-plan ready handoff requires context.${key} to be current, updated, or created`);
          }
        }
      }
      const brokenGuardrails = state.guardrails?.filter((guardrail) => guardrail?.blocksPush === true && ['failed', 'blocked', 'planned'].includes(guardrail.status));
      if (brokenGuardrails?.length) errors.push('next.ready cannot be true while push-blocking guardrails are unresolved');
      if (['he-verify', 'he-ship'].includes(state.stage)) {
        const unprovedGuardrails = state.guardrails?.filter((guardrail) => guardrail?.blocksPush === true && !['passed', 'skipped'].includes(guardrail.status));
        if (unprovedGuardrails?.length) errors.push(`${state.stage} ready handoff requires push-blocking guardrails to be passed or explicitly skipped`);
      }
    }
  }
  return errors;
}

function usage() {
  console.error('Usage: he-state.mjs validate <state.json> | template');
}

const [command, file] = process.argv.slice(2);
if (command === 'template') {
  console.log(`${JSON.stringify(template(), null, 2)}\n`);
} else if (command === 'validate' && file) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`he-state: cannot read ${file}: ${error.message}`);
    process.exit(1);
  }
  const errors = validate(parsed);
  if (errors.length) {
    console.error(`he-state: ${errors.length} error(s)`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('he-state: pass');
} else {
  usage();
  process.exit(2);
}
