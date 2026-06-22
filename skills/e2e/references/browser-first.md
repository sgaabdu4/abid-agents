# Browser First Driver Policy

Use this before selecting UI automation.

## Driver Choice

- Local or public web app: use Codex Browser first when the in-app Browser tools are callable.
- Signed-in browser state, cookies, extensions, or existing user profile: use the Chrome extension/browser plugin when available.
- Existing project E2E runner: use it as regression proof after exploratory Browser/device evidence, or as the primary runner when Browser is unavailable.
- Flutter/mobile/native dialogs: use the repo's Flutter device tooling, `integration_test`, Patrol, or configured device runner.
- Standalone Playwright: use only when Browser is unavailable, the repo already owns Playwright tests, or the user asks for durable CI tests.

## Failure Handling

If Browser, Playwright, or `node_repl` probing fails or is denied, stop UI automation probing for that run.
Do not open desktop apps or try unrelated UI channels.
Use local scripts, existing tests, static inspection, and artifact checks, then report exactly which UI proof could not be collected.

## Playwright Last Resort Shape

When standalone Playwright is justified:

- use user-facing locators and web-first assertions;
- record trace on first retry/failure rather than every pass by default;
- retain screenshots/video on failure, or for every step only in audit mode;
- avoid hard waits except for external systems without observable state;
- keep generated tests as small vertical flows, not one giant tour.

## Browser Run Shape

Browser-first runs should still emit the same artifact ledger as other drivers:

- action id, timestamp, URL, locator or coordinates, action kind, and result;
- screenshot path or video timestamp after every verified step;
- console/network errors when the tool exposes them;
- fallback reason when switching to local tests or Playwright.
