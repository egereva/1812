# Global external-link correction

Global corrective pass complete. No historical/visual stage status changed; Stage 6.3 work was not advanced. Existing Stage 6.3.2B work is retained without further implementation.

## Permanent rule and implementation

The permanent navigation rule is documented once in `AGENTS.md`, under Accessibility. `app/utils/linkAttributes.ts` resolves URLs against the request/browser URL and compares normalized origins for HTTP(S) destinations. It covers protocol-relative URLs, default ports and hostname normalization; absolute same-origin URLs, project paths and fragments remain same-tab. Mail links are not classified as external websites.

`WebsiteLink.vue` applies the shared helper to native content/source anchors while preserving labels, slots, CSS classes and tabindex. Existing internal NuxtLink route navigation is unchanged. Application-created image-viewer attribution anchors use the same helper. No dependencies, historical URLs/JSON, page design or stage status were changed. No external icon or visible new-tab text was added.

## Audited application call sites

Eight external-capable render sites were audited:

| File | Link type | Before correction |
| --- | --- | --- |
| `app/components/HeroSlider.vue` | Hero image source | Already compliant; moved to shared component |
| `app/components/HomepageTimeline.vue` | Mobile strip image attribution | Missing new-tab attributes; fixed |
| `app/components/TimelineArtwork.vue` | Shared Timeline artwork attribution | Missing new-tab attributes; fixed |
| `app/components/MapPlaceCard.vue` | Place cover image attribution | Missing new-tab attributes; fixed |
| `app/pages/dictionary/[slug].vue` | Image attribution | Missing new-tab attributes; fixed |
| `app/pages/dictionary/[slug].vue` | Historical sources | Missing new-tab attributes; fixed |
| `app/pages/timeline/[slug].vue` | Historical sources | Missing new-tab attributes; fixed |
| `app/composables/useMuseumImageViewer.ts` | Dynamically created attribution | Missing new-tab attributes; fixed |

Thus seven violations were fixed; the compliant Hero call site was consolidated. All 26 internal NuxtLink template call sites and two native fragment-anchor sites were reviewed. Header/footer, language switching, related content, Timeline-to-Map and Place-to-Map retain same-tab navigation. Sources/About currently use SectionPreview and have no external sources; current Place detail shows its title, lead and internal map action without rendered sources/media. These pages were audited as implemented, without adding content/layout.

Search included all Vue/TypeScript application files for anchors, NuxtLink, hrefs, URL rendering, window.open and DOM creation. No application-owned outbound Yandex control was found. The two external controls produced by the Yandex map API in the browser are owned by the provider and were excluded from correction; no third-party DOM was modified.

## Files changed in this pass

- New: `app/components/WebsiteLink.vue`, `app/utils/linkAttributes.ts`, `test/links.test.ts`, `test/links-render.test.mjs` and this audit.
- Updated: the seven existing application files in the call-site table, `AGENTS.md`, and `package.json` (unit-test coverage and post-generate `test:links-render` script).

## Verification

Focused classification tests **2/2 PASS** protect safe external attributes and same-origin/internal behavior. Full suite **30/30 PASS**; typecheck, full ESLint, Prettier and static generate PASS (**277 generated routes**). Post-generate external-link audit **1/1 PASS** inspected all **138 HTML files**: **246 external anchors** (123 per locale) have the required attributes, and **2668 internal anchors** remain same-tab. Homepage render regression **2/2** and Timeline detail regression **40/40 PASS**.

Browser audit used the built static output at localhost:3013, including real Yandex markers. All required RU pages were visited: Homepage, Dictionary index/detail Fili, Timeline index/detail council-fili, Map with Kutuzov Hut card, Place detail Kutuzov Hut, Sources and About. EN Dictionary detail, Timeline detail, Place detail and Sources were also visited. All application-controlled rendered anchors were classified by actual origin with zero violations; Yandex-owned controls were excluded.

Click activation created new tabs while preserving the original page for Hero source, RU/EN historical sources, Dictionary and Timeline attribution, Map Place-card attribution, mobile Homepage strip attribution, and dynamically generated image-viewer attribution. Representative internal Dictionary/Timeline/Place links, related Place navigation, event map CTA, Place map CTA and RU-to-EN language switching remained in the original tab with no _blank target. Source titles and attribution labels remained meaningful and unchanged.

No unresolved application link violations were found. Sources/About and Place detail do not yet render the assumed source/image sections; this correction does not implement those unrelated features. Provider-controlled Yandex outbound navigation remains outside application control.
