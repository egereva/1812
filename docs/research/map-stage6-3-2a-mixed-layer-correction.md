# Stage 6.3.2A ? mixed-layer overlap correction

**AWAITING VISUAL REVIEW**.

## Root cause and minimal correction

`groupOverlappingPlaces` detects screen-space overlaps across both editorial layers. The old collapsed rendering branch in `drawMarkers` rendered only `group.find(selectedSlug) ?? group[0]`. With no selection, production ordering chose graphite representatives for the mixed groups; all seven Memory Places could be hidden behind the single graphite representative at the initial overview. Selection could reverse which layer was hidden. Detection itself was not defective.

The new `collapsedGroupRepresentatives` chooses one representative per present layer, prioritizing the selected Place within its own layer. Stable layer order: 1812, Memory. Mixed representatives use the same original group anchor coordinate with screen offsets ?28/+28 px (56 px apart, preserving separate approved hit targets). Single-layer groups keep one representative and zero displacement. Both controls expand the same existing group; their accessible names identify the layer. The overlap threshold, geographic coordinates, fan-out radius/order, camera rules, marker SVG/CSS, cards and URL behavior remain unchanged.

## Verification

- Focused map tests **6/6 PASS**: original four Stage 6.3.2A tests plus repeated-zoom layer representation/coordinate immutability in RU and EN, and selected representatives of either layer in a production Fili group.
- Typecheck, ESLint and Prettier for the three changed code/test files PASS; `git diff --check` PASS. No full build/generate was needed for this targeted behavior correction.
- Real Yandex RU map, 1440?1000, `http://localhost:3012/map`: All retains both DOM and unobscured on-screen graphite/burgundy markers throughout 11?18?11 centered on Fili. Representative titles, classes and offsets match on each repeated zoom. No page exceptions during this sequence.
- At zoom 11/12/13/14/15/16/17/18, collapsed All has respectively 1/1/1/2/2/3/4/6 burgundy representatives; none disappears because of graphite overlaps. Viewport clipping at high zoom is independent of grouping.
- Layer switches: 1812 has zero burgundy markers; Memory has zero graphite markers; All restores both. Counts depend on collapsed grouping, without changing 6/7 content assignment.
- Both graphite and burgundy Fili representatives expand the mixed group. Keyboard Enter transfers focus into the chooser. Selecting Kutuzov Hut and Fili Village after fan-out resolves the correct `?place=` and selected layer; selected visible body remains 42 px. Normal 32 px, hover/focus 36 px and existing inversion are unchanged.

## Screenshots

- [All before zoom, overview](../../.playwright-mcp/mixed-632a-1440-all-before-zoom.png)
- [All after zoom, zoom 15](../../.playwright-mcp/mixed-632a-1440-all-after-zoom.png)
- [Dense Fili, All, zoom 16](../../.playwright-mcp/mixed-632a-1440-fili-all.png)
- [Mixed-layer fan-out, zoom 16](../../.playwright-mcp/mixed-632a-1440-fan-out.png)

No remaining mixed-layer disappearance was observed. The earlier mobile chooser overlap concern is outside this behavior-only pass.
