---
name: to-issues
description: >-
  Break a PRD, plan, or resolved feature discussion into vertical-slice issues
  with dependencies, acceptance criteria, verification, and agent-ready context.
  Use before dispatching implementation work.
---

# To Issues

Use this after a PRD, plan, or final `grill-me` synthesis exists.
If the source plan is still ambiguous, route through `grill-me` or `to-prd`
first.

Load `references/vertical-slices.md` before drafting issues.

Coordinate with nearby skills:

- Use `codebase-design` when slices depend on ownership or interface choices.
- Use `test-quality` for acceptance and verification wording.
- Use `ship` when accepted issues should become worktree dispatch waves.

Do not create external tracker issues unless the user explicitly asks to publish.
