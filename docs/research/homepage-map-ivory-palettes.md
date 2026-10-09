# Homepage Map — Museum Ivory palette exploration (archive)

2026-10-09. **A — Museum Ivory APPROVED after owner visual review.** Ниже сохранён исходный exploration report и сравнительные снимки. В production B и dev-switching удалены; [финальная реализация и проверка](homepage-map-ivory-approval.md) — **APPROVED / COMPLETE**. Упомянутые ниже exploration scripts удалены как неиспользуемые; JSON/PNG/HTML сохранены только как архив согласования. Stage 9 не начат.

## Варианты и рекомендация

**A — Museum Ivory:** светлый нейтральный камень/ivory, спокойные графитово-серые дороги, серо-оливковые парки, десатурированная серо-голубая вода и серые подписи. Мягче соединяется с фоном главной `#f3f0e8`; бордовые маркеры остаются основным цветовым акцентом.

**B — Historical Ivory:** более тёплая бежевая основа, taupe-дороги, sage/olive-парки, холодная серо-голубая вода и тёплые тёмно-серые подписи. Историческое настроение заметнее, но без текстуры, имитации бумаги или декоративных эффектов.

Рекомендация для visual review: **A**. Она ближе к нейтральной музейной эстетике интерфейса и меньше напоминает стилизацию под старую карту. B остаётся полноценной альтернативой для выбора владельцем. География читается в обоих вариантах; цветовые различия лучше оценивать по всей секции, а не отдельному crop.

## Изоляция и локальное сравнение

`app/data/homepageMapPalettes.ts` содержит две таблицы цветов и общие 14 правил. Использован существующий тип `MapCustomizationRule`; утверждённый `app/data/mapPalettes.ts` не изменён.

В `HomepageMapPreview.vue` query читается только при `import.meta.dev`; необязательный локальный prop передаётся в `HomepageMapCanvas.client.vue`. Только его `YMapDefaultSchemeLayer` получает customization. Обычная Homepage, неизвестное значение и production сохраняют прежнюю штатную светлую схему. Нет публичного переключателя; для изменения варианта требуется полная загрузка dev-ссылки:

