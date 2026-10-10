# Stage 11 — Final production acceptance

Дата: 2026-10-10. Проверяемый сайт: **https://egereva.github.io/1812/**.
Deployment: `02cc29a7ab33a5dee9fbc70e09d236e42d169384`.

**STAGE 11 — BLOCKED**: QA11-01 в мобильном homepage map preview. Подробности и минимальное решение — в разделе 4.

## 1. Объём и evidence

Первичная приёмка выполнена в Chromium на опубликованном GitHub Pages сайте. В этом проходе исходный код, исторический контент, дизайн, API-ключ и настройки Яндекса не изменялись; commit, push и deployment не выполнялись. Текущее состояние последующей работы отмечено в разделе 8.

Новый проход покрывает 72 состояния: девять representative маршрутов × RU/EN × 320, 390, 768 и 1440 CSS px. Полный inventory из 136 страниц и проверки generated assets/reciprocal hreflang переиспользованы из успешного CI того же deployment и [Stage 10.1](stage10-1-github-pages-deployment.md). Предыдущие quality gates и объяснение QA-01 сохранены в [Stage 9.6](stage9-6-final-quality-gate.md). Полный набор тестов и static generation повторно не запускались.

Локальные scripts, JSON, logs и screenshots находятся в игнорируемой `.playwright-mcp/stage11/`; они не включаются в Git и не будут доступны из GitHub после публикации одного отчёта.

## 2. Разделы и RU/EN

| Раздел / representative маршрут          | RU            | EN            | Новый production результат                                                           |
| ---------------------------------------- | ------------- | ------------- | ------------------------------------------------------------------------------------ |
| Главная `/`, `/en/`                      | FAIL: QA11-01 | FAIL: QA11-01 | Навигация/Hero/Footer работают; mandatory attribution в mobile map preview перекрыта |
| Dictionary `/dictionary`                 | PASS          | PASS          | Контент и ссылки; адаптивная страница                                                |
| Dictionary detail `/dictionary/berezina` | PASS          | PASS          | Утверждённая композиция заголовка, изображение, подпись и связанные материалы        |
| Timeline `/timeline`                     | PASS          | PASS          | Страница и внутренние ссылки без переполнения                                        |
| Timeline detail `/timeline/borodino`     | PASS          | PASS          | H1, текст, локальные изображения и attribution                                       |
| Map `/map`                               | PASS          | PASS          | Реальные SDK/тайлы, группы маркеров, фильтры и карточки                              |
| Place detail `/places/kutuzov-hut`       | PASS          | PASS          | Изображения, подписи, историческое уточнение, связанные страницы                     |
| About `/about`                           | PASS          | PASS          | Локализованный контент, семантика и Footer                                           |
| Sources `/sources`                       | PASS          | PASS          | Каталог источников, доступные подписи ссылок; внешняя доступность — см. ограничения  |

Все 72 прямых открытия ответили HTTP 200. Ошибок JavaScript/Console, отсутствующих изображений и горизонтального переполнения в этой матрице не обнаружено. На каждой странице ровно один H1; у изображений приложения есть alt, у проверенных кнопок — текст или доступная подпись.

Новый отдельный navigation pass: **9/9** RU → EN → RU, browser Back/Forward и reload PASS, включая главную, Map и detail-страницы. Ошибок `NUXT_E7001/E7003` не возникло. Собранные **149 уникальных внутренних href** используют `/1812` или `/1812/…`, без двойного `/1812/1812/`. Полная проверка разрешения generated references сохранена в CI Stage 10.1; все 136 detail/index страниц заново в браузере не обходились.

Пять существующих focused content tests прошли: production counts, обязательные данные/источники, разрешение связей, detail-route inventory и строгий RU/EN parity IDs/slugs/sources/structural history. Это проверка действующих contracts, без переоценки исторических фактов.

Evidence: [responsive JSON](../../.playwright-mcp/stage11/responsive-results.json), [navigation и menu](../../.playwright-mcp/stage11/interactions-results.json), [content contracts](../../.playwright-mcp/stage11/content-contracts.log).

## 3. Responsive и accessibility

