# Stage 7.4 — final media acceptance

2026-10-08. **Stage 7 — COMPLETE / ACCEPTED.** Stage 6 COMPLETE / ACCEPTED; Stage 7.2 accepted and Stage 7.3 complete. Stage 8 NOT STARTED. The final Git-readiness check resolved the earlier inclusion blocker; prior technical/browser checks below remain recorded evidence and were not rerun during closure.

## Official Stage 7 closure

Technical, browser, accessibility, historical attribution, RU/EN parity, responsive delivery, layout stability and Git-readiness acceptance **PASS**. The final index contains exactly **81 required Stage 7 files**, with no missing or unexpected staged paths: all 56 derivatives, delivery catalog/helper, seven components, three detail templates, package scripts, maintenance processor, two tests and nine documentation/metadata files. All 42 originals are already tracked. Staged versions match accepted working files before these closure edits; no required implementation file remains untracked or ignored.

The 25 staged text files were inspected for credentials; no credential-like literals or private keys were found. No `.env`, local API key, browser screenshot, temporary QA evidence, cache, dependency directory or generated build output is staged. The staged diff check passes. Unrelated Stage 6 workspace changes and local QA artifacts remain outside this Stage 7 staging set.

Previously passed quality gates are retained: 26/26 focused final media tests, ESLint/typecheck/formatting PASS, generated reference checks PASS and 277-route static generation. Browser evidence comprises 46 accepted page/comparison cases, 16 viewer cases and 12 additional Timeline/gallery viewer cases. These results cover keyboard/mouse/touch access, focus return, source links, alt, responsive selection and PhotoSwipe original resolution. No successful test, build, generation or browser result is newly claimed for this Git-only closure.

The owner staged the implementation; Codex did not stage, commit or push anything. Only `docs/ROADMAP.md` and this report were changed for closure, and their new edits need re-staging:

```powershell
git add -- docs/ROADMAP.md docs/research/media-stage7-4-final-acceptance.md
```

No application code, historical content, original media or derivatives changed. No remaining Stage 7 acceptance blocker. Optional imagery, further comparisons, broader browser coverage and the deferred Kutuzov Hut comparison remain nonblocking backlog; Stage 8 remains NOT STARTED.

## Inventory and editorial acceptance

- **42 originals** remain intact: all SHA-256 hashes match the delivery catalog, and all originals are tracked. **56 derivatives for 29 originals** exist in both source `public/images/delivery/` and current generated output. No file was deleted, renamed, optimized again or overwritten.
- All production image sources and responsive candidates exist with exactly matching path case, checked against actual filesystem names rather than Windows case-insensitive lookup. This covers the technical catalog, RU/EN content and every generated `<img>` source/srcset. No broken local or remote production image reference found. This is a case-sensitive-path compatibility check, not a claim of a new Linux build.
- RU/EN media/source identities match; all media uses retain nonempty localized alt, captions and credit plus valid named HTTPS sources. Existing audited creators, dates, rights and historical caveats are retained; no new historical/licensing research or content changes. Dictionary 23/29, Timeline 17/20 and Places 10/13 lead-image coverage remains identical across locales.
- Intentional no-image layouts remain valid. Exactly four Places have active comparison pairs: Kuntsevo, Panorama, Intercession Church and Triumphal Arch. Hut comparison stays deferred; the incorrect proposed historical file is not activated.
- Savrasov uses its existing Dictionary original; Church 2012 remains an explicitly archived, undelivered candidate with preserved rights/source metadata. No candidate is mistaken for a missing production asset.

## Browser acceptance

Previously accepted [Stage 7.2 evidence](image-delivery-stage7-2.md) remains valid: **46/46 page/comparison cases** and **16/16 Dictionary/large-cover viewer cases**. These were not rerun or relabeled as new checks. Coverage includes RU/EN 320/390/768/1440, Hero/loading priority, responsive selection, covers, all four comparisons, keyboard/pointer/touch controls, alt, source links, focus return and overflow. [Stage 7.3](media-stage7-3-cleanup.md) already verified the skip link is hidden at rest and visible only when focused.

