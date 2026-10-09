# Stage 9.4 — Responsive & accessibility corrections

Дата: 2026-10-09. **STAGE 9.4 — READY FOR ACCEPTANCE. Stage 9 IN PROGRESS.**

Исправлены целевые причины RSP-01/RSP-02 из [Stage 9.1 audit](stage9-1-site-audit.md): переполнение Timeline grid и выход кнопки меню за узкий экран при увеличенном тексте. Footer overflow исправлен в Stage 9.4.1; независимое переполнение map UI исправлено в Stage 9.4.2. Результаты и исторические ограничения каждого batch приведены ниже.

## Root causes и изменения

### Timeline

В `/timeline` на 320 px длинное слово «Малоярославцем» формировало intrinsic minimum трека `1fr` у wide landmark. Grid text child также имел автоматическую минимальную ширину. Колонка, заголовок, описание и изображение расширялись за viewport: ширина документа **339 px** при client width 320. На EN обычного переполнения в исходной проверке не было, но та же структура требовала защиты от длинных слов.

В `app/pages/timeline/index.vue`:

- Single-column wide/burgundy/tablet landmark tracks заменены на `minmax(0, 1fr)`.
- `.timeline-event__text` получил `min-width: 0`.
- `.timeline-page` получил `overflow-wrap: anywhere`: длинное слово может переноситься вместо расширения колонки, в том числе при увеличенном тексте.

Не менялись font sizes, даты, контент, порядок событий, tiers, иллюстрации или chronology axis. Не добавлялись overflow clipping / hidden как исправление. На 320 px длинный заголовок и дата занимают больше строк, сохраняя исходный размер и иерархию. На 390/768/1440 px horizontal overflow не появился.

### Header / mobile menu

При text resize 200% логотип занимал около 150 px, языковые кнопки — 160 px, menu toggle — 88 px; вместе с gap/padding это превышало 320/390 px. Минимальные размеры rem-кнопок и intrinsic widths не позволяли grid сжаться. Кнопка меню заканчивалась около **454 px**, находясь вне экрана.

Кроме того, `.mobile-menu__nav` и footer меню могли сжиматься как flex children, несмотря на большой текст внутри. Длинные navigation labels не имели emergency word wrapping.

В `app/assets/css/main.css` изменены только правила Header / mobile menu:

- Mobile header inner стал именованным inline-size container.
- При available width `<16rem` верхний language switch не показывается; **RU/EN остаются доступны в открываемом меню**. Это адаптация по реальной доступной ширине относительно увеличенного текста, не JavaScript detection of zoom. При normal 100% на 320/390 px условие не срабатывает.
- Menu nav и menu footer получили `flex-shrink: 0`, чтобы полная высота содержимого участвовала в существующей внутренней прокрутке.
- Menu links получили `overflow-wrap: anywhere` для длинных RU/EN labels.

Размер текста не уменьшался. Существующие `overflow-y: auto`, focus trap, Escape, inert background, safe-area offsets, Header scroll behavior и принятый Stage 9.2 locale prefetch fix сохранены. Контейнер находится на inner row; сам fixed mobile menu расположен вне этого container.

## Before / after screenshots

Снимки сняты в Chromium на 320×900. Для Header/menu — text resize 200%; Timeline — обычный размер текста. DevTools скрыт только в QA browser.

| Состояние           | До                                                               | После                                                           |
| ------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------- |
| RU Timeline         | [PNG](../../.playwright-mcp/stage9-4/before-timeline-ru-320.png) | [PNG](../../.playwright-mcp/stage9-4/after-timeline-ru-320.png) |
| EN Timeline control | [PNG](../../.playwright-mcp/stage9-4/before-timeline-en-320.png) | [PNG](../../.playwright-mcp/stage9-4/after-timeline-en-320.png) |
| RU Header 200%      | [PNG](../../.playwright-mcp/stage9-4/before-header-ru-320.png)   | [PNG](../../.playwright-mcp/stage9-4/after-header-ru-320.png)   |
| EN Header 200%      | [PNG](../../.playwright-mcp/stage9-4/before-header-en-320.png)   | [PNG](../../.playwright-mcp/stage9-4/after-header-en-320.png)   |
| RU menu 200%        | [PNG](../../.playwright-mcp/stage9-4/before-menu-ru-320.png)     | [PNG](../../.playwright-mcp/stage9-4/after-menu-ru-320.png)     |
| EN menu 200%        | [PNG](../../.playwright-mcp/stage9-4/before-menu-en-320.png)     | [PNG](../../.playwright-mcp/stage9-4/after-menu-en-320.png)     |

