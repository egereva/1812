# Контент: инструкция редактору

Эта инструкция описывает ручное заполнение сайта без изменения Vue-компонентов. `content/ru` содержит финальный проверенный набор `final-ru-audited-2026-09-25`, а `content/en` — его утверждённый английский перевод. В каждой локали 13 мест, 29 статей, 20 событий и 68 записей каталога источников: 26 исторических/исследовательских источников и 42 записи атрибуции медиа. **RU и EN — production; структурный паритет обязателен.** Технических `test-*` сущностей в production файлах нет.

## Где находятся данные

```text
content/
  ru/
    site.json        # проверенные метаданные темы проекта
    places.json      # места и памятники
    dictionary.json  # словарные статьи
    timeline.json    # события
    sources.json     # исследовательские источники и атрибуция медиа
  en/
    те же пять файлов и та же форма записей
i18n/locales/
  ru.json            # только короткие UI-сообщения и подписи
  en.json
public/images/       # локальные изображения, когда их происхождение проверено
docs/research/        # финальный аудит, география и редакторский media manifest
```

`@nuxtjs/i18n` отвечает за адреса `/en/...`, переключение языка и короткие подписи интерфейса. **Исторические тексты не помещают в `i18n/locales`**: они живут в JSON `content/ru` и `content/en`. В каждом из `places.json`, `dictionary.json`, `timeline.json`, `sources.json` находится обычный JSON-массив `[...]`. В `site.json` — один объект `{...}`.

Код моделей находится в [shared/types/content.ts](../shared/types/content.ts), а способы получения записей — в [shared/content/index.ts](../shared/content/index.ts). Страницы обращаются к этим функциям, не к пути JSON-файла.

Сейчас `contentRelease` в content layer задаёт `ru: production`, `en: production`. При сборке проверяются одинаковые наборы ID, одинаковые slug, source IDs, связи, координаты, исторические статусы и точность, даты и другие структурные исторические поля. Названия, описания, пояснения и библиографические подписи переводятся; стабильные технические значения остаются одинаковыми. `@nuxtjs/i18n` хранит только UI-переводы и правила маршрутизации. Общий визуальный каркас готов; содержательные интерфейсы разделов остаются задачей следующих этапов.

## Общие правила редактирования

Историческое введение главной хранится в RU/EN `site.json` как `homeIntroduction`: `eyebrow`, `title`, три обычных текстовых `paragraphs`. Content layer передаёт его в `SiteContent.homeIntroduction`; Vue не содержит историческую прозу. Введение размещено после Hero, перед существующими превью разделов. Структура и число абзацев совпадают в обеих локалях; текст опирается на утверждённую хронологию и различия статусов Places.

1. `id` — неизменный технический ключ. `slug` — неизменная латинская часть URL. В пределах одного файла они уникальны. Для одной и той же сущности в RU и EN **оба значения совпадают**, даже когда заголовок переведён. Пример: `id: "test-place"`, `slug: "test-place"`.
2. Ссылки между записями задаются только ID, никогда названием или slug. Для отсутствующих связей поле можно опустить либо поставить `[]`. Битая связь в production контенте останавливает сборку; удалять её без проверки исторического смысла нельзя.
3. `content` — массив абзацев обычного текста. HTML внутрь JSON не вставлять. `shortDescription` — короткое резюме для карточки. Обязательные поля заполняют реальными проверенными данными, без заглушек.
4. `seo` необязателен. При его отсутствии будущая страница возьмёт заголовок и описание из `title` и `shortDescription`. `seo.image` и все медиа указывают локальный путь `/images/...`.
5. У каждого исторического места, статьи и события должен быть непустой `sourceIds` с существующими ID из `sources.json`. Любое изменение исторического контента требует редакторской проверки по источникам. Исторические факты, датировка, координаты, изображения и их права проверяются редактором; Codex не должен самостоятельно генерировать или исправлять исторические сведения. Техническая проверка не доказывает историческую достоверность.
6. После правки JSON сайт надо пересобрать (`npm run generate`); GitHub Pages сам по себе не читает новые JSON без новой сборки.

## Поля основных записей

