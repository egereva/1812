# Stage 6.3.2B - Timeline to Map event context

Status: **AWAITING VISUAL REVIEW**. Stage 6.3.2A remains COMPLETE; later Stage 6 work is not started.

## Changes and decisions

Stage implementation files: `app/pages/timeline/[slug].vue`, `app/pages/map.vue`, new `app/data/mapContext.ts`, `shared/content/index.ts`, `i18n/locales/{ru,en}.json`, `test/map.test.ts`, `test/timeline-detail-render.test.mjs`, and the architecture/roadmap documentation. The resumed verification pass after the global link correction changes only `test/timeline-detail-render.test.mjs`, this audit and the roadmap. Existing event implementation was retained.

The content facade's `resolveTimelinePlaceContext` resolves existing Timeline slugs and their direct/reverse `resolveRelatedContent(...).places` union. Production relations and all historical JSON remain unchanged. The CTA is conditional on a nonempty related-Places group and targets `/map?event=...` or `/en/map?event=...`; no arbitrary Place is selected.

Only the related subset is passed to the existing map component, triggering its existing fit behavior. Unrelated markers are hidden. The compact contextual row contains the localized event title, count and native All places exit link. Normal layer tabs are suppressed; a manual `layer` query is ignored during event scope. Approved marker colors, sizes, SVG, selection treatment, mixed-layer controls and fan-out remain unchanged.

Event selection is intentionally local: the Place card opens without replacing or combining the event URL with a Place URL. Closing preserves context; exiting clears event state and returns the normal All map. Valid `place` wins over simultaneous `event`. Malformed, repeated, unknown and relation-empty event values gracefully read as the normal map. Back/Forward restores the scope with no initial Place selection; camera state is never encoded in the URL.

## Verification

- Focused map tests **8/8 PASS**: localized URLs, all related multi-Place sets, unrelated exclusion, no arbitrary selection, precedence, malformed/empty scope and RU/EN parity, alongside all Stage 6.3.2A regressions.
- Full tests **30/30 PASS**; generated Timeline detail regression **40/40 PASS**, checking conditional event CTA hrefs for every event and locale, with explicit current-tab targets and exclusive event query assertions. Generated global link audit also PASS (138 HTML files); global link implementation was not changed.
- Typecheck, lint and full format check rerun and PASS. Existing final static generate PASS, **277 routes**; its output was reused because only tests/documentation changed during resumed verification. The initial implementation generate exposed a runtime relative shared-content import issue; moving content resolution into the existing facade removed it.
- Real Yandex RU at 1440x1000 and 390x844: Timeline CTA, council-fili initial state, mixed fan-out and selected Kutuzov Hut checked. Entry has no card, four related index links, no layer tabs and both normal editorial colors. Current grouping may show fewer than four marker buttons until fan-out; all four remain selectable.
- Keyboard CTA activation, group chooser, Place selection (focus to card H2) and context exit (focus to All tab) work. Back returns to the four-Place event scope with a closed card; Forward restores normal 13-Place scope. No page exceptions during final capture sequence; existing Nuxt timer warnings persist.
- `?event=council-fili&place=kuntsevo-estate` shows the selected Place and no event UI. Unknown/repeated event values return normal scope without a 404. `?event=council-fili&layer=memory` still scopes all four event Places and retains graphite/burgundy.
- EN council-fili CTA is `/en/map?event=council-fili`; localized title is Military Council at Fili; card initially closed, related index 4.
- API failure: context indication and related index 4 remain, full fallback navigation 13 remains available. Dev/SSR with JavaScript disabled: context/index render and native exit link returns to normal index 13. Timeline page has no Yandex script.
- Generated static output served on localhost:3013: event query hydrates to context/index 4 with a closed card and real Yandex markers; no page errors or hydration warnings. Existing Nuxt timer warnings remain.
- No mobile page overflow observed. Reduced-motion handling remains in the unchanged marker/global CSS and existing immediate camera behavior.
- All seven screenshots refreshed after the global link correction. Real keyboard CTA navigation stays in the same tab; selected Hut marker has `is-selected` and `aria-pressed="true"`. Card close preserves event scope and returns focus to the existing marker/group; exit focuses All. Reduced-motion browser emulation confirms the glyph transition reduces to 0.00001s.

## Screenshots

| Width | State | Screenshot |
| --- | --- | --- |
| 1440 RU | Timeline detail CTA | [CTA](../../.playwright-mcp/event-632b-1440-timeline-cta.png) |
| 1440 RU | council-fili initial | [Initial map](../../.playwright-mcp/event-632b-1440-council-fili-initial.png) |
| 1440 RU | Mixed fan-out | [Fan-out](../../.playwright-mcp/event-632b-1440-fan-out.png) |
| 1440 RU | Selected related Place | [Selected](../../.playwright-mcp/event-632b-1440-selected.png) |
| 390 RU | Timeline detail CTA | [CTA](../../.playwright-mcp/event-632b-390-timeline-cta.png) |
| 390 RU | council-fili initial | [Initial map](../../.playwright-mcp/event-632b-390-council-fili-initial.png) |
| 390 RU | Selected related Place | [Selected](../../.playwright-mcp/event-632b-390-selected.png) |

Layer-filter screenshot is not applicable because tabs are suppressed in event context; a fan-out interaction screenshot is included instead.

## Observations and remaining limitations

The event indication is subordinate to the main map heading at both requested widths; the map initially communicates the related subset without a Place card. No visual self-approval is implied: screenshots await user review. Existing mobile chooser/card overlay behavior remains and consumes map area after selection; those components were not redesigned. Event selections are not URL-persistent by design. On static hosting without JavaScript, query context cannot be applied to generic prerendered HTML; all 13 Place links still provide useful navigation. With JavaScript available but Yandex unavailable, event context remains fully understandable.

Resumed static preview checks also observed Nuxt `NUXT_E7001`/`NUXT_E7003` console diagnostics for payload prefetch of an absolute language-switch URL on localhost:3013. Installed Nuxt code rejects a hostname in payload URLs; its prefetch hook reports the failed preload. This concerns the existing global language switch, which this stage does not change. Event CTA, map rendering and semantic navigation remained usable; existing Nuxt timer warnings also remain.
