# Question format module

Use before asking any user-facing interview question.

## Visible question block

Default visible format:

```text
Q<N>: <plain question>

Meaning:
<what this decision means, with one concrete example if useful>

Why it matters:
<what changes based on the answer>

Suggested default:
<A/B/C> - <one clear reason>

Options:
A) <plain option>

B) <plain option>

C) <plain option or "Not sure - use the default">

Reply: A/B/C, "use default", "not sure", "skip for now", or your own answer.
```

## Rules

- Clarity beats terseness. Normal prompt target: 12-24 lines; max 220 words.
- Use one `text` code fence containing the plain question block; no prose
  outside it during interview.
- Do not use box drawing, table borders, vertical bars, horizontal rules, or
  decorative lines.
- Use blank lines between sections and between options.
- Wrap lines around 72 chars.
- Explain enough for a nontechnical reader to answer without guessing: plain
  meaning + why it matters + one concrete example when helpful. No essay.
- Use complete sentences in the visible card. Do not compress with terse
  abbreviations or arrow shorthand.
- Avoid jargon in visible prompts. Replace `success metric` with `main pass/fail
  check`; replace `MVP gate` with `what must work before real staff use it`.
- Do not show `Stage`, `Definitions`, `Acceptance criteria`,
  `Verification/eval`, `Evidence`, or `Scenario` blocks in the visible prompt.
- Put definitions/evidence/acceptance criteria/verification/scenarios in the
  handoff/final plan only.
- Add `Details (optional)` only when needed; max 2 bullets.
- Options must be directly selectable. Avoid multi-clause options.
- If the user seems unsure, offer `Not sure - use the default`.
- If the user says `all`, `both`, or `all important`, accept it when feasible;
  record all as required and move to the next concrete behavior. Do not force a
  primary ranking unless scope truly breaks.

## Example

```text
Q3: What must work before real staff try v1?

Meaning:
Pick the test that decides "ready for real work". Other checks can
still be required.

Why it matters:
This tells us what to test first.

Suggested default:
A - it proves the core flow works.

Options:
A) Task reaches the right person with deadline + notification.

B) Any age user can create/delegate without training.

C) Malayalam voice becomes usable English task text.

Reply: A/B/C, "all", "not sure", "skip for now", or edit it.
```

## Internal record

Keep this out of the visible prompt. Use it for handoff/final-plan synthesis
only when needed.

```md
Question ID: <N>
Question: <plain question>
Stage: <intake | product | ui-flow | visual-design | prototype-tech-stack | prototype | backend-tech-stack | vertical-slices | final>
User-facing prompt: <exact visible prompt>
Suggested default: <clear choice + why>
Internal details:
- Definitions: <term = meaning | n/a>
- Options: <A/B/C + tradeoffs>
- Evidence: <code/docs/user quote | unknown>
- Why: <dependency unlocked>
- Acceptance criteria: <happy/fail/edge pass/fail checks | unknown>
- Verification/eval: <test/prototype/manual/rubric | unknown>
- Scenario: <edge case | n/a>
```

## Internal rules

- Never batch Qs.
- Always list 2-3 directly selectable options in the visible prompt and
  internal record.
- If only one option works, visible option C is `Not sure - use the default`
  and internal notes explain why.
- In internal records, every `Suggested default:` starts with `Pick <option>` or
  `Use <choice>` and one clear reason.
- Define new/product/domain/tech terms in internal `Definitions`; expose only
  unavoidable definitions in `Details (optional)`.
- Avoid vague words; name exact screen, entity, state, runtime, data source, or
  constraint.
