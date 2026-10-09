import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compileScript, parse } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import ts from 'typescript'
import { ref } from 'vue'
import { getPlaces } from '../shared/content/index.ts'
import { statusLayer } from '../app/data/mapPresentation.ts'
import { museumIvoryCustomization } from '../app/data/homepageMapPalettes.ts'
import { loadYandexMaps } from '../app/utils/yandexMapsLoader.client.ts'

const preview = parse(
  readFileSync('app/components/HomepageMapPreview.vue', 'utf8'),
).descriptor
const previewRender = new Function(
  'Vue',
  compile(preview.template.content, {
    mode: 'function',
    prefixIdentifiers: true,
  }).code,
)(Vue)

for (const locale of ['ru', 'en'])
  for (const state of ['ready', 'loading', 'missing', 'error']) {
    test(`${locale} ${state} preview exposes one localized same-tab navigation overlay`, async () => {
      const messages = JSON.parse(
        readFileSync(`i18n/locales/${locale}.json`, 'utf8'),
      )
      const app = Vue.createSSRApp({
        setup: () => ({
          places: getPlaces(locale),
          locale,
          apiKey: state === 'missing' ? '' : 'test',
          state,
          hovered: false,
          onPointerEnter() {},
          counts: { total: 13, history: 6, memory: 7 },
          localePath: (path) => `${locale === 'en' ? '/en' : ''}${path}`,
          t: (key) =>
            key.split('.').reduce((value, part) => value[part], messages),
        }),
        render: previewRender,
      })
      app.component(
        'NuxtLink',
        Vue.defineComponent({
          props: ['to'],
          setup:
            (props, { slots }) =>
            () =>
              Vue.h('a', { href: props.to }, slots.default?.()),
        }),
      )
      app.component(
        'ClientOnly',
        Vue.defineComponent({
          setup:
            (_, { slots }) =>
            () =>
              slots.default?.(),
        }),
      )
      app.component(
        'HomepageMapCanvas',
        Vue.defineComponent({
          setup: () => () => Vue.h('div', { class: 'provider-surface' }),
        }),
      )
      const html = await renderToString(app)
      assert.equal((html.match(/<a\b/g) ?? []).length, 1)
      assert.match(
        html,
        new RegExp(`href="${locale === 'en' ? '/en' : ''}/map"`),
      )
      assert.ok(html.includes(`aria-label="${messages.home.map.previewLink}"`))
      assert.doesNotMatch(html, /target=|tabindex=|<button\b/)
      assert.equal(
        html.includes('home-map-preview__link--ready'),
        state === 'ready',
      )
      if (state === 'ready')
        assert.doesNotMatch(html, /home-map-preview__status/)
      else
        assert.ok(
          html.includes(
            state === 'loading'
              ? messages.map.loading
              : messages.home.map.fallback,
          ),
        )
    })
  }

const { descriptor } = parse(
  readFileSync('app/components/HomepageMapCanvas.client.vue', 'utf8'),
)
const source = compileScript(descriptor, { id: 'homepage-map-test' })
  .content.replace(/^import[\s\S]*?from [^\n]+\n/gm, '')
  .replace('_defineComponent(', 'Object(')
  .replace('export default', 'return')
const code = ts.transpile(source, {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
})

