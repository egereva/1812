# Stage 6.3.3 — Dictionary integration & Map index/legend

Status: **AWAITING VISUAL REVIEW.** The proposal below was approved and implemented on 2026-10-06 with the user's detailed visual/accessibility clarification. Stage 6.3.2A and 6.3.2B remain COMPLETE; Stage 6.3 and Stage 6 remain IN PROGRESS. Stage 6.3.4 and 6.3.5 remain NOT STARTED. The original source/data audit below records the pre-implementation state; final verification follows it.

## Audit basis

Read AGENTS.md, relevant Stage 6 roadmap entries, map/cross-linking architecture and design sections, and the approved Stage 6.3.1 proposal. Inspected current Dictionary detail, Map page, MapPlaceCard, marker colors, Homepage Map Preview and the existing content resolver. Executed the actual content facade to measure both production locales. This is a source/data audit, not a new live-browser or Yandex acceptance pass.

The old 6.3.1 six-shape/precision-halo concept is superseded by the approved design and current code: one shared SVG, graphite for 1812, burgundy for Memory. Historical status and precision belong to card content/accessibility labels, not marker geometry. Existing completion and verification records are not replaced by this proposal.

## Dictionary: implemented and missing

`shared/content/index.ts` already resolves the union of `DictionaryEntry.relatedPlaceIds` and inverse `Place.relatedDictionaryIds`, deduplicated in Place catalog order. Both directions are available without a new helper or relation. The Dictionary detail page already calls this resolver, but consumes only `.sources`; it contains no related-Places UI or Map CTA.

| Measurement | RU | EN |
| --- | ---: | ---: |
| Dictionary entries | 29 | 29 |
| Entries resolving to Places | 17 | 17 |
| Entries with no resolved Places | 12 | 12 |
| Entries with explicit outgoing Place IDs | 5 | 5 |
| Entries matched by inverse Place relations | 17 | 17 |
| Maximum Places for one entry | 6 | 6 |

Resolved distribution in each locale: ten entries with one Place, three with two, three with three, one with six. Twelve entries have only inverse Place relations. Counts and resolved Place ID sequences agree across locales.

| Example (stable Dictionary ID) | Resolved Places | Observation |
| --- | --- | --- |
| `bagration` | `kutuzov-monument` | One, inverse-only; Багратион / Pyotr Bagration |
| `borodino-battle` | `dorogomilovskoe-cemetery`, `brotherhood-grave-obelisk`, `borodino-panorama-museum` | Three; direct and inverse overlap |
| `military-council-fili` | `fili-village`, `kutuzov-hut`, `milepost-fili` | Three; two direct plus one additional inverse |
| `fili` | `fili-village`, `kutuzov-hut`, `intercession-church-fili`, `kuntsevo-estate`, `milepost-fili`, `archangel-michael-chapel` | Six; three direct plus three additional inverse |
| `alexander-i` | None | Omit the proposed block |
| `kutuzov-hut-term` | None | A matching topic/title does not authorize inventing a relation |

Natural insertion point: after the existing article/image composition and before Sources, as a quiet full-width section using the existing thin-rule and source-section heading treatment. It needs no change to the lead, article/media grid, viewer or source presentation. There is no strong data or layout reason to reconsider the rejected generic Dictionary-to-Map CTA. Place detail pages already provide the next step to the Map.

## Map index: implemented and missing

The index is already an SSR `<section>` containing native `<details>`, a named `<summary>` with the count, and an ordered list of localized Place-detail NuxtLinks. These links navigate to articles; they do not select map markers. Preserve that contract.

