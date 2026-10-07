# Архитектура

## Stage 5 — presentation Timeline

`app/data/timelinePresentation.ts` содержит stable landmark IDs, short localized labels для Homepage и event → Dictionary artwork mapping. Это отдельные presentation решения, не изменения historical JSON, relations или production featured. Чистые функции получают sorted events и localized Dictionary через facade от вызывающей страницы/компонента; runtime manifest не импортируется. Build-time проверка файлов в `nuxt.config.ts` передаёт `timelineMediaAvailableSrcs` для полного Timeline. Homepage использует собственный `getHomepageTimelineEvents` из approved curated inventory, без повторного runtime whitelist: наличие всех шести файлов проверяется content tests. Общий initial ID — `invasion-neman`; metadata разрешаются до initial SSR/client render. `npm run test:homepage-render` после generate проверяет реальный SSR active artwork и все шесть strip images в обеих локалях.

`TimelineArtwork` переиспользует MuseumImage и normalized MediaAsset metadata/source lookup. `HomepageTimeline` переиспользует Dictionary artwork mapping, но имеет независимый curated subset в `app/data/homepageTimelineMedia.ts`: Неман → Бородино → Фили → выход из Москвы → Малоярославец → Березина. Порядок берётся из production chronology; full Timeline landmark `manifest-end-war` сохраняется. Там же находятся localized Homepage-only metadata approved Neman artwork, с source lookup через новые media records в обоих sources.json. Homepage хранит только local active ID, без shared state, carousel или autoplay; desktop semantic buttons поддерживают focus/tap/hover и ArrowLeft/Right/Home/End. Mobile/tablet использует отдельную native scroll-snap ordered list с прямыми detail links и focus scroll into view. Основной index остаётся SSR ordered list; библиотека viewer загружается клиентом при открытии. Timeline detail routes/template не меняются в этом pass.

## Структура репозитория

Timeline detail читает production `TimelineEvent.image` напрямую через content facade; Homepage/full-index presentation mapping к detail не применяется. `formatTimelineDates` форматирует только явно заданные календарные поля. Reactive record, relations и previous/next обновляются при смене slug/locale; соседние события определяются через `getTimelineEvents` (`sortDate → id`) и исключаются из related Timeline links. Общий `TimelineArtwork` сохраняет normalized caption/source и MuseumImageViewer. Post-generate `npm run test:timeline-detail-render` проверяет все 40 SSR страниц, абзацы, даты, медиа, источники и локализованную chronological navigation.

Stage 1 добавил типы, JSON двух локалей, content layer, тесты и минимальные технические detail страницы. Stage 1.3 заменил RU данные финальным проверенным пакетом, Stage 1.5 загрузил утверждённый EN перевод. Stage 2 добавил общий layout, CSS токены, header/footer и временные страницы разделов. Content Foundation и визуальный каркас завершены; содержательные интерфейсы и медиа появятся в следующих этапах. Отдельный модуль Nuxt Content не требуется.

```text
app/
  assets/css/              # tokens, global styles
  components/              # layout, hero, dictionary, timeline, map, media, related
  composables/              # UI behaviour and access to content facade
  layouts/default.vue
  pages/
    index.vue
    dictionary/index.vue
    dictionary/[slug].vue
    timeline/index.vue
    timeline/[slug].vue
    map.vue
    places/[slug].vue
    about.vue
    sources.vue
  plugins/                  # only if map loader needs one
content/
  ru/                       # site, places, dictionary, timeline, sources JSON
  en/                       # same JSON shape and entity IDs/slugs
shared/
  types/content.ts
  content/index.ts          # typed imports, selectors, relations, date sorting, routes
test/content.test.ts        # проверки content layer
public/images/
  hero/ places/ dictionary/ timeline/ before-after/
docs/
nuxt.config.ts
package.json
package-lock.json
.env.example
.gitignore
```

Технические detail страницы получают подготовленные объекты через `shared/content/index.ts`, а не импортируют JSON по физическому пути. Слой делает типизированные импорты, выбор локали, поиск по ID/slug, сортировку, разрешение связей и обработку отсутствующих optional полей. `getCatalogProblems` останавливает production сборку при повторных ID/slug, битых связях и расхождении стабильных RU/EN структурных полей; resolver пропускает отсутствующую цель при чтении. Каталоги читаются из локальных JSON на этапе сборки, без fetch и backend. Для общих данных и логики не нужен отдельный глобальный store.

