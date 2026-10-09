# Dark Map Palette Exploration — A ACCEPTED

Дата: 2026-10-09. После visual review владелец утвердил **A — Museum Graphite**. Все 14 правил и цвета A без изменений стали единственной production-палитрой `/map`; runtime-конфигурация B и dev-выбор удалены. Stage 9 не начат. [Внедрение и новая мобильная карточка](map-palette-approval-mobile-card.md), карточка отдельно **AWAITING VISUAL REVIEW**.

Ниже сохранён исторический отчёт exploration, включая сравнительные снимки A/B. Описанный dev-переключатель больше не действует; исходные QA-результаты не являются новыми проверками мобильной карточки. Устаревший runtime exploration QA заменён `map-mobile-card-qa.mjs`; статическая сравнительная галерея и изображения сохранены как evidence согласования.

Изменённые файлы: `app/data/mapPalettes.ts` (новый), `app/components/InteractiveMap.client.vue`, `app/utils/yandexMapsLoader.client.ts`, `docs/DESIGN.md`, этот отчёт (новый), `.playwright-mcp/map-palette-qa.mjs` и `.playwright-mcp/map-palette-compare.mjs` (новые). Скриншоты, JSON evidence и локальная HTML-галерея добавлены в `.playwright-mcp/map-palettes/`. Остальные существующие изменения рабочего дерева сохранены.

## Архив: конфигурация и локальный просмотр во время exploration

`app/data/mapPalettes.ts` содержит две небольшие таблицы цветов и общие 14 официальных правил. Выбор применяется в `InteractiveMap.client.vue` при создании `YMapDefaultSchemeLayer`. Типизированный subset правил добавлен в сигнатуру конструктора общего API adapter.