- Desktop: below the frame, three columns above 850 px. Tablet: two columns at 601–850 px. Mobile: one column at 600 px and below. The summary has a 44 px minimum height.
- Loading, missing-key and error states set the disclosure open. Readiness removes the forced open attribute, providing the compact collapsed successful-map state; users can operate the native disclosure themselves.
- Normal All/1812/Memory index currently remains **13/13/13**, because `indexPlaces` uses all catalog Places outside event context. Markers correctly use **13/6/7**. This is the meaningful finalization gap.
- Event mode already narrows the index to the resolved event Places: four for council-fili. Its count and links agree with the current event scope; manual layer queries do not change that scope.
- Native summary supports keyboard disclosure; links participate in ordinary Tab/Enter navigation with global visible focus. Ordered-list DOM follows catalog order. No custom disclosure keyboard handler is needed.
- API failure renders a separate full 13-Place list inside the frame. The lower index stays open: 13 normally, event-related subset during event failure. The normal failure state therefore duplicates the full link list, but preserves robust navigation; no restructuring is proposed.
- Static HTML without JS contains the open generic 13-Place index. Query scope is applied during hydration on static hosting. Dev/SSR can render a narrowed event index without JS; the native All places exit remains a route to the full collection. The no-JS frame retains a loading message, but the useful index is outside it.
- In a working event view, the full collection remains reachable via All places. In a normal filtered view, it remains reachable via All. On API failure, the frame fallback directly exposes all 13 links.
- The index repeats only a title and article link also available in an open Place card. It does not repeat description, image, address, status or caveats; this overlap is necessary collection navigation, not a second card.
- Individual index anchors have only 0.2rem vertical padding and no 44 px minimum. Their effective target height is about 32 px at current body metrics; finalization should bring them to the project's approximately 44 px target without changing typography or column breakpoints.

These observations are from markup/CSS and state logic; actual keyboard, readiness transitions and touch layout must be verified during implementation.

## Legend assessment

Recommendation **2: a very small on-demand legend is useful**. No legend currently exists. The layer buttons name the groups, but both inactive labels are muted and whichever group is active receives the same burgundy emphasis. That control indicates selection rather than an explicit graphite/1812 versus burgundy/Memory mapping. Event mode hides the buttons entirely while retaining both marker colors.

Propose one native disclosure labelled `Обозначения / Legend`, adjacent to the existing index below the frame and outside the event-context bar. Show it only when the map is ready; keep it closed initially. Its contents are two decorative color swatches with the existing localized layer labels: graphite = 1812, burgundy = Память / Memory. Text supplies the meaning; swatches are hidden from assistive technology. No status symbols, precision key, halos, six shapes, badges or new marker variants. No permanent overlay or occupied map area.

## Homepage Map Preview: current state only

`app/pages/index.vue` still renders an abstract, aria-hidden CSS grid with two diagonal axes and two rings, beside localized heading/lead and three unlinked Place names. It is not a geographic map and does not mount Yandex. It retains the `04 / 04` rule.

The names come from `getPlaces(locale).slice(0, 3)`: `fili-village`, `kutuzov-hut`, `intercession-church-fili`, localized in both languages. There is no separate curated preview model and no historical route claim. CTA already points to localized `/map`, with `Открыть карту / Explore the map` and a decorative arrow. RU/EN lead describes Places in modern Moscow's Western Administrative Okrug but does not state the full collection count.

The real Map URL is already correct; no technical integration is missing. Stage 6.3.4 should review only how strongly the existing lead/CTA communicates exploration of all 13 Places, preserving the abstract composition and approved content. No real-map embed, redesign or preview implementation belongs to 6.3.3.

## Proposed exact 6.3.3 implementation

1. **Dictionary:** resolve `.places` reactively from the existing facade for the current slug/locale. Render a semantic section headed `Связанные места / Related places` only when nonempty, after the article and before Sources. Use a plain list of every resolved localized title, in resolver order, linking through `localePath` to `/places/{slug}`. No thumbnails, descriptions, arbitrary truncation, map CTA or accordion. Desktop uses the existing quiet heading/list alignment; at the existing 600 px mobile breakpoint stack heading and list. Make link targets at least 44 px high and allow titles to wrap.
2. **Index:** retain the existing native disclosure, route links, catalog order and 3/2/1 columns. While the map is ready, use the already computed visible Places, giving 13/6/7 in normal layers and the existing event subset in event mode. While not ready, preserve current behavior: normal open index of 13, event open index of related Places, and full 13-Place error fallback. Derive displayed count from the same list. Increase existing index link target height to at least 44 px. Do not add marker-selection buttons, selected-state decoration, search or a new panel.
3. **Legend:** implement the ready-state, initially collapsed two-color disclosure described above. Use a 44 px summary and existing focus styling. Keep it separate from the index so color meaning can be opened without expanding the Place list. Allow the two rows to wrap/stack at narrow widths; add no animations or custom focus management.
4. **Accessibility/localization:** semantic H2 for Dictionary related Places, native lists/disclosures, visible focus and normal keyboard activation. Internal routes stay in the current tab via NuxtLink. Existing source/media links retain WebsiteLink and the origin-based external-link rule; no third-party Yandex controls change. RU/EN use the same resolver, behavior and layout, with localized headings, counts and destination routes. Do not add Yandex loading to Dictionary or Homepage.

