import { chromium } from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
const directory = '.playwright-mcp/homepage-real-static-map'
mkdirSync(directory, { recursive: true })
const browser = await chromium.launch({
  executablePath:
    'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
  headless: true,
})
const reports = []
for (const [locale, width] of [
  ['ru', 1440],
  ['ru', 768],
  ['ru', 390],
  ['ru', 320],
  ['en', 1440],
]) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const external = [],
    errors = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol.startsWith('http') && url.hostname !== 'localhost')
      external.push(url.origin + url.pathname)
  })
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('http://localhost:3020/' + (locale === 'en' ? 'en/' : ''), {
    waitUntil: 'networkidle',
  })
  await page.evaluate(() => document.fonts.ready)
  const section = page.locator('.home-map')
  await section.scrollIntoViewIfNeeded()
  assert.equal(await section.locator('circle[data-place-id]').count(), 13)
  assert.equal(await section.locator('circle[data-layer="1812"]').count(), 6)
  assert.equal(await section.locator('circle[data-layer="memory"]').count(), 7)
  const metrics = await page.evaluate(() => {
    const section = document.querySelector('.home-map'),
      svg = section.querySelector('svg')
    const rect = (element) => {
      const r = element.getBoundingClientRect()
      return {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        bottom: r.bottom,
      }
    }
    return {
      pageOverflow: document.documentElement.scrollWidth > innerWidth,
      section: rect(section),
      graphic: rect(svg),
      list: rect(section.querySelector('ul')),
      cta: rect(section.querySelector('.home-link')),
      footer: rect(document.querySelector('footer')),
      links: [...section.querySelectorAll('a')].map((a) => ({
        href: a.getAttribute('href'),
        height: a.getBoundingClientRect().height,
        target: a.getAttribute('target'),
      })),
      summary: section.querySelector('title').textContent,
      geometryTabStops: section.querySelectorAll(
        'svg a, svg [tabindex], svg button',
      ).length,
      svgBytes: new TextEncoder().encode(svg.outerHTML).length,
    }
  })
  assert.equal(metrics.pageOverflow, false)
  assert.equal(metrics.geometryTabStops, 0)
  for (const link of metrics.links) {
    assert.ok(link.height >= 44)
    assert.equal(link.target, null)
  }
  assert.equal(metrics.links.length, 4)
  if (width < 900) assert.ok(metrics.graphic.y - metrics.cta.bottom >= 31.9)
  await page.evaluate(() => window.scrollTo(0, 0))
  const clip = await section.boundingBox()
  await page.screenshot({
    path: directory + '/' + locale + '-' + width + '-section.png',
    fullPage: true,
    clip,
  })
  await page.screenshot({
    path: directory + '/' + locale + '-' + width + '-page.png',
    fullPage: true,
  })
  await section.locator('a').first().hover()
  await page.keyboard.press('Tab')
  for (const link of await section.locator('a').all()) {
    await link.focus()
    assert.ok(await link.evaluate((a) => a.matches(':focus-visible')))
    assert.ok(
      await link.evaluate((a) => getComputedStyle(a).outlineStyle !== 'none'),
    )
  }
  await page.evaluate(() => document.activeElement.blur())
  assert.deepEqual(
    external,
    [],
    'Homepage must request no external map assets or APIs',
  )
  assert.deepEqual(errors, [])
  reports.push({
    locale,
    width,
    ...metrics,
    externalRequests: external,
    consoleErrors: errors,
  })
  await context.close()
}
for (const locale of ['ru', 'en']) {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  const prefix = locale === 'en' ? '/en' : ''
  for (const destination of [
    prefix + '/map',
    prefix + '/places/fili-village',
    prefix + '/places/kutuzov-hut',
    prefix + '/places/intercession-church-fili',
  ]) {
    await page.goto('http://localhost:3020' + prefix + '/', {
      waitUntil: 'load',
    })
    const target = page.locator('.home-map a[href="' + destination + '"]')
    await target.click()
    assert.equal(new URL(page.url()).pathname.replace(/\/$/, ''), destination)
    assert.equal(context.pages().length, 1)
  }
  reports.push({
    locale,
    noJavaScriptNavigation: 'all four links passed in the same tab',
  })
  await context.close()
}
writeFileSync(
  directory + '/checks.json',
  JSON.stringify(reports, null, 2) + '\n',
)
await browser.close()
console.log(
  'Five viewports, static geometry, keyboard targets, zero external requests and RU/EN no-JS navigation passed.',
)
