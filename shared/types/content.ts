export type Locale = 'ru' | 'en'
export type Id = string
export type Slug = string
export type IsoDate = string // YYYY-MM-DD; the field name defines the calendar style.

export interface SeoMetadata {
  title?: string
  description?: string
  image?: string
}

export interface MediaAsset {
  src: string
  alt: string
  caption?: string
  description?: string
  credit?: string
  sourceId?: Id
}

export interface BeforeAfterPair {
  id: Id
  before: MediaAsset
  after: MediaAsset
  caption?: string
  beforeDate?: string
  afterDate?: string
  aspectRatio?: number
  beforePosition?: string
  afterPosition?: string
}

export interface Coordinates {
  lat: number
  lon: number
}

export type HistoricalStatus =
  | 'event-site'
  | 'surviving-witness'
  | 'lost-site'
  | 'reconstruction'
  | 'memorial'
  | 'museum'

export type LocationPrecision = 'exact' | 'approximate'

export const historicalStatuses: readonly HistoricalStatus[] = [
  'event-site',
  'surviving-witness',
  'lost-site',
  'reconstruction',
  'memorial',
  'museum',
]
export const locationPrecisions: readonly LocationPrecision[] = [
  'exact',
  'approximate',
]

export interface EntityBase {
  id: Id
  slug: Slug
  title: string
  shortDescription: string
  content: string[]
  sourceIds: Id[]
  seo?: SeoMetadata
}

export interface Place extends EntityBase {
  address?: string
  coordinates: Coordinates
  category: string
  historicalStatus: HistoricalStatus
  locationPrecision: LocationPrecision
  locationNote?: string
  historicalNote?: string
  coverImage?: MediaAsset
  gallery?: MediaAsset[]
  beforeAfter?: BeforeAfterPair[]
  relatedPlaceIds?: Id[]
  relatedDictionaryIds?: Id[]
  relatedTimelineIds?: Id[]
}

export interface DictionaryEntry extends EntityBase {
  letter: string
  category: string
  image?: MediaAsset
  relatedPlaceIds?: Id[]
  relatedDictionaryIds?: Id[]
  relatedTimelineIds?: Id[]
}

export interface TimelineEvent extends EntityBase {
  dateOldStyle: IsoDate
  dateNewStyle?: IsoDate
  dateEndOldStyle?: IsoDate
  dateEndNewStyle?: IsoDate
  sortDate: IsoDate // Explicit editor-provided Gregorian ordering key.
  image?: MediaAsset
  featured?: boolean
  relatedPlaceIds?: Id[]
  relatedDictionaryIds?: Id[]
  relatedTimelineIds?: Id[]
}

export interface Source {
  id: Id
  title: string
  type: string
  author?: string
  publisher?: string
  year?: number
  url?: string
  accessedAt?: IsoDate
}

export interface HeroSlide {
  id: Id
  image: MediaAsset
  title: string
  subtitle?: string
  target?: string
}

export interface SiteContent {
  siteTitle: string
  siteDescription: string
  hero: HeroSlide[]
  home: { dictionary: string[]; timeline: string[]; map: string[] }
  about: {
    intro: string[]
    history: string[]
    geography: string[]
    guide: string[]
  }
}

export interface ContentCatalog {
  site: SiteContent
  places: Place[]
  dictionary: DictionaryEntry[]
  timeline: TimelineEvent[]
  sources: Source[]
}

export type EntityKind = 'place' | 'dictionary' | 'timeline'
export type ContentEntity = Place | DictionaryEntry | TimelineEvent

export interface RelatedContent {
  places: Place[]
  dictionary: DictionaryEntry[]
  timeline: TimelineEvent[]
  sources: Source[]
}
