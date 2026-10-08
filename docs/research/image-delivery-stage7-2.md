# Stage 7.2 — image delivery and layout stability

2026-10-08. **ACCEPTED (user-reported). Stage 7 remains IN PROGRESS.** Stage 6 remains COMPLETE / ACCEPTED. This pass did not include Stage 7.3 or Stage 8 work; its technical results below are preserved evidence, not newly executed checks.

## Implementation

Static, prepared JPEG derivatives (to be included in the deployment commit); no dependencies, image server or runtime processing. Offline `npm run media:prepare` uses Windows PowerShell/System.Drawing, quality 90, high-quality bicubic resizing and orientation normalization, without cropping or upscaling. Originals below 300 KB or at most 640 px wide stay unchanged. Larger files receive materially smaller 640/1280 px candidates; Hero/comparison sources can also receive a 1920 px candidate, capped at native width. Candidates must save at least 20%. WebP was unnecessary for the measured savings and would require another processor.

The technical catalog contains verified intrinsic dimensions and original SHA-256 hashes, separate from editorial metadata. Existing components share a base-path-aware responsive helper. Original `src` remains the fallback; supported browsers choose local derivatives from `srcset`. `sizes="auto, ..."` uses actual layout width for lazy editorial images, with viewport/desktop fallbacks. Hero size hints account for viewport width, its tall cover frame and the existing 42rem minimum height, preserving initial slide sharpness on mobile. Thumbnails use smaller size hints, and both comparison layers share one frame size rule. Browser choice depends on viewport, pixel density and cache.

MuseumImage reserves its intrinsic space within existing maximum heights, independent of the derivative's natural dimensions. Dictionary/mobile Place wrappers retain their existing width caps while also respecting the container width. A sizing regression discovered during verification was corrected; final primary image dimensions match the pre-change baseline within 1.1 CSS px. No arbitrary cropping, skeletons or design changes. Hero/comparison object-fit, positions and frames are unchanged.

Detail lead images are eager; below-fold editorial images and thumbnails are lazy. Only the first Hero slide is eager/high priority; later slides are lazy/auto priority. Both comparison layers remain eager, with no independent lazy-loading or decode transition. PhotoSwipe still receives untouched original MediaAssets and loads their original-resolution files on opening; keyboard open, Escape, focus return and source links passed browser checks.

## Measured bytes

Decimal MB/KB. Original collection: **42 files, 86,765,138 bytes (86.77 MB), unchanged**. Added delivery set: **56 derivatives for 29 originals, 13,326,789 bytes (13.33 MB)**. Thirteen originals need no derivatives. Total prepared media occupies 100,091,927 bytes; this is additional storage, not a reduction in the original collection.

| Largest original          | Original bytes | 640 px bytes | 1280 px bytes | 1280 px saving |
| ------------------------- | -------------: | -----------: | ------------: | -------------: |
| Fili milestone            |     17,553,175 |      305,505 |     1,131,657 |          93.6% |
| Brotherhood grave obelisk |     15,751,195 |      236,962 |       880,187 |          94.4% |
| Church, 2019              |     11,281,988 |      103,524 |       399,019 |          96.5% |
| Bagration portrait        |      8,751,131 |      105,358 |       420,273 |          95.2% |

The Church 1920 px comparison candidate is 890,493 bytes, saving 92.1% against its original. No subjects, editorial attribution, historical metadata or original file paths changed.

Approximate display bytes below sum unique completed rendered image files at the capture point, excluding PhotoSwipe, scripts/fonts and Yandex. Homepage samples can include offscreen slides and nearby lazy content. They are file-size measurements of browser-selected sources, **not measured network timings or real-world speed improvements**. Browser cache and lazy-load timing can change the sum. Mobile used 390 px / DPR 2; desktop 1440 px / DPR 1.

| Representative view (RU; EN also checked) |     Before | Mobile after | Desktop after |
| ----------------------------------------- | ---------: | -----------: | ------------: |
| Homepage                                  |  2,493,900 |    1,496,849 |     1,302,728 |
| Dictionary: Bagration                     |  8,751,131 |      420,273 |       420,273 |
| Timeline: Vilna                           |  4,620,237 |      289,693 |       289,693 |
| Place: Fili milestone                     | 17,553,175 |    1,131,657 |     1,131,657 |
| Place: Church cover/comparison            | 11,760,940 |      736,802 |     1,228,276 |

The largest individual measured selected-file reduction is **16,421,518 bytes** for the milestone at 390/1440 px; at 320 px the browser selected its 305,505-byte candidate. These samples establish substantial byte savings without extrapolating network performance.

## Verification

