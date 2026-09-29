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
  test(`${locale} generated Homepage starts with rendered Neman artwork and six strip images`, () => {
    const html = readFileSync(
      `.output/public/${locale === 'en' ? 'en/' : ''}index.html`,
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