function harness({
  key = 'public-test-key',
  failure = false,
  deferred = false,
  offscreen = false,
  finePointer = true,
  reducedMotion = false,
} = {}) {
  const catalog = getPlaces('ru')
  const events = []
  const markers = []
  const locations = []
  const schemes = []
  const props = {
    places: catalog,
    locale: 'ru',
    apiKey: key,
    hovered: false,
  }
  let hoverWatcher, updateListener
  let removedListeners = 0
  let mounted, unmount, options, resolve, intersection
  let disconnects = 0
  let destroys = 0
  const api = {
    YMap: class {
      constructor(_root, config) {
        options = config
      }
      addChild() {}
      removeChild() {
        removedListeners++
      }
      setLocation(location) {
        locations.push(location)
      }
      destroy() {
        destroys++
      }
    },
    YMapDefaultSchemeLayer: class {
      constructor(options) {
        schemes.push(options)
      }
    },
    YMapDefaultFeaturesLayer: class {},
    YMapListener: class {
      constructor(options) {
        updateListener = options.onUpdate
      }
    },
    YMapMarker: class {
      constructor(config, element) {
        markers.push({ config, element })
      }
    },
  }
  const component = new Function(
    'ref',
    'nextTick',
    'watch',
    'onMounted',
    'onBeforeUnmount',
    'loadYandexMaps',
    'statusLayer',
    'museumIvoryCustomization',
    'approvedMarkerSvg',
    'document',
    'window',
    'IntersectionObserver',
    code,
  )(
    ref,
    () => Promise.resolve(),
    (_source, callback) => {
      hoverWatcher = callback
    },
    (fn) => {
      mounted = fn
    },
    (fn) => {
      unmount = fn
    },
    () =>
      failure
        ? Promise.reject(new Error('private provider error'))
        : deferred
          ? new Promise((r) => {
              resolve = r
            })
          : Promise.resolve(api),
    statusLayer,
    museumIvoryCustomization,
    '<svg></svg>',
    { createElement: () => ({ dataset: {}, setAttribute() {} }) },
    {
      ...(offscreen ? { IntersectionObserver: true } : {}),
      matchMedia: (query) => ({
        matches: query.includes('reduced-motion') ? reducedMotion : finePointer,
      }),
    },
    class {
      constructor(callback) {
        intersection = callback
      }
      observe() {}
      disconnect() {
        disconnects++
      }
    },
  )
  const setup = component.setup(props, {
    expose() {},
    emit: (...args) => events.push(args),
  })
  setup.root.value = {}
  return {
    catalog,
    markers,
    events,
    locations,
    schemes,
    hover: (value) => {
      props.hovered = value
      hoverWatcher()
    },
    cameraUpdate: (location, mapInAction = false) =>
      updateListener({ location, mapInAction }),
    get removedListeners() {
      return removedListeners
    },
    mounted: () => mounted(),
    unmount: () => unmount(),
    resolve: () => resolve(api),
    enterViewport: () => intersection([{ isIntersecting: true }]),
    get disconnects() {
      return disconnects
    },
    get options() {
      return options
    },
    get destroys() {
      return destroys
    },
  }
}
const settle = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

test('Homepage always passes approved Museum Ivory without changing markers or camera', async () => {
  const h = harness()
  h.mounted()
  await settle()
  assert.deepEqual(h.schemes, [{ customization: museumIvoryCustomization }])
  assert.equal(h.markers.length, 13)
  assert.deepEqual(h.options.behaviors, [])
  assert.deepEqual(h.options.margin, [40, 32, 48, 32])
  assert.deepEqual(h.locations, [])
  h.unmount()
})

test('hover uses absolute +0.3 targets for 400ms and restores the first settled fitted camera', async () => {
  const h = harness()
  h.mounted()
  await settle()
  h.cameraUpdate({ center: [0, 0], zoom: 3 }, true)
  h.hover(true)
  assert.deepEqual(h.locations, [])
  const original = { center: [37.508045, 55.741265], zoom: 11.65 }
  h.cameraUpdate(original)
  for (let cycle = 0; cycle < 20; cycle++) {
    h.hover(true)
    const zoomIn = h.locations.at(-1)
    assert.deepEqual(zoomIn, {
      center: original.center,
      zoom: original.zoom + 0.3,
      duration: 400,
      easing: 'ease-in-out',
    })
    h.cameraUpdate({ center: [37.6, 55.8], zoom: 12.8 }, true)
    h.cameraUpdate({ center: [37.6, 55.8], zoom: 12.8 })
    h.hover(false)
    assert.deepEqual(h.locations.at(-1), {
      ...original,
      duration: 400,
      easing: 'ease-in-out',
    })
  }
  assert.equal(h.locations.length, 40)
  assert.equal(h.markers.length, 13)
  assert.equal(h.options.zoomRounding, 'smooth')
  h.unmount()
  assert.equal(h.removedListeners, 1)
  assert.equal(h.destroys, 1)
  h.hover(true)
  h.cameraUpdate(original)
  assert.equal(h.locations.length, 40)
})

