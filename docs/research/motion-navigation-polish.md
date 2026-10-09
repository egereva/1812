# Motion and navigation polish — awaiting visual review

**AWAITING VISUAL REVIEW. Stage 9 NOT STARTED.** Existing working-tree changes were preserved. No staging, commit or push was performed. This pass changes no historical content, attribution, media binaries or assets.

## Shared behavior

- `motion.css` supplies an opt-in image-only 1 → 1.10 scale over 550ms with ease-out. Only hover/fine-pointer devices without reduced motion receive it. MuseumImage's existing button clips the image; the button dimensions, zoom control and external captions stay stationary. Static Dictionary, Timeline and Place cover/gallery images share it. Hero, changing Homepage Timeline artwork, its scroll strip, comparisons, map media and PhotoSwipe internals are excluded. The current Homepage has no additional static image preview suitable for this effect without violating those exclusions.
- Editorial CTA links share a 280ms underline reveal and 4px movement of existing arrows. Existing quiet baseline rules remain. Homepage Dictionary/Map/Timeline CTAs, Place Map links, Timeline event Map links and Map card detail links opt in. Ordinary article/source links and global navigation do not. The burgundy Homepage Timeline uses a readable light accent instead of dark burgundy against burgundy. Keyboard focus retains the existing outline.
- The shared header is sticky and retains its original flow space on inner routes; Homepage uses a fixed overlay with the approved gradient at the top. Beyond the header height, 12px of travel in a direction hides/reveals it with a 250ms transform. Direction reversals reset the travel accumulator. Open menus, focus anywhere inside the header and pointer interaction pin it; release resets accumulated travel. Scrolled Homepage headers are opaque. Root scroll padding reserves 92px/76px plus 16px, while existing section scroll margins remain. Passive scroll/resize events use one pending animation frame, updating only visibility/background flags. Route changes reveal the header. Reduced motion keeps it visible. Native listeners and scheduled frames are removed on unmount.
- Exactly four Homepage editorial sections opt into one-time opacity/14px reveals over 600ms: introduction, Dictionary, Timeline and Map. Only below-viewport content gets a pending class after client initialization. IntersectionObserver unobserves revealed sections; focused sections are also revealed. Reduced-motion changes remove pending classes and disconnect observation. SSR/no-JS content is visible. Article bodies receive no reveal behavior. No dependency, animation library or permanent `will-change` layer was added.

## Files changed in this pass

- `app/assets/css/main.css`
- `app/assets/css/tokens.css`
- `app/assets/css/motion.css` (new)
- `app/components/SiteHeader.vue`
- `app/components/MuseumImage.vue`
- `app/components/TimelineArtwork.vue`
- `app/components/HomepageTimeline.vue`
- `app/components/MapPlaceCard.vue`
- `app/pages/index.vue`
- `app/pages/places/[slug].vue`
- `app/pages/timeline/[slug].vue`
- `app/composables/useHeaderMotion.ts` (new)
- `app/composables/useHomepageReveal.ts` (new)
- `app/utils/headerScroll.ts` (new)
- `test/header-motion.test.ts` (new)
- `docs/DESIGN.md`
- `docs/ARCHITECTURE.md`
- `docs/research/motion-navigation-polish.md` (new)

Local review runners: `.playwright-mcp/motion-qa.mjs` and `.playwright-mcp/motion-interactions.mjs`; artifacts are under `.playwright-mcp/motion/`. Existing Homepage refinement content, HeroSlider changes and unrelated dirty files were not edited by this pass.

## Executed checks

