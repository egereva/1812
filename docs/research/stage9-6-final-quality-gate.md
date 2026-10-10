# Stage 9.6 — Final quality gate

Обновлено: 2026-10-10. **STAGE 9.6 — READY FOR ACCEPTANCE.**

## Stage 9.6.1 — итоговый вердикт

**QA-01 устранён и проверен на реальном Yandex Maps JS API 3.0.** Других блокирующих дефектов в адресной проверке карты не осталось. Stage 9.6 готов к приёмке; весь Stage 9 не объявляется принятым автоматически. Stage 10, generation, deployment и push не выполнялись.

Nuxt перезапущен с восстановленным локальным `.env` на Node **22.23.3**, npm **10.9.9**. `.env` игнорируется Git; ключ не выводился. Live QA выполнен на **http://localhost:3042**: с Referer `localhost` API отвечает HTTP 200; с `127.0.0.1` тот же ключ получает HTTP 403 / Invalid api key, а браузер — ERR_BLOCKED_BY_ORB. Это различие подтверждено адресными запросами, но настройки ограничения ключа в кабинете провайдера не инспектировались. Конфигурация ключа не менялась.

### Root cause и финальное исправление

Штатные distribution («Открыть Яндекс Карты») и attribution используют один нижний ряд: defaults `bottom left` и `bottom right`. При CSS viewport 320 px canvas имеет ширину 286 px, недостаточную для обоих элементов. Новое воспроизведение через официальный `map.update({ distributionPosition: 'bottom left' })` подтвердило конфликт: RU — пересечение кнопки со всей ссылкой условий **46.33 × 13.25 px** и логотипом **33.89 × 22 px**; EN — **33.28 × 13.25 px** и **25.89 × 22 px** соответственно. Затем положение восстановлено в `top left`. Это QA comparison прежнего SDK configuration, без checkout старого source и без модификации provider DOM.

Фильтры, SVG-маркеры, chooser и MapPlaceCard принадлежат приложению; distribution, логотип, copyright и условия принадлежат SDK. Загружается удалённый `https://api-maps.yandex.ru/v3/`; patch SDK не закреплён в lockfile, Yandex npm dependency отсутствует.

