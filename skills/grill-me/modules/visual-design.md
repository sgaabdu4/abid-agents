# Visual design module

Use after UI flow when mapped `run` or `brief`. During Q&A, update only
`plan_draft.md`; write `03-visual-design.md` only at artifact creation, stage
close, user request, or final synthesis.

## Scope

Choose visual direction before any full-flow UI prototype. Show styled key
screens/flow moments so the user can judge the experience.

Owns:
- Impeccable project context setup.
- 2-4 distinct visual directions.
- Lavish direction boards when visual choice needs annotation.
- Register: brand or product.
- Physical scene/theme choice.
- Color strategy and OKLCH palette tokens.
- Typography, density, spacing rhythm, component feel, and motion tone.
- Styled key-screen/flow concept artifacts.
- Accessibility notes for text/background contrast.
- User choice: pick, merge, custom, or explicit use-default. No full-flow UI prototype without this choice.

Out of scope:
- Backend/API/auth/storage connection.
- Full clickable prototype build.
- Final implementation.

## Impeccable setup gate

Before directions/artifacts, load `impeccable/SKILL.md`, run
`load-context.mjs` when available, and consume the output. If `PRODUCT.md` is
missing/empty/placeholder/lacks register, pause and run the substance of
`impeccable teach` one Q at a time; never overwrite silently, then rerun the
loader. If `DESIGN.md` is missing, offer `impeccable document` scan mode for
existing UI/code or seed mode for greenfield; if skipped, continue and record
`DESIGN.md skipped`. Existing PRODUCT/DESIGN answers are anchors; do not re-ask.
Identify register and load `reference/brand.md` or `reference/product.md`.

## Required references

Load relevant impeccable refs:
- Always: `shape`, `spatial-design`, `typography`.
- Color/theming: `color-and-contrast`.
- Forms/nav/flows/permissions: `interaction-design`.
- Motion: `motion-design`.
- Responsive: `responsive-design`.
- Copy/errors/onboarding: `ux-writing`.
- Native image generation: `codex`, then palette/mock gates.
- Flutter/Dart: also load `building-flutter-apps`.

If a reference is unavailable, state it in the handoff and continue with available evidence.

## Required design behavior

Use the relevant impeccable color/theming rules:
- Pick product vs brand register before designing.
- Write the physical scene sentence before theme choice.
- Pick a color strategy before picking colors: Restrained, Committed, Full palette, or Drenched.
- Use OKLCH and semantic tokens.
- Name the initial atomic component vocabulary only enough to guide prototype reuse: atoms, molecules, organisms/templates, pages.
- Avoid `#000` and `#fff`; tint neutrals.
- Check readable text/background contrast.
- Show multiple approaches/options before narrowing.
- Reject category-reflex and AI-slop aesthetics.
- For product UI, favor earned familiarity, state coverage, consistent component vocabulary, and task focus.
- For brand UI, require a point of view, named references, imagery when the brief implies it, and non-generic composition.

## Gates

Do not compress these gates:

1. **Context gate** - PRODUCT/DESIGN context loaded, created, or explicitly skipped where allowed.
2. **Direction-input gate** - scene, color strategy, fidelity, breadth, and named references are clear enough.
3. **Palette gate** - palette/tokens are confirmed when native image generation or high-fidelity exploration is used.
4. **Direction-choice gate** - one direction is chosen, merged, customized, accepted as default, or explicitly parked.
5. **Prototype handoff gate** - chosen direction contract is recorded for the prototype.

No full-flow UI prototype before gate 4, unless the user explicitly says to skip visual design.

## Direction artifact rules

Show 2-4 meaningfully different visual directions. Differences must be structural, not trivial color swaps:
- hierarchy/topology,
- density,
- typography voice,
- color strategy,
- composition,
- component/material language,
- motion tone.

Each direction must include:
- Name.
- Register fit.
- Physical scene sentence.
- Color strategy.
- OKLCH/semantic token notes.
- Typography direction.
- Density/layout rhythm.
- Component feel.
- Accessibility notes.
- What carries into prototype if chosen.

Lavish: for annotated side-by-side choice, read
`vendor/skill-upstreams/lavish-axi/skills/lavish/SKILL.md` plus playbooks
`comparison`, `input`, sometimes `plan`/`diagram`. It does not inject a design
system: match user request, then subject-project tokens/components/CSS vars,
brand assets, or styled pages. Fallback only when absent.

