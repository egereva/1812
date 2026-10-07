# Homepage real static map — implementation

**Homepage real static map — AWAITING VISUAL REVIEW.** Post-Stage-6.3 refinement, implementing approved recommendation A. Stage 6.3 remains COMPLETE. Stage 7 is not started.

## Implementation

The localized `getPlaces(locale)` catalog supplies every coordinate, ID, title and status. No historical JSON, relation, coordinate or dependency changed. The pure `app/data/homepageMapPresentation.ts` helper reuses the full Map's `statusLayer`: 13 symbols, 12 unique coordinate pairs, 6 graphite/1812 and 7 burgundy/Memory.

Projection is spherical local equirectangular, with R=6,371,008.8m and radians:

```text
latitude0 = (south + north) / 2
longitude0 = (west + east) / 2
east = R × (longitude − longitude0) × cos(latitude0)
north = R × (latitude − latitude0)
scale = min(560 / projectedWidth, 240 / projectedHeight)
anchorX = 320 + scale × east
anchorY = 160 − scale × north
```

The 640×320 scene has 40-unit fit margins and a single uniform scale. Bounds derive from the catalog: latitude 55.7317–55.75083; longitude 37.46139–37.5547. North-up geographic anchors and the overall east/west distribution are preserved.

Connected collisions below 7×640/288 = 15.556 viewBox units identify the seven dense Fili points. Stable-ID ordering places them on a 20-unit-radius static fan around their projected centroid. Each record keeps its actual anchor separately; only SVG display x/y are offset. Both Kutuzov Hut and the Fili milepost remain distinct symbols despite identical coordinates. Short dashed guides run from each point's own real anchor to its display position, with the visible RU/EN explanation “В плотной группе точки разнесены для читаемости.” / “Points in the dense group are separated for legibility.” There are no connections between Places, tooltips, counters or interactive geometry.

Removed abstract contours/divisions, decorative “13” and “Например / For example”. Only two quiet horizontal frame rules remain, with a 12px CSS north indication. Exact scale annotation is omitted under the approved implementation request.

The three localized serif links retain their editorial character, subtle underlines, hover/focus treatment and minimum 44px targets:

| ID                       | RU route                         | EN route                            |
| ------------------------ | -------------------------------- | ----------------------------------- |
| fili-village             | /places/fili-village             | /en/places/fili-village             |
| kutuzov-hut              | /places/kutuzov-hut              | /en/places/kutuzov-hut              |
| intercession-church-fili | /places/intercession-church-fili | /en/places/intercession-church-fili |

NuxtLink and the existing localized routing helper keep all detail navigation in the same tab. The stronger Map CTA keeps its wording and localized /map or /en/map destination, with →.

The SVG is one supplementary image, labelled by its localized title and described by the visible separation caption. Its geometry group is aria-hidden, unfocusable and noninteractive. Counts are derived for both summaries:

- RU: “Схема расположения 13 памятных мест: 6 связаны с событиями 1812 года, 7 — с памятью о войне.”
- EN: “Location diagram of 13 places: 6 associated with 1812 and 7 with the memory of the war.”

## Layout and cost

Desktop retains 3:2 graphic-left/copy-right composition. Mobile/tablet retain text-first order and 32px CTA-to-diagram separation. A fluid 2:1 SVG replaces fixed 20rem/12rem/10rem decorative fields. Actual field heights are 367.2px at 1440, 353.3px at 768, 179px at 390 and 144px at 320.

Section height follows its contents; no fixed graphic height or section min-height is imposed. Inspection found no pre-existing oversized Map section min-height to remove. Bottom padding is explicitly 48px, reduced from 96px desktop/tablet and 64px mobile. Browser measurements confirm exactly 48px from list bottom to Footer at every required viewport, retaining generous spacing without an empty field.

Measured rendered SVG is 3,953 bytes RU / 3,882 bytes EN, uncompressed. All 13 symbols and links are in generated HTML. Projection is a small pure computed calculation on the already loaded catalog; no mapping library, lifecycle initialization, resize listener, remote data, tiles, new assets or dependency. Browser checks observed **zero external requests**, including zero Yandex requests, through initial load, scroll and link hover/focus.

## Verification

- Focused projection/immutability/determinism/duplicate/fit/separation/count test passed; focused Map suite 9/9.
- Standard tests 31/31; generated Homepage tests 4/4, including unchanged Timeline artwork assertions.
- Typecheck PASS. Initial concurrent generation/typecheck contended for Nuxt's shared generated config directory; sequential rerun PASS.
- File-scoped ESLint and Prettier PASS for production Vue/helper, tests and localized JSON.
- Static generate PASS: 277 routes. Repeated once after the final requested bottom-spacing adjustment.
- RU 1440/768/390/320 and EN 1440: 13 symbols, 6/7 colors, all four links, 44px targets, keyboard focus, no overflow, no geometry tab stops, no page exceptions, zero external requests.
- Generated/no-JS RU and EN: all three Place detail links and Map CTA navigate correctly in the same tab.
- Historical content diff is empty. Interactive Map, Hero, Dictionary and Timeline implementation are unchanged by this refinement.

## Screenshots and comparison

Final section screenshots:

- [RU 1440](../../.playwright-mcp/homepage-real-static-map/ru-1440-section.png)
- [RU 768](../../.playwright-mcp/homepage-real-static-map/ru-768-section.png)
- [RU 390](../../.playwright-mcp/homepage-real-static-map/ru-390-section.png)
- [RU 320](../../.playwright-mcp/homepage-real-static-map/ru-320-section.png)
- [EN 1440](../../.playwright-mcp/homepage-real-static-map/en-1440-section.png)

Full-page counterparts (`{locale}-{width}-page.png`) in the same directory show the unchanged Timeline and the corrected Map → Footer rhythm. [Browser measurements and network evidence](../../.playwright-mcp/homepage-real-static-map/checks.json), [repeatable browser verification](../../.playwright-mcp/homepage-real-map-verify.mjs).

Compared with the [old abstract desktop preview](../../.playwright-mcp/stage-6-3-4-final/ru-1440-map-preview.png), the true geographic distribution now explains the western outlier and compact Fili concentration. The serif links, quiet field and established palette preserve the museum aesthetic, while removing invented geography and redundant decoration.

Visual concern for user review: at 320px the points are intentionally small (about 5px diameter) and the dense group's guides are subtle. All 13 remain geometrically separated; the diagram is a collection overview rather than a recognizable Moscow street map. The taller tablet field is the approved fluid 2:1 treatment. Visual acceptance remains with the user.

## Files

Production: `app/pages/index.vue`, new `app/data/homepageMapPresentation.ts`, `i18n/locales/ru.json`, `i18n/locales/en.json`.

Tests: `test/map.test.ts`, `test/homepage-render.test.mjs`.

Documentation: targeted `docs/DESIGN.md`, `docs/ARCHITECTURE.md` and `docs/ROADMAP.md` contract/status notes, plus this record. Existing completed-stage history is retained.

Evidence: browser verification script, screenshots, check JSON and local quality-gate logs under `.playwright-mcp/`. The one-time `implement-homepage-real-map.mjs` script is an audit artifact, not production code.