| Проверка                             | Результат                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| 320 / 390 / 768 / 1440 CSS px, RU/EN | 72/72 PASS; document overflow отсутствует                                                         |
| Мобильное меню                       | Space, Tab, Shift+Tab, Escape; закрытие и возврат фокуса на menu button PASS на 320/390/768 RU/EN |
| Hero                                 | Space/Enter переключают Pause/Play и доступную подпись; focus-visible с outline присутствует      |
| Reduced motion                       | При `prefers-reduced-motion: reduce` playback control отключён согласно существующему контракту   |
| Семантика                            | Один H1, html lang, alt изображений приложения, названия кнопок и Footer проверены                |
| Map keyboard/touch                   | Enter/фильтры, Escape/возврат фокуса, touch открытие/закрытие и раскрытие мобильной карточки PASS |
| Native browser zoom                  | Измеренные 100%/200% в headed Chromium; root font-size не менялся                                 |

Native zoom задавался временным QA-расширением через `chrome.tabs.setZoom`, результат подтверждён `getZoom`. Это настоящее масштабирование браузера: на Retina DPR **2 → 4**, root font-size **16px**, visualViewport.scale **1**. При 200% окно шириной 640 px даёт CSS viewport **320 × 431**, окно 1440 px — **720 × 431**. При 100% native map pass использовал CSS viewport 500 и 1440 px; стандартный browser pass отдельно покрывает CSS 320/390/768/1440.

Новый production native pass: **8 map cases** RU/EN × narrow/desktop × 100%/200%, плюс **12 случаев** главной, Dictionary detail и Timeline detail RU/EN при 200% на CSS 320/720. Переполнения документа нет. Карточки/chooser и обязательные элементы Яндекса проверены отдельно, включая expanded mobile card.

Первичный быстрый DOM probe успевал читать закрытие меню/карточки до окончания transition. Итоговый navigation/native pass ждёт завершения закрытия и подтверждает правильный результат. Это не дефект интерфейса. Полностраничные screenshots главной снимаются после прокрутки, чтобы активировать существующие reveal и deferred map loading.

Evidence: [native map](../../.playwright-mcp/stage11/native-results.json), [native pages](../../.playwright-mcp/stage11/native-pages-results.json).

Визуальные примеры: [RU 320 Hero](../../.playwright-mcp/stage11/ru-home-320.png), [RU 390 Dictionary detail](../../.playwright-mcp/stage11/ru-dictionary-berezina-390.png), [EN 768 Dictionary detail](../../.playwright-mcp/stage11/en-dictionary-berezina-768.png), [RU 1440 full homepage](../../.playwright-mcp/stage11/ru-home-1440.png), [EN Place detail и Footer](../../.playwright-mcp/stage11/en-places-kutuzov-hut-1440.png).

## 4. Production Yandex Maps

На обеих локалях реальный SDK отвечает HTTP 200. В адресном map-catalog pass получено **185 RU / 149 EN** tile responses, все завершённые ответы HTTP 200. Проверено соответствие **всех 13 индивидуальных мест** catalog titles после раскрытия overlapping groups. Семь representative pins в исходном fit view — утверждённая группировка, а не потеря мест.

Фильтры All / 1812 / Memory дают **13 / 6 / 7** мест и правильный `aria-pressed`. Wheel изменяет фактический SDK zoom; drag изменяет center. Enter открывает карточку; Escape закрывает с возвратом фокуса; close button и touch работают. Read more ведёт на локализованный `/1812/[en/]places/…`; browser Back возвращает работающую карту.

В native cases проверены состояния без выбора, compact/expanded card, closed card и chooser. Geometry checks и hit testing подтверждают: кнопка Яндекса, «Условия»/Terms и логотип доступны; карточка, chooser и Header их не перекрывают. QA-01 не воспроизводится. DOM, CSS, логотип и copyright провайдера не изменялись. QA observer SDK только считывает instance, сохраняя оригинальные constructor/options.

### Новый дефект QA11-01 — homepage map preview

Отдельный deferred preview на главной загружается RU/EN: SDK/тайлы HTTP 200, 13 marker elements, keyboard link открывает `/map`. Новый pass на 390 и 1440 px прошёл **4/4**. Один предыдущий запуск остановился на ожидании ready (30 s); при повторе без изменений все четыре fresh contexts прошли. Причина единичного timeout не установлена; он не считается исправленным кодовым дефектом.

При визуальной проверке обнаружено **перекрытие обязательной attribution встроенной distribution button в mobile homepage preview**. Отдельный geometry pass: RU/EN 320 px при 100% — перекрыты Terms/«Условия» и часть логотипа; RU/EN 390 px при 100% — перекрыта Terms/«Условия»; RU/EN 1440 px при 100% — пересечений нет. При **настоящем browser zoom 200%, CSS 320 px** дефект повторяется в обеих локалях, font-size остаётся 16px, DPR 4. В общей сложности **6 FAIL / 2 PASS**; центр Terms недоступен для hit testing в четырёх 320 px cases. Это самостоятельная production проблема, хотя `/map` прошла QA.