New targeted acceptance: **12/12 PASS**, RU/EN at 390 and 1440, for Timeline Vilna and galleries on Kutuzov Hut/Triumphal Arch. Browser checks cover touch opening on mobile, keyboard Enter opening on desktop, mouse opening/close controls, viewer Tab focus containment, Escape/focus return, original dimensions, alt, external attribution and page overflow. Zoom visibly enlarges the large originals; small originals already displayed at native size intentionally hide the zoom control, avoiding upscaling. Desktop drag/pan was exercised when zoomed. The harness initially assumed every original could zoom; it was corrected for this intended native-size behavior without changing the application, retaining completed cases. Raw new results: [.playwright-mcp/stage7-4-browser.json](../../.playwright-mcp/stage7-4-browser.json).

Actual selected-resource examples:

| View                                                   | Ordinary display                    | PhotoSwipe original         |
| ------------------------------------------------------ | ----------------------------------- | --------------------------- |
| Milestone, 320 px (prior evidence)                     | 640 px derivative, 305,505 bytes    | 3368×6000, 17,553,175 bytes |
| Milestone, 1440 px (prior evidence)                    | 1280 px derivative, 1,131,657 bytes | Same untouched original     |
| Vilna, 390 px / DPR 2 and 1440 px / DPR 1 (new checks) | 1280 px derivative, 289,693 bytes   | 3123×2178, 4,620,237 bytes  |
| Savrasov gallery (new checks)                          | Existing small original, lazy       | Same 1215×747 original      |
| Arch 1934 gallery (new checks)                         | Existing small original, lazy       | Same 900×600 original       |

The same candidate can be suitable for a high-density mobile screen and a larger desktop display; source choice depends on rendered size, density and cache. Small originals do not acquire unnecessary derivatives. Tests use local Chromium with simulated touch, not physical mobile devices or new Safari/Firefox coverage. Yandex requests are blocked during image QA; Stage 6 live acceptance is not reasserted.

## Performance and stability

Preserved Stage 7.2 measurements: original collection **86,765,138 bytes**, derivatives **13,326,789 bytes**, combined prepared media **100,091,927 bytes**. The milestone's representative 1280 px display saves **16,421,518 bytes (93.6%)** versus its original. These are measured selected-file sizes, not network-time claims.

The held-image-request evidence reports **0 CSS px primary height change** across all 40 main viewport cases; loaded geometry matches the approved baseline within 1.1 px. Intrinsic dimensions, contain presentation and approved Hero/comparison crops remain unchanged. New viewer/gallery checks found no horizontal overflow or missing media. No aggregate field CLS metric or unexecuted browser result is claimed.

## Final quality gates

| Gate                                                     | Final result                                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Focused content/Hero/delivery/generated-media tests      | **26/26 PASS**, newly executed                                                                               |
| Global ESLint (`npm run lint`)                           | **PASS**, newly executed                                                                                     |
| TypeScript (`npm run typecheck`)                         | **PASS**, newly executed                                                                                     |
| Project formatting (`npm run format:check`)              | **PASS**, newly executed                                                                                     |
| Generated source/candidate paths and all original hashes | **PASS**, newly checked against current output                                                               |
| Static generation                                        | Existing **277-route PASS** retained from Stage 7.2; not rerun because no application/media changes followed |
| New Timeline/gallery browser checks                      | **12/12 PASS**                                                                                               |
| Git/deployment inclusion                                 | **PASS: complete 81-file Stage 7 inventory staged; 42 originals already tracked**                            |

No build or generation was repeated. Existing generated output is suitable locally and contains all originals/derivatives. `generate` remains `nuxt generate`, with no build/generate processor hooks; no CI workflow currently exists. Linux/GitHub Pages can consume prepared assets without Windows/System.Drawing, provided the assets and catalog/helper are included in the checkout.

