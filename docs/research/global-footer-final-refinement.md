# Global Footer — final visual refinement

2026-10-09. **AWAITING VISUAL REVIEW**. Новые этапы разработки не начаты.

## Изменения

В `app/components/SiteFooter.vue` добавлены только scoped styles: общий фон `#302d2a`, верхняя граница `1px solid rgb(112 40 55 / 30%)`, нижняя линия `rgb(201 196 186 / 24%)`. Это один вариант футера для всех маршрутов. Глобальные токены и палитра мобильного меню не менялись.

Сохранены логотип и его размеры, тексты и RU/EN, навигация, сетка и типографика. Верхние отступы футера — 64px desktop / 48px mobile, нижний — 24px. Последняя секция главной и карта сохраняют собственный нижний отступ 48px: цветовая граница разделяет эти интервалы и делает их намеренными. Дополнительная пустота не добавлялась.

## Проверки

- Chromium: главная и `/map`, RU/EN, 1440×1000 и 390×844 — 8 сочетаний. Сняты переход к футеру и низ страницы после загрузки карт.
- Фон одинаковый: `rgb(48, 45, 42)`. Общий token `--color-footer` остался `#25231f`, фон Museum Graphite — `#24221f`.
- Контраст текста/ссылок — **11.31:1**, второстепенного текста — **7.88:1**. Видимый клавиатурный focus сохранён. Семь ссылок футера и их локализованные адреса сохранены.
- Горизонтального overflow и page exceptions не обнаружено. Scoped ESLint и Prettier — PASS. Build/generate и нерелевантные тесты не запускались: изменение ограничено CSS футера.

[Измерения браузера](../../.playwright-mcp/global-footer-final/results.json). Проверка автоматизирована в `.playwright-mcp/global-footer-final-qa.mjs`.

## Скриншоты

| Локаль / ширина | Главная → футер                                                              | Карта → футер                                                               | Низ главной                                                              | Низ карты                                                               |
| --------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| RU 1440         | [PNG](../../.playwright-mcp/global-footer-final/ru-1440-home-transition.png) | [PNG](../../.playwright-mcp/global-footer-final/ru-1440-map-transition.png) | [PNG](../../.playwright-mcp/global-footer-final/ru-1440-home-bottom.png) | [PNG](../../.playwright-mcp/global-footer-final/ru-1440-map-bottom.png) |
| RU 390          | [PNG](../../.playwright-mcp/global-footer-final/ru-390-home-transition.png)  | [PNG](../../.playwright-mcp/global-footer-final/ru-390-map-transition.png)  | [PNG](../../.playwright-mcp/global-footer-final/ru-390-home-bottom.png)  | [PNG](../../.playwright-mcp/global-footer-final/ru-390-map-bottom.png)  |
| EN 1440         | [PNG](../../.playwright-mcp/global-footer-final/en-1440-home-transition.png) | [PNG](../../.playwright-mcp/global-footer-final/en-1440-map-transition.png) | [PNG](../../.playwright-mcp/global-footer-final/en-1440-home-bottom.png) | [PNG](../../.playwright-mcp/global-footer-final/en-1440-map-bottom.png) |
| EN 390          | [PNG](../../.playwright-mcp/global-footer-final/en-390-home-transition.png)  | [PNG](../../.playwright-mcp/global-footer-final/en-390-map-transition.png)  | [PNG](../../.playwright-mcp/global-footer-final/en-390-home-bottom.png)  | [PNG](../../.playwright-mcp/global-footer-final/en-390-map-bottom.png)  |

Скрыта только собственная панель Nuxt DevTools. Элементы Яндекса не изменялись.

## Результат

На светлой главной переход выразительный; на карте фон футера деликатно светлее и теплее. Просторная композиция сохраняется. В проверенных состояниях визуальных дефектов не обнаружено; окончательное согласование остаётся за владельцем.

Изменены `SiteFooter.vue` и соответствующее правило `docs/DESIGN.md`. Добавлены этот отчёт, focused browser script и screenshots. **AWAITING VISUAL REVIEW**.
