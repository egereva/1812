# Stage 6 final corrective pass — 2026-10-08

**Stage 6 - COMPLETE / ACCEPTED. Stage 7 NOT STARTED.** Previously recorded repository-controlled gates pass; the project owner now reports manual live-provider acceptance **PASS (7/7)**. The corrective-pass automated Chromium rejection remains a test-environment limitation. No historical content, production media, crops, UI, interaction or dependency changed.

## Corrections and contracts

- `.playwright-mcp/implement-homepage-real-map.mjs`: four literal two-space regex prefixes use ` {2}`; matching behavior is preserved. The one-time content-modification script was not executed.
- `.playwright-mcp/stage-6-3-5/resilience-qa.mjs`: remove the unused `readFileSync` import; behavior is unchanged.
- CONTENT confirms the existing Church 1888 source: Николай Найдёнов / Nikolay Naidenov, 1888, Общественное достояние / Public domain, Wikimedia Commons and the verified exact file-page URL. Existing source identity is preserved; no duplicate or JSON change.
- Four active comparison pairs: Kuntsevo (c. 1910/2015), Panorama (1962/2007), Church (1888/2019), Arch (1934/2015). Hut is intentionally deferred because the proposed 1887 file duplicates the Savrasov 1884 painting; that painting remains correctly attributed as a separate gallery asset.
- ARCHITECTURE and DESIGN describe the two full-frame image/year clipping layers. ROADMAP describes the current live Homepage preview and retains older static-preview QA as historical evidence. The preview report now documents its camera listener and the corrected lint status.

## Comparison browser acceptance

The [reproducible browser script](../../.playwright-mcp/stage6-final-acceptance.mjs) runs against freshly generated static output at `http://127.0.0.1:3020`, served by the existing [static server](../../.playwright-mcp/stage-6-3-4/static-server.mjs). Existing locally installed Playwright/Chromium are reused; no dependency added.

| Coverage                              | Result                                                                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| All four comparisons, EN 1440/390/768 | 12/12 PASS                                                                                                                                                         |
| All four comparisons, RU 1440/390     | 8/8 PASS                                                                                                                                                           |
| Divider positions                     | 5%, 50%, 95% PASS in all 20 cases                                                                                                                                  |
| Years                                 | Each year remains inside its image's complementary clipping layer; no opposite-image year painting. Narrow sides intentionally clip their labels.                  |
| Keyboard and focus                    | Home/End 0/100, ArrowRight/ArrowLeft five-point steps, slider name/value/instructions and visible focus PASS                                                       |
| Pointer                               | Native capture, drag to 5/95 and release PASS                                                                                                                      |
| Touch                                 | Chromium touch-enabled 390px contexts: drag to 35 and tap to 50 PASS for all eight RU/EN comparisons                                                               |
| Attribution                           | Both creators/rights and source labels/URLs match current locale data; external anchors use `_blank` and `noopener noreferrer`; Church comparison contains no 1891 |
| Responsive/accessibility              | No horizontal overflow or page exceptions; reduced-motion Home/End operation PASS                                                                                  |

[Sanitized results and asset hashes](../../.playwright-mcp/stage6-final-acceptance/checks.json) include all 20 cases. Sixty comparison screenshots (one per case/position) and two real-provider fallback screenshots are alongside that file. Representative screenshots inspected: [EN Church mobile 50%](../../.playwright-mcp/stage6-final-acceptance/en-390-intercession-church-fili-50.png), [EN Arch tablet 95%](../../.playwright-mcp/stage6-final-acceptance/en-768-triumphal-arch-95.png), [EN Kuntsevo desktop 5%](../../.playwright-mcp/stage6-final-acceptance/en-1440-kuntsevo-estate-5.png), [EN Panorama mobile 95%](../../.playwright-mcp/stage6-final-acceptance/en-390-borodino-panorama-museum-95.png), [EN Church tablet 5%](../../.playwright-mcp/stage6-final-acceptance/en-768-intercession-church-fili-5.png). No visual regression was found; no design change was made. Touch uses Chromium emulation rather than physical-device testing.

## Previously executed quality gates and static output

