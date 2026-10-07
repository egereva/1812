import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import test from 'node:test'
import { compileScript, parse } from '@vue/compiler-sfc'
import {
  createSSRApp,
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  watch,
} from 'vue'
import { renderToString } from '@vue/server-renderer'
import ts from 'typescript'
import {
  getPlaces,
  resolveTimelinePlaceContext,
} from '../shared/content/index.ts'

// Render the actual page with a controlled API state. This does not claim live Yandex acceptance.
const source = readFileSync('app/pages/map.vue', 'utf8')
const { descriptor } = parse(source)
const script = compileScript(descriptor, {
  id: 'map-index-test',
  inlineTemplate: true,
})
  .content.replace(
    /import MapPlaceCard from '[^']+'/g,
    'const MapPlaceCard = {}',
  )
  .replaceAll(
    "'#shared/content/index'",
    JSON.stringify(
      pathToFileURL(`${process.cwd()}/shared/content/index.ts`).href,
    ),
  )
  .replaceAll(
    "'~/data/mapContext'",
    JSON.stringify(
      pathToFileURL(`${process.cwd()}/app/data/mapContext.ts`).href,
    ),
  )
  .replaceAll(
    "'~/data/mapPresentation'",
    JSON.stringify(
      pathToFileURL(`${process.cwd()}/app/data/mapPresentation.ts`).href,
    ),
  )
const compiled = ts
  .transpileModule(script, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
  })
  .outputText.replace(
    /from ['"]vue['"]?/g,
    `from ${JSON.stringify(import.meta.resolve('vue'))}`,
  )
const page = (
  await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
  )
).default
const link = defineComponent({
  props: ['to'],
  setup:
    (props, { slots }) =>
    () =>
      h('a', { href: props.to }, slots.default?.()),
})
const empty = defineComponent({ setup: () => () => null })
const section = (html, className, tag = 'section') =>
  html.split(`class="${className}`)[1]?.split(`</${tag}>`)[0]

async function render(locale, state, query = {}) {
  const messages = JSON.parse(
    readFileSync(`i18n/locales/${locale}.json`, 'utf8'),
  )
  Object.assign(globalThis, {
    computed,
    watch,
    nextTick,
    ref: (value) => ref(value === 'loading' ? state : value),
    useRoute: () => ({ path: locale === 'en' ? '/en/map' : '/map', query }),
    useRouter: () => ({ push() {} }),
    useI18n: () => ({
      locale: ref(locale),
      t: (key, params = {}) =>
        Object.entries(params).reduce(
          (text, [name, value]) => text.replace(`{${name}}`, value),
          key.split('.').reduce((value, part) => value[part], messages),
        ),
    }),
    useLocalePath: () => (path) => `${locale === 'en' ? '/en' : ''}${path}`,
    useRuntimeConfig: () => ({ public: {} }),
    useHead() {},
    useSeoMeta() {},
  })
  const app = createSSRApp(page)
  app.component('NuxtLink', link)
  app.component('ClientOnly', empty)
  app.component('InteractiveMap', empty)
  return renderToString(app)
}

for (const locale of ['ru', 'en']) {
  for (const [layer, count] of [
    ['all', 13],
    ['1812', 6],
    ['memory', 7],
  ]) {
    test(`${locale} actual Map ready index: ${layer}`, async () => {
      const html = await render(locale, 'ready', { layer })
      const index = section(html, 'map-page__index')
      const hrefs = [...index.matchAll(/href="([^"]*)"/g)].map(
        (match) => match[1],
      )
      const expected = getPlaces(locale).filter(
        (place) =>
          layer === 'all' ||
          (['event-site', 'surviving-witness', 'lost-site'].includes(
            place.historicalStatus,
          )
            ? '1812'
            : 'memory') === layer,
      )
      assert.equal(hrefs.length, count)
      assert.deepEqual(
        hrefs,
        expected.map(
          (place) => `${locale === 'en' ? '/en' : ''}/places/${place.slug}`,
        ),
      )
      assert.doesNotMatch(index, /target="_blank"|<details open/)
      const legend = section(html, 'map-page__legend', 'div')
      assert.ok(legend)
      assert.doesNotMatch(legend, /<details open|map\.status|approximate|halo/)
      assert.equal((legend.match(/aria-hidden="true"/g) ?? []).length, 2)
      assert.ok(legend.includes(locale === 'ru' ? 'Обозначения' : 'Legend'))
      assert.ok(legend.includes(locale === 'ru' ? 'Память' : 'Memory'))
      assert.match(legend, /1812/)
    })
  }
  for (const state of ['loading', 'missing', 'error']) {
    test(`${locale} actual Map ${state} keeps full index`, async () => {
      const html = await render(locale, state, { layer: '1812' })
      const index = section(html, 'map-page__index')
      assert.equal((index.match(/href=/g) ?? []).length, 13)
      assert.match(index, /<details open/)
      assert.equal(section(html, 'map-page__legend', 'div'), undefined)
      if (state !== 'loading')
        assert.equal(
          (section(html, 'map-page__fallback', 'div').match(/href=/g) ?? [])
            .length,
          13,
        )
    })
  }
  test(`${locale} event index remains scoped with a legend and full error fallback`, async () => {
    const query = { event: 'council-fili', layer: 'memory' }
    const html = await render(locale, 'ready', query)
    const index = section(html, 'map-page__index')
    const expected = resolveTimelinePlaceContext(locale, query.event).places
    assert.equal(expected.length, 4)
    assert.deepEqual(
      [...index.matchAll(/href="([^"]*)"/g)].map((match) => match[1]),
      expected.map(
        (place) => `${locale === 'en' ? '/en' : ''}/places/${place.slug}`,
      ),
    )
    assert.ok(section(html, 'map-page__legend', 'div'))
    assert.equal(section(html, 'map-page__layers', 'div'), undefined)
    const failed = await render(locale, 'error', query)
    assert.equal(
      (section(failed, 'map-page__index').match(/href=/g) ?? []).length,
      4,
    )
    assert.equal(
      (section(failed, 'map-page__fallback', 'div').match(/href=/g) ?? [])
        .length,
      13,
    )
  })
}
