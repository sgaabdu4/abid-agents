# Agent config

Portable source of truth for agent instructions, skills, hooks, subagent prompts, and MCP defaults across multiple agent harnesses.

This repo is meant to be cloned into `~/.agents` on any local or remote machine, then linked into the harness-specific homes that need it: Codex, Claude, Copilot, Pi, and compatible agent runtimes.

## What Is Included

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Global agent rules and tool-routing policy. |
| `COPILOT.md` | Copilot-facing entrypoint that points back to the shared rules. |
| `skills/` | Canonical skill set shared across harnesses. |
| `hooks/` | Shared safety hooks. |
| `codex/hooks.json` | Global Codex hook defaults: security gate plus quiet context-mode continuity hooks. |
| `agents/` | Subagent role prompts. |
| `mcp-config.json` | Portable MCP defaults for `context-mode` and `codebase-memory-mcp`. |
| `scripts/install.sh` | Symlinks this repo into local agent homes. |
| `scripts/install-mcp-tools.sh` | Installs `context-mode` and `codebase-memory-mcp` when missing. |
| `scripts/update-submodules.sh` | Initializes pinned skill submodules or bumps them to latest upstream. |
| `scripts/auto-sync.sh` | Pulls `main` and updates submodules to the pinned commits recorded here. |
| `scripts/sync-subtrees.sh` | Compatibility wrapper for the old subtree command. |
| `scripts/install-cron.sh` | Installs the optional local cron job that runs `scripts/auto-sync.sh`. |

Local runtime state is intentionally excluded: hook logs, backups, caches, database files, machine-specific paths, and local MCP indexes.

## Install On Any Machine

```sh
git clone <agent-config-repo-url> "$HOME/.agents"
"$HOME/.agents/scripts/install.sh"
```

`scripts/install.sh` publishes the shared source into each harness home:

- Installs missing MCP tools: `context-mode` and `codebase-memory-mcp`.
- `AGENTS.md` into `~/.codex`, `~/.claude`, `~/.copilot`, `~/.pi`, and `~/.pi/agent`.
- `mcp-config.json` into `~/.codex/mcp-config.json`.
- `codex/hooks.json` into `~/.codex/hooks.json`. The global Codex template keeps context-mode `SessionStart` and `UserPromptSubmit` enabled for session continuity, but `SessionStart` runs through a quiet wrapper that strips injected `additionalContext` before Codex sees it. `PostToolUse` stays disabled globally.
- Every `skills/*` directory into each harness skills folder when that folder exists.

Existing non-symlink config files are backed up with a timestamp before the repo-owned symlink is installed; conflicting skill targets are skipped.

Set `ABID_AGENTS_SKIP_NPM_INSTALL=1` to skip MCP tool installation.

The installer also initializes skill submodules, sets repo-local Git pulls to `pull.rebase=false` and `pull.ff=only`, adds local `.git/hooks/post-merge`, `.git/hooks/post-rewrite`, and `.git/hooks/pre-push` hooks for this clone, and leaves cron disabled unless requested. Pull hooks update submodules only to the pinned commits recorded by this repo. Cron auto-sync pulls `main`, bumps submodules to their tracked upstream branches, blocks private-path or secret-like matches, commits changed submodule pins, and pushes `main`. Set `ABID_AGENTS_SKIP_SUBMODULE_INIT=1` to skip install-time submodule init, `ABID_AGENTS_SKIP_SUBMODULE_UPDATE=1` to skip pull-time submodule updates, `ABID_AGENTS_SKIP_SUBMODULE_BUMP=1` to make cron use pinned commits only, `ABID_AGENTS_CHECK_SUBMODULES_BEFORE_PUSH=1` to print submodule status before push, or `ABID_AGENTS_ENABLE_CRON=1` to install the optional cron job.

## Remote Bootstrap Example

Use this pattern in a remote setup script. The install step links Codex MCP and hook defaults.

```sh
git clone <agent-config-repo-url> "$HOME/.agents"
"$HOME/.agents/scripts/install.sh"
```

Add a repo-level `AGENTS.md` inside any project when project-specific rules should override the global file.

## Submodule Skills

