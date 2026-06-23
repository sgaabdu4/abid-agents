# Abid Agents

Shared global agent config for Codex, Claude, Copilot, Pi, and compatible coding-agent runtimes.

This repo is designed to be cloned to `~/.agents`. From there it links one set of rules, skills, hooks, and MCP defaults into each agent home so every machine behaves the same way.

---

## 1. Install

New machine:

```sh
curl -fsSL https://raw.githubusercontent.com/sgaabdu4/abid-agents/main/scripts/setup.sh | bash
```

Existing clone:

```sh
cd "$HOME/.agents"
./scripts/setup.sh
```

The setup script detects whether `~/.agents` already exists. On macOS it installs missing bootstrap prerequisites first: Xcode Command Line Tools prompt, Homebrew, Git, Node/npm, Dart, Flutter, and a managed shell PATH block. It then clones or updates the repo, initializes pinned submodules, installs MCP tools, links agent configs and skills, installs local Git hooks, installs or updates [`no-mistakes`](https://github.com/kunchenguid/no-mistakes), and initializes the `.agents` repo for `git push no-mistakes`. After the repo is available, independent setup phases run in parallel where they do not share mutable package-manager state.

When run in a terminal, setup asks whether to install `no-mistakes`, enable cron, and initialize extra repos. In non-interactive runs, defaults are safe: `no-mistakes` on, cron off, extra repos only from env vars.

The setup is conservative:

- links agent `AGENTS.md` files to the canonical `~/.agents/AGENTS.md`
- preserves existing non-managed config files and conflicting skill folders instead of overwriting them
- initializes pinned submodules
- installs local Git hooks for this repo
- leaves cron disabled unless you explicitly enable it
- initializes extra `no-mistakes` repos only when `ABID_AGENTS_NO_MISTAKES_REPOS=/repo/a:/repo/b` is set

Useful setup switches:

| Variable | Effect |
| --- | --- |
| `ABID_AGENTS_ENABLE_CRON=1` | Install the optional auto-sync cron during setup. |
| `ABID_AGENTS_SKIP_PREREQ_INSTALL=1` | Skip prerequisite repair. |
| `ABID_AGENTS_SKIP_HOMEBREW_INSTALL=1` | Fail instead of installing Homebrew when it is missing. |
| `ABID_AGENTS_SKIP_FLUTTER_INSTALL=1` | Skip Flutter SDK installation. |
| `ABID_AGENTS_FLUTTER_HOME=/path/to/flutter` | Install or detect Flutter at a custom path. |
| `ABID_AGENTS_SKIP_SHELL_PATH_UPDATE=1` | Do not write the managed `~/.zshenv` PATH block. |
| `ABID_AGENTS_SETUP_NO_MISTAKES=0` | Answer no to the setup-time `no-mistakes` question. |
| `ABID_AGENTS_SKIP_NPM_INSTALL=1` | Skip MCP tool installation. |
| `ABID_AGENTS_SKIP_NO_MISTAKES=1` | Skip installing and initializing `no-mistakes`. |
| `ABID_AGENTS_SKIP_NO_MISTAKES_INIT=1` | Install `no-mistakes` but skip repo initialization. |
| `ABID_AGENTS_NO_MISTAKES_REPOS=/repo/a:/repo/b` | Initialize extra repos for `git push no-mistakes`. |

---

## 2. What gets linked

Agent instruction files are symlinks to `~/.agents/AGENTS.md`. Keep local overrides in project-level `AGENTS.md` files, not in installed global copies.

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
| `codex/bin/` | Token-free Codex watchdog and health scripts installed under `~/.codex/bin`. |
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
- Tool-installed skills: written by their CLI owner, such as `no-mistakes`.

Workflow defaults: use `grill-me` to clarify ambiguous work before building, then use [`no-mistakes`](https://github.com/kunchenguid/no-mistakes) through `/no-mistakes` or `git push no-mistakes` to validate committed shipping work after implementation.

Planning and engineering helpers:

- `diagnosing-bugs`: isolate hard bugs before patching.
- `codebase-design`: decide module ownership, public interfaces, and abstraction shape.
- `to-prd`: turn resolved context into a PRD or implementation brief.
- `to-issues`: split an accepted plan into vertical-slice issues.

Quick routing:

| Need | Use |
| --- | --- |
| Clarify ambiguous work before building | `grill-me` |
| Diagnose hard bugs, flakes, regressions | `diagnosing-bugs` |
| Decide module ownership or abstraction shape | `codebase-design` |
| Turn resolved context into a spec | `to-prd` |
| Split a plan into agent-ready slices | `to-issues` |
| Design or repair tests | `test-quality` |
| UI systems, tokens, or product polish | `atomic-ui` + `impeccable` |
| User-like UI regression proof | `e2e` |
| Latency or efficiency work | `performance-rescue` |
| Security, auth, secrets, or data exposure | `security-review` |
| Strict maintainability review | `thermo-nuclear-code-quality-review` |
| Final validation, push, PR, or CI gate | `no-mistakes` |

Local skill budget:

- `SKILL.md` under 100 lines
- preferably under 1,200 `o200k_base` tokens
- description under 300 characters
- detailed workflows moved to `references/*.md` or scripts

Upstream and tool-installed skills are updated from their source repos or CLI owners. Do not compress or patch them locally unless the change belongs upstream.

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

Cron runs `scripts/auto-sync.sh`. It updates `no-mistakes`, pulls `main`, bumps submodules, scans for private paths and secret-like values, commits changed pins, and pushes `main`.

Useful switches:

| Variable | Effect |
| --- | --- |
| `ABID_AGENTS_SKIP_NPM_INSTALL=1` | Skip MCP tool installation. |
| `ABID_AGENTS_SKIP_SUBMODULE_INIT=1` | Skip install-time submodule init. |
| `ABID_AGENTS_SKIP_SUBMODULE_UPDATE=1` | Skip pull-hook submodule updates. |
| `ABID_AGENTS_SKIP_SUBMODULE_BUMP=1` | Cron uses pinned commits only. |
| `ABID_AGENTS_SKIP_NO_MISTAKES_UPDATE=1` | Skip cron-time `no-mistakes update`. |
| `ABID_AGENTS_NO_MISTAKES_BIN=/path/to/no-mistakes` | Override the CLI path used by cron. |
| `ABID_AGENTS_CHECK_SUBMODULES_BEFORE_PUSH=1` | Print submodule status before push. |
| `ABID_AGENTS_ENABLE_CRON=1` | Install the optional cron job during install. |

---

## 8. Shipping and safety checks

Default shipping path: use [`no-mistakes`](https://github.com/kunchenguid/no-mistakes) through `/no-mistakes` or `git push no-mistakes` after a repo has been initialized with `no-mistakes init`.
Use direct `git push origin ...` only when explicitly requested or when the gate is unavailable.

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
./scripts/setup.sh
```

Change this repo for global behavior. Add a project-local `AGENTS.md` when one project needs different rules.
