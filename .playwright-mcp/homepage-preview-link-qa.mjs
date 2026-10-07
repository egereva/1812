import { chromium } from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'

const base = 'http://127.0.0.1:3014'
const directory = '.playwright-mcp/homepage-preview-link'
mkdirSync(directory, { recursive: true })
const browser = await chromium.launch({
  executablePath:
    'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
})
const results = []

async function open(locale, width, mode) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    hasTouch: width < 400,
  })
  const page = await context.newPage()
  let scripts = 0
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('request', (r) => {
    if (new URL(r.url()).hostname === 'api-maps.yandex.ru') scripts++
  })
  if (mode === 'ready-stand-in')
    await page.route('**/api-maps.yandex.ru/**', (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: `
    window.__previewAudit = { behaviors: [], destroyed: 0 };
    window.ymaps3 = {
      ready: Promise.resolve(),
      YMap: class {
        constructor(root, options) {
          this.root = root;
          window.__previewAudit.behaviors.push(options.behaviors);
          if (options.behaviors) for (const side of ['left','right']) {
            const a = document.createElement('a'); a.href='/provider-proof'; a.target='_blank'; a.rel='noopener noreferrer';
            a.textContent='Provider attribution'; a.className='qa-provider-link';
            a.style.cssText='position:absolute;bottom:4px;'+side+':4px;font-size:10px;'; root.append(a);
          }
        }
        addChild(child) { if (child.element) this.root.append(child.element); return this; }
        removeChild(child) { child.element?.remove(); return this; }
        setLocation() {}
        destroy() { window.__previewAudit.destroyed++; this.root.replaceChildren(); }
      },
      YMapDefaultSchemeLayer: class {}, YMapDefaultFeaturesLayer: class {}, YMapListener: class {},
      YMapMarker: class { constructor(options, element) { this.element=element } update() {} }
    };
  `,
      }),
    )
  if (mode === 'blocked')
    await page.route('**/api-maps.yandex.ru/**', (route) => route.abort())
  if (mode === 'missing')
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue()
      const response = await route.fetch()
      await route.fulfill({
        response,
        body: (await response.text()).replace(
          /((?:"yandexMapsApiKey"|yandexMapsApiKey)\s*:\s*")[^"]*"/g,
          '$1"',
        ),
      })
    })
  await page.goto(`${base}/${locale === 'en' ? 'en' : ''}`)
  await page.waitForTimeout(1000)
  await page.locator('.home-map').scrollIntoViewIfNeeded()
  if (mode === 'ready-stand-in')
    await page.locator('.home-map-preview__link--ready').waitFor()
  else
    await page.waitForFunction(
      () =>
        /недоступен|unavailable/.test(
          document.querySelector('.home-map-preview').textContent,
        ),
      null,
      { timeout: 18000 },
    )
  const overlay = page.locator('.home-map-preview__link')
  assert.equal(await overlay.count(), 1)
  assert.equal(
    await overlay.getAttribute('href'),
    locale === 'en' ? '/en/map' : '/map',
  )
  assert.equal(await overlay.getAttribute('target'), null)
  assert.equal(
    await overlay.evaluate((e) => getComputedStyle(e).cursor),
    'pointer',
  )
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  )
  assert.equal(await page.locator('.home-map__places a').count(), 3)
  assert.deepEqual(
    await page
      .locator('.home-map__places a')
      .evaluateAll((links) => links.map((a) => a.getAttribute('href'))),
    ['fili-village', 'kutuzov-hut', 'intercession-church-fili'].map(
      (slug) => `${locale === 'en' ? '/en' : ''}/places/${slug}`,
    ),
  )
  await overlay.focus()
  assert.equal(
    await overlay.evaluate(
      (e) =>
        e.matches(':focus-visible') &&
        getComputedStyle(e).outlineWidth === '2px',
    ),
    true,
  )
  await page
    .locator('.home-map-preview')
    .screenshot({ path: `${directory}/${locale}-${width}-${mode}-focus.png` })
  if (mode === 'ready-stand-in') {
    assert.equal(await page.locator('.home-preview-marker').count(), 13)
    assert.deepEqual(
      await page.evaluate(() => window.__previewAudit.behaviors[0]),
      [],
    )
    const boxes = await page.locator('.home-map-preview').evaluate((e) => ({
      preview: e.getBoundingClientRect().toJSON(),
      link: e
        .querySelector('.home-map-preview__link')
        .getBoundingClientRect()
        .toJSON(),
    }))
    assert.equal(boxes.preview.bottom - 1 - boxes.link.bottom, 56)
    for (const link of await page.locator('.qa-provider-link').all()) {
      assert.equal(
        await link.evaluate((e) => {
          const r = e.getBoundingClientRect()
          return (
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) ===
            e
          )
        }),
        true,
      )
    }
    const popupPromise = context.waitForEvent('page')
    await page.locator('.qa-provider-link').first().click()
    const popup = await popupPromise
    await popup.waitForLoadState('domcontentloaded')
    assert.match(popup.url(), /provider-proof/)
    await popup.close()
  }
  return {
    context,
    page,
    overlay,
    errors,
    get scripts() {
      return scripts
    },
  }
}