В before probe недоступная за экраном кнопка открывалась программным DOM click только для осмотра старого меню. Это **не** свидетельство доступности старой кнопки для реального touch. After QA использует настоящие browser keyboard / click / tap.

## RU/EN responsive и keyboard QA

Playwright, живой Nuxt dev server `http://localhost:3042`, после Vue hydration. Text resize — временное `document.documentElement.style.fontSize = '200%'`; это не нативный browser zoom.

| Проверка                        | Результат                                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Timeline RU/EN 320/390/768/1440 | **8/8**; document width = viewport, даты/заголовки/описания помещаются без horizontal overflow             |
| Header RU/EN 320/390, 100/200%  | **8/8 scoped cases**; menu toggle в viewport, Header/Timeline не расширяют документ                        |
| Header normal 100%              | Bounding box menu toggle совпадает с before в четырёх RU/EN narrow cases                                   |
| Opened menu / long labels       | Полный текст переносится, links не переполняются по ширине; nav и footer не перекрывают друг друга         |
| Internal scroll / languages     | Focus последней language link прокручивает меню до неё; RU/EN switching ведёт на equivalent Timeline route |
| Tab / Shift+Tab                 | По 14 переходов в каждом направлении, focus остаётся внутри разрешённой области Header/menu                |
| Enter / Space                   | Открывают меню; mouse click и native tap закрывают его                                                     |
| Escape                          | Закрывает меню и возвращает focus на `.menu-toggle`                                                        |
| Accessible names                | Существующий локализованный `aria-label` toggle сохранён; semantic buttons/links не заменялись             |
| Runtime                         | `pageerror` в проверенных сценариях не найден                                                              |

Evidence: [before.json](../../.playwright-mcp/stage9-4/before.json), [after.json](../../.playwright-mcp/stage9-4/after.json). Последний файл сохраняет как успешные scoped assertions, так и `remainingFooterOverflow`; статус PASS не означает отсутствие overflow неизменённого Footer.

## Focused regression tests и checks

Добавлен [responsive-reflow.browser.test.mjs](../../test/responsive-reflow.browser.test.mjs): **6/6 PASS**. Это проверки реального layout / interaction, не проверки строк CSS:

- RU/EN Timeline на 320 px: длинные слова не расширяют документ и text boxes.
- RU/EN Header на 320/390 px при text 200%: toggle доступен, menu labels не обрезаются, language links достигаются внутренним scroll, native touch-close работает, Space/Escape и focus return корректны.

Optional live suite использует уже имеющийся Playwright, без новых project dependencies. Для повторного запуска нужны работающий dev server и переменные `REFLOW_PLAYWRIGHT_MODULE` (module URL/path), `REFLOW_BROWSER_PATH`; `REFLOW_BASE_URL` по умолчанию `http://localhost:3042`:

```text
node --test --experimental-test-isolation=none test/responsive-reflow.browser.test.mjs
```

Расширенная матрица и screenshots: [stage9-4-responsive-qa.mjs](../../.playwright-mcp/stage9-4-responsive-qa.mjs). Режим `--before` предназначен для исходного source и только фиксирует старые состояния; обычный режим содержит regression assertions и отдельно классифицирует Footer overflow.

| Check                          | Результат / evidence                                                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Новые browser regression tests | **6/6**, [log](../../.playwright-mcp/stage9-4/reflow-regression-tests.log)                                                                                                    |
| Existing header motion tests   | **2/2**, [log](../../.playwright-mcp/stage9-4/header-motion-tests.log)                                                                                                        |
| Scoped ESLint                  | Timeline index, SiteHeader и новый browser test — exit 0; [source log](../../.playwright-mcp/stage9-4/eslint.log), [test log](../../.playwright-mcp/stage9-4/test-eslint.log) |
| Typecheck                      | Exit 0; [log](../../.playwright-mcp/stage9-4/typecheck.log)                                                                                                                   |
| Formatting / syntax            | Prettier scoped files; `node --check` новых scripts                                                                                                                           |
| Protected source inventory     | Из 75 защищённых файлов изменены только main.css и Timeline index; [SHA-256 evidence](../../.playwright-mcp/stage9-4/source-integrity.json)                                   |

