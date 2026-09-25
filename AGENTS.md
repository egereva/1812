# AGENTS.md

## Project

1812 is a bilingual RU/EN educational digital museum about the
Patriotic War of 1812, with a special focus on places and historical
memory in Moscow's Western Administrative Okrug.

Stack: Nuxt 4, Vue 3, TypeScript.

## Source of truth

Read only the documentation relevant to the current task:

- Product scope and goals → `docs/PROJECT.md`
- Architecture, routing and content APIs → `docs/ARCHITECTURE.md`
- Historical content model and editorial rules → `docs/CONTENT.md`
- Visual system and UI rules → `docs/DESIGN.md`
- Current stage and future work → `docs/ROADMAP.md`

Do not read every document before every task unless the task spans them.

## Historical content

`content/ru/` and `content/en/` are audited production historical content.

Do not invent, rewrite, simplify or "correct" historical facts unless
the task explicitly requests a historical-content change.

Do not change stable IDs, slugs, dates, coordinates, relations or
source IDs as part of presentation work.

RU and EN structural parity must remain intact.

## Media

Do not invent historical images or image paths.

Do not use remote images as production assets.

`docs/research/media-manifest.json` is editorial metadata, not runtime content.

The UI must remain complete and visually coherent without images.

## Development

Follow existing project architecture and conventions.

Prefer the simplest implementation that satisfies the current stage.

Do not add dependencies when existing platform/browser/Nuxt capabilities
are sufficient.

Do not introduce Pinia or another state-management layer unless the
feature genuinely requires shared application state.

Do not overengineer abstractions for hypothetical future requirements.

## Vue / Nuxt

Use Vue 3 Composition API and `<script setup lang="ts">`.

Prefer semantic HTML and CSS before JavaScript-driven presentation.

Keep components focused and reusable only where reuse or clear semantic
boundaries exist.

Preserve static generation and localized routing.

## Accessibility

Accessibility is a baseline requirement, not a later enhancement.

Preserve:

- keyboard operation;
- visible focus;
- semantic landmarks;
- correct heading hierarchy;
- reduced-motion support;
- accessible interactive controls.

## Verification

Run the smallest relevant checks while developing.

Before completing a stage or substantial implementation task, run the
project quality gates required by `package.json` and the current roadmap.

Do not repeatedly run full build/generate after trivial edits unless
needed for verification.

## Scope

Implement only the requested stage/task.

Do not start later roadmap stages automatically.

If a future improvement is useful but outside the current scope,
report it instead of implementing it.

## Documentation

Update documentation only when the implementation changes a documented
contract, architecture decision, design rule or roadmap status.

Do not rewrite documentation merely to restate the implementation.

## Completion report

Keep final reports concise.

Report:

- what changed;
- verification performed;
- actual unresolved issues;
- whether the requested stage/task is complete.

Do not repeat the entire task specification back to the user.
