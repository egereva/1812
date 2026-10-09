# Homepage refinement — awaiting visual review

**AWAITING VISUAL REVIEW. Stage 9 NOT STARTED.** No staging, commit or push was performed. The accepted Stage 7/8 implementation is preserved outside this scoped refinement.

## Responsive changes

The former image-relative overlay drifted from the centered text container above 1440px. A soft radial backing now belongs to the stationary `home-hero__copy` block, follows its dimensions and is clipped at the Hero boundary. It uses no additional large-screen breakpoint. The active caption sits outside Swiper's transformed fade slides, above the backing, inside an outer figure with an image/caption association. Its original authors, artwork titles and source URLs remain unchanged.

Desktop year/title sizes use width and viewport height with bounded clamps; body copy and captions grow fluidly. Existing mobile/tablet type overrides remain. Main ranges: year 7–15rem, title 3–7rem, description 1.125–1.875rem, caption 0.8125–1.125rem. Actual mobile overrides retain 78px/32px/16px year/title/description at 390px. Short desktop heights constrain the large title/year sizes. Credits use more opaque ivory, fluid sizes and a soft local dark backing. Root hover pausing includes the caption, preventing the caption-layer change from interrupting the accepted hover behavior.

| Viewport    |    Year |   Title | Description | Caption |
| ----------- | ------: | ------: | ----------: | ------: |
| 1440 × 900  | 172.8px | 68.48px |     19.52px |    13px |
| 1920 × 1080 | 230.4px | 88.64px |     23.36px | 15.56px |
| 2560 × 1440 |   240px |   112px |     28.48px |    18px |
| 2560 × 900  |   207px |    99px |     28.48px |    18px |

All three artworks, object-fit/position rules, source assets, image delivery and priorities are retained. H1 and introductory copy remain outside slide transitions. Fade speed 1100ms, autoplay delay 6500ms, pagination, keyboard operation and reduced-motion behavior remain; the overlay header is unchanged. Dictionary, Homepage Timeline and Homepage Map presentation/implementation were not edited.

## Bilingual introduction

Stored as `homeIntroduction` in RU/EN `site.json`, passed through the existing content facade and rendered between Hero and Dictionary. The section has an eyebrow, one H2 and three paragraphs; desktop pairs heading/prose and mobile stacks them. No new images, links, buttons, cards or animations. Statements are grounded in approved chronology entries `invasion-neman`, `borodino`, `council-fili`, `moscow-abandoned`, `napoleon-leaves-moscow` and existing Place historical-status distinctions. No dates or quotations were introduced.

### RU — Исторический контекст · 1812 год: события и память

Отечественная война 1812 года началась с вторжения Великой армии Наполеона в Российскую империю. Бородинское сражение стало одним из её ключевых событий, но не привело к уничтожению русской армии.

На Военном совете в Филях Кутузов принял решение оставить Москву без нового сражения, чтобы сохранить армию. После оставления города русскими войсками в Москву вошла Великая армия. Позднее Наполеон покинул Москву, и французские войска начали отступление.

В современной западной Москве память об этих событиях сохраняют исторические места, музеи и памятники. Справочник связывает ход войны с городской географией, различая сохранившиеся свидетельства, восстановленные сооружения и более поздние места памяти.

### EN — Historical context · 1812: events and memory

The Patriotic War of 1812 began with Napoleon’s Grande Armée invading the Russian Empire. The Battle of Borodino was one of its key events, but it did not result in the destruction of the Russian army.

At the Military Council at Fili, Kutuzov decided to abandon Moscow without another battle in order to preserve the army. After the Russian troops left the city, the Grande Armée entered Moscow. Napoleon later left Moscow, and the French forces began their retreat.

In modern western Moscow, historical sites, museums and monuments preserve the memory of these events. The guide connects the course of the war with the city’s geography, distinguishing surviving witnesses, reconstructed buildings and later places of remembrance.

## Executed verification