- Relevant source/component tests: **93/93 PASS** (content, Hero, Map, links, Homepage preview, current Place templates, Map index and chooser).
- `npm run lint`: **PASS**, including both corrected historical QA scripts and the new browser acceptance script.
- `npm run typecheck`: **PASS**.
- `npm run format:check`: **PASS**; new QA script formatting also checked.
- `npm run generate`: **PASS**, **277 routes**. The first sandboxed attempt stopped during prerender initialization with esbuild `spawn EPERM`; the authorized retry completed. There was one successful generation, no separate build and no repeated successful generation.
- Generated Place detail checks: **26/26 PASS**, including all eight localized comparison pages. Actual paragraphs, caveats, image order, captions, comparison markup, sources, related links and Map CTAs are checked against current catalogs.
- Combined generated Place/Homepage/global-link suite: **31/31 PASS**; the link audit covers **138 HTML files**.
- All **15 unique Place assets**, including comparison images, exist in generated output and match their original bytes/SHA-256. Content/source JSON has no diff.

Gate logs are local ignored files under `.playwright-mcp/stage6-final-*.log`. Fresh static output is generated/ignored, as usual.

## Previous automated Homepage provider observation

Local `.env` exists and has a configured key; it was neither changed nor printed. During the corrective pass, fresh static RU 1440 and EN 390 automated browser attempts both remained in fallback. Chromium reports **net::ERR_BLOCKED_BY_ORB** for the API script. Repeating the same request outside rendering, with the local Homepage Referer, confirms **HTTP 403**, response message **Invalid api key**. Only host `api-maps.yandex.ru`, path `/v3/`, status and allowlisted message are persisted; the key URL and raw body are never logged.

The [RU fallback](../../.playwright-mcp/stage6-final-acceptance/ru-1440-homepage.png) and [EN fallback](../../.playwright-mcp/stage6-final-acceptance/en-390-homepage.png) are actual provider attempts, not successful basemap captures. Existing controlled-provider tests establish application lifecycle and fallback behavior, but cannot establish real basemap composition, fitted camera, dense-Fili legibility, provider attribution keyboard behavior or successful-map touch scrolling/resource loading.

At the corrective pass, live-provider acceptance was the sole remaining blocker. The official closure below records subsequent user-reported manual acceptance; it does not claim that the automated 403 was fixed or independently explained.

## Official Stage 6 closure - 2026-10-08

**Stage 6 - COMPLETE / ACCEPTED. Stage 7 NOT STARTED.** The project owner accepts the final Stage 6 scope. This is a documentation-only closure: previously recorded tests and QA were not rerun.

Accepted scope: 13 localized Places and production detail pages; historically accurate status and location-precision distinctions; Place media and source attribution; interactive Yandex Map, 1812/Memory layers and overlapping marker handling; Place and Timeline deep links; fallback; live Homepage Yandex preview; exactly four interactive Place comparisons (`kuntsevo-estate`, `borodino-panorama-museum`, `intercession-church-fili`, `triumphal-arch`); accessible/responsive interactions; RU/EN parity; successful static generation.

Previously recorded technical acceptance: **93/93** source/component tests, global ESLint/typecheck/formatting **PASS**, **277** generated routes, **26/26** generated Place pages, **31/31** combined generated checks, **15/15** verified Place assets, **20/20** comparison browser cases, and RU/EN content/structural parity **PASS**. These are the corrective-pass results above, not new executions. The earlier [integrated Map QA](map-stage6-3-5-final-qa.md) remains supporting evidence.

**Manual live-provider acceptance: PASS (7/7).** These results are user-reported by the project owner from a normal local browser; Codex did not independently test or verify them:

1. The real basemap renders completely without missing areas.
2. Both graphite and burgundy custom markers are visible.
3. The initial fitted camera includes the location groups without clipping.
4. Homepage hover smoothly increases zoom and restores the original camera on pointer leave.
5. Clicking the Homepage map preview navigates to `/map`.
6. Full Map markers are interactive and open the corresponding Place cards.
7. The map renders correctly at mobile width.

The previous automated Chromium **403 Invalid api key / ERR_BLOCKED_BY_ORB** remains an observed test-environment limitation. No automated fix or independently established explanation is claimed. No key was printed, exposed, rotated or modified. The owner-reported manual acceptance completes Stage 6 acceptance without rewriting that automated evidence.

Kutuzov Hut's comparison remains intentionally deferred because the supplied historical image was unsuitable. The incorrect proposed comparison is not activated. Additional comparisons and optional historical imagery are nonblocking future improvements. No Stage 6 acceptance blockers remain; Stage 7 and all later stages are unchanged. No application code, historical content, source contracts or media was modified during closure.
