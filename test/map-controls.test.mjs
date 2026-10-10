import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compileScript, parse } from '@vue/compiler-sfc'
import { ref, nextTick } from 'vue'
import ts from 'typescript'

// Exercise the actual component lifecycle with a controlled SDK, not live Yandex.
const { descriptor } = parse(
  readFileSync('app/components/InteractiveMap.client.vue', 'utf8'),
)
const source = compileScript(descriptor, { id: 'map-controls-test' }).content
const compiled = ts
  .transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
  })
  .outputText.replace(/^import .* from ['"]([^'"]+)['"];?$/gm, (_, path) => {
    if (path === 'vue')
      return `import { defineComponent as _defineComponent } from ${JSON.stringify(import.meta.resolve('vue'))};`
    if (path.includes('mapPalettes'))
      return 'const museumGraphiteCustomization = [];'
    if (path.includes('mapPresentation'))
      return 'const groupOverlappingPlaces = () => [];'
    if (path.includes('?raw')) return 'const approvedMarkerSvg = "";'
    if (path.includes('yandexMapsLoader'))
      return 'const loadYandexMaps = () => Promise.resolve(globalThis.mapControlsTestApi);'
    throw new Error(`Unexpected component import: ${path}`)
  })
const component = (
  await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
  )
).default

for (const locale of ['ru', 'en']) {
  test(`${locale}: SDK control placement follows canvas resizing and cleans up`, async () => {
    let mount, unmount, observer
    const updates = []
    let initialPosition,
      destroyed = false
    const emptyEntity = class {}
    const savedGlobals = new Map()
    const globals = {
      ref,
      nextTick,
      watch() {},
      useI18n: () => ({ t: (key) => key }),
      onMounted: (callback) => {
        mount = callback
      },
      onBeforeUnmount: (callback) => {
        unmount = callback
      },
      ResizeObserver: class {
        constructor(callback) {
          this.callback = callback
          observer = this
        }
        observe(element) {
          this.element = element
        }
        disconnect() {
          this.disconnected = true
        }
      },
      mapControlsTestApi: {
        YMap: class {
          constructor(_element, options) {
            initialPosition = options.distributionPosition
          }
          update(options) {
            updates.push(options.distributionPosition)
          }
          addChild() {
            return this
          }
          removeChild() {}
          destroy() {
            destroyed = true
          }
        },
        YMapDefaultSchemeLayer: emptyEntity,
        YMapDefaultFeaturesLayer: emptyEntity,
        YMapListener: emptyEntity,
      },
    }
    for (const [key, value] of Object.entries(globals)) {
      savedGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
      Object.defineProperty(globalThis, key, {
        configurable: true,
        writable: true,
        value,
      })
    }
    try {
      const state = component.setup(
        { places: [], locale, apiKey: 'controlled-test' },
        { expose() {}, emit() {} },
      )
      state.root.value = {
        clientWidth: 300,
        addEventListener() {},
        removeEventListener() {},
      }
      await mount()
      assert.equal(initialPosition, 'top left')
      assert.equal(state.compactControls.value, true)
      assert.ok(observer.element)
      observer.callback([{ contentRect: { width: 479 } }])
      assert.deepEqual(updates, [])
      observer.callback([{ contentRect: { width: 480 } }])
      assert.equal(state.compactControls.value, false)
      observer.callback([{ contentRect: { width: 1200 } }])
      observer.callback([{ contentRect: { width: 260 } }])
      assert.deepEqual(updates, ['bottom left', 'top left'])
      unmount()
      assert.equal(observer.disconnected, true)
      assert.equal(destroyed, true)
    } finally {
      for (const [key, descriptor] of savedGlobals) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor)
        else delete globalThis[key]
      }
    }
  })
}