| Файл              | Обязательные поля                                                                                                                                    | Необязательные поля                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `places.json`     | `id`, `slug`, `title`, `shortDescription`, `content`, `coordinates` (`lat`, `lon`), `category`, `historicalStatus`, `locationPrecision`, `sourceIds` | `address`, `locationNote`, `historicalNote`, `coverImage`, `gallery`, `beforeAfter`, `relatedPlaceIds`, `relatedDictionaryIds`, `relatedTimelineIds`, `seo` |
| `dictionary.json` | `id`, `slug`, `letter`, `title`, `shortDescription`, `content`, `category`, `sourceIds`                                                              | `image`, `relatedPlaceIds`, `relatedDictionaryIds`, `relatedTimelineIds`, `seo`                                                                             |
| `timeline.json`   | `id`, `slug`, `dateOldStyle`, `sortDate`, `title`, `shortDescription`, `content`, `sourceIds`                                                        | `dateNewStyle`, `dateEndOldStyle`, `dateEndNewStyle`, `image`, `featured`, `relatedPlaceIds`, `relatedDictionaryIds`, `relatedTimelineIds`, `seo`           |
| `sources.json`    | `id`, `title`, `type`                                                                                                                                | `author`, `publisher`, `year`, `url`, `accessedAt`                                                                                                          |

`category` — свободная строковая метка для классификации места в контенте и будущем интерфейсе. `historicalStatus` отдельно описывает историческую природу места и принимает только `event-site` (место события), `surviving-witness` (сохранившийся объект эпохи), `lost-site` (утраченный объект или территория), `reconstruction` (позднейшее воссоздание), `memorial` (позднейший памятник) или `museum` (музей). Статус не выводится из `category`: реконструкция не является `surviving-witness`, а поздний мемориал не становится `event-site` только из-за посвящения событию.

`locationPrecision` показывает точность привязки: `exact` — существующий объект или надёжно установленная точка; `approximate` — ориентир для исторической территории или утраченного места. Не ставьте `exact`, если известна только приблизительная локализация. Для `approximate` настоятельно рекомендуется локализованное пояснение `locationNote`. Необязательное `historicalNote` — короткая историческая оговорка для будущего блока «Важно». Эти пояснения переводятся в `content/ru` и `content/en`, а технические значения статуса и точности должны совпадать в обеих локалях.

`address` — необязательный современный почтовый адрес: для `lost-site` или `event-site` его отсутствие нормально. `coordinates` остаются обязательными для показа Place на карте: числа `lat` (широта) и `lon` (долгота). Координату и её точность редактор проверяет по источникам. `type` источника — свободная строковая метка. Каталог `/sources` и `/en/sources` разделяет записи с `type: "media"` (42) и остальные исследовательские источники (26), сохраняя порядок внутри каждой группы. Всего 68 записей в каждой локали. Общий URL, включая один PDF у двух записей, не является основанием для объединения ID. Права сохраняются в существующих заголовках и media credit; новые сведения о лицензиях не выводятся из отсутствующих полей. `sourceIds` — ID из `sources.json` этой же локали. Медиа описываются объектом `MediaAsset`: обязательны `src`, `alt`; возможны `caption`, `description`, `credit` и `sourceId`. `beforeAfter` — массив пар `{ id, before, after, caption? }`, где `before` и `after` — полные объекты `MediaAsset`. Пар может быть несколько.

RU и EN `site.json` содержат проверенные локализованные `title`, `description` и собственный `contentStatus`. Content layer одинаково отображает их в `siteTitle` и `siteDescription` интерфейса `SiteContent`; секции `hero` и `home` остаются пустыми. `about` содержит локализованные `title`, SEO `description`, `lead`, пять `sections` (`id`, `title`, `paragraphs`), `exploreLabel` и внутренние `links` (`route`, `label`). ID разделов и маршруты совпадают в RU/EN; Vue-шаблон не хранит редакционный текст. Аудит EN перевода исторических материалов сохранён в [docs/research](research/en-translation-audit.md). **Production media are delivered:** The delivery catalog includes 51 local originals: 42 previously approved assets and nine supplied 2026 images, with 56 optimized derivatives for 29 originals. The 2026 images retain their original files and have intrinsic dimensions recorded for layout stability. The editorial [media manifest](research/media-manifest.json) contains 24 selected rights records, including an explicitly archived unused Church 2012 candidate; it is not the complete production inventory. See the technical delivery catalog in `app/data/imageDelivery.json`, [image rights](research/image-rights.md) and [attribution](research/attribution.md).

