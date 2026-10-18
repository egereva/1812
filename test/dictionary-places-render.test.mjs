import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  getDictionaryEntries,
  getPlaces,
  getSourceById,
  resolveRelatedContent,
} from '../shared/content/index.ts'
import { imageDeliveryCatalog } from '../app/utils/imageDelivery.ts'

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ],
  )
for (const locale of ['ru', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  const entries = getDictionaryEntries(locale)
  const places = getPlaces(locale)
  const resolved = entries.map(
    (entry) => resolveRelatedContent(locale, 'dictionary', entry.id).places,
  )
  assert.equal(resolved.filter((group) => group.length).length, 19)
  assert.equal(resolved.filter((group) => !group.length).length, 12)
  assert.equal(Math.max(...resolved.map((group) => group.length)), 6)
  for (const entry of entries) {
    test(`${locale} generated Dictionary related Places: ${entry.id}`, () => {
      const html = readFileSync(
        `.output/public${prefix}/dictionary/${entry.slug}/index.html`,
        'utf8',
      )
      const detail = html
        .split('<article class="dictionary-detail ')[1]
        ?.split('</article>')[0]
      assert.ok(detail)
      const expected = places.filter(
        (place) =>
          entry.relatedPlaceIds?.includes(place.id) ||
          place.relatedDictionaryIds?.includes(entry.id),
      )
      assert.deepEqual(
        resolveRelatedContent(locale, 'dictionary', entry.id).places.map(
          (place) => place.id,
        ),
        expected.map((place) => place.id),
      )
      assert.deepEqual(
        resolveRelatedContent(
          locale === 'ru' ? 'en' : 'ru',
          'dictionary',
          entry.id,
        ).places.map((place) => place.id),
        expected.map((place) => place.id),
      )
      const block = detail
        .split('class="dictionary-detail__places"')[1]
        ?.split('</section>')[0]
      if (!expected.length) assert.equal(block, undefined)
      else {
        assert.ok(block)
        assert.match(block, /aria-labelledby="dictionary-places-title"/)
        assert.ok(
          block.includes(
            locale === 'ru' ? 'Связанные места' : 'Related places',
          ),
        )
        assert.deepEqual(
          [...block.matchAll(/href="([^"]+)"/g)].map((match) => match[1]),
          expected.map((place) => `${prefix}/places/${place.slug}`),
        )
        for (const place of expected)
          assert.ok(block.includes(escape(place.title)))
        assert.doesNotMatch(block, /target="_blank"|<img|<svg/)
        assert.ok(
          detail.indexOf('dictionary-detail__places') >
            detail.indexOf('dictionary-detail__body'),
        )
        if (detail.includes('dictionary-detail__sources'))
          assert.ok(
            detail.indexOf('dictionary-detail__places') <
              detail.indexOf('dictionary-detail__sources'),
          )
      }
      for (const paragraph of entry.content)
        assert.ok(detail.includes(escape(paragraph)))
      assert.doesNotMatch(detail, /href="[^"]*\/map(?:[?"])/)
      assert.doesNotMatch(
        html,
        /<script[^>]*src="[^"]*(?:api-maps\.yandex|maps-api\.yandex)/,
      )
    })
    if (['dokhturov', 'ermolov'].includes(entry.id)) {
      test(`${locale} generated Dictionary image and attribution: ${entry.id}`, () => {
        const html = readFileSync(
          `.output/public${prefix}/dictionary/${entry.slug}/index.html`,
          'utf8',
        )
        const figure = html.match(/<figure\b[^>]*>([\s\S]*?)<\/figure>/)?.[1]
        assert.ok(figure)
        const image = figure.match(/<img\b[^>]*>/)?.[0]
        assert.ok(image)
        const delivery = imageDeliveryCatalog[entry.image.src]
        assert.ok(delivery)
        assert.ok(image.includes(`src="${entry.image.src}"`))
        assert.ok(image.includes(`width="${delivery.width}"`))
        assert.ok(image.includes(`height="${delivery.height}"`))
        assert.ok(image.includes(`alt="${escape(entry.image.alt)}"`))
        assert.ok(figure.includes(escape(entry.image.caption)))
        const source = getSourceById(locale, entry.image.sourceId)
        assert.equal(source?.type, 'media')
        const anchors = [...figure.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
        assert.equal(anchors.length, 1)
        assert.ok(anchors[0][1].includes(`href="${escape(source.url)}"`))
        assert.match(anchors[0][1], /target="_blank"/)
        assert.match(anchors[0][1], /rel="noopener noreferrer"/)
        assert.equal(
          anchors[0][2].replace(/<!--[\s\S]*?-->/g, ''),
          escape(source.publisher),
        )
        assert.ok(
          !figure.replace(/<[^>]*>/g, '').includes(source.url),
          'Source URL is a link rather than raw caption text',
        )
      })
    }
  }
  test(`${locale} generated Map no-JS index keeps all 13 localized routes`, () => {
    const html = readFileSync(`.output/public${prefix}/map/index.html`, 'utf8')
    const index = html
      .split('class="map-page__index ')[1]
      ?.split('</section>')[0]
    assert.ok(index)
    assert.match(index, /<details open/)
    assert.deepEqual(
      [...index.matchAll(/href="([^"]+)"/g)].map((match) => match[1]),
      places.map((place) => `${prefix}/places/${place.slug}`),
    )
    assert.doesNotMatch(index, /target="_blank"/)
  })
}
