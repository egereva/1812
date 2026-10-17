import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import test from 'node:test'
import {
  homepageTimelineEventIds,
  homepageTimelineArtworkSlots,
  getHomepageTimelineEvents,
  homepageTimelineInitialEventId,
} from '../app/data/homepageTimelineMedia.ts'
import { normalizeMediaCaption } from '../app/utils/mediaCaption.ts'
import { formatTimelineDates } from '../app/utils/timelineDates.ts'
import {
  getPresentedTimelineEvents,
  getTimelineArtwork,
  timelineLandmarks,
  timelineArtworkDictionaryIds,
} from '../app/data/timelinePresentation.ts'
import {
  contentRelease,
  getCatalog,
  getCatalogProblems,
  getDanglingRelations,
  getDictionaryEntryById,
  getDictionaryEntryBySlug,
  getDictionaryEntries,
  getDynamicPrerenderRoutes,
  getPlaceById,
  getPlaceBySlug,
  getPlaces,
  getSourceById,
  getSourceGroups,
  getSources,
  getSiteContent,
  getTimelineEventById,
  getTimelineEventBySlug,
  getTimelineEvents,
  resolveRelatedContent,
  selectLocale,
  sortTimelineEvents,
} from '../shared/content/index.ts'
import {
  historicalStatuses,
  locationPrecisions,
} from '../shared/types/content.ts'
import type { ContentCatalog, TimelineEvent } from '../shared/types/content.ts'

const ru = getCatalog('ru')

test('Dictionary Timeline relations preserve the approved coverage and chronological order', () => {
  for (const locale of ['ru', 'en']) {
    const entries = getDictionaryEntries(locale)
    const groups = entries.map((entry) =>
      resolveRelatedContent(locale, 'dictionary', entry.id),
    )
    assert.equal(groups.filter((group) => group.timeline.length).length, 14)
    assert.equal(
      groups.reduce((count, group) => count + group.timeline.length, 0),
      38,
    )
    assert.equal(
      groups.filter((group) => !group.timeline.length && !group.places.length)
        .length,
      11,
    )
    for (const group of groups) {
      assert.deepEqual(group.timeline, sortTimelineEvents(group.timeline))
      assert.equal(
        new Set(group.timeline.map((event) => event.id)).size,
        group.timeline.length,
      )
    }
  }
})

test('Sources grouping preserves all 68 records, metadata, order and bilingual IDs', () => {
  for (const locale of ['ru', 'en']) {
    const sources = getSources(locale)
    const groups = getSourceGroups(locale)
    assert.equal(groups.research.length, 26)
    assert.equal(groups.media.length, 42)
    const grouped = [...groups.research, ...groups.media]
    assert.equal(grouped.length, sources.length)
    assert.equal(new Set(grouped.map((source) => source.id)).size, 68)
    assert.deepEqual(
      groups.research,
      sources.filter((source) => source.type !== 'media'),
    )
    assert.deepEqual(
      groups.media,
      sources.filter((source) => source.type === 'media'),
    )
    for (const source of grouped) {
      assert.equal(
        source,
        sources.find((record) => record.id === source.id),
      )
      assert.ok(source.title.trim())
      assert.ok(source.url && new URL(source.url).protocol === 'https:')
    }
    const sharedPdf = sources.find(
      (source) => source.id === 'src-mos-cemetery',
    )!.url
    assert.equal(grouped.filter((source) => source.url === sharedPdf).length, 2)
  }
  const ruGroups = getSourceGroups('ru')
  const enGroups = getSourceGroups('en')
  for (const group of ['research', 'media'] as const) {
    assert.deepEqual(
      ruGroups[group].map((source) => source.id),
      enGroups[group].map((source) => source.id),
    )
    assert.deepEqual(
      ruGroups[group].map((source) => source.url),
      enGroups[group].map((source) => source.url),
    )
  }
})

test('About content has bilingual narrative and localized exploration parity', () => {
  const ruAbout = getSiteContent('ru').about
  const enAbout = getSiteContent('en').about
  const sections = ['purpose', 'geography', 'research', 'digital', 'guide']
  for (const about of [ruAbout, enAbout]) {
    assert.deepEqual(
      about.sections.map((section) => section.id),
      sections,
    )
    assert.ok(
      about.title.trim() && about.description.trim() && about.lead.trim(),
    )
    assert.ok(about.exploreLabel.trim())
    for (const section of about.sections) {
      assert.ok(section.title.trim())
      assert.ok(section.paragraphs.length > 0)
      assert.ok(section.paragraphs.every((paragraph) => paragraph.trim()))
    }
    assert.deepEqual(
      about.links.map((link) => link.route),
      ['/map', '/timeline', '/dictionary', '/sources'],
    )
    assert.ok(about.links.every((link) => link.label.trim()))
    const digital = about.sections.find((section) => section.id === 'digital')!
    assert.match(digital.paragraphs.join(' '), /Visual Studio Code/)
    assert.match(digital.paragraphs.join(' '), /Codex/)
  }
  assert.deepEqual(
    ruAbout.sections.map((section) => section.paragraphs.length),
    enAbout.sections.map((section) => section.paragraphs.length),
  )
})

