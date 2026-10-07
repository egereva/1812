# Stage 6.3.5 — Final Map QA and Stage 6.3 closure

**Stage 6.3.5 — COMPLETE. Stage 6.3 — COMPLETE. Stage 6 remains IN PROGRESS. Stage 7 NOT STARTED.** QA performed on 2026-10-06 against the approved final implementation, using real Yandex API 3.0 in Chromium and the generated static output.

## Defect and fix

At 850px and below, the selected Place card's former 12px bottom inset covered the provider terms/attribution links. A browser hit-test confirmed that both links were covered by `.map-place-card`. `app/components/MapPlaceCard.vue` now uses a 44px bottom inset (`0.75rem → 2.75rem`, 32px upward adjustment). The card's width, height limit, internal scroll, media, typography and state are unchanged. Provider-owned controls and links were not modified. Final hit-tests pass in RU/EN at 320/390/768/1440; attribution is visible with the selected card open. No other production defect was found.

## Integrated results

| Area | Result and evidence |
| --- | --- |
| Normal Map | Both locales contain 13 approved Places. Ready-state All/1812/Memory index membership is exactly 13/6/7 and markers follow the selected semantic layer. Changing to an incompatible layer clears the selected card; history/reload restore coherent state. |
| Locked markers | One imported approved SVG; graphite/burgundy by layer; body widths 32/36/42px, 56×64px hit area, tip-anchored scaling and internal selected inversion. Real hover/focus/selected transforms and reduced-motion duration checked; no halo, badge, pulse or status-specific shape added. |
| Overlap/fan-out | Real camera cycle 15 → 12 → 15 restores identical marker titles/classes/offsets. Mixed-layer groups retain both colors. Actual touch selection reached all eight members of the zoom-13 close group; reopening restores identical fan-out offsets and no duplicate/ghost markers. Pure tests verify coordinate immutability and deterministic grouping across repeated zooms/layers. |
| Place cards | All 13 cards per locale checked against production title, status, description, note and image presence. All six historical statuses, exact/approximate and image/no-image cases covered. Image alt and lazy loading preserved; no placeholder. Localized detail link and keyboard Escape/close/focus return pass. Compact internal scrolling keeps the detail CTA reachable. |
| Place → Map | Fili, Kutuzov Hut and Poklonnaya Hill detail CTAs open localized `?place=` URLs in the same tab, select the correct card and focus the camera. Back/Forward pass. All 26 deep-linked cards were checked. |
| Timeline → Map | council-fili and borodino pass in both locales: four related Places each, fitted camera, no initial card, plain non-interactive event title, no normal tabs, usable legend, local card selection with event URL retained, scope preserved on close, All places exit and history. Generated checks cover conditional CTA presence for all events. |
| Dictionary | Generated checks cover all 58 pages: 17/29 with Places, 12 omitted, maximum six per locale; direct/inverse union and catalog order, after article/before Sources, localized same-tab links. Browser checks at four widths cover Bagration (one), Kutuzov (several), Fili (six) and Alexander I (none). No generic Map CTA/query. |
| Index/legend | Native disclosures, 3/2/1 responsive columns, 44px index links, correct layer/event membership. Initially closed legend contains only two decorative color samples and explicit 1812/Memory labels. Keyboard disclosure operation and visible focus pass. |
| Homepage | Both locales retain catalog-derived 13, approved leads, three semantic unlinked examples, static abstract geometry, aria-hidden decoration and localized sole CTA. No obsolete counter or overflow at 320/390/768/1440. Initial load, scroll and CTA hover/focus produced zero Yandex/Yastatic requests on fresh generated Homepage documents. |
| URL/state | Normal, valid/invalid Place, valid/invalid event and both-valid Place/event checked in RU/EN. Valid Place takes precedence. State/layer changes, reload and Back/Forward pass; camera interaction does not add URL parameters. Pure tests also cover malformed/empty scopes and manual layer semantics. |
| Resilience | Actual missing-key development preview used a separate empty dotenv file without editing `.env`. Blocked API and static no-JS checked in both locales. Each retains 13 useful Place links, same-tab keyboard navigation and no client exception or dead end. Event API failure keeps its scoped index plus the complete fallback list. |
| Responsive | RU/EN 320/390/768/1440 checked for header, layers, event row, frame, selected card, chooser, index, legend, Homepage and representative Dictionary relations. No horizontal overflow or clipped essential text. Chooser and card never compete; provider strip is clear after correction. |
| Accessibility | Native links/buttons/disclosures, one H1 on sampled pages, semantic card H2/list structure, accessible marker status/precision labels, keyboard chooser selection and title focus, Escape/close return, visible focus and reduced motion pass. Meaning does not depend on color alone. Touch chooser/card/close verified in a touch-enabled Chromium context. |
| Lifecycle | Instrumented real map: four observed instances across Map → Place/Timeline/Home → Map; three unmounts call destroy; three newly mounted map listeners and matching pointer-listener removal for the three exits. One canvas while mounted, none off Map, one API script throughout same-document navigation. No obvious accumulation. Map language switch performs intentional same-tab document navigation and successfully reloads the correct API language. |
| Links | Generated audit of 138 HTML files passes: application links same-tab; external source/attribution links `_blank` with `noopener noreferrer`. Provider-owned Yandex links remain untouched. |
| Content | Production content has no Git diff. Existing integrity tests confirm RU/EN IDs/slugs, coordinates, statuses, sources, relations and media parity. No historical research/content edits were needed. |

