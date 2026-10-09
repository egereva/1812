# Homepage Hero — Swiper autoplay reliability audit

Дата: 2026-10-09. Текущее утверждённое решение: autoplay без hover-паузы — **VERIFIED / COMPLETE**.

Исходный аудит и раздел «Targeted touch fix» ниже сохранены как история диагностики. Они описывают прежние правила hover/focus, заменённые новым утверждённым поведением. Актуальные результаты — в заключительном разделе «Corrected requirements — autoplay без hover».

## Вывод

Обнаружен воспроизводимый дефект touch-пагинации: повторное касание уже активной, сфокусированной кнопки оставляет autoplay на паузе без следующего перехода. В RU и EN при 390 px индекс не изменился за 17 секунд. Это `running=true, paused=true, animating=false`, а не остановка экземпляра Swiper.

Обычная автоматическая смена, desktop-пагинация, выход из клавиатурного фокуса, reload и remount работают. Наведение мыши, клавиатурный фокус внутри Hero и reduced motion намеренно приостанавливают или останавливают autoplay. Между началами переходов проходит около **7.61 секунды**, поскольку к delay 6500 ms добавляется fade 1100 ms.

Рабочий код, настройки, оформление и изображения Hero не изменены. Stage 9 не начат. Нативный сценарий скрытия вкладки остаётся ограничением проверки; ниже он отделён от синтетической проверки обработчика.

## Фактическая конфигурация

Источник: [HeroSlider.vue](../../app/components/HeroSlider.vue), установленный **Swiper 12.2.0**, его `modules/autoplay.mjs`, `modules/effect-fade.mjs`, `shared/effect-virtual-transition-end.mjs` и `swiper-vue.mjs`. Настройки также сняты с живых экземпляров в браузере.

| Параметр                           | Значение и источник                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| Модули                             | `EffectFade`, `Autoplay`, `Pagination`, `Keyboard`, зарегистрированы через `modules`         |
| Слайды                             | 3 исторических изображения                                                                   |
| Effect                             | `fade`, `crossFade: true`                                                                    |
| Speed                              | 1100 ms; `syncMotion()` устанавливает 0 при reduced motion                                   |
| Autoplay delay                     | 6500 ms, явно задан                                                                          |
| disableOnInteraction               | `false`, явно задан                                                                          |
| pauseOnMouseEnter                  | `true`, явно задан                                                                           |
| waitForTransition                  | `true`, default установленного Swiper 12.2.0                                                 |
| stopOnLastSlide / reverseDirection | `false` / `false`, defaults                                                                  |
| loop                               | `false`, default; loop-клонов нет                                                            |
| rewind                             | `true`, явно задан; после индекса 2 возвращается 0                                           |
| Pagination                         | Кликабельные native buttons, локализованные aria-label, `aria-current` обновляется при смене |
| Keyboard                           | `enabled: true`, `onlyInViewport: true`; `pageUpDown: true` по default                       |

При fade Swiper использует virtual translation и отправляет wrapper `transitionend` после CSS-перехода слайда. Autoplay ждёт этот event, затем запускает следующий delay. `paused=true` во время fade — нормальное состояние.

Дополнительно к штатному hover Swiper компонент обрабатывает `pointerenter`/`pointerleave` на всей `.hero-slider`, включая подпись. `onPointerEnter()` без проверки типа указателя вызывает `autoplay.pause()`. `onPointerLeave()` запускает autoplay только без reduced motion и `:focus-within`. `onFocusIn()` вызывает `stop()` только для `:focus-visible`; `onFocusOut()` запускает autoplay при уходе фокуса наружу и отсутствии hover.

`onMounted()` считывает `matchMedia('(prefers-reduced-motion: reduce)')`, подписывается на change и синхронизирует speed/autoplay. `onSwiper()` сохраняет экземпляр и также вызывает синхронизацию. `onUnmounted()` снимает подписку. Уничтожение Swiper выполняет Vue-обёртка через `destroy(true, false)` в `onBeforeUnmount`; отдельный destroy в компоненте не требуется.

