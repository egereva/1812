# Homepage Yandex Map Preview - ACCEPTED

Post-approval Homepage refinement, 2026-10-07. Stage 6.3 remains COMPLETE; Stage 7 has not started. Implementation is complete. The project owner now reports manual live-provider acceptance PASS (7/7), recorded in the [official Stage 6 closure](stage6-final-corrective-pass.md#official-stage-6-closure---2026-10-08). This is user-reported acceptance, not an independent Codex browser test. The automated observations below remain historical test-environment evidence.

## Implementation

- `app/pages/index.vue`: replaces the static diagram with `HomepageMapPreview`; preserves the catalog-derived count, approved copy, localized same-tab Map CTA and exactly three catalog-derived Place links (fili-village, kutuzov-hut, intercession-church-fili). Links remain secondary text, with 44px targets and visible focus.
- `app/components/HomepageMapPreview.vue`: SSR accessible localized description, reserved dimensions, ClientOnly fallback and quiet client loading/failure copy. It remains coherent without JavaScript or a key. Desktop preserves the 3:2 map/copy composition; mobile puts text first, retains the 32px CTA gap and reserves 320px map height. Footer spacing remains 48px.
- `app/components/HomepageMapCanvas.client.vue`: reuses `loadYandexMaps` and the existing approved marker SVG. All 13 Places use unchanged `[lon, lat]` coordinates; `statusLayer` supplies graphite/burgundy (6/7). Markers are plain non-focusable elements with no navigation or handlers, at 26×31px. Real positions are used without a fan or displacement guides. Dense-Fili legibility still needs live visual inspection before deciding whether minimal offsets are necessary.
- Camera uses full catalog bounds `[[37.46139, 55.7317], [37.5547, 55.75083]]` and pixel margins `[40, 32, 48, 32]` (top/right/bottom/left). No URL camera or Place/event state is introduced.
- Native `behaviors: []` disables the preview's map gestures; no exploration controls, filters, cards, balloons, legend or counters are created. Canvas CSS uses `touch-action: pan-y`. Yandex-owned attribution/controls are not modified. Their actual keyboard surface remains to be checked with a valid API response.
- `app/utils/yandexMapsLoader.client.ts`: only extends its TypeScript constructor contract for supported behaviors/margins; initialization remains the single existing memoized loader. No dependency or separate loader was added.
- `app/components/SiteHeader.vue`: Homepage joins the existing same-tab document language switch policy for Map, avoiding reuse of the previous locale's API. `/en` and `/en/` are both covered.
- `i18n/locales/{ru,en}.json`: localized real-map summary and failure copy; obsolete north/displacement strings removed.
- `app/data/homepageMapPresentation.ts`: removed because it no longer has production consumers. Its static projection test in `test/map.test.ts` is removed; existing interactive Map tests remain.
- `test/homepage-map.test.mjs`, `test/homepage-render.test.mjs`, `package.json`: focused lifecycle/loader tests join the standard test command; generated Homepage assertions cover the new SSR invitation and fallback.
- `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/ROADMAP.md`: update the changed Homepage contract and pending-review status. Historical catalogs, coordinates and media were not edited.

Supported map options: [Yandex YMap API reference](https://yandex.com/maps-api/docs/js-api/map/YMap.html).

## Loading and performance

The client waits for its Nuxt client-only DOM, then observes viewport proximity with 240px root margin. Offscreen initial Homepage loads made **0 Yandex requests** in all four tested viewports. Scrolling to the preview made **1 API-script request**, which failed; no tiles or additional Yandex resources loaded. This measures the failure path, not a successful map's complete resource cost. Actual tile/module request counts remain blocked by the key.

The shared loader is memoized. Focused tests exercise concurrent/repeated callers with one script injection. A browser API stand-in also verifies Homepage → Map → Homepage uses one script and destroys the first two instances, retaining only the current instance. This is integration/lifecycle evidence, not live-provider performance or visual evidence.

The IntersectionObserver disconnects before loading and on unmount. A disposed guard prevents creating a map if the asynchronous API resolves after unmount. The YMap instance is destroyed on unmount and after a partially initialized failure. Vue owns the preview pointer handlers and hover watcher; one YMapListener saves the first settled fitted camera and is removed before map destruction. Markers remain noninteractive. Tests cover unmount before intersection, unmount during loading, and normal destruction.

## Verification

- Standard tests: **36/36 PASS**, including focused preview tests **6/6**.
- Generated Homepage SSR: **4/4 PASS**; full Map template/index regressions: **14/14 PASS**.
- Typecheck, changed-file ESLint and project Prettier check: PASS.
- Static production generation: PASS, **277 routes** (includes client/server production bundles).
- Initial global `npm run lint` was blocked by five QA-script errors. They are resolved in the [2026-10-08 final corrective pass](stage6-final-corrective-pass.md); the current global gate passes. The original preview pass did not change those scripts.
- Static-build browser QA: RU 1440/390/320 and EN 1440, no page exceptions/hydration mismatches or horizontal overflow; four same-tab links, visible keyboard focus, reserved map height, mobile text-first ordering and 32px CTA gap. Touch scrolling passes in the failure state; successful-map gesture behavior still needs real API validation.
- RU/EN blocked-API, missing-key and no-JS paths retain the four navigation links and open the localized Map in the same tab. Missing-key/no-JS paths make no Yandex requests.
- Controlled API stand-in verifies 13 rendered markers, 6/7 colors, no marker keyboard stops, readiness, shared script reuse and map destruction. It cannot establish actual basemap appearance, fitted camera, Fili overlap readability, provider attribution keyboard behavior or live-map touch scrolling.
- Controlled API RU → EN → RU language switching also passes: each switch performs same-tab document navigation and each fresh document injects exactly one locale-specific script. This includes the `/en` Homepage route without a trailing slash.

Reproducible QA script: [homepage-yandex-qa.mjs](../../.playwright-mcp/homepage-yandex-qa.mjs). Machine-readable results: [checks.json](../../.playwright-mcp/homepage-yandex-preview/checks.json).

## Previous automated screenshots and test-environment limitation

During the previous automated Chromium QA, `NUXT_PUBLIC_YANDEX_MAPS_API_KEY` returned **HTTP 403**, provider message **Invalid api key**; Chromium blocks the response as `ERR_BLOCKED_BY_ORB`. The key is neither copied into this report nor changed. The API error is hidden from visitors. That automated failure has not been technically fixed or independently explained. Subsequent user-reported manual acceptance does not alter the recorded Chromium result or claim successful automated request-count verification.

These captures show the actual fallback, **not the real basemap**:

- [RU 1440](../../.playwright-mcp/homepage-yandex-preview/ru-1440-fallback.png)
- [RU 390](../../.playwright-mcp/homepage-yandex-preview/ru-390-fallback.png)
- [RU 320](../../.playwright-mcp/homepage-yandex-preview/ru-320-fallback.png)
- [EN 1440](../../.playwright-mcp/homepage-yandex-preview/en-1440-fallback.png)

Full-page captures beside those files include the Timeline → Map → Footer transition. All four fallback captures were inspected. These are fallback captures rather than live-basemap acceptance images. Subsequent live-provider acceptance is the owner-reported PASS (7/7) in the linked official closure; Codex did not independently execute those checks.

Automated provider recheck recorded during the corrective pass, 2026-10-08: the configured key is present locally, but the freshly generated RU Homepage at 1440 and EN Homepage at 390 fail to load the API with Chromium `net::ERR_BLOCKED_BY_ORB`. A diagnostic repeat of the same API request with the local Homepage Referer establishes **HTTP 403**, body message **Invalid api key**. Only allowlisted host/path/status/message are recorded; no key URL or response body is persisted. [Current acceptance record and sanitized evidence](stage6-final-corrective-pass.md). The preview architecture and UI are unchanged. The project owner subsequently reported manual live-provider acceptance PASS (7/7); Stage 6 is COMPLETE / ACCEPTED and Stage 7 remains NOT STARTED. The automated 403 / ERR_BLOCKED_BY_ORB remains a test-environment limitation, with no independently verified fix or explanation.
