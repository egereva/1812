# Mobile navigation — awaiting visual review

Only mobile navigation (≤900px) is redesigned. Desktop navigation, directional header logic, historical content and media remain unchanged. Stage 9 has not started.

## Implementation

- Full-viewport graphite panel below the shared header, with footer-palette ivory text, muted burgundy active states, six localized editorial route links and fine separators.
- Separate language controls and existing secondary footer text; no new historical or project claims.
- Icon-only 44px toggle, two lines morphing into an X over 280ms, localized accessible names and correct expanded/control attributes. Panel reveal also takes 280ms; global reduced-motion rules disable both transitions.
- First-link focus on opening, modal focus boundary including the shared header, inert background, Escape focus return and close on navigation. Same-route wordmark and navigation links also close the menu.
- Root overflow lock and body clipping preserve the sticky header's viewport position. Previous overflow and inert values are restored on close/unmount. Crossing the desktop breakpoint closes the panel and restores scrolling.
- Independently scrollable panel, dynamic viewport height and safe-area padding; no desktop layout changes or new dependencies.

## Files changed in this pass

- `app/components/SiteHeader.vue`
- `app/assets/css/main.css` — mobile menu rules; existing desktop rules retained.
- `i18n/locales/ru.json` and `i18n/locales/en.json` — accessible open/close labels only.
- `docs/DESIGN.md` and `docs/ARCHITECTURE.md` — changed mobile navigation contract.
- This report.

Local QA artifacts, not deployment files: `.playwright-mcp/mobile-navigation-qa.mjs`, `.playwright-mcp/mobile-navigation-routes.mjs`, screenshots/results under `.playwright-mcp/mobile-navigation/`, and local browser/server/typecheck logs.

## Focused acceptance evidence

Executed in local Chromium:

- RU/EN at 320, 390 and 768px: icon dimensions/morph, six localized links, active route, viewport coverage, no menu overflow, initial focus, forward/reverse focus wrapping, visible keyboard focus, Escape focus return, wheel background lock, navigation closing and same-route language switching — PASS (6 viewport/locale cases).
- RU/EN at 320 × 400px with touch emulation: actual touch gestures scroll the panel without moving the background; lower language controls remain reachable; toggle taps and reduced-motion transitions pass (2 cases).
- RU/EN inner pages after scrolling: header hides/reveals correctly; opening keeps header at the viewport top; resizing to 1440px closes/unlocks the panel. Desktop retains five routes, 92px inner height and 14.88px navigation typography (2 cases).
- All six destinations actually navigated in both languages, plus Homepage language switching using the existing full-document navigation and same-route wordmark closing — PASS (16 additional checks).
- Visually inspected RU/EN closed/open Homepage screenshots at 390px. The Hero retains its existing artwork, typography, overlay and controls beneath the closed header.
- Existing header-motion unit tests: 2/2 PASS. Scoped SiteHeader ESLint, typecheck, scoped formatting and whitespace checks: PASS. No full build/generation was repeated.

The initial browser run found a sticky-header displacement when body overflow was hidden. Body clipping corrected it; the final viewport/touch/scroll/desktop matrix passed afterward.

Screenshots: `.playwright-mcp/mobile-navigation/{ru,en}-390-{closed,open}.png`. Structured evidence: `results.json` and `routes.json` in the same directory. Provider requests were blocked in this UI-only local test; it does not constitute new live Yandex acceptance. Touch testing used Chromium emulation, not physical iOS/Android devices.

No confirmed unresolved implementation regressions. Visual acceptance is pending. No staging, commit or push was performed.
