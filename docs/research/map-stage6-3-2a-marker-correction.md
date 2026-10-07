# Stage 6.3.2A ? marker correction

Status: **AWAITING VISUAL REVIEW**. This pass implements marker presentation only.

Approved asset: `public/icons/1812-map-marker-filled.svg`, used inline without changing the supplied file or geometry. Removed status?shape mapping, six CSS geometries, approximate dotted halo, selected ring, and the former group glyph. Historical statuses, precision, coordinates and 6/7 layer assignment remain intact. No old marker legend was present in the current UI; final legend remains deferred.

Normal visible body width: 32 px (SVG viewBox width 40.96 px, because the body occupies 50/64 units). Hover/focus: 36 px and higher stacking order. Selected: 42 px, highest stacking order, layer-colored medallion and ivory symbol/base, inverse cross. Graphite `#1c1b19` / burgundy `#702837`, with supplied ivory `#f4efe4`. Hit target: 56?64 CSS px. Keyboard focus uses a restrained rectangular outline. Size/fill transitions: 180 ms; reduced motion disables visible animation. The tip remains anchored during scaling.

Deterministic grouping and fan-out offsets are unchanged. Collapsed group uses its representative's same SVG; expanded members retain their own layer color and individual selection. Abort interaction listeners before detaching marker entities so a keyboard blur cannot trigger a Yandex z-index update during removal.

## Verification

- Focused map tests 4/4; full suite 24/24 (including original Stage 6.3.2A layer, link, parity and grouping checks).
- Typecheck, lint, changed-file formatting and static generation PASS; 277 routes. Generated Homepage regression 2/2 and Timeline detail regression 40/40 PASS. RU/EN generated map HTML each retains 13 distinct Place links; generated SVG bytes match the supplied asset.
- Real Yandex map on `http://localhost:3012`: RU 1440?1000 and 390?844; All, both selected layers, Fili fan-out. EN selected Kutuzov Hut deep link also resolves.
- Keyboard Enter selects Place and moves focus to card H2; visible marker focus outline, hover enlargement, reduced motion and mobile page overflow checked. No page exceptions in the final interaction check.
- `127.0.0.1` API request was blocked by ORB; `localhost` successfully loads the supplied key. No integration/configuration change was needed.

## Screenshots

- [1440 All](../../.playwright-mcp/marker-632a-1440-all.png)
- [1440 selected 1812](../../.playwright-mcp/marker-632a-1440-selected-1812.png)
- [1440 selected Memory](../../.playwright-mcp/marker-632a-1440-selected-memory.png)
- [1440 Fili expanded](../../.playwright-mcp/marker-632a-1440-fili.png)
- [390 All](../../.playwright-mcp/marker-632a-390-all.png)
- [390 selected Memory](../../.playwright-mcp/marker-632a-390-selected-memory.png)
- [390 Fili expanded](../../.playwright-mcp/marker-632a-390-fili.png)

## Visual review observations

One silhouette is quieter; normal memorial symbol remains legible, and selected inversion/42 px width is distinct without external rings. Expanded graphite and burgundy members are distinguishable. Existing overview grouping hides the seven Memory markers under a graphite representative until expansion; group algorithm was preserved as requested. On 390, the existing chooser partly overlaps the selected marker's upper edge. These are remaining visual review concerns; chooser/card layout and grouping/camera rules were not redesigned in this pass.

The overview mixed-layer hiding concern above is resolved by the subsequent [mixed-layer correction](map-stage6-3-2a-mixed-layer-correction.md). Marker visual treatment remains unchanged.
