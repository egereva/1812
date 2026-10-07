# Stage 6.3.4 — Homepage Map Preview

**Stage 6.3.4 — COMPLETE.** The design is visually approved; implementation, final corrections and verification are complete. Stage 6.3.3 remains COMPLETE. Stage 6.3 and Stage 6 remain IN PROGRESS; Stage 6.3.5 is NOT STARTED.

Sections 1–14 below preserve the original audit/proposal. The approved user correction supersedes their count-led direction, large numeral sizes and example placement. The final implementation and verification are recorded in section 15.

## 1. Current-state audit

Source audit on 2026-10-06: inspected the Homepage Map section and its directly affecting styles, localized copy, relevant DESIGN/ARCHITECTURE sections, Stage 6.3 roadmap entries, the Homepage paragraph of the approved 6.3.1 proposal, and the final Map heading/control language. Executed the existing Place facade to confirm the actual preview titles, order and total in both locales. This pass contains no browser acceptance, new asset research or implementation.

- Structure: `<section class="home-map page-container" aria-labelledby="map-title">`, decorative `04 / 04` rule, two-column layout, aria-hidden diagram, and a text column containing kicker, H2, lead, three-item list and localized NuxtLink to the Map.
- Visual composition: left field has a thin rectangular border, repeated 3.5rem square grid, two crossing burgundy diagonals and two burgundy rings. It is abstract and has no geographic data or interaction. Right column uses existing serif H2, muted body-lg lead, serif Place names separated by thin rules, and the shared burgundy underlined Homepage CTA with a decorative arrow.
- Desktop: 3:2 column ratio, text minimum 18rem, gap `clamp(2rem, 7vw, 8rem)`, diagram minimum 31rem high. Section padding is 64/96 px; inner layout starts after 48 px.
- Tablet up to 900 px: two roughly equal columns, text minimum 15rem, 32 px gap, diagram minimum 26rem. At 768 this keeps a substantial decorative field beside wrapping copy.
- Mobile at 600 px and below: one column, text first, diagram second; 48 px gap, diagram minimum 15rem, section padding 48/64 px. At 390/320 the empty decorative field is still substantial relative to the useful navigation.
- Actual data: `getPlaces(locale).slice(0, 3)` supplies `fili-village`, `kutuzov-hut`, `intercession-church-fili`. RU titles are **Деревня Фили и место Военного совета**, **Кутузовская изба**, **Церковь Покрова в Филях**. EN titles are **Fili Village and the Site of the Military Council**, **Kutuzov Hut**, **Church of the Intercession at Fili**. Names are plain text, not links. Both catalogs contain 13 Places.
- Current RU copy: kicker **Места памяти**; H2 **Карта**; lead **Места на территории современного Западного административного округа Москвы, связанные с историей 1812 года.**; CTA **Открыть карту**.
- Current EN copy: kicker **Places of memory**; H2 **Map**; lead **Places in today’s Western Administrative Okrug of Moscow associated with the history of 1812.**; CTA **Explore the map**.
- CTA already resolves to `/map` or `/en/map`, stays in the current tab, has a 44 px minimum height and uses the existing visible-focus treatment. The section is SSR HTML/CSS and does not import or mount Yandex.

The finished Map explicitly introduces 13 Places and distinguishes 1812 from later Memory through graphite/burgundy. The Homepage has no total, its kicker emphasizes Memory alone, and the all-burgundy rings/diagonals have little connection to that simple marker system. Their geometry is decorative rather than an actual defect, but now feels generic. The overly tall mobile graphic adds little information. Current responsive conclusions are based on CSS, not new screenshots.

## 2. Preserve

Preserve the section position, page-container, `04 / 04` thin rule, existing H2/lead/CTA typography, desktop graphic-left/text-right composition, localized existing Map destination and native same-tab navigation. Keep a full useful text section without images or JS. Do not change other Homepage sections.

Keep the three current names as quiet examples: they provide concrete destinations within the collection, and the approved data already spans the site's 1812/Memory themes. Do not imply these three are the entire collection or a historical route. Preserve localized production titles and order; label the list **Например / For example** so its illustrative role is explicit. Do not add thumbnails, per-Place buttons or a second navigation model.

## 3–5. Alternatives and recommendation

| Direction | Treatment | Benefit | Tradeoff |
| --- | --- | --- | --- |
| Minimal copy refinement | Keep the diagram exactly; revise kicker/lead to state 13 Places | Smallest change and preserves all composition | Generic all-burgundy shapes and oversized mobile field remain |
| **Editorial count fragment — recommended** | Keep the split, simplify the abstract field to a large typographic 13, a sparse fine grid and two short graphite/burgundy strokes; retain three examples | Makes the collection scale clear, shares Map palette/typography, stays static and editorial | Needs approval of the count-led illustration and shorter mobile field |
| Static marker vignette | Three small decorative samples of the existing shared marker SVG on a sparse abstract field, with the same text and CTA | Strongest literal connection to the real Map | Pins can imply geographic positions or clickability; requires extra rendering care and offers little additional information |

