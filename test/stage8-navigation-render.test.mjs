import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import {
  getCatalog,
  getSiteContent,
  resolveRelatedContent,
} from '../shared/content/index.ts'

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ],
  )
const decode = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
const hrefs = (html = '') =>
  [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map((match) =>
    decode(match[1]),
  )
const section = (html, heading) =>
  html.match(
    new RegExp(
      `<section\\b[^>]*aria-labelledby="${heading}"[^>]*>([\\s\\S]*?)</section>`,
    ),
  )?.[1]
const readPage = (route) =>
  readFileSync(`.output/public${route.replace(/\/$/, '')}/index.html`, 'utf8')
const routeFile = (href) => {
  const url = new URL(href, 'https://local.example')
  return `.output/public${decodeURIComponent(url.pathname).replace(/\/$/, '')}/index.html`
}
const coverage = {}

for (const locale of ['ru', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  const catalog = getCatalog(locale)
  const labels = JSON.parse(readFileSync(`i18n/locales/${locale}.json`, 'utf8'))
  const expectedRelations = (kind, record, target) => {
    const collection = catalog[target]
    const reverse = {
      dictionary: 'relatedDictionaryIds',
      timeline: 'relatedTimelineIds',
      place: 'relatedPlaceIds',
    }[kind]
    const direct = {
      places: 'relatedPlaceIds',
      timeline: 'relatedTimelineIds',
      dictionary: 'relatedDictionaryIds',
    }[target]
    const expected = collection.filter(
      (item) =>
        record[direct]?.includes(item.id) || item[reverse]?.includes(record.id),
    )
    assert.deepEqual(
      resolveRelatedContent(locale, kind, record.id)[target].map(
        (item) => item.id,
      ),
      expected.map((item) => item.id),
    )
    return expected
  }
  const tally = (key, expected) => {
    coverage[locale] ??= {}
    coverage[locale][key] ??= { entities: 0, links: 0 }
    if (expected.length) coverage[locale][key].entities++
    coverage[locale][key].links += expected.length
  }
  const verifyGroup = (block, expected, path, key) => {
    const actual = hrefs(block).filter((href) =>
      href.startsWith(`${prefix}/${path}/`),
    )
    assert.deepEqual(
      actual,
      expected.map((item) => `${prefix}/${path}/${item.slug}`),
    )
    assert.equal(new Set(actual).size, actual.length)
    for (const item of expected) assert.ok(block.includes(escape(item.title)))
    tally(key, expected)
  }
  const verifyInternal = (html) => {
    for (const href of hrefs(html)) {
      if (href.startsWith('#')) {
        assert.ok(
          html.includes(`id="${href.slice(1)}"`),
          `Missing fragment ${href}`,
        )
      } else if (href.startsWith('/') && !href.startsWith('//')) {
        assert.ok(existsSync(routeFile(href)), `Missing destination ${href}`)
        const url = new URL(href, 'https://local.example')
        if (url.hash)
          assert.ok(
            readPage(url.pathname).includes(`id="${url.hash.slice(1)}"`),
          )
      }
    }
  }

  for (const entry of catalog.dictionary) {
    test(`${locale} Dictionary graph: ${entry.id}`, () => {
      const html = readPage(`${prefix}/dictionary/${entry.slug}`)
      for (const [target, heading] of [
        ['places', 'dictionary-places-title'],
        ['timeline', 'dictionary-timeline-title'],
      ]) {
        const expected = expectedRelations('dictionary', entry, target)
        const block = section(html, heading)
        assert.equal(!!block, !!expected.length, `Conditional group ${target}`)
        verifyGroup(block, expected, target, `Dictionary → ${target}`)
        if (block) assert.doesNotMatch(block, /target="_blank"/)
      }
      verifyInternal(html)
    })
  }
  for (const event of catalog.timeline) {
    test(`${locale} Timeline graph: ${event.id}`, () => {
      const html = readPage(`${prefix}/timeline/${event.slug}`)
      const block = section(html, 'timeline-related-title')
      const places = expectedRelations('timeline', event, 'places')
      const dictionary = expectedRelations('timeline', event, 'dictionary')
      assert.equal(
        !!block,
        !!(
          places.length ||
          dictionary.length ||
          resolveRelatedContent(locale, 'timeline', event.id).timeline.length
        ),
      )
      verifyGroup(block, places, 'places', 'Timeline → places')
      verifyGroup(block, dictionary, 'dictionary', 'Timeline → dictionary')
      const maps = hrefs(block).filter((href) =>
        href.startsWith(`${prefix}/map`),
      )
      assert.deepEqual(
        maps,
        places.length ? [`${prefix}/map?event=${event.slug}`] : [],
      )
      tally('Timeline → Map event', maps)
      verifyInternal(html)
    })
  }
  for (const place of catalog.places) {
    test(`${locale} Place graph: ${place.id}`, () => {
      const html = readPage(`${prefix}/places/${place.slug}`)
      const block = section(html, 'place-related-title')
      for (const target of ['timeline', 'dictionary']) {
        const expected = expectedRelations('place', place, target)
        const group = block
          ?.split(`data-relation="${target}"`)[1]
          ?.split('</div>')[0]
        assert.equal(!!group, !!expected.length)
        verifyGroup(group, expected, target, `Places → ${target}`)
      }
      const maps = hrefs(html).filter((href) =>
        href.startsWith(`${prefix}/map?place=`),
      )
      assert.deepEqual(maps, [`${prefix}/map?place=${place.slug}`])
      tally('Places → Map', maps)
      verifyInternal(html)
    })
  }
  test(`${locale} index navigation reaches every detail page`, () => {
    for (const [route, items] of [
      ['dictionary', catalog.dictionary],
      ['timeline', catalog.timeline],
      ['map', catalog.places],
    ]) {
      const path = route === 'map' ? 'places' : route
      const html = readPage(`${prefix}/${route}`)
      const links = hrefs(html)
      for (const item of items)
        assert.ok(
          links.includes(`${prefix}/${path}/${item.slug}`),
          `Orphan ${item.id}`,
        )
      verifyInternal(html)
    }
  })
  test(`${locale} accepted About content and SEO survive generation`, () => {
    const about = getSiteContent(locale).about
    const html = readPage(`${prefix}/about`)
    assert.ok(html.includes(`<title>${escape(about.title)} — 1812</title>`))
    assert.ok(html.includes(`content="${escape(about.description)}"`))
    assert.ok(html.includes(`lang="${locale}"`))
    assert.ok(html.includes(escape(about.lead)))
    for (const item of about.sections) {
      assert.ok(html.includes(`id="about-${item.id}"`))
      assert.ok(html.includes(escape(item.title)))
      for (const paragraph of item.paragraphs)
        assert.ok(html.includes(escape(paragraph)))
    }
    for (const link of about.links)
      assert.ok(hrefs(html).includes(prefix + link.route))
    verifyInternal(html)
  })
  test(`${locale} accepted Sources grouping, metadata, links and SEO survive generation`, () => {
    const html = readPage(`${prefix}/sources`)
    assert.ok(
      html.includes(
        `<title>${escape(labels.navigation.sources)} — 1812</title>`,
      ),
    )
    assert.ok(html.includes(`content="${escape(labels.sources.description)}"`))
    assert.ok(html.includes(`lang="${locale}"`))
    for (const [id, media, count] of [
      ['research', false, 26],
      ['media', true, 42],
    ]) {
      const block = section(html, `${id}-title`)
      assert.ok(block)
      const expected = catalog.sources.filter(
        (record) => (record.type === 'media') === media,
      )
      assert.equal(expected.length, count)
      assert.deepEqual(
        [...block.matchAll(/<li\b[^>]*id="([^"]+)"/g)].map((match) => match[1]),
        expected.map((record) => record.id),
      )
      for (const record of expected) {
        assert.ok(block.includes(escape(record.title)))
        const anchor = [...block.matchAll(/<a\b([^>]*)>/g)].find((match) =>
          match[1].includes(`href="${escape(record.url)}"`),
        )
        assert.ok(anchor)
        assert.match(anchor[1], /target="_blank"/)
        assert.match(anchor[1], /rel="noopener noreferrer"/)
        for (const value of [
          record.author,
          record.publisher,
          record.year,
          record.accessedAt,
        ].filter((value) => value !== undefined))
          assert.ok(block.includes(escape(value)))
      }
    }
    assert.ok(
      hrefs(html).includes('#research') && hrefs(html).includes('#media'),
    )
    verifyInternal(html)
  })
}

test('complete rendered navigation coverage has RU/EN parity', () => {
  assert.deepEqual(coverage.ru, coverage.en)
  console.log('Navigation coverage per locale:', JSON.stringify(coverage.ru))
})