- Focused header/Hero/image-delivery tests: **7/7 PASS**, including directional threshold/top/pinning, approved Hero metadata, bilingual introduction parity and original image hashes/delivery references.
- Scoped ESLint: **PASS, no warnings**. Nuxt typecheck: **PASS**. Scoped Prettier and diff whitespace checks: **PASS**.
- **8/8 RU/EN browser matrix cases PASS** at 390, 768, 1440 and 1920 CSS pixels (900px height). Each covers all three Hero pagination choices, excluded Hero image transform, header top/down/up/opaque background, focus pinning and recovery from hidden state, mobile menu/Escape/focus return where present, CTA focus and localized navigation, section visibility, no horizontal overflow, static image 1.10 zoom with unchanged trigger bounds and clipping, original-resolution PhotoSwipe with Tab containment/Escape focus return, comparison Home/End/ArrowLeft (five-point step), and Sources anchor clearance. No page errors occurred in these matrix cases. The completed matrix is recorded by eight PASS lines in `motion-browser.log`; a subsequent preference-event timing assertion was corrected and rerun separately rather than repeating the matrix.
- Special checks: **PASS** for reduced-motion touch and EN desktop, stationary header and untransformed images, disabled Hero autoplay over seven seconds, touch menu/viewer/comparison, normal Hero autoplay over 7.8 seconds, runtime reduced-motion changes and no-JavaScript content visibility. Machine-readable results: `motion/results.json`.
- Additional interaction checks: **PASS** for keyboard viewer opening, mouse zoom on the large original Borodino artwork, safe attribution links, pointer comparison dragging to 25%, CTA underline/4px arrow transform, one-time reveal without replay, native CDP Hero touch swipe, touch devices without reduced motion, and touch viewer zoom/close with focus return. Machine-readable results: `motion/interactions.json`. Smaller originals such as the Kutuzov portrait correctly have native-resolution zoom limits; the large-image zoom check waits for the existing viewer transitions to settle.
- Static image layout bounds remain unchanged during hover. Header transforms preserve its layout space; section opacity/translation changes no dimensions. No new image requests/variants or route/content changes are introduced. These are local functional/geometry checks, not a field-performance benchmark.

No full build/generation was repeated: this pass adds no routes, content schema or assets, and the server-rendered no-JavaScript Homepage was checked directly. Live Yandex provider requests were blocked in the local browser harness; no live-provider acceptance is claimed or changed.

## Review screenshots

The matrix includes Hero and focused editorial screenshots in both languages at all four requested widths. Focus outlines in editorial screenshots are intentional keyboard-test evidence. Local Nuxt developer controls can appear in matrix screenshots; they are not production UI. Additional image/viewer screenshots suppress the local developer toggle only within the QA browser.

| Width | RU Hero                                               | EN Hero                                               | RU editorial                                                    | EN editorial                                                    |
| ----- | ----------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| 390   | [Hero](../../.playwright-mcp/motion/ru-390-home.png)  | [Hero](../../.playwright-mcp/motion/en-390-home.png)  | [Editorial](../../.playwright-mcp/motion/ru-390-editorial.png)  | [Editorial](../../.playwright-mcp/motion/en-390-editorial.png)  |
| 768   | [Hero](../../.playwright-mcp/motion/ru-768-home.png)  | [Hero](../../.playwright-mcp/motion/en-768-home.png)  | [Editorial](../../.playwright-mcp/motion/ru-768-editorial.png)  | [Editorial](../../.playwright-mcp/motion/en-768-editorial.png)  |
| 1440  | [Hero](../../.playwright-mcp/motion/ru-1440-home.png) | [Hero](../../.playwright-mcp/motion/en-1440-home.png) | [Editorial](../../.playwright-mcp/motion/ru-1440-editorial.png) | [Editorial](../../.playwright-mcp/motion/en-1440-editorial.png) |
| 1920  | [Hero](../../.playwright-mcp/motion/ru-1920-home.png) | [Hero](../../.playwright-mcp/motion/en-1920-home.png) | [Editorial](../../.playwright-mcp/motion/ru-1920-editorial.png) | [Editorial](../../.playwright-mcp/motion/en-1920-editorial.png) |

[EN desktop image hover](../../.playwright-mcp/motion/en-1440-image-hover.png), [EN desktop original-resolution viewer](../../.playwright-mcp/motion/en-1440-viewer.png), [RU touch editorial image](../../.playwright-mcp/motion/ru-390-editorial-image.png).

No confirmed product regressions remain. Visual acceptance is pending; Stage 9 remains untouched.
