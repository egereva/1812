# Stage 9.1 — Site-wide SEO, accessibility & responsive audit

Дата: 2026-10-09. **STAGE 9.1 — AUDIT COMPLETE / AWAITING REVIEW.**

AUDIT ONLY. Production-код, исторический контент, дизайн, зависимости и roadmap не изменены. Stage 9 в целом не завершён; deployment не выполнялся. Исправления ниже — рекомендации для отдельного согласования.

## 1. Executive summary

Подтверждены **7 проблем: Critical — 0, High — 1, Medium — 3, Low — 3**. Риски и ограничения среды в это число не включены.

| ID      | Severity | Проблема                                                                   |
| ------- | -------- | -------------------------------------------------------------------------- |
| A11Y-01 | High     | Нет явного пользовательского управления остановкой autoplay Hero           |
| RSP-01  | Medium   | RU-хронология переполняет экран 320 px                                     |
| RSP-02  | Medium   | При увеличении текста до 200% управление шапкой выходит за мобильный экран |
| SEO-01  | Medium   | На всех страницах отсутствуют canonical и hreflang                         |
| SEO-02  | Low      | На всех страницах отсутствуют Open Graph / Twitter metadata                |
| SEO-03  | Low      | 14 групп одинаковых title: 28 страниц без различения раздела               |
| FNC-01  | Low      | Предзагрузка переключателя языка вызывает NUXT_E7001/E7003 в static output |

Главные риски: доступность непрерывной автоматической смены изображений, доступность меню при увеличенном тексте, отсутствие документированного bilingual SEO. Ошибки Nuxt подтверждены, но **не блокируют фактическое переключение языка**; это дефект prefetch, а не потеря маршрута.

### Объём и методика

- Свежий статический output: **136 страниц**, по 68 на язык; 12 основных страниц и 124 detail-страницы. Каталоги: 29 Dictionary, 20 Timeline, 13 Places на язык.
- Автоматический responsive/DOM/CDP Accessibility audit: **96 случаев** — 12 шаблонов × RU/EN × 320/390/768/1440 px, с выборкой начала, середины и конца страницы.
- Шаблоны: `/`, `/dictionary`, `/dictionary/barclay-de-tolly`, `/dictionary/grand-army`, `/timeline`, `/timeline/council-fili`, `/map`, `/places/kutuzov-hut`, `/places/triumphal-arch`, `/places/kutuzov-monument`, `/about`, `/sources`; соответствующие `/en`-маршруты.
- Интерактивные проверки: восемь комбинаций языка и ширины; дополнительная точечная проверка клавиатуры карты, history, смены языка и prefetch в static output.
- Playwright Chromium; static output обслуживался по `http://localhost:3091` без SPA fallback. Часть live API / interactive checks — на dev-сервере `http://localhost:3042`, после гидратации Vue. Это локальные адреса, не production domain.
- Один успешно завершённый generate понадобился потому, что старый output предшествовал последнему исправлению Hero. Повторного успешного generate и полного Stage 6/7 QA не было.

Исходные результаты: [static SEO](../../.playwright-mcp/stage9-1/static-seo.json), [responsive](../../.playwright-mcp/stage9-1/responsive.json), [interactions](../../.playwright-mcp/stage9-1/interactions.json), [live confirmation](../../.playwright-mcp/stage9-1/confirmation.json), [static follow-up](../../.playwright-mcp/stage9-1/final-evidence.json).

## 2. Responsive findings

### RSP-01 — Medium — переполнение RU-хронологии

