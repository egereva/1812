# Stage 6.3.2A - final UI polish and acceptance

Status: **COMPLETE**. No later Stage 6.3 substage started.

Only `app/pages/map.vue` changed in this pass. Layer tab counts now share the label baseline, with an explicit 8 px gap, 12.8 px regular-weight text and tabular figures. They remain secondary without badges or new colors. Buttons remain 44 px high; the active underline is unchanged.

Removed the visible current-layer paragraph and its obsolete CSS. Its information duplicates the selected button. Existing aria-pressed and the nonvisual polite live announcement still expose state; keyboard Enter switches layers with visible focus. Desktop total count remains visible. Existing mobile hiding of the total count is preserved; no header spacing or global layout redesign was needed.

## Verification

- Focused Stage 6.3.2A map tests: **6/6 PASS**.
- ESLint and Prettier on `app/pages/map.vue`: PASS; diff whitespace check PASS.
- Real Yandex RU map: 1440 All, 1440 Memory, 390 All inspected.
- At 390, all three buttons measure approximately 114.4 by 44 px; counts have an 8 px gap and do not collide. No horizontal overflow.
- Keyboard Memory selection sets `aria-pressed`, updates `?layer=memory`, retains visible focus, shows no graphite markers and announces the layer in the hidden live region. No page exceptions during the final browser checks.
- Marker asset, marker styles, mixed-layer representatives, fan-out, coordinates, API, camera, Place cards and production content were not edited in this pass.

## Screenshots

- [RU 1440 All](../../.playwright-mcp/final-632a-ru-1440-all.png)
- [RU 1440 Memory](../../.playwright-mcp/final-632a-ru-1440-memory.png)
- [RU 390 All](../../.playwright-mcp/final-632a-ru-390-all.png)

The control/header area is clean at the requested widths. The previously recorded mobile chooser overlap is not a control-polish change and remains outside this pass.
