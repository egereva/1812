import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { detailSeoTitle } from '../shared/seo/config.ts'

// Run after generate. Assert actual SSR output, rather than media/config presence.
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  )
const text = (html) =>
  html
    .replace(/<!--[\s\S]*?-->|<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const section = (html, name, tag) => {
  const body = html.split(`class="${name}`)[1]
  assert.ok(body, `${name} must render`)
  return body.slice(body.indexOf('>') + 1).split(`</${tag}>`)[0]
}
const fullDate = (value, locale) =>
  new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`))

for (const locale of ['ru', 'en']) {
  const messages = readJson(`i18n/locales/${locale}.json`)
  const events = readJson(`content/${locale}/timeline.json`).sort(
    (a, b) => a.sortDate.localeCompare(b.sortDate) || a.id.localeCompare(b.id),
  )
  const sources = readJson(`content/${locale}/sources.json`)
  const places = readJson(`content/${locale}/places.json`)
  const prefix = locale === 'en' ? '/en' : ''
  assert.equal(events.length, 20)
  assert.equal(events[0].id, 'invasion-neman')
  assert.equal(events.at(-1).id, 'manifest-end-war')

  for (const [index, event] of events.entries()) {
    test(`${locale} generated Timeline detail: ${event.id}`, () => {
      const html = readFileSync(
        `.output/public${prefix}/timeline/${event.slug}/index.html`,
        'utf8',
      )
      const detail = html
        .split('<article class="timeline-detail ')[1]
        ?.split('</article>')[0]
      assert.ok(detail, 'The detail article must be SSR rendered')
      const hasPlaces = places.some(
        (place) =>
          event.relatedPlaceIds?.includes(place.id) ||
          place.relatedTimelineIds?.includes(event.id),
      )
      const mapLinks = [...detail.matchAll(/href="([^"]*\?event=[^"]*)"/g)]
      assert.deepEqual(
        mapLinks.map((match) => match[1]),
        hasPlaces ? [`${prefix}/map?event=${event.slug}`] : [],
        'Only events with direct or reverse Place relations render a localized contextual CTA',
      )
      const mapAnchors = [...detail.matchAll(/<a\b([^>]+)>/g)].filter((match) =>
        /\btimeline-detail__map-link\b/.test(match[1]),
      )
      assert.equal(mapAnchors.length, hasPlaces ? 1 : 0)
      for (const [, attributes] of mapAnchors) {
        assert.match(
          attributes,
          new RegExp(`href="${prefix}/map\\?event=${event.slug}"`),
        )
        const target = attributes.match(/\btarget="([^"]*)"/)?.[1]
        assert.ok(
          target === undefined || target === '_self',
          'The internal Timeline to Map CTA must stay in the current tab',
        )
        assert.doesNotMatch(attributes, /[?&](?:amp;)?place=/)
      }
      assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1)
      assert.ok(detail.includes(escape(event.title)))
      assert.ok(
        html.includes(
          `<title>${escape(detailSeoTitle(event.seo?.title ?? event.title, messages.navigation.timeline))}</title>`,
        ),
      )
      assert.ok(
        html.includes(
          `content="${escape(event.seo?.description ?? event.shortDescription)}"`,
        ),
      )
      const prose = section(detail, 'timeline-detail__prose', 'div')
      const paragraphs = [...prose.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(
        (match) => text(match[1]),
      )
      assert.deepEqual(
        paragraphs,
        event.content.map((paragraph) => escape(paragraph)),
      )
      assert.equal(paragraphs.length, 3)

      for (const [name, start, end] of [
        ['timeline-detail__date', event.dateOldStyle, event.dateEndOldStyle],
        [
          'timeline-detail__new-date',
          event.dateNewStyle,
          event.dateEndNewStyle,
        ],
      ]) {
        if (!start) continue
        const dates = section(detail, name, 'p')
        const times = [
          ...dates.matchAll(
            /<time[^>]+datetime="([^"]+)"[^>]*>([\s\S]*?)<\/time>/g,
          ),
        ]
        assert.deepEqual(
          times.map((match) => match[1]),
          [start, end].filter(Boolean),
        )
        assert.ok(
          dates.includes(`aria-label="${escape(fullDate(start, locale))}"`),
        )
        assert.equal(
          text(times.at(-1)[2]),
          escape(fullDate(end ?? start, locale)),
        )
        if (name === 'timeline-detail__new-date')
          assert.match(dates, /<span aria-hidden="true"[^>]*>·<\/span>/)
      }
      if (event.id === 'berezina') {
        assert.equal(
          text(section(detail, 'timeline-detail__date', 'p')),
          locale === 'ru' ? '14–16 ноября 1812 г.' : '14–16 November 1812',
        )
        assert.ok(
          text(section(detail, 'timeline-detail__new-date', 'p')).startsWith(
            locale === 'ru' ? '26–28 ноября 1812 г.' : '26–28 November 1812',
          ),
        )
      }

      if (event.image) {
        assert.match(detail, /<figure[^>]*timeline-detail__media/)
        assert.ok(detail.includes(`src="${escape(event.image.src)}"`))
        assert.ok(detail.includes(`alt="${escape(event.image.alt)}"`))
        const caption = detail
          .split('<figcaption')[1]
          ?.split('</figcaption>')[0]
        assert.ok(caption, 'Artwork must have a rendered caption')
        assert.ok(caption.includes(escape(event.image.caption)))
        if (event.image.description)
          assert.ok(caption.includes(escape(event.image.description)))
        const source = sources.find(
          (source) => source.id === event.image.sourceId,
        )
        if (source?.url)
          assert.ok(caption.includes(`href="${escape(source.url)}"`))
        readFileSync(`.output/public${event.image.src}`)
      } else {
        assert.doesNotMatch(
          detail,
          /timeline-detail__media|timeline-detail__article--illustrated|<figure|<img/,
        )
      }

      const historicalSources = section(
        detail,
        'timeline-detail__support timeline-detail__sources',
        'section',
      )
      for (const id of event.sourceIds) {
        const source = sources.find((source) => source.id === id)
        assert.ok(source)
        assert.ok(historicalSources.includes(escape(source.title)))
        if (source.url)
          assert.ok(historicalSources.includes(`href="${escape(source.url)}"`))
      }
      assert.doesNotMatch(historicalSources, /src-media-|src-bre-/)

      const nav = section(detail, 'timeline-detail__chronology', 'nav')
      const links = [...nav.matchAll(/<a\b([^>]+)>/g)].map((match) => ({
        href: match[1].match(/href="([^"]+)"/)?.[1],
        rel: match[1].match(/rel="([^"]+)"/)?.[1],
      }))
      assert.deepEqual(links, [
        ...(index > 0
          ? [
              {
                href: `${prefix}/timeline/${events[index - 1].slug}`,
                rel: 'prev',
              },
            ]
          : []),
        ...(index < events.length - 1
          ? [
              {
                href: `${prefix}/timeline/${events[index + 1].slug}`,
                rel: 'next',
              },
            ]
          : []),
      ])
      if (detail.includes('id="timeline-related-title"')) {
        const related = detail
          .split('id="timeline-related-title"')[1]
          .split('</section>')[0]
        for (const neighbor of [events[index - 1], events[index + 1]].filter(
          Boolean,
        ))
          assert.ok(
            !related.includes(`href="${prefix}/timeline/${neighbor.slug}"`),
            'Neighbors belong to chronological navigation',
          )
      }
      assert.ok(
        detail.includes(`href="${prefix}/timeline"`),
        'Back link must preserve locale',
      )
    })
  }
}