- Focused Hero/content tests: **26/26 PASS**, including approved artwork metadata, no-media readiness, bilingual introduction parity and existing historical content integrity.
- Scoped ESLint, typecheck and formatting: **PASS**. Diff whitespace checks pass.
- **60/60 slide/viewport cases PASS**: RU/EN × three artworks × 390/768/1440/1920/2560 widths with two heights each (844/640, 1024/600, 900/720, 1080/800, 1440/900). Decoded assets, stationary text geometry, pagination selection, safe external-source attributes, no horizontal overflow and no page errors pass.
- Sampled rendered-background contrast minima: year **4.94:1**, title **12.33:1**, description **7.41:1**, caption **5.29:1**. Samples were taken with text hidden and layout/backing retained, across text-line rectangles for every slide/viewport/language; this is targeted sampling, not a complete Stage 9 accessibility audit.
- Autoplay advances normally; reduced motion stops autoplay and uses zero transition speed, while keyboard pagination remains available and focus pauses autoplay.
- Final static browser verification: **24/24 slide/crop cases PASS** at RU/EN 390/1440/1920/2560, plus native mobile touch swipe and caption hover pause/resume. Final screenshots for those sizes replace development screenshots and have no development toolbar.
- Generated Homepage tests: **6/6 PASS**, covering new introduction text/order, existing Timeline initial artwork/six-image strip and Map invitation/fallback in both languages.
- Static generation: **277 routes**, successful final output. One initial generation preceded a final confirmed hover-behavior correction; one refresh included that correction. No separate build or unrelated full suites were run. Previously observed Nuxt timing-label warnings remain nonblocking.
- Accepted About content is unchanged; existing Homepage preview components and audited historical entity/source JSON were not edited. Live Yandex provider acceptance was not repeated; provider requests were blocked in these local Hero checks.

No known implementation blocker remains. Owner visual review is pending; no later stage was started.

## Changed files and artifacts

`app/pages/index.vue`, `app/components/HeroSlider.vue`, `content/ru/site.json`, `content/en/site.json`, `shared/content/index.ts`, `shared/types/content.ts`, `test/hero.test.ts`, `test/homepage-render.test.mjs`, `docs/PROJECT.md`, `docs/CONTENT.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, this report. Local QA runners: `.playwright-mcp/home-refinement-qa.mjs`, `.playwright-mcp/home-refinement-final.mjs`. Screenshots/results: `.playwright-mcp/home-refinement/`; local logs: `.playwright-mcp/home-refinement-{dev,typecheck,generate}.log`.

### Final review screenshots

Each Hero link below opens slide 1; corresponding `slide2.png` and `slide3.png` files in the same directory show the other approved artworks. Introduction links show the section immediately below Hero.

| Width | RU Hero                                                             | EN Hero                                                             | RU introduction                                                           | EN introduction                                                           |
| ----- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 390   | [RU](../../.playwright-mcp/home-refinement/ru-390x844-slide1.png)   | [EN](../../.playwright-mcp/home-refinement/en-390x844-slide1.png)   | [RU](../../.playwright-mcp/home-refinement/ru-390x844-introduction.png)   | [EN](../../.playwright-mcp/home-refinement/en-390x844-introduction.png)   |
| 1440  | [RU](../../.playwright-mcp/home-refinement/ru-1440x900-slide1.png)  | [EN](../../.playwright-mcp/home-refinement/en-1440x900-slide1.png)  | [RU](../../.playwright-mcp/home-refinement/ru-1440x900-introduction.png)  | [EN](../../.playwright-mcp/home-refinement/en-1440x900-introduction.png)  |
| 1920  | [RU](../../.playwright-mcp/home-refinement/ru-1920x1080-slide1.png) | [EN](../../.playwright-mcp/home-refinement/en-1920x1080-slide1.png) | [RU](../../.playwright-mcp/home-refinement/ru-1920x1080-introduction.png) | [EN](../../.playwright-mcp/home-refinement/en-1920x1080-introduction.png) |
| 2560  | [RU](../../.playwright-mcp/home-refinement/ru-2560x1440-slide1.png) | [EN](../../.playwright-mcp/home-refinement/en-2560x1440-slide1.png) | [RU](../../.playwright-mcp/home-refinement/ru-2560x1440-introduction.png) | [EN](../../.playwright-mcp/home-refinement/en-2560x1440-introduction.png) |
