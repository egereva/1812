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
const en = getCatalog('en')

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
      [13, 29, 20, 25],
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