## Tests and done criteria

- Reuse existing relation and layer coverage; add only checks missing for the new behavior. Verify representative direct+inverse union (`fili`, `military-council-fili`), inverse-only (`bagration`), and empty (`alexander-i`, `kutuzov-hut-term`) cases in both locales.
- After generate, verify all 58 Dictionary detail HTML pages: exact resolved Place links, expected localized heading on 17 pages per locale, no related-Places block on the other 12, no Dictionary-to-Map CTA, same-tab destinations, preserved article/source/media markup and no Yandex script.
- Browser-check normal ready-state index counts/membership 13/6/7, native collapse/expand, event index 4 and ignored event-layer query; switch layers while the index is open. Verify state/count updates do not steal focus and the existing disclosure remains usable.
- Verify ready-state legend is collapsed until opened, contains exactly the two correct color mappings, and is available in event context without adding any event-header action.
- Verify API failure retains all 13 fallback links; static no-JS output retains useful open full navigation. Recheck entry/exit, direct URLs and Back/Forward around the changed index without repeating marker design work.
- RU 320/390/768/1440 and representative EN desktop/mobile: wrapped titles, 44 px targets, keyboard/focus, touch, reduced motion, no page overflow. Inspect the six-Place Dictionary case and a no-Places case, both with and without artwork where applicable.
- Run focused checks first, then the applicable existing tests, typecheck, lint, format check and generate for the implementation. Reuse existing Timeline event regressions to guard 6.3.2B. Record browser/static results and visual review before marking the stage COMPLETE.
- Content/relations/coordinates, marker SVG and behavior, Timeline CTA/event header, Place cards and Homepage remain unchanged. No new dependencies or queries. No new historical/media research is needed to use the audited relations; absence of relations remains absence.

## Likely implementation files and review decision

Expected changes: `app/pages/dictionary/[slug].vue`, `app/pages/map.vue`, `i18n/locales/ru.json`, `i18n/locales/en.json`, focused generated Dictionary verification under `test/`, and `package.json` only if adding its test command. Extend existing content/map tests only for missing coverage. Update relevant `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/ROADMAP.md` and this audit after approval/implementation changes their contracts or status. No content JSON or shared resolver rewrite is expected.

The user approved the conditional Dictionary list placement, successful-map-only layer-aware index with preserved fallback behavior, 44 px index links, and the separate tiny on-demand color key. No historical/editorial decision blocks this approach; no data justifies reopening generic Dictionary-to-Map navigation. Stage 6.3.4 and 6.3.5 remain NOT STARTED.

## Implementation and verification — 2026-10-06

Production changes are limited to `app/pages/dictionary/[slug].vue`, `app/pages/map.vue`, and the two locale files. Dictionary reuses one reactive related-content result for Sources and Places. The conditional list includes every resolved localized title and stays outside the article/media composition. Map index filtering is conditional on actual readiness; event fallback behavior is unchanged. Links have 44 px minimum height. The native legend uses two small rectangular color samples, remains closed initially and appears only when ready, including event scope. No prohibited historical fields, relations, marker assets/behavior, cards, Timeline/Place Map links, Homepage, external-link implementation or dependencies were changed.

Added `test/map-index-render.test.mjs` and `test/dictionary-places-render.test.mjs`, with dedicated package scripts. The actual-page component harness controls API state without pretending to provide live Yandex acceptance. Independent generated-output expectations derive outgoing and inverse relation membership from production data for all entries, asserting the existing resolver agrees. Both locales have 17 related / 12 empty entries and maximum six; inverse-only, direct+inverse and empty cases are included.

Checks:

