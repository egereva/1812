# Stage 8.3 — Sources catalog

**ACCEPTED after owner visual review (user-reported in the Stage 8.4 request).** Stage 8.2 was accepted by the owner after visual review, as reported in the Stage 8.3 request. Its page and content were not edited in this pass. The executed checks below remain previously recorded evidence.

## Catalog and preservation

`/sources` and `/en/sources` now render the production source catalog through the existing content facade. `getSourceGroups` partitions records using the existing `type`: 26 historical/research sources and 42 media attribution records, **68 per locale**. Filtering retains catalog order within each group; all corresponding IDs and URLs match between RU and EN. No sorting, merging, new sources or invented record descriptions were introduced. The two separate records referring to the same PDF remain separate.

Each record uses its unchanged title as an accessible WebsiteLink label, followed by available author, publisher/resource, year and access date. No missing metadata is invented. Rights/licence statements already embedded in source titles remain intact; media credit and editorial rights records are unchanged. URL domains are shown for scanning, while link hrefs retain the complete original URLs, including encoded paths and query strings. External links use the existing origin-aware WebsiteLink behavior: `target="_blank"`, `rel="noopener noreferrer"`.

The catalog uses existing ivory, graphite and burgundy tokens, serif headings, thin rules and native ordered lists. Desktop pairs section headings with the list; mobile stacks them. Two native fragment links provide section navigation without extra JavaScript. The page has one H1, two H2s, record H3s, localized title/description and the existing layout language metadata. Stable record IDs are also DOM anchors.

Current source counts in CONTENT are corrected to distinguish 26 research, 42 media and 68 total records. Earlier roadmap counts in dated Stage 1 snapshots remain historical evidence rather than being rewritten.

## Executed checks

- Focused content and link tests: **24/24 PASS** (22 content, two origin-aware link tests). Added coverage verifies all records survive grouping with metadata identity, stable order, bilingual ID/URL parity and the shared-PDF distinction. No unrelated Stage 7 test suites were run.
- Scoped ESLint: **PASS** for the page, facade, content tests and local QA runner.
- Typecheck: **PASS**.
- Scoped Prettier and diff whitespace checks: **PASS**.
- Static generation executed once: **PASS, 277 routes**. Nuxt emitted the same nonblocking timing-label warnings recorded during Stage 8.2 (`No such label '[nuxt-app] app:rendered' for console.timeEnd()`); generation exited successfully.
- Final generated-static browser cases: **4/4 PASS**, RU/EN at 390px and 1440px. Development checks preceded generation; final screenshots/results replace the preview artifacts.
- Each generated response server-renders all 68 record headings. Research/media counts are 26/42; DOM IDs have no duplicates. Every title, complete URL, target/rel, available metadata value and displayed domain matches its production record. Localized SEO and HTML language pass.
- Skip-to-content, both section anchors, keyboard traversal of all 68 record links and visible two-pixel focus pass in every viewport/language case. Enter on a source link opens a new tab. External requests were intercepted for that behavior check: **external provider availability was not tested**.
- All rendered internal route destinations return HTTP 200; both native section targets exist. No horizontal overflow or browser page errors. Long titles wrap; full encoded URLs are retained as hrefs rather than displayed as long raw strings. Visual inspection covers both catalog sections in both languages and widths.

## Changed files and review artifacts

- `app/pages/sources.vue`
- `shared/content/index.ts`
- `i18n/locales/ru.json`, `i18n/locales/en.json`
- `test/content.test.ts`
- `docs/CONTENT.md`, `docs/ROADMAP.md`
- `docs/research/about-stage8-2.md` (acceptance status only)
- `docs/research/sources-stage8-3.md` (this report)
- `.playwright-mcp/stage8-sources-qa.mjs`
- Local artifacts: `.playwright-mcp/stage8-sources/{ru-390.png,ru-1440.png,en-390.png,en-1440.png,ru-390-media.png,ru-1440-media.png,en-390-media.png,en-1440-media.png,results.json,generate.log}`, `.playwright-mcp/stage8-sources-dev.log`, `.playwright-mcp/stage8-sources-typecheck.log`.

No source JSON, accepted About page/content, historical entity data, media or dependencies changed. Nothing was staged, committed or pushed. No known implementation blocker remains; owner visual acceptance has passed. Stage 8.4 and Stage 9 were not started during the implementation reported here; final Stage 8 status is recorded in ROADMAP and the Stage 8 final acceptance report.