## Маршруты и языки

`@nuxtjs/i18n`: `defaultLocale: 'ru'`, `strategy: 'prefix_except_default'`, `detectBrowserLanguage: false`, `ru-RU` и `en-US`. Русские маршруты без префикса; английские с `/en`. Модуль отвечает за локализованную маршрутизацию, SEO и короткие UI-переводы из `i18n/locales/*.json`. Исторический контент RU/EN остаётся в отдельных `content/ru` и `content/en` JSON-файлах; его не переносить в locale messages. Одинаковые ID и slug сохраняются в обеих версиях. Header использует `useLocalePath()` для навигации и `useSwitchLocalePath()` для смены языка на эквивалентном маршруте. Текущий URL определяет язык интерфейса и контента, включая `/`; browser/system language, Accept-Language и сохранённая locale cookie не переопределяют язык маршрута.

Для каждого маршрута: локализованные `title`, `description`, `html lang`, canonical на текущую языковую версию, `hreflang` RU/EN и `x-default` на RU, базовые Open Graph теги. Для detail страниц текст метаданных берётся из JSON с необязательным явным override. RU и EN исторические материалы теперь полные production наборы; новый материал требует проверенного перевода до сборки. Stage 2 устанавливает `html lang`, заголовок и описание временной главной, а также рабочий переключатель. Окончательный SEO для всех страниц относится к Stage 9.

## Статическая генерация и GitHub Pages

`ssr: true`, команда `nuxt generate`. `getDynamicPrerenderRoutes()` **автоматически** читает slug `places`, `dictionary` и `timeline` из JSON обеих production локалей; `nuxt.config.ts` добавляет их к двум статическим корневым маршрутам в `nitro.prerender.routes`. `contentRelease` задаёт `ru: production`, `en: production`. Сборка требует полного соответствия наборов ID, одинаковых slug, связей, source IDs, координат, статусов Place, дат и других структурных исторических полей. Одинаковая строка ID в разных типах сущностей допустима: поиск использует тип и ID. Список detail URL вручную не поддерживается. Link crawling — дополнительная проверка, не единственный источник URL. Три минимальные страницы `[slug].vue` существуют только для проверки загрузки и prerender; окончательный UI относится к следующим этапам. Неизвестный slug даёт 404 в dev/SSR.

`app.baseURL` задаётся из переменной сборки: `/` для домена и `/<repo>/` для project Pages. Canonical и OG используют отдельный абсолютный публичный `siteUrl`, который задаётся при deployment. Изображения и внутренние ссылки проходят через baseURL, без жёстко записанного `/` перед путями. Проверить результат на локальном статическом сервере и на Pages под подпутём; fallback `404.html` не заменяет prerender, поскольку GitHub Pages возвращает для него статус 404. Конкретный URL репозитория пока неизвестен и задаётся перед публикацией.

Три hero asset конфигурируются в `app/data/heroSlides.ts` по approved `docs/research/media-manifest.json`; редакционный manifest не импортируется в runtime. `nuxt.config.ts` проверяет наличие файлов в `public/` при запуске и передаёт доступные ID через public runtime config. `HeroSlider` появляется только когда доступны все три файла; иначе остаётся безмедийный hero без `img src` и фиктивных controls. После добавления бинарных файлов dev server нужно перезапустить. `npm run dev` использует отдельный `.nuxt-dev`, чтобы проверки и генерация не перезаписывали служебные файлы работающего dev server.

