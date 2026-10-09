# Hero translucent gradient — awaiting visual review

**AWAITING VISUAL REVIEW. Stage 9 NOT STARTED.** No staging, commit or push. Existing uncommitted work is preserved; this pass changes only Hero CSS and its documentation, plus local QA artifacts. It supersedes the backing and heading-width description in the earlier Homepage refinement report; that report's earlier test results remain historical evidence.

## Correction and comparison

Inspected Hero styles in Git revisions `43bede1` (Stage 3) and `73babf4`: the accepted desktop radial light used 68% opacity at its centre, 56% at 40%, 30% at 70%, then transparent. Mobile used 74%/60%/35%. The immediate pre-correction implementation used 94%/90%/72%, with the 90% zone extending to 72% of its radius and padding growing to 256px.

The corrected primary layer restores the desktop 68%/56%/30% falloff, with a second 46%/38%/18% → transparent layer concentrated around the lower reading zone. Both are attached to the stationary copy block. The upper zone is broad enough for the burgundy year on the dark Council at Fili artwork. Horizontal/vertical gradient masks softly fade the edges; no solid fill, blur, asset change or extra animation is used. The artworks remain visible through the text zone. Opacity is independent of viewport size.

Backing padding now uses bounded fluid values: 64–112px vertically and 64–128px horizontally. Copy width grows fluidly from 30rem to a maximum 64rem; the desktop H1 uses 100% of that width, removing the inherited 15ch constraint. Both localized headings stay on one line at 1920 and 2560px. The existing mobile heading constraint, fonts, text bounding box, copy position and crops are unchanged. Captions and their dark backing are untouched. No other Homepage section, historical content, media file or slider implementation was edited.

## Files changed

- `app/pages/index.vue` — Hero backing/copy width/desktop heading constraint only.
- `docs/DESIGN.md` — current Hero gradient contract.
- `docs/research/hero-gradient-restoration.md` — this review record.

Local QA runners: `.playwright-mcp/hero-gradient-qa.mjs` and `.playwright-mcp/hero-gradient-contrast.mjs` (adapted from the existing focused Hero runner). Before/after screenshots and geometry: `.playwright-mcp/hero-gradient/`. Contrast/slider evidence: `.playwright-mcp/hero-gradient-contrast/`.

## Focused verification

- **Before 8/8 and after 8/8 RU/EN viewport checks PASS:** 390×844, 1440×900, 1920×1080 and 2560×1440. Screenshots below show the first slide. No horizontal overflow or page errors. The after checks also exercise all three artworks, stationary text bounds, pagination and safe caption source-link attributes.
- **24/24 contrast/slide cases PASS:** both languages × four requested viewports × three artworks. Sampled minima: year 3.15:1, heading 5.50:1, description 4.26:1, caption 5.29:1. Descriptions below 24px have a minimum of 4.50:1; 2560px descriptions are 28.48px and use the large-text 3:1 threshold. These are targeted rendered-background samples, not a complete accessibility audit. The initial dark-slide contrast failure was corrected by widening the upper gradient; the old runner's uniform description threshold was adjusted for actual large-text size.
- Original Hero fade speed (1100ms), normal autoplay advance, reduced-motion speed 0/no autoplay over seven seconds, keyboard pagination/focus and source links: **PASS** in the reused focused runner.
- Before/after 390px copy position/dimensions and year/title/description font sizes match exactly in RU and EN.
- Focused Hero metadata/content tests: **3/3 PASS**. Scoped ESLint, Prettier and diff whitespace checks: **PASS**.

No build/generation, unrelated suites or live Yandex provider test was run. Provider requests were blocked in these local Hero checks. No confirmed functional regression remains; visual acceptance is pending.

## First-slide screenshots

Each pair uses the same viewport, locale, artwork and crop. The previous backing is the actual current working-tree implementation captured before this correction, rather than a reconstruction from Git.

| Width | RU before                                                        | RU corrected                                                       | EN before                                                        | EN corrected                                                       |
| ----- | ---------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| 390   | [Before](../../.playwright-mcp/hero-gradient/before-ru-390.png)  | [Corrected](../../.playwright-mcp/hero-gradient/after-ru-390.png)  | [Before](../../.playwright-mcp/hero-gradient/before-en-390.png)  | [Corrected](../../.playwright-mcp/hero-gradient/after-en-390.png)  |
| 1440  | [Before](../../.playwright-mcp/hero-gradient/before-ru-1440.png) | [Corrected](../../.playwright-mcp/hero-gradient/after-ru-1440.png) | [Before](../../.playwright-mcp/hero-gradient/before-en-1440.png) | [Corrected](../../.playwright-mcp/hero-gradient/after-en-1440.png) |
| 1920  | [Before](../../.playwright-mcp/hero-gradient/before-ru-1920.png) | [Corrected](../../.playwright-mcp/hero-gradient/after-ru-1920.png) | [Before](../../.playwright-mcp/hero-gradient/before-en-1920.png) | [Corrected](../../.playwright-mcp/hero-gradient/after-en-1920.png) |
| 2560  | [Before](../../.playwright-mcp/hero-gradient/before-ru-2560.png) | [Corrected](../../.playwright-mcp/hero-gradient/after-ru-2560.png) | [Before](../../.playwright-mcp/hero-gradient/before-en-2560.png) | [Corrected](../../.playwright-mcp/hero-gradient/after-en-2560.png) |