test('Interactive Place comparison uses five bilingual pairs with available attribution', () => {
  const expected = [
    'borodino-panorama-museum',
    'intercession-church-fili',
    'kuntsevo-estate',
    'kutuzov-hut',
    'triumphal-arch',
  ]
  for (const locale of ['ru', 'en'] as const) {
    const places = getPlaces(locale)
    assert.deepEqual(
      places
        .filter((place) => place.beforeAfter?.length)
        .map((place) => place.id)
        .sort(),
      expected,
    )
    assert.equal(places.filter((place) => !place.beforeAfter?.length).length, 8)
    for (const place of places.filter((place) => place.beforeAfter?.length)) {
      assert.equal(place.beforeAfter!.length, 1)
      const pair = place.beforeAfter![0]!
      const counterpart = getPlaceById(locale === 'ru' ? 'en' : 'ru', place.id)!
        .beforeAfter![0]!
      assert.equal(pair.id, counterpart.id)
      assert.equal(pair.aspectRatio, counterpart.aspectRatio)
      assert.equal(pair.beforePosition, counterpart.beforePosition)
      assert.equal(pair.afterPosition, counterpart.afterPosition)
      assert.deepEqual(
        [pair.beforeDate, pair.afterDate],
        place.id === 'kuntsevo-estate'
          ? [locale === 'ru' ? 'около 1910' : 'c. 1910', '2015']
          : place.id === 'intercession-church-fili'
            ? ['1888', '2019']
            : place.id === 'triumphal-arch'
              ? ['1934', '2026']
              : place.id === 'kutuzov-hut'
                ? ['1884', '2026']
                : ['1962', '2026'],
      )
      assert.ok(pair.caption?.trim())
      assert.deepEqual(
        [pair.before.src, pair.after.src],
        [counterpart.before.src, counterpart.after.src],
      )
      assert.deepEqual(
        [pair.before.sourceId, pair.after.sourceId],
        [counterpart.before.sourceId, counterpart.after.sourceId],
      )
      for (const image of [pair.before, pair.after]) {
        assert.match(image.src, /^\/images\/[a-z]+\/[a-z0-9-]+\.(?:jpe?g|png)$/)
        assert.ok(existsSync(`public${image.src}`))
        assert.ok(image.alt.trim())
        if (image.src === '/images/places/kutuzov-hut-modern-2026.png') {
          assert.equal(image.caption, undefined)
          assert.equal(image.credit, undefined)
          assert.equal(image.sourceId, undefined)
          continue
        }
        assert.ok(image.caption?.trim())
        if (image.src === '/images/places/borodino-panorama-museum-2026.jpeg') {
          assert.ok(image.alt.trim())
          assert.equal(
            image.caption,
            locale === 'ru'
              ? 'Музей-панорама „Бородинская битва“. Современный вид здания музея, 2026 год'
              : 'Battle of Borodino Panorama Museum. Present-day view of the museum building, 2026',
          )
          assert.equal(image.description, undefined)
          assert.equal(image.credit, undefined)
          assert.equal(image.sourceId, undefined)
          continue
        }
        if (image.src === '/images/places/triumphal-arch-modern-2026.png') {
          assert.equal(image.credit, undefined)
          assert.equal(image.sourceId, undefined)
          continue
        }
        assert.ok(image.credit?.trim())
        const source = getSourceById(locale, image.sourceId!)
        assert.equal(source?.type, 'media')
        if (
          image.sourceId === 'src-media-place-intercession-church-fili-1888'
        ) {
          assert.equal(
            source?.url,
            'https://commons.wikimedia.org/wiki/File:Church_of_the_Protection_of_the_Theotokos_in_Fili_00.jpg',
          )
          assert.equal(
            source?.author,
            locale === 'ru' ? 'Николай Найдёнов' : 'Nikolay Naidenov',
          )
          assert.equal(
            image.credit,
            locale === 'ru'
              ? 'Николай Найдёнов · Общественное достояние'
              : 'Nikolay Naidenov · Public domain',
          )
          assert.equal(source?.publisher, 'Wikimedia Commons')
          assert.equal(source?.year, 1888)
        } else
          assert.ok(
            source?.url?.startsWith('https://commons.wikimedia.org/wiki/'),
          )
        assert.equal(
          source?.url,
          getSourceById(locale === 'ru' ? 'en' : 'ru', image.sourceId!)?.url,
        )
      }
    }
  }
})

const en = getCatalog('en')

test('Comparison validation rejects broken media, missing dates and locale identity drift', () => {
  const catalogs = structuredClone({
    ru: getCatalog('ru'),
    en: getCatalog('en'),
  })
  const pair = catalogs.ru.places.find(
    (place) => place.id === 'kuntsevo-estate',
  )!.beforeAfter![0]!
  pair.after.sourceId = 'missing-source'
  pair.beforeDate = ''
  pair.aspectRatio = 0
  const problems = getCatalogProblems(catalogs)
  assert.ok(
    problems.some((problem) => problem.includes('invalid image comparison')),
  )
  assert.ok(
    problems.some((problem) =>
      problem.includes('image comparison identity differs'),
    ),
  )
})

test('Homepage curation has six approved local artworks without changing the full Timeline', () => {
  const expected = [
    'invasion-neman',
    'borodino',
    'council-fili',
    'napoleon-leaves-moscow',
    'maloyaroslavets',
    'berezina',
  ]
  assert.deepEqual([...homepageTimelineEventIds], expected)
  assert.ok(timelineLandmarks.some((event) => event.id === 'manifest-end-war'))
  for (const locale of ['ru', 'en'] as const) {
    const production = getTimelineEvents(locale)
    const before = JSON.stringify(production)
    const curated = getHomepageTimelineEvents(
      production,
      getDictionaryEntries(locale),
      locale,
    )
    assert.equal(homepageTimelineInitialEventId, 'invasion-neman')
    assert.equal(curated[0]!.id, homepageTimelineInitialEventId)
    assert.equal(
      curated[0]!.artwork?.src,
      '/images/timeline/crossing-neman-clark-1816.jpg',
    )
    assert.deepEqual(
      curated.map((event) => event.id),
      expected,
    )
    assert.equal(production.length, 20)
    for (const event of curated) {
      const artwork = event.artwork
      assert.ok(artwork)
      assert.ok(existsSync(`public${artwork.src}`))
      assert.ok(artwork.alt && artwork.caption && artwork.credit)
      assert.ok(getSourceById(locale, artwork.sourceId!))
    }
    assert.equal(JSON.stringify(production), before)
  }
  const asset = homepageTimelineArtworkSlots['invasion-neman']
  assert.equal(asset.ru.src, asset.en.src)
  assert.equal(asset.ru.sourceId, asset.en.sourceId)
  const original = readFileSync(`public${asset.ru.src}`)
  assert.equal(original.length, 198303)
  assert.equal(
    createHash('sha1').update(original).digest('hex'),
    '41c427a2e78712ebd514be06bacfde10b70100bb',
  )
})

