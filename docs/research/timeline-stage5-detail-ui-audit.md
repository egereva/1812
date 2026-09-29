# Stage 5 — Timeline detail UI audit, 2026-09-29

Scope: `/timeline/[slug]` and `/en/timeline/[slug]` presentation only. Production historical content, dates, relations, image metadata, binaries, Homepage, full Timeline, Dictionary, Hero and viewer implementation are unchanged. Stage 5 IN PROGRESS; Stage 6 NOT STARTED. Final Stage 5 audit remains separate.

## Composition and data

Back link → chronology/event eyebrow → prominent supplied Old Style date/range → quiet supplied New Style date/range → H1/lead → divider → article/media → related materials → historical sources → chronological previous/next.

- Desktop prose/media columns are approximately 58/42. Images use contain and a 32rem height bound; native small portraits are not enlarged. SVG and photographs retain their whole composition.
- At ≤900px the DOM order is media/caption before prose. No-image articles use a readable 46rem measure, without a media slot. Footer follows content; measured gap after the article is zero.
- Shared date formatter performs no calendar conversion. Berezina is 14–16 November / 26–28 November; Manifesto retains 25 December 1812 / 6 January 1813.
- `TimelineArtwork` and the existing viewer retain caption/description qualifications, quiet attribution and resolved image source links. Historical sources are separately resolved from event.sourceIds.
- Related materials use the existing bidirectional resolver. Chronological neighbors are omitted from related Timeline links. Previous/next use sorted production events, not relations; Neman has next only, Manifesto previous only. Reactive record and metadata update on client navigation.

## Visual and browser verification

RU was developed and inspected before EN. Both dev and generated static output were checked.

| Cases                                             | RU widths        | EN widths  | Result                                                      |
| ------------------------------------------------- | ---------------- | ---------- | ----------------------------------------------------------- |
| Borodino, Berezina, Manifesto                     | 390 / 768 / 1440 | 390 / 1440 | PASS                                                        |
| Kutuzov, Shevardino, Tarutino march, armies unite | 1440             | —          | PASS                                                        |
| Council at Fili                                   | 390 / 1440       | —          | PASS                                                        |
| All 20 detail routes                              | 1440             | 1440       | 17 visible decoded artworks; 3 no-image articles per locale |

No page overflow, cropped artwork, text collision, missing paragraphs or artificial footer gap observed. HTTP 200, meaningful image alt, one H1, localized title/description and SSR links verified. Runtime exceptions and hydration mismatches: zero. Existing Nuxt timing instrumentation warnings and unrelated favicon 404 remain outside scope.

Viewer: keyboard Enter, trapped Tab, Escape, focus return, zoom and reduced motion PASS. Touch-context tap, two-finger pinch zoom and touch close/focus return PASS for the SVG map. Shared viewer code was not modified.

Homepage regression: hard reload RU/EN starts at Neman with visible artwork; desktop active artwork 6/6, first mobile/tablet strip artwork visible at 390/768. Full Timeline retains 20 events and eight existing artwork assignments per locale.

Local screenshots are retained under `.playwright-mcp/timeline-detail-stage5/`: RU Borodino 390, Berezina 768, Fili 1440, Manifesto 1440; EN Berezina 390 and Borodino 1440. Generated static screenshots omit devtools overlays.

## Quality gates

- Existing content/hero tests: 19/19 PASS, including approved content and metadata hash guards.
- New generated detail tests: 40/40 PASS. All routes, exact three paragraphs, supplied dates/endpoints, image/caption/description/source, absence of empty media containers, historical source URLs, first/last and all intermediate localized neighbors.
- Generated Homepage regression tests: 2/2 PASS.
- Typecheck, lint, changed-file format check, build and generate: PASS. Generate: 277 routes.
- SHA-256 comparison of 16 frozen content/presentation/viewer files: zero changes.

Changed implementation: detail page, RU/EN UI labels, package test script and the generated detail test. DESIGN/ARCHITECTURE document the new detail presentation contract; ROADMAP records factual progress.
