# Stage 9.3 — Hero autoplay accessibility control

Дата: 2026-10-09. **AWAITING VISUAL REVIEW. Stage 9 IN PROGRESS.**

Реализован A11Y-01 из [Stage 9.1 audit](stage9-1-site-audit.md): ручное управление autoplay Homepage Hero. Другие corrective batches не начаты.

## Изменение

Справа от трёх существующих точек пагинации добавлена компактная native button с Pause / Play SVG и зоной нажатия 44×44 px. Позиция самой пагинации сохранена. Кнопка использует белый знак и такой же двухпиксельный keyboard focus, как существующие точки; без рамки в обычном состоянии, теней или новых декоративных эффектов. Изображения, подписи, композиция Hero и размеры страницы не менялись.

Доступные action names:

| Состояние       | RU                             | EN                         |
| --------------- | ------------------------------ | -------------------------- |
| Воспроизведение | Приостановить слайд-шоу        | Pause slideshow            |
| Ручная пауза    | Продолжить слайд-шоу           | Resume slideshow           |
| Reduced motion  | Продолжить слайд-шоу, disabled | Resume slideshow, disabled |

`aria-describedby` связывает кнопку с локализованным status: воспроизводится / приостановлено / отключено настройкой уменьшения движения. Status использует `aria-live="polite"`. `aria-controls` указывает на Swiper. SVG исключён из accessibility tree. Action label меняется вместе с доступным описанием состояния; `aria-pressed` не используется для этой кнопки с меняющимся названием действия.

## Поведение и lifecycle

- Локальный `manuallyPaused` вызывает штатные `swiper.autoplay.stop()` / `start()`. При паузе `running: false`, автоматические переходы действительно прекращаются.
- Пагинация и клавиатурные стрелки продолжают выбирать слайды, но не меняют ручную паузу. Повторное нажатие активной точки также не возобновляет autoplay.
- Resume запускает обычный цикл Swiper: delay **6500 ms**, fade **1100 ms**. Нет дополнительных таймеров, polling или периодических вызовов `start()`.
- `pauseOnMouseEnter: false` и `disableOnInteraction: false` сохранены. Hover и focus не создают автоматической паузы.
- Reduced motion имеет приоритет: `stop()`, нулевая transition speed, native disabled button. Даже программный `button.click()` не запускает autoplay. После смены preference существующая ручная пауза сохраняется.
- Listener media query снимается на unmount; Vue Swiper уничтожает экземпляр и его обработчики. Ручная пауза относится к текущему mount, не записывается в storage: reload / новый Hero instance снова воспроизводит слайды, если reduced motion не активен.

## Live QA

Playwright Chromium, живой Nuxt dev server `http://localhost:3042`, RU/EN × **1440/390 px**. Проверялись реальные Swiper events и временные метки, а не только CSS classes. Native mouse/touch, Enter и Space активируют control; outline проверен при клавиатурном focus.

| Проверка                               | Результат                                                                           |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| Stationary pointer над Hero            | Минимум три последовательных automatic transitions в каждой комбинации              |
| Manual pause                           | `running: false`, нет `autoplay` events за 8200 ms наблюдения                       |
| Paused pagination / active point       | Manual slide changes работают; autoplay остаётся остановленным                      |
| Paused ArrowRight                      | Выбор следующего слайда работает без возобновления autoplay                         |
| Resume с focus на control              | Настоящий automatic transition после штатного delay; focus не останавливает цикл    |
| Mouse / touch / Enter / Space          | Проверены, name и description обновляются                                           |
| Reduced motion при работающем autoplay | Autoplay останавливается, button disabled, speed 0                                  |
| Reduced motion при ручной паузе        | После возврата normal motion ручная пауза сохраняется                               |
| Reload с reduced motion                | Нет automatic transitions за 8200 ms; Resume недоступен                             |
| Normal reload / remount                | Новый экземпляр играет; Pause/Resume работают                                       |
| Cleanup                                | Старые instances destroyed; Hero motion listener и Swiper visibility listener сняты |
| Accessibility tree                     | Правильные RU/EN names, descriptions, controls и disabled в Chromium AX tree        |
| Overflow / execution errors            | Горизонтального переполнения и `pageerror` в проверенных сценариях нет              |

### Измеренные интервалы

Абсолютные timestamps относятся к отдельным document contexts; сравнивать их между окнами не следует.

| Язык / viewport | Первые три autoplay events, ms от time origin | Resume → autoplay event |
| --------------- | --------------------------------------------- | ----------------------- |
| RU 1440         | 9102 / 16706 / 24317                          | 6502 ms                 |
| EN 1440         | 9091 / 16699 / 24322                          | 6508 ms                 |
| RU 390          | 7389 / 15007 / 22629                          | 6506 ms                 |
| EN 390          | 7379 / 14999 / 22607                          | 6502 ms                 |