Root cause: `app/components/HomepageMapCanvas.client.vue` создаёт отдельный `YMap` без `distributionPosition` и без resize adaptation. Default SDK placement остаётся снизу слева. Исправление Stage 9.6.1 применено только к `InteractiveMap.client.vue` и потому не охватывает homepage preview. Встроенная кнопка, Terms/copyright и логотип принадлежат Яндексу; canvas и overlay link — приложению. Preview link уже освобождает нижние 56 px; обнаруженное пересечение происходит между элементами провайдера.

Минимальное предлагаемое решение после согласования: применить в `HomepageMapCanvas.client.vue` существующий pattern full Map — официальный `distributionPosition: 'top left'` при ширине **самого canvas < 480 px**, иначе `'bottom left'`; обновлять через SDK `map.update` при ResizeObserver и отключать observer при destroy/unmount. Сохранить camera, palette, markers, hover, preview link и provider DOM. Порог по canvas важен: homepage preview занимает колонку, а не весь viewport. Затем focused homepage-map regression и production-equivalent visual/native QA; публикация отдельно по согласованию. Исправление автоматически не внесено, поскольку mandatory attribution conflict является блокирующим дефектом и требует сначала evidence/решения по условиям этой приёмки.

Evidence: [preview live results](../../.playwright-mcp/stage11/preview-results.json), [provider geometry/hit test](../../.playwright-mcp/stage11/preview-attribution-results.json), [EN 390 — перекрыта Terms](../../.playwright-mcp/stage11/en-home-preview-390.png), [RU 320 — button/attribution conflict](../../.playwright-mcp/stage11/ru-preview-attribution-320-100.png), [EN native 200% — Terms скрыта, логотип перекрыт](../../.playwright-mcp/stage11/en-preview-attribution-320-native-200.png).

Ожидаемые `net::ERR_ABORTED` при замене тайлов/навигации не считались ошибками загрузки. Непредусмотренных request failures и page errors в native pass нет; Console/page errors в отдельном map-catalog pass отсутствуют.

Evidence: [map catalog QA](../../.playwright-mcp/stage11/production-map-final-acceptance.json), [RU live map](../../.playwright-mcp/stage11/production-ru-map-acceptance.png), [EN live map](../../.playwright-mcp/stage11/production-en-map-acceptance.png), [RU native 200% expanded card](../../.playwright-mcp/stage11/ru-narrow-200-expanded.png), [EN native 200% card](../../.playwright-mcp/stage11/en-narrow-200-card.png).

## 5. SEO, assets и GitHub Pages

Новый responsive pass проверяет production canonical, title, description и правильный html lang на 18 representative URLs (каждый на четырёх ширинах). Нет localhost, placeholder origin или двойного base path. Reciprocal RU/EN hreflang, favicon, CSS/JS paths и разрешение всех generated assets покрыты CI того же HEAD и предыдущим production smoke; без изменения публикации эти проверки не дублировались полностью.

Новая загрузка `/1812/sitemap.xml` — HTTP 200, **136 production URL** с правильным origin/base path. `/1812/robots.txt` — HTTP 200, правильная ссылка на production sitemap. Отсутствие origin `/robots.txt` остаётся известным ограничением GitHub Pages project site из Stage 10.1; project robots не задаёт host-wide policy.

