import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getMapPlaces,
  groupOverlappingPlaces,
  mapPlaceUrl,
  markerShape,
  parseMapLayer,
  resolveMapPlace,
  statusLayer,
} from '../app/data/mapPresentation.ts'
import { getPlaces } from '../shared/content/index.ts'
import { historicalStatuses } from '../shared/types/content.ts'

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

test('every approved status has a layer and marker presentation', () => {
  for (const status of historicalStatuses) {
    assert.ok(statusLayer[status])
    assert.ok(markerShape[status])
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
