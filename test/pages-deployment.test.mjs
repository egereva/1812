import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { getPublicSeoRoutes } from '../shared/seo/routes.ts'

const root = resolve('.output/public')
const origin = process.env.SEO_TEST_ORIGIN || 'https://egereva.github.io'
const base = process.env.SEO_TEST_BASE_URL || '/1812/'
const decode = (value) => value.replaceAll('&amp;', '&')
const attributes = (tag) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [
      match[1],
      decode(match[2]),
    ]),
  )

function verifyLocalReference(value, pageURL) {
  const url = new URL(value, pageURL)
  if (url.origin !== origin) return
  const isRoot = url.pathname === base.slice(0, -1)
  assert.ok(
    isRoot || url.pathname.startsWith(base),
    `Local reference must use app.baseURL: ${url.pathname}`,
  )
  const file = resolve(
    root,
    decodeURIComponent(url.pathname.slice(base.length)),
  )
  assert.ok(
    file === root || file.startsWith(root + '/'),
    'Asset stays in output',
  )
  assert.ok(
    existsSync(file) || existsSync(resolve(file, 'index.html')),
    `Missing generated destination: ${url.pathname}`,
  )
}

test('all public Pages routes, internal links and HTML assets exist under the production baseURL', () => {
  let references = 0
  for (const route of getPublicSeoRoutes()) {
    const file = resolve(root, route.slice(1), 'index.html')
    assert.ok(existsSync(file), `Missing prerendered route: ${route}`)
    const html = readFileSync(file, 'utf8')
    const pageURL = origin + base + route.slice(1)
    for (const match of html.matchAll(
      /<(?:a|img|source|script|link)\b[^>]*>/g,
    )) {
      const attrs = attributes(match[0])
      for (const value of [attrs.href, attrs.src].filter(Boolean)) {
        verifyLocalReference(value, pageURL)
        references++
      }
      for (const entry of (attrs.srcset || '').split(',').filter(Boolean)) {
        verifyLocalReference(entry.trim().split(/\s+/)[0], pageURL)
        references++
      }
    }
    const icon = [...html.matchAll(/<link\b[^>]*>/g)]
      .map((match) => attributes(match[0]))
      .find((attrs) => attrs.rel === 'icon')
    assert.equal(icon?.href, base + 'icons/1812-map-marker-filled.svg')
  }
  console.log(
    `${getPublicSeoRoutes().length} Pages routes; ${references} HTML references checked`,
  )
})

test('generated CSS asset references resolve without escaping the output', () => {
  const directory = resolve(root, '_nuxt')
  for (const name of readdirSync(directory).filter((file) =>
    file.endsWith('.css'),
  )) {
    const file = resolve(directory, name)
    const css = readFileSync(file, 'utf8')
    for (const match of css.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) {
      const url = match[1]
      if (/^(?:data:|https?:|#)/.test(url)) continue
      if (url.startsWith('/')) {
        verifyLocalReference(url, origin + base)
      } else {
        assert.ok(existsSync(resolve(dirname(file), url.split(/[?#]/)[0])))
      }
    }
  }
})

test('desktop and mobile language switches keep every public route inside app.baseURL', () => {
  for (const route of getPublicSeoRoutes()) {
    const html = readFileSync(
      resolve(root, route.slice(1), 'index.html'),
      'utf8',
    )
    const isEnglish = route.startsWith('/en/')
    const russianRoute = isEnglish ? route.slice(3) : route
    const switches = [...html.matchAll(/<a\b[^>]*>/g)]
      .map((match) => attributes(match[0]))
      .filter((attrs) => ['ru', 'en'].includes(attrs.lang))
    assert.equal(switches.length, 4, route)
    for (const link of switches) {
      const expectedRoute =
        link.lang === 'ru'
          ? russianRoute
          : russianRoute === '/'
            ? '/en/'
            : '/en' + russianRoute
      const expected = (base + expectedRoute.slice(1)).replace(/\/$/, '') || '/'
      const url = new URL(link.href, origin)
      assert.equal(url.pathname.replace(/\/$/, '') || '/', expected, route)
      assert.equal(url.origin, origin)
    }
  }
})