If native image generation exists:
- Follow `reference/codex.md` Steps A-D.
- Ask Step A direction questions first.
- Confirm one palette before mocks.
- Generate 1-3 high-fidelity north-star mocks against that palette.
- Stop for approval before prototype/code.

If native image generation does not exist:
- State one line in the handoff: native image generation unavailable.
- Produce code-native visual direction boards or styled key-screen concepts instead.
- Web/unknown default: static HTML/CSS under `docs/planning/visual-design/<slug>/`.
- Flutter default: Flutter-native styled concept under `lib/visual_design/<slug>/` or `lib/main_visual_design.dart`.

## Preview rules

- First visual-design turn: create/update concept artifact only if useful; show preview in same reply.
- Prefer Lavish over bare localhost when the user must pick/merge/annotate/reject.
- Before showing any localhost URL, verify port is not serving something else: `lsof -iTCP:4173 -sTCP:LISTEN -n -P`.
- If `4173` is occupied by unrelated/unknown process, use next free port (`4174+`) or stop only a server you started for this visual-design artifact.
- Serve only artifact dir, never repo root: `python3 -m http.server <port> --directory docs/planning/visual-design/<slug>`.
- Web/unknown -> static HTML/CSS + verified URL to actual HTML: `http://localhost:<port>/<file>.html`; use `/` only for actual `index.html`.
- Verify URL before replying by fetching it and confirming path/title/unique marker.
- Lavish: run `npx -y lavish-axi <html-file>`, then poll. Fix `layout_warnings`
  before review.
- Label `Visual design preview:` only after verification; otherwise label `Run preview:` + exact command + expected URL.
- Flutter -> Flutter-native styled concept; verify/free port; run `flutter run -d chrome --web-port <port> -t lib/main_visual_design.dart` or target device.
- Existing code -> reuse real routes, copy, components, and tokens; if they conflict with the direction, name it.

## Stage handoff plan

At artifact creation/stage close/final synthesis, `03-visual-design.md` includes only relevant decisions:
- Impeccable setup status: loader result, PRODUCT/DESIGN status, teach/document actions or skips.
- Register and loaded impeccable references.
- Scene/theme sentence.
- Visual directions shown.
- Chosen/merged direction.
- Color strategy + OKLCH/semantic token notes.
- Typography/density/component decisions.
- Accessibility notes.
- Artifact paths.
- Preview URLs/devices + verification status.
- Lavish path/status and resolved `layout_warnings` when used.
- Native image generation status and palette/mock gates, if used.
- Prototype handoff: what the prototype must preserve from the chosen direction, including token names and initial atomic component vocabulary.
- Deferred flow or prototype details only if they affect next stage.

Clarity gate:
- Context gate is resolved.
- User has selected, merged, customized, or explicitly accepted the default visual direction.
- At least one styled key screen/flow moment exists when an artifact is needed.
- Required palette/type/density/component decisions and initial token/component vocabulary are captured enough for a prototype.
- Accessibility constraints are named or explicitly parked.
- Preview points to the actual artifact when shown.
- Lavish feedback applied or parked when used.

## Q pattern

Use `modules/questions.md`. Show verified preview/status first when available,
then ask one style choice question. Allow pick, merge, custom, use-default, or
park. Keep setup status, refs, scene, directions, tokens, type/density,
accessibility, artifact path, why, and scenario for `session_state.md`, artifact
notes, stage close, or final synthesis.

## Rules

- Show 2-4 meaningfully different style directions; do not show trivial color swaps.
- Each direction must include enough of a real screen/flow moment to judge the experience.
- Ask about visual direction, density, hierarchy, tone, and fit; do not ask the user to approve invisible implementation details.
- If the user says a direction feels wrong, ask what to preserve/change before generating more variants.
- Do not proceed to a full-flow UI prototype until visual direction is chosen, merged, customized, or explicitly accepted as the default.
- If the user cannot choose, ask what to preserve/change or generate a tighter second set of directions; do not silently pick.
- The next-stage handoff must name the chosen direction and what the prototype must reuse from it.
- Do not update `03-visual-design.md` per Q; record answers in `plan_draft.md` and summarize only at artifact creation/stage close/final synthesis.
