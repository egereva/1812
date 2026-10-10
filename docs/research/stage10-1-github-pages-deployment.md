# Stage 10.1 — GitHub Pages deployment

Дата: 2026-10-10. **STAGE 10.1 — DEPLOYED / AWAITING REVIEW.**

Сайт опубликован: **https://egereva.github.io/1812/**. GitHub Actions build/deploy успешны. Дефект locale-switch URL исправлен. После настройки HTTP Referer у провайдера реальная карта RU/EN работает: SDK и тайлы HTTP 200, все 13 мест доступны через маркеры и группы. Production smoke QA прошёл; блокирующих проблем в адресной проверке не осталось. Stage 11 не начат.

## 1. Изменённые файлы и Git

Deployment commit: **`0257387ce347b09d61684942de2d41bf3d9fc64e`**, `Deploy museum to GitHub Pages and finalize accepted UI fixes`. Обычный push в `origin/main` выполнен; HEAD совпадает с origin/main. Force push/history rewrite не использовались.

Новые deployment changes:

- `.github/workflows/deploy-pages.yml` — официальный Pages build/deploy workflow;
- `app/components/SiteHeader.vue` — baseURL для locale switches с полной навигацией;
- `test/pages-deployment.test.mjs` — generated routes, HTML/CSS assets, favicon и desktop/mobile locale-switch regression;
- `docs/research/stage10-1-github-pages-deployment.md` — итоговый отчёт, добавляемый отдельным documentation commit после успешного production Map QA. В текущем pass source code и workflow не менялись.

В deployment commit также включены ранее одобренные изменения: `app/components/InteractiveMap.client.vue`, `app/components/MapPlaceCard.vue`, `app/pages/dictionary/[slug].vue`, `app/pages/map.vue`, `app/utils/yandexMapsLoader.client.ts`, `test/map-chooser-render.test.mjs`, `test/map-reflow.browser.test.mjs`, `test/map-controls.test.mjs`, `docs/research/stage9-6-final-quality-gate.md`.

`nuxt.config.ts`, `package.json`, `.nvmrc`, lockfile, historical JSON, дизайн и структура маршрутов не менялись. Существующие origin/baseURL validation, SEO helpers и prerender inventory переиспользованы. `.env` игнорируется Git. Staged diff проверен: ключ, `.env`, generated output и QA-артефакты в коммит не попали. Созданный Nuxt symlink `dist` удалён; `.output/public` сохранён локально. QA evidence остаётся в игнорируемой `.playwright-mcp/`.

## 2. Production configuration

- Origin: `https://egereva.github.io`.
- `NUXT_APP_BASE_URL=/1812/`; production URL: **https://egereva.github.io/1812/**.
- `NUXT_PUBLIC_SITE_URL` и `NUXT_APP_BASE_URL` заданы явно в workflow build environment. Локальный `.env` на Actions runner не используется.
- Repository secret **`NUXT_PUBLIC_YANDEX_MAPS_API_KEY`** присутствует и использован при generation; workflow допускает fallback на одноимённую repository variable. Проверка отсутствующего ключа останавливает build без вывода значения. Значение ключа не выводилось в чат/отчёт/логи.
- RU/EN routes генерируются через существующий общий inventory. Canonical/hreflang/og:url используют абсолютный production origin и project base path без localhost/placeholder или двойного `/1812/`.
- Sitemap содержит **136** публичных URLs. `/1812/robots.txt` ссылается на `https://egereva.github.io/1812/sitemap.xml`.
- CSS/JS/images/favicon используют base-aware пути. Шрифты — существующие системные font stacks, без новых remote font assets.

## 3. Workflow и результат Actions

Trigger: push в `main`, дополнительно `workflow_dispatch`. Ubuntu runner, Node **22.23.3**, npm cache, `npm ci`, `npm run generate`. После generation запускаются `test/seo-render.test.mjs` и `test/pages-deployment.test.mjs`; артефакт `.output/public` загружается только после успешных assertions.

Официальные actions: checkout@v4, setup-node@v4, configure-pages@v5, upload-pages-artifact@v3, deploy-pages@v5. Configure-pages не модифицирует Nuxt config через `static_site_generator`. Build permissions: `contents: read`, `pages: read`; deploy: `pages: write`, `id-token: write`. Environment `github-pages`, deploy только для `refs/heads/main`. Общая concurrency group `github-pages`, `cancel-in-progress: false`.

Pages API подтвердил `build_type: workflow`, source main, HTTPS enforced и согласованный URL. GitHub Actions разрешены. Видимость репозитория (private) не менялась. GitHub CLI авторизован как egereva; настройка Pages уже была включена к моменту повторной проверки. Попытка create вернула 409 Already enabled; последующий GET подтвердил workflow source.

