import assert from 'node:assert/strict'
import test from 'node:test'
import {
  collapsedGroupRepresentatives,
  getMapPlaces,
  groupOverlappingPlaces,
  mapPlaceUrl,
  parseMapLayer,
  resolveMapPlace,
  statusLayer,
} from '../app/data/mapPresentation.ts'
import {
  getPlaces,
  getTimelineEvents,
  resolveRelatedContent,
  resolveTimelinePlaceContext,
} from '../shared/content/index.ts'
import {
  mapEventUrl,
  resolveMapContext as resolveContext,
} from '../app/data/mapContext.ts'
import { historicalStatuses } from '../shared/types/content.ts'
import type { Locale } from '../shared/types/content.ts'

const resolveMapContext = (locale: Locale, place: unknown, event: unknown) =>
  resolveContext(
    getPlaces(locale),
    place,
    resolveTimelinePlaceContext(locale, event),
  )

test('approved layers cover all 13 Places exactly once in RU and EN', () => {
  const expected1812 = [
    'fili-village',
    'intercession-church-fili',
    'kuntsevo-estate',
    'poklonnaya-hill',
    'dorogomilovskaya-gate',
    'dorogomilovskoe-cemetery',
  ]
  for (const locale of ['ru', 'en'] as const) {
    const places = getPlaces(locale)
    const all = getMapPlaces(places, 'all')
    const historical = getMapPlaces(places, '1812')
    const memory = getMapPlaces(places, 'memory')
    assert.equal(all.length, 13)
    assert.equal(historical.length, 6)
    assert.equal(memory.length, 7)
    assert.deepEqual(
      historical.map((place) => place.id),
      expected1812,
    )
    assert.deepEqual(
      [...historical, ...memory].map((place) => place.id).sort(),
      all.map((place) => place.id).sort(),
    )
    assert.equal(new Set(all.map((place) => place.id)).size, 13)
  }
})

test('every approved status has an editorial layer and coordinates retain parity', () => {
  for (const status of historicalStatuses) {
    assert.ok(statusLayer[status])
  }
  assert.deepEqual(
    getPlaces('ru').map((place) => [place.id, place.coordinates]),
    getPlaces('en').map((place) => [place.id, place.coordinates]),
  )
})

test('slug deep links resolve safely and Place detail URL is localized', () => {
  const places = getPlaces('ru')
  assert.equal(resolveMapPlace(places, 'kutuzov-hut')?.id, 'kutuzov-hut')
  assert.equal(resolveMapPlace(places, ['kutuzov-hut']), undefined)
  assert.equal(resolveMapPlace(places, '../kutuzov-hut'), undefined)
  assert.equal(resolveMapPlace(places, 'missing-place'), undefined)
  assert.equal(parseMapLayer('unknown'), 'all')
  assert.equal(parseMapLayer('memory'), 'memory')
  assert.equal(mapPlaceUrl('/map', 'kutuzov-hut'), '/map?place=kutuzov-hut')
  assert.equal(
    mapPlaceUrl('/en/map', 'kutuzov-hut'),
    '/en/map?place=kutuzov-hut',
  )
})

test('overlap groups are deterministic and never change coordinates', () => {
  const places = getPlaces('ru')
  const before = JSON.stringify(places.map((place) => place.coordinates))
  const first = groupOverlappingPlaces(places, 16)
  const second = groupOverlappingPlaces(places, 16)
  assert.deepEqual(first, second)
  const coincident = first.find((group) =>
    group.some((place) => place.id === 'kutuzov-hut'),
  )
  assert.ok(coincident?.some((place) => place.id === 'milepost-fili'))
  assert.equal(JSON.stringify(places.map((place) => place.coordinates)), before)
})

