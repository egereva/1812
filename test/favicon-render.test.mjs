import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const server = process.env.FAVICON_TEST_SERVER || 'http://localhost:3042'
const base = process.env.FAVICON_TEST_BASE_URL || '/'
for (const route of ['/', '/en/', '/map', '/en/map']) {
  test(`favicon is declared once and loads approved SVG: ${base}${route.slice(1)}`, async () => {
    const response = await fetch(server + base + route.slice(1), {
      signal: AbortSignal.timeout(15000),
    })
    assert.equal(response.status, 200)
    const html = await response.text()
    const icons = [
      ...html.split('</head>')[0].matchAll(/<link\b[^>]*\brel="icon"[^>]*>/g),
    ]
    assert.equal(icons.length, 1)
    const href = icons[0][0].match(/\bhref="([^"]+)"/)[1]
    assert.equal(href, base + 'icons/1812-map-marker-filled.svg')
    const icon = await fetch(new URL(href, server))
    assert.equal(icon.status, 200)
    assert.match(icon.headers.get('content-type'), /image\/svg\+xml/)
    assert.equal(
      await icon.text(),
      readFileSync('public/icons/1812-map-marker-filled.svg', 'utf8'),
    )
  })
}
