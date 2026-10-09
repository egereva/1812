# Direction-aware header fix — awaiting review

## Root cause and reproduction

Two independent interaction guards prevented hiding:

1. `useHeaderMotion` treated ordinary pointer presence anywhere inside the header as an indefinite pin. A stationary pointer above the navigation kept the header visible during wheel scrolling.
2. The composable treated any focused descendant as keyboard interaction, while CSS `:focus-within` independently overrode the hiding transform. Clicking/tapping the redesigned mobile toggle to close the menu left ordinary pointer focus on that button, so the header stayed pinned after closing.

Before correction, actual wheel scrolling to 600px left the desktop header at top/bottom 0/93px and the mobile header at 0/77px. The mobile toggle was focused but did **not** match `:focus-visible`. Both inline overflow values had already been restored, confirming that the current menu scroll lock was not the cause.

## Correction

- Pin only for an open menu, visible keyboard focus or an active pointer press on a header navigation control. Hover no longer pins.
- Align the CSS focus override with the composable using `:focus-visible`.
- Release a pointer press on document pointer-up/cancellation, window blur or route change. Remove the native listeners and pending animation frame on unmount; unrelated pointer releases schedule no work.
- Retain the existing 12px direction threshold, top boundary, frame-coalesced passive scroll handling, header geometry and route reset.
- Reduced motion preserves directional hiding/revealing with the existing effectively instantaneous CSS transitions, instead of permanently pinning the header.
- No changes to mobile menu design, toggle animation, Hero content/gradient, desktop navigation, historical content or media.

## Files changed

- `app/composables/useHeaderMotion.ts`
- `app/components/SiteHeader.vue`
- `app/assets/css/main.css`
- `docs/DESIGN.md`
- `docs/ARCHITECTURE.md`
- This report.

Local QA only: `.playwright-mcp/header-fix-before.mjs`, `.playwright-mcp/header-fix-qa.mjs`, screenshots and structured evidence under `.playwright-mcp/header-fix/`, plus local server/browser/typecheck logs.

## Executed verification

All six RU/EN × 390/1440/1920px configurations passed on both Homepage and About (12 page cases), plus reduced-motion and route-navigation checks in each configuration (6 additional cases).

Actual Chromium wheel input and CDP touch gestures at 390px verified viewport bounds, not just classes:

- Downward scrolling moves the header completely above the viewport: bottom edge 0px; hit testing at the viewport top reaches page content.
- Upward scrolling restores the header to top 0px with an opaque background over scrolled content.
- Returning to page top restores visibility and the Homepage transparent gradient.
- Stationary desktop hover over both logo/header space and navigation does not pin. A pressed navigation link pins only until release; subsequent scrolling hides normally.
- Mobile menu remains visible while open; closing by tap restores background scrolling and direction-aware behavior. The two-line/X morph remains intact.
- Real Tab input reveals an offscreen header with visible focus; scrolling while keyboard focus remains inside preserves accessibility. Escape returns keyboard focus to the mobile toggle and pins appropriately until focus leaves.
- Hero retains three pagination controls; selecting another artwork and returning to the first works. Dictionary route navigation works and subsequent downward scrolling hides the shared header.
- Reduced motion disables visible transition animation while preserving direction-aware behavior.

Focused gates: existing header threshold tests **2/2 PASS**; scoped ESLint **PASS**; typecheck **PASS**; scoped formatting and whitespace checks **PASS**. No full test suite, build or static generation was repeated.

Evidence: `before.json`, `after.json` and `{ru,en}-{390,1440,1920}-{home,about}-hidden.png` under `.playwright-mcp/header-fix/`. Touch checks use Chromium emulation, not physical mobile devices. Yandex provider requests were blocked in this UI-only test; no new live-provider acceptance is claimed.

No confirmed unresolved regressions. Awaiting review. Stage 9 was not started; nothing was staged, committed or pushed.