test('collapsed overlap groups preserve each enabled layer across repeated zooms', () => {
  for (const locale of ['ru', 'en'] as const) {
    const places = getPlaces(locale)
    const before = JSON.stringify(places)
    for (const layer of ['all', '1812', 'memory'] as const) {
      const enabled = getMapPlaces(places, layer)
      for (const zoom of [9, 11, 12, 13, 14, 15, 16, 18, 16, 13, 11, 9]) {
        const groups = groupOverlappingPlaces(enabled, zoom)
        const representatives = groups.flatMap((group) => {
          const markers = collapsedGroupRepresentatives(group)
          assert.deepEqual(markers, collapsedGroupRepresentatives(group))
          const expected = new Set(
            group.map((place) => statusLayer[place.historicalStatus]),
          )
          assert.deepEqual(
            new Set(markers.map((marker) => marker.layer)),
            expected,
          )
          assert.equal(markers.length, expected.size)
          if (markers.length === 2) {
            assert.deepEqual(
              markers.map((marker) => marker.offset),
              [
                { x: -28, y: 0 },
                { x: 28, y: 0 },
              ],
            )
          } else assert.deepEqual(markers[0]!.offset, { x: 0, y: 0 })
          return markers
        })
        assert.deepEqual(
          [...new Set(representatives.map((marker) => marker.layer))].sort(),
          layer === 'all' ? ['1812', 'memory'] : [layer],
        )
      }
    }
    assert.equal(JSON.stringify(places), before)
  }
})

test('mixed Fili group retains the other layer when either representative is selected', () => {
  const group = groupOverlappingPlaces(getPlaces('ru'), 13).find((items) =>
    items.some((place) => place.id === 'kutuzov-hut'),
  )!
  assert.ok(
    group.some((place) => statusLayer[place.historicalStatus] === '1812'),
  )
  for (const selected of group) {
    const markers = collapsedGroupRepresentatives(group, selected.slug)
    assert.deepEqual(
      markers.map((marker) => marker.layer),
      ['1812', 'memory'],
    )
    const own = markers.find(
      (marker) => marker.layer === statusLayer[selected.historicalStatus],
    )!
    assert.equal(own.place, selected)
    assert.ok(markers.every((marker) => group.includes(marker.place)))
  }
})

test('event contexts use approved multi-Place relations with localized URL parity', () => {
  const expected = {
    borodino: [
      'dorogomilovskoe-cemetery',
      'brotherhood-grave-obelisk',
      'borodino-panorama-museum',
      'kutuzov-monument',
    ],
    'council-fili': [
      'fili-village',
      'kutuzov-hut',
      'milepost-fili',
      'kutuzov-monument',
    ],
    'moscow-abandoned': [
      'fili-village',
      'intercession-church-fili',
      'poklonnaya-hill',
      'dorogomilovskaya-gate',
    ],
  }
  for (const locale of ['ru', 'en'] as const) {
    for (const [slug, ids] of Object.entries(expected)) {
      const context = resolveMapContext(locale, undefined, slug)
      assert.equal(context.event?.slug, slug)
      assert.equal(
        context.place,
        undefined,
        'No arbitrary initial Place selection',
      )
      assert.deepEqual(
        context.places.map((place) => place.id),
        ids,
      )
      assert.equal(context.places.length, 4)
      assert.ok(!context.places.some((place) => place.id === 'kuntsevo-estate'))
      assert.equal(
        mapEventUrl(locale === 'ru' ? '/map' : '/en/map', slug),
        `${locale === 'ru' ? '' : '/en'}/map?event=${slug}`,
      )
    }
    for (const event of getTimelineEvents(locale)) {
      const related = resolveRelatedContent(locale, 'timeline', event.id).places
      const context = resolveMapContext(locale, undefined, event.slug)
      assert.equal(!!context.event, related.length > 0)
      assert.deepEqual(
        context.places,
        related.length ? related : getPlaces(locale),
      )
    }
  }
})

test('valid Place takes precedence and malformed or empty event scopes fail gracefully', () => {
  for (const locale of ['ru', 'en'] as const) {
    const place = resolveMapContext(locale, 'kuntsevo-estate', 'council-fili')
    assert.equal(place.place?.slug, 'kuntsevo-estate')
    assert.equal(place.event, undefined)
    assert.equal(place.places.length, 13)
    assert.equal(
      resolveMapContext(locale, 'missing', 'council-fili').event?.slug,
      'council-fili',
    )
    for (const invalid of [
      undefined,
      null,
      '',
      ['council-fili'],
      '../council-fili',
      'unknown-event',
      'invasion-neman',
    ]) {
      const context = resolveMapContext(locale, undefined, invalid)
      assert.equal(context.event, undefined)
      assert.equal(context.place, undefined)
      assert.equal(context.places.length, 13)
    }
  }
})
