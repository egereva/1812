# Homepage Map — Museum Ivory APPROVED / COMPLETE

2026-10-09. Владелец завершил visual review и утвердил A — Museum Ivory. Production-реализация и focused verification завершены. Stage 9 не начат.

## Изменения

- `museumIvoryCustomization` безусловно передаётся в официальный `YMapDefaultSchemeLayer` отдельного Homepage preview. Все 14 правил и цвета точь-в-точь совпадают с принятой A.
- Historical Ivory, тип выбора A/B, необязательный palette prop, dev gate и query reader удалены. Старый `?homepageMapPalette=B` игнорируется и не меняет палитру.
- Источник серой линии — пустой `.home-rule` непосредственно в `.home-map`. Удалены этот элемент и его неиспользуемое локальное CSS-правило. Его прежние 8px padding + 1px border перенесены в padding `.home-map__layout`: положение содержимого и высота секции сохранены. Остальные section dividers не менялись.
- Homepage layout, typography, размеры карты, 13 маркеров, камера, hover, ссылки, RU/EN и атрибуция сохранены. Полная карта продолжает использовать Museum Graphite; её исходники и цвета не менялись.
- Удалены устаревшие `.playwright-mcp/homepage-map-ivory-qa.mjs` и `.playwright-mcp/homepage-map-ivory-compare.mjs`. Старые PNG/JSON/HTML оставлены исключительно как архив visual review.

## Проверки

- Живой Yandex API: обычная Homepage без dev-параметра, RU/EN × 1440×1100 / 390×844. После ready ожидались 15 секунд для завершения кастомизации. Наличие реальных заданных цветов воды/парков подтверждено пикселями PNG.
- Конфигурация, center, zoom, маркеры, размеры preview, ссылки и высота всей секции совпали с архивом принятого A. На карте 13 маркеров, категории 6/7, прежние размеры 26×31px и цвета. `.home-map > .home-rule` отсутствует.
- Desktop hover приближает на +0.3 и возвращает исходную камеру; touch/coarse не меняет zoom. Атрибуция и штатные элементы Яндекса сохранены. Console/page errors и горизонтальный overflow отсутствуют.
- Старый Homepage query `B` не влияет на Museum Ivory. `/map?homepageMapPalette=B` остаётся с dark theme и точной Museum Graphite; правила Graphite сравниваются с архивом согласования.
- **46/46 focused tests**: `homepage-map.test.mjs`, `homepage-render.test.mjs`, `map.test.ts`, `map-index-render.test.mjs`. Сохранены проверки camera/hover, reduced motion, fallback, cleanup, locale/navigation и координат. Вместо удалённых dev-gate/A/B tests проверяется безусловная передача Museum Ivory.
- Scoped ESLint, Nuxt typecheck и scoped Prettier — PASS. Полный build/generate не запускался.

[Browser evidence: camera, dimensions, customization, pixel counts](../../.playwright-mcp/homepage-map-ivory-approved/results.json).

## Финальные скриншоты

Каждый снимок включает всю секцию карты, три ссылки мест и переход к футеру.

| Локаль | 1440px                                                                       | 390px                                                                       |
| ------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| RU     | [PNG](../../.playwright-mcp/homepage-map-ivory-approved/ru-1440-section.png) | [PNG](../../.playwright-mcp/homepage-map-ivory-approved/ru-390-section.png) |
| EN     | [PNG](../../.playwright-mcp/homepage-map-ivory-approved/en-1440-section.png) | [PNG](../../.playwright-mcp/homepage-map-ivory-approved/en-390-section.png) |

[Полная карта Museum Graphite](../../.playwright-mcp/homepage-map-ivory-approved/ru-1440-graphite-preserved.png).

При экспорте отдельной секции скрыта только внешняя шапка/skip link, чтобы fixed/sticky chrome не наложился на full-page clip; её layout space сохраняется. Исключена панель Nuxt DevTools. Provider DOM, атрибуция и controls не скрывались.

## Изменённые файлы

- `app/data/homepageMapPalettes.ts`
- `app/components/HomepageMapCanvas.client.vue`
- `app/components/HomepageMapPreview.vue`
- `app/pages/index.vue` — только локальная линия/компенсация spacing
- `test/homepage-map.test.mjs`
- `docs/DESIGN.md`, `docs/ARCHITECTURE.md`
- `docs/research/homepage-map-ivory-palettes.md` — статус архивного review
- Этот отчёт, `.playwright-mcp/homepage-map-ivory-approved-qa.mjs` и screenshot/evidence artifacts; два прежних exploration scripts удалены.

Нерешённых проблем в проверенных состояниях не обнаружено. Проверка выполнена в Chromium с mobile/touch emulation; физический телефон не использовался. **APPROVED / COMPLETE**.
