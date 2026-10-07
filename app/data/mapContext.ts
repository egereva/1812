import type { Place, TimelineEvent } from '../../shared/types/content.ts'
import { resolveMapPlace } from './mapPresentation.ts'

export function mapEventUrl(localizedMapPath: string, slug: string) {
  return `${localizedMapPath}?event=${encodeURIComponent(slug)}`
}

export function resolveMapContext(
  places: Place[],
  placeValue: unknown,
  eventContext: { event: TimelineEvent; places: Place[] } | undefined,
): { place?: Place; event?: TimelineEvent; places: Place[] } {
  const place = resolveMapPlace(places, placeValue)
  if (place) return { place, places }
  return eventContext ?? { places }
}
