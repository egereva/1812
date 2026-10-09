import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

// Run after generate: inspect the actual SSR markup consumed by hydration,
// independently of the config/resolver assertions in the content tests.
const expected = [
  ['invasion-neman', '/images/timeline/crossing-neman-clark-1816.jpg'],
  ['borodino', '/images/timeline/borodino-hess-1843.jpg'],
  ['council-fili', '/images/timeline/fili-council-kivshenko-1882.jpg'],
  [
    'napoleon-leaves-moscow',
    '/images/timeline/retreat-moscow-suchodolski-1853.jpg',
  ],
  ['maloyaroslavets', '/images/dictionary/maloyaroslavets-samokish.jpg'],
  ['berezina', '/images/dictionary/berezina-hess.jpg'],
]

for (const locale of ['ru', 'en']) {
  test(`${locale} historical introduction is server rendered between Hero and existing sections`, () => {
    const site = JSON.parse(readFileSync(`content/${locale}/site.json`, 'utf8'))
    const html = readFileSync(
      `.output/public/${locale === 'en' ? 'en/' : ''}index.html`,
      'utf8',
    )
    const introduction = html
      .split('class="home-introduction page-container"')[1]
      ?.split('</section>')[0]
    assert.ok(introduction)
    const escape = (text) =>
      text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
    for (const text of [
      site.homeIntroduction.eyebrow,
      site.homeIntroduction.title,
      ...site.homeIntroduction.paragraphs,
    ])
      assert.ok(introduction.includes(escape(text)))
    assert.equal((introduction.match(/<h2\b/g) ?? []).length, 1)
    assert.equal((introduction.match(/<p\b/g) ?? []).length, 4)
    assert.ok(
      html.indexOf('home-hero__copy') < html.indexOf('home-introduction'),
    )
    assert.ok(
      html.indexOf('home-introduction') < html.indexOf('home-dictionary'),
    )
    assert.doesNotMatch(introduction, /<img\b|<button\b|<a\b/)
  })
  test(`${locale} Homepage Map invitation keeps localized navigation and a reserved real-map fallback`, () => {
    const html = readFileSync(
      `${process.env.HOMEPAGE_HTML_ROOT ?? '.output/public'}/${locale === 'en' ? 'en/' : ''}index.html`,
      'utf8',
    )
    const catalog = JSON.parse(
      readFileSync(`content/${locale}/places.json`, 'utf8'),
    )
    const messages = JSON.parse(
      readFileSync(`i18n/locales/${locale}.json`, 'utf8'),
    )
    const section = html
      .split('<section class="home-map ')[1]
      ?.split('</section>')[0]
    assert.ok(section, 'Map invitation must render without JavaScript')
    assert.equal(catalog.length, 13)
    assert.ok(
      section.includes(
        messages.home.map.description.replace(
          '{count}',
          String(catalog.length),
        ),
      ),
    )
    assert.ok(section.includes(messages.map.kicker))
    assert.doesNotMatch(
      section,
      /home-map__count|home-map__examples|Например|For example/,
    )
    assert.ok(
      section.includes(
        messages.home.map.summary
          .replace('{total}', '13')
          .replace('{history}', '6')
          .replace('{memory}', '7'),
      ),
    )
    assert.match(section, /class="home-map-preview"/)
    assert.ok(section.includes(messages.home.map.fallback))
    assert.doesNotMatch(
      section,
      /home-map__diagram|home-map__guide|home-map__grid|home-map-separation|<circle/,
    )
    const examples = section
      .split('class="home-map__places"')[1]
      ?.split('</ul>')[0]
    assert.equal((examples?.match(/<li[\s>]/g) ?? []).length, 3)
    let position = -1
    for (const id of [
      'fili-village',
      'kutuzov-hut',
      'intercession-church-fili',
    ]) {
      const place = catalog.find((place) => place.id === id)
      const title = place?.title
      assert.ok(title)
      const nextPosition = examples.indexOf(title)
      assert.ok(
        nextPosition > position,
        `${id} retains its catalog title and order`,
      )
      position = nextPosition
      assert.ok(
        examples.includes(
          `href="${locale === 'en' ? '/en' : ''}/places/${place.slug}"`,
        ),
      )
    }
    const anchors = section.match(/<a\b[^>]*>/g) ?? []
    assert.equal(anchors.length, 5)
    assert.ok(anchors[0].includes(`href="${locale === 'en' ? '/en' : ''}/map"`))
    assert.ok(anchors[1].includes(`href="${locale === 'en' ? '/en' : ''}/map"`))
    assert.ok(
      anchors[1].includes(`aria-label="${messages.home.map.previewLink}"`),
    )
    for (const anchor of anchors) assert.doesNotMatch(anchor, /target=/)
    assert.doesNotMatch(
      section,
      /map-member-chooser|map-place-card|map-layer|[?](?:place|event)=/,
    )
    assert.doesNotMatch(
      html,
      /<script[^>]+src="[^"]*(?:api-maps\.yandex|maps\.yandex)/,
    )
  })
  test(`${locale} generated Homepage starts with rendered Neman artwork and six strip images`, () => {
    const html = readFileSync(
      `${process.env.HOMEPAGE_HTML_ROOT ?? '.output/public'}/${locale === 'en' ? 'en/' : ''}index.html`,
      'utf8',
    )
    const active = html.split('id="home-timeline-active"')[1]?.split('<ol')[0]
    assert.ok(active, 'Active event SSR markup must exist')
    assert.match(active, /data-active-id="invasion-neman"/)
    assert.doesNotMatch(active, /home-timeline__composition--text/)
    assert.match(active, /class="home-timeline__art"/)
    assert.match(
      active,
      /<img[^>]+src="\/images\/timeline\/crossing-neman-clark-1816\.jpg"/,
    )
    assert.match(active, /<figcaption[\s>]/)
    assert.match(active, /1816/)
    assert.match(active, /Crossing_the_Neman_in_Russia_1812_by_Clark/)
    const strip = html
      .split('class="home-timeline__strip"')[1]
      ?.split('</ol>')[0]
    assert.ok(strip, 'Strip SSR markup must exist')
    assert.equal((strip.match(/<img\s/g) ?? []).length, 6)
    for (const [id, src] of expected) {
      const item = strip.split(`data-event-id="${id}"`)[1]?.split('</li>')[0]
      assert.ok(item?.includes(`src="${src}"`), `${id} must render its artwork`)
      assert.match(item, /<img[^>]+alt="[^"]+"/)
      readFileSync(`.output/public${src}`)
    }
  })
}
