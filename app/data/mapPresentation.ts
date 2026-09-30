import type { HistoricalStatus, Place } from '../../shared/types/content.ts'

export type MapLayer = 'all' | '1812' | 'memory'

export const statusLayer: Record<HistoricalStatus, Exclude<MapLayer, 'all'>> = {
  'event-site': '1812',
  'surviving-witness': '1812',
  'lost-site': '1812',
  reconstruction: 'memory',
  memorial: 'memory',
  museum: 'memory',
}

export const markerShape: Record<HistoricalStatus, string> = {
  'event-site': 'event',
  'surviving-witness': 'witness',
  'lost-site': 'lost',
  reconstruction: 'reconstruction',
  memorial: 'memorial',
  museum: 'museum',
}

export function parseMapLayer(value: unknown): MapLayer {
  return value === '1812' || value === 'memory' ? value : 'all'
}

export function getMapPlaces(places: readonly Place[], layer: MapLayer) {
  return layer === 'all'
    ? [...places]
    : places.filter((place) => statusLayer[place.historicalStatus] === layer)
}

export function resolveMapPlace(places: readonly Place[], value: unknown) {
  if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
    return undefined
  return places.find((place) => place.slug === value)
}

export function mapPlaceUrl(localizedMapPath: string, slug: string) {
  return `${localizedMapPath}?place=${encodeURIComponent(slug)}`
}

// Web Mercator screen pixels at a given zoom. This never changes source coordinates.
function pixels(place: Place, zoom: number) {
  const scale = 256 * 2 ** zoom
  const lat = Math.max(-85.0511, Math.min(85.0511, place.coordinates.lat))
  const sin = Math.sin((lat * Math.PI) / 180)
  return {
    x: ((place.coordinates.lon + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  }
}

export function groupOverlappingPlaces(
  places: readonly Place[],
  zoom: number,
  minDistance = 48,
): Place[][] {
  const points = places.map((place) => pixels(place, zoom))
  const roots = places.map((_, index) => index)
  const root = (index: number): number => {
    while (roots[index] !== index) index = roots[index]!
    return index
  }
  for (let i = 0; i < places.length; i++) {
    for (let j = i + 1; j < places.length; j++) {
      const distance = Math.hypot(
        points[i]!.x - points[j]!.x,
        points[i]!.y - points[j]!.y,
      )
      if (distance < minDistance) roots[root(j)] = root(i)
    }
  }
  const groups = new Map<number, Place[]>()
  places.forEach((place, index) => {
    const key = root(index)
    const group = groups.get(key) ?? []
    group.push(place)
    groups.set(key, group)
  })
  return [...groups.values()]
}
