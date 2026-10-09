import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canonicalRoute,
  detailSeoTitle,
  normalizeLocaleSeoUrl,
  publicSeoUrl,
  validateBaseURL,
  validateSiteOrigin,
} from '../shared/seo/config.ts'
import {
  createRobots,
  createSitemap,
  getPublicSeoRoutes,
} from '../shared/seo/routes.ts'

// Synthetic test origin only; never passed into a publishable static build.
const fixtureOrigin = 'https://fixture.github.io'
test('origin is optional, but fabricated/local/path-bearing production values fail validation', () => {
  assert.equal(validateSiteOrigin(''), '')
  assert.equal(validateSiteOrigin(fixtureOrigin + '/'), fixtureOrigin)
  for (const value of [
    'http://museum.github.io',
    'https://localhost',
    'https://127.0.0.1',
    'https://example.com',
    'https://museum.example.org',
    'https://museum.test',
    'https://museum.github.io/repo/',
    'https://museum.github.io?x=1',
    'https://user:pass@museum.github.io',
    'https://museum.github.io:1234',
  ])
    assert.throws(() => validateSiteOrigin(value))
})
test('deployment base path is validated without changing route architecture', () => {
  assert.equal(validateBaseURL('/'), '/')
  assert.equal(validateBaseURL('/1812/'), '/1812/')
  for (const value of ['1812', '/1812', '//host/', '/../', '/repo/?x=1'])
    assert.throws(() => validateBaseURL(value))
})
test('public inventory has all 136 unique reciprocal routes', () => {
  const routes = getPublicSeoRoutes()
  assert.equal(routes.length, 136)
  assert.equal(new Set(routes).size, routes.length)
  for (const route of routes) {
    assert.doesNotMatch(route, /[?#]|\/\//)
    const ru = route.startsWith('/en/') ? route.slice(3) : route
    assert.ok(routes.includes(ru))
    assert.ok(routes.includes(ru === '/' ? '/en/' : '/en' + ru))
  }
})
test('canonical roots, queries and subpaths remain consistent and are not duplicated', () => {
  assert.equal(canonicalRoute('/en?x=1#top'), '/en/')
  assert.equal(
    publicSeoUrl('/map?place=fili', fixtureOrigin, '/1812/'),
    fixtureOrigin + '/1812/map',
  )
  assert.equal(
    publicSeoUrl('/en/', fixtureOrigin, '/1812/'),
    fixtureOrigin + '/1812/en/',
  )
  assert.equal(
    normalizeLocaleSeoUrl(fixtureOrigin + '/1812', fixtureOrigin, '/1812/'),
    fixtureOrigin + '/1812/',
  )
  assert.equal(
    normalizeLocaleSeoUrl(
      fixtureOrigin + '/1812/en/map?event=fili',
      fixtureOrigin,
      '/1812/',
    ),
    fixtureOrigin + '/1812/en/map',
  )
  assert.throws(() =>
    normalizeLocaleSeoUrl(fixtureOrigin + '/map', fixtureOrigin, '/1812/'),
  )
  assert.equal(publicSeoUrl('/map', '', '/'), '')
})
test('sitemap exactly matches canonical inventory at root and project subpath', () => {
  for (const base of ['/', '/1812/']) {
    const xml = createSitemap(fixtureOrigin, base)
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
      (match) => match[1],
    )
    assert.deepEqual(
      urls,
      getPublicSeoRoutes().map((route) =>
        publicSeoUrl(route, fixtureOrigin, base),
      ),
    )
    assert.equal(new Set(urls).size, 136)
  }
  assert.throws(() => createSitemap('', '/'))
})
test('robots never advertises an unconfigured sitemap or invents a URL', () => {
  assert.equal(createRobots('', '/1812/'), 'User-agent: *\nAllow: /\n')
  assert.match(
    createRobots(fixtureOrigin, '/1812/'),
    /Sitemap: https:\/\/fixture\.github\.io\/1812\/sitemap.xml/,
  )
})
test('detail title distinguishes sections while preserving original entity text', () => {
  assert.equal(
    detailSeoTitle('Бородинское сражение', 'Словарь'),
    'Бородинское сражение — Словарь — 1812',
  )
  assert.notEqual(
    detailSeoTitle('Battle of Borodino', 'Dictionary'),
    detailSeoTitle('Battle of Borodino', 'Timeline'),
  )
})