Между обычными началами переходов ~7.6 s: delay плюс fade. После ручного Resume первый переход начинается после ~6.5 s. Это прежние тайминги, не изменение UX.

Evidence: [summary](../../.playwright-mcp/stage9-3/summary.json), [RU desktop](../../.playwright-mcp/stage9-3/ru-1440.json), [EN desktop](../../.playwright-mcp/stage9-3/en-1440.json), [RU mobile](../../.playwright-mcp/stage9-3/ru-390.json), [EN mobile](../../.playwright-mcp/stage9-3/en-390.json), [EN lifecycle follow-up](../../.playwright-mcp/stage9-3/en-1440-lifecycle.json), [AX tree](../../.playwright-mcp/stage9-3/accessibility.json).

В QA исправлены две неточности измерения, без дополнительных production fixes: мобильный delay первоначально отсчитывался от позднего snapshot вместо фактического `autoplayStart`; EN remount ожидал `/en/`, хотя equivalent route был `/en`. Мобильные сценарии затем завершились успешно с корректным отсчётом; EN reload/remount проверен отдельно с нормализацией trailing slash. Исходный EN desktop log сохранён с этой тестовой ошибкой; summary указывает follow-up evidence. Это не объявлено дефектом слайдера или маршрутизации.

После unmount остаются application listeners `getSystemColor` и Header `closeOnDesktop`: они не принадлежат уничтоженному Hero. Hero `onMotionChange` и старый Swiper `visibilitychange` в listener balance отсутствуют.

## Контрольные снимки

Viewport **1440×900** и **390×900**, одинаковое первое artwork, исходная композиция и состояние Hero. Панель Nuxt DevTools скрыта только в QA browser для чистого кадра; production styles не менялись для снимков.

| Язык / ширина | Воспроизведение                                   | Ручная пауза                                             |
| ------------- | ------------------------------------------------- | -------------------------------------------------------- |
| RU 1440       | [PNG](../../.playwright-mcp/stage9-3/ru-1440.png) | [PNG](../../.playwright-mcp/stage9-3/ru-1440-paused.png) |
| EN 1440       | [PNG](../../.playwright-mcp/stage9-3/en-1440.png) | [PNG](../../.playwright-mcp/stage9-3/en-1440-paused.png) |
| RU 390        | [PNG](../../.playwright-mcp/stage9-3/ru-390.png)  | [PNG](../../.playwright-mcp/stage9-3/ru-390-paused.png)  |
| EN 390        | [PNG](../../.playwright-mcp/stage9-3/en-390.png)  | [PNG](../../.playwright-mcp/stage9-3/en-390-paused.png)  |

При осмотре контрольных кадров новая кнопка не пересекается с подписями или текстовым блоком, точки остаются по центру. Окончательное согласование визуального размера/положения control остаётся за владельцем проекта.

## Focused checks и файлы

- `test/hero.test.ts`: **3/3**, утверждённые slides/media и RU/EN historical introduction сохранены.
- Scoped ESLint для `HeroSlider.vue`: exit 0, [log](../../.playwright-mcp/stage9-3/eslint.log).
- `npm run typecheck`: exit 0, [log](../../.playwright-mcp/stage9-3/typecheck.log).
- Prettier для Hero, RU/EN UI messages, QA script, DESIGN/ARCHITECTURE и отчёта; `node --check` QA script проходит.
- Full build/generate не запускались: компонент проверен в live browser, source/type checks достаточны для этого control.

Изменены `app/components/HeroSlider.vue`, `i18n/locales/ru.json`, `i18n/locales/en.json`. В `docs/DESIGN.md` и `docs/ARCHITECTURE.md` точечно обновлён контракт ручной паузы. Добавлены этот отчёт, [QA script](../../.playwright-mcp/stage9-3-hero-control-qa.mjs) и evidence в `.playwright-mcp/stage9-3/`. Новых зависимостей и изменений исторических content JSON нет.

Проверено в Chromium, не заявляется реальный NVDA/VoiceOver test или coverage Safari/Firefox. Нативный hidden-tab / visibilitychange сценарий в этом batch не тестировался и не заменялся подменой visibilityState. Очистка visibility listener проверена отдельно при unmount. Среда использует Node 26 при заявленной проектом Node 22; checks здесь прошли.

**Stage 9.3 — AWAITING VISUAL REVIEW. Stage 9 IN PROGRESS.** Другие corrective batches не начаты.