test('loads both final production catalogs with expected entity counts', () => {
  assert.equal(contentRelease.ru, 'production')
  assert.equal(contentRelease.en, 'production')
  for (const catalog of [ru, en]) {
    assert.ok(catalog.site.siteTitle)
    assert.ok(catalog.site.siteDescription)
    assert.deepEqual(
      [
        catalog.places.length,
        catalog.dictionary.length,
        catalog.timeline.length,
        catalog.sources.filter((source) => source.type !== 'media').length,
      ],
      [13, 29, 20, 26],
    )
    assert.ok(
      [
        ...catalog.places,
        ...catalog.dictionary,
        ...catalog.timeline,
        ...catalog.sources,
      ].every((item) => !item.id.startsWith('test-')),
    )
  }
})

test('dictionary localization preserves paragraphs and verified media identity', () => {
  const manifest = JSON.parse(
    readFileSync(
      new URL(
        '../docs/research/dictionary-media-manifest.parity.json',
        import.meta.url,
      ),
      'utf8',
    ),
  ) as { entries: { dictionaryId: string; status: string }[] }
  assert.equal(
    ru.dictionary.reduce((count, entry) => count + entry.content.length, 0),
    95,
  )
  assert.equal(
    en.dictionary.reduce((count, entry) => count + entry.content.length, 0),
    95,
  )
  for (const entry of ru.dictionary) {
    const translated = getDictionaryEntryById('en', entry.id)!
    assert.equal(translated.content.length, entry.content.length)
    assert.ok(
      !/[А-Яа-яЁё]/.test(
        translated.shortDescription + translated.content.join(' '),
      ),
    )
    const status = manifest.entries.find(
      (item) => item.dictionaryId === entry.id,
    )?.status
    assert.ok(status)
    if (status === 'no-image-yet') {
      assert.equal(entry.image, undefined)
      assert.equal(translated.image, undefined)
    }
    if (!entry.image) continue
    assert.equal(translated.image?.src, entry.image.src)
    assert.equal(translated.image?.sourceId, entry.image.sourceId)
    assert.ok(entry.image.src.startsWith('/images/'))
    assert.ok(
      existsSync(new URL(`../public${entry.image.src}`, import.meta.url)),
    )
    assert.ok(entry.image.alt && entry.image.caption && entry.image.credit)
    assert.ok(
      translated.image?.alt &&
        translated.image.caption &&
        translated.image.credit,
    )
    assert.ok(
      !/[А-Яа-яЁё]/.test(translated.image!.alt + translated.image!.caption),
    )
    for (const locale of ['ru', 'en'] as const) {
      const source = getSourceById(locale, entry.image.sourceId!)
      assert.ok(source?.url?.startsWith('https://commons.wikimedia.org/wiki/'))
    }
  }
})

test('all entity IDs and type-specific slugs are unique', () => {
  for (const catalog of [ru, en]) {
    for (const collection of [
      catalog.places,
      catalog.dictionary,
      catalog.timeline,
    ]) {
      assert.equal(
        new Set(collection.map((item) => item.id)).size,
        collection.length,
      )
      assert.equal(
        new Set(collection.map((item) => item.slug)).size,
        collection.length,
      )
    }
    assert.equal(
      new Set(catalog.sources.map((item) => item.id)).size,
      catalog.sources.length,
    )
  }
})

test('every published entity has valid sources and required content', () => {
  for (const locale of ['ru', 'en'] as const) {
    const catalog = getCatalog(locale)
    const sourceIds = new Set(catalog.sources.map((source) => source.id))
    for (const entity of [
      ...catalog.places,
      ...catalog.dictionary,
      ...catalog.timeline,
    ]) {
      assert.ok(
        entity.id && entity.slug && entity.title && entity.shortDescription,
      )
      assert.ok(entity.content.length > 0)
      assert.ok(entity.sourceIds.length > 0)
      assert.ok(entity.sourceIds.every((id) => sourceIds.has(id)))
      assert.equal(
        getSourceById(locale, entity.sourceIds[0]!)?.id,
        entity.sourceIds[0],
      )
    }
  }
  assert.deepEqual(getCatalogProblems(), [])
})

test('all published relation IDs resolve in both directions', () => {
  const relationFields = [
    ['relatedPlaceIds', 'places', 'place'],
    ['relatedDictionaryIds', 'dictionary', 'dictionary'],
    ['relatedTimelineIds', 'timeline', 'timeline'],
  ] as const
  for (const locale of ['ru', 'en'] as const) {
    const catalog = getCatalog(locale)
    const collections = [
      ['place', catalog.places],
      ['dictionary', catalog.dictionary],
      ['timeline', catalog.timeline],
    ] as const
    let links = 0
    for (const [kind, entities] of collections) {
      for (const entity of entities) {
        for (const [field, resultField, targetKind] of relationFields) {
          for (const targetId of entity[field] ?? []) {
            links++
            assert.ok(
              resolveRelatedContent(locale, kind, entity.id)[resultField].some(
                (item) => item.id === targetId,
              ),
            )
            const reverse = resolveRelatedContent(locale, targetKind, targetId)
            const reverseField =
              kind === 'place'
                ? 'places'
                : kind === 'dictionary'
                  ? 'dictionary'
                  : 'timeline'
            assert.ok(
              reverse[reverseField].some((item) => item.id === entity.id),
            )
          }
        }
      }
    }
    assert.ok(links > 0)
  }
  assert.deepEqual(getDanglingRelations(), [])
})

