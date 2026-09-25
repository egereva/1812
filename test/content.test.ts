import assert from 'node:assert/strict'
import test from 'node:test'
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
        catalog.sources.length,
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

test('timeline dates are explicit and sorting is deterministic', () => {
  for (const locale of ['ru', 'en'] as const) {
    const catalog = getCatalog(locale)
    let ranges = 0
    for (const event of catalog.timeline) {
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