- **Раздел / маршрут:** Timeline, `/timeline`.
- **Viewport / язык:** 320 px, RU; на 390/768/1440 px и EN в проверенной матрице не воспроизведено.
- **Фактически:** `documentElement.clientWidth = 320`, `scrollWidth = 339`. Карточка «Сражение под Малоярославцем» выходит за правую границу; переполняются заголовок и связанная колонка с описанием/изображением.
- **Ожидается:** обычный текстовый контент и иллюстрация помещаются без горизонтальной прокрутки.
- **Воспроизведение:** открыть `/timeline` на 320 px, прокрутить к Малоярославцу; измерить ширину документа и правую границу карточки.
- **Evidence:** [скриншот](../../.playwright-mcp/stage9-1/issue-timeline-ru-320.png), `timeline-cause` в [static follow-up](../../.playwright-mcp/stage9-1/final-evidence.json), `timeline-normal` в confirmation.
- **Причина:** длинное слово в заголовке 36 px увеличивает минимальную ширину grid-колонки. У `.timeline-event--wide .timeline-event__body` используется `grid-template-columns: 1fr`; автоматический минимум трека/дочернего текста не обеспечивает перенос длинного слова. Ширина body 264 px, текст доходит до ~338.5 px от левого края viewport.
- **Минимальное исправление:** локально разрешить сжатие wide-колонки и перенос длинных слов (`minmax(0, 1fr)`, при необходимости `min-width: 0` и `overflow-wrap` у заголовка). Не скрывать переполнение и не менять исторический текст; не уменьшать типографику остальных разрешений.

### RSP-02 — Medium — text resize 200% скрывает управление шапкой

- **Раздел / маршрут:** глобальная шапка; воспроизведено на `/dictionary/barclay-de-tolly` и `/en/dictionary/barclay-de-tolly`.
- **Viewport / язык:** 320 и 390 px, RU/EN. Дополнительно на RU 768/1440 px обнаружено небольшое переполнение текста; эти страницы требуют контрольной проверки при исправлении.
- **Фактически:** после удвоения корневого размера текста ширина документа становится 454 px. На 320 px языковой блок заканчивается около 357.8 px, кнопка меню — около 453.8 px; меню находится вне видимой области.
- **Ожидается:** при увеличении текста до 200% языки и меню остаются доступны; текст переносится без потери управления.
- **Воспроизведение:** на указанной странице установить `document.documentElement.style.fontSize = '200%'`, затем проверить шапку и `clientWidth/scrollWidth`. Это воспроизводимый **text-resize probe**, а не утверждение о проверке нативного browser zoom.
- **Evidence:** [RU](../../.playwright-mcp/stage9-1/issue-text-200pct-ru-320.png), [EN](../../.playwright-mcp/stage9-1/issue-text-200pct-en-320.png), размеры `text-resize` в static follow-up; `text-200pct` в confirmation.
- **Причина:** сумма логотипа, rem-размеров language links и несжимаемой кнопки меню превышает мобильную ширину. `.site-header__actions` сохраняет intrinsic minimum; два language links становятся по 80 px.
- **Минимальное исправление:** локальная адаптация размещения управления при увеличенном тексте, с переносом/дополнительной строкой при необходимости; сохранить доступный размер текста, focus и согласованное scroll-поведение Header. Отдельно проверить длинные слова в основном тексте; не маскировать проблему `overflow-x: hidden`.

Остальные проверенные обычные состояния: горизонтальное переполнение не найдено. Карточка карты на 320/390 px имеет внутренний скролл; раскрытая высота ~74.7% карты, нижний резерв около 57 px. Основные действия остаются видимыми. Реальная атрибуция Яндекса не пересекается с карточкой. Заголовок карты находится ниже Header: RU 390 — top ~109 px, низ Header 77 px.

Контроль: [раскрытая карта с живой подложкой](../../.playwright-mcp/stage9-1/control-map-expanded-ru-390.png), [Homepage](../../.playwright-mcp/stage9-1/control-home-ru-390.png), [Ivory preview](../../.playwright-mcp/stage9-1/control-ivory-preview-ru-390.png), [comparison](../../.playwright-mcp/stage9-1/control-comparison-ru-320.png).

## 3. Accessibility findings

### A11Y-01 — High — нет явной Pause / Resume для Hero