test('lookups use stable IDs and slugs, including missing values', () => {
  for (const locale of ['ru', 'en'] as const) {
    const catalog = getCatalog(locale)
    assert.equal(getPlaces(locale).length, catalog.places.length)
    assert.equal(getDictionaryEntries(locale).length, catalog.dictionary.length)
    assert.equal(getTimelineEvents(locale).length, catalog.timeline.length)
    const place = catalog.places[0]!
    const entry = catalog.dictionary[0]!
    const event = catalog.timeline[0]!
    assert.equal(getPlaceById(locale, place.id)?.slug, place.slug)
    assert.equal(getPlaceBySlug(locale, place.slug)?.id, place.id)
    assert.equal(getDictionaryEntryById(locale, entry.id)?.slug, entry.slug)
    assert.equal(getDictionaryEntryBySlug(locale, entry.slug)?.id, entry.id)
    assert.equal(getTimelineEventById(locale, event.id)?.slug, event.slug)
    assert.equal(getTimelineEventBySlug(locale, event.slug)?.id, event.id)
    assert.equal(getPlaceById(locale, 'missing'), undefined)
  }
})

test('Place supports required status and precision and optional address', () => {
  const statuses = new Set<string>(historicalStatuses)
  const precisions = new Set<string>(locationPrecisions)
  for (const catalog of [ru, en]) {
    for (const place of catalog.places) {
      assert.ok(place.category)
      assert.ok(Number.isFinite(place.coordinates.lat))
      assert.ok(Number.isFinite(place.coordinates.lon))
      assert.ok(statuses.has(place.historicalStatus))
      assert.ok(precisions.has(place.locationPrecision))
    }
    assert.ok(catalog.places.some((place) => place.address === undefined))
    assert.ok(
      catalog.places.some((place) => place.locationPrecision === 'approximate'),
    )
    assert.ok(catalog.places.some((place) => place.locationNote !== undefined))
  }
})