Официальная [документация Swiper](https://swiperjs.com/swiper-api) на дату аудита уже описывает другую major-версию, поэтому defaults проверены непосредственно по установленному 12.2.0.

## Методика и матрица

Playwright использовал установленный Chromium, dev server `http://localhost:3042`, реальные `waitForTimeout`, без mock clocks. Desktop: 1440 × 1000, mobile: 390 × 844 с `isMobile` и `hasTouch`. Основная матрица: RU/EN × desktop/mobile × normal/reduced motion — 8 прогонов.

Внешняя browser-only instrumentation читала DOM `element.swiper`, подписывалась на autoplay/slide/transition/destroy events, записывала `performance.now()`, индексы, running/paused/timeLeft/animating, hover, focus и видимость документа. Состояние снималось каждые 250 ms; события сохранялись непосредственно при вызове. Probe подключалась после инициализации, поэтому самые ранние init/autoplayStart events могли предшествовать подписке. Рабочий код не инструментирован; временные listeners исчезли вместе с закрытыми browser contexts.

Сценарии: первоначальные 24 секунды normal autoplay; движение мыши и 8.5 секунды hover; выход и ожидание; другая кнопка пагинации; Tab и ArrowRight с ожиданием внутри и после выхода фокуса; переход существующей ссылкой на `/map` и возврат через логотип; reload. Reduced motion проверялся при загрузке, remount, reload и отдельно при смене media preference с ожиданием доставки change event.

Mobile основной матрицы использовал и mouse, и touch для проверки hover. Такое сочетание может оставить mouse-hover после touch; его результаты не использованы как доказательство mobile-дефекта. Выполнены дополнительные **чистые touch** прогоны без предварительных mouse moves: одно касание другой кнопки, одно касание активной кнопки и повторное касание уже сфокусированной активной кнопки.

## Измеренные переходы

Время ниже — ms от начала документа (`performance.now()`), округлено; порядок индексов `0 → 1 → 2 → 0`.

| Normal motion | Начало 1 | Начало 2 | Начало 3 | Интервалы между началами |
| ------------- | -------: | -------: | -------: | ------------------------ |
| RU, 1440      |     8179 |    15790 |    23400 | 7611 / 7610 ms           |
| EN, 1440      |     8228 |    15850 |    23468 | 7622 / 7618 ms           |
| RU, 390       |     8166 |    15784 |    23394 | 7618 / 7610 ms           |
| EN, 390       |     8192 |    15807 |    23416 | 7615 / 7609 ms           |

RU desktop: первый fade завершился на 9289 ms, второй — 16894 ms, третий — 24517 ms. Измеренные длительности 1110 / 1104 / 1117 ms, включая browser scheduling. Пока идёт fade, `running=true, paused=true, animating=true`; после `transitionEnd` и `autoplayResume` paused снимается и timeLeft снова убывает.

## Подтверждённый дефект и причина

Воспроизведение на RU или EN, 390 px, normal motion:

1. Загрузить Homepage без мыши, используя touch viewport.
2. Коснуться второй кнопки пагинации; дождаться завершения fade (1.5 секунды).
3. Повторно коснуться той же, теперь активной кнопки.
4. Не касаться других элементов и ждать 17 секунд.

| Состояние                               | RU: время / индекс / paused | EN: время / индекс / paused |
| --------------------------------------- | --------------------------- | --------------------------- |
| Первый fade завершён                    | 2609 ms / 1 / false         | 2655 ms / 1 / false         |
| Повторное касание активной кнопки       | 2652 ms / 1 / true          | 2704 ms / 1 / true          |
| После 17 секунд                         | 19660 ms / 1 / true         | 19707 ms / 1 / true         |
| После касания вне Hero и ожидания 8.5 s | 28231 ms / 2 / false        | 28263 ms / 2 / false        |

В зависшем состоянии обе локали: `running=true`, `animating=false`, `focusWithin=true`, `focusVisible=false`; timeLeft замер около 6049/6066 ms. Keyboard focus не является причиной этой паузы: `:focus-visible` отсутствует.

В RU журнале повторное касание вызвало `autoplayPause` и `pointerenter` с **`pointerType: 'touch'`** на 2649 ms. Последовавший touch `pointerleave` не запустил autoplay: кнопка уже удерживала фокус. Повторное касание активного bullet не меняет слайд, поэтому нет нового transition и `transitionend`, которого ждёт `pause()` при `waitForTransition=true`. Штатные pointer handlers Swiper отбрасывают не-mouse события; дополнительный обработчик Hero этого не делает.

Это объясняет зависимость от последовательности взаимодействий: первое касание активной кнопки без прежнего фокуса и обычное касание другой кнопки сами по себе **не** воспроизвели зависание. В чистых touch прогонах после одного касания другой кнопки слайды продолжали меняться за 17 секунд.

### Минимальный предлагаемый fix — не реализован

Ограничить оба дополнительных hover-обработчика Hero событиями `PointerEvent` с `pointerType === 'mouse'`, как делает штатный Swiper. Touch не должен вызывать hover pause/start. Оставить keyboard focus и reduced-motion guards, все Swiper settings, delay, speed и fade неизменными. Не отключать `waitForTransition` и не уменьшать delay для маскировки дефекта.

После approval повторить double-touch regression RU/EN, single-touch, desktop hover, keyboard focus и reduced motion. Проверка предложенного исправления пока не выполнялась: рабочий код менять запрещено в рамках аудита.

## Ожидаемые остановки и успешно проверенные сценарии

| Сценарий                                   | Результат                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Первоначальная загрузка normal motion      | 3 последовательных автоматических перехода во всех 4 вариантах                                                            |
| Мышь над изображением, без клика           | 8.5 s без смены, `running=true, paused=true`; после выхода следующий переход есть                                         |
| Desktop pagination + выход мыши            | Автоматическая смена возобновляется; отдельное ожидание 17 s подтверждает два перехода                                    |
| Keyboard Tab + ArrowRight                  | Ручная смена работает; `running=false` пока keyboard focus в Hero — намеренно                                             |
| Выход keyboard focus, без hover            | Desktop autoplay возобновляется и меняет слайд                                                                            |
| SPA: Homepage → Map → Homepage             | Старый экземпляр destroyed, новый начинает с 0 и меняется на 1                                                            |
| Reload normal motion                       | Новый экземпляр работает, индекс 0 → 1 за 8.5 s                                                                           |
| Reduced motion при загрузке/remount/reload | `running=false`, автоматических изменений нет; ручная пагинация/keyboard работают, speed 0                                |
| Live reduced-motion change                 | После доставки media change autoplay останавливается; на desktop после возврата normal motion без hover/focus запускается |

Hover на overlay-тексте и artwork может восприниматься по-разному: текстовая область `.home-hero__identity` — соседний элемент, а не часть `.hero-slider`. Пауза проверена на фактической области изображения. После выхода hover компонент вызывает `start()`, начиная новый delay; не следует ожидать немедленного перехода.

Swiper `start()` не обязан немедленно обнулять прежний `paused` flag: после keyboard stop/start встречалось `running=true, paused=true`, но запланированный переход происходил и затем paused снимался. Поэтому отдельный снимок paused без событий и движения индекса недостаточен для диагноза. В double-touch случае подтверждены и отсутствие переходов, и неподвижный timeLeft за 17 секунд.

## Lifecycle и консоль

В каждом основном SPA прогоне наблюдались ровно два последовательных экземпляра: первый уничтожен, второй жив. Одновременно живого дубликата не выявлено. Для старого Swiper document visibility listener удалён с тем же callback identity; Hero reduced-motion listener также удалён. Три media-query listener пары на Homepage включают другие компоненты; все старые callback identities удалены перед remount. Оставшийся listener probe отдельно учтён и не принят за утечку приложения.

Во всех восьми основных прогонах **0 `pageerror`** и отсутствовали hydration warnings. Консоль не была полностью чистой: Nuxt dev выводил повторные timer-label warnings, `NUXT_E7001` для абсолютного payload URL и `NUXT_E7003` при prefetch. Часть SSR timer warnings логировалась как console error. Ошибок Swiper не обнаружено; эти dev warnings не прерывали успешные autoplay/remount сценарии и не являются установленной причиной double-touch дефекта. Их исправление вне данного аудита.

## Видимость вкладки: предел проверки

Native переключение через `bringToFront()` проверено в headless Chromium, offscreen headed Chromium (включая persistent profile), а также установленном Firefox. В этой среде Homepage оставалась `document.visibilityState='visible'`, даже когда `document.hasFocus()` становился false. CDP отключение focus emulation, активация другого target, минимизация и freeze/active также не дали зарегистрированных `visibilitychange` hidden/visible. Поэтому реальное background-tab поведение **не подтверждено и не объявляется прошедшим**.

Отдельная явно **синтетическая** проверка меняла visibility getter только внутри временного браузерного контекста и отправляла visibilitychange: hidden оставил индекс 0 и paused=true за 8.5 s; visible вызвал resume и индекс 1 после следующих 8.5 s. Override удалён до закрытия контекста. Это подтверждает обработчик установленного Swiper, но не заменяет проверку нативных background timer policies. Требуется контрольный прогон в обычной пользовательской вкладке после approval.

## Проверки и артефакты

- Focused tests: `node --experimental-strip-types --test --experimental-test-isolation=none test/hero.test.ts test/homepage-render.test.mjs` — **9/9 PASS**. Render tests используют существующие generated artifacts; новая генерация не запускалась. Эти tests не покрывают autoplay timing; runtime доказательства получены Playwright.
- Scoped ESLint: `npx eslint app/components/HeroSlider.vue` — **PASS**.
- Formatting: `npx prettier --check app/components/HeroSlider.vue` — **PASS**; отчёт и внешние audit scripts также отформатированы и проверены.
- Typecheck/build/generate не запускались: production TypeScript и runtime code не менялись. Тесты запускались доступным Node 26.4.0; package engines требует Node 22, поэтому это также предел проверки окружения.

Основная матрица: [RU desktop](../../.playwright-mcp/hero-autoplay-audit/ru-1440-no-preference.json), [EN desktop](../../.playwright-mcp/hero-autoplay-audit/en-1440-no-preference.json), [RU mobile](../../.playwright-mcp/hero-autoplay-audit/ru-390-no-preference.json), [EN mobile](../../.playwright-mcp/hero-autoplay-audit/en-390-no-preference.json). Reduced-motion logs имеют имена `ru/en-1440/390-reduce.json` в том же каталоге.

Главное доказательство дефекта: [RU repeat touch](../../.playwright-mcp/hero-autoplay-audit/ru-repeat-touch.json), [EN repeat touch](../../.playwright-mcp/hero-autoplay-audit/en-repeat-touch.json). Контроль single-touch: [RU](../../.playwright-mcp/hero-autoplay-audit/ru-pure-touch-targeted.json), [EN](../../.playwright-mcp/hero-autoplay-audit/en-pure-touch-targeted.json). [Синтетическая visibility-проверка](../../.playwright-mcp/hero-autoplay-audit/visibility-handler-synthetic.json).

Воспроизводимые внешние scripts: [основная матрица](../../.playwright-mcp/hero-autoplay-audit.mjs), [single-touch и media changes](../../.playwright-mcp/hero-autoplay-targeted.mjs), [double-touch regression](../../.playwright-mcp/hero-autoplay-repeat-touch.mjs). Они не входят в приложение и используют уже установленный Playwright, без новых зависимостей. Пути browser/tool installation локальны для этого рабочего окружения.

Изменён только этот новый отчёт; добавлены QA scripts и JSON/PNG evidence в `.playwright-mcp/hero-autoplay-audit/`. Hero, другие компоненты, дизайн-документы и production настройки в рамках аудита не изменены.

## Targeted touch fix — 2026-10-09

После approval исправлены только hover guards в `HeroSlider.vue`. `onPointerEnter` и `onPointerLeave` принимают `PointerEvent` и игнорируют все типы, кроме `mouse`. Локальный `mouseHover` устанавливается этими mouse events; `syncMotion` и `onFocusOut` используют его вместо CSS `:hover`. Это необходимо, поскольку Chromium сохраняет `:hover` после touch: одних guards на pointer handlers оказалось недостаточно для смешанного touch → keyboard → выход фокуса. Последний сценарий воспроизведён также в исходных логах до fix и теперь проходит в том же browser context.

Нет новых таймеров, дополнительных вызовов start/resume, зависимостей или изменений настроек Swiper. Сохранены delay 6500 ms, speed 1100 ms, fade/crossFade, rewind, pagination, keyboard и reduced-motion guards. Изображения, подписи, стили и остальные разделы не изменены. Локальный флаг не переживает remount; новых подписок и cleanup-обязанностей нет.

Focused live QA: **RU/EN × 390/1440 — 4/4 PASS**, реальные browser timing и event assertions, без mock clocks.

- Три последовательных автоматических `slideChange`: `0 → 1 → 2 → 0`.
- Касание другой кнопки вручную переключает слайд; повторное касание активной кнопки не вызывает паузу или start и сохраняет оставшийся delay. После повторного касания зарегистрированы два автоматических перехода за 17 секунд.
- Synthetic pen pointerenter/leave не вызывает pause/start; физическое pen-устройство не использовалось.
- Desktop mouse hover удерживает индекс 8.5 s, после leave следующий переход происходит в пределах ожидаемого delay.
- Tab/ArrowRight работают; autoplay остановлен внутри keyboard focus и возобновляется после выхода, включая mobile после touch с оставшимся CSS `:hover`.
- SPA remount уничтожает первый экземпляр и создаёт один новый; autoplay работает. Reload проверен с reduced motion и последующим возвратом normal motion.
- Live reduced motion останавливает autoplay и устанавливает speed 0; при reload preference сохраняется. Возврат normal motion восстанавливает speed 1100 и автоматическую смену.
- Во всех четырёх прогонах 0 pageerror и hydration warnings. Сохраняются ранее зарегистрированные Nuxt dev timer/payload warnings; они не устранены в этом scoped fix.

| Repeat touch, 390 px | Остаток delay при касании | Первый auto slideChange после касания | Второй auto slideChange |
| -------------------- | ------------------------: | ------------------------------------: | ----------------------: |
| RU                   |                   6050 ms |                     6046 ms, индекс 2 |      13655 ms, индекс 0 |
| EN                   |                   6050 ms |                     6046 ms, индекс 2 |      13655 ms, индекс 0 |

Четыре миллисекунды расхождения соответствуют разрешению runtime timeLeft/RAF sample. После первого fade следующий delay штатно составляет 6500 ms; touch не сбрасывает countdown.

Проверки финального кода: focused tests **9/9 PASS**, `npx eslint app/components/HeroSlider.vue` **PASS**, `npm run typecheck` **PASS**, scoped Prettier и `node --check` QA script **PASS**. Render tests используют прежние generated artifacts; фактический изменённый компонент проверен через live dev browser. Build/generate не запускались. Использован доступный Node 26.4.0, вне declared package engines Node 22.

Нативное hidden/visible `visibilitychange` **не объявляется проверенным**: сохраняется описанное в аудите ограничение среды. Исправление не меняет обработчик видимости Swiper; синтетические результаты исходного аудита не подменяют native QA.

Изменённые файлы: `app/components/HeroSlider.vue`, этот отчёт; добавлен внешний [регрессионный QA script](../../.playwright-mcp/hero-autoplay-touch-fix-qa.mjs) и JSON evidence: [RU mobile](../../.playwright-mcp/hero-autoplay-touch-fix/ru-390.json), [EN mobile](../../.playwright-mcp/hero-autoplay-touch-fix/en-390.json), [RU desktop](../../.playwright-mcp/hero-autoplay-touch-fix/ru-1440.json), [EN desktop](../../.playwright-mcp/hero-autoplay-touch-fix/en-1440.json). `*-mixed-keyboard-attempt.json` сохраняют промежуточную проверку, показавшую необходимость заменить CSS hover guard. Финальные результаты относятся к полной реализации с mouseHover.

Подтверждённый touch stall устранён; функциональных блокеров финальной проверки не обнаружено. Stage 9 не начат.

## Corrected requirements — autoplay без hover — 2026-10-09

Владелец изменил утверждённое поведение: полноэкранный Hero продолжает autoplay независимо от положения курсора. В `HeroSlider.vue` установлено `pauseOnMouseEnter: false`; `disableOnInteraction: false` сохранён. Удалены все component pointerenter/pointerleave и focusin/focusout handlers, их template bindings, root ref и mouseHover state. `syncMotion()` зависит только от reduced motion. Фокус больше не вызывает stop/start: autoplay продолжается после keyboard selection даже при сохранённом фокусе кнопки.

Delay 6500 ms, fade 1100 ms/crossFade, modules, rewind, pagination, keyboard navigation, artwork/captions/layout/styles сохранены. CSS hover оформления ссылки на источник сохранён и не управляет autoplay. Нет новых таймеров, периодических start или временной instrumentation в рабочем коде. Единственный component stop/start связан с init/media preference; Vue wrapper уничтожает Swiper при unmount, media-query listener удаляется существующим cleanup.

**Live QA: RU/EN × desktop 1440/mobile 390 — 4/4 PASS.** Реальный Chromium dev browser, native input, реальные performance.now/event timestamps. Указатель помещён в центр области Hero; hit-test подтвердил Hero target, mouse не двигался 30 секунд. Во всех четырёх случаях получены четыре автоматических перехода `0 → 1 → 2 → 0 → 1`, при `hover=true`.

| Сценарий | Начала четырёх auto transitions относительно начала неподвижного hover |
| -------- | ---------------------------------------------------------------------- |
| RU 1440  | 6415 / 14029 / 21652 / 29275 ms                                        |
| EN 1440  | 6435 / 14057 / 21678 / 29285 ms                                        |
| RU 390   | 6424 / 14040 / 21663 / 29286 ms                                        |
| EN 390   | 6425 / 14038 / 21657 / 29262 ms                                        |

Первый delay уже немного истёк до начала записи; интервалы последующих переходов около 7.61–7.62 s соответствуют 6500 ms + fade 1100 ms.

Повторный active click/tap после ручного выбора другой кнопки не создаёт pause и не сбрасывает countdown. За следующие 17 s зарегистрированы два автоматических перехода. Первый произошёл через 5296 ms при timeLeft 5299 ms (оба desktop), через 5181/5168 ms при timeLeft 5183/5166 ms (RU/EN mobile). Tab и ArrowRight вручную меняют слайд; следующий auto transition зарегистрирован за 8.5 s с фокусом внутри Hero. После выхода фокуса autoplay также продолжает работать.

SPA navigation Homepage → Map → Homepage: старый Swiper destroyed, один новый экземпляр жив и автоматически меняет слайд. Probe записала четыре initial listener registrations — Swiper document visibility и три Homepage reduced-motion subscriptions; все четыре удалены с теми же callback identities до создания новых. Утечек этих обработчиков и одновременных дубликатов Swiper не обнаружено. Probe listeners находятся только во внешнем QA context и исчезают при его закрытии.

Reduced motion: live change останавливает autoplay и устанавливает speed 0; 8.5 s без автоматических событий. Reload с active preference также оставляет autoplay выключенным. Возврат normal motion возвращает speed 1100 и автоматический переход за 8.5 s. Manual click/tap и keyboard в normal motion проверены в обоих языках и размерах.

Во всех четырёх прогонах 0 pageerror и hydration warnings. Console не полностью чиста: остаются прежние Nuxt dev timer-label и payload prefetch warnings, включая SSR warning logs с console error severity. Swiper runtime errors не зарегистрированы; эти сообщения не исправлялись в рамках задачи.

**Native visibility:** отдельно выполнено реальное переключение вкладок в offscreen headed Chromium с отключённой focus emulation и ожиданиями 8.5 s. Focus действительно сменился, но visibilityState оставался visible и нативных visibilitychange events не было. Результат **NATIVE_HIDDEN_NOT_AVAILABLE**, не PASS. Getter и events не подменялись; искусственный тест исходного аудита не использован для подтверждения актуального hidden-tab сценария. [Реальные наблюдения](../../.playwright-mcp/hero-autoplay-no-hover/native-visibility.json).

Focused checks финального кода: Hero/homepage tests **9/9 PASS**, scoped ESLint **PASS**, `npm run typecheck` **PASS**, scoped Prettier и QA script syntax **PASS**. Generated render tests используют существующие artifacts; изменённый runtime проверен в live dev browser. Build/generate не запускались. Окружение остаётся Node 26.4.0 при declared package engines Node 22.

Изменены `app/components/HeroSlider.vue`, этот отчёт и только Hero-контракты в `docs/DESIGN.md`/`docs/ARCHITECTURE.md`. Добавлены [внешний QA script](../../.playwright-mcp/hero-autoplay-no-hover-qa.mjs) и логи: [RU desktop](../../.playwright-mcp/hero-autoplay-no-hover/ru-1440.json), [EN desktop](../../.playwright-mcp/hero-autoplay-no-hover/en-1440.json), [RU mobile](../../.playwright-mcp/hero-autoplay-no-hover/ru-390.json), [EN mobile](../../.playwright-mcp/hero-autoplay-no-hover/en-390.json). Прежние audit/fix logs относятся к прежнему UX и сохранены отдельно.

**Исправление завершено.** Неподтверждённым остаётся только native hidden-tab сценарий в данной среде; Stage 9 не начат.