- **Раздел / маршрут:** Homepage Hero, `/` и `/en/`.
- **Viewport / язык:** desktop/mobile, RU/EN; normal motion.
- **Фактически:** три изображения и подписи автоматически меняются постоянно. Доступны только три кнопки выбора изображения; отдельного механизма остановки/возобновления нет. Системный reduced motion отключает autoplay, но пользователь без этой настройки не может остановить обновления средствами страницы.
- **Ожидается:** доступное пользовательское управление автоматически обновляющимся содержимым согласно [WCAG 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) и [W3C Carousel guidance](https://www.w3.org/WAI/tutorials/carousels/).
- **Воспроизведение:** открыть Homepage с normal motion, дождаться смены слайда, пройти кнопки Hero клавиатурой / посмотреть accessibility tree. Все три названия — «Показать изображение N» / «Show artwork N».
- **Evidence:** `hero` / `reduced` в [confirmation](../../.playwright-mcp/stage9-1/confirmation.json), текущий `HeroSlider.vue`. RU: событие смены в ~7000.6 ms, начало наблюдения ~508.1 ms; EN: ~7012.1 / ~529.0 ms. Runtime `running: true`, `pauseOnMouseEnter: false`; reduced motion — `running: false`.
- **Причина:** предусмотрен только системный reduced-motion режим и выбор слайда, но нет явного пользовательского pause state. Fade 1100 ms не отменяет требование для автоматически обновляющейся информации.
- **Минимальное исправление:** небольшой локализованный Pause / Resume control с доступным именем и устойчивым состоянием. **Не возвращать hover/focus pause**, не менять delay 6500 ms, fade 1100 ms, пагинацию и дизайн без отдельного visual review. При reduced motion autoplay не запускать даже через Resume.

### Что прошло и пределы проверки

- На всех 136 SSR-страницах ровно один H1. В responsive-матрице: main/header/footer, skip link; недопустимых скачков проверенной иерархии заголовков не найдено.
- Не найдено изображений без `alt`, несуществующих `aria-controls/labelledby/describedby` targets или безымянных проверенных interactive AX nodes.
- Skip link получает Tab-focus, Enter переводит focus в main.
- Mobile menu: `aria-expanded`, dialog/inert background, удержание Tab внутри разрешённой области Header, Escape и возврат на menu toggle работают.
- PhotoSwipe: background inert, Tab остаётся в viewer, Escape закрывает и возвращает focus к исходному `.museum-image`. Gallery asset открывается. Проверяемые галереи содержат по одному изображению; отсутствие стрелок/counter для одного изображения — ожидаемо.
- Comparison: клавиатура Home/End/ArrowRight меняет 0/100/5%; native touch/mouse drag достигал 80%. Инструкции доступны через ARIA.
- Map: группы и выбор места доступны клавиатурой; Escape возвращает focus на маркер. Есть текстовый список Places и локализованные ссылки как альтернатива карте.
- Проверка размеров целей учитывает [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): inline text links не объявлены дефектами только из-за высоты меньше 24 px. 44 px — не универсальный порог WCAG AA.
- Для обычного текста на простых непрозрачных фонах подтверждённых нарушений проверенных contrast thresholds не найдено. Логотип и декоративный breadcrumb separator не считаются текстовыми contrast failures. Вычисления для белых дат поверх фотографии исключены как недостоверные без анализа пикселей изображения.

Намеренные `.sr-only`, `.map-page__sr-status` и visually hidden comparison instructions не включены в clipping-дефекты. Это устраняет ложные срабатывания DOM-проверки; лишние скриншоты этих случаев удалены. Полная сертификация WCAG и реальное прослушивание screen reader не проводились.

## 4. SEO findings

### Проверенные результаты всех маршрутов

| Проверка                                           | Результат                                                                                      |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| HTML и исторический контент без JS                 | 136/136, HTTP 200, main не пуст                                                                |
| Title / description                                | 136/136 присутствуют                                                                           |
| HTML lang                                          | RU `ru`, EN `en`, соответствует маршруту                                                       |
| H1                                                 | 1 на каждой странице                                                                           |
| Accidental noindex                                 | Не найден                                                                                      |
| Битые internal routes / fragments / checked assets | 0                                                                                              |
| External website links                             | Не найдено нарушений `target="_blank"` и `rel="noopener noreferrer"` в проверенных SSR anchors |
| Duplicate description                              | 0                                                                                              |
| Canonical / hreflang                               | Отсутствуют 136/136                                                                            |
| OG / Twitter metadata                              | Отсутствуют 136/136                                                                            |
| robots.txt / sitemap.xml                           | Отсутствуют, HTTP 404                                                                          |
| Неизвестный route                                  | HTTP 404 на строгом локальном static server                                                    |

### SEO-01 — Medium — canonical / bilingual hreflang отсутствуют

- **Раздел / маршрут:** все 136 страниц, в том числе `/`, `/en/`, `/dictionary/barclay-de-tolly` и EN equivalent.
- **Viewport / язык:** все ширины, RU/EN; metadata не зависит от viewport.
- **Фактически:** нет `link[rel="canonical"]` и `link[hreflang]`, хотя ARCHITECTURE.md задаёт соответствующий SEO-контракт.
- **Ожидается:** canonical каждой страницы и взаимные/self alternate language URLs. Для hreflang нужны полные URL и согласованная локаль: [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions).
- **Воспроизведение:** прочитать HTML любого сгенерированного `index.html`; найти эти link tags.
- **Evidence:** все records в [static SEO](../../.playwright-mcp/stage9-1/static-seo.json); `app/layouts/default.vue` устанавливает lang, но не language SEO head; отсутствует production origin в конфигурации.
- **Причина:** установленный i18n/router сам по себе не подключает нужные SEO head tags; отсутствует согласованный абсолютный базовый URL.
- **Минимальное исправление:** после определения production origin подключить общий locale SEO head средствами установленного Nuxt i18n и проверить все canonical/reciprocal pairs в static output. У map canonical не должен размножать страницы по `?place`/`?event`. Не подставлять localhost или выдуманный домен.

Отсутствие canonical/hreflang не означает автоматический запрет индексации. Production origin и возможный deployment base path — **отдельная необходимая зависимость**, а не установленный дефект действующего хостинга.

### SEO-02 — Low — отсутствует social metadata

- **Раздел / маршрут:** все 136 страниц, RU/EN, все viewport.
- **Фактически:** нет `og:*` / `twitter:*`; share preview выбирается платформой без явного задания сайта. Это не соответствует документированному базовому Open Graph контракту.
- **Ожидается:** локализованные title/description, тип, canonical URL, согласованное социальное изображение где применимо.
- **Воспроизведение / evidence:** поиск meta tags в generated HTML; [static SEO](../../.playwright-mcp/stage9-1/static-seo.json).
- **Причина:** страницы задают обычные title/description без общего social head.
- **Минимальное исправление:** общий SEO helper на существующих metadata; абсолютные URL после согласования origin. Использовать только утверждённые локальные media; не придумывать исторические изображения.

### SEO-03 — Low — одинаковые title разных разделов

- **Раздел / маршрут:** Dictionary / Timeline / Places; пары ниже и их EN equivalents.
- **Viewport / язык:** все viewport, RU/EN.
- **Фактически:** 14 групп дубликатов, 28 страниц. Title состоит из названия сущности без контекста раздела.
- **Ожидается:** title различает назначение страницы, не изменяя H1 и исторический текст.
- **Воспроизведение / evidence:** сравнить HTML title пар; `duplicateTitles` в [static SEO](../../.playwright-mcp/stage9-1/static-seo.json).
- **Причина:** разные шаблоны используют одинаковый entity title как document title.
- **Минимальное исправление:** локализованный суффикс раздела и проекта в document title; не переписывать контент.

| Общий RU title          | Маршруты без префикса языка                                   |
| ----------------------- | ------------------------------------------------------------- |
| Бородинское сражение    | `/dictionary/borodino-battle`, `/timeline/borodino`           |
| Военный совет в Филях   | `/dictionary/military-council-fili`, `/timeline/council-fili` |
| Кутузовская изба        | `/dictionary/kutuzov-hut-term`, `/places/kutuzov-hut`         |
| Поклонная гора          | `/dictionary/poklonnaya-hill`, `/places/poklonnaya-hill`      |
| Смоленское сражение     | `/dictionary/smolensk-battle`, `/timeline/smolensk`           |
| Тарутинский марш-манёвр | `/dictionary/tarutino-maneuver`, `/timeline/tarutino-march`   |
| Триумфальная арка       | `/dictionary/triumphal-arch`, `/places/triumphal-arch`        |

### SEO readiness risks — не включены в confirmed defects

`robots.txt` и `sitemap.xml` отсутствуют. Отсутствующий robots с 404 не равнозначен запрету обхода, а sitemap не является обязательным условием индексации. Internal link graph исправен. Перед deployment стоит явно определить crawl policy и sitemap из 136 canonical URLs после согласования production origin/base path. Индексация, реальные response headers, HTTP→HTTPS/host redirects и Search Console не проверялись на production.

Также зафиксирован `/favicon.ico` 404 в чистом браузере. Это отдельное необязательное polish-замечание, не причина NUXT_E7001/E7003 и не поломка исторического контента.

## 5. Functional regressions

### FNC-01 — Low — locale-link prefetch вызывает NUXT_E7001/E7003

- **Раздел / маршрут:** Header language switch на `/`, `/en` (также `/en/`), `/map`, `/en/map`.
- **Viewport / язык:** в исходной responsive-матрице ошибки воспроизводились на всех четырёх ширинах, RU/EN. Точные prefetch URLs и реальный клик дополнительно записаны на 1440×900.
- **Фактически:** после загрузки/гидратации, когда видимый переключатель запускает Nuxt prefetch, появляются `[NUXT_E7001]`, затем `[NUXT_E7003]`. Они возникают **ещё до клика**. После переключения новый документ повторяет ошибку для обратного language link.
- **Ожидается:** язык переключается на equivalent route с предусмотренной полной загрузкой документа, без попытки загрузить Nuxt payload по абсолютному external URL.

Точно записанные случаи на `http://localhost:3091`:

| Исходный route | Неподходящий payload prefetch URL | Результат клика / lang           |
| -------------- | --------------------------------- | -------------------------------- |
| `/`            | `http://localhost:3091/en`        | `/en`, `en`, document reload     |
| `/en/`         | `http://localhost:3091/`          | `/`, `ru`, document reload       |
| `/map`         | `http://localhost:3091/en/map`    | `/en/map`, `en`, document reload |
| `/en/map`      | `http://localhost:3091/map`       | `/map`, `ru`, document reload    |

**Воспроизведение:** обслужить свежий `.output/public` без SPA fallback; открыть один из четырёх routes в новом Chromium context, дождаться гидратации и ~2 секунд; проверить console и настоящее событие `link:prefetch`; нажать другой язык, дождаться новой страницы. Переключение проходит, но ошибки присутствуют до и после него. На representative detail-route `/places/triumphal-arch` переключение RU↔EN также прошло; для него Header не включает external mode.

**Evidence:** [четыре маршрута и before/after click](../../.playwright-mcp/stage9-1/locale-prefetch-routes.json), [наблюдение реального hook после reload](../../.playwright-mcp/stage9-1/prefetch-probe.json), console записи в responsive / static follow-up. `performance.timeOrigin` подтверждает document reload, а не только изменение адреса.

**Причина:** `SiteHeader.vue` специально задаёт `:external="isYandexRoute && code !== locale"` для смены языка на страницах с Яндекс API. Prefetch для этих NuxtLink не отключён. Nuxt передаёт абсолютный same-origin URL в `link:prefetch`; `nuxt:payload` видит совпадающий hostname и вызывает `loadPayload(url)`. Установленный Nuxt отклоняет URL с hostname (`NUXT_E7001`), catch сообщает `NUXT_E7003`. Это не 404 payload и не недоступность Яндекс API.

Причина проверена по установленным `node_modules/nuxt/dist/app/plugins/payload.client.js`, `app/composables/payload.js`, `app/diagnostics/state.js`, фактическому hook URL и текущему Header. Не требуется предполагать production domain для воспроизведения.

**Минимальное рекомендуемое исправление:** на **обоих** language-switch NuxtLink (desktop Header и mobile menu) добавить `:no-prefetch="isYandexRoute && code !== locale"`. Свойство `noPrefetch` поддерживается установленным Nuxt (`nuxt-link.d.ts`). Сохранить `external`, `switchLocalePath`, текущие query и полную перезагрузку для Яндекс API; не отключать prefetch всего сайта, не подавлять console, не менять библиотеку. Это рекомендация, **не внедрённый и не проверенный после исправления fix**.

Будущий focused acceptance: четыре routes из таблицы + mobile menu, RU/EN, bare URL и выбранный `?place`/`?event`; нет E7001/E7003, правильные lang/query, API загружается в нужной локали. Текущий аудит подтвердил bare routes и отдельный place/history сценарий; сохранение query именно при locale switch дополнительно проверить в corrective batch.

### Успешные selective regressions

| Сценарий                                         | Результат / evidence                                                                                                                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero timings и отсутствие hover pause            | Runtime 6500/1100, `pauseOnMouseEnter: false`, real slideChange во время stationary pointer; confirmation                                                                                     |
| Hero reduced motion                              | `autoplay.running: false`; confirmation                                                                                                                                                       |
| Длительные Hero touch/reload/remount сценарии    | Повторно не запускались: использован актуальный раздел no-hover в существующем [Hero audit](hero-autoplay-reliability-audit.md); новый аудит проверил runtime и один реальный переход в RU/EN |
| Homepage Museum Ivory / full Map Museum Graphite | Реальные SDK/подложки загружены; конфигурации не изменены; live confirmation и screenshots                                                                                                    |
| Map filters                                      | 13/6/7; выбранные состояния и список соответствуют фильтру                                                                                                                                    |
| Map compact/expanded                             | RU/EN 320/390; внутренний скролл и доступные действия, Escape; interactions                                                                                                                   |
| Map groups / keyboard / history                  | Enter открывает chooser, Enter выбирает место; Escape возвращает focus; Back закрывает, Forward восстанавливает тот же `?place=fili-village`; static follow-up                                |
| Map text alternative → Places                    | Раскрытие списка и переход к `/places/fili-village` / EN equivalent работают                                                                                                                  |
| Locale equivalent route                          | Detail routes и четыре full-reload routes работают; locale-prefetch-routes                                                                                                                    |
| PhotoSwipe / image comparison                    | Keyboard, native touch/mouse, inert/focus return; interactions                                                                                                                                |
| Внешние content/source links                     | SSR проверка всех страниц соответствует AGENTS.md; элементы Яндекса не модифицировались                                                                                                       |
| Global Footer                                    | На всех sampled pages `rgb(48,45,42)` = `#302D2A`, единой темы; responsive                                                                                                                    |

В functional checks не найдено pageerror или hydration exception. **Это не утверждение об отсутствии console errors:** FNC-01 и favicon 404 перечислены выше. Есть повторные Nuxt timing warnings (`Timer ... already exists`); их влияние на продукт не установлено, отдельным confirmed defect они не объявлены.

## 6. Environment limitations and verification

- Chromium на Windows; Safari, Firefox, реальные телефоны и NVDA/VoiceOver не тестировались. Touch проверен native CDP input, а не только synthetic DOM click.
- axe-core и axe Playwright отсутствуют среди доступных зависимостей; ничего не установлено. Использованы собственные DOM проверки и CDP accessibility tree. Это ограниченная автоматизация, не полный WCAG audit.
- Text resize проверен временным изменением корневого font-size. Нативный browser zoom 200/400% не объявляется проверенным; 320 CSS px использованы как narrow reflow viewport согласно [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- Контраст текста поверх изображения и всех состояний provider map требует отдельной ручной/пиксельной проверки; простого computed background недостаточно. Реальные screen-reader announcements не прослушивались.
- Yandex API в этой среде **доступен**. Первичные замеры до его завершения не использованы как доказательство отсутствующей подложки/атрибуции. Контрольный static кадр снят после прокрутки карты в viewport и ожидания загрузки.
- Скрытая браузерная вкладка/нативный visibilitychange в этом Stage 9.1 не тестировались; прошлые environment limits Hero не заменены искусственной подменой visibilityState.
- Production origin, deployment base path и hosting configuration не утверждены. Root-path static server не доказывает работу будущего GitHub Pages subpath, redirects, headers или индексации.
- Среда использует Node 26.4.0 при declared engine `>=22.22.2 <23`. Проверки прошли здесь, но release verification следует выполнять на заявленной Node 22.
- Первый generate в sandbox остановился на esbuild `spawn EPERM`; повтор с разрешённым запуском завершился успешно. Это ограничение запуска инструментов, не дефект сайта.

| Проверка                       | Результат                                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm test`                     | **56/56**, [log](../../.playwright-mcp/stage9-1/tests.log)                                                                                                                                 |
| Свежий `npm run generate`      | Успешно, **277 prerendered routes** включая payload; [log](../../.playwright-mcp/stage9-1/generate.log)                                                                                    |
| `npm run typecheck`            | Exit 0; [log](../../.playwright-mcp/stage9-1/typecheck.log)                                                                                                                                |
| Scoped ESLint                  | Exit 0: Hero, Header, MapPlaceCard, InteractiveMap, HomepageMapCanvas, MuseumImage, PlaceImageComparison, timeline index, default layout; [log](../../.playwright-mcp/stage9-1/eslint.log) |
| QA scripts formatting / syntax | Prettier и `node --check`, только четыре новых audit scripts                                                                                                                               |
| Source integrity               | **75 защищённых файлов без изменений**, [SHA-256 result](../../.playwright-mcp/stage9-1/source-integrity.json)                                                                             |

Новые файлы: этот отчёт; `.playwright-mcp/stage9-1-{audit,interactions,confirmation,final-evidence}.mjs`; evidence в `.playwright-mcp/stage9-1/` (JSON/logs и семь отобранных PNG). Рабочее дерево уже содержало изменения предыдущих задач: они не являются результатом этого аудита.

## 7. Prioritized corrective plan

| Порядок / batch                    | Состав                         | Минимальный scope и критерий приёмки                                                                                                                   |
| ---------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 — Hero accessibility             | A11Y-01, High                  | Согласовать явный Pause/Resume; keyboard/ARIA/reduced motion, сохранение 6500/1100 и отсутствия hover/focus pause                                      |
| 2 — Narrow reflow                  | RSP-01 + RSP-02, Medium        | Локальные long-word/grid/header corrections; RU/EN 320/390 и text 200%, доступное меню, без horizontal overflow; desktop без регрессии                 |
| 3 — Locale prefetch                | FNC-01, Low                    | Отключить только external locale-link prefetch в двух местах Header; четыре routes + mobile menu/query, реальный reload/API без E7001/E7003            |
| 4 — Shared bilingual SEO           | SEO-01, Medium; SEO-02/03, Low | Сначала утвердить origin/base path; общий SEO head, все 136 canonical/hreflang, social tags, разные document title; исторический контент без изменений |
| 5 — Deployment readiness, отдельно | Риски, без confirmed severity  | Crawl policy/sitemap, заявленная Node 22, реальный hosting/subpath/404/headers; не выполнять deployment в рамках аудита                                |

После согласования каждого batch нужны только относящиеся к нему focused checks. Дизайн карт, глобальные токены и исторический контент не требуют изменений по результатам данного аудита. Субъективные визуальные замечания не используются для незапрошенного редизайна.

**Итог: STAGE 9.1 — AUDIT COMPLETE / AWAITING REVIEW.** Исправления не начаты; Stage 9 целиком не закрыт.