test('Places media resolves to local originals with RU/EN parity and approved roles', () => {
  const covers = {
    'fili-village': '/images/timeline/fili-council-kivshenko-1882.jpg',
    'kutuzov-hut': '/images/places/kutuzov-hut-modern-2026.png',
    'intercession-church-fili':
      '/images/places/intercession-church-fili-2019.jpg',
    'kuntsevo-estate': '/images/places/kuntsevo-estate-ca1910.jpg',
    'brotherhood-grave-obelisk':
      '/images/places/borodino-soldiers-memorial-2026.jpeg',
    'milepost-fili': '/images/places/fili-memorial-verst-post-2026.jpeg',
    'archangel-michael-chapel':
      '/images/places/archangel-michael-chapel-2026.png',
    'borodino-panorama-museum':
      '/images/places/borodino-panorama-museum-2026.jpeg',
    'kutuzov-monument':
      '/images/places/kutuzov-and-war-of-1812-monument-2026.jpeg',
    'triumphal-arch': '/images/places/triumphal-arch-modern-2026.png',
    'poklonnaya-hill': '/images/places/poklonnaya-gora-modern-2026.png',
    'dorogomilovskaya-gate':
      '/images/places/dorogomilovskaya-zastava-modern-2026.png',
  }
  const galleries = {
    'kutuzov-hut': ['/images/dictionary/kutuzov-hut-savrasov-1884.jpg'],
    'triumphal-arch': ['/images/places/triumphal-arch-1934.jpg'],
  }
  const noImage = ['dorogomilovskoe-cemetery']
  for (const locale of ['ru', 'en'] as const) {
    const paths = new Set<string>()
    for (const place of getPlaces(locale)) {
      const images = [
        ...(place.coverImage ? [place.coverImage] : []),
        ...(place.gallery ?? []),
      ]
      const counterpart = getPlaceById(locale === 'ru' ? 'en' : 'ru', place.id)!
      const otherImages = [
        ...(counterpart.coverImage ? [counterpart.coverImage] : []),
        ...(counterpart.gallery ?? []),
      ]
      assert.deepEqual(
        images.map(({ src, sourceId }) => [src, sourceId]),
        otherImages.map(({ src, sourceId }) => [src, sourceId]),
        place.id,
      )
      if (noImage.includes(place.id)) assert.equal(images.length, 0, place.id)
      if (place.id in covers)
        assert.equal(
          place.coverImage?.src,
          covers[place.id as keyof typeof covers],
        )
      if (place.id in galleries)
        assert.deepEqual(
          place.gallery?.map((image) => image.src),
          galleries[place.id as keyof typeof galleries],
        )
      for (const image of images) {
        assert.match(image.src, /^\/images\/[a-z]+\/[a-z0-9-]+\.(?:jpe?g|png)$/)
        assert.equal(
          images.filter((asset) => asset.src === image.src).length,
          1,
        )
        paths.add(image.src)
        const path = `public${image.src}`
        assert.ok(existsSync(path), path)
        const binary = readFileSync(path)
        if (image.src.endsWith('.png')) {
          assert.equal(
            binary.subarray(0, 8).toString('hex'),
            '89504e470d0a1a0a',
            path,
          )
        } else {
          assert.equal(binary[0], 0xff, path)
          assert.equal(binary[1], 0xd8, path)
          assert.equal(binary.at(-2), 0xff, path)
          assert.equal(binary.at(-1), 0xd9, path)
        }
        if (place.id === 'kutuzov-monument') {
          assert.ok(image.alt.trim())
          assert.equal(
            image.caption,
            locale === 'ru'
              ? 'Памятник М. И. Кутузову и участникам Отечественной войны 1812 года. Современный вид, 2026 год'
              : 'Monument to Mikhail Kutuzov and the participants in the Patriotic War of 1812. Present-day view, 2026',
          )
          assert.equal(image.description, undefined)
          assert.equal(image.credit, undefined)
          assert.equal(image.sourceId, undefined)
          continue
        }
        if (
          image.src === '/images/places/kutuzov-hut-modern-2026.png' ||
          image.src === '/images/places/poklonnaya-gora-modern-2026.png'
        ) {
          assert.ok(image.alt.trim())
          assert.equal(image.caption, undefined)
          assert.equal(image.description, undefined)
          assert.equal(image.credit, undefined)
          assert.equal(image.sourceId, undefined)
          continue
        }
        if (
          image.src ===
          '/images/places/dorogomilovskaya-zastava-modern-2026.png'
        ) {
          assert.ok(image.alt.trim())
          assert.equal(
            image.caption,
            locale === 'ru'
              ? 'Место бывшей Дорогомиловской заставы в современной Москве. 2026 год'
              : 'The site of the former Dorogomilovskaya Gate in present-day Moscow. 2026',
          )
          assert.equal(image.credit, undefined)
          assert.equal(image.sourceId, undefined)
          continue
        }
        if (
          image.src === '/images/places/borodino-soldiers-memorial-2026.jpeg'
        ) {
          assert.ok(image.alt.trim())
          assert.equal(
            image.caption,
            locale === 'ru'
              ? 'Памятник на братской могиле воинов, погибших в Бородинском сражении 1812 года. Современный вид, 2026 год'
              : 'Monument at the mass grave of soldiers who died in the Battle of Borodino in 1812. Present-day view, 2026',
          )
          assert.equal(image.credit, undefined)
          assert.equal(image.sourceId, undefined)
          continue
        }
        if (image.src === '/images/places/fili-memorial-verst-post-2026.jpeg') {
          assert.ok(image.alt.trim())
          assert.equal(
            image.caption,
            locale === 'ru'
              ? 'Памятный верстовой столб в Филях. Современный вид, 2026 год'
              : 'Memorial milepost at Fili. Present-day view, 2026',
          )
          assert.equal(image.description, undefined)
          assert.equal(image.credit, undefined)
          assert.equal(image.sourceId, undefined)
          continue
        }
        if (image.src === '/images/places/archangel-michael-chapel-2026.png') {
          assert.ok(image.alt.trim())
          assert.equal(
            image.caption,
            locale === 'ru'
              ? 'Часовня Архангела Михаила. Современный вид, 2026 год'
              : 'Chapel of the Archangel Michael. Present-day view, 2026',
          )
          assert.equal(image.description, undefined)
          assert.equal(image.credit, undefined)
          assert.equal(image.sourceId, undefined)
          continue
        }
        if (image.src === '/images/places/borodino-panorama-museum-2026.jpeg') {
          assert.ok(image.alt.trim())
          assert.equal(
            image.caption,
            locale === 'ru'
              ? 'Музей-панорама „Бородинская битва“. Современный вид здания музея, 2026 год'
              : 'Battle of Borodino Panorama Museum. Present-day view of the museum building, 2026',
          )
          assert.equal(image.description, undefined)
          assert.equal(image.credit, undefined)
          assert.equal(image.sourceId, undefined)
          continue
        }
        if (image.src === '/images/places/triumphal-arch-modern-2026.png') {
          assert.ok(image.alt.trim())
          assert.ok(image.caption?.trim())
          assert.ok(image.description?.trim())
          assert.equal(image.credit, undefined)
          assert.equal(image.sourceId, undefined)
          continue
        }
        for (const field of [
          'alt',
          'caption',
          'description',
          'credit',
        ] as const)
          assert.ok(image[field]?.trim(), `${locale}/${place.id}/${field}`)
        assert.ok(image.sourceId)
        const source = getSourceById(locale, image.sourceId)
        assert.equal(source?.type, 'media')
        assert.ok(
          source?.url?.startsWith('https://commons.wikimedia.org/wiki/'),
        )
        assert.equal(
          source?.url,
          getSourceById(locale === 'ru' ? 'en' : 'ru', image.sourceId)?.url,
        )
      }
    }
    assert.equal(
      getPlaces(locale).filter((place) => place.coverImage).length,
      Object.keys(covers).length,
    )
    assert.equal(
      getPlaces(locale).reduce(
        (count, place) => count + (place.gallery?.length ?? 0),
        0,
      ),
      2,
    )
    const hut = getPlaceById(locale, 'kutuzov-hut')!
    assert.deepEqual(hut.beforeAfter?.[0]?.before, hut.gallery?.[0])
    assert.deepEqual(hut.beforeAfter?.[0]?.after, hut.coverImage)
    assert.deepEqual(
      getPlaces(locale)
        .filter(
          (place) =>
            !place.coverImage &&
            !place.gallery?.length &&
            !place.beforeAfter?.length,
        )
        .map((place) => place.id)
        .sort(),
      [...noImage].sort(),
    )
    assert.equal(paths.size, 14)
  }
  assert.equal(
    createHash('sha256')
      .update(
        readFileSync('public/images/places/fili-memorial-verst-post-2026.jpeg'),
      )
      .digest('hex'),
    '654adf5d8540fe9183df250801cb40ba3a67447cf7676c90804ad193b9b2dc5e',
  )
})