Read-only upstream skills are Git submodules under `vendor/skill-upstreams/`.
The `skills/<name>` entries are symlinks into those submodules so every agent
runtime still sees `skills/<name>/SKILL.md`.

Clone with submodules:

```sh
git clone --recurse-submodules <agent-config-repo-url> "$HOME/.agents"
```

Initialize or repair submodules in an existing clone:

```sh
git submodule update --init --recursive
```

| Skill path | Submodule | Source path |
| --- | --- |
| `skills/vercel-react-best-practices` | `vendor/skill-upstreams/vercel-agent-skills` | `skills/react-best-practices` |
| `skills/impeccable` | `vendor/skill-upstreams/impeccable` | `.agents/skills/impeccable` |
| `skills/fallow` | `vendor/skill-upstreams/fallow-skills` | `fallow/skills/fallow` |
| `skills/react-doctor` | `vendor/skill-upstreams/react-doctor` | `skills/react-doctor` |
| `skills/skill-creator` | `vendor/skill-upstreams/anthropic-skills` | `skills/skill-creator` |
| `skills/tavily-cli` | `vendor/skill-upstreams/tavily-skills` | `skills/tavily-cli` |
| `skills/appwrite-backend` | `vendor/skill-upstreams/appwrite-backend` | repo root |
| `skills/building-flutter-apps` | `vendor/skill-upstreams/building-flutter-apps` | repo root |
| `skills/sentry-cli` | `vendor/skill-upstreams/sentry-cli` | `plugins/sentry-cli/skills/sentry-cli` |
| `skills/sentry-feature-setup` | `vendor/skill-upstreams/sentry-for-ai` | `skills/sentry-feature-setup` |
| `skills/sentry-sdk-setup` | `vendor/skill-upstreams/sentry-for-ai` | `skills/sentry-sdk-setup` |
| `skills/sentry-workflow` | `vendor/skill-upstreams/sentry-for-ai` | `skills/sentry-workflow` |

Sentry skills are vendored from official Sentry repositories. `sentry-cli`
comes from `getsentry/cli`; setup and workflow router skills come from
`getsentry/sentry-for-ai`. Do not expose every leaf Sentry SDK skill in
`skills/`; the router skills load the detailed leaf instructions only when
needed.

Normal `git pull` updates this repo and checks out the pinned submodule commits.
This repo uses fast-forward-only pulls; if local and remote diverge, stop and
resolve deliberately instead of rebasing old subtree merge commits. Cron
auto-sync also bumps submodules to latest tracked upstream, commits the changed
pins, and pushes `main`. To bump upstream skill pins manually:

```sh
./scripts/update-submodules.sh --remote
git status --short
git add .gitmodules vendor/skill-upstreams
git commit -m "Update skill submodules"
```

The update script refuses `--remote` when tracked files or the index are dirty.
For the same pull, auto-bump, commit, and push flow cron runs:

```sh
./scripts/auto-sync.sh
```

The cron installer stores its managed block between `# BEGIN agent-config auto-sync` and `# END agent-config auto-sync`. Override the default schedule with `ABID_AGENTS_CRON_SCHEDULE`, for example `ABID_AGENTS_CRON_SCHEDULE="*/5 * * * *" ./scripts/install-cron.sh`.

## Publishing Safety

Before pushing public changes, run:

```sh
git status --short --branch
git ls-files | grep -E '(^|/)(\.DS_Store|__pycache__|\.codebase|\.codebase-memory|hooks/logs|backups|.*\.pyc$|.*\.sqlite|.*\.db|.*\.key|.*\.pem|.*\.env)' || true
git grep -nF "$HOME" -- . || true
git grep -nE '(sk-[A-Za-z0-9_-]{20,}|github_pat_|gh[pousr]_|AKIA[0-9A-Z]{16})' -- . || true
node tests/agents-md-contract.test.mjs
node tests/codex-hooks-contract.test.mjs
node tests/security-pretooluse-env.test.mjs
node tests/protect-secrets-env.test.mjs
```

Do not commit secrets, local paths, runtime logs, machine-local MCP state, or private repo data.

## Daily Use

Edit `~/.agents` as the source of truth, commit changes, and push to `main`. Local and remote harnesses should pull or reclone this repo, then rerun `scripts/install.sh`.
