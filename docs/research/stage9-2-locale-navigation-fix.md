# Stage 9.2 — Static locale navigation fix

Дата: 2026-10-09. **AWAITING REVIEW. Stage 9 IN PROGRESS.**

Устранён FNC-01 из [Stage 9.1 audit](stage9-1-site-audit.md): `NUXT_E7001/E7003` при предзагрузке ссылок переключения языка в статическом output. Другие corrective batches не начаты.

## Причина и воспроизведение до изменения

Свежий output предыдущего аудита обслуживался строгим static server по `http://localhost:3092` без SPA fallback. Playwright Chromium подтвердил обе ошибки на всех четырёх маршрутах до клика:

| Исходный route | Фактический аргумент `link:prefetch` |
| -------------- | ------------------------------------ |
| `/`            | `http://localhost:3092/en`           |
| `/en/`         | `http://localhost:3092/`             |
| `/map`         | `http://localhost:3092/en/map`       |
| `/en/map`      | `http://localhost:3092/map`          |

Evidence: [before.json](../../.playwright-mcp/stage9-2/before.json), четыре подтверждённых случая на 1440 px. Наблюдались настоящие события Nuxt и HTTP responses; диагностика не подменялась искусственным вызовом prefetch.

Header намеренно использует `:external="isYandexRoute && code !== locale"` для противоположного языка на Homepage / Map: требуется полная загрузка документа для локали Яндекс API. Prefetch этих ссылок оставался включён. NuxtLink передавал абсолютный same-origin URL, а Nuxt payload plugin, проверив совпадающий hostname, передавал его в `loadPayload()`.

Установленный Nuxt отклоняет hostname в аргументе payload URL: сначала `NUXT_E7001`, затем catch сообщает `NUXT_E7003`. Проверены `node_modules/nuxt/dist/app/plugins/payload.client.js`, `app/composables/payload.js`, `app/diagnostics/state.js` и NuxtLink props. Ошибка происходит **до отправки ошибочного HTTP payload-запроса**: неверный аргумент prefetch нельзя выдавать за фактически отправленный request.

При этом нормальные HTTP requests работали уже до исправления, например:

```text
GET /en/map/_payload.json?_b=313bdcf7-db91-4504-97dd-0a339aca87e1 → 200
GET /en/_payload.json?_b=313bdcf7-db91-4504-97dd-0a339aca87e1 → 200
```

`_b` — generated build ID, не locale или deployment prefix. Runtime `app.baseURL` равен `/`; `nuxt.config.ts` использует `NUXT_APP_BASE_URL || '/'`, i18n — `prefix_except_default`, RU default, без browser-language redirect. `/en` и `/en/` разрешаются в один prerendered `en/index.html`; аналогичные HTML и payload существуют для `/map` и `/en/map`. Причина не в отсутствующих prerender routes, `baseURL`, query-параметрах или неработающем i18n switching.

## Минимальное исправление

В [SiteHeader.vue](../../app/components/SiteHeader.vue) у обеих групп language links — desktop Header и mobile menu — добавлено:

```vue
:no-prefetch="isYandexRoute && code !== locale"
```

Отключена только предзагрузка той ссылки, которая уже использует external/full-document navigation. Сохранены `external`, `switchLocalePath()`, query-параметры, same-tab переход, доступные имена и существующее закрытие мобильного меню. Остальные внутренние ссылки продолжают prefetch и client navigation. Глобальные NuxtLink defaults, i18n, `baseURL`, routing architecture и зависимости не изменены.

Изменение production-кода — **два атрибута в одном компоненте**. Hero, карты, стили, контент и SEO не менялись. Сравнение SHA-256 с защищёнными файлами предыдущего аудита показывает изменение только `app/components/SiteHeader.vue`: [prerender-integrity.json](../../.playwright-mcp/stage9-2/prerender-integrity.json).

## Проверка после изменения

Для этого дефекта необходим реальный обновлённый static output: выполнен **один generate после исправления**, 277 prerendered routes, включая payload. Все **136 content routes** имеют HTML и валидный JSON payload. Повторного generate не было.

Live static browser QA — **8/8 PASS**: четыре исходных маршрута × 1440/390 px, RU/EN. На мобильном языке переключались через mobile menu и через верхний Header; использован native touch input.