Full generate/build не запускались: исправления CSS проверены live layout tests, без изменения static routes/content или payload contract.

## История ограничений первоначального Stage 9.4

**Находка первоначального Stage 9.4; Footer исправлен в Stage 9.4.1 ниже.** После устранения Header/Timeline overflow ширина документа остаётся **377 px RU / 335 px EN**. Прямое измерение показывает только Footer owners за правой границей: `.site-footer__identity`, `.site-footer__nav`, ссылки и `.site-footer__bottom`. Это независимый min-content/grid issue, не ошибка container query Header. В opened menu фон блокируется существующим modal behavior; это не устранение overflow Footer.

Footer явно запрещено менять в этом задании. Поэтому не изменены его колонки, типографика или стили и не добавлен global clipping. Для полного выполнения критерия «нет горизонтального скролла страницы» на 320 px / 200% требуется отдельное согласование локального Footer reflow fix. Это **не выполненный критерий**, а не PASS, и новый batch не начат. На 390 px / 200% в проверенной Timeline странице переполнения нет.

Глобальное увеличение текста всего сайта и остальные detail/prose templates не объявляются полностью проверенными. Существующий Timeline detail template содержит собственный title wrapping; этот pass не менял detail routes. Safari/Firefox, реальный screen reader и нативный browser zoom 200/400% не тестировались. Container queries требуют современного браузера; здесь подтверждён Chromium. Среда — Node 26 при project engine Node 22.

Изменённые production-файлы: **`app/pages/timeline/index.vue`, `app/assets/css/main.css`**. Добавлены browser regression test, QA script, evidence и этот отчёт. Hero, его Pause/Play, обе палитры карт, маркеры, Footer, historical data и global tokens не менялись.

**STAGE 9.4 — AWAITING FINAL REVIEW.** Stage 9 остаётся IN PROGRESS; Stage 9.5 не начат.

## Дополнение Stage 9.4.1 — Footer text zoom overflow fix

Дата: 2026-10-09. Предыдущий запрет менять Footer снят владельцем для этого узкого исправления. Ограничения первоначального Stage 9.4 выше сохранены как история, а не текущий статус Footer.

### Точная причина и локальное исправление

Три причины работали совместно:

1. Мобильный `.site-footer__inner` из main.css использовал `grid-template-columns: 1fr`, то есть автоматический min-content минимум. При тексте 200% RU track расширялся до ~304.8 px вместо доступных 256 px на viewport 320.
2. `.site-footer__nav` сохранял две колонки с увеличенным rem-gap, а ссылки `width: fit-content` не ограничивались шириной трека. Длинные «Источники» / English labels выходили за ячейки.
3. `.site-footer__bottom` оставался flex-row с автоматическими минимумами подписи издания и языковой строки; их сумма мешала сжатию внешнего grid.

Изменён **только `app/components/SiteFooter.vue`**, scoped CSS:

- На mobile внешний track — `minmax(0, 1fr)`.
- Identity и bottom имеют `min-width: 0` и emergency word wrapping; nav links — `max-width: 100%` и wrapping.
- Inner — именованный inline-size container. При available width `<16rem` навигация переходит в одну колонку, нижняя строка — в vertical flex. На 320/390 при обычном тексте условие не срабатывает; при 200% учитывает увеличенный размер rem и складывает элементы без уменьшения шрифтов.

Не применялись horizontal clipping, уменьшение текста, global token changes или изменения padding/цветов/логотипа. Все прежние links и тексты сохранены. В существующем Footer «Русский / English» — **подпись**, не интерактивный language switch; она теперь полностью помещается. Фактическое переключение языка остаётся в Header/menu, которые этот batch не менял.

### Матрица QA и результаты

Live Chromium / Nuxt dev server, RU/EN × Homepage/Map/Timeline × 320/390 × text 100/200%: **24/24 Footer cases PASS**. Новые реальные layout assertions проверяют все Footer descendants, а не только размер внешнего footer element. Логотип и шесть навигационных ссылок проходят Tab в исходном порядке, остаются в видимой области и имеют видимый focus.

| Проверка                           | Результат                                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| Footer horizontal overflow         | Не найден во всех 24 случаях                                                                    |
| Normal 100% appearance             | Высота Footer, x/width/height его ссылок совпадают с before во всех 12 случаях, допуск 1 CSS px |
| Homepage / Timeline document width | Viewport width во всех 16 случаях, включая 320/200% RU/EN                                       |
| Map document width, normal 100%    | Viewport width во всех четырёх случаях                                                          |
| Map document width, text 200%      | **Остаётся 470 px RU / 469 px EN** на 320 и 390; Footer не является источником                  |
| Runtime                            | Page errors не найдено                                                                          |

