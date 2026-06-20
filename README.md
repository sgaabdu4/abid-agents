# Abid Agents

Shared global agent config for Codex, Claude, Copilot, Pi, and compatible coding-agent runtimes.

This repo is designed to be cloned to `~/.agents`. From there it links one set of rules, skills, hooks, and MCP defaults into each agent home so every machine behaves the same way.

---

## 1. Install

New machine:

```sh
git clone --recurse-submodules https://github.com/sgaabdu4/abid-agents.git "$HOME/.agents"
"$HOME/.agents/scripts/install.sh"
```

Existing clone:

```sh
cd "$HOME/.agents"
git pull --ff-only
./scripts/update-submodules.sh --init
./scripts/install.sh
```

The installer is conservative:

- backs up existing non-symlink config files before replacing them
- skips conflicting skill folders instead of overwriting them
- initializes pinned submodules
- installs local Git hooks for this repo
- leaves cron disabled unless you explicitly enable it

---

## 2. What gets linked

| Agent/runtime | Linked config |
| --- | --- |
| Codex | `~/.codex/AGENTS.md`, `~/.codex/mcp-config.json`, `~/.codex/hooks.json`, `~/.codex/skills/*` |
| Claude | `~/.claude/AGENTS.md`, `~/.claude/skills/*` |
| Copilot | `~/.copilot/AGENTS.md`, `~/.copilot/skills/*` |
| Pi | `~/.pi/AGENTS.md`, `~/.pi/skills/*` |
| Pi agent | `~/.pi/agent/AGENTS.md`, `~/.pi/agent/skills/*` |

`~/.claude/CLAUDE.md` should include:

```md
@AGENTS.md
```

That keeps Claude pointed at the same global rules as the other runtimes.

---

## 3. What is inside

| Path | Role |
| --- | --- |
| `AGENTS.md` | Global rules: tool routing, blast-radius checks, verification gates, writing style, and skill budgets. |
| `skills/` | The active skill surface. Local skills are real folders; upstream skills are symlinks. |
| `vendor/skill-upstreams/` | Git submodules for read-only upstream skills. |
| `hooks/` | Safety hooks for command blocking, secret protection, and Codex session behavior. |
| `codex/hooks.json` | Codex hook wiring. |
| `mcp-config.json` | Shared MCP defaults for `context-mode` and `codebase-memory-mcp`. |
| `agents/` | Subagent role prompts. |
| `scripts/` | Install, submodule update, cron, and compatibility helpers. |
| `tests/` | Contract checks for symlinks, hooks, env behavior, and repo policy. |

Ignored local state includes hook logs, backups, caches, `.skill-lock.json`, MCP indexes, and machine-specific files.

---

## 4. Skills

The active skill list lives in `skills/`.

There are two types:

- Local skills: owned by this repo and kept small.
- Upstream skills: pinned as submodules and exposed through symlinks.

Local skill budget:

- `SKILL.md` under 100 lines
- preferably under 1,200 `o200k_base` tokens
- description under 300 characters
- detailed workflows moved to `references/*.md` or scripts

Upstream skills are updated from their source repos. Do not compress or patch them locally unless the change belongs upstream.

---

## 5. Upstream skill pins

| Active skill | Upstream repo | Source path |
| --- | --- | --- |
| `skills/vercel-react-best-practices` | `vercel-labs/agent-skills` | `skills/react-best-practices` |
| `skills/impeccable` | `pbakaus/impeccable` | `.agents/skills/impeccable` |
| `skills/fallow` | `fallow-rs/fallow-skills` | `fallow/skills/fallow` |
| `skills/react-doctor` | `millionco/react-doctor` | `skills/react-doctor` |
| `skills/skill-creator` | `anthropics/skills` | `skills/skill-creator` |
| `skills/tavily-cli` | `tavily-ai/skills` | `skills/tavily-cli` |
| `skills/appwrite-backend` | `sgaabdu4/appwrite-backend` | repo root |
| `skills/building-flutter-apps` | `sgaabdu4/building-flutter-apps` | repo root |
| `skills/sentry-cli` | `getsentry/cli` | `plugins/sentry-cli/skills/sentry-cli` |
| `skills/sentry-feature-setup` | `getsentry/sentry-for-ai` | `skills/sentry-feature-setup` |
| `skills/sentry-sdk-setup` | `getsentry/sentry-for-ai` | `skills/sentry-sdk-setup` |
| `skills/sentry-workflow` | `getsentry/sentry-for-ai` | `skills/sentry-workflow` |

Sentry is exposed through `sentry-cli` plus three router skills. The full SDK skill library stays in `getsentry/sentry-for-ai`, and leaf skills are loaded only when the task needs them.

---

## 6. Updating skills

Initialize or repair pinned submodules:

```sh
./scripts/update-submodules.sh --init
```

Bump upstream skill pins:

```sh
./scripts/update-submodules.sh --remote
git status --short
git add .gitmodules vendor/skill-upstreams
git commit -m "Update skill submodules"
git push origin main
```

`--remote` refuses to run when tracked files or the index are dirty.

---

## 7. Optional cron sync

Enable local auto-sync:

```sh
ABID_AGENTS_ENABLE_CRON=1 ./scripts/install.sh
```

Set a custom schedule:

```sh
ABID_AGENTS_CRON_SCHEDULE="*/30 * * * *" ./scripts/install-cron.sh
```

Cron runs `scripts/auto-sync.sh`. It pulls `main`, bumps submodules, scans for private paths and secret-like values, commits changed pins, and pushes `main`.

Useful switches:

| Variable | Effect |
| --- | --- |
| `ABID_AGENTS_SKIP_NPM_INSTALL=1` | Skip MCP tool installation. |
| `ABID_AGENTS_SKIP_SUBMODULE_INIT=1` | Skip install-time submodule init. |
| `ABID_AGENTS_SKIP_SUBMODULE_UPDATE=1` | Skip pull-hook submodule updates. |
| `ABID_AGENTS_SKIP_SUBMODULE_BUMP=1` | Cron uses pinned commits only. |
| `ABID_AGENTS_CHECK_SUBMODULES_BEFORE_PUSH=1` | Print submodule status before push. |
| `ABID_AGENTS_ENABLE_CRON=1` | Install the optional cron job during install. |

---

## 8. Safety checks before pushing

Run:

```sh
git status --short --branch
git diff --check
node tests/agents-md-contract.test.mjs
node tests/codex-hooks-contract.test.mjs
node tests/git-hooks-contract.test.mjs
node tests/security-pretooluse-env.test.mjs
node tests/protect-secrets-env.test.mjs
```

Scan for local paths and secret-like values:

```sh
rg -n --hidden --glob '!.git/**' --glob '!**/.git/**' -F "$HOME" .
rg -n --hidden --glob '!.git/**' --glob '!**/.git/**' '(github_pat_[A-Za-z0-9_]+|gh[pousr]_[A-Za-z0-9_]+|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----)' .
```

Never commit secrets, personal paths, runtime logs, local MCP state, generated caches, private repo data, or machine-local lock state.

---

## 9. Daily workflow

```sh
cd "$HOME/.agents"
git pull --ff-only
./scripts/update-submodules.sh --init
./scripts/install.sh
```

Change this repo for global behavior. Add a project-local `AGENTS.md` when one project needs different rules.