## Resolved Git/deployment blocker — historical Stage 7.4 snapshot

**At the initial Stage 7.4 audit, Git source was not yet deployment-ready.** The runtime catalog/helper and 56 derivatives were untracked (58 runtime files); the maintenance script and two tests were also untracked (61 files total). None was ignored. Their exact paths are retained below as historical evidence. These files, the approved tracked implementation changes and all required Stage 7 documentation are now staged; the blocker is resolved by the official closure check above.

Historical inclusion commands supplied to the owner; **Codex did not execute them**:

```powershell
git add -- app/data/imageDelivery.json app/utils/imageDelivery.ts public/images/delivery/ scripts/prepare-image-delivery.ps1 test/image-delivery.test.ts test/image-delivery-generated.test.mjs
git add -- app/components/HeroSlider.vue app/components/HomepageTimeline.vue app/components/MapPlaceCard.vue app/components/MuseumImage.vue app/components/PlaceImageComparison.vue app/components/PlaceMedia.vue app/components/TimelineArtwork.vue 'app/pages/dictionary/[slug].vue' 'app/pages/places/[slug].vue' 'app/pages/timeline/[slug].vue' package.json
git diff --cached --name-only
git diff --cached --stat
git diff --cached --check
```

The owner included the required documentation and preserved unrelated Stage 6 changes. The explicit staging set excludes `.env`, generated `.output`, screenshots/QA evidence under `.playwright-mcp`, dependencies, logs and caches. Git ignore checks confirm local `.env`, `.output`, node_modules and logs are ignored; only `.env.example` is tracked. The final index now contains 81 intended Stage 7 files. No API key was printed, changed, staged or committed. Temporary screenshots/QA evidence remain untracked and outside the deployment staging set. The prepared delivery catalog contains dimensions/hashes/paths, not credentials.

### Previously untracked required paths — all now staged

The following list preserves the initial Stage 7.4 snapshot; every listed file is now staged.