test('Timeline enrichment preserves metadata and chronology with three paragraphs per event', () => {
  // Baseline before the approved content and media passes. Protect historical
  // fields, including entity order, dates, flags, relations and sourceIds.
  const metadataHashes = {
    ru: '3a1798963459d8ca05c98666964397024660e0b4d5d61b66f598f4bc9469850c',
    en: '11d812dd5f53d08c9c5420248e04eff3cb814ec6595e98fc328bf5b5cea1b582',
  }
  const contentHashes = {
    ru: 'e8fb28bd49b661457d40c93647b5069d351dcf8c7a77f70daa072695ff171830',
    en: 'aba7a3f7c9c5d3f6693dabfd5a59538b36f5463d79b4b31392fb59450c0ec645',
  }
  assert.deepEqual(
    ru.timeline.map((event) => [event.id, event.slug]),
    en.timeline.map((event) => [event.id, event.slug]),
  )
  for (const locale of ['ru', 'en'] as const) {
    const catalog = getCatalog(locale)
    assert.equal(catalog.timeline.length, 20)
    assert.equal(
      catalog.timeline.reduce(
        (count, event) => count + event.content.length,
        0,
      ),
      60,
    )
    const metadata = catalog.timeline.map((event) =>
      Object.fromEntries(
        Object.entries(event).filter(
          ([field]) => field !== 'content' && field !== 'image',
        ),
      ),
    )
    assert.equal(
      createHash('sha256').update(JSON.stringify(metadata)).digest('hex'),
      metadataHashes[locale],
    )
    assert.equal(
      createHash('sha256')
        .update(JSON.stringify(catalog.timeline.map((event) => event.content)))
        .digest('hex'),
      contentHashes[locale],
    )
    let ranges = 0
    for (const event of catalog.timeline) {
      assert.equal(event.content.length, 3, `${locale}/${event.id}`)
      assert.ok(event.content.every((paragraph) => paragraph.trim().length > 0))
      assert.deepEqual(
        getTimelineEventBySlug(locale, event.slug)?.content,
        event.content,
      )
      assert.match(event.dateOldStyle, /^\d{4}-\d{2}-\d{2}$/)
      assert.match(event.sortDate, /^\d{4}-\d{2}-\d{2}$/)
      for (const date of [
        event.dateNewStyle,
        event.dateEndOldStyle,
        event.dateEndNewStyle,
      ])
        if (date !== undefined) assert.match(date, /^\d{4}-\d{2}-\d{2}$/)
      if (event.dateEndOldStyle || event.dateEndNewStyle) {
        ranges++
        assert.equal(
          getTimelineEventById(locale, event.id)?.dateEndOldStyle,
          event.dateEndOldStyle,
        )
        assert.equal(
          getTimelineEventById(locale, event.id)?.dateEndNewStyle,
          event.dateEndNewStyle,
        )
      }
    }
    assert.ok(ranges > 0)
    const original = [...catalog.timeline]
    const sorted = sortTimelineEvents([...original].reverse())
    assert.deepEqual(
      sorted.map((item) => item.id),
      getTimelineEvents(locale).map((item) => item.id),
    )
    assert.deepEqual(catalog.timeline, original)
  }
  const base = ru.timeline[0]!
  const tied: TimelineEvent[] = [
    { ...base, id: 'test-b', sortDate: '2000-01-01' },
    { ...base, id: 'test-a', sortDate: '2000-01-01' },
  ]
  assert.deepEqual(
    sortTimelineEvents(tied).map((item) => item.id),
    ['test-a', 'test-b'],
  )
})

test('Timeline production media has local files, localized parity and approved source references', () => {
  const unresolved = [
    'armies-unite-smolensk',
    'liberation-russia',
    'manifest-end-war',
  ]
  const reused = {
    smolensk: 'smolensk-battle',
    'kutuzov-command': 'kutuzov',
    borodino: 'borodino-battle',
    'council-fili': 'military-council-fili',
    'moscow-fire': 'moscow-fire',
    'tarutino-battle': 'tarutino-maneuver',
    'napoleon-leaves-moscow': 'patriotic-war-1812',
    maloyaroslavets: 'maloyaroslavets',
    berezina: 'berezina',
  }
  const manifest = JSON.parse(
    readFileSync('docs/research/media-manifest.json', 'utf8'),
  ) as {
    items: {
      target: string
      licenseStatus: string
      sourcePage: string
      originalSha1?: string
    }[]
  }
  for (const locale of ['ru', 'en'] as const) {
    const events = getTimelineEvents(locale)
    assert.equal(events.filter((event) => event.image).length, 17)
    assert.deepEqual(
      events.filter((event) => !event.image).map((event) => event.id),
      unresolved,
    )
    const binaries = new Set<string>()
    for (const event of events) {
      const image = event.image
      const counterpart = getTimelineEventById(
        locale === 'ru' ? 'en' : 'ru',
        event.id,
      )?.image
      assert.equal(image?.src, counterpart?.src, event.id)
      assert.equal(image?.sourceId, counterpart?.sourceId, event.id)
      if (!image) continue
      assert.match(
        image.src,
        /^\/images\/(timeline|dictionary)\/[a-z0-9-]+\.(jpg|png|svg)$/,
      )
      const path = `public${image.src}`
      assert.ok(existsSync(path), path)
      for (const field of ['alt', 'caption', 'description', 'credit'] as const)
        assert.ok(image[field]?.trim(), `${locale}/${event.id}/${field}`)
      assert.ok(image.sourceId)
      const source = getSourceById(locale, image.sourceId)
      assert.equal(source?.type, 'media')
      assert.ok(source?.url?.startsWith('https://'))
      const approved = manifest.items.find((item) => item.target === path)
      assert.equal(approved?.licenseStatus, 'approved', event.id)
      assert.ok(approved.sourcePage)
      const binary = readFileSync(path)
      const hash = createHash('sha1').update(binary).digest('hex')
      assert.ok(!binaries.has(hash), `Duplicate Timeline binary: ${event.id}`)
      binaries.add(hash)
      if (approved.originalSha1) assert.equal(hash, approved.originalSha1)
      const dictionaryId = reused[event.id as keyof typeof reused]
      if (dictionaryId) {
        const reusedImage = getDictionaryEntryById(locale, dictionaryId)?.image
        assert.equal(image.src, reusedImage?.src, event.id)
        assert.equal(image.sourceId, reusedImage?.sourceId, event.id)
      }
    }
    const home = getHomepageTimelineEvents(
      events,
      getDictionaryEntries(locale),
      locale,
    )
    assert.equal(home.filter((event) => event.artwork).length, 6)
    for (const event of home) {
      const image = getTimelineEventById(locale, event.id)?.image
      assert.equal(event.artwork?.src, image?.src, event.id)
      assert.equal(event.artwork?.sourceId, image?.sourceId, event.id)
    }
    const krasny = getTimelineEventById(locale, 'krasny')!
    assert.equal(krasny.dateOldStyle, '1812-11-03')
    assert.equal(krasny.dateEndOldStyle, '1812-11-06')
    assert.equal(krasny.image?.src, '/images/timeline/krasny-losmina-hess.jpg')
    assert.equal(krasny.image?.sourceId, 'src-media-timeline-krasny')
    assert.ok(
      getSourceById(locale, krasny.image!.sourceId!)?.url?.endsWith(
        'File%3AHess-1812losmina.jpg',
      ) ||
        getSourceById(locale, krasny.image!.sourceId!)?.url?.endsWith(
          'File:Hess-1812losmina.jpg',
        ),
    )
    assert.match(krasny.image!.caption!, /6 \(18\) (ноября|November)/)
    assert.ok(!krasny.image!.src.includes('Krasnoy1812'))
    assert.match(
      getTimelineEventById(locale, 'kutuzov-command')!.image!.description!,
      /Контекстуальный портрет|Contextual portrait/,
    )
    assert.match(
      getTimelineEventById(locale, 'shevardino')!.image!.credit!,
      /Tuzanna.*CC BY-SA 4\.0/,
    )
    assert.match(
      getTimelineEventById(locale, 'tarutino-march')!.image!.credit!,
      /Kaidor.*OpenStreetMap contributors.*ODbL/,
    )
  }
})

