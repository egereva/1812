import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parse } from '@vue/compiler-sfc'
import { compile } from '@vue/compiler-dom'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import { getPlaces } from '../shared/content/index.ts'

// Exercise the production template with an active overlap group, independently of Yandex.
const { descriptor } = parse(
  readFileSync('app/components/InteractiveMap.client.vue', 'utf8'),
)
const { code } = compile(descriptor.template.content, {
  mode: 'function',
  prefixIdentifiers: true,
})
const render = new Function('Vue', code)(Vue)
const group = getPlaces('ru').filter((place) =>
  ['kutuzov-hut', 'milepost-fili'].includes(place.id),
)
async function chooser(groupMembers, selectedSlug) {
  return renderToString(
    Vue.createSSRApp({
      setup: () => ({
        root: null,
        groupMembers,
        selectedSlug,
        t: (key) => key,
        selectFromChooser() {},
        closeGroup() {},
      }),
      render,
    }),
  )
}

test('active close-marker group exposes the named chooser before selection', async () => {
  const html = await chooser(group, undefined)
  assert.match(html, /class="map-member-chooser"/)
  for (const place of group) assert.ok(html.includes(place.title))
})
test('a selected Place suppresses the chooser even while the overlap group remains active', async () => {
  assert.doesNotMatch(await chooser(group, 'kutuzov-hut'), /map-member-chooser/)
  assert.doesNotMatch(
    await chooser(group, 'fili-village'),
    /map-member-chooser/,
  )
})
test('clearing selection allows the active group chooser again', async () => {
  assert.doesNotMatch(await chooser(group, 'kutuzov-hut'), /map-member-chooser/)
  assert.match(await chooser(group, undefined), /class="map-member-chooser"/)
})
test('no active group renders no chooser', async () => {
  assert.doesNotMatch(await chooser([], undefined), /map-member-chooser/)
})
