import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import test from 'node:test'
import { getPublicSeoRoutes } from '../shared/seo/routes.ts'
import { publicSeoUrl } from '../shared/seo/config.ts'

const server = process.env.SEO_TEST_SERVER || ''
const origin = process.env.SEO_TEST_ORIGIN || ''
const base = process.env.SEO_TEST_BASE_URL || '/'
const evidence = process.env.SEO_TEST_EVIDENCE || ''
const decode = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
const attrs = (tag) =>
  Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]),
  )
const read = async (route) => {
  if (server) {
    const response = await fetch(server + base + route.slice(1), {
      signal: AbortSignal.timeout(15000),
    })
    assert.equal(response.status, 200, route)
    return response.text()
  }
  return readFileSync(
    `.output/public${route === '/' ? '' : route.replace(/\/$/, '')}/index.html`,
    'utf8',
  )
}
const records = []
test('all public routes have localized SSR metadata and reciprocal deployment URLs without duplicates', async () => {
  for (const route of getPublicSeoRoutes()) {
    const html = await read(route),
      head = html.split('</head>')[0]
    const links = [...head.matchAll(/<link\b[^>]*>/g)].map((m) => attrs(m[0]))
    const meta = [...head.matchAll(/<meta\b[^>]*>/g)].map((m) => attrs(m[0]))
    const get = (key) => {
      const found = meta.filter((m) => m.name === key || m.property === key)
      assert.equal(found.length, 1, route + ' ' + key)
      return found[0].content
    }
    const title = decode(head.match(/<title>(.*?)<\/title>/s)?.[1] || '')
    const description = get('description')
    const language = route.startsWith('/en/') ? 'en' : 'ru'
    assert.match(title, /\S/)
    assert.match(description, /\S/)
    assert.equal(
      attrs(html.match(/<html\b[^>]*>/)[0]).lang,
      language === 'en' ? 'en-US' : 'ru-RU',
    )
    assert.equal(get('og:title'), title)
    assert.equal(get('og:description'), description)
    assert.equal(get('og:locale'), language === 'en' ? 'en_US' : 'ru_RU')
    assert.equal(
      get('og:locale:alternate'),
      language === 'en' ? 'ru_RU' : 'en_US',
    )
    assert.equal(get('og:type'), 'website')
    assert.equal(get('twitter:title'), title)
    assert.equal(get('twitter:description'), description)
    assert.ok(
      !meta.some(
        (m) => /robots/i.test(m.name || '') && /noindex/i.test(m.content),
      ),
    )
    const canonical = links.filter((l) => l.rel === 'canonical'),
      alternates = links.filter((l) => l.hreflang)
    if (origin) {
      assert.equal(canonical.length, 1)
      assert.equal(canonical[0].href, publicSeoUrl(route, origin, base))
      assert.equal(get('og:url'), canonical[0].href)
      assert.equal(
        new Set(alternates.map((l) => l.hreflang)).size,
        alternates.length,
      )
      const ru = language === 'en' ? route.slice(3) : route
      for (const [code, path] of [
        ['ru', ru],
        ['en', ru === '/' ? '/en/' : '/en' + ru],
        ['x-default', ru],
      ]) {
        assert.equal(alternates.filter((l) => l.hreflang === code).length, 1)
        assert.equal(
          alternates.find((l) => l.hreflang === code).href,
          publicSeoUrl(path, origin, base),
        )
      }
    } else {
      assert.equal(canonical.length, 0)
      assert.equal(alternates.length, 0)
      assert.ok(!meta.some((m) => m.property === 'og:url'))
    }
    records.push({
      route,
      title,
      description,
      lang: language,
      canonical: canonical[0]?.href,
      alternates,
    })
  }
  assert.equal(
    new Set(records.map((r) => r.title)).size,
    records.length,
    'Every title is unique',
  )
  assert.equal(
    new Set(records.map((r) => r.description)).size,
    records.length,
    'Every description is unique',
  )
  if (evidence) {
    mkdirSync('.playwright-mcp/stage9-5', { recursive: true })
    writeFileSync(evidence, JSON.stringify(records, null, 2))
  }
})
test('robots and sitemap exactly match deployment configuration', async () => {
  const robots = server
    ? await (await fetch(server + base + 'robots.txt')).text()
    : readFileSync('.output/public/robots.txt', 'utf8')
  assert.match(robots, /User-agent: \*\nAllow: \//)
  if (origin) {
    assert.ok(robots.includes('Sitemap: ' + origin + base + 'sitemap.xml'))
    let xml
    if (server) {
      const response = await fetch(server + base + 'sitemap.xml')
      assert.equal(response.status, 200)
      xml = await response.text()
    } else xml = readFileSync('.output/public/sitemap.xml', 'utf8')
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) =>
      decode(m[1]),
    )
    assert.deepEqual(
      urls,
      getPublicSeoRoutes().map((r) => publicSeoUrl(r, origin, base)),
    )
    assert.equal(new Set(urls).size, 140)
  } else {
    assert.doesNotMatch(robots, /Sitemap:|localhost|example/)
    assert.throws(() => readFileSync('.output/public/sitemap.xml'))
  }
})
