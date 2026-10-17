import ruSite from '../../content/ru/site.json' with { type: 'json' }
import ruPlaces from '../../content/ru/places.json' with { type: 'json' }
import ruDictionary from '../../content/ru/dictionary.json' with { type: 'json' }
import ruTimeline from '../../content/ru/timeline.json' with { type: 'json' }
import ruSources from '../../content/ru/sources.json' with { type: 'json' }
import enSite from '../../content/en/site.json' with { type: 'json' }
import enPlaces from '../../content/en/places.json' with { type: 'json' }
import enDictionary from '../../content/en/dictionary.json' with { type: 'json' }
import enTimeline from '../../content/en/timeline.json' with { type: 'json' }
import enSources from '../../content/en/sources.json' with { type: 'json' }
import { historicalStatuses, locationPrecisions } from '../types/content.ts'
import type {
  ContentCatalog,
  ContentEntity,
  DictionaryEntry,
  EntityKind,
  Id,
  Locale,
  Place,
  RelatedContent,
  Slug,
  Source,
  SiteContent,
  TimelineEvent,
} from '../types/content.ts'

export const contentRelease = {
  ru: 'production',
  en: 'production',
} as const satisfies Record<Locale, 'production' | 'pending'>

// Editorial page prose belongs to the localized site packages.
function siteContent(site: {
  title: string
  description: string
  homeIntroduction: SiteContent['homeIntroduction']
  about: SiteContent['about']
}): SiteContent {
  return {
    siteTitle: site.title,
    siteDescription: site.description,
    hero: [],
    home: { dictionary: [], timeline: [], map: [] },
    homeIntroduction: site.homeIntroduction,
    about: site.about,
  }
}

export const catalogs: Record<Locale, ContentCatalog> = {
  ru: {
    site: siteContent(ruSite),
    places: ruPlaces as Place[],
    dictionary: ruDictionary,
    timeline: ruTimeline,
    sources: ruSources,
  },
  en: {
    site: siteContent(enSite),
    places: enPlaces as Place[],
    dictionary: enDictionary,
    timeline: enTimeline,
    sources: enSources,
  },
}

export function selectLocale(value: unknown): Locale {
  return value === 'en' ? 'en' : 'ru'
}

export function getCatalog(locale: unknown = 'ru'): ContentCatalog {
  return catalogs[selectLocale(locale)]
}

function byId<T extends { id: Id }>(
  items: readonly T[],
  id: Id,
): T | undefined {
  return items.find((item) => item.id === id)
}

function bySlug<T extends { slug: Slug }>(
  items: readonly T[],
  slug: Slug,
): T | undefined {
  return items.find((item) => item.slug === slug)
}

export const getSiteContent = (locale: unknown = 'ru') =>
  getCatalog(locale).site
export const getPlaces = (locale: unknown = 'ru') => getCatalog(locale).places
export const getPlaceById = (locale: unknown, id: Id) =>
  byId(getPlaces(locale), id)
export const getPlaceBySlug = (locale: unknown, slug: Slug) =>
  bySlug(getPlaces(locale), slug)

export const getDictionaryEntries = (locale: unknown = 'ru') =>
  getCatalog(locale).dictionary
export const getDictionaryEntryById = (locale: unknown, id: Id) =>
  byId(getDictionaryEntries(locale), id)
export const getDictionaryEntryBySlug = (locale: unknown, slug: Slug) =>
  bySlug(getDictionaryEntries(locale), slug)

export function sortTimelineEvents(
  events: readonly TimelineEvent[],
): TimelineEvent[] {
  return [...events].sort(
    (a, b) => a.sortDate.localeCompare(b.sortDate) || a.id.localeCompare(b.id),
  )
}

export const getTimelineEvents = (locale: unknown = 'ru') =>
  sortTimelineEvents(getCatalog(locale).timeline)
export const getTimelineEventById = (locale: unknown, id: Id) =>
  byId(getCatalog(locale).timeline, id)
export const getTimelineEventBySlug = (locale: unknown, slug: Slug) =>
  bySlug(getCatalog(locale).timeline, slug)

export function resolveTimelinePlaceContext(locale: unknown, value: unknown) {
  if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
    return undefined
  const event = getTimelineEventBySlug(locale, value)
  if (!event) return undefined
  const places = resolveRelatedContent(locale, 'timeline', event.id).places
  return places.length ? { event, places } : undefined
}

