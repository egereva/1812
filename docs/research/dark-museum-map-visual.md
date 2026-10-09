# Dark Museum Map — AWAITING VISUAL REVIEW

Дата проверки: 2026-10-09. Первый экспериментальный вариант готов для проверки владельцем; дизайн не принят. Stage 9 не начат.

## Изменения

- `app/pages/map.vue`: локальные цвета фона, текста, акцентов, линий и маркеров; адаптация фильтров, состояния загрузки, ошибки, fallback, списка и легенды. Шрифты, композиция, мобильное скрытие общего счётчика и поведение сохранены.
- `app/components/InteractiveMap.client.vue`: официальная `theme: 'dark'` на YMap, локальные переменные цвета SVG и медальона, hover/active chooser. Геометрия SVG, размеры, selected-инверсия, группировка, fan-out и события сохраняются.
- `app/components/MapPlaceCard.vue`: наследуемое отключение тени только в тёмной странице, hover/active кнопки закрытия. Прежние изменения media delivery в рабочем дереве сохранены.
- `app/utils/yandexMapsLoader.client.ts`: тип официального параметра `theme`.
- `docs/DESIGN.md`: явно экспериментальное локальное исключение из светлого оформления карты.
- `.playwright-mcp/dark-museum-map-qa.mjs`, `.playwright-mcp/dark-museum-map-accessibility.mjs`: воспроизводимые браузерные проверки; артефакты в `.playwright-mcp/dark-museum-map/`.

Главная, её отдельный компонент карты, глобальные токены, Header/Footer, исторические данные, переводы и маршрутизация в этом pass не редактировались. Существующие несвязанные изменения в рабочем дереве сохранены. Режим YMap и слои не менялись; customization, CSS-фильтры, затемняющие оверлеи и изменения DOM провайдера не добавлены. Официальный контракт темы: [Yandex JS API](https://yandex.com/maps-api/docs/js-api/ref/index.html).

## Проверки

- Focused Map/helper/chooser/index/Homepage-map tests: **43/43 PASS**.
- Scoped ESLint четырёх изменённых исходников, `npm run typecheck`, scoped Prettier: **PASS**. Полная генерация не запускалась: контент, маршруты и статические контракты не менялись.
- Chromium с реальным API и локальным ключом: **RU/EN × 390/1440/1920, 6/6 PASS**. Реальные canvas, маркеры и успешные ответы renderer/tile endpoints; финальные снимки показывают полностью загруженную подложку. API не подменялся, ключ не менялся и не записывался в отчёт.
- В каждом варианте: фильтры и индекс **13/6/7**, раскрытие группы, выбор маркера, карточка, keyboard Enter и фокус заголовка, Escape и возврат фокуса, Back/Forward для `?place`, reload, `?event=council-fili` и возврат к контексту из истории, переход в Places в той же вкладке. Touch tap выбора и закрытия проверен в обеих локалях на 390 px.
- Горизонтальный overflow и необработанные runtime exceptions: **0** во всех шести вариантах. В сети записаны `ERR_ABORTED` при смене камеры/маршрутов; иных типов request failures в этих случаях нет. [Машинные результаты](../../.playwright-mcp/dark-museum-map/results.json).
- Атрибуция и ссылки провайдера не пересекаются с открытой карточкой на 390/1440; focus-visible маркера имеет 2px outline; reduced-motion соответствует существующему глобальному практически нулевому времени перехода. JS-disabled RU/EN сохраняют открытый индекс из 13 ссылок. [Accessibility evidence](../../.playwright-mcp/dark-museum-map/accessibility.json).
- Заблокированный API: RU/EN fallback из 13 ссылок, без горизонтального скролла. Loading/missing/error дополнительно покрыты actual-page component tests.
- Контраст основных текстовых цветов с фоном страницы: основной **13,11:1**, вторичный **7,80:1**, акцент **5,64:1**; с фоном карточки — **11,95:1 / 7,11:1 / 5,14:1**. Цвета маркеров к локальному тёмному медальону: **10,14:1 / 5,11:1**; это не измерение каждого пикселя переменной подложки Яндекса.

## Полная страница: реальные Яндекс Карты

Высота viewport — 1000 px; список и легенда раскрыты для визуальной проверки. Выбранное место — Fili Village / Деревня Фили, выбор сделан клавиатурой через группу маркеров. Перед съёмкой фокус снят и страница возвращена наверх. На dev-снимках присутствует маленький индикатор Nuxt DevTools; это не интерфейс production.

| Локаль / ширина | Без выбора | Маркер и карточка |
| --- | --- | --- |
| RU / 390 | [Снимок](../../.playwright-mcp/dark-museum-map/ru-390-unselected.png) | [Снимок](../../.playwright-mcp/dark-museum-map/ru-390-selected.png) |
| RU / 1440 | [Снимок](../../.playwright-mcp/dark-museum-map/ru-1440-unselected.png) | [Снимок](../../.playwright-mcp/dark-museum-map/ru-1440-selected.png) |
| RU / 1920 | [Снимок](../../.playwright-mcp/dark-museum-map/ru-1920-unselected.png) | [Снимок](../../.playwright-mcp/dark-museum-map/ru-1920-selected.png) |
| EN / 390 | [Снимок](../../.playwright-mcp/dark-museum-map/en-390-unselected.png) | [Снимок](../../.playwright-mcp/dark-museum-map/en-390-selected.png) |
| EN / 1440 | [Снимок](../../.playwright-mcp/dark-museum-map/en-1440-unselected.png) | [Снимок](../../.playwright-mcp/dark-museum-map/en-1440-selected.png) |
| EN / 1920 | [Снимок](../../.playwright-mcp/dark-museum-map/en-1920-unselected.png) | [Снимок](../../.playwright-mcp/dark-museum-map/en-1920-selected.png) |

Fallback: [RU 390](../../.playwright-mcp/dark-museum-map/ru-390-fallback.png), [EN 390](../../.playwright-mcp/dark-museum-map/en-390-fallback.png).

## Визуальные наблюдения и пределы проверки

Все 12 финальных снимков и оба fallback просмотрены. Подписи, фильтры, ссылки, заголовки и карточки читаемы; категории и выбранное состояние различимы. Штатная тёмная подложка Яндекса остаётся холодной, насыщенной синим/зелёным, с большим количеством POI: она заметно активнее тёплого музейного окружения. Это главный вопрос для review штатной темы; customization намеренно не добавлена.

На 390 px нижние сведения, подпись изображения и CTA карточки требуют внутренней прокрутки — существующее ограничение её высоты сохранено ради карты и атрибуции. Светлый Header сохраняет заметный переход к тёмной странице согласно scope. Chromium touch emulation не заменяет проверку на физическом телефоне; другие браузеры в этом pass не проверялись.

**AWAITING VISUAL REVIEW.**