При проверке вертикального focus учтено browser scroll rounding менее 1 CSS px. Пять первоначальных assertions с жёстким `bottom <= 900` дали 900.27–900.48; повторены только эти случаи с допуском 1 px, без изменения production CSS для этого округления.

Evidence: [before](../../.playwright-mcp/stage9-4-1/before.json), [after](../../.playwright-mcp/stage9-4-1/after.json), [summary / source integrity](../../.playwright-mcp/stage9-4-1/summary.json), [QA script](../../.playwright-mcp/stage9-4-1-footer-qa.mjs). Protected source inventory подтверждает изменение только SiteFooter.vue; Header, Hero, Timeline, карты, палитры и main.css не менялись.

### Сравнительные screenshots

Footer crops на 320 px. Fixed Header/skip-link и DevTools скрыты **только в QA document**, чтобы не перекрывать кадр высокого Footer. Чистые before crops используют исходные два scoped CSS rules Footer: новые rules удалены только из browser stylesheet, без отката production-файла. Реальное исходное overflow отдельно зафиксировано before.json до внесения исправления.

| Состояние | До                                                        | После                                                    |
| --------- | --------------------------------------------------------- | -------------------------------------------------------- |
| RU 200%   | [PNG](../../.playwright-mcp/stage9-4-1/before-ru-200.png) | [PNG](../../.playwright-mcp/stage9-4-1/after-ru-200.png) |
| EN 200%   | [PNG](../../.playwright-mcp/stage9-4-1/before-en-200.png) | [PNG](../../.playwright-mcp/stage9-4-1/after-en-200.png) |
| RU normal | [PNG](../../.playwright-mcp/stage9-4-1/before-ru-100.png) | [PNG](../../.playwright-mcp/stage9-4-1/after-ru-100.png) |
| EN normal | [PNG](../../.playwright-mcp/stage9-4-1/before-en-100.png) | [PNG](../../.playwright-mcp/stage9-4-1/after-en-100.png) |

### Focused regression / checks

Добавлен [footer-reflow.browser.test.mjs](../../test/footer-reflow.browser.test.mjs): **6/6 PASS**, RU/EN на трёх страницах, 320 px / 200%. Test проверяет отсутствие Footer overflow, семь keyboard-reachable links и document width на Homepage/Timeline. Для Map не выдаёт успешный Footer test за устранение общего document overflow.

Suite использует те же `REFLOW_PLAYWRIGHT_MODULE`, `REFLOW_BROWSER_PATH`, optional `REFLOW_BASE_URL`, что browser tests Stage 9.4; новых зависимостей нет.

| Check                              | Результат                                                         |
| ---------------------------------- | ----------------------------------------------------------------- |
| Focused regression                 | 6/6, [log](../../.playwright-mcp/stage9-4-1/regression-tests.log) |
| Scoped ESLint: Footer / новый test | Exit 0, [log](../../.playwright-mcp/stage9-4-1/eslint.log)        |
| Typecheck                          | Exit 0, [log](../../.playwright-mcp/stage9-4-1/typecheck.log)     |
| Formatting / syntax                | Prettier scoped files; `node --check` новых scripts               |
| Build / generate                   | Не запускались: только scoped CSS, live layout проверен           |

### Ограничения на момент завершения Stage 9.4.1

На Map при text 200% переполняются фильтр «Память 7» / «Memory 7» и отдельные длинные Place links. Это было **до** Footer fix и воспроизводится после; точные owners/bounds сохранены в summary. Map/markers/типографика не изменялись по прямому ограничению задачи. Для полного site-wide text zoom reflow понадобится отдельно согласованный map UI fix; он не начат. Таким образом, Footer criterion закрыт, но утверждение «все документы сайта без горизонтального скролла при 200%» по-прежнему недопустимо.

Прежние ограничения Chromium, root font-size probe вместо native zoom, отсутствие NVDA/VoiceOver/Safari/Firefox и Node 26 вместо declared Node 22 сохраняются. Container query проверен в Chromium.

Файлы этого дополнения: SiteFooter.vue; новый browser regression test, QA script/evidence; этот отчёт. Другие corrective batches не выполнялись.