Основание: [Nuxt static hosting](https://nuxt.com/docs/4.x/getting-started/deployment), [Nuxt prerender hooks](https://nuxt.com/docs/4.x/api/advanced/hooks), [Nuxt i18n SEO](https://i18n.nuxtjs.org/docs/guide/seo), [переключение языка](https://i18n.nuxtjs.org/docs/guide/lang-switcher), [динамические пути медиа](https://nuxt.com/docs/4.x/getting-started/assets).

## Связи контента

`Place`, `DictionaryEntry`, `TimelineEvent` и `Source` имеют стабильные строковые ID. Связи хранятся как массивы ID по типам. `resolveRelatedContent(locale, kind, id)` объединяет явные исходящие и обратные ссылки, возвращает четыре группы (`places`, `dictionary`, `timeline`, `sources`) без дубликатов. Отсутствующая цель пропускается при чтении, но production сборка считает битые связи ошибкой. Локализованный заголовок никогда не является ключом связи. Неизвестная локаль выбирает RU; отсутствующий EN материал **не подменяется** RU текстом. Оба `site.json` с локализованными `title`, `description`, `contentStatus` одинаково адаптируются к `SiteContent`; секции главной остаются пустыми до отдельного контента.

У `Place` координаты обязательны, современный `address` необязателен. `category` остаётся свободной классификацией; обязательные `historicalStatus` и `locationPrecision` отдельно описывают статус объекта и точность привязки. Их допустимые значения централизованы в `shared/types/content.ts` и проверяются при сборке; для одной сущности значения совпадают в RU/EN. Необязательные `locationNote` и `historicalNote` — локализованный контент. Механика связей и маршрутов от этих полей не зависит.

Основная отображаемая дата события 1812 года — **по старому стилю (юлианскому календарю Российской империи)**. `dateOldStyle` обязателен; `dateNewStyle` добавляется только когда соответствие подтверждено источником. Для диапазона используются явные `dateEndOldStyle` и при наличии `dateEndNewStyle`. Никаких неявных календарных преобразований в приложении. Отдельный `sortDate` хранит нормализованный ключ `YYYY-MM-DD`, явно подготовленный редактором; `sortTimelineEvents` сортирует по нему, затем по `id`, не меняя исходный массив. Правило показа подписей и сопоставление дат будут проверены на реальном материале при его отдельной подготовке.

## Границы компонентов

Страницы собирают секции и SEO, а компоненты отвечают за один интерфейсный паттерн. Текущую карту составляют `app/pages/map.vue`, `InteractiveMap.client.vue` и `MapPlaceCard.vue`: client-компонент получает набор `Place`, выбранный slug, локаль и API key, а страница владеет URL/context state. Homepage Map Preview uses SSR `HomepageMapPreview.vue` for catalog-derived description, reserved dimensions and no-JS fallback; `HomepageMapCanvas.client.vue` creates a separate restrained YMap through the same memoized loader as InteractiveMap. Client initialization waits for Nuxt's client-only DOM and for IntersectionObserver proximity (240px). The observer disconnects before initialization and on unmount; a disposed guard prevents late creation, and map.destroy() releases the instance. Vue owns the preview pointer handlers and hover watcher. One YMapListener records the first settled fitted camera once; it is removed before map destruction. Fine-pointer hover calls setLocation with absolute saved-center/zoom targets (+0.3, 400ms, ease-in-out), never refitting bounds or using the animated camera as its baseline. Reduced-motion/coarse-pointer contexts skip hover camera changes; fractional zoom uses smooth rounding. A single localized NuxtLink overlay navigates the visible preview to Map, with a 56px bottom exclusion only in the ready state to preserve provider attribution; it remains available in SSR/loading/failure states. All 13 unchanged coordinates and statusLayer colors use the approved marker SVG; the camera fits the entire catalog with pixel margins. The obsolete static projection utility and fan tests are removed. [Post-Stage-6.3 refinement evidence](research/homepage-yandex-map-preview.md).

При финализации Stage 4 первоначально запланированный `DictionaryDialog` / modal preview намеренно исключён из scope: полноценные `/dictionary/[slug]` и `/en/dictionary/[slug]` являются основным просмотром записи. Ссылки главной и index ведут прямо на detail; обычная маршрутизация сохраняет прямой URL и back/forward. Дополнительный preview дублировал бы detail UX и создавал лишний промежуточный уровень. Это принятое изменение UX, а не отложенная реализация.

## Image viewer

Place details resolve the current locale/slug reactively through `getPlaceBySlug`, then use `resolveRelatedContent(locale, 'place', id)` for all supporting groups and historical sources. Basic title/description follow the existing JSON override pattern. `PlaceMedia` renders covers/gallery with `MuseumImage`, `normalizeMediaCaption`, centralized localized media sources and `WebsiteLink`; it adds no viewer or runtime content schema. Full articles, status/precision and supplied notes remain SSR/static content. Place → Map uses the existing localized `mapPlaceUrl`; no Yandex instance is created. Gallery images remain separate assets without previous/next Place ordering. Optional valid `beforeAfter` pairs render through `PlaceImageComparison` after History and before Related materials. The reusable component uses one full-size image overlay clipped at the slider value, native Pointer Events/capture and local state (initial 50%, keyboard steps 5%, Home/End 0/100). Vue owns all pointer handlers; pointer up/cancel/lost capture and unmount release capture, and pair identity changes reset state. No global drag listeners, additional lightbox or dependency is added. Frame touch-action preserves vertical scrolling; the grip captures direct touch manipulation. BaseURL and `WebsiteLink` source attribution follow existing media/link contracts.

`MuseumImage` — общий SSR-совместимый trigger для production `MediaAsset`: принимает `image`, опциональные `images: MediaAsset[]` и `index` (по умолчанию 0). Без `images` открывает один asset. Подключён к Dictionary, Timeline и Place detail. Это viewer изображения; исключение modal preview статьи не меняет его scope.

`useMuseumImageViewer` динамически импортирует PhotoSwipe 5.4.4 только из обработчика открытия в браузере. Реальные dimensions считываются из локальных изображений через `Image.decode()`; schema исторического контента не меняется. `baseURL` учитывается для trigger и viewer. Metadata берутся только из `MediaAsset` и `getSourceById`; rights/license показываются в существующем credit, отдельное поле не придумывается. DOM metadata создаётся через `textContent`, без HTML из контента. При закрытии/размонтировании удаляются viewer, observer, scroll lock и временный inert фона; focus возвращается к trigger. Core JS не нужен для SSR/static generate.

## Яндекс Карты

Final Stage 6.3 использует JavaScript API **3.0** напрямую на `/map` / `/en/map`, plus the post-approval Homepage preview. `app/pages/map.vue` SSR-рендерит контекст, слои, карточку по `?place={slug}` и индекс Places; `InteractiveMap.client.vue` после гидратации создаёт один `YMap` с базовым и marker layer. Один memoized loader в `yandexMapsLoader.client.ts` ждёт `ymaps3.ready`, обрабатывает ошибку/таймаут; при размонтировании экземпляр карты уничтожается, pointer listener снимается и marker interaction listeners отменяются. Повторная навигация в той же локали переиспользует API script; переключатель языка на Map и Homepage выполняет same-tab document navigation для правильного языка API. Клиентский ключ передаётся через `runtimeConfig.public.yandexMapsApiKey`, переопределяемый `NUXT_PUBLIC_YANDEX_MAPS_API_KEY`; для статической генерации переменная нужна во время сборки. Ключ публичен в браузере, поэтому должен быть ограничен HTTP Referer у провайдера.

Координаты Places остаются `{lat, lon}`, в API передаются как `[lon, lat]`. `mapPresentation.ts` выводит All/1812/Memory из `historicalStatus` (13/6/7), разрешает slug и вычисляет детерминированные группы пересечений в экранных пикселях. `YMapMarker` содержит одну общую approved SVG-форму: graphite для 1812, burgundy для Memory. Локальный fan-out меняет только экранное положение, не production координаты. Выбор обычного Place отражается в query без навигации страницы; Place detail ведёт на точный `?place=`. Event context, Dictionary integration и ready-state index/legend реализованы, как описано ниже. При отсутствии ключа, сети или JavaScript доступна навигация ко всем 13 страницам мест. Homepage also receives the localized catalog, renders exactly three same-tab detail links and a Map CTA, and loads the shared API only when the preview approaches the viewport. `behaviors: []` disables map gestures; no filters, cards, controls or query state are added. Provider-owned attribution remains intact. Camera state в URL не сохраняется. Основание: [подключение API 3.0](https://yandex.com/maps-api/docs/js-api/common/connection/javascript.html), [собственные маркеры](https://yandex.com/maps-api/docs/js-api/object/markers/index.html).

## Зависимости и проверки

В `package.json` Stage 0 объявлены `nuxt`, `vue`, `vue-router` (стандартные прямые зависимости Nuxt с файловой маршрутизацией) и `@nuxtjs/i18n`. Для разработки объявлены `typescript`, `vue-tsc`, `@nuxt/eslint`, `eslint` и `prettier`. Зависимости установлены, точные версии закреплены в `package-lock.json`; последующие установки выполняются через `npm ci`. Библиотека слайдера добавляется только при доказанной необходимости после проверки touch, клавиатуры и reduced motion; иначе Vue/CSS. Pinia, Nuxt Content, UI framework, animation library и runtime schema framework не планируются.

Проверки: typecheck, lint, генерация, тесты сортировки/связей/локализации/маршрутов, ручной QA клавиатуры и мобильных состояний. Техническое описание поддерживается вместе с изменением архитектуры.

## Реестр решений и причин

| Решение                                                   | Причина                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Nuxt 4, SSR при генерации                                 | Один шаблон на тип материала и готовый индексируемый HTML                            |
| RU без префикса, EN `/en`                                 | Русский — основной язык; языковые URL разделены для canonical/hreflang               |
| `@nuxtjs/i18n`                                            | Локализованные маршруты, переключатель и SEO без собственного слоя маршрутизации     |
| JSON отдельно от компонентов, типизированный facade       | Редактор меняет материалы без изменения Vue; путь файлов не протекает в UI           |
| ID для связей, slug для URL                               | Перевод и правка заголовка не ломают связи и адреса                                  |
| Автоматический список detail маршрутов из JSON при сборке | Новый материал получает HTML и прямой URL без правки конфигурации                    |
| Карта только в браузере                                   | Яндекс API зависит от DOM, а контент и SEO продолжают генерироваться                 |
| Локальные изображения                                     | Контроль доступности, атрибуции и стабильности ссылок                                |
| Нет Pinia, CMS, backend и тяжёлой UI библиотеки           | Текущие сценарии покрываются Nuxt/Vue и небольшим контентным слоем                   |
| Проверка контента при сборке                              | Ошибки обязательных полей и ссылок обнаруживаются до публикации без сложного runtime |

## Stage 6.3.2B - event-scoped map navigation

`resolveTimelinePlaceContext(locale, value)` in the existing shared content facade validates the slug, resolves the Timeline event and calls `resolveRelatedContent(locale, 'timeline', event.id).places`, preserving direct/reverse union and catalog order. Unknown/malformed slugs and events without Places return no context. `app/data/mapContext.ts` owns localized event URL generation and valid-Place precedence; it receives resolved content instead of importing runtime catalogs into presentation helpers.

Timeline detail conditionally renders a native localized `?event=` CTA in its existing related-Places group. On the map, only event-related Places are passed to the client map; its fit-to-Places watcher handles entry, exit and browser history. Layer tabs are hidden in event scope and manual layer parameters do not filter or expand it. The compact context row provides the non-interactive event title, count and sole native All places exit link. Event marker selection is local page state, so it opens the existing Place card without combining `place` and `event` in the URL. Closing the card preserves scope; leaving or changing scope clears selection. Reload and Back/Forward entry restore the event scope with the card initially closed. Selected event Places do not receive a separate permalink; existing Place links remain `?place=`. The close-marker chooser is suppressed whenever a Place card is open; closing the card restores normal group interaction.

SSR renders the event indication and narrowed related-Places index. API failure also retains the existing full 13-Place fallback navigation. On static hosting, query context is resolved during hydration; with JavaScript disabled, the generic generated map HTML still offers all 13 Place links. Timeline loads no Yandex script; map loading, marker styling and fan-out architecture are unchanged.

## Stage 6.3.3 — Dictionary relations and Map supporting navigation

Dictionary detail reuses a reactive `resolveRelatedContent(locale, 'dictionary', record.id)` result for Sources and a conditional related-Places list after the article, before Sources. The list preserves direct/inverse union and catalog order, linking to localized Place detail routes through NuxtLink. It introduces no Map query or direct Dictionary-to-Map CTA and loads no Yandex script. `test:dictionary-places-render` after generate verifies all 58 Dictionary routes and both generic Map SSR indexes.

The Map's existing native index uses `visiblePlaces` only when `mapState` is ready: All/1812/Memory give 13/6/7, while event context keeps its existing related subset. Before readiness, the normal index stays complete and open; event scope preserves its subset, with all 13 links still provided by the API failure fallback. Generated no-JS HTML remains the full generic index. A separate ready-state native disclosure below the frame explains the two marker colors, initially closed. `test:map-index-render` renders the actual Map SFC with controlled API states to cover index membership, event scope, fallback and legend structure; these component checks do not replace real Yandex browser acceptance.
