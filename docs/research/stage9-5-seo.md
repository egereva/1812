# Stage 9.5 — SEO & static deployment readiness

Дата: 2026-10-09. **STAGE 9.5 — AWAITING REVIEW. Stage 9 IN PROGRESS.**

Production origin не предоставлен. Реальный static output намеренно не содержит canonical/hreflang/og:url или sitemap с вымышленными адресами. Их конфигурация, validation и SSR-поведение проверены отдельно с синтетическим QA origin. Deployment и Stage 10 не выполнялись.

## Исходное состояние и причины

Из [Stage 9.1](stage9-1-site-audit.md) подтверждены SEO-01/02/03:

- Все 136 публичных RU/EN страниц уже имели локализованные title/description, исторический текст и явные detail prerender routes. `prefix_except_default`, отключённый browser language detection и стабильные одинаковые slugs обеспечивали правильные языковые маршруты.
- i18n был установлен, но `useLocaleHead` не подключён; canonical и hreflang отсутствовали. В runtime config отсутствовал публичный siteUrl; `.env.example` предлагал placeholder `https://example.com/`.
- Каждая страница отдельно задавала title/description, без общего Open Graph/Twitter head. Одинаковые названия сущностей Dictionary/Timeline/Places давали 14 групп duplicate titles (28 страниц).
- robots.txt и sitemap.xml отсутствовали. Dynamic inventory из content layer был правильным, но section roots зависели от crawling.

## Исправления

`usePageSeo` сохраняет прежние источники title/description, добавляет OG title/description/type/site_name/locale/locale:alternate и Twitter summary/title/description. Detail document title получает локализованный суффикс раздела и проекта. H1, история, переводы и визуальная часть не изменены.

`useSiteSeo` подключает официальный Nuxt i18n `useLocaleHead` в общем layout. При заданном origin создаются один canonical, взаимные `ru`/`en`, региональные `ru-RU`/`en-US` и `x-default` на RU. Языковые variants не дублируются по одному hreflang. OG URL управляется только этим helper; OG locale — только page helper. HTML lang: `ru-RU` / `en-US`.

Все query/hash исключаются из canonical и alternate URLs, включая `?place`, `?event`, `?layer`. Root canonical заканчивается `/`, EN root — `/en/`; другие публичные routes без trailing slash. Нормализация использует уже добавленный i18n app base path, не добавляет его повторно. QA обнаружил вариант root URL `/1812` без trailing slash: он теперь нормализуется в `/1812/`, что покрыто regression test.

`validateSiteOrigin` разрешает пустое значение до deployment, но отклоняет неверный URL, HTTP, localhost/IP, reserved/example domains, credentials/port/query/hash и пути. `validateBaseURL` разрешает `/` и slash-delimited paths вроде `/1812/`. Проверка вызывается при загрузке Nuxt config и в runtime SEO helpers. Она проверяет формат, а не владение доменом/DNS.

`getPublicSeoRoutes` объединяет 12 localized roots и существующие 124 detail routes в **136 уникальных страниц**. Один inventory используется для явного prerender и sitemap. Новые Nitro endpoints prerender robots.txt всегда, sitemap.xml — только при configured origin. Sitemap не включает payload, 200/404 fallback pages, query variants или служебные assets.

Без origin:

- title/description, lang, OG-тексты/locale/type и Twitter metadata остаются в prerendered HTML;
- canonical/hreflang/og:url не создаются;
- robots: `User-agent: *` / `Allow: /`, без Sitemap строки;
- sitemap не записывается в static output; SSR endpoint отвечает 404.