test('timeline display preserves supplied dates, complete range labels, and year boundaries', () => {
  for (const locale of ['ru', 'en'] as const) {
    const range = formatTimelineDates('1812-08-04', '1812-08-06', locale)
    assert.equal(range.startText, '4')
    assert.ok(range.startLabel.includes('1812'))
    assert.ok(range.endLabel?.includes('1812'))
    assert.ok(range.startLabel.includes(locale === 'ru' ? 'августа' : 'August'))
    const crossing = formatTimelineDates('1812-12-25', '1813-01-06', locale)
    assert.ok(crossing.startText.includes('1812'))
    assert.ok(crossing.endText?.includes('1813'))
    const single = formatTimelineDates('1813-01-06', undefined, locale)
    assert.equal(single.endText, undefined)
    assert.ok(single.startText.includes('6'))
    assert.ok(single.startText.includes(locale === 'ru' ? 'января' : 'January'))
    for (const event of getTimelineEvents(locale)) {
      const old = formatTimelineDates(
        event.dateOldStyle,
        event.dateEndOldStyle,
        locale,
      )
      assert.ok(old.startLabel.includes(event.dateOldStyle.slice(0, 4)))
      if (event.dateEndOldStyle) assert.ok(old.endLabel)
      if (event.dateNewStyle) {
        const modern = formatTimelineDates(
          event.dateNewStyle,
          event.dateEndNewStyle,
          locale,
        )
        assert.ok(modern.startLabel.includes(event.dateNewStyle.slice(0, 4)))
      }
    }
  }
})

test('both production locales generate detail routes from catalog data', () => {
  const routes = getDynamicPrerenderRoutes()
  const expected = (['ru', 'en'] as const)
    .flatMap((locale) => {
      const catalog = getCatalog(locale)
      const prefix = locale === 'en' ? '/en' : ''
      return [
        ...catalog.places.map(
          (item) => `${prefix}/places/${encodeURIComponent(item.slug)}`,
        ),
        ...catalog.dictionary.map(
          (item) => `${prefix}/dictionary/${encodeURIComponent(item.slug)}`,
        ),
        ...catalog.timeline.map(
          (item) => `${prefix}/timeline/${encodeURIComponent(item.slug)}`,
        ),
      ]
    })
    .sort()
  assert.deepEqual(routes, expected)
  assert.equal(routes.filter((route) => !route.startsWith('/en/')).length, 62)
  assert.equal(routes.filter((route) => route.startsWith('/en/')).length, 62)
  assert.equal(routes.length, 124)
})

test('strict RU/EN parity covers IDs, slugs, sources and structural history', () => {
  assert.equal(selectLocale('de'), 'ru')
  for (const name of ['places', 'dictionary', 'timeline', 'sources'] as const) {
    assert.deepEqual(
      ru[name].map((item) => item.id).sort(),
      en[name].map((item) => item.id).sort(),
    )
  }
  for (const name of ['places', 'dictionary', 'timeline'] as const) {
    assert.deepEqual(
      ru[name].map((item) => [item.id, item.slug]).sort(),
      en[name].map((item) => [item.id, item.slug]).sort(),
    )
  }
  assert.deepEqual(getCatalogProblems(), [])
  const changed: ContentCatalog = structuredClone(en)
  changed.places[0]!.coordinates.lat += 0.001
  changed.timeline[0]!.sortDate = '2000-01-01'
  changed.sources[0]!.url = 'https://example.invalid'
  const problems = getCatalogProblems({ ru, en: changed })
  assert.ok(problems.some((problem) => problem.includes('coordinates differs')))
  assert.ok(problems.some((problem) => problem.includes('sortDate differs')))
  assert.ok(problems.some((problem) => problem.includes('url differs')))
})

