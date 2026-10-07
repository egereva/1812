import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import test from 'node:test'

const root = '.output/public'
function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory()
      ? htmlFiles(path)
      : entry.name.endsWith('.html')
        ? [path]
        : []
  })
}

test('all generated RU/EN source and attribution anchors follow the global link contract', () => {
  const totals = {
    ru: { external: 0, internal: 0 },
    en: { external: 0, internal: 0 },
  }
  let files = 0
  for (const path of htmlFiles(root)) {
    const locale = relative(root, path).replaceAll('\\', '/').startsWith('en/')
      ? 'en'
      : 'ru'
    const html = readFileSync(path, 'utf8')
    for (const match of html.matchAll(/<a\b([^>]*)>/g)) {
      const attributes = Object.fromEntries(
        [...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]),
      )
      if (!attributes.href) continue
      const base = new URL('https://museum.example/')
      const url = new URL(attributes.href.replaceAll('&amp;', '&'), base)
      const external =
        ['http:', 'https:'].includes(url.protocol) && url.origin !== base.origin
      if (external) {
        totals[locale].external++
        assert.equal(attributes.target, '_blank', `${path}: ${attributes.href}`)
        assert.deepEqual(
          (attributes.rel ?? '').split(/\s+/).sort(),
          ['noopener', 'noreferrer'],
          `${path}: ${attributes.href}`,
        )
      } else {
        totals[locale].internal++
        assert.notEqual(
          attributes.target,
          '_blank',
          `${path}: ${attributes.href}`,
        )
      }
    }
    files++
  }
  for (const locale of ['ru', 'en']) {
    assert.ok(
      totals[locale].external > 0,
      'External source/attribution links are rendered',
    )
    assert.ok(totals[locale].internal > 0, 'Internal navigation is rendered')
    for (const page of [
      'dictionary/fili',
      'timeline/council-fili',
      'map',
      'places/kutuzov-hut',
      'sources',
      'about',
    ])
      readFileSync(join(root, locale === 'en' ? 'en' : '', page, 'index.html'))
  }
  console.log(JSON.stringify({ files, totals }))
})
