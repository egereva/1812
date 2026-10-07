import { chromium } from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'

const directory = '.playwright-mcp/homepage-yandex-preview'
mkdirSync(directory, { recursive: true })
const browser = await chromium.launch({
  executablePath:
    'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
})
const reports = []
const base = 'http://127.0.0.1:3015'
const isYandex = (url) => /yandex|yastatic/.test(new URL(url).hostname)

for (const [locale, width] of [
  ['ru', 1440],
  ['ru', 390],
  ['ru', 320],
  ['en', 1440],
]) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    hasTouch: width < 400,
  })
  const page = await context.newPage()
  const requests = [],
    errors = [],
    hydration = []
  page.on('request', (request) => {
    if (isYandex(request.url()))
      requests.push({
        host: new URL(request.url()).hostname,
        path: new URL(request.url()).pathname,
      })
  })
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (/hydration/i.test(message.text())) hydration.push(message.text())
  })
  await page.goto(`${base}/${locale === 'en' ? 'en/' : ''}`)
  await page.waitForTimeout(700)
  assert.equal(requests.length, 0)
  await page.locator('.home-map').scrollIntoViewIfNeeded()
  await page.waitForFunction(
    () => {
      const state = document.querySelector('.home-map-preview__status')
      return !state || /недоступен|unavailable/.test(state.textContent)
    },
    null,
    { timeout: 20000 },
  )
  const markers = await page.locator('.home-preview-marker').count()
  const metrics = await page.locator('.home-map').evaluate((section) => {
    const preview = section
      .querySelector('.home-map-preview')
      .getBoundingClientRect()
    const cta = section.querySelector('.home-link').getBoundingClientRect()
    return {
      overflow: document.documentElement.scrollWidth > innerWidth,
      previewHeight: preview.height,
      copyFirst: cta.bottom <= preview.top,
      gap: preview.top - cta.bottom,
      links: Array.from(section.querySelectorAll('a'), (a) => ({
        href: a.getAttribute('href'),
        target: a.getAttribute('target'),
        height: a.getBoundingClientRect().height,
      })),
      mapStops: section.querySelectorAll(
        '.home-preview-canvas button, .home-preview-canvas [tabindex], .home-preview-canvas a',
      ).length,
    }
  })
  assert.equal(metrics.overflow, false)
  assert.equal(metrics.links.length, 4)
  assert.ok(metrics.previewHeight >= 320)
  for (const link of metrics.links) {
    assert.equal(link.target, null)
    assert.ok(link.height >= 44)
  }
  if (width < 400) {
    assert.equal(metrics.copyFirst, true)
    assert.ok(metrics.gap >= 31.9)
  }
  for (const link of await page.locator('.home-map a').all()) {
    await link.focus()
    assert.ok(
      await link.evaluate(
        (element) =>
          element.matches(':focus-visible') &&
          getComputedStyle(element).outlineStyle !== 'none',
      ),
    )
  }
  await page.evaluate(() => document.activeElement?.blur())
  const filename = `${locale}-${width}-${markers ? 'map' : 'fallback'}.png`
  await page
    .locator('.home-map')
    .screenshot({ path: `${directory}/${filename}` })
  await page.screenshot({
    path: `${directory}/${locale}-${width}-page.png`,
    fullPage: true,
  })
  if (width < 400) {
    await page.locator('.home-map-preview').scrollIntoViewIfNeeded()
    const before = await page.evaluate(() => scrollY)
    const rect = await page.locator('.home-map-preview').boundingBox()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: rect.x + rect.width / 2, y: rect.y + 220 }],
    })
    for (let step = 1; step <= 5; step++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [
          { x: rect.x + rect.width / 2, y: rect.y + 220 - step * 24 },
        ],
      })
      await page.waitForTimeout(30)
    }
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    })
    await page.waitForTimeout(200)
    assert.notEqual(await page.evaluate(() => scrollY), before)
  }
  assert.deepEqual(errors, [])
  assert.deepEqual(hydration, [])
  reports.push({
    locale,
    width,
    initialYandexRequests: 0,
    afterScrollYandexRequests: requests,
    markers,
    screenshot: filename,
    metrics,
    errors,
    hydration,
  })
  console.log(
    `${locale} ${width}: ${markers ? 'real map' : 'fallback'}, initial requests 0, after scroll ${requests.length}`,
  )
  await context.close()
}