test('integrity checks reject broken sources, relations, and invalid Place values', () => {
  const catalog: ContentCatalog = structuredClone(ru)
  catalog.places[0]!.sourceIds = ['missing-source']
  catalog.places[0]!.relatedDictionaryIds = ['missing-entry']
  catalog.places[0]!.historicalStatus = 'invalid' as never
  catalog.places[0]!.locationPrecision = 'invalid' as never
  const issues = getCatalogProblems({ ru: catalog, en })
  assert.ok(issues.some((issue) => issue.includes('unknown sourceId')))
  assert.ok(issues.some((issue) => issue.includes('unresolved relation')))
  assert.ok(issues.some((issue) => issue.includes('invalid historicalStatus')))
  assert.ok(issues.some((issue) => issue.includes('invalid locationPrecision')))
})

test('media captions preserve localized captions and remove repeated authors in both locales', () => {
  for (const locale of ['ru', 'en'] as const) {
    for (const entry of getDictionaryEntries(locale).filter(
      (entry) => entry.image,
    )) {
      const asset = entry.image!
      const before = JSON.stringify(asset)
      const source = getSourceById(locale, asset.sourceId!)
      const translated = getSourceById(
        locale === 'ru' ? 'en' : 'ru',
        asset.sourceId!,
      )
      const presentation = normalizeMediaCaption(asset, source, translated)
      assert.ok(presentation.caption.startsWith(asset.caption!))
      if (asset.description)
        assert.ok(presentation.caption.includes(asset.description))
      const credit = asset.credit!.split(' · ')
      // The photo's unknown photographer is distinct from its depicted subject.
      assert.equal(
        presentation.attribution,
        (entry.id === 'roubaud' ? credit : credit.slice(1)).join(' · '),
      )
      assert.equal(presentation.sourceLabel, 'Wikimedia Commons')
      assert.equal(presentation.sourceUrl, source?.url)
      assert.equal(JSON.stringify(asset), before)
    }
  }
})

test('media presentation retains incomplete metadata and never invents attribution', () => {
  const asset = { src: '/image.jpg', alt: 'Artwork' }
  assert.equal(
    normalizeMediaCaption({
      ...asset,
      caption: 'Artwork — George Dawe, 1817.',
      credit: 'George Dawe · Collection · PD-Art',
    }).attribution,
    'Collection · PD-Art',
  )
  assert.deepEqual(normalizeMediaCaption(asset), {
    caption: '',
    attribution: '',
    sourceLabel: '',
    sourceUrl: undefined,
  })
  assert.equal(
    normalizeMediaCaption({ ...asset, credit: 'Artist · Collection · CC BY' })
      .attribution,
    'Artist · Collection · CC BY',
  )
  assert.equal(
    normalizeMediaCaption({
      ...asset,
      caption: 'Artwork, 1812.',
      credit: 'Artist · CC BY',
    }).attribution,
    'Artist · CC BY',
  )
  assert.equal(
    normalizeMediaCaption({ ...asset, caption: 'Artist. Artwork, 1812.' })
      .caption,
    'Artist. Artwork, 1812.',
  )
  const source = {
    id: 'media',
    title: 'Archive record',
    type: 'media',
    url: 'https://example.org/artwork',
  }
  const presentation = normalizeMediaCaption(
    {
      ...asset,
      description: 'Context only.',
      credit: 'Collection · CC BY · Archive record',
    },
    source,
  )
  assert.equal(presentation.caption, 'Context only.')
  assert.equal(presentation.attribution, 'Collection · CC BY')
  assert.equal(presentation.sourceLabel, 'Archive record')
  assert.equal(presentation.sourceUrl, source.url)
})

test('Timeline presentation preserves chronology and flags, and reuses sourced local artwork', () => {
  assert.equal(timelineLandmarks.length, 6)
  const available = Object.keys(timelineArtworkDictionaryIds).map(
    (id) => getTimelineArtwork(getDictionaryEntries('ru'), id)!.src,
  )
  for (const locale of ['ru', 'en'] as const) {
    const production = getTimelineEvents(locale)
    const before = JSON.stringify(production)
    const presented = getPresentedTimelineEvents(
      production,
      getDictionaryEntries(locale),
      locale,
      available,
    )
    assert.deepEqual(
      presented.map((event) => event.id),
      production.map((event) => event.id),
    )
    assert.deepEqual(
      presented.map((event) => event.featured),
      production.map((event) => event.featured),
    )
    assert.equal(
      presented.filter((event) => event.tier === 'landmark').length,
      6,
    )
    assert.equal(
      presented.filter((event) => event.tier === 'featured').length,
      10,
    )
    assert.equal(
      presented.filter((event) => event.tier === 'regular').length,
      4,
    )
    assert.equal(presented.filter((event) => event.artwork).length, 8)
    for (const event of presented.filter((event) => event.artwork)) {
      assert.ok(existsSync(`public${event.artwork!.src}`))
      assert.ok(event.artwork!.caption)
      assert.ok(event.artwork!.credit)
      assert.ok(getSourceById(locale, event.artwork!.sourceId!))
    }
    assert.equal(
      getPresentedTimelineEvents(
        production,
        getDictionaryEntries(locale),
        locale,
        [],
      ).filter((event) => event.artwork).length,
      0,
    )
    assert.equal(JSON.stringify(production), before)
  }
  assert.equal(
    getTimelineArtwork(getDictionaryEntries('ru'), 'tarutino-march'),
    undefined,
  )
  assert.equal(
    getTimelineArtwork(getDictionaryEntries('ru'), 'shevardino'),
    undefined,
  )
})