Manifest хранится только в `docs/research/`: `sourcePage` указывает страницу происхождения и **не является runtime `src`**. Production `target` paths must resolve to verified files inside `public/images/`; archived candidates explicitly marked `usageStatus: unused-candidate` / `deliveryStatus: not-delivered` retain proposed targets without becoming runtime assets or missing-file defects. Before adding a `MediaAsset`, verify local existence, rights and attribution; remote URLs are not production image sources. Подписи должны сохранять тип изображения: `modern-documentary-photo`, `historical-documentary-photo`, `later-artistic-depiction` и `artwork-documentation` не взаимозаменяемы. Позднейшие картины нельзя выдавать за документальную фиксацию событий 1812 года.

Current RU/EN coverage is identical: Dictionary 23/29 illustrated entries, Timeline 17/20 detail events, and Places 12/13 covers. The six Dictionary no-image entries (`dorogomilovo`, `moscow-militia`, `partisan-movement`, `poklonnaya-hill`, `smolensk-road`, `triumphal-arch`) intentionally render complete text layouts. The three Timeline entries (`armies-unite-smolensk`, `liberation-russia`, `manifest-end-war`) remain without verified optional historical media; the Place `dorogomilovskoe-cemetery` remains intentionally unillustrated. Missing imagery alone is not an acceptance defect. Five Place comparisons are active as listed below, including Kutuzov Hut (1884 / 2026). Static responsive delivery serves prepared local derivatives that must be included in the deployment commit, while PhotoSwipe uses original-resolution assets. No Windows-only processor runs during ordinary static generation or deployment; see [image delivery architecture](ARCHITECTURE.md#stage-72--static-image-delivery).

Существующие `MediaAsset` и `BeforeAfterPair` позволяют позднее заменить стороннее современное фото собственным, добавить собственное фото в `gallery` и составить исторически корректную пару «тогда / сейчас», не меняя `id` или `slug` сущности. Собственные фотографии — необязательное будущее улучшение: сайт должен оставаться полным и визуально цельным и без них.

Interactive Place comparisons reuse optional `Place.beforeAfter: BeforeAfterPair[]`; no second comparison model is introduced. A pair retains `id`, two full `MediaAsset` objects (`before` / `after`) and optional `caption` (the localized contextual note), adding localized `beforeDate` / `afterDate`, optional numeric `aspectRatio`, and optional CSS `beforePosition` / `afterPosition`. Production pairs require both dates, local media and alt text. Credit and source IDs are optional; provided source IDs must resolve to valid sources. The replacement 2026 photos of Triumphal Arch and Kutuzov Hut have no supplied attribution. Pair IDs, ordered media/source identities and geometry match across locales. Five Places currently have pairs: `kuntsevo-estate` (c. 1910 / 2015), `borodino-panorama-museum` (1962 / 2026), `intercession-church-fili` (1888 / 2019), `triumphal-arch` (1934 / 2026), and `kutuzov-hut` (1884 / 2026). The Church 1888 source is verified: Николай Найдёнов / Nikolay Naidenov, 1888, Общественное достояние / Public domain, Wikimedia Commons, and the exact file-page URL https://commons.wikimedia.org/wiki/File:Church_of_the_Protection_of_the_Theotokos_in_Fili_00.jpg. Both locales reuse src-media-place-intercession-church-fili-1888; the visible comparison attribution uses 1888 without the album publication year. The Hut comparison reuses the catalogued Savrasov 1884 painting and the supplied 2026 image. Its contextual note distinguishes an artistic depiction from the present museum building. Internal field names are never user-facing temporal labels.

## Полные образцы JSON

Все четыре образца ниже **искусственные и не предназначены для публикации**. Пути `/images/test/...` показывают форму, но файлов с такими изображениями нет. Для реального материала сначала подготовьте файл и атрибуцию.

### Место: один объект внутри `places.json`

```json
{
  "id": "test-place",
  "slug": "test-place",
  "title": "Test Place",
  "shortDescription": "Technical description.",
  "content": ["Technical paragraph one.", "Technical paragraph two."],
  "address": "Test Address",
  "coordinates": { "lat": 0, "lon": 0 },
  "category": "test",
  "historicalStatus": "event-site",
  "locationPrecision": "approximate",
  "locationNote": "Test location note",
  "historicalNote": "Test historical note",
  "coverImage": {
    "src": "/images/test/test-cover.webp",
    "alt": "Test image",
    "caption": "Technical caption",
    "credit": "Test credit",
    "sourceId": "test-source"
  },
  "gallery": [
    {
      "src": "/images/test/test-gallery.webp",
      "alt": "Test gallery image",
      "caption": "Technical caption",
      "description": "Technical image description",
      "credit": "Test credit",
      "sourceId": "test-source"
    }
  ],
  "beforeAfter": [
    {
      "id": "test-pair",
      "before": {
        "src": "/images/test/test-before.webp",
        "alt": "Test before image",
        "caption": "Before",
        "credit": "Test credit",
        "sourceId": "test-source"
      },
      "after": {
        "src": "/images/test/test-after.webp",
        "alt": "Test after image",
        "caption": "After",
        "credit": "Test credit",
        "sourceId": "test-source"
      },
      "caption": "Technical comparison"
    }
  ],
  "relatedPlaceIds": [],
  "relatedDictionaryIds": ["test-entry"],
  "relatedTimelineIds": ["test-event"],
  "sourceIds": ["test-source"],
  "seo": {
    "title": "Test Place",
    "description": "Technical SEO description.",
    "image": "/images/test/test-cover.webp"
  }
}
```

### Словарная статья: один объект внутри `dictionary.json`

```json
{
  "id": "test-entry",
  "slug": "test-entry",
  "letter": "T",
  "title": "Test Entry",
  "shortDescription": "Technical description.",
  "content": ["Technical paragraph."],
  "category": "test",
  "image": {
    "src": "/images/test/test-entry.webp",
    "alt": "Test image",
    "caption": "Technical caption",
    "credit": "Test credit",
    "sourceId": "test-source"
  },
  "relatedPlaceIds": ["test-place"],
  "relatedDictionaryIds": [],
  "relatedTimelineIds": ["test-event"],
  "sourceIds": ["test-source"],
  "seo": { "title": "Test Entry", "description": "Technical SEO description." }
}
```

### Событие: один объект внутри `timeline.json`

```json
{
  "id": "test-event",
  "slug": "test-event",
  "dateOldStyle": "2000-01-01",
  "dateNewStyle": "2000-01-02",
  "dateEndOldStyle": "2000-01-03",
  "dateEndNewStyle": "2000-01-04",
  "sortDate": "2000-01-02",
  "title": "Test Event",
  "shortDescription": "Technical description.",
  "content": ["Technical paragraph."],
  "image": {
    "src": "/images/test/test-event.webp",
    "alt": "Test image",
    "caption": "Technical caption",
    "credit": "Test credit",
    "sourceId": "test-source"
  },
  "featured": false,
  "relatedPlaceIds": ["test-place"],
  "relatedDictionaryIds": ["test-entry"],
  "relatedTimelineIds": [],
  "sourceIds": ["test-source"],
  "seo": { "title": "Test Event", "description": "Technical SEO description." }
}
```

**Эти даты — произвольные технические строки, не пример соответствия календарей.** Для события 1812 года основная дата показа — `dateOldStyle`, дата по юлианскому календарю Российской империи. `dateNewStyle` показывают рядом только при подтверждённом соответствии. Для диапазона явно указывают обе конечные даты, если они известны. `sortDate` — отдельно внесённый нормализованный ключ `YYYY-MM-DD` для хронологического порядка; приложение **не вычисляет** его или новый стиль из старого. Сортировка идёт по `sortDate`, затем по `id`, независимо от порядка строк в JSON. Датировку подтверждают источником и объясняют читателю в материале.

### Источник: один объект внутри `sources.json`

```json
{
  "id": "test-source",
  "title": "Test Source — not a real source",
  "type": "test",
  "author": "Test Author",
  "publisher": "Test Publisher",
  "year": 2000,
  "url": "https://example.com/test-source",
  "accessedAt": "2000-01-01"
}
```

Для настоящего интернет-источника укажите рабочий URL и фактическую дату обращения; для книги — автора, издателя и год при наличии. Источник изображения можно атрибутировать отдельно через `credit` и `sourceId` его медиа-объекта. Примерный URL выше не является источником.

## Как внести новый материал

1. **Начните с источника.** Проверьте его надёжность и добавьте запись в `sources.json` нужных языков с одним и тем же `id`. Затем этот ID можно ставить в `sourceIds` статей, событий и мест. Не копируйте библиографическую запись в каждый материал.
2. **Добавьте место.** Откройте `content/ru/places.json`, вставьте новый объект между `[` и `]` с запятыми между объектами. Укажите проверенные координаты, `category`, `historicalStatus` и `locationPrecision`; адрес добавляйте только при наличии корректного современного адреса. Если привязка приблизительна, поясните её в `locationNote`; важную историческую оговорку можно записать в `historicalNote`. Подготовьте проверенный перевод в `content/en/places.json` в той же редакционной поставке: обе локали сейчас production, поэтому сборка требует полного паритета. ID, slug, статус и точность совпадают, заметки переводятся. После пересборки появятся `/places/<slug>` и `/en/places/<slug>`.
3. **Добавьте статью.** Аналогично редактируйте `dictionary.json`. `letter` — буква заголовка **на текущем языке**, поэтому RU и EN значения могут различаться. Тип статьи записывается в `category`; готовые варианты могут быть `person`, `place`, `event`, `monument`, `term`, но модель не ограничена этим перечнем.
4. **Добавьте событие.** В `timeline.json` укажите старый стиль, при необходимости подтверждённый новый, и явный `sortDate`. Не сортируйте файл вручную: слой данных отсортирует события. `featured: true` — будущий визуальный акцент, не изменение даты.
5. **Соедините записи.** Используйте `relatedPlaceIds`, `relatedDictionaryIds`, `relatedTimelineIds`. Например, место ссылается на статью через `relatedDictionaryIds: ["entry-id"]`. Слой данных выводит и обратную связь из статьи к месту, даже если статья не повторяет ID места. Связи внутри одного типа (`relatedPlaceIds` у места и т. п.) тоже поддерживаются. Отсутствующая цель не ломает чтение страницы, но останавливает сборку production набора.
6. **Добавьте изображение.** Положите файл в подходящую папку `public/images/places`, `dictionary`, `timeline` или `before-after`. Используйте понятное имя вроде `<slug>-cover.webp`. В JSON пропишите `/images/...`, содержательный `alt`, подпись при необходимости и корректную атрибуцию (`credit`, `sourceId`). До появления проверенного файла оставьте необязательное поле изображения отсутствующим; не указывайте несуществующий путь.
7. **Добавьте галерею и сравнение.** `gallery` — массив объектов `MediaAsset`, даже если фото одно. `beforeAfter` — массив пар, у каждой отдельные `before` и `after` со своими alt, подписями и атрибуцией. Можно добавить несколько пар на одно место. Сравнивайте только изображения действительно одного места.
8. **Сделайте перевод.** Переведите заголовки, абзацы, краткие описания, `address` (если он есть), `locationNote`, `historicalNote`, подписи, alt и SEO-тексты в `content/en`; ID, slug, координаты, source IDs, даты, `historicalStatus`, `locationPrecision` и связи остаются прежними. Обе локали production, поэтому новый материал должен быть готов на двух языках до сборки. Не путайте это с UI-переводами в `i18n/locales/en.json`.
9. **Проверьте результат.** Запустите `npm test`, `npm run typecheck`, `npm run generate` и откройте прямой URL сгенерированной страницы. Повторные ID/slug, пустые или неизвестные `sourceIds`, битые production связи и несовпадающие пары ID/slug RU/EN останавливают сборку. Проверьте факты и изображения вручную по источникам.

RU и EN fixtures `test-*` заменены проверенными пакетами без самостоятельного изменения исторических значений. Даты старого и нового стиля, включая конечные даты многодневных событий, остаются явными полями без автоматического преобразования; `sortDate` внесён редактором. Приблизительную локализацию нельзя переобозначать как `exact` ради отображения на карте. Исторические тексты главной и «О проекте» готовятся отдельно.