- Actual Map SFC render tests **14/14 PASS**: ready All/1812/Memory index membership 13/6/7, localized same-tab links, native collapsed ready disclosures, open loading/missing/error index 13, event subset 4, full failure fallback 13, two-entry localized legend with decorative samples and no obsolete semantics.
- Generated Dictionary and no-JS Map regression **60/60 PASS**: all 58 Dictionary routes contain precisely the expected localized Place links or omit the block; placement, paragraphs, no direct Map CTA and no Yandex script preserved. Two generated Map indexes expose all 13 localized links and open native disclosures.
- Existing focused Map tests **8/8**, full tests **30/30**, Timeline detail **40/40**, Homepage **2/2**, and generated external/internal link audit **PASS** (138 HTML files).
- Typecheck, lint, full format check and static generate **PASS**; **277 routes** generated. Lint initially caught three unnecessary regex escapes in the new test; they were corrected and full ESLint passed. No production behavior changed after generation.
- Real Yandex localhost preview: RU 1440/390 indexes match 13/6/7, keep an expanded disclosure usable during layer changes, retain same-tab links and have targets at least 44 px. Native index Enter/Tab and legend Enter/Space operation and visible focus checked. Actual legend samples match RGB 28/27/25 and 112/40/55; exactly two labels render. Final ready-map sequences have no page exceptions.
- RU/EN council-fili event views retain index 4 despite a manual Memory query, no layer tabs, no initial Place card, plain-text event title and sole All places header action. Legend operates below the frame in both locales.
- Dictionary RU Fili 6, Bagration 1, mobile Military Council at Fili 3, and EN Fili 6 checked for localized links, 44 px targets and visible keyboard focus. RU Alexander I omits the block. Additional RU 320/768 checks cover six-Place Dictionary wrapping, native legend operation, 1/2-column Map index, reduced-motion preference and no horizontal overflow.
- Deliberately blocked Yandex requests trigger the actual error path: frame fallback 13 and open index 13 even with `layer=1812`. No successful-map state is simulated in browser screenshots.
- Generated static site served separately: RU/EN without JS retain full open Map index 13 even with event/layer query and Dictionary Fili related links 6. With JS, EN static Memory index hydrates to 7 on real Yandex; Back/Forward restores 6/7 layer membership.

## Screenshots for visual review

All requested live Map captures use real Yandex. Full-page screenshots preserve the surrounding composition; refreshed captures start at the top of the page after keyboard checks. Focus behavior is verified separately. The error screenshot deliberately blocks the API and is labelled accordingly.

| Locale / width | State | Screenshot |
| --- | --- | --- |
| RU 1440 | Dictionary Fili, six Places | [Fili](../../.playwright-mcp/stage-6-3-3/ru-1440-dictionary-fili.png) |
| RU 1440 | Dictionary Bagration, one Place | [Bagration](../../.playwright-mcp/stage-6-3-3/ru-1440-dictionary-bagration.png) |
| RU 1440 | All, index expanded | [All](../../.playwright-mcp/stage-6-3-3/ru-1440-map-all-index.png) |
| RU 1440 | 1812, index expanded | [1812](../../.playwright-mcp/stage-6-3-3/ru-1440-map-1812-index.png) |
| RU 1440 | Memory, index expanded | [Memory](../../.playwright-mcp/stage-6-3-3/ru-1440-map-memory-index.png) |
| RU 1440 | Legend expanded | [Legend](../../.playwright-mcp/stage-6-3-3/ru-1440-map-legend.png) |
| RU 1440 | Event scope, legend expanded | [Event legend](../../.playwright-mcp/stage-6-3-3/ru-1440-event-legend.png) |
| RU 390 | Dictionary Military Council at Fili, three Places | [Dictionary mobile](../../.playwright-mcp/stage-6-3-3/ru-390-dictionary-military-council-fili.png) |
| RU 390 | All, index expanded | [Index mobile](../../.playwright-mcp/stage-6-3-3/ru-390-map-all-index.png) |
| RU 390 | Legend expanded | [Legend mobile](../../.playwright-mcp/stage-6-3-3/ru-390-map-legend.png) |
| EN 1440 | Dictionary Fili, six Places | [Dictionary EN](../../.playwright-mcp/stage-6-3-3/en-1440-dictionary-fili.png) |
| EN 1440 | Event scope, legend expanded | [Legend EN](../../.playwright-mcp/stage-6-3-3/en-1440-event-legend.png) |
| RU 390 | API failure, full navigation | [Failure](../../.playwright-mcp/stage-6-3-3/ru-390-map-api-failure.png) |

No new visual concern has been identified; the requested user visual review remains pending. Yandex was available for this implementation pass. Existing Nuxt development timer diagnostics persist; they do not represent a new Stage 6.3.3 defect. The no-JS frame continues to show its existing loading message, with useful full navigation outside the frame. Stage 6.3.3 is not marked complete, and no Homepage preview or later-stage implementation has started.

**Stage 6.3.3 — AWAITING VISUAL REVIEW**
