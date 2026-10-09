# Map palette approval & Mobile card — archived implementation review

Дата: 2026-10-09. **A — Museum Graphite и компактная мобильная карточка ACCEPTED after owner visual review.** Исходная реализация и проверки сохранены ниже как архив. [Последующий corrective pass](map-mobile-final-corrective.md) — **AWAITING VISUAL REVIEW**. Stage 9 не начат.

## Реализация

На полной карте единственная production-палитра — утверждённая A: `museumGraphiteCustomization` передаётся безусловно в официальный `YMapDefaultSchemeLayer`. Все 14 правил и значения цветов совпадают с live evidence принятого варианта A. B, `resolveMapPalette`, dev gate и чтение `mapPalette` удалены из runtime; старый query не меняет палитру. Сравнительные изображения и галерея сохранены как архив согласования; устаревший exploration QA удалён. Dark theme и auto mode не изменены; Homepage использует отдельную карту без customization.

Предложенная до реализации структура при ≤600px:

1. Верхняя строка: категория и 44px кнопка закрытия.
2. Компактное содержимое: полный заголовок и до трёх строк существующего короткого описания. Контент не переписывается; полное описание появляется при раскрытии.
3. Закреплённые нижние действия: «Подробнее / Read more» и «Показать детали / Show details».
4. Раскрытие native button: полный lead, адрес, contain image, полная caption, attribution/source и supplied исторические/географические уточнения. Внутри прокручивается только body; закрытие и действия остаются видимыми. «Свернуть / Collapse» возвращает compact state.

Это немодальная нижняя панель внутри карты, с прежним bottom reserve **2.75rem** для Яндекса, без drag/swipe и новых зависимостей. Кнопка использует aria-expanded и aria-controls. Скрытые details исключены CSS из отображения/keyboard traversal; expanded body — именованная focusable scroll region. Фокус остаётся на disclosure при раскрытии; Tab/Shift+Tab ведут к scroll region и source link, Arrow/Page/End прокручивают содержимое. Escape использует прежнее закрытие карточки и возврат фокуса к маркеру. Place/locale changes сбрасывают expanded state и scroll. Новое состояние не меняет URL/history.

При открытии на ≤600px карта минимально прокручивается до своего нижнего края через native `scrollIntoView({block: 'end', behavior: 'instant'})`: начальный CTA и provider strip сразу находятся в экранном viewport, без изменения высоты/камеры карты и без анимации. Desktop не прокручивается. Mobile screenshots показывают именно viewport после открытия панели, а не full-page capture.

Desktop/card styles выше 600px сохранены: новые wrappers имеют display:contents, disclosure скрыт, всё прежнее содержимое и порядок остаются видимыми. Существующий tablet layout ≤850px сохранён. Карта, маркеры, фильтры, отступы страницы, Footer и исторический контент не редактировались.

## Проверки

- Focused Map/helper/chooser/index/Homepage-map tests: **43/43 PASS**.
- Scoped ESLint, `npm run typecheck`, scoped Prettier и diff whitespace check: **PASS**. Generate не запускался.
- Live Chromium: RU/EN × **320×720 / 390×844** × Fili Village / длиннейший title (Kutuzov Monument): **8/8 PASS**. Compact/expanded CTA целиком внутри панели **и viewport**, все три действия не меньше **44px**, overflow **0**, provider links не пересекаются с карточкой в обоих состояниях. [Машинные результаты](../../.playwright-mcp/map-mobile-card/results.json).
- Compact высота в этих случаях — **197–265px**; на 390px — **197–241px** при высоте карты **652px**. Expanded — **430px / 554px** внутри рамок карты **528px / 652px**. Высота самой карты не менялась.
- Проверены touch раскрытие/закрытие, keyboard Enter/Space, visible focus scroll region, скролл до caption/attribution/notes, сворачивание и сброс scroll, Escape/focus return, закрытие и повторное открытие из Back (compact), переход «Подробнее» в Places в той же вкладке. Все изображения loaded; caption сохраняется.
- Event scope во всех четырёх viewport/locale случаях: group/fan-out → keyboard selection с фокусом H2 → expanded → Close сохраняет `?event=council-fili` и **4** related Places. Reduced motion включён в mobile browser contexts; новая панель не добавляет анимацию.
- Отдельный live keyboard test подтверждает сброс expanded при выборе другого маркера: [reset evidence](../../.playwright-mcp/map-mobile-card/reset.json).
- Desktop RU 1440×1000: full details видимы, disclosure скрыт, ширина карточки **384px**, wrappers display:contents. Legacy `mapPalette=B` игнорируется; реальный SchemeLayer получает точные A rules. [Desktop screenshot](../../.playwright-mcp/map-mobile-card/ru-1440-desktop-preserved.png).