Официальные [YMapProps](https://yandex.com/maps-api/docs/js-api/ref/index.html#ymapprops) и [YMap.update](https://yandex.com/maps-api/docs/js-api/map/YMap.html#update) позволяют менять `distributionPosition`. Финальные изменённые файлы:

- `app/components/InteractiveMap.client.vue`: при canvas <480 CSS px кнопка переносится в `top left`, при ≥480 остаётся штатное `bottom left`; ResizeObserver учитывает resizing/native zoom и отключается при unmount. Узкий chooser начинается ниже верхнего ряда (`top: 3.5rem`); desktop chooser оставляет `3.5rem` снизу для provider controls.
- `app/utils/yandexMapsLoader.client.ts`: explicit types для используемых `distributionPosition` и `update`.
- `app/components/MapPlaceCard.vue`: live QA обнаружил, что высокая desktop card закрывала нижнюю attribution, tablet card заходила на нижнюю кнопку, а expanded mobile card — на верхнюю. Desktop max-height оставляет attribution свободной; на ≤850 px нижний зазор составляет `3.5rem`, на ≤600 px высота compact/expanded panel ограничена резервом верхнего и нижнего рядов (`100% - 7rem`, expanded также ≤75%). Меняется только предел высоты; содержимое остаётся доступным через scroll.
- `app/pages/map.vue`: mobile min-height теперь `min(25rem, calc(100svh - var(--header-height)))`. При коротком viewport 200% это позволяет разместить весь canvas под sticky header после revealSheet; обычная высота сохраняется.
- `test/map-controls.test.mjs`: RU/EN actual SFC lifecycle с controlled SDK — initial placement, переход через 480 px, возврат в narrow, отсутствие лишних updates, cleanup.
- `test/map-chooser-render.test.mjs`: actual template проверяет резерв верхнего ряда для narrow chooser.
- `test/map-reflow.browser.test.mjs`: existing live browser regression дополнен read-only проверкой пересечений provider links/control и application panels.
- Этот отчёт: актуальный вердикт и evidence.

Provider DOM/CSS, logo, copyright и условия не изменены и не скрыты. `copyrightsPosition` остаётся штатным. Museum Graphite, SVG, контент, координаты, camera и map behaviors сохранены. Nuxt DevTools overlay скрыт **только в QA browser**, чтобы служебная панель не перекрывала provider links.

### Native zoom и адресная матрица

Отдельный persistent **headed Chromium** profile на macOS Apple Silicon/Retina; `viewport: null`, официальный QA-only extension с `chrome.tabs.setZoom/getZoom`. Root font **16px**, visualViewport.scale **1** во всех случаях. CSS zoom, root text resize и page-scale emulation не применялись для native QA. Touch UI проверен через CDP touch input, без подмены размеров viewport.

| Native window width | Browser zoom | Actual CSS viewport | DPR | RU / EN     |
| ------------------- | ------------ | ------------------- | --- | ----------- |
| 500                 | 100%         | 500 × 862           | 2   | PASS / PASS |
| 1440                | 100%         | 1440 × 862          | 2   | PASS / PASS |
| 640                 | 200%         | **320 × 431**       | 4   | PASS / PASS |
| 1440                | 200%         | 720 × 431           | 4   | PASS / PASS |

**8/8 live scenarios PASS**, плюс повтор RU/EN CSS320 после финальной коррекции short-viewport min-height. При 100% минимальное native окно имеет ширину 500 px; CSS320 достоверно проверен при native 200%, а не объявлен физическим окном 320 px.

В каждом сценарии: отсутствие карточки → фильтры через Enter и membership **13/6/7** → реальный wheel map zoom и drag camera → marker Enter → card → Escape с возвратом focus → touch open/close → overlap group chooser и Escape. На narrow — также touch compact/expanded. Проверены геометрия и доступность центров кнопки/условий/логотипа через elementFromPoint, отсутствие пересечений с application panels и отсутствие horizontal document overflow во всех сохранённых состояниях. После финального short-viewport fix дополнительно проверено отсутствие пересечения кнопки со sticky header. Copyright также виден на финальных снимках. Page errors в успешной матрице — **0**. SDK и реальные tile endpoints возвращают HTTP 200; подложка визуально осмотрена.

[QA script](../../.playwright-mcp/stage9-6-1/live-qa.mjs), [8-case geometry/results](../../.playwright-mcp/stage9-6-1/live-results.json), [final CSS320 results](../../.playwright-mcp/stage9-6-1/live-results-captures.json), [live log](../../.playwright-mcp/stage9-6-1/live-qa.log), [final captures log](../../.playwright-mcp/stage9-6-1/captures.log). Старые снимки Stage 9.6 с другого компьютера не перенесены; исторические ссылки ниже сохранены. Новые evidence находятся локально в игнорируемой `.playwright-mcp/`.

### Скриншоты до/после

Native 200%, CSS320. Снимки получены прямым `Page.captureScreenshot`, без image editing: Playwright screenshot на сочетании Retina/native zoom обрезал кадр, поэтому для финального evidence использован native CDP capture.

| Состояние                             | RU                                                                 | EN                                                                 |
| ------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| До: прежнее bottom-left SDK placement | [PNG](../../.playwright-mcp/stage9-6-1/ru-narrow-200-before.png)   | [PNG](../../.playwright-mcp/stage9-6-1/en-narrow-200-before.png)   |
| После: без карточки                   | [PNG](../../.playwright-mcp/stage9-6-1/ru-narrow-200-none.png)     | [PNG](../../.playwright-mcp/stage9-6-1/en-narrow-200-none.png)     |
| После: compact card                   | [PNG](../../.playwright-mcp/stage9-6-1/ru-narrow-200-card.png)     | [PNG](../../.playwright-mcp/stage9-6-1/en-narrow-200-card.png)     |
| После: expanded card                  | [PNG](../../.playwright-mcp/stage9-6-1/ru-narrow-200-expanded.png) | [PNG](../../.playwright-mcp/stage9-6-1/en-narrow-200-expanded.png) |
| После: card закрыта                   | [PNG](../../.playwright-mcp/stage9-6-1/ru-narrow-200-closed.png)   | [PNG](../../.playwright-mcp/stage9-6-1/en-narrow-200-closed.png)   |
| После: chooser                        | [PNG](../../.playwright-mcp/stage9-6-1/ru-narrow-200-chooser.png)  | [PNG](../../.playwright-mcp/stage9-6-1/en-narrow-200-chooser.png)  |
| Desktop 100%: высокая card            | [PNG](../../.playwright-mcp/stage9-6-1/ru-desktop-100-card.png)    | [PNG](../../.playwright-mcp/stage9-6-1/en-desktop-100-card.png)    |

### Focused checks и ограничения

- **29/29** Map/index/chooser/control tests PASS; [log](../../.playwright-mcp/stage9-6-1/tests.log).
- **4/4** existing browser reflow tests с regression assertions PASS; [log](../../.playwright-mcp/stage9-6-1/reflow-tests.log). Эти четыре tests используют **text resize 200%** и отдельно названы; они не являются доказательством native zoom.
- `npm run typecheck` PASS на Node 22.23.3; [log](../../.playwright-mcp/stage9-6-1/typecheck.log). Scoped ESLint, Prettier изменённых файлов и `git diff --check` PASS.
- Полный Stage 9, full regression, build/generate, deployment и push не выполнялись.

Ограничения: Chromium automation, не Safari/Firefox, screen reader или физический телефон. При отдельных холодных загрузках внешний SDK не успевал загрузиться в существующий 12s timeout; штатный fallback работал, reload позволил продолжить. При resizing/zoom/pan зафиксированы отменённые `ERR_ABORTED` запросы тайлов; отсутствие всех сетевых cancellations не заявляется. Ограничения/API account settings не менялись, localhost/127.0.0.1 нельзя считать взаимозаменяемыми для этого ключа. Нужны реальные production origin/baseURL и новая release generation на Stage 10; эти ранее известные release условия не являются незакрытым QA-01. Изменения зависимостей или ключа не требовались.

**STAGE 9.6 — READY FOR ACCEPTANCE.** Ниже сохранён исходный аудит 2026-10-09 для истории; его BLOCKED и Node 26 environment notes не являются текущим вердиктом.

## Исходный аудит 2026-10-09 — историческая запись

### Первоначальный вердикт

**BLOCKED** — DOM/reflow и smoke проверки прошли, но визуальный native-zoom gate обнаружил **QA-01 (Medium)**: штатный Open Maps control перекрывает ссылку условий и часть логотипа Яндекса при CSS viewport 320 px. Необходима отдельная коррекция/проверка допустимого официального размещения элементов SDK; внутренний DOM/стили провайдера не изменены. До её закрытия нельзя заявить выполнение критерия «элементы управления не перекрываются».

Исправления Stage 9.2–9.5 приняты пользователем. Реальный origin/baseURL, новая release generation и проверка на поддерживаемой Node 22 также остаются условиями deployment. Stage 10 и deployment не выполнялись; Stage 9 не отмечен завершённым.

## Сверка со всеми исходными замечаниями Stage 9.1

Исходный аудит содержит 7 классифицированных дефектов. Evidence предыдущих принятых batches повторно используется там, где код и контракт не изменились.

| Issue / описание                             | Severity | Состояние                                                                   | Подтверждение                                                                                                                                                                                                                               | Действие до deployment                                                                                                                     |
| -------------------------------------------- | -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| A11Y-01: нет ручной остановки Hero           | High     | Исправлено                                                                  | [HeroSlider](../../app/components/HeroSlider.vue), [Stage 9.3 runtime/events/AX](stage9-3-hero-autoplay-control.md); новый smoke Pause → pagination без resume → Play, реальные autoplay events                                             | Сохранить принятые 6500/1100, reduced-motion priority; текущего corrective fix не требуется                                                |
| RSP-01: Timeline overflow RU 320 px          | Medium   | Исправлено                                                                  | [Timeline index](../../app/pages/timeline/index.vue): minmax(0), min-width и перенос; [Stage 9.4](stage9-4-responsive-accessibility.md); новый native zoom RU/EN, CSS 241/320/390/711 без document overflow                                 | Дополнительный code fix не требуется                                                                                                       |
| RSP-02: Header inaccessible при text 200%    | Medium   | Исправлено                                                                  | [Header](../../app/components/SiteHeader.vue) + scoped rules в main.css; Stage 9.4 keyboard/text-resize evidence; 24 новых native-zoom cases: menu toggle видим, Space/Tab/Shift+Tab/Escape и focus return работают                         | Дополнительный code fix не требуется                                                                                                       |
| SEO-01: отсутствуют canonical/hreflang       | Medium   | Implementation исправлен; production absolute URLs **ожидают конфигурации** | [useSiteSeo](../../app/composables/useSiteSeo.ts), [URL validation](../../shared/seo/config.ts), [Stage 9.5](stage9-5-seo.md): 136 configured SSR routes с reciprocal/self alternates, x-default и одним canonical                          | Реальный HTTPS origin + baseURL, generation и проверка actual production-configured HTML/XML обязательны; сейчас URL намеренно отсутствуют |
| SEO-02: нет OG/Twitter metadata              | Low      | Text/type/locale metadata исправлены; OG URL зависит от origin              | [usePageSeo](../../app/composables/usePageSeo.ts), Stage 9.5: 136 generated HTML с локализованными OG/Twitter, без duplicates                                                                                                               | После конфигурации проверить og:url; social image остаётся необязательным невыбранным материалом                                           |
| SEO-03: 14 групп duplicate title             | Low      | Исправлено                                                                  | Contextual section suffix в usePageSeo; Stage 9.5 generated suite подтверждает 136 уникальных title и description                                                                                                                           | Дополнительный code/content fix не требуется                                                                                               |
| FNC-01: NUXT_E7001/E7003 при locale prefetch | Low      | Исправлено                                                                  | Два scoped no-prefetch в [SiteHeader](../../app/components/SiteHeader.vue); [Stage 9.2](stage9-2-locale-navigation-fix.md): 8 static cases, hover/focus, switching/history/reload; новый static smoke: 4 locale round trips без diagnostics | Проверить final hosting/base path на Stage 10, не отключать prefetch глобально                                                             |

Дополнительные замечания/риски исходного аудита и найденные в corrective batches:

| Замечание                                                                         | Состояние и evidence                                                                                                           | До deployment                                                                           |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `/favicon.ico` 404 — optional polish, без severity/Issue ID в Stage 9.1           | Исправлено в source/SSR явной SVG icon link; 8 новых root/subpath tests. Старый output ещё даёт implicit favicon 404, см. ниже | Регенерировать текущий source перед публикацией                                         |
| Footer text-zoom overflow, Stage 9.4.1                                            | Принятый scoped fix; 24 Footer cases + 6 regression tests в Stage 9.4; native zoom документа теперь также без overflow         | Нет отдельного code fix                                                                 |
| Map text-zoom overflow, Stage 9.4.2                                               | Принятые filter/list/card reflow rules; 28 состояний + 4 browser tests; новые 8 native-zoom Map cases                          | Нет отдельного code fix                                                                 |
| Native browser zoom ранее не подтверждён                                          | Метод подтверждён; 24/24 scoped DOM/keyboard cases, visual QA-01 остаётся открытым                                             | Закрыть QA-01; полный visual gate не пройден                                            |
| Реальный host/origin/base path, redirects/headers/404/indexing                    | Не проверены на production, как и в Stage 9.1/9.5                                                                              | Обязательные действия Stage 10                                                          |
| Node 26 вместо declared Node 22                                                   | Ограничение среды сохраняется; текущие focused checks проходят                                                                 | Release verification на Node `>=22.22.2 <23`                                            |
| Screen readers, Safari/Firefox/реальные телефоны, сложный image/provider contrast | Предыдущий аудит не объявлял их полноценно проверенными; новые проверки только Chromium                                        | Ручные accessibility/cross-browser spot checks остаются рекомендацией перед публикацией |
| Native hidden-tab/visibilitychange Hero                                           | Не повторялось и не объявляется проверенным                                                                                    | Сохраняется ограничение предыдущего Hero QA; synthetic visibilityState не использован   |

## Favicon: причина и минимальный fix

Явной icon link не было, `/favicon.ico` отсутствует; Chromium делает implicit запрос. Новый code в общем `useSiteSeo` добавляет ровно один `rel="icon" type="image/svg+xml"` с `${app.baseURL}icons/1812-map-marker-filled.svg`.

Переиспользован **существующий утверждённый SVG-маркер** без изменения его байтов, цветов или геометрии. Новый логотип, raster asset или dependency не создавались. Root href: `/icons/1812-map-marker-filled.svg`; project href: `/1812/icons/1812-map-marker-filled.svg`.

[favicon-render.test.mjs](../../test/favicon-render.test.mjs): `/`, `/en/`, `/map`, `/en/map` на свежем root SSR server и под `/1812/`, **8/8 PASS**. Проверены document HTTP 200, одна icon link, точный base-aware href, icon HTTP 200, SVG MIME и byte equality с существующим public asset. Bare `/favicon.ico` не создан: современный браузер использует явную SVG link.

Static smoke использует **не регенерированный** output Stage 9.5. Он содержит старый head без новой favicon link: единичная console resource 404 точно от `http://localhost:3096/favicon.ico`, что установлено адресным [console-location probe](../../.playwright-mcp/stage9-6/resource-warning.json). Она не объявляется устранённой в старом artifact или отсутствующей вообще. Исправленный head проверен на текущем SSR source; стандартная Stage 10 generation перенесёт его в HTML. Полная generation ради одного head link не запускалась.

## Настоящий Chromium browser zoom

Использован **native per-tab zoom** через официальный [chrome.tabs.setZoom / getZoom](https://developer.chrome.com/docs/extensions/reference/api/tabs), в отдельном временном persistent Chromium profile с [QA-only extension](../../.playwright-mcp/stage9-6/zoom-extension/). Расширение не устанавливается в пользовательский Chrome и не является production dependency. [Playwright persistent extension guidance](https://playwright.dev/docs/chrome-extensions).

`viewport: null`: отсутствуют Playwright viewport/device emulation и `Emulation.setPageScaleFactor`. Не применялись CSS `zoom`, transform scale или изменение root font-size. Размер нативного окна задавался Chrome windows API / CDP `Browser.setWindowBounds`, затем browser zoom — строго `setZoom(tabId, 2)`. GetZoom, DOM metrics и DPR подтверждают результат:

| Native outer width                        | CSS width 100% | CSS width 200% | DPR   | Root font / visualViewport scale |
| ----------------------------------------- | -------------- | -------------- | ----- | -------------------------------- |
| 500 (запрошено 390, Chrome minimum width) | 482            | 241            | 1 → 2 | 16 px неизменны / 1              |
| 658                                       | 640            | 320            | 1 → 2 | 16 px неизменны / 1              |
| 798                                       | 780            | 390            | 1 → 2 | 16 px неизменны / 1              |
| 1440                                      | 1422           | 711            | 1 → 2 | 16 px неизменны / 1              |

Ширина окна, CSS viewport и root text resize — разные величины. Из-за browser minimum width не заявляется физическое окно 390 px: его actual ширина 500, а resulting CSS viewport 241. Это дополнение к CSS 320/390 и ordinary desktop case. Начальный [probe](../../.playwright-mcp/stage9-6/zoom-probe.json) отдельно подтверждает 1422 → 711 при `getZoom() === 2`, неизменном root font и `visualViewport.scale === 1`.

**24/24 scoped DOM/keyboard PASS:** RU/EN × Homepage/Timeline/Map × четыре размера native window. `document.scrollWidth <= innerWidth` до и после взаимодействий при 200%; menu toggle полностью видим, Space открывает, Tab/Shift+Tab работают, Escape закрывает и возвращает focus. Map использует реальный API, фильтры/список 13/7/13, marker Enter, compact/expanded card, focus ссылки и close/Escape. Новые native zoom console/page errors не обнаружены. **Это не полный visual PASS:** при осмотре снимков выявлен QA-01, который эти DOM assertions не проверяли.

Native-zoom Hero control дополнительно проверен в RU/EN на CSS 320 и 711: Pause/Play через Enter/Space реально меняет Swiper running; кнопка в viewport и не пересекается с pagination bullets (**4/4**). Старые полноценные autoplay/reduced-motion/lifecycle результаты Stage 9.3 повторно не запускались.

Шесть desktop cases первоначально остановились на Chrome extension window bounds restriction, до продуктовых assertions. Повторены **только эти шесть**, через native Browser.setWindowBounds. Успешные 18 narrow cases сохранены. Старый dev server отвечал 500 `worker exited with code 0`; новый изолированный server с текущим source устранил сбой среды. Это не потребовало product code fix и не считается воспроизведённым дефектом static deployment.

Evidence: [24 native cases](../../.playwright-mcp/stage9-6/native-zoom.json), [QA script](../../.playwright-mcp/stage9-6-native-zoom-qa.mjs), [Hero controls](../../.playwright-mcp/stage9-6/native-controls.json). Screenshots сделаны напрямую через CDP `Page.captureScreenshot` без clip: Playwright locator clip при native zoom обрезал physical кадр и не использован как визуальное доказательство.

Контрольные кадры native 200%, CSS viewport 320:

| Страница           | RU                                                                       | EN                                                                       |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Homepage / control | [PNG](../../.playwright-mcp/stage9-6/native-visible-ru-658-home.png)     | [PNG](../../.playwright-mcp/stage9-6/native-visible-en-658-home.png)     |
| Timeline           | [PNG](../../.playwright-mcp/stage9-6/native-visible-ru-658-timeline.png) | [PNG](../../.playwright-mcp/stage9-6/native-visible-en-658-timeline.png) |
| Map / place card   | [PNG](../../.playwright-mcp/stage9-6/native-visible-ru-658-map.png)      | [PNG](../../.playwright-mcp/stage9-6/native-visible-en-658-map.png)      |

Desktop counterparts используют `1440` вместо `658` в том же [evidence directory](../../.playwright-mcp/stage9-6/). Карта переснята после ожидания новых тайлов при выборе места; DevTools overlay скрыт только для QA captures. Native zoom в этой среде достоверно установлен, поэтому **MANUAL VERIFICATION REQUIRED не используется вместо выполненного теста**. Ограничения: headless Windows Chromium, не ручное нажатие toolbar zoom, не mobile pinch и не проверка OS accessibility settings.

## QA-01 — Medium — пересечение штатных элементов Yandex Maps

При осмотре реального native-zoom кадра `/map`, RU, outer window 658 / CSS viewport 320 / browser zoom 200%, видно пересечение кнопки «Открыть Яндекс Карты» с нижней attribution. Read-only [provider-probe.json](../../.playwright-mcp/stage9-6/provider-probe.json) подтверждает bounds в CSS px:

| Provider element                  | x…right    | y…bottom      |
| --------------------------------- | ---------- | ------------- |
| Open Maps button                  | 29…189.97  | 403.78…438.98 |
| «Условия», user-agreements anchor | 107.67…154 | 421.48…434.98 |
| Yandex logo anchor                | 163…293    | 416.98…440.98 |

Ссылка условий полностью находится внутри box кнопки; пересечение с логотипом составляет примерно **26.97 × 22 CSS px**. [Контрольный кадр](../../.playwright-mcp/stage9-6/native-visible-ru-658-map.png) показывает перекрытие. Карточка располагается выше этих элементов и не является источником: пересекаются штатные элементы SDK.

Нормальный CSS 320 comparison отдельно не выполнялся, поэтому этот результат не объявляется новым регрессом Stage 9.4 или проблемой исключительно zoom. Подтверждено конкретное native-zoom состояние, достаточное для незакрытого критерия quality gate. Возможности официального управления SDK необходимо проверить отдельно по [YMap documentation](https://yandex.ru/maps-api/docs/js-api/map/YMap.html), не придумывая свойства. В рамках Stage 9.6 provider DOM/CSS не редактировались, attribution не скрывалась, approved map design не менялся. Дефект требует адресного исправления и визуального повторного review перед READY FOR STAGE 10.

## Критический regression smoke

Строгий local static server без SPA fallback обслуживает уже существующий Stage 9.5 output по `http://localhost:3096`. **4/4 PASS**, RU/EN × 390/1440; это один короткий путь по основным сценариям, а не повтор полных Stage 9.4/9.5 suites.

- Hero: Enter pause, manual pagination сохраняет pause, Space resume; для RU/EN desktop зарегистрирован настоящий autoplay event.
- Header locale hover/focus → switch → Back: правильная locale и нет NUXT_E7001/E7003.
- Dictionary index → detail клавиатурой; Timeline → event detail; Map filters 13/6/7 → marker → card → «Подробнее» → правильная Places detail.
- Проверены H1 detail templates, internal route URLs и external source `target="_blank"`, `rel="noopener noreferrer"`. Внешние сайты не обходились повторно: проверен link contract, без заявления об их uptime.
- Нет pageerror, hydration exceptions или critical console diagnostics. Единственная generic resource 404 относится к implicit favicon в старом output, как описано выше; остальные наблюдавшиеся HTTP responses не дали ошибок.

Evidence: [smoke.json](../../.playwright-mcp/stage9-6/smoke.json), [smoke script](../../.playwright-mcp/stage9-6-smoke.mjs). Existing accepted evidence: [Stage 9.2](stage9-2-locale-navigation-fix.md), [Stage 9.3](stage9-3-hero-autoplay-control.md), [Stage 9.4](stage9-4-responsive-accessibility.md), [Stage 9.5](stage9-5-seo.md).

## Изменённые файлы и checks

Production change: **только `app/composables/useSiteSeo.ts`**, один favicon link. Новый focused test — `test/favicon-render.test.mjs`; этот отчёт; local QA scripts/extensions/config/evidence в `.playwright-mcp/stage9-6*`. Ни Header/Hero/maps/Footer, ни контент, палитры, маршруты или SEO URL contract не менялись. Ранее dirty файлы сохранены.

| Check                               | Результат                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| Favicon root tests                  | 4/4, [log](../../.playwright-mcp/stage9-6/favicon-root-tests.log)                             |
| Favicon `/1812/` tests              | 4/4, [log](../../.playwright-mcp/stage9-6/favicon-subpath-tests.log)                          |
| Native zoom                         | 24/24 scoped DOM/keyboard + 4 Hero control checks; visual gate BLOCKED (QA-01)                |
| Static smoke                        | 4/4, [log](../../.playwright-mcp/stage9-6/smoke.log)                                          |
| Typecheck                           | Exit 0, [log](../../.playwright-mcp/stage9-6/typecheck.log)                                   |
| Scoped ESLint                       | useSiteSeo + favicon test, exit 0, [log](../../.playwright-mcp/stage9-6/eslint.log)           |
| Formatting/syntax                   | Prettier changed source/test/report/QA; node --check scripts                                  |
| Full regression / static generation | Не запускались; accepted results переиспользованы, favicon проверен focused SSR/network tests |

Начальная попытка Node tests с process isolation остановилась на sandbox `spawn EPERM`; suite успешно выполнена с обычным для проекта `--experimental-test-isolation=none`.

## Открытые условия перед публикацией

**На 2026-10-09 QA-01 оставался открытым и блокировал gate.** Необходима адресная коррекция через допустимый официальный SDK/configuration подход с сохранением attribution и approved map appearance, затем проверка перекрытий/клавиатуры. CSS/DOM провайдера не изменены; область задачи не расширена.

Абсолютные production SEO URLs пока **не выпущены**, новые favicon tags пока **не перенесены в старый artifact**: нужны реальные deployment settings и новая generation. Поддерживаемая Node 22, host/root robots policy для project Pages, redirects/HTTP status/headers, actual configured static metadata и итоговый browser smoke остаются release условиями. Не выбран OG image; indexing/Search Console и screen-reader/cross-browser coverage не заявляются выполненными.

**Исторический статус 2026-10-09: BLOCKED / STAGE 9.6 — AWAITING REVIEW.** QA-01 закрыт адресным live QA 2026-10-10, см. текущий вердикт выше. Stage 10 не начат.