**STAGE 9.4 — AWAITING FINAL REVIEW.** Stage 9 IN PROGRESS. Stage 9.5 не начат.

## Дополнение Stage 9.4.2 — Map text zoom overflow

### Измерения и root cause

До изменений выполнены новые измерения на живом Yandex JS API, без fallback. В RU документ расширялся до **470 px**, в EN — до **469 px**, при viewport 320 и 390 / text 200%. При 100% ширина документа совпадала с viewport. [Исходные bounds](../../.playwright-mcp/stage9-4-2/before.json).

Причина находится в собственном UI, а не в Yandex Maps:

- `.map-page__layers` — flex без переноса; кнопки с `white-space: nowrap` не помещались в доступные 256/326 px. На 390/200% правая граница «Память 7» была **469.89 px**, «Memory 7» — **468.88 px**.
- `.map-page__index a` — `inline-flex` без ограничения ширины и аварийного переноса длинных слов. На 320/200% отдельные ссылки выходили до **349.30 px**.
- Открытая карточка обнаружила дополнительный внутренний дефект: min-content ширина категории в верхнем flex-ряду вытесняла кнопку закрытия (RU 390/200% right **434.61 px**). Существующее ограничение области карты скрывало этот выход; оно не считалось исправлением.

### Минимальные изменения

- [map.vue](../../app/pages/map.vue): разрешён перенос ряда фильтров. Локальная container query toolbar при доступной ширине `< 16rem` разрешает естественную ширину кнопок и перенос строки/текста. При 200% rem-порог увеличивается вместе с текстом, при обычных 320/390 px он не срабатывает. Ссылки списка ограничены шириной родителя, длинные слова переносятся через `overflow-wrap: anywhere`.
- [MapPlaceCard.vue](../../app/components/MapPlaceCard.vue): только мобильные правила переноса текста; категория может сжиматься, link/toggle ограничены доступной шириной. Разметка, размеры, типографика и дизайн карточки сохранены.

Не добавлены clipping, глобальные стили, таймеры или обработчики. Museum Graphite, API, данные/маркеры/fan-out, фильтрация, URL/history, Hero, Header, Footer и Timeline не менялись.

### Live QA и regression

Chromium / `http://localhost:3042`, после hydration и загрузки API. Text resize — root `font-size: 200%`, **не native browser zoom**.

| Проверка                                     | Результат                                                                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| RU/EN × 320/390 × text 100/200%              | **8/8 конфигураций**, document width = viewport                                                                                            |
| Карточка закрыта / компактная / раскрыта     | Все **24 мобильных состояния** без горизонтального скролла документа                                                                       |
| RU/EN desktop 1440 / 100%, закрыта и открыта | **2/2 конфигураций**, 4 состояния без overflow                                                                                             |
| Обычный масштаб                              | Bounds фильтров, кнопок, map frame и список выступающих элементов точно совпадают с before во всех 6 конфигурациях, включая desktop        |
| Фильтры                                      | Enter/Space, `aria-pressed`, список **13/6/7**, возврат «Все» — PASS                                                                       |
| Маркеры / карточка                           | Keyboard Enter открывает; ссылка доступна focus; touch раскрывает; Escape закрывает; click/tap повторно открывает и закрывает — PASS       |
| Интерактивность API                          | RU/EN 390/1440: touch-pan на mobile, mouse-drag на desktop, wheel zoom в обеих ширинах реально изменяют координаты маркеров — **4/4 PASS** |
| Атрибуция                                    | Штатные ссылки Yandex в живом API сохранены; provider DOM не изменялся                                                                     |
| Runtime                                      | `pageerror` не найден; отдельный render probe без console errors, с существующим dev warning о повторной метке i18n timer                  |

Evidence: [after](../../.playwright-mcp/stage9-4-2/after.json), [summary](../../.playwright-mcp/stage9-4-2/summary.json), [pan/zoom/attribution](../../.playwright-mcp/stage9-4-2/interactions.json), [render probe](../../.playwright-mcp/stage9-4-2/render-probe.json). [QA script](../../.playwright-mcp/stage9-4-2-map-qa.mjs), [interaction script](../../.playwright-mcp/stage9-4-2-map-interactions.mjs).

### Скриншоты до/после

