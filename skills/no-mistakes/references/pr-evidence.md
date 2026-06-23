# PR Evidence Repair

Use this before finalizing any no-mistakes run that opened or updated a PR.

## Required result

- PR description contains actual GitHub links, not machine-local paths.
- UI work has screenshots when the run captured them.
- Screenshots are GitHub `user-attachments` URLs or another reviewer-openable
  URL, never committed evidence files.
- no-mistakes findings are shown as resolved or open.
- Removed local-only values include `/Users`, `/var/folders`,
  `no-mistakes-evidence`, `localhost`, `127.0.0.1`, `file:`, and `local file`.

## Command

Run from the repository that owns the PR:

```sh
node "$HOME/.agents/skills/no-mistakes/scripts/repair-pr-evidence.mjs"
```

Useful flags:

```sh
node "$HOME/.agents/skills/no-mistakes/scripts/repair-pr-evidence.mjs" --pr 3
node "$HOME/.agents/skills/no-mistakes/scripts/repair-pr-evidence.mjs" --screenshots /path/to/screenshots
node "$HOME/.agents/skills/no-mistakes/scripts/repair-pr-evidence.mjs" --dry-run
```

## If upload fails

Do not leave local file paths in the PR body.
State that screenshots were captured but upload failed, include the error at a
high level, and keep the rest of the evidence section accurate.

## Verification

After updating the PR body, check:

```sh
gh pr view --json body --jq '.body' | rg -n '/Users|/var/folders|local file|no-mistakes-evidence|127\\.0\\.0\\.1|localhost|file:' || true
gh pr view --json body --jq '.body' | rg -n 'github.com/user-attachments|No-mistakes Evidence|Resolved|Open'
git status --short
```