## Checks and output

- Focused Map/helper/chooser/index tests: **26/26** (8 helper, 4 chooser, 14 actual-page index/legend).
- Generated Homepage **4/4**, Dictionary/fallback **60/60**, Timeline detail **40/40**, generated link audit **1/1**, 138 HTML files.
- Full standard suite **30/30**, including content/relation integrity and link rules.
- Typecheck, ESLint and project Prettier PASS. After the single CSS correction, card-scoped ESLint/Prettier and the real card/attribution regression passed.
- Static generate PASS: **277 routes**, all **124** expected localized dynamic detail routes (26 Place, 58 Dictionary, 40 Timeline). Generation was refreshed after the demonstrated CSS defect; generated regressions passed against that final output.
- No page exceptions in integrated live, lifecycle, touch, resilience or final visual matrices. Existing nonblocking Nuxt timer/devtools diagnostics remain.

Changed production files: `app/components/MapPlaceCard.vue` only. Documentation: `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md` and this audit. QA scripts, sanitized measurements, logs and screenshots are under `.playwright-mcp/stage-6-3-5/`; no API key is included in reports, measurement JSON or screenshots.

## Representative screenshots

- [RU 1440 selected card](../../.playwright-mcp/stage-6-3-5/ru-1440-final-selected.png)
- [RU 390 selected card and clear provider strip](../../.playwright-mcp/stage-6-3-5/ru-390-final-selected.png)
- [RU 320 selected card](../../.playwright-mcp/stage-6-3-5/ru-320-final-selected.png)
- [RU 768 selected card](../../.playwright-mcp/stage-6-3-5/ru-768-final-selected.png)
- [EN 1440 selected card](../../.playwright-mcp/stage-6-3-5/en-1440-final-selected.png)
- [EN 390 selected card](../../.playwright-mcp/stage-6-3-5/en-390-final-selected.png)
- [RU 390 event-context selection](../../.playwright-mcp/stage-6-3-5/ru-390-final-event-selected.png)
- [RU 390 chooser before selection](../../.playwright-mcp/stage-6-3-5/ru-390-chooser.png)
- [RU 1440 expanded index/legend](../../.playwright-mcp/stage-6-3-5/ru-1440-final-index-legend.png)
- [EN 390 expanded index/legend](../../.playwright-mcp/stage-6-3-5/en-390-final-index-legend.png)
- [RU 320 Dictionary related Places](../../.playwright-mcp/stage-6-3-5/ru-320-dictionary.png)
- [EN 768 Dictionary related Places](../../.playwright-mcp/stage-6-3-5/en-768-dictionary.png)
- [RU 768 Homepage Map Preview](../../.playwright-mcp/stage-6-3-5/ru-768-homepage.png)
- [RU missing-key fallback](../../.playwright-mcp/stage-6-3-5/ru-missing-key-fallback.png)
- [EN blocked-API fallback](../../.playwright-mcp/stage-6-3-5/en-blocked-api-fallback.png)
- [EN no-JS fallback](../../.playwright-mcp/stage-6-3-5/en-no-js-fallback.png)

Complete width/localization captures and machine-readable results: `live-checks.json`, `final-visual-checks.json`, `lifecycle-checks.json`, `fanout-touch-checks.json`, `resilience-checks.json` in the same artifact directory.

## Documentation and limits

Production docs now describe the final one-shape/two-color marker system, 13/6/7 layers, event scope and plain event title, Dictionary related Places, final index/legend, static API-free Homepage, card/chooser coordination and provider clearance. Obsolete deferred-integration, component-name and section-counter wording was corrected. Historical proposal/audit records remain historical.

Static hosting cannot resolve query-specific event/Place state without JavaScript; its generic Map HTML intentionally keeps all 13 navigation links. Event card selection intentionally stays local and is not restored as a separate Place permalink. External Yandex availability/tile timing remains provider-dependent. Touch and responsive checks used Chromium emulation rather than physical devices; sampled lifecycle instrumentation does not constitute a long-running heap profile. Tests ran in the available Node 26.4.0 environment, while the project's declared deployment engine remains Node 22. No unresolved implementation blocker or new product/design decision remains.

**Stage 6.3 — COMPLETE.**