Основание API: [Nuxt i18n useLocaleHead](https://i18n.nuxtjs.org/docs/composables/use-locale-head/), [Nuxt i18n options](https://i18n.nuxtjs.org/docs/api/options), [Nitro prerendering](https://nitro.build/docs/prerendering). Проверен также фактически установленный i18n **10.6.0**, включая присоединение appBase и генерацию locale links.

## Примеры RU/EN metadata

Тексты ниже взяты из фактического generated HTML, без переписывания editorial content.

| Route                            | Document title                           |
| -------------------------------- | ---------------------------------------- |
| `/`                              | 1812. Запад Москвы                       |
| `/en/`                           | 1812. Western Moscow                     |
| `/dictionary/borodino-battle`    | Бородинское сражение — Словарь — 1812    |
| `/en/dictionary/borodino-battle` | Battle of Borodino — Dictionary — 1812   |
| `/timeline/borodino`             | Бородинское сражение — Хронология — 1812 |
| `/en/timeline/borodino`          | Battle of Borodino — Timeline — 1812     |
| `/places/kutuzov-hut`            | Кутузовская изба — Места — 1812          |
| `/en/places/kutuzov-hut`         | Kutuzov Hut — Places — 1812              |

Dictionary example descriptions: RU «Генеральное сражение 26 августа (7 сентября) 1812 года.» / EN “The major battle fought on 26 August (7 September) 1812.” OG/Twitter title and description equal the corresponding document values. OG locales: RU `ru_RU` + alternate `en_US`; EN `en_US` + alternate `ru_RU`.

Изолированная QA-конфигурация использовала **синтетический** `https://fixture.github.io` + `/1812/`; это не выбранный домен проекта и не конфигурация publishable `.output/public`. Для `/en/map` она дала canonical и og:url `https://fixture.github.io/1812/en/map`, RU alternate `https://fixture.github.io/1812/map`, EN self alternate и x-default на RU. Root pairs: `…/1812/` и `…/1812/en/`. Полные записи: [static metadata](../../.playwright-mcp/stage9-5/static-metadata.json), [QA configured metadata](../../.playwright-mcp/stage9-5/fixture-metadata.json).

## Sitemap / robots и полная проверка inventory

| Проверка                           | Результат                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public inventory                   | 136 routes = 12 section roots + 124 details, по 68 RU/EN                                                                                         |
| Generated HTML, origin отсутствует | 136/136: уникальные title и description, корректный lang, OG/Twitter; нет случайного noindex, canonical/hreflang/og:url отсутствуют по контракту |
| Configured SSR с project subpath   | 136/136: один canonical, reciprocal/self RU/EN, x-default, OG URL; отсутствуют дубликаты и повторный base path                                   |
| Sitemap configured QA endpoint     | HTTP 200; все 136 loc точно совпадают с canonical inventory, без дублей/query/malformed URLs                                                     |
| Sitemap без origin                 | Static sitemap.xml отсутствует; generation не публикует фиктивный URL                                                                            |
| Robots без origin                  | Prerendered robots.txt разрешает обход, без Sitemap строки                                                                                       |
| Robots configured QA endpoint      | Ссылка на правильный абсолютный `…/1812/sitemap.xml`                                                                                             |
| Root/subpath URL utilities         | Проверены `/` и `/1812/`, root и EN root, detail routes и очистка query/hash                                                                     |

Матрица включает все запрошенные Homepage, Dictionary index/detail, Timeline detail, Places detail, Map, About и Sources routes в обеих локалях, а не только representative выборку. Проверка читает HTML до hydration. Все 14 групп title duplicates устранены без изменения H1.

**Generate был необходим** для проверки actual prerendered HTML и robots artifact. Sandbox попытка остановилась на esbuild `spawn EPERM`; разрешённый повтор успешно создал **278 Nitro routes** (включая payload/fallback/service artifacts), из которых публичных страниц 136. Production origin оставлен пустым, baseURL `/`. Configured absolute tags и sitemap проверены в изолированном dev SSR, **не в production-origin static build**, поскольку настоящий origin неизвестен. Перед публикацией Stage 10 должен повторить generated HTML/XML suite с реальной конфигурацией.

## Автоматические проверки

| Check                                                       | Результат / evidence                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| SEO unit + affected render/generated navigation regressions | **218/218 PASS**, [log](../../.playwright-mcp/stage9-5-regression.log)      |
| Complete generated metadata/robots suite                    | **2/2 PASS**, [log](../../.playwright-mcp/stage9-5-static-tests.log)        |
| Complete configured SSR metadata/sitemap/robots suite       | **2/2 PASS**, [final log](../../.playwright-mcp/stage9-5-fixture-final.log) |
| Scoped ESLint                                               | Exit 0, [log](../../.playwright-mcp/stage9-5-eslint.log)                    |
| Typecheck                                                   | Exit 0, [log](../../.playwright-mcp/stage9-5-typecheck.log)                 |
| Formatting                                                  | Prettier changed source/test/doc files                                      |
| Static generation                                           | Exit 0, [log](../../.playwright-mcp/stage9-5-generate.log)                  |

Configured test fixtures are isolated in [.playwright-mcp/stage9-5-fixture](../../.playwright-mcp/stage9-5-fixture/). An initial QA pass identified the subpath-root normalization issue; fixed and rerun. Another pass was interrupted by dev-server HMR while formatting; final suite uses bounded fetch and passes completely.

Re-run focused unit/render tests with the project's Node test flags. `test/seo-render.test.mjs` defaults to `.output/public` and empty origin. To test a **real configured generated output**, set `SEO_TEST_ORIGIN` and `SEO_TEST_BASE_URL`; to test SSR also set `SEO_TEST_SERVER`. Optional `SEO_TEST_EVIDENCE` writes JSON. No new dependencies or package scripts were added.

## Changed files

- `nuxt.config.ts`, `.env.example`: validated origin/baseURL, explicit public route inventory, sitemap/robots prerender configuration.
- `shared/seo/config.ts`, `shared/seo/routes.ts`: URL normalization, validation, titles, public inventory and XML/text generators.
- `app/composables/usePageSeo.ts`, `app/composables/useSiteSeo.ts`, `app/layouts/default.vue`: centralized page/social and language URL metadata.
- `server/routes/robots.txt.get.ts`, `server/routes/sitemap.xml.get.ts`: server endpoints and static prerender sources for crawl files.
- Metadata calls only in nine existing page files: `index.vue`, `about.vue`, `sources.vue`, `map.vue`, `dictionary/index.vue`, `dictionary/[slug].vue`, `timeline/index.vue`, `timeline/[slug].vue`, `places/[slug].vue`.
- `test/seo.test.ts`, `test/seo-render.test.mjs`: new regression coverage; `places-detail-render`, `map-index-render`, `timeline-detail-render`, `stage8-navigation-render` adjusted to the shared helper and contextual detail titles/regional lang.
- `docs/ARCHITECTURE.md`, this report; local QA fixture/evidence/logs.

Hero, map components/markers/palettes, Header, Footer, historical content and approved visual styles were not changed in this task. Previously dirty repository files were preserved.

## Stage 10 requirements and remaining limitations

1. Supply the **approved real HTTPS origin** in `NUXT_PUBLIC_SITE_URL`, with no repository path. Leave `NUXT_PUBLIC_I18N_BASE_URL` unset so i18n uses the same origin; do not override it independently.
2. Supply `NUXT_APP_BASE_URL=/` for a domain-root deployment, or `/<repository>/` for project Pages. Trailing slash is required. Do not put the path into both variables.
3. Regenerate with those build-time values. Static hosting cannot update metadata using post-build runtime environment variables. Verify all 136 generated canonical/hreflang/OG pairs, sitemap and static navigation before publishing; clear stale output by normal generation.
4. Verify real host redirects, HTTPS, slash/404 behavior, HTTP headers and crawler policy. For GitHub project Pages, a robots.txt under the project subpath is **not** the origin-root robots file used by crawlers; control over root policy belongs to the hosting origin. The project sitemap can still be submitted by its full subpath URL.

No production host/DNS, Search Console submission, actual indexing, redirects or deployment were tested. Social preview images are not selected: text/type/locale metadata is complete, but no unapproved image URL is introduced. Generation emits Nuxt/i18n/devtools warnings; the installed i18n head helper warns about baseUrl when origin is deliberately absent, including with SEO URL tags disabled. These are not missing/duplicate HTML tags. Environment uses Node 26 versus the declared Node 22 requirement; Stage 10 should use supported Node 22. No visual redesign, historical edits, dependencies or later corrective batches.

**STAGE 9.5 — AWAITING REVIEW.** Stage 9 remains IN PROGRESS; Stage 10 not started.
