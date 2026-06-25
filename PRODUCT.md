# Hard Eng Product

## Purpose

Hard Eng is a local, stateful engineering workflow for coding agents. It gives a
machine one shared rule, skill, hook, MCP, and verification surface, then routes
feature work through `/he:plan`, `/he:implement`, `/he:verify`, `/he:ship`, and
`/he:learn`.

## Users

Primary users are engineers running Codex on macOS who want agent work to survive
context changes, use deterministic guardrails, and ship through repeatable local
and CI gates.

## Product Surface

- Install modes: `--full`, `--skills-only`, `--prereqs-only`, `--uninstall`
- Workflow state: `he-state.json`, stage receipts, findings, and guardrails
- Safety surface: Git hooks, setup/uninstall parity, privacy scans, quality
  gates, and `no-mistakes`.
- Docs surface: `README.md`, `docs/project-workflow-gates.html`, generated
  README images, `PRODUCT.md`, and `DESIGN.md`.

## Change Rule

Any product behavior, workflow stage, install mode, scope, caveat, or user-facing
promise change must update this file in the same plan.