Dev-ссылки: [A](http://localhost:3042/map?mapPalette=A), [B](http://localhost:3042/map?mapPalette=B). Для карточки добавьте `&place=fili-village`; для EN используйте `/en/map`. Переключение палитры — полная загрузка страницы, публичного переключателя нет. Query читается только при `import.meta.dev`; обычная карта и production пока сохраняют штатную dark-подложку. Изменение фильтра может удалить preview query из URL согласно существующей маршрутизации; уже созданный слой сохраняет палитру до следующей полной загрузки. Для возврата к варианту используйте исходную dev-ссылку.

Официальные источники, проверенные перед реализацией: [схема правил, теги и stylers](https://yandex.com/maps-api/docs/js-api/map/customization.html), [SchemeLayer](https://yandex.com/maps-api/docs/js-api/object/layers/YMapDefaultSchemeLayer.html), [справочник YMap и Customization](https://yandex.com/maps-api/docs/js-api/ref/index.html). Использованы документированные `geometry.fill`, `geometry.outline`, `label.text.fill`, `label.text.outline`, `label.icon`, `label`, `color`, `saturation`, `opacity`, `visibility: 'off'`. Теги: `urban_area`, `structure`, `park`, `vegetation`, `national_park`, `water`, `road`, `road_minor`, `road_limited`, `path`, `poi`, `transit_location`.

Тема `dark` и режим `auto` сохранены. Кастомизация векторной схемы не применяется к атрибуции или штатным контролам. POI labels скрыты; иконки transit скрыты, остальные иконки приглушены. Исторические маркеры приложения находятся в отдельном слое и сохраняют цвета/геометрию. Homepage использует отдельный компонент без customization. CSS-фильтров, оверлеев, изменений DOM провайдера, новых зависимостей или глобальных цветов нет.

## Сравнение

| | A — Museum Graphite | B — Warm Historical Graphite |
| --- | --- | --- |
| Основа | Нейтральный холодный графит | Тёплый серо-коричневый графит |
| Вода | Серо-синяя `#394750` | Холодная нейтральная `#404b50` |
| Дороги | Нейтральные `#646b6d` | Серо-бежевые `#746c5f` |
| Парки | Очень спокойные серо-зелёные `#323d38` | Тёмные оливковые `#3a3e30` |
| Подписи | Светло-серые `#c5cbcc` | Светло-бежевые `#d0c7b8` |
| Впечатление | Спокойная музейная картографическая основа; маркеры лучше отделены от фона | Более тёплая историческая интонация; дороги заметнее, нейтральные маркеры ближе к общей палитре |

Рекомендация: **A**, как более нейтральный фон для существующего музейного интерфейса и двух категорий маркеров. B остаётся полноценной альтернативой. Оба варианта существенно уменьшают насыщенность и сохраняют читаемость улиц без эффекта пергамента.

## Снимки и одинаковые условия

RU, viewport height 1000 px. Без карточки: center `[37.516, 55.737]`, zoom **13**. С карточкой Деревни Фили: zoom **15**, desktop center `[37.5246, 55.7397]`, mobile center `[37.5231, 55.7385]`. Каждая пара A/B использует одинаковый viewport, центр, zoom и UI state. Камера задаётся исключительно официальным `setLocation` в QA; приложение не получает новой камеры или геометрии.

| RU / состояние | A, полная страница | B, полная страница | A \| B, карта |
| --- | --- | --- | --- |
| 1440, без выбора | [A](../../.playwright-mcp/map-palettes/A-1440-unselected.png) | [B](../../.playwright-mcp/map-palettes/B-1440-unselected.png) | [Сравнение](../../.playwright-mcp/map-palettes/compare-1440-unselected.png) |
| 1440, карточка | [A](../../.playwright-mcp/map-palettes/A-1440-selected.png) | [B](../../.playwright-mcp/map-palettes/B-1440-selected.png) | [Сравнение](../../.playwright-mcp/map-palettes/compare-1440-selected.png) |
| 390, без выбора | [A](../../.playwright-mcp/map-palettes/A-390-unselected.png) | [B](../../.playwright-mcp/map-palettes/B-390-unselected.png) | [Сравнение](../../.playwright-mcp/map-palettes/compare-390-unselected.png) |
| 390, карточка | [A](../../.playwright-mcp/map-palettes/A-390-selected.png) | [B](../../.playwright-mcp/map-palettes/B-390-selected.png) | [Сравнение](../../.playwright-mcp/map-palettes/compare-390-selected.png) |

[Локальная HTML-галерея A | B](../../.playwright-mcp/map-palettes/index.html). Композиции получены браузером из исходных скриншотов; изображения карты не перекрашивались. В dev-снимках виден небольшой Nuxt DevTools индикатор, отсутствующий в production.

## Проверки и ограничения

- Focused Map/helper/chooser/index/Homepage tests: **43/43 PASS**; scoped ESLint, typecheck и formatting **PASS**. Generate не запускался.
- Live Chromium RU A/B × 1440/390 × без выбора/карточка: **8/8 PASS**. QA фиксирует параметры реальных конструкторов YMap/SchemeLayer и проверяет не менее 500 реально отрисованных пикселей цвета воды с допуском ±2 RGB. Это подтверждает применение оттенка, а не только запись конфигурации. [Результаты](../../.playwright-mcp/map-palettes/results.json).
- Для четырёх пар проверено равенство camera/zoom, классов и computed colors собственных маркеров. Проверены фильтры **13/6/7**, group/fan-out, keyboard selection, закрытие карточки, Escape и place Back/Forward. Overflow и pageerror: **0**.
- EN event smoke A/B: scoped индекс **4**, скрытые фильтры, touch group/card, Escape без потери event context, reduced-motion, выход из scope и Back — **PASS**. [Результаты](../../.playwright-mcp/map-palettes/preservation.json).
- Скрипты: `.playwright-mcp/map-palette-qa.mjs`, `.playwright-mcp/map-palette-compare.mjs`.

Особенность официального `auto`: пока загружается vector, промежуточная raster-подложка может не показывать точные целевые оттенки. Первые пробы действительно захватывали такое состояние; финальные снимки ждут подтверждения цвета в пикселях. Режим не менялся. Заданные оттенки воды/дорог/парков достижимы в загруженной векторной схеме; атрибуция и штатные элементы сохраняют оформление провайдера. Тонкие линии и сглаживание могут давать смешанные цвета; это не обещание одинакового hex для каждого пикселя объекта.

Мобильная карточка, её внутренняя прокрутка, типографика, отступы, высота карты и Footer не менялись. Touch проверен эмуляцией Chromium, не физическим устройством. **AWAITING VISUAL REVIEW**.