| Сценарий                        | Результат                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Прямая загрузка четырёх routes  | HTTP 200, правильный `html lang`, `baseURL: '/'`                                                                                |
| Видимый locale link до клика    | Нет E7001/E7003 и абсолютного language-link prefetch                                                                            |
| Hover и keyboard focus до клика | Проверены для Header и mobile menu; payload diagnostics отсутствуют                                                             |
| RU→EN→RU / EN→RU→EN             | Equivalent route, правильный lang; полная загрузка документа подтверждена сменой `performance.timeOrigin`                       |
| Back / Forward                  | Возвращают ожидаемый язык и маршрут                                                                                             |
| Reload                          | Язык маршрута сохраняется; payload diagnostics не возвращаются                                                                  |
| Map query                       | `?place=kutuzov-monument&event=council-fili` сохраняется при смене языка туда-обратно; карточка остаётся доступной              |
| Обычная внутренняя навигация    | Header/menu → Dictionary → Barclay-de-Tolly detail проходит; relative-path prefetch продолжает работать                         |
| Прямые static details           | Dictionary `/dictionary/barclay-de-tolly`, Timeline `/timeline/council-fili`, Places `/places/triumphal-arch`, RU/EN — HTTP 200 |
| Actual payload responses        | **668 responses, все HTTP 200**; это число событий, включая повторные загрузки, а не уникальных routes                          |
| Ошибки выполнения               | 0 pageerror, 0 NUXT_E7001/E7002/E7003                                                                                           |

Evidence: [after.json](../../.playwright-mcp/stage9-2/after.json) содержит отдельные checkpoints direct-load, hover/focus, after-switch, back, forward, reload, detail navigation и все наблюдавшиеся payload URLs/statuses. Перед кликом тест ожидает доступность Vue app и время для предзагрузки; после взаимодействий проверяет общую console историю, поэтому исчезновение ошибок не оценивалось только по клику.

Исполняемый focused regression script: [stage9-2-locale-qa.mjs](../../.playwright-mcp/stage9-2-locale-qa.mjs). Режим `--before` предназначен для старого output и ожидает подтверждённые ошибки; обычный режим проверяет исправленный output. Не запускать `--before` поверх уже исправленного output как positive test.

## Focused checks

| Проверка                     | Результат / evidence                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `test/links.test.ts`         | **2/2**, [log](../../.playwright-mcp/stage9-2/links-test.log)                                                            |
| `test/links-render.test.mjs` | **1/1**, проверка всех generated source/attribution anchors; [log](../../.playwright-mcp/stage9-2/links-render-test.log) |
| Scoped ESLint: SiteHeader    | Exit 0, [log](../../.playwright-mcp/stage9-2/eslint.log)                                                                 |
| `npm run typecheck`          | Exit 0, [log](../../.playwright-mcp/stage9-2/typecheck.log)                                                              |
| Prettier                     | Header, новый QA script и отчёт соответствуют formatting                                                                 |
| QA script syntax             | `node --check` проходит                                                                                                  |
| `npm run generate`           | Exit 0, [log](../../.playwright-mcp/stage9-2/generate.log)                                                               |

## Ограничения и оставшиеся замечания

Проверено на локальном root-path static server и Chromium. Production hosting, deployment subpath и другие браузеры не объявляются проверенными; конфигурация deployment не менялась. Node в среде — 26.4.0, declared project engine — Node 22; это известное ограничение среды, проверки здесь прошли.

Сохранился отдельный известный `/favicon.ico` 404. Поэтому не заявляется полное отсутствие любых console errors: устранены конкретные payload diagnostics, являвшиеся задачей Stage 9.2. Favicon не является причиной E7001/E7003 и не исправлялся в этом batch.

Скриншоты не используются как доказательство сетевого исправления: достаточное evidence — реальные prefetch events, payload responses, console history, URL/lang/history checkpoints и focused tests.

Новые файлы: этот отчёт, QA script и `.playwright-mcp/stage9-2/` с JSON/log evidence. Production-файл: только `app/components/SiteHeader.vue`.

**Stage 9.2 — AWAITING REVIEW. Stage 9 IN PROGRESS.** Другие corrective batches и deployment не начаты.