- `app/data/imageDelivery.json`
- `app/utils/imageDelivery.ts`
- `public/images/delivery/dictionary-alexander-i-dawe-1127.jpg`
- `public/images/delivery/dictionary-alexander-i-dawe-640.jpg`
- `public/images/delivery/dictionary-bagration-dawe-1280.jpg`
- `public/images/delivery/dictionary-bagration-dawe-640.jpg`
- `public/images/delivery/dictionary-bennigsen-dawe-640.jpg`
- `public/images/delivery/dictionary-davydov-dawe-640.jpg`
- `public/images/delivery/dictionary-grand-army-vernet-1812-640.jpg`
- `public/images/delivery/dictionary-grand-army-vernet-1812-908.jpg`
- `public/images/delivery/dictionary-maloyaroslavets-samokish-640.jpg`
- `public/images/delivery/dictionary-smolensk-langlois-1839-1280.jpg`
- `public/images/delivery/dictionary-smolensk-langlois-1839-640.jpg`
- `public/images/delivery/dictionary-tarutino-hess-1847-1280.jpg`
- `public/images/delivery/dictionary-tarutino-hess-1847-640.jpg`
- `public/images/delivery/places-archangel-michael-chapel-2008-640.jpg`
- `public/images/delivery/places-borodino-panorama-1962-1280.jpg`
- `public/images/delivery/places-borodino-panorama-1962-640.jpg`
- `public/images/delivery/places-borodino-panorama-museum-2007-1280.jpg`
- `public/images/delivery/places-borodino-panorama-museum-2007-1920.jpg`
- `public/images/delivery/places-borodino-panorama-museum-2007-640.jpg`
- `public/images/delivery/places-brotherhood-grave-obelisk-2023-1280.jpg`
- `public/images/delivery/places-brotherhood-grave-obelisk-2023-640.jpg`
- `public/images/delivery/places-intercession-church-fili-1888-1280.jpg`
- `public/images/delivery/places-intercession-church-fili-1888-640.jpg`
- `public/images/delivery/places-intercession-church-fili-2019-1280.jpg`
- `public/images/delivery/places-intercession-church-fili-2019-1920.jpg`
- `public/images/delivery/places-intercession-church-fili-2019-640.jpg`
- `public/images/delivery/places-kuntsevo-estate-2015-1280.jpg`
- `public/images/delivery/places-kuntsevo-estate-2015-1920.jpg`
- `public/images/delivery/places-kuntsevo-estate-2015-640.jpg`
- `public/images/delivery/places-kuntsevo-estate-ca1910-640.jpg`
- `public/images/delivery/places-kutuzov-hut-modern-2015-640.jpg`
- `public/images/delivery/places-kutuzov-monument-2016-1280.jpg`
- `public/images/delivery/places-kutuzov-monument-2016-640.jpg`
- `public/images/delivery/places-milepost-fili-2023-1280.jpg`
- `public/images/delivery/places-milepost-fili-2023-640.jpg`
- `public/images/delivery/places-triumphal-arch-modern-2015-1280.jpg`
- `public/images/delivery/places-triumphal-arch-modern-2015-1920.jpg`
- `public/images/delivery/places-triumphal-arch-modern-2015-640.jpg`
- `public/images/delivery/timeline-borodino-hess-1843-1280.jpg`
- `public/images/delivery/timeline-borodino-hess-1843-1919.jpg`
- `public/images/delivery/timeline-borodino-hess-1843-640.jpg`
- `public/images/delivery/timeline-fili-council-kivshenko-1882-1280.jpg`
- `public/images/delivery/timeline-fili-council-kivshenko-1882-640.jpg`
- `public/images/delivery/timeline-krasny-losmina-hess-1280.jpg`
- `public/images/delivery/timeline-krasny-losmina-hess-640.jpg`
- `public/images/delivery/timeline-moscow-entry-basset-1812-1280.jpg`
- `public/images/delivery/timeline-moscow-entry-basset-1812-640.jpg`
- `public/images/delivery/timeline-retreat-moscow-suchodolski-1853-1280.jpg`
- `public/images/delivery/timeline-retreat-moscow-suchodolski-1853-640.jpg`
- `public/images/delivery/timeline-shevardino-redoubt-tuzanna-2020-1280.jpg`
- `public/images/delivery/timeline-shevardino-redoubt-tuzanna-2020-640.jpg`
- `public/images/delivery/timeline-smorgoni-samokish-1912-640.jpg`
- `public/images/delivery/timeline-vilna-cui-attributed-1812-1280.jpg`
- `public/images/delivery/timeline-vilna-cui-attributed-1812-640.jpg`
- `public/images/delivery/timeline-vyazma-hess-1280.jpg`
- `public/images/delivery/timeline-vyazma-hess-640.jpg`
- `scripts/prepare-image-delivery.ps1`
- `test/image-delivery-generated.test.mjs`
- `test/image-delivery.test.ts`

## Closure decision and optional backlog

Git inclusion is verified and the last mandatory gate passes. **Stage 7 — COMPLETE / ACCEPTED.** The owner staged all required files; Codex performed only read-only index/security checks and the two authorized closure-document edits. The newly modified closure documentation needs re-staging as shown above; no image/browser/build audits were repeated.

Kutuzov Hut comparison, optional imagery for intentionally unillustrated entities, additional comparisons and broader cross-browser coverage remain nonblocking backlog. No Stage 8 work began.

## Exact files changed in this pass

- `docs/ROADMAP.md`
- `docs/research/media-stage7-4-final-acceptance.md` (this report)
- `.playwright-mcp/stage7-4-browser.json` (local QA evidence; exclude from deployment staging)

No application code, historical content, source metadata, original images or derivatives changed. No staging, commit or push was performed.