- Source/metadata/helper tests: **51/51 PASS**; all 42 original hashes match, candidates are smaller/local/bounded, and `/1812/` base-path delivery is covered.
- Generated source/component checks: **73/73 PASS**, including **26/26 Place detail pages**, **40/40 Timeline detail pages**, Homepage/source-link checks and two delivery checks. Every generated `<img>` has dimensions/alt and existing local source/candidate paths; all 42 originals and all 56 derivatives are present in generated output.
- Global ESLint, TypeScript and project formatting: **PASS**. New QA/test/report formatting also checked.
- Final static generation: **277 routes, PASS**. Additional generations during development were required only to verify sizing regressions discovered by the browser; no separate full build was run.
- Browser baseline: **40 cases**. Final browser acceptance: **40/40 PASS**, RU/EN at **320, 390, 768, 1440 px**, covering Hero, Bagration detail, Vilna detail, large milestone cover and Church comparison. Held image requests establish stable reserved versus loaded primary image dimensions; all measured height deltas are 0. Primary final geometry matches baseline within 1.1 px. No horizontal overflow, broken selected paths, missing alt or page exceptions.
- Additional comparison acceptance: **6/6 PASS**, EN at 390/1440 for Kuntsevo, Panorama and Triumphal Arch. Alongside Church, all four approved comparison pairs use working responsive delivery. Keyboard Home/End/Arrow, pointer/touch, paired eager loading and both external attribution links passed. Existing year clipping/crops and approved interaction code are retained.
- PhotoSwipe: **16/16 PASS** across both representative original assets, both locales and four widths; opens original Bagration (3420×4000) and milestone (3368×6000), closes with Escape and returns focus. No derivative replaces viewer originals.
- RU/EN content, attribution and structural parity preserved. Original media SHA-256 and generated copies verified; content JSON and editorial media manifest have no changes.

Reproducible browser script: [stage7-image-delivery-qa.mjs](../../.playwright-mcp/stage7-image-delivery-qa.mjs). Raw [baseline](../../.playwright-mcp/stage7-image-delivery/before.json), [final matrix](../../.playwright-mcp/stage7-image-delivery/after.json) and [additional comparisons](../../.playwright-mcp/stage7-image-delivery/after-comparisons.json). The local Chromium dependency reuses an existing installation and is not an application dependency. Yandex requests are deliberately blocked in this image QA; live map acceptance is unchanged from Stage 6 and is not reasserted here. Testing uses Chromium, not Safari/Firefox or physical mobile hardware; no aggregate CLS field metric is claimed.

## Screenshots

| Page              | Mobile 390 px                                                                                          | Desktop 1440 px                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Hero/Homepage     | [Mobile](../../.playwright-mcp/stage7-image-delivery/after-ru-390-home.png)                            | [Desktop](../../.playwright-mcp/stage7-image-delivery/after-ru-1440-home.png)                            |
| Dictionary        | [Mobile](../../.playwright-mcp/stage7-image-delivery/after-ru-390-dictionary-bagration.png)            | [Desktop](../../.playwright-mcp/stage7-image-delivery/after-ru-1440-dictionary-bagration.png)            |
| Timeline          | [Mobile](../../.playwright-mcp/stage7-image-delivery/after-ru-390-timeline-vilna.png)                  | [Desktop](../../.playwright-mcp/stage7-image-delivery/after-ru-1440-timeline-vilna.png)                  |
| Large Place cover | [Mobile](../../.playwright-mcp/stage7-image-delivery/after-ru-390-places-milepost-fili.png)            | [Desktop](../../.playwright-mcp/stage7-image-delivery/after-ru-1440-places-milepost-fili.png)            |
| Church comparison | [Mobile](../../.playwright-mcp/stage7-image-delivery/after-ru-390-places-intercession-church-fili.png) | [Desktop](../../.playwright-mcp/stage7-image-delivery/after-ru-1440-places-intercession-church-fili.png) |
| PhotoSwipe        | [Mobile](../../.playwright-mcp/stage7-image-delivery/ru-390-milepost-viewer.png)                       | [Desktop](../../.playwright-mcp/stage7-image-delivery/ru-1440-milepost-viewer.png)                       |

Additional RU 320/768 and EN 390/1440 captures, all six extra comparison captures and baseline screenshots are alongside these files. Representative captures were visually inspected for image quality and unchanged composition.

## Exact implementation files

- `app/components/HeroSlider.vue`
- `app/components/HomepageTimeline.vue`
- `app/components/MapPlaceCard.vue`
- `app/components/MuseumImage.vue`
- `app/components/PlaceImageComparison.vue`
- `app/components/PlaceMedia.vue`
- `app/components/TimelineArtwork.vue`
- `app/pages/dictionary/[slug].vue`
- `app/pages/places/[slug].vue`
- `app/pages/timeline/[slug].vue`
- `app/utils/imageDelivery.ts` (new)
- `app/data/imageDelivery.json` (new; exact list/dimensions/bytes of all 56 derivative files under `public/images/delivery/`)
- `scripts/prepare-image-delivery.ps1` (new)
- `test/image-delivery.test.ts` (new)
- `test/image-delivery-generated.test.mjs` (new)
- `package.json` (maintenance command and focused test inclusion; no dependency/lockfile changes)
- `.playwright-mcp/stage7-image-delivery-qa.mjs` and evidence under `.playwright-mcp/stage7-image-delivery/` (new)
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/research/image-delivery-stage7-2.md` (this report)

Existing unrelated Stage 6 documentation/QA changes in the workspace are preserved.

## Remaining issues

No unresolved repository-controlled Stage 7.2 regression found. PhotoSwipe intentionally incurs original download bytes on opening; derivatives intentionally add storage. The offline processor currently requires Windows; ordinary static generation is platform independent. Additional cross-browser review is optional beyond the recorded Chromium evidence. Kutuzov Hut comparison and optional historical imagery stay deferred; no new historical research or imagery was introduced. **Stage 7.2 ACCEPTED (user-reported); Stage 7 not complete.**