Первые screenshots были сняты до завершения отрисовки векторной подложки. Финальные изображения пересняты с ожиданием 12 секунд: [capture script](../../.playwright-mcp/stage9-4-2-screenshots.mjs). До/после используют одну страницу, одну камеру и выбранное место; исходные CSS восстанавливаются **только в браузере QA**. Измерения before.json получены до изменения production-файлов. Все версии 100%, desktop и раскрытой карточки находятся в [evidence directory](../../.playwright-mcp/stage9-4-2/); имена: `{before|after}-{ru|en}-{320|390|1440}-{100|200}-{closed|open|expanded}.png` (expanded только mobile, desktop только 100%).

| Состояние 200%   | До                                                                   | После                                                               |
| ---------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| RU 320, закрыта  | [PNG](../../.playwright-mcp/stage9-4-2/before-ru-320-200-closed.png) | [PNG](../../.playwright-mcp/stage9-4-2/after-ru-320-200-closed.png) |
| RU 320, карточка | [PNG](../../.playwright-mcp/stage9-4-2/before-ru-320-200-open.png)   | [PNG](../../.playwright-mcp/stage9-4-2/after-ru-320-200-open.png)   |
| EN 320, закрыта  | [PNG](../../.playwright-mcp/stage9-4-2/before-en-320-200-closed.png) | [PNG](../../.playwright-mcp/stage9-4-2/after-en-320-200-closed.png) |
| EN 320, карточка | [PNG](../../.playwright-mcp/stage9-4-2/before-en-320-200-open.png)   | [PNG](../../.playwright-mcp/stage9-4-2/after-en-320-200-open.png)   |
| RU 390, закрыта  | [PNG](../../.playwright-mcp/stage9-4-2/before-ru-390-200-closed.png) | [PNG](../../.playwright-mcp/stage9-4-2/after-ru-390-200-closed.png) |
| RU 390, карточка | [PNG](../../.playwright-mcp/stage9-4-2/before-ru-390-200-open.png)   | [PNG](../../.playwright-mcp/stage9-4-2/after-ru-390-200-open.png)   |
| EN 390, закрыта  | [PNG](../../.playwright-mcp/stage9-4-2/before-en-390-200-closed.png) | [PNG](../../.playwright-mcp/stage9-4-2/after-en-390-200-closed.png) |
| EN 390, карточка | [PNG](../../.playwright-mcp/stage9-4-2/before-en-390-200-open.png)   | [PNG](../../.playwright-mcp/stage9-4-2/after-en-390-200-open.png)   |

### Focused checks и ограничения

Добавлен [map-reflow.browser.test.mjs](../../test/map-reflow.browser.test.mjs): реальные layout assertions документа, фильтров, длинных ссылок и действий карточки; RU/EN × 320/390 / 200%, с живыми маркерами. Дополнительно ограничена высота кнопок фильтров, чтобы исключить перенос по одной букве. Измерение раскрытой карточки ожидает окончания штатной CSS-анимации шеврона: промежуточный поворот SVG временно увеличивает scrollWidth кнопки, не расширяя документ. Использует прежние `REFLOW_PLAYWRIGHT_MODULE`, `REFLOW_BROWSER_PATH`, optional `REFLOW_BASE_URL`, без новых dependencies.

| Check                      | Результат                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| Focused browser regression | **4/4 PASS**, [log](../../.playwright-mcp/stage9-4-2/regression-tests.log)                         |
| Scoped ESLint              | map.vue, MapPlaceCard.vue, новый test — exit 0, [log](../../.playwright-mcp/stage9-4-2/eslint.log) |
| Typecheck                  | Exit 0, [log](../../.playwright-mcp/stage9-4-2/typecheck.log)                                      |
| Formatting                 | Prettier scoped source/test/scripts/report                                                         |
| Build / generate           | Не запускались: CSS-only fix, реальные layout tests достаточны                                     |

Ограничения: Chromium, root font-size вместо native text zoom, без NVDA/VoiceOver/Safari/Firefox; mobile pan через Chromium touch events, pinch не проверялся. Node 26 вместо declared Node 22. Переполнение Map, оставленное Stage 9.4.1, закрыто в проверенной матрице. Это не заменяет новый site-wide аудит остальных маршрутов.

Изменённые файлы batch: map.vue, MapPlaceCard.vue; новый focused browser test; QA scripts/evidence; этот отчёт.

**STAGE 9.4 — READY FOR ACCEPTANCE.** Stage 9 IN PROGRESS. Stage 9.5 не начат.
