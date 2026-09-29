import type {
  Locale,
  MediaAsset,
  DictionaryEntry,
  TimelineEvent,
} from '../../shared/types/content.ts'
import {
  getPresentedTimelineEvents,
  getTimelineArtwork,
} from './timelinePresentation.ts'

// Homepage curation is independent of the full Timeline landmark hierarchy.
// Callers filter production-sorted events, preserving historical chronology.
export const homepageTimelineEventIds = [
  'invasion-neman',
  'borodino',
  'council-fili',
  'napoleon-leaves-moscow',
  'maloyaroslavets',
  'berezina',
] as const

export const homepageTimelineInitialEventId = homepageTimelineEventIds[0]

export const homepageTimelinePreviewTitles: Record<
  string,
  Record<Locale, string>
> = {
  berezina: { ru: 'Березина', en: 'Berezina' },
}

// Verified Commons original; metadata is presentation-only, not historical JSON.
export const homepageTimelineArtworkSlots: Record<
  'invasion-neman',
  Record<Locale, MediaAsset>
> = {
  'invasion-neman': {
    ru: {
      src: '/images/timeline/crossing-neman-clark-1816.jpg',
      alt: 'Художественное изображение перехода Великой армии Наполеона через Неман.',
      caption:
        'Джон Хивисайд Кларк и М. Дюбург. Переход Великой армии через Неман, 1816.',
      description:
        'Позднейшее художественное изображение начала кампании 1812 года.',
      credit:
        'Джон Хивисайд Кларк и М. Дюбург · Общественное достояние / PD-Art · Public Domain Mark 1.0',
      sourceId: 'src-media-neman-clark-1816',
    },
    en: {
      src: '/images/timeline/crossing-neman-clark-1816.jpg',
      alt: "Later artistic depiction of Napoleon's Grande Armée crossing the Niemen.",
      caption:
        'John Heaviside Clark and M. Dubourg. The Grande Armée crossing the Niemen, 1816.',
      description:
        'A later artistic depiction of the beginning of the 1812 campaign.',
      credit:
        'John Heaviside Clark and M. Dubourg · Public domain / PD-Art · Public Domain Mark 1.0',
      sourceId: 'src-media-neman-clark-1816',
    },
  },
}

// Resolve the approved Homepage inventory in one place. A runtime whitelist
// captured before a new asset was integrated must not discard its mapping.
export function getHomepageTimelineEvents(
  events: readonly TimelineEvent[],
  dictionary: readonly DictionaryEntry[],
  locale: Locale,
) {
  const curated = events.filter((event) =>
    homepageTimelineEventIds.some((id) => id === event.id),
  )
  const artworkFor = (id: string) =>
    homepageTimelineArtworkSlots[
      id as keyof typeof homepageTimelineArtworkSlots
    ]?.[locale] ?? getTimelineArtwork(dictionary, id)
  const approvedSrcs = curated.flatMap((event) => {
    const artwork = artworkFor(event.id)
    return artwork ? [artwork.src] : []
  })
  return getPresentedTimelineEvents(
    curated,
    dictionary,
    locale,
    approvedSrcs,
  ).map((event) => ({
    ...event,
    previewTitle:
      homepageTimelinePreviewTitles[event.id]?.[locale] ?? event.previewTitle,
    artwork: artworkFor(event.id),
  }))
}
