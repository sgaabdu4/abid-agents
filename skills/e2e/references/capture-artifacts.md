# Capture Artifacts

Use this before running or delegating any E2E flow.

## Artifact Tree

```text
docs/e2e/<RUN_ID>/
  state.json
  plans/INDEX.md
  plans/<flow>.md
  events.jsonl
  issues.md
  screenshots/<flow>/<step>_<status>.png
  videos/<flow>.mp4
  recaps/<flow>_2x_cursor.mp4
  traces/<flow>.zip
  logs/<flow>.log
  regression.md
  report.md
```

`events.jsonl` is the audit spine.
Each row should include `runId`, `flow`, `step`, `eventId`, `ts`, `driver`, `url` or route, `action`, `target`, `x`, `y`, `valueRedacted`, `assertion`, `status`, and artifact paths or timestamps.

## Mouse Clicker

Use the product-demo-video cursor pattern when video capture is possible:

- visible cursor overlay;
- smooth pointer movement to the target;
- click bloom or ripple at the exact click coordinate;
- emitted event metadata for hover, click, type, navigation, and assertion;
- final video composed with cursor/click layer when raw driver video lacks it.

If the driver cannot render an overlay, record coordinates in `events.jsonl` and pair each event with a screenshot or video timestamp.

## Capture Policy

Default capture:

- continuous video when supported by the chosen driver;
- final 2x speed recap video with visible cursor and click bloom when video is supported;
- `events.jsonl` for every click, input, navigation, wait, assertion, fallback, issue, and fix verification;
- screenshot after each verified step or on every failure;
- console/network logs when available;
- trace on retry/failure.

Audit capture:

- screenshot every step;
- video every flow;
- trace every flow when supported;
- final artifact linter before claiming the run is complete.

Never claim a click, input, or navigation was tested if no event row or UI artifact proves it.
If a 2x recap cannot be produced, record the missing driver or encoder capability in `report.md`.
For an existing cursor/click-layer MP4, create the recap with:

```bash
node <skill-dir>/scripts/make-2x-recap.mjs --input <video.mp4> --output <recap.mp4>
```