- [RU A](http://localhost:3042/?homepageMapPalette=A) / [RU B](http://localhost:3042/?homepageMapPalette=B).
- [EN A](http://localhost:3042/en/?homepageMapPalette=A) / [EN B](http://localhost:3042/en/?homepageMapPalette=B).

YMap theme/mode, bounds, margins `[40,32,48,32]`, smooth zoom, hover `+0.3 / 400ms`, маркеры, размеры и spacing не менялись. CSS-фильтров, оверлеев, новых зависимостей и вмешательства в DOM Яндекса нет.

## Точные правила customization

Проверено по [официальной схеме правил и тегов Яндекса](https://yandex.com/maps-api/docs/js-api/map/customization.html). Stylers применяются в указанном порядке. Отсутствующие tags/elements означают все объекты/элементы. В каждой palette порядок и фильтры одинаковы; отличаются только цвета.

| №   | Tags `any`                        | Elements             | Styler A                                | Styler B         |
| --- | --------------------------------- | -------------------- | --------------------------------------- | ---------------- |
| 1   | —                                 | —                    | `saturation: -1`                        | `saturation: -1` |
| 2   | —                                 | `geometry.fill`      | `color: #eeece5`                        | `color: #efe6d7` |
| 3   | —                                 | `geometry.outline`   | `color: #c5c3ba`                        | `color: #c7bba8` |
| 4   | `urban_area`                      | `geometry.fill`      | `color: #e3e0d7`                        | `color: #e6dac9` |
| 5   | `structure`                       | `geometry.fill`      | `color: #d8d5ce`                        | `color: #dbcdb9` |
| 6   | `park, vegetation, national_park` | `geometry.fill`      | `color: #d0d6c7`                        | `color: #ccd0bc` |
| 7   | `water`                           | `geometry`           | `color: #bbc9cc`                        | `color: #b7c5c8` |
| 8   | `road`                            | `geometry.fill`      | `color: #9a9c98`                        | `color: #a59b8d` |
| 9   | `road_minor, road_limited, path`  | `geometry.fill`      | `color: #b8bab3`                        | `color: #c0b5a4` |
| 10  | —                                 | `label.text.fill`    | `color: #595d58`                        | `color: #62594e` |
| 11  | —                                 | `label.text.outline` | `color: #eeece5`                        | `color: #efe6d7` |
| 12  | —                                 | `label.icon`         | `saturation: -1`, затем `opacity: 0.35` | то же            |
| 13  | `poi`                             | `label`              | `visibility: off`                       | то же            |
| 14  | `transit_location`                | `label.icon`         | `visibility: off`                       | то же            |

Полные массивы, переданные реальному API: [A JSON](../../.playwright-mcp/homepage-map-ivory/customization-A.json), [B JSON](../../.playwright-mcp/homepage-map-ivory/customization-B.json). Это развёрнутые конфигурации, а не условный псевдокод.

## Сравнительные скриншоты

[Галерея A | B](../../.playwright-mcp/homepage-map-ivory/index.html). Каждый PNG секции включает окружающий ivory-фон, heading/description/CTA, три Place links и переход ко всему футеру. Map crops сохранены только как дополнительное доказательство рендеринга.

| Локаль / viewport | A — вся секция                                                        | B — вся секция                                                        | A \| B                                                                          |
| ----------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| RU 1440           | [PNG](../../.playwright-mcp/homepage-map-ivory/ru-1440-A-section.png) | [PNG](../../.playwright-mcp/homepage-map-ivory/ru-1440-B-section.png) | [Compare](../../.playwright-mcp/homepage-map-ivory/compare-ru-1440-section.png) |
| RU 390            | [PNG](../../.playwright-mcp/homepage-map-ivory/ru-390-A-section.png)  | [PNG](../../.playwright-mcp/homepage-map-ivory/ru-390-B-section.png)  | [Compare](../../.playwright-mcp/homepage-map-ivory/compare-ru-390-section.png)  |
| EN 1440           | [PNG](../../.playwright-mcp/homepage-map-ivory/en-1440-A-section.png) | [PNG](../../.playwright-mcp/homepage-map-ivory/en-1440-B-section.png) | [Compare](../../.playwright-mcp/homepage-map-ivory/compare-en-1440-section.png) |
| EN 390            | [PNG](../../.playwright-mcp/homepage-map-ivory/en-390-A-section.png)  | [PNG](../../.playwright-mcp/homepage-map-ivory/en-390-B-section.png)  | [Compare](../../.playwright-mcp/homepage-map-ivory/compare-en-390-section.png)  |

Парные снимки сделаны с одинаковыми viewport, center, fractional zoom, размерами карты, маркерами и UI state. Секции экспортируются за пределами высоты viewport без изменения размеров карты. Только на экспортируемом снимке скрыта внешняя шапка/skip link, чтобы fixed/sticky chrome не накладывался на секцию при full-page clipping; layout сохраняется. Панель Nuxt DevTools также исключена. Provider attribution/controls не скрывались и не изменялись.

## Focused checks и live evidence

- Chromium + реальный API: A/B × RU/EN × 1440×1100 / 390×844 — 8 состояний. После ready дополнительно ожидались 15 секунд завершения векторной кастомизации. Проверены реальные пиксели воды/парков, совпадение камеры и параметров API между A/B, а не только наличие конфигурации.
- 13 неизменённых маркеров, категории 6/7, прежние цвета и размер 26×31px. На светлой подложке обе категории различимы; дороги, Москва-река, названия улиц/парков/районов читаются. POI labels и transit icons скрыты официальными правилами; географические подписи сохранены.
- Живой hover: desktop приближает на +0.3 и возвращает исходный zoom; coarse/touch не меняет zoom. Existing focused tests покрывают reduced motion, deferred initialization, cleanup, fallback и same-tab RU/EN links.
- Штатная атрибуция, логотип, ссылки и кнопка Яндекса сохраняются в свободной нижней полосе. Console/page errors и горизонтальный overflow отсутствуют.
- `/map?homepageMapPalette=B` продолжает использовать dark theme и точный approved Museum Graphite. Правила Graphite совпадают с архивом утверждённого A; обычная Homepage не получает customization.
- **46/46 focused tests**: `homepage-map.test.mjs`, `map.test.ts`, `map-index-render.test.mjs`. Добавлены проверки dev/production gate и A/B/default scheme selection. Scoped ESLint, Nuxt typecheck и scoped Prettier — PASS. Build/generate не запускались.

[Камера, конфигурации и pixel counts](../../.playwright-mcp/homepage-map-ivory/results.json). Скрипты: `.playwright-mcp/homepage-map-ivory-qa.mjs`, `.playwright-mcp/homepage-map-ivory-compare.mjs`.

## Файлы и ограничения

Добавлен `app/data/homepageMapPalettes.ts`; изменены только Homepage map components, `test/homepage-map.test.mjs` и уточнение dev-exploration в `docs/DESIGN.md`. Добавлены этот отчёт, QA/comparison scripts, JSON evidence и PNG/HTML artifacts. Полная карта, её palette/card, Homepage layout, глобальные токены, тексты и исторические данные не менялись.

Атрибуция и штатная кнопка «Открыть Яндекс Карты» сохраняют собственные цвета провайдера; customization не предназначена для их перекраски. Положение/плотность географических подписей определяет API. Улицы на mobile мельче, а маркеры связанных мест Фили частично пересекаются как и в утверждённом preview — размеры и группировка намеренно сохранены. Проверка выполнена в Chromium, включая touch emulation; физический телефон не использовался.

Рекомендация A не является production-выбором. **AWAITING VISUAL REVIEW**.