for (const locale of ['ru', 'en']) {
  for (const activation of ['click', 'enter']) {
    const h = await open(locale, 1440, 'ready-stand-in')
    if (activation === 'enter') {
      await h.overlay.focus()
      await h.page.keyboard.press('Enter')
    } else await h.overlay.click()
    await h.page.waitForURL(
      new RegExp(`/${locale === 'en' ? 'en/' : ''}map/?$`),
    )
    await h.page.waitForFunction(() => window.__previewAudit.destroyed === 1)
    assert.equal(h.scripts, 1)
    assert.equal(h.context.pages().length, 1)
    assert.deepEqual(h.errors, [])
    results.push({
      locale,
      mode: 'ready-stand-in',
      activation,
      scripts: h.scripts,
      attributionFixture: 'independently clickable',
      status: 'PASS',
    })
    await h.context.close()
  }
  for (const mode of ['blocked', 'missing']) {
    const h = await open(locale, 390, mode)
    await h.overlay.tap()
    await h.page.waitForURL(
      new RegExp(`/${locale === 'en' ? 'en/' : ''}map/?$`),
    )
    assert.equal(h.context.pages().length, 1)
    assert.deepEqual(h.errors, [])
    results.push({ locale, mode, activation: 'tap', status: 'PASS' })
    await h.context.close()
  }
}

for (const width of [390, 320]) {
  const h = await open('ru', width, 'ready-stand-in')
  await h.page.locator('.home-map-preview').scrollIntoViewIfNeeded()
  const before = await h.page.evaluate(() => scrollY)
  const rect = await h.overlay.boundingBox()
  const session = await h.context.newCDPSession(h.page)
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: rect.x + rect.width / 2, y: rect.y + 220 }],
  })
  for (let step = 1; step <= 5; step++) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: rect.x + rect.width / 2, y: rect.y + 220 - step * 24 },
      ],
    })
    await h.page.waitForTimeout(30)
  }
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
  await h.page.waitForTimeout(150)
  assert.notEqual(await h.page.evaluate(() => scrollY), before)
  assert.match(h.page.url(), /3014\/$/)
  await h.overlay.tap()
  await h.page.waitForURL('**/map')
  assert.equal(h.scripts, 1)
  results.push({
    width,
    mode: 'ready-stand-in',
    scrolling: 'native, no navigation while swiping',
    tap: 'same-tab Map',
    status: 'PASS',
  })
  await h.context.close()
}

// Existing textual CTA remains an independent target in the failure path.
const h = await open('ru', 1440, 'blocked')
await h.page.locator('.home-map .home-link').click()
await h.page.waitForURL('**/map')
assert.equal(h.context.pages().length, 1)
results.push({ mode: 'blocked', activation: 'textual CTA', status: 'PASS' })
await h.context.close()

for (const locale of ['ru', 'en']) {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 1000 },
  })
  const page = await context.newPage()
  await page.goto(`${base}/${locale === 'en' ? 'en' : ''}`)
  const overlay = page.locator('.home-map-preview__link')
  await overlay.focus()
  await page.keyboard.press('Enter')
  await page.waitForURL(new RegExp(`/${locale === 'en' ? 'en/' : ''}map/?$`))
  assert.equal(context.pages().length, 1)
  results.push({ locale, mode: 'no-js', activation: 'Enter', status: 'PASS' })
  await context.close()
}
await browser.close()
writeFileSync(`${directory}/checks.json`, JSON.stringify(results, null, 2))
console.log(
  `PASS ${results.length} focused browser cases; ready-state is a controlled API stand-in, not live Yandex.`,
)