Recommend the **editorial count fragment**. It refines the established abstract composition without pretending to plot Places. Its two strokes are short, straight graphic accents, not connected paths, rivers, historical routes or new marker symbols. No geographic silhouette, coordinates, named points, compass, screenshot, status shapes or precision decoration is introduced. The three meaningful Place examples remain in readable text.

## 6. Desktop composition — 1440

Retain the 3:2 split, existing gap and outer section spacing. Graphic remains left and copy right, vertically aligned at center. Use a borderless abstract field with a minimum height `clamp(20rem, 30vw, 28rem)`, giving roughly 27rem at 1440 rather than the current 31rem. Keep enough ivory around the text; do not stretch the graphic to mimic the live-map frame.

Inside the field: a sparse 1 px neutral grid with larger, approximately 6rem cells, a large graphite serif **13** anchored toward the lower-left, and two small separated strokes in graphite and burgundy. Suggested numeral scale: `clamp(8rem, 14vw, 12rem)`. The numeral and graphic are decorative duplicates of the count stated in the lead. No Place title is positioned inside the field and no line joins the samples into a route. Remove the two rings and long crossing diagonals.

Right column order: existing-style localized geographic kicker → **Карта / Map** H2 → revised lead containing the actual collection count → quiet **Например / For example** label and existing three titles → unchanged CTA. Keep the examples restrained, with current thin rules and wrapping, and maintain the existing 44 px CTA. No tabs, legend, secondary CTA, cards or hover state for the graphic.

## 7. Tablet and mobile composition

- **768:** switch this section to one column at the existing 900 px breakpoint. Text precedes graphic in visual and semantic order. Keep current container gutters; use 32 px between text and graphic. Graphic becomes a horizontal fragment, about 12rem high, with an 8rem numeral. Three example names remain a vertical list; do not squeeze them into columns.
- **390:** one column, text first, the same three names and CTA, then a 10rem-high decorative fragment with a 7rem numeral. Use a 24 px gap; retain current mobile section padding. The full invitation is readable before the decorative field, with no scrolling strip or hidden content.
- **320:** same arrangement and 10rem field. Allow the full RU/EN Place titles and lead to wrap naturally. Avoid fixed-width child elements and nowrap text; keep the CTA at least 44 px high and prevent its arrow from pushing it beyond the container.

Use one text section and one decorative field, not separate desktop/mobile content copies. Prefer text first in DOM at all widths and CSS placement for the desktop left-hand graphic. The decorative field can clip its own grid; do not use the existing outer `.home { overflow: hidden }` as proof that overflow is solved. Measure actual page width during implementation QA.

## 8. Proposed RU/EN copy

These are proposed UI strings, not historical JSON edits. Count comes from `getPlaces(locale).length` and is interpolated, rather than adding a second hard-coded 13.

| Role | RU | EN |
| --- | --- | --- |
| Kicker | Запад Москвы · 1812 | Western Moscow · 1812 |
| H2 | Карта | Map |
| Lead | {count} мест на западе Москвы — события 1812 года и память о войне. | {count} places in western Moscow — the events of 1812 and the memory of the war. |
| Examples label | Например | For example |
| CTA — unchanged | Открыть карту | Explore the map |

The geographic kicker can reuse the existing localized Map kicker. Lead wording expresses the already approved collection scope and adds no new factual claim, route or chronological relationship. The examples remain complete production titles from the existing three records; no shortened or invented historical names. Keep the existing decorative CTA arrow and same `/map` destination without query parameters.

## 9. Relationship to the final Map

Use the established ink/graphite and accent/burgundy tokens, ivory ground, serif numeral/H2 and thin neutral rules. This is sufficient preparation for the two-theme Map when the lead explicitly mentions both events and memory. A Homepage color key would add controls/explanation without a task for the reader; do not reproduce one. The normal graphite **13** is a collection total in the project's text color, not a claim that all Places belong to 1812.

Do not give the three text examples colored category badges or use decorative point placement to assign geography. The real Map alone explains the precise color/category mapping and handles markers, filtering, event context, overlap/fan-out, selection and Place cards.

## 10. Accessibility and performance

Retain a labelled semantic section, one H2, paragraphs, a plain list and one NuxtLink CTA. Entire decorative field is `aria-hidden="true"`, has no role or tabindex and accepts no pointer interaction. The actual count is present in accessible lead text; colors supply no unique information. CTA uses existing visible focus and native Enter activation; no hover-only content.