**Первый workflow: [38066490726 — SUCCESS](https://github.com/egereva/1812/actions/runs/38066490726).** Build: npm ci, generate, metadata/assets tests и artifact upload — success. Deploy job — success, завершён 2026-10-10 **19:10:09 MSK**. CI generation: **416 Nitro prerender routes**, включая payload/service artifacts; **136 public pages**, **8578 HTML references**. CI generated suites: **5/5 PASS**.

Основание: [официальный Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [deploy-pages](https://github.com/actions/deploy-pages). Nuxt 4 `.output/public` используется явно; новый механизм генерации не добавлялся.

## 4. Исправление locale links и production preflight

Root cause первоначального blocker: Header использует `NuxtLink external` для смены языка на Homepage/Map, сохраняя полную навигацию при Yandex SDK. `useSwitchLocalePath` возвращает router path без app base; обычный NuxtLink добавляет base через router, но `external` обходил router. В generated HTML было восемь anchors без `/1812/`: desktop/mobile для `/`, `/en/`, `/map`, `/en/map`.

Исправление: `localeSwitchTarget(code)` использует существующий Nuxt URL helper `withBase` из ufo и runtime `app.baseURL` **только** для другой локали на Homepage/Map, где ссылка использует full navigation. Router links получают прежний target. `external` и `no-prefetch` safeguards сохранены; текущий язык не превращён в full navigation. Одинаковый helper применяется к desktop/mobile. Дизайн, SEO contract, routes и исторический контент сохранены.

Основание механизма: [NuxtLink implementation](https://github.com/nuxt/nuxt/blob/main/packages/nuxt/src/app/components/nuxt-link.ts), [ufo withBase](https://github.com/unjs/ufo#withbaseinput-string-base-string). Проверена также установленная реализация Nuxt.

| Проверка                                                    | Результат                                                                                      |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Local production generation, Node 22.23.3/npm 10.9.9        | Exit 0; 415 Nitro prerender routes, 136 public pages; `.output/public` около 111 MB            |
| Focused SEO unit/render + deployment + map controls/chooser | **19/19 PASS**                                                                                 |
| Public route/link/asset inventory                           | **136 routes / 8578 HTML references**; CSS asset references и SVG favicon PASS                 |
| Desktop/mobile language switches in generated HTML          | Все 136 страниц; 4 anchors на страницу; correct RU/EN counterpart и baseURL                    |
| Production `/1812/` browser matrix                          | **12/12 PASS**                                                                                 |
| Development `/` browser matrix                              | **12/12 PASS**                                                                                 |
| Typecheck                                                   | PASS                                                                                           |
| Scoped ESLint                                               | PASS: Header и новый test; ранее одобренные source/test files проверены в предыдущем preflight |
| Scoped Prettier / git diff check                            | PASS                                                                                           |
| Secret/artifact scan staged diff                            | PASS; значение локального ключа не обнаружено в commit candidates                              |

Для каждой browser matrix: desktop 1440 px на Homepage, Map, Dictionary/index+detail, Timeline/index+detail, Place detail, About, Sources; mobile 390 px на Homepage, Map, Dictionary detail. Каждый сценарий проверяет RU → EN → RU, hover/focus/Enter, direct URL, reload и back/back/forward/forward. Document identity подтверждает full reload только на Homepage/Map; остальные переключения остаются router navigation. Неверных/doubled prefixes, `NUXT_E7001/E7003` и page errors — **0**. Полный повтор Stage 9 не проводился.

Generation сохраняет ранее наблюдавшиеся Nuxt console.time/timeEnd label warnings при параллельном prerender. Exit 0 и metadata assertions проходят; это не причина текущего blocker. Количество Nitro service routes может отличаться между local/CI, публичный inventory одинаков: 136.

Локальные evidence: [generation](../../.playwright-mcp/stage10-1/generate.log), [focused tests](../../.playwright-mcp/stage10-1/resume-tests.log), [production browser](../../.playwright-mcp/stage10-1/locale-production-results.json), [development browser](../../.playwright-mcp/stage10-1/locale-development-results.json), [typecheck](../../.playwright-mcp/stage10-1/resume-typecheck.log), [scoped lint](../../.playwright-mcp/stage10-1/resume-eslint.log), [Actions log](../../.playwright-mcp/stage10-1/actions-first-run.log).

## 5. Smoke QA опубликованного сайта

**Повтор после восстановления SDK: 18/18 representative RU/EN pages:** главная, Dictionary/index+detail Berezina, Timeline/index+detail Borodino, Map, Place detail Kutuzov Hut, About, Sources. Все прямые URL и reload отвечают HTTP 200; HTML language, canonical и alternates соответствуют локали/production baseURL. Hydration работает, CSS/JS и запрошенные images/favicon загружаются. Assertions проверили готовность eager images. Local generated suite покрывает остальные публичные ссылки и assets.

| Проверка                                           | Результат                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Public direct URLs/reload                          | 18/18 PASS                                                                                  |
| Canonical/hreflang                                 | 18/18 production pairs PASS; generated CI suite покрывает все 136                           |
| Application assets HTTP errors                     | 0; favicon HTTP 200                                                                         |
| Application page errors / NUXT payload diagnostics | 0 / 0                                                                                       |
| Sitemap                                            | HTTP 200; 136 production URLs                                                               |
| Project robots                                     | HTTP 200; правильный absolute Sitemap URL                                                   |
| Origin `/robots.txt`                               | HTTP 404; project robots не управляет crawler policy всего origin                           |
| Реальная карта RU/EN                               | **PASS**: SDK и tiles HTTP 200; маркеры, фильтры, карточки, zoom/pan и place links работают |

Public evidence: [final smoke results](../../.playwright-mcp/stage10-1/public-smoke-final-results.json), [RU map](../../.playwright-mcp/stage10-1/public-final-ru-map.png), [EN map](../../.playwright-mcp/stage10-1/public-final-en-map.png). Реальная карта готова в обеих локалях; page errors, NUXT payload diagnostics и failed application assets — 0. Dedicated Map QA дополнительно проверил Console: errors — 0.

## 6. Закрытие production Yandex Maps blocker

Пользователь добавил `localhost` и `egereva.github.io` в HTTP Referer ограничения браузерного ключа. В начале повторной проверки новая сессия Chromium ещё получила HTTP 403 / ERR_BLOCKED_BY_ORB; последующая проверка без изменений кода получила **HTTP 200 application/javascript** с тем же фактическим Referer `https://egereva.github.io/`. Это согласуется с распространением настроек провайдера. [Официальная документация Яндекса](https://yandex.ru/maps-api/docs/js-api/limit.html) указывает 15 минут после сохранения ограничений.

Production и local SHA-256 fingerprints совпадают; в evidence сохранены только усечённые безопасные отпечатки. Secret присутствует и корректно передан workflow при generation. Значение ключа, URL с apikey и секреты не выводились. Referer не подменялся, proxy/mock/DOM/CSS workaround не применялись. Настройки провайдера выполнены пользователем; application source в этом pass не менялся.

**Финальный live QA: RU/EN PASS на настоящем JS API 3.0, desktop Chromium 1440 × 1000.**

- Все **13** неизменённых мест действительно представлены индивидуальными marker buttons: проверены исходные одиночные маркеры и раскрытие всех overlapping groups с сопоставлением title production catalog. В исходном fit view отображаются **7** representative buttons из-за принятой группировки; это не потеря шести мест и не требование отображать 13 pins одновременно.
- Фильтры `1812` / `memory` / `all`: **6 / 7 / 13** записей, правильное pressed state; управление через Enter.
- Маркер Enter открывает карточку; Escape закрывает и возвращает focus на marker/group. Повторное открытие и close button работают.
- Настоящий wheel изменяет SDK zoom **13 → 14**; drag меняет camera center. QA-only observer захватывает настоящий SDK instance, передавая исходные constructor/options без подмены карты; provider DOM не изменён.
- Card link ведёт на правильный RU/EN `/1812/.../places/[slug]`, detail открывается; browser Back возвращает к работающей карте.
- SDK HTTP **200** в RU/EN; завершённые tile requests HTTP **200**. Штатные ERR_ABORTED для устаревших tile requests при camera changes/navigation учитываются отдельно, не объявляются ошибками загрузки.
- Page errors, Console errors, критические request failures, NUXT payload diagnostics — **0**. Horizontal document overflow отсутствует. Attribution и provider controls визуально доступны.

Evidence: [key/SDK verification](../../.playwright-mcp/stage10-1/final-403-investigation.json), [dedicated map QA](../../.playwright-mcp/stage10-1/production-map-final-before-report.json), [RU map screenshot](../../.playwright-mcp/stage10-1/production-ru-map-before-report.png), [EN map screenshot](../../.playwright-mcp/stage10-1/production-en-map-before-report.png). Исходные [403 diagnosis](../../.playwright-mcp/stage10-1/map-diagnostic.json) и [localhost comparison](../../.playwright-mcp/stage10-1/map-local-diagnostic.json) остаются историческими evidence.

Отчёт фиксируется отдельным documentation commit; push в main запускает повторный Pages workflow. Повторную production map проверку после этого deployment сохранять в [post-deployment evidence](../../.playwright-mcp/stage10-1/production-map-final-after-report.json). Результат соответствующего run доступен в [Deploy GitHub Pages workflow](https://github.com/egereva/1812/actions/workflows/deploy-pages.yml).

Оставшиеся ограничения: origin `/robots.txt` отвечает 404, project robots не управляет host-wide policy; social preview image не выбирался; indexing/Search Console и полный cross-browser audit не выполнялись. Native zoom evidence Stage 9 сохраняется; этот final smoke не заявлен новым native-zoom аудитом. Stage 11 не начат.

## 7. Дальнейшие обновления

Одобренные дальнейшие изменения публикуются обычным commit/push в `main`: workflow выполняет npm ci, generate, production metadata/assets checks и официальный Pages deployment. Секрет/URL/metadata задаются при сборке, смена repository secret требует повторной генерации. Domain restrictions того же ключа задаются у провайдера и не требуют изменения сайта. Локальный `.env`, `.output`, QA-скриншоты и временные файлы не коммитятся. Сохранённые screenshots/logs/test fixtures остаются локальными QA evidence.

**STAGE 10.1 — DEPLOYED / AWAITING REVIEW.**