GitHub API повторно подтвердил [run 38071298979](https://github.com/egereva/1812/actions/runs/38071298979): **completed / success**, build и deploy successful, HEAD `02cc29a7ab33a5dee9fbc70e09d236e42d169384`. Workflow использует Node 22.23.3, production origin/baseURL и официальный Pages artifact/deploy механизм.

Новых блокирующих JavaScript/hydration errors или HTTP failures assets сайта не обнаружено. Проверялись функциональная загрузка и явные визуальные проблемы; Lighthouse/performance budget, поисковая индексация и полный cross-browser/screen-reader audit не заявляются.

## 6. Внешние ссылки и severity

Проверены **68 уникальных внешних ссылок приложения**, собранных с representative страниц: HTTP 200 — **24**, HTTP 401 — **4**, HTTP 429 — **37**, timeout/network без подтверждённого статуса — **3**. После rate limiting массовые повторные запросы не выполнялись. Chromium отдельно открыл `File:Hess_Berezina.jpg` с HTTP 200, хотя API-request получил 429; HTTP 429 не доказывает, что ссылка сломана.

| Severity / ID                 | Evidence и влияние                                                                                                                                                                                                                                                                                                                                                                | Решение / следующий шаг                                                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BLOCKER / QA11-01             | Mobile homepage preview: обязательные элементы Яндекса перекрывает встроенная кнопка. Full Map исправлена; homepage использует отдельную конфигурацию                                                                                                                                                                                                                             | Применить официальный responsive distributionPosition pattern к preview после согласования; см. root cause и proposal выше                                                                          |
| MAJOR                         | Не обнаружены                                                                                                                                                                                                                                                                                                                                                                     | —                                                                                                                                                                                                   |
| MINOR / EXT-01                | БРЭ: `bigenc.ru/c/otechestvennaia-voina-1812-30a318`, `old.bigenc.ru/literature/text/2627091`, `old.bigenc.ru/military_science/text/3144308`, `old.bigenc.ru/military_science/text/3490357` отвечают HTTP 401 в среде QA. Новый Chromium также получил пустой HTTP 401 на первой ссылке. Часть внешних источников недоступна здесь; страницы проекта и остальной каталог работают | Это внешняя доступность; причина на стороне сервиса/доступа не установлена. Проверить в обычном пользовательском браузере/сети. Не заменять исторические source URLs без редакционного согласования |
| Ограничение проверки / EXT-02 | Wikimedia HTTP 429 и три неподтверждённых network timeout                                                                                                                                                                                                                                                                                                                         | Полную доступность внешних сайтов не объявляем PASS. Отдельная проверенная Wikimedia ссылка открылась; необходимость обхода ограничений не предполагается                                           |
| ENHANCEMENT                   | Новые функции и редизайн не предлагались                                                                                                                                                                                                                                                                                                                                          | Вне объёма приёмки                                                                                                                                                                                  |

Обязательные внешние ссылки провайдера проверялись на доступность в карте. Один из provider-owned links не содержит явного `rel=noopener` в DOM; приложение его не изменяет. Диагностический общий link probe пометил это, но изменение обязательного UI Яндекса не требуется и не выполнялось.

Evidence: [external HTTP results](../../.playwright-mcp/stage11/external-links-results.json), [Chromium confirmation](../../.playwright-mcp/stage11/external-browser-results.json), [проблемное состояние БРЭ — пустой HTTP 401](../../.playwright-mcp/stage11/external-bigenc.png), [открывшаяся Wikimedia страница](../../.playwright-mcp/stage11/external-commons.png).

## 7. Изменённые файлы и вердикт

В первичном проходе добавлен только `docs/research/stage11-final-acceptance.md`. QA evidence остаётся локальным и игнорируемым. Код и зависимости в этом проходе не менялись; повторные typecheck/ESLint/generate не запускались без основания. Focused content checks **5/5 PASS**; scoped Prettier отчёта PASS.

**STAGE 11 — BLOCKED**

Причина: QA11-01 — перекрытие обязательной attribution в мобильном preview карты на главной. Основная карта, навигация, локализация и остальные адресные проверки прошли, но требование о доступности mandatory provider elements выполнено не на всех production поверхностях. До исправления и повторной адресной проверки готовность к демонстрации не подтверждается.

Проект окончательно завершённым не отмечен. Для снятия блокировки нужна подтверждённая preview-коррекция и адресная проверка опубликованной версии.

## 8. Сохранение готовой документации — 2026-10-10

По отдельному запросу пользователя к отправке подготовлены этот отчёт и корневой `CONTENT_GUIDE.md`. Руководство описывает реальные поля, существующие команды, редакционные ограничения и действия, требующие разработчика; исторические JSON не менялись.

Последующий corrective pass был прерван до live browser QA и публикации. Локальные изменения `app/components/HomepageMapCanvas.client.vue`, `app/components/HomepageMapPreview.vue` и `test/homepage-map.test.mjs` остаются незакоммиченными и **не входят** в документационный commit. Адресные unit tests прошли 22/22, но это не подтверждает устранение QA11-01 в браузере или production. Исходный production blocker остаётся открытым.

Текущий статус: **STAGE 11 — BLOCKED**. Отправка документации не означает принятие этапа или публикацию исправления. Существующий push-triggered workflow может пересобрать сайт из прежнего исходного кода; это также не снимает блокировку. `.env`, ключи, временные файлы и `.playwright-mcp/` не включаются в commit.