No animation, parallax, observer, autoplay or motion-dependent behavior is needed. Reduced-motion users receive the same static composition; preserve global focus/transition rules. All copy, examples and CTA must render in generated HTML and work without JS.

Use CSS and existing font/token systems only. No image, dependency, API import, Yandex request or new interactive component. No local historical/cartographic asset is necessary for this direction, so no broader asset inventory or media research was performed. A historical-map asset would require provenance/rights/context checking and would increase the scope without materially improving this invitation.

## 11. Likely implementation files

- `app/pages/index.vue`: scoped Map section markup/styles and reactive collection count; retain other sections and shared Homepage link styling.
- `i18n/locales/ru.json`, `i18n/locales/en.json`: revised Map preview lead and example label; reuse the existing Map kicker and CTA where appropriate.
- `test/homepage-render.test.mjs`: extend generated-output checks for this section, alongside existing Homepage Timeline assertions.
- Relevant sections of `docs/DESIGN.md`, `docs/ROADMAP.md` and this proposal after approval/implementation changes their contract/status. ARCHITECTURE needs an update only if implementation changes a documented contract; no new architectural layer is expected.

No production Map, marker asset, relation helper, historical JSON, dependency or global CSS/layout change is expected. The recommended CSS drawing needs no new component or asset.

## 12. Focused implementation checks

1. Generated RU/EN Homepage contains exactly the current three localized Place titles in this section, the real catalog count, expected localized lead and a same-tab `/map` or `/en/map` CTA without query parameters. Existing Homepage Timeline/Hero checks continue to pass.
2. No-JS static preview: count, examples and CTA remain available; CTA reaches the existing localized Map. No hidden interactive control is required to understand the section.
3. Browser RU/EN at 1440, 768, 390 and 320: approved split/stack behavior, correct order, readable full titles, no horizontal overflow and CTA at least 44 px high. Capture the section at these widths for visual review.
4. Keyboard Tab/Enter, visible focus and reduced-motion preference: only the CTA is interactive within this section; decorative field stays out of the accessibility tree. No hover-only content.
5. Observe Homepage network traffic through initial load, scrolling and CTA hover/focus, before activating the CTA: zero Yandex requests and no mounted map. After activation, the real Map may load its API normally.
6. Run focused generated Homepage checks and file-scoped lint/format first, then the applicable project quality gates for implementation, including typecheck, lint, format check and generate. No repeated broad Map/fan-out audit is needed for this static section.

## 13. Exact done criteria

Stage 6.3.4 may be marked COMPLETE only when the reviewed direction/copy is implemented and visually accepted; the count is 13 from the real catalog in RU/EN; all three examples use existing localized content; the existing localized CTA works with and without JS; the preview is static and sends no Yandex requests; the specified four widths and accessibility/performance checks pass; and the relevant generated-output/quality gates pass. Only the Homepage Map Preview changes. Finished Dictionary, Timeline, full Map and global layout remain unchanged. No later-stage work starts automatically.

## 14. Decision before implementation

Approve the recommended count-led abstract fragment, preserved three unlinked examples, proposed UI copy and the tablet/mobile text-first stack with a shorter decorative field. Those visual/copy choices are the only review decision needed. No new historical relations, claims, asset permissions or research are required for this proposal. Production implementation remains NOT STARTED.

**Original proposal status: PROPOSAL FOR REVIEW (superseded by section 15).**

## 15. Approved correction, implementation and verification

The user approved implementation with an **editorial cartographic fragment**, replacing the proposed dominant numeral. The final static inline SVG uses sparse grid and curved contour lines, two separated burgundy accents and three small crosshair nodes (graphite/burgundy/graphite). These are decorative geometry, not catalog coordinates, named positions, measured distances or routes between Places. The secondary serif count is 3rem on desktop/tablet and 2.25rem on mobile. No real-map silhouette, screenshots, Yandex API, interactive markers, legend, assets, dependencies or animation were introduced.

The fragment occupies the left side of the existing approximate 3:2 desktop split, with three unlinked catalog titles beneath it under “Например / For example”. Copy occupies the right side. DOM order puts copy first; at 900px and below the section stacks copy before fragment. Geometry height is `clamp(14rem, 25vw, 20rem)` on desktop, 12rem on tablet and 10rem at 600px and below. The grid is quieter and burgundy boundary accents are hidden on small screens. Full names wrap naturally; existing section spacing, thin rule and shared CTA/focus styles are retained.