В начале QA прежний долгоживущий dev server вернул `worker exited with code 0`; он перезапущен, финальная проверка выполнена на работающем сервере. Nuxt DevTools overlay подавляется только QA на его собственном контейнере, поскольку development chrome перекрывал нижние действия; на отдельном EN 320 scrolled capture индикатор появился повторно у provider strip. Это development artifact, отсутствующий в production; основные compact/expanded примеры 390px сняты без него. DOM/элементы Яндекса не модифицировались. Скриншоты — живая карта, не fallback.

## Скриншоты

| Fili Village | Compact                                                                         | Expanded                                                                         | Прокрутка details                                                                         |
| ------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| RU 320       | [Снимок](../../.playwright-mcp/map-mobile-card/ru-320-fili-village-compact.png) | [Снимок](../../.playwright-mcp/map-mobile-card/ru-320-fili-village-expanded.png) | [Снимок](../../.playwright-mcp/map-mobile-card/ru-320-fili-village-expanded-scrolled.png) |
| RU 390       | [Снимок](../../.playwright-mcp/map-mobile-card/ru-390-fili-village-compact.png) | [Снимок](../../.playwright-mcp/map-mobile-card/ru-390-fili-village-expanded.png) | [Снимок](../../.playwright-mcp/map-mobile-card/ru-390-fili-village-expanded-scrolled.png) |
| EN 320       | [Снимок](../../.playwright-mcp/map-mobile-card/en-320-fili-village-compact.png) | [Снимок](../../.playwright-mcp/map-mobile-card/en-320-fili-village-expanded.png) | [Снимок](../../.playwright-mcp/map-mobile-card/en-320-fili-village-expanded-scrolled.png) |
| EN 390       | [Снимок](../../.playwright-mcp/map-mobile-card/en-390-fili-village-compact.png) | [Снимок](../../.playwright-mcp/map-mobile-card/en-390-fili-village-expanded.png) | [Снимок](../../.playwright-mcp/map-mobile-card/en-390-fili-village-expanded-scrolled.png) |

| Длинное название | Compact                                                                             | Expanded                                                                             |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| RU 320           | [Снимок](../../.playwright-mcp/map-mobile-card/ru-320-kutuzov-monument-compact.png) | [Снимок](../../.playwright-mcp/map-mobile-card/ru-320-kutuzov-monument-expanded.png) |
| RU 390           | [Снимок](../../.playwright-mcp/map-mobile-card/ru-390-kutuzov-monument-compact.png) | [Снимок](../../.playwright-mcp/map-mobile-card/ru-390-kutuzov-monument-expanded.png) |
| EN 320           | [Снимок](../../.playwright-mcp/map-mobile-card/en-320-kutuzov-monument-compact.png) | [Снимок](../../.playwright-mcp/map-mobile-card/en-320-kutuzov-monument-expanded.png) |
| EN 390           | [Снимок](../../.playwright-mcp/map-mobile-card/en-390-kutuzov-monument-compact.png) | [Снимок](../../.playwright-mcp/map-mobile-card/en-390-kutuzov-monument-expanded.png) |

## Файлы и границы

Изменены: `app/data/mapPalettes.ts`, `app/components/InteractiveMap.client.vue`, `app/components/MapPlaceCard.vue`, `i18n/locales/ru.json`, `i18n/locales/en.json` (только два UI labels), `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/research/dark-map-palettes.md`. Добавлены этот отчёт, `.playwright-mcp/map-mobile-card-qa.mjs` и browser artifacts; удалён `.playwright-mcp/map-palette-qa.mjs`.

Исторические поля, переводы исторического содержания, глобальные токены и остальные страницы не менялись. Existing unrelated worktree changes сохранены. Проверены Chromium keyboard/touch emulation и DOM accessibility semantics; физический телефон и отдельный screenreader не запускались. Длинные captions/notes требуют доступной внутренней прокрутки expanded body; первоначальные действия не уходят за его границы. **AWAITING VISUAL REVIEW**.
