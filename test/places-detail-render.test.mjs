import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import test from 'node:test'
import { detailSeoTitle } from '../shared/seo/config.ts'
import { compileScript, parse } from '@vue/compiler-sfc'
import { computed, createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import ts from 'typescript'
import {
  getPlaces,
  getSourceById,
  resolveRelatedContent,
} from '../shared/content/index.ts'
import { normalizeMediaCaption } from '../app/utils/mediaCaption.ts'
import { externalLinkAttributes } from '../app/utils/linkAttributes.ts'

// Render actual page/media/link SFCs first; opt into fresh generated HTML after generate.
async function component(path) {
  const { descriptor } = parse(readFileSync(path, 'utf8'))
  const script = compileScript(descriptor, {
    id: path,
    inlineTemplate: true,
  }).content.replace(
    /(['"])(#shared\/[^'"]+|~\/[^'"]+)\1/g,
    (_, quote, alias) =>
      JSON.stringify(
        pathToFileURL(
          `${process.cwd()}/${alias.replace('#shared/', 'shared/').replace('~/', 'app/')}.ts`,
        ).href,
      ),
  )
  const code = ts
    .transpileModule(script, {
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
      },
    })
    .outputText.replace(
      /from ['"]vue['"]/g,
      `from ${JSON.stringify(import.meta.resolve('vue'))}`,
    )
  return (
    await import(
      `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
    )
  ).default
}
const page = await component('app/pages/places/[slug].vue')
const media = await component('app/components/PlaceMedia.vue')
const comparison = await component('app/components/PlaceImageComparison.vue')
const websiteLink = await component('app/components/WebsiteLink.vue')
const link = defineComponent({
  props: ['to'],
  setup:
    (props, { slots }) =>
    () =>
      h('a', { href: props.to }, slots.default?.()),
})
// The shared viewer is exercised in browser QA and generated output; no viewer fork here.
const museumImage = defineComponent({
  props: ['image'],
  setup: (props) => () =>
    h('button', { 'aria-haspopup': 'dialog' }, [
      h('img', { src: props.image.src, alt: props.image.alt }),
    ]),
})
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ],
  )
const plain = (html) =>
  html
    .replace(/<!--[\s\S]*?-->|<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const block = (html, name, tag = 'section') =>
  html.split(`class="${name}`)[1]?.split(`</${tag}>`)[0]

for (const locale of ['ru', 'en']) {
  const places = getPlaces(locale)
  const messages = JSON.parse(
    readFileSync(`i18n/locales/${locale}.json`, 'utf8'),
  )
  const prefix = locale === 'en' ? '/en' : ''
  assert.equal(places.length, 13)
  assert.equal(
    places.reduce((total, place) => total + place.content.length, 0),
    48,
  )
  assert.equal(places.filter((place) => place.coverImage).length, 12)
  assert.equal(
    places.reduce((total, place) => total + (place.gallery?.length ?? 0), 0),
    2,
  )
  for (const place of places) {
    test(`${locale} Place detail: ${place.slug}`, async () => {
      let title, description
      Object.assign(globalThis, {
        computed,
        ref,
        useTemplateRef: () => ref(null),
        useId: () => 'comparison-instructions',
        watch: () => {},
        onBeforeUnmount: () => {},
        useRuntimeConfig: () => ({ app: { baseURL: '/' } }),
        useRoute: () => ({ params: { slug: place.slug } }),
        useI18n: () => ({
          locale: ref(locale),
          t: (key, parameters = {}) => {
            let text = key
              .split('.')
              .reduce((value, part) => value[part], messages)
            for (const [name, value] of Object.entries(parameters))
              text = text.replaceAll(`{${name}}`, String(value))
            return text
          },
        }),
        useLocalePath: () => (path) => prefix + path,
        useRequestURL: () => new URL('https://1812.example'),
        useHead: (value) => {
          title = value().title
        },
        useSeoMeta: (value) => {
          description = value.description()
        },
        usePageSeo: (getTitle, getDescription, section) => {
          title = detailSeoTitle(getTitle(), section?.())
          description = getDescription()
        },
        createError: (value) => new Error(value.statusMessage),
      })
      const app = createSSRApp(page)
      app.component('NuxtLink', link)
      app.component('PlaceMedia', media)
      app.component('PlaceImageComparison', comparison)
      app.component('MuseumImage', museumImage)
      app.component('WebsiteLink', websiteLink)
      const rendered = await renderToString(app)
      const html =
        process.env.PLACE_DETAIL_GENERATED === '1'
          ? readFileSync(
              `.output/public${prefix}/places/${place.slug}/index.html`,
              'utf8',
            )
          : rendered
      const detail = html
        .split('<article class="place-detail ')[1]
        ?.split('</article>')[0]
      assert.ok(detail, 'Place article is rendered on the server')
      assert.equal((detail.match(/<h1[\s>]/g) ?? []).length, 1)
      assert.ok(detail.includes(escape(place.title)))
      assert.equal(
        title,
        detailSeoTitle(
          place.seo?.title ?? place.title,
          messages.place.detail.places,
        ),
      )
      assert.equal(
        description,
        place.seo?.description ?? place.shortDescription,
      )
      if (process.env.PLACE_DETAIL_GENERATED === '1') {
        assert.ok(html.includes(`<title>${escape(title)}</title>`))
        assert.ok(html.includes(`content="${escape(description)}"`))
      }
      const prose = block(detail, 'place-detail__prose', 'div')
      assert.ok(prose)
      assert.deepEqual(
        [...prose.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((match) =>
          plain(match[1]),
        ),
        place.content.map((paragraph) => plain(escape(paragraph))),
      )
      const metadata = block(detail, 'place-detail__metadata', 'ul')
      assert.ok(
        metadata.includes(escape(messages.map.status[place.historicalStatus])),
      )
      assert.ok(
        metadata.includes(
          escape(messages.map.precision[place.locationPrecision]),
        ),
      )
      if (place.address) assert.ok(metadata.includes(escape(place.address)))
      for (const note of [place.locationNote, place.historicalNote].filter(
        Boolean,
      ))
        assert.ok(detail.includes(escape(note)))
      assert.equal(
        detail.includes('place-detail__clarification'),
        !!place.historicalNote,
      )
      assert.ok(detail.includes(`href="${prefix}/map?place=${place.slug}"`))

      const assets = [place.coverImage, ...(place.gallery ?? [])].filter(
        Boolean,
      )
      assert.deepEqual(
        [...detail.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(
          (match) => match[1],
        ),
        [
          ...assets.map((asset) => asset.src),
          ...(place.beforeAfter ?? []).flatMap((pair) => [
            pair.after.src,
            pair.before.src,
          ]),
        ],
      )
      assert.equal(
        (detail.match(/<figure\b/g) ?? []).length,
        assets.length + (place.beforeAfter?.length ?? 0),
      )
      const captions = [
        ...detail.matchAll(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/g),
      ].map((match) => match[1])
      for (const [index, asset] of assets.entries()) {
        assert.ok(detail.includes(`alt="${escape(asset.alt)}"`))
        for (const text of [asset.caption, asset.description].filter(Boolean))
          assert.ok(captions[index].includes(escape(text)))
        const source = asset.sourceId
          ? getSourceById(locale, asset.sourceId)
          : undefined
        const caption = normalizeMediaCaption(
          asset,
          source,
          asset.sourceId
            ? getSourceById(locale === 'ru' ? 'en' : 'ru', asset.sourceId)
            : undefined,
        )
        if (caption.attribution)
          assert.ok(captions[index].includes(escape(caption.attribution)))
        if (source?.url)
          assert.ok(captions[index].includes(`href="${escape(source.url)}"`))
      }
      if (!assets.length)
        assert.doesNotMatch(
          detail,
          /<figure|<img|place-detail__cover|place-detail__gallery/,
        )
      const related = resolveRelatedContent(locale, 'place', place.id)
      const relations =
        block(detail, 'place-detail__relations', 'section') ?? ''
      for (const key of ['timeline', 'dictionary', 'places']) {
        const group = relations
          .split(`data-relation="${key}"`)[1]
          ?.split('</div>')[0]
        if (!related[key].length) assert.equal(group, undefined)
        else {
          assert.ok(group)
          assert.deepEqual(
            [...group.matchAll(/href="([^"]+)"/g)].map((match) => match[1]),
            related[key].map((item) => `${prefix}/${key}/${item.slug}`),
          )
          for (const item of related[key])
            assert.ok(group.includes(escape(item.title)))
          if (key === 'timeline')
            for (const event of related.timeline)
              assert.ok(group.includes(`datetime="${event.dateOldStyle}"`))
        }
      }
      const sources =
        block(detail, 'place-detail__support place-detail__sources') ?? ''
      assert.deepEqual(
        [...sources.matchAll(/data-source-id="([^"]+)"/g)].map(
          (match) => match[1],
        ),
        related.sources.map((source) => source.id),
      )
      for (const source of related.sources) {
        assert.ok(sources.includes(escape(source.title)))
        if (source.url)
          assert.ok(sources.includes(`href="${escape(source.url)}"`))
        const metadata = [source.author, source.publisher, source.year]
          .filter(Boolean)
          .join(' · ')
        if (metadata) assert.ok(sources.includes(escape(metadata)))
      }
      for (const [, attributes] of detail.matchAll(/<a\b([^>]+)>/g)) {
        const href = attributes
          .match(/href="([^"]+)"/)?.[1]
          ?.replaceAll('&amp;', '&')
        if (!href) continue
        const expected = externalLinkAttributes(href, 'https://1812.example')
        if (expected.target) {
          assert.match(attributes, /target="_blank"/)
          assert.match(attributes, /rel="noopener noreferrer"/)
        } else assert.doesNotMatch(attributes, /target="_blank"/)
      }
      const comparisonSection = block(detail, 'place-detail__comparison')
      assert.equal(!!comparisonSection, !!place.beforeAfter?.length)
      for (const pair of place.beforeAfter ?? []) {
        assert.ok(
          comparisonSection.includes(escape(messages.place.comparison.title)),
        )
        assert.ok(comparisonSection.includes(escape(pair.beforeDate)))
        assert.ok(comparisonSection.includes(escape(pair.afterDate)))
        assert.ok(comparisonSection.includes(escape(pair.caption)))
        assert.match(
          comparisonSection,
          /role="slider"[^>]*aria-valuemin="0"[^>]*aria-valuemax="100"[^>]*aria-valuenow="50"/,
        )
        for (const image of [pair.before, pair.after]) {
          assert.ok(comparisonSection.includes(`alt="${escape(image.alt)}"`))
          const source = getSourceById(locale, image.sourceId)
          if (source?.url)
            assert.ok(
              comparisonSection.includes(`href="${escape(source.url)}"`),
            )
          else if (source)
            assert.ok(
              comparisonSection.includes(
                escape(source.publisher || source.title),
              ),
            )
          const credit = normalizeMediaCaption(
            { ...image, caption: undefined, description: undefined },
            source,
          )
          assert.ok(comparisonSection.includes(escape(credit.attribution)))
        }
        assert.ok(
          detail.indexOf('place-detail__narrative') <
            detail.indexOf('place-detail__comparison'),
        )
        assert.ok(
          detail.indexOf('place-detail__comparison') <
            detail.indexOf('place-detail__related-section'),
        )
      }
      assert.doesNotMatch(
        detail,
        /rel="(?:prev|next)"|timeComparison|api-maps\.yandex/,
      )
    })
  }
}