export const getSources = (locale: unknown = 'ru') => getCatalog(locale).sources
export function getSourceGroups(locale: unknown = 'ru') {
  const sources = getSources(locale)
  return {
    research: sources.filter((source) => source.type !== 'media'),
    media: sources.filter((source) => source.type === 'media'),
  }
}
export const getSourceById = (locale: unknown, id: Id) =>
  byId(getSources(locale), id)

function includesId(ids: readonly Id[] | undefined, id: Id): boolean {
  return Array.isArray(ids) && ids.includes(id)
}

function resolveEntity(
  catalog: ContentCatalog,
  kind: EntityKind,
  id: Id,
): ContentEntity | undefined {
  if (kind === 'place') return byId(catalog.places, id)
  if (kind === 'dictionary') return byId(catalog.dictionary, id)
  return byId(catalog.timeline, id)
}

export function resolveRelatedContent(
  locale: unknown,
  kind: EntityKind,
  id: Id,
  catalog: ContentCatalog = getCatalog(locale),
): RelatedContent {
  const entity = resolveEntity(catalog, kind, id)
  const empty: RelatedContent = {
    places: [],
    dictionary: [],
    timeline: [],
    sources: [],
  }
  if (!entity) return empty

  const matches = <T extends ContentEntity>(
    item: T,
    directIds: readonly Id[] | undefined,
    reverseIds: readonly Id[] | undefined,
    targetKind: EntityKind,
  ) =>
    !(kind === targetKind && item.id === id) &&
    (includesId(directIds, item.id) || includesId(reverseIds, id))

  return {
    places: catalog.places.filter((item: Place) =>
      matches(item, entity.relatedPlaceIds, item[relationField(kind)], 'place'),
    ),
    dictionary: catalog.dictionary.filter((item: DictionaryEntry) =>
      matches(
        item,
        entity.relatedDictionaryIds,
        item[relationField(kind)],
        'dictionary',
      ),
    ),
    timeline: catalog.timeline.filter((item: TimelineEvent) =>
      matches(
        item,
        entity.relatedTimelineIds,
        item[relationField(kind)],
        'timeline',
      ),
    ),
    sources: catalog.sources.filter((item: Source) =>
      includesId(entity.sourceIds, item.id),
    ),
  }
}

function relationField(kind: EntityKind) {
  return {
    place: 'relatedPlaceIds',
    dictionary: 'relatedDictionaryIds',
    timeline: 'relatedTimelineIds',
  }[kind] as 'relatedPlaceIds' | 'relatedDictionaryIds' | 'relatedTimelineIds'
}

export function getDynamicPrerenderRoutes(
  source: Record<Locale, ContentCatalog> = catalogs,
  release: Record<Locale, 'production' | 'pending'> = contentRelease,
): string[] {
  const routes = new Set<string>()
  for (const locale of ['ru', 'en'] as const) {
    if (release[locale] !== 'production') continue
    const prefix = locale === 'en' ? '/en' : ''
    for (const item of source[locale].places)
      routes.add(`${prefix}/places/${encodeURIComponent(item.slug)}`)
    for (const item of source[locale].dictionary)
      routes.add(`${prefix}/dictionary/${encodeURIComponent(item.slug)}`)
    for (const item of source[locale].timeline)
      routes.add(`${prefix}/timeline/${encodeURIComponent(item.slug)}`)
  }
  return [...routes].sort()
}

