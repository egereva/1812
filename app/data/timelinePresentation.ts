import type {
  Locale,
  MediaAsset,
  DictionaryEntry,
  TimelineEvent,
} from '../../shared/types/content.ts'

// Editorial presentation only; production flags, dates and relations stay intact.
export const timelineLandmarks = [
  {
    id: 'invasion-neman',
    variant: 'burgundy',
    previewTitle: { ru: 'Начало вторжения', en: 'The invasion' },
  },
  {
    id: 'borodino',
    variant: 'wide',
    previewTitle: { ru: 'Бородино', en: 'Borodino' },
  },
  {
    id: 'council-fili',
    variant: 'split',
    previewTitle: { ru: 'Совет в Филях', en: 'Council at Fili' },
  },
  {
    id: 'napoleon-leaves-moscow',
    variant: 'graphite',
    previewTitle: { ru: 'Выход из Москвы', en: 'Leaving Moscow' },
  },
  {
    id: 'maloyaroslavets',
    variant: 'split',
    previewTitle: { ru: 'Малоярославец', en: 'Maloyaroslavets' },
  },
  {
    id: 'manifest-end-war',
    variant: 'burgundy',
    previewTitle: { ru: 'Окончание войны', en: 'The war ends' },
  },
] as const

export const timelineArtworkDictionaryIds: Readonly<Record<string, string>> = {
  smolensk: 'smolensk-battle',
  borodino: 'borodino-battle',
  'council-fili': 'military-council-fili',
  'moscow-fire': 'moscow-fire',
  // The painting depicts the battle, not the earlier march-manoeuvre.
  'tarutino-battle': 'tarutino-maneuver',
  'napoleon-leaves-moscow': 'patriotic-war-1812',
  maloyaroslavets: 'maloyaroslavets',
  berezina: 'berezina',
}

export function getTimelineArtwork(
  dictionary: readonly DictionaryEntry[],
  eventId: string,
): MediaAsset | undefined {
  const dictionaryId = timelineArtworkDictionaryIds[eventId]
  const image = dictionaryId
    ? dictionary.find((entry) => entry.id === dictionaryId)?.image
    : undefined
  if (!image) return undefined
  // Explicitly label the 1813 painting as an artistic depiction in this context.
  return eventId === 'moscow-fire'
    ? {
        ...image,
        description: dictionary.find((entry) => entry.id === 'smolensk-battle')
          ?.image?.description,
      }
    : image
}

export function getPresentedTimelineEvents(
  events: readonly TimelineEvent[],
  dictionary: readonly DictionaryEntry[],
  locale: Locale,
  availableSrcs: readonly string[],
) {
  return events.map((event) => {
    const landmark = timelineLandmarks.find((item) => item.id === event.id)
    const artwork = getTimelineArtwork(dictionary, event.id)
    return {
      ...event,
      tier: landmark ? 'landmark' : event.featured ? 'featured' : 'regular',
      variant: landmark?.variant,
      previewTitle: landmark?.previewTitle[locale],
      artwork:
        artwork && availableSrcs.includes(artwork.src) ? artwork : undefined,
    }
  })
}
