#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const evalRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname));
const repoRoot = path.resolve(evalRoot, "../../../..");
const skillRoot = path.join(repoRoot, "skills/grill-me");
const evalsPath = path.join(evalRoot, "evals.json");
const triggersPath = path.join(evalRoot, "trigger-evals.json");
const evals = JSON.parse(fs.readFileSync(evalsPath, "utf8"));
const triggers = JSON.parse(fs.readFileSync(triggersPath, "utf8"));

const errors = [];
const ids = new Set();
const prompts = new Set();

function requireText(value, label) {
  if (typeof value !== "string" || !value.trim()) errors.push(`${label} missing text`);
}

if (evals.skill_name !== "grill-me") errors.push("skill_name must be grill-me");
if (!Array.isArray(evals.evals) || evals.evals.length < 30) {
  errors.push("expected at least 30 task evals");
}

for (const item of evals.evals || []) {
  if (!Number.isInteger(item.id)) errors.push(`eval id ${item.id} is not integer`);
  if (ids.has(item.id)) errors.push(`duplicate eval id ${item.id}`);
  ids.add(item.id);
  requireText(item.prompt, `eval ${item.id} prompt`);
  requireText(item.expected_output, `eval ${item.id} expected_output`);
  if (prompts.has(item.prompt)) errors.push(`duplicate prompt at eval ${item.id}`);
  prompts.add(item.prompt);
  if (!Array.isArray(item.files)) errors.push(`eval ${item.id} files must be array`);
  if (!Array.isArray(item.expectations) || item.expectations.length < 4) {
    errors.push(`eval ${item.id} needs at least 4 expectations`);
  }
}

const suiteText = JSON.stringify(evals).toLowerCase();
const requiredCoverage = [
  ["greenfield", 2],
  ["brownfield", 4],
  ["simple-feature", 1],
  ["understand", 4],
  ["codebase", 3],
  ["compaction", 2],
  ["session_state.md", 8],
  ["visual", 6],
  ["prototype", 8],
  ["backend", 7],
  ["verification", 8],
  ["human review", 2],
  ["rollback", 2],
  ["telemetry", 2]
];

for (const [term, min] of requiredCoverage) {
  const count = suiteText.split(term).length - 1;
  if (count < min) errors.push(`coverage term "${term}" count ${count} < ${min}`);
}

if (!Array.isArray(triggers) || triggers.length < 20) {
  errors.push("expected at least 20 trigger evals");
}
const should = triggers.filter((item) => item.should_trigger === true).length;
const shouldNot = triggers.filter((item) => item.should_trigger === false).length;
if (should < 8) errors.push("expected at least 8 should-trigger queries");
if (shouldNot < 8) errors.push("expected at least 8 should-not-trigger queries");
for (const [index, item] of triggers.entries()) {
  requireText(item.query, `trigger ${index} query`);
  if (typeof item.should_trigger !== "boolean") {
    errors.push(`trigger ${index} should_trigger must be boolean`);
  }
}

const loaded = [
  path.join(skillRoot, "SKILL.md"),
  ...fs.readdirSync(path.join(skillRoot, "modules"))
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => path.join(skillRoot, "modules", name))
];

let loadedChars = 0;
for (const file of loaded) {
  const text = fs.readFileSync(file, "utf8");
  loadedChars += text.length;
  if (/[^\x00-\x7F]/.test(text)) errors.push(`non-ascii in ${path.relative(skillRoot, file)}`);
}
if (loadedChars > 64000) {
  errors.push(`loaded skill chars ${loadedChars} exceeds 64000 budget`);
}

if (errors.length) {
  console.error("FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("PASS");
console.log(`task_evals=${evals.evals.length}`);
console.log(`trigger_evals=${triggers.length} should=${should} should_not=${shouldNot}`);
console.log(`loaded_chars=${loadedChars}`);