export function getCatalogProblems(
  source: Record<Locale, ContentCatalog> = catalogs,
  release: Record<Locale, 'production' | 'pending'> = contentRelease,
): string[] {
  const problems: string[] = []
  const validStatuses = new Set<string>(historicalStatuses)
  const validPrecisions = new Set<string>(locationPrecisions)
  for (const locale of ['ru', 'en'] as const) {
    const catalog = source[locale]
    for (const place of catalog.places) {
      if (
        !place.title?.trim() ||
        !place.shortDescription?.trim() ||
        !Array.isArray(place.content) ||
        !place.content.length ||
        !place.category?.trim() ||
        !Number.isFinite(place.coordinates?.lat) ||
        !Number.isFinite(place.coordinates?.lon)
      )
        problems.push(
          `${locale}/places: missing required content for ${place.id}`,
        )
      if (!validStatuses.has(place.historicalStatus))
        problems.push(
          `${locale}/places: invalid historicalStatus for ${place.id}`,
        )
      if (!validPrecisions.has(place.locationPrecision))
        problems.push(
          `${locale}/places: invalid locationPrecision for ${place.id}`,
        )
      for (const pair of place.beforeAfter ?? []) {
        if (
          !pair.id?.trim() ||
          !pair.beforeDate?.trim() ||
          !pair.afterDate?.trim() ||
          (pair.aspectRatio !== undefined &&
            (!Number.isFinite(pair.aspectRatio) || pair.aspectRatio <= 0)) ||
          ![pair.before, pair.after].every(
            (image) =>
              image?.src?.startsWith('/images/') &&
              image.alt?.trim() &&
              (image.credit === undefined || image.credit.trim()) &&
              (image.sourceId === undefined ||
                catalog.sources.some((source) => source.id === image.sourceId)),
          )
        )
          problems.push(
            `${locale}/places: invalid image comparison for ${place.id}`,
          )
      }
    }
    for (const [name, items] of [
      ['places', catalog.places],
      ['dictionary', catalog.dictionary],
      ['timeline', catalog.timeline],
      ['sources', catalog.sources],
    ] as const) {
      const ids = new Set<string>()
      const slugs = new Set<string>()
      for (const item of items) {
        if (typeof item.id !== 'string' || !item.id.trim() || ids.has(item.id))
          problems.push(`${locale}/${name}: invalid or duplicate id ${item.id}`)
        ids.add(item.id)
        if ('slug' in item) {
          if (
            typeof item.slug !== 'string' ||
            !item.slug.trim() ||
            slugs.has(item.slug)
          )
            problems.push(
              `${locale}/${name}: invalid or duplicate slug ${item.slug}`,
            )
          slugs.add(item.slug)
        }
      }
    }
    for (const entity of [
      ...catalog.places,
      ...catalog.dictionary,
      ...catalog.timeline,
    ]) {
      if (!Array.isArray(entity.sourceIds) || entity.sourceIds.length === 0)
        problems.push(`${locale}/${entity.id}: sourceIds must be nonempty`)
      else
        for (const id of entity.sourceIds)
          if (!catalog.sources.some((source) => source.id === id))
            problems.push(`${locale}/${entity.id}: unknown sourceId ${id}`)
    }
    for (const event of catalog.timeline) {
      for (const field of [
        'dateOldStyle',
        'dateNewStyle',
        'dateEndOldStyle',
        'dateEndNewStyle',
        'sortDate',
      ] as const) {
        const value = event[field]
        if (
          (field === 'dateOldStyle' ||
            field === 'sortDate' ||
            value !== undefined) &&
          (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        )
          problems.push(`${locale}/timeline: invalid ${field} for ${event.id}`)
      }
    }
  }
  for (const name of ['places', 'dictionary', 'timeline'] as const) {
    const enById = new Map(source.en[name].map((item) => [item.id, item.slug]))
    const enBySlug = new Map(
      source.en[name].map((item) => [item.slug, item.id]),
    )
    for (const item of source.ru[name]) {
      const enSlug = enById.get(item.id)
      if (enSlug !== undefined && enSlug !== item.slug)
        problems.push(`${name}: slug differs between ru/en for ${item.id}`)
      const enId = enBySlug.get(item.slug)
      if (enId !== undefined && enId !== item.id)
        problems.push(`${name}: id differs between ru/en for slug ${item.slug}`)
    }
  }
  const enPlaces = new Map(source.en.places.map((place) => [place.id, place]))
  for (const place of source.ru.places) {
    const translation = enPlaces.get(place.id)
    if (!translation) continue
    if (place.historicalStatus !== translation.historicalStatus)
      problems.push(
        `places: historicalStatus differs between ru/en for ${place.id}`,
      )
    if (place.locationPrecision !== translation.locationPrecision)
      problems.push(
        `places: locationPrecision differs between ru/en for ${place.id}`,
      )
  }
  for (const warning of getDanglingRelations(source))
    if (release[warning.slice(0, 2) as Locale] === 'production')
      problems.push(`unresolved relation: ${warning}`)
  if (release.en === 'production') {
    const compareFields = <T>(
      collection: string,
      id: Id,
      ru: T,
      en: T,
      fields: readonly (keyof T)[],
    ) => {
      for (const field of fields)
        if (
          JSON.stringify(ru[field] ?? null) !==
          JSON.stringify(en[field] ?? null)
        )
          problems.push(
            `${collection}: ${String(field)} differs between ru/en for ${id}`,
          )
    }
    const comparePresence = <T>(
      collection: string,
      id: Id,
      ru: T,
      en: T,
      fields: readonly (keyof T)[],
    ) => {
      for (const field of fields)
        if ((ru[field] == null) !== (en[field] == null))
          problems.push(
            `${collection}: ${String(field)} presence differs between ru/en for ${id}`,
          )
    }
    for (const name of [
      'places',
      'dictionary',
      'timeline',
      'sources',
    ] as const) {
      const ruIds = new Set(source.ru[name].map((item) => item.id))
      const enIds = new Set(source.en[name].map((item) => item.id))
      for (const id of ruIds)
        if (!enIds.has(id))
          problems.push(`${name}: missing en translation for ${id}`)
      for (const id of enIds)
        if (!ruIds.has(id))
          problems.push(`${name}: en id without ru record ${id}`)
    }
    for (const ruPlace of source.ru.places) {
      const enPlace = source.en.places.find((item) => item.id === ruPlace.id)
      if (!enPlace) continue
      compareFields('places', ruPlace.id, ruPlace, enPlace, [
        'slug',
        'coordinates',
        'category',
        'historicalStatus',
        'locationPrecision',
        'sourceIds',
        'relatedPlaceIds',
        'relatedDictionaryIds',
        'relatedTimelineIds',
      ])
      comparePresence('places', ruPlace.id, ruPlace, enPlace, [
        'address',
        'locationNote',
        'historicalNote',
        'coverImage',
        'gallery',
        'beforeAfter',
      ])
      const comparisonIdentity = (place: Place) =>
        place.beforeAfter?.map((pair) => ({
          id: pair.id,
          before: [pair.before?.src, pair.before?.sourceId],
          after: [pair.after?.src, pair.after?.sourceId],
          aspectRatio: pair.aspectRatio,
          beforePosition: pair.beforePosition,
          afterPosition: pair.afterPosition,
        }))
      if (
        JSON.stringify(comparisonIdentity(ruPlace)) !==
        JSON.stringify(comparisonIdentity(enPlace))
      )
        problems.push(
          `places: image comparison identity differs between ru/en for ${ruPlace.id}`,
        )
    }
    for (const ruEntry of source.ru.dictionary) {
      const enEntry = source.en.dictionary.find(
        (item) => item.id === ruEntry.id,
      )
      if (!enEntry) continue
      compareFields('dictionary', ruEntry.id, ruEntry, enEntry, [
        'slug',
        'category',
        'sourceIds',
        'relatedPlaceIds',
        'relatedDictionaryIds',
        'relatedTimelineIds',
      ])
      comparePresence('dictionary', ruEntry.id, ruEntry, enEntry, ['image'])
    }
    for (const ruEvent of source.ru.timeline) {
      const enEvent = source.en.timeline.find((item) => item.id === ruEvent.id)
      if (!enEvent) continue
      compareFields('timeline', ruEvent.id, ruEvent, enEvent, [
        'slug',
        'dateOldStyle',
        'dateNewStyle',
        'dateEndOldStyle',
        'dateEndNewStyle',
        'sortDate',
        'featured',
        'sourceIds',
        'relatedPlaceIds',
        'relatedDictionaryIds',
        'relatedTimelineIds',
      ])
      comparePresence('timeline', ruEvent.id, ruEvent, enEvent, ['image'])
    }
    for (const ruSource of source.ru.sources) {
      const enSource = source.en.sources.find((item) => item.id === ruSource.id)
      if (!enSource) continue
      compareFields('sources', ruSource.id, ruSource, enSource, [
        'type',
        'url',
        'accessedAt',
      ])
    }
  }
  return problems
}

export function getDanglingRelations(
  source: Record<Locale, ContentCatalog> = catalogs,
): string[] {
  const warnings: string[] = []
  for (const locale of ['ru', 'en'] as const) {
    const catalog = source[locale]
    const known = {
      relatedPlaceIds: new Set(catalog.places.map((item) => item.id)),
      relatedDictionaryIds: new Set(catalog.dictionary.map((item) => item.id)),
      relatedTimelineIds: new Set(catalog.timeline.map((item) => item.id)),
      sourceIds: new Set(catalog.sources.map((item) => item.id)),
    }
    for (const entity of [
      ...catalog.places,
      ...catalog.dictionary,
      ...catalog.timeline,
    ]) {
      for (const field of Object.keys(known) as (keyof typeof known)[]) {
        const ids = entity[field]
        if (!Array.isArray(ids)) continue
        for (const id of ids) {
          if (!known[field].has(id))
            warnings.push(`${locale}/${entity.id}: ${field} -> ${id}`)
        }
      }
    }
  }
  return warnings
}