`getPlaces(locale)` provides the reactive collection and its length (currently 13 in both locales); the same collection supplies the existing first three examples without duplicated historical strings. RU lead: “13 мест на западе Москвы, где история 1812 года встречается с памятью о войне.” EN lead: “13 places in western Moscow where the history of 1812 meets the memory of the war.” The existing geographic Map kicker, H2 and localized CTA remain. The count inside the aria-hidden geometry duplicates the accessible lead. Examples are a semantic list; the sole interactive element is the native localized Map link with a 44px target and visible keyboard focus.

Changed implementation files: `app/pages/index.vue`, `i18n/locales/ru.json`, `i18n/locales/en.json`, `test/homepage-render.test.mjs`. Updated contracts/status: `docs/DESIGN.md`, `docs/ROADMAP.md` and this record. Other Homepage sections, production Map, historical content, coordinates, relations and dependencies were not changed by this substage.

Checks PASS:

- Focused actual RU/EN SSR invitation checks first: 2/2. Count matches the catalog, existing example titles/order, sole localized same-tab CTA, decorative accessibility and no Yandex script.
- Generated Homepage checks: 4/4, including unchanged six-artwork Timeline assertions; standard tests 30/30; file-scoped ESLint and Prettier; project typecheck, lint, format check and generate (277 routes). Existing nonblocking Nuxt diagnostics remain.
- Browser RU 320/390/768/1440 and EN 1440: split/stack order, readable names, no horizontal overflow or clipping, 44px CTA, keyboard Tab focus and visible outline, reduced-motion preference, zero page exceptions. Initial load, scroll and CTA hover/focus produced zero Yandex/Yastatic requests. The generated hydrated Homepage also produced zero Yandex requests.
- Generated static RU/EN with JavaScript disabled: copy/count/examples present; keyboard Enter opens `/map` or `/en/map` in the same tab, with no Yandex requests.
- All five section screenshots and the desktop Timeline → Map → Footer transition were visually inspected. No clipping or composition blocker was found; art direction was subsequently approved by the user.

Screenshots:

- [RU 1440 full section](../../.playwright-mcp/stage-6-3-4/ru-1440-map-preview.png)
- [RU 768 full section](../../.playwright-mcp/stage-6-3-4/ru-768-map-preview.png)
- [RU 390 full section](../../.playwright-mcp/stage-6-3-4/ru-390-map-preview.png)
- [RU 320 full section](../../.playwright-mcp/stage-6-3-4/ru-320-map-preview.png)
- [EN 1440 full section](../../.playwright-mcp/stage-6-3-4/en-1440-map-preview.png)
- [Timeline → Map transition](../../.playwright-mcp/stage-6-3-4/ru-1440-timeline-map-transition.png)
- [Map → Footer transition](../../.playwright-mcp/stage-6-3-4/ru-1440-map-footer-transition.png)

Browser measurements: `.playwright-mcp/stage-6-3-4/browser-checks.json`. **Stage 6.3.4 — COMPLETE. Stage 6.3.5 NOT STARTED.**

## 16. Final visual correction

The user approved the design and requested only removal of the obsolete “04 / 04” and slightly more mobile CTA/graphic separation. The counter span is removed in both locales; the existing rule and padding remain. At 600px and below, the layout gap changes from `var(--space-6)` (24px) to `var(--space-8)` (32px). The graphic remains 10rem high. All approved geometry, content, order and navigation remain unchanged.

Fresh RU/EN SSR invitation tests pass 2/2; file-scoped ESLint/Prettier pass. Browser RU 1440/390/320 and EN 1440 confirm no counter, preserved rule, balanced top spacing, no overflow or clipped names, visible keyboard focus, 44px CTA and zero Yandex requests/page exceptions. Mobile measured gap is 32px and graphic height is 160px. Section screenshots and Timeline → Map → Footer transition inspected with no regression. Full quality gates from the implementation pass were not repeated for this trivial correction.

Final screenshots: [RU 1440](../../.playwright-mcp/stage-6-3-4-final/ru-1440-map-preview.png), [RU 390](../../.playwright-mcp/stage-6-3-4-final/ru-390-map-preview.png), [RU 320](../../.playwright-mcp/stage-6-3-4-final/ru-320-map-preview.png), [EN 1440](../../.playwright-mcp/stage-6-3-4-final/en-1440-map-preview.png), [Timeline → Map](../../.playwright-mcp/stage-6-3-4-final/ru-1440-timeline-map-transition.png), [Map → Footer](../../.playwright-mcp/stage-6-3-4-final/ru-1440-map-footer-transition.png). Measurements: `.playwright-mcp/stage-6-3-4-final/browser-checks.json`.

**Stage 6.3.4 — COMPLETE. Stage 6.3.5 NOT STARTED.**