for (const config of [{ finePointer: false }, { reducedMotion: true }]) {
  test(`hover leaves camera stable for ${config.finePointer === false ? 'touch/coarse pointers' : 'reduced motion'}`, async () => {
    const h = harness(config)
    h.mounted()
    await settle()
    h.cameraUpdate({ center: [37.508045, 55.741265], zoom: 11.65 })
    h.hover(true)
    h.hover(false)
    assert.deepEqual(h.locations, [])
    h.unmount()
  })
}

test('offscreen preview defers the shared API and disconnects its observer', async () => {
  const h = harness({ offscreen: true })
  h.mounted()
  await settle()
  assert.equal(h.markers.length, 0)
  assert.equal(h.disconnects, 0)
  h.enterViewport()
  await settle()
  assert.equal(h.markers.length, 13)
  assert.equal(h.disconnects, 1)
  h.unmount()
  assert.equal(h.destroys, 1)
})

test('unmount before intersection removes the observer without creating a map', async () => {
  const h = harness({ offscreen: true })
  h.mounted()
  await settle()
  h.unmount()
  assert.equal(h.disconnects, 1)
  assert.equal(h.markers.length, 0)
})

test('preview passes all 13 unchanged coordinates, approved layers and a padded static camera to Yandex', async () => {
  const h = harness()
  const before = JSON.stringify(h.catalog)
  h.mounted()
  await settle()
  assert.equal(h.markers.length, 13)
  assert.equal(
    h.markers.filter((m) => m.element.dataset.layer === '1812').length,
    6,
  )
  assert.equal(
    h.markers.filter((m) => m.element.dataset.layer === 'memory').length,
    7,
  )
  for (const [i, marker] of h.markers.entries()) {
    const place = h.catalog[i]
    assert.deepEqual(marker.config.coordinates, [
      place.coordinates.lon,
      place.coordinates.lat,
    ])
    assert.equal(marker.element.dataset.placeId, place.id)
  }
  assert.deepEqual(h.options.behaviors, [])
  assert.deepEqual(h.options.margin, [40, 32, 48, 32])
  assert.deepEqual(h.options.location.bounds, [
    [37.46139, 55.7317],
    [37.5547, 55.75083],
  ])
  assert.equal(JSON.stringify(h.catalog), before)
  assert.deepEqual(h.events, [['state', 'ready']])
  h.unmount()
  assert.equal(h.destroys, 1)
})

test('missing key and rejected API preserve a quiet fallback', async () => {
  for (const [config, state] of [
    [{ key: '' }, 'missing'],
    [{ failure: true }, 'error'],
  ]) {
    const h = harness(config)
    h.mounted()
    await settle()
    assert.deepEqual(h.events, [['state', state]])
    assert.equal(h.markers.length, 0)
    h.unmount()
  }
})

test('unmount while the shared loader is pending cannot retain a map', async () => {
  const h = harness({ deferred: true })
  h.mounted()
  await settle()
  h.unmount()
  h.resolve()
  await settle()
  assert.equal(h.markers.length, 0)
  assert.deepEqual(h.events, [])
})

test('the existing memoized loader injects one script for concurrent and repeated consumers', async () => {
  const scripts = []
  const oldDocument = globalThis.document
  const oldWindow = globalThis.window
  globalThis.document = {
    createElement: () => ({ dataset: {}, remove() {} }),
    head: { append: (script) => scripts.push(script) },
  }
  globalThis.window = {
    setTimeout,
    clearTimeout,
    ymaps3: { ready: Promise.resolve() },
  }
  try {
    const first = loadYandexMaps('public-test-key', 'ru_RU')
    const second = loadYandexMaps('public-test-key', 'ru_RU')
    assert.equal(first, second)
    assert.equal(scripts.length, 1)
    scripts[0].onload()
    await first
    assert.equal(loadYandexMaps('public-test-key', 'ru_RU'), first)
    assert.equal(scripts.length, 1)
  } finally {
    globalThis.document = oldDocument
    globalThis.window = oldWindow
  }
})