for (const locale of ['ru', 'en'])
  for (const mode of ['no-js', 'blocked-api', 'missing-key']) {
    const context = await browser.newContext({
      javaScriptEnabled: mode !== 'no-js',
      viewport: { width: 390, height: 1000 },
    })
    const page = await context.newPage()
    let requests = 0
    page.on('request', (r) => {
      if (isYandex(r.url())) requests++
    })
    if (mode === 'blocked-api')
      await page.route('**/api-maps.yandex.ru/**', (route) => route.abort())
    if (mode === 'missing-key')
      await page.route('**/*', async (route) => {
        if (route.request().resourceType() !== 'document')
          return route.continue()
        const response = await route.fetch()
        const html = (await response.text()).replace(
          /((?:"yandexMapsApiKey"|yandexMapsApiKey)\s*:\s*")[^"]*"/g,
          '$1"',
        )
        await route.fulfill({ response, body: html })
      })
    await page.goto(`${base}/${locale === 'en' ? 'en/' : ''}`)
    await page.locator('.home-map').scrollIntoViewIfNeeded()
    await page.waitForFunction(() =>
      /недоступен|unavailable/.test(
        document.querySelector('.home-map-preview').textContent,
      ),
    )
    if (mode !== 'blocked-api') assert.equal(requests, 0)
    assert.equal(await page.locator('.home-map a').count(), 4)
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    )
    await page.locator('.home-map a').first().focus()
    await page.keyboard.press('Enter')
    await page.waitForURL(
      new RegExp('/' + (locale === 'en' ? 'en/' : '') + 'map/?$'),
    )
    assert.equal(context.pages().length, 1)
    reports.push({
      locale,
      mode,
      requests,
      navigation: 'same-tab localized map',
      status: 'PASS',
    })
    await context.close()
  }

// Controlled API stand-in verifies browser integration/lifecycle only, never visual geography.
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
})
const page = await context.newPage()
let scripts = 0
await page.route('**/api-maps.yandex.ru/**', async (route) => {
  scripts++
  await route.fulfill({
    contentType: 'application/javascript',
    body: `
    window.__previewAudit = { maps: [] };
    window.ymaps3 = {
      ready: Promise.resolve(),
      YMap: class {
        constructor(root, options) { this.root = root; this.record = { options, destroyed: false }; window.__previewAudit.maps.push(this.record); }
        addChild(child) { if (child.element) this.root.append(child.element); return this; }
        removeChild(child) { child.element?.remove(); return this; }
        setLocation() {}
        destroy() { this.record.destroyed = true; this.root.replaceChildren(); }
      },
      YMapDefaultSchemeLayer: class {}, YMapDefaultFeaturesLayer: class {}, YMapListener: class {},
      YMapMarker: class { constructor(options, element) { this.element = element; this.options = options; } update() {} }
    };
  `,
  })
})
await page.goto(base)
await page.locator('.home-map').scrollIntoViewIfNeeded()
await page.waitForFunction(
  () => document.querySelectorAll('.home-preview-marker').length === 13,
)
assert.equal(await page.locator('.home-map-preview__status').count(), 0)
assert.equal(await page.locator('.home-preview-marker--1812').count(), 6)
assert.equal(await page.locator('.home-preview-marker--memory').count(), 7)
assert.equal(
  await page
    .locator(
      '.home-preview-canvas a, .home-preview-canvas button, .home-preview-canvas [tabindex]',
    )
    .count(),
  0,
)
await page.locator('.home-map a').first().click()
await page.waitForURL('**/map')
await page.waitForFunction(() => window.__previewAudit.maps.length === 2)
assert.equal(scripts, 1)
assert.equal(
  await page.evaluate(() => window.__previewAudit.maps[0].destroyed),
  true,
)
await page.locator('.wordmark').click()
await page.waitForURL(`${base}/`)
await page.locator('.home-map').scrollIntoViewIfNeeded()
await page.waitForFunction(() => window.__previewAudit.maps.length === 3)
assert.equal(scripts, 1)
const lifecycle = await page.evaluate(() =>
  window.__previewAudit.maps.map((map) => ({
    destroyed: map.destroyed,
    behaviors: map.options.behaviors,
  })),
)
assert.deepEqual(
  lifecycle.map((map) => map.destroyed),
  [true, true, false],
)
reports.push({
  mode: 'controlled-api-stand-in',
  scripts,
  lifecycle,
  status: 'PASS',
  limitation: 'Does not validate Yandex basemap, camera or gestures',
})
for (const locale of ['en', 'ru']) {
  await Promise.all([
    page.waitForEvent('domcontentloaded'),
    page.locator(`.language-switch__link[lang="${locale}"]`).click(),
  ])
  await page.locator('.home-map').scrollIntoViewIfNeeded()
  await page.waitForFunction(
    () => document.querySelectorAll('.home-preview-marker').length === 13,
  )
  assert.equal(await page.locator('html').getAttribute('lang'), locale)
  assert.equal(await page.locator('script[data-map-api="yandex-3"]').count(), 1)
}
assert.equal(scripts, 3)
reports.push({
  mode: 'controlled-api-locale-switch',
  scriptsAcrossThreeDocuments: scripts,
  status: 'PASS',
})
await context.close()
writeFileSync(`${directory}/checks.json`, JSON.stringify(reports, null, 2))
await browser.close()
