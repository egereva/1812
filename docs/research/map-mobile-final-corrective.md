# Map mobile card — final corrective pass

2026-10-09. Museum Graphite и компактная карточка приняты владельцем. Точечные исправления — **AWAITING VISUAL REVIEW**. Stage 9 не начат.

## Изменения

- Мобильная высота карты теперь учитывает существующий `--header-height`: открытие панели больше не прокручивает заголовок под шапку. Высота frame на проверенных viewport уменьшилась на 76px. Код Header, его пороги скрытия/возврата и desktop layout не менялись.
- Раскрытая карточка ограничена 75% внутренней высоты карты: 337.5px при 320×720 и 430.5px при 390×844. Прокручивается только body; закрытие, «Подробнее» и раскрытие/сворачивание закреплены.
- Нижний резерв мобильной панели увеличен с 44 до 56px: проверка штатной кнопки «Открыть Яндекс Карты» выявила небольшое пересечение при прежнем резерве. Атрибуция, логотип, ссылки и кнопка провайдера не изменялись.
- «+» заменён небольшим SVG-шевроном с поворотом на 180°. Native button, aria-expanded/aria-controls и клавиатурное управление сохранены; reduced motion отключает анимацию.

Цвета A, типографика, размеры компактной карточки, маркеры, desktop и Homepage не менялись. Историческое содержимое и переводы сохранены.

## Проверки

- Живой Yandex API: RU/EN × 320/390px × Фили/самое длинное название — 8 сценариев. Compact/expanded, внутренний scroll, загрузка изображения/подписи, Enter/Space, Escape с возвратом фокуса, touch открытие/закрытие, Back, локализованный same-tab переход «Подробнее», отсутствие горизонтального overflow. Проверены event context и keyboard fan-out selection.
- Отдельно RU/EN × 320/390px: native touch swipe прокручивает body, не страницу; шапка по-прежнему скрывается вниз и возвращается вверх; штатные ссылки/логотип/кнопка Яндекса не пересекаются с панелью.
- В раскрытом состоянии End прокручивает focusable body без перемещения страницы. Все основные touch targets ≥44px. В compact детали и их ссылки скрыты; aria-expanded корректно меняется.
- Approved A rules совпадают с архивом. Desktop 1440px: toggle скрыт, полное содержимое и ширина карточки 384px сохранены.
- Focused tests: **45/45** (map, chooser/index render, Homepage map, header motion). Scoped ESLint, Nuxt typecheck, scoped Prettier — PASS. Полный generate не запускался.

Browser evidence: [8 сценариев](../../.playwright-mcp/map-mobile-final/after/results.json), [native touch / provider / header](../../.playwright-mcp/map-mobile-final/touch-provider-header.json). Touch проверен эмуляцией Chromium; физический телефон и отдельный screenreader не использовались.

## Скриншоты до / после

[Полная сравнительная галерея](../../.playwright-mcp/map-mobile-final/index.html) включает RU/EN, обе ширины, длинные названия, внутренний scroll и desktop.

| Viewport | Compact до                                                                           | Compact после                                                                       | Expanded до                                                                           | Expanded после                                                                       | После scroll                                                                                  |
| -------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| RU 320   | [PNG](../../.playwright-mcp/map-mobile-final/before/ru-320-fili-village-compact.png) | [PNG](../../.playwright-mcp/map-mobile-final/after/ru-320-fili-village-compact.png) | [PNG](../../.playwright-mcp/map-mobile-final/before/ru-320-fili-village-expanded.png) | [PNG](../../.playwright-mcp/map-mobile-final/after/ru-320-fili-village-expanded.png) | [PNG](../../.playwright-mcp/map-mobile-final/after/ru-320-fili-village-expanded-scrolled.png) |
| RU 390   | [PNG](../../.playwright-mcp/map-mobile-final/before/ru-390-fili-village-compact.png) | [PNG](../../.playwright-mcp/map-mobile-final/after/ru-390-fili-village-compact.png) | [PNG](../../.playwright-mcp/map-mobile-final/before/ru-390-fili-village-expanded.png) | [PNG](../../.playwright-mcp/map-mobile-final/after/ru-390-fili-village-expanded.png) | [PNG](../../.playwright-mcp/map-mobile-final/after/ru-390-fili-village-expanded-scrolled.png) |
| EN 320   | [PNG](../../.playwright-mcp/map-mobile-final/before/en-320-fili-village-compact.png) | [PNG](../../.playwright-mcp/map-mobile-final/after/en-320-fili-village-compact.png) | [PNG](../../.playwright-mcp/map-mobile-final/before/en-320-fili-village-expanded.png) | [PNG](../../.playwright-mcp/map-mobile-final/after/en-320-fili-village-expanded.png) | [PNG](../../.playwright-mcp/map-mobile-final/after/en-320-fili-village-expanded-scrolled.png) |
| EN 390   | [PNG](../../.playwright-mcp/map-mobile-final/before/en-390-fili-village-compact.png) | [PNG](../../.playwright-mcp/map-mobile-final/after/en-390-fili-village-compact.png) | [PNG](../../.playwright-mcp/map-mobile-final/before/en-390-fili-village-expanded.png) | [PNG](../../.playwright-mcp/map-mobile-final/after/en-390-fili-village-expanded.png) | [PNG](../../.playwright-mcp/map-mobile-final/after/en-390-fili-village-expanded-scrolled.png) |

Снимки сделаны до изменения исходников и после финальных правок, в одинаковых viewport и состоянии UI. Basemap использует штатный fit; после уменьшения мобильного frame его геометрия отличается. Для desktop центр/zoom зафиксированы и одинаковы. Скрыта только собственная панель Nuxt DevTools.

## Файлы и ограничения

Изменены `app/pages/map.vue`, `app/components/MapPlaceCard.vue`, соответствующие правила `docs/DESIGN.md`/`docs/ARCHITECTURE.md` и ссылка в предыдущем отчёте. Добавлены этот отчёт, два focused browser scripts и изображения/галерея в `.playwright-mcp/map-mobile-final/`.

На проверенных viewport нерешённых пересечений и overflow не обнаружено. Длинные материалы доступны через внутреннюю прокрутку; они намеренно не помещаются целиком в первоначальном expanded состоянии. Финальное визуальное согласование остаётся за владельцем: **AWAITING VISUAL REVIEW**.
