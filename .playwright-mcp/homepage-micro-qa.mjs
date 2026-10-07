import { chromium } from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'

const directory = '.playwright-mcp/homepage-micro'
mkdirSync(directory, { recursive: true })
const browser = await chromium.launch({
  executablePath:
    'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
})
const results = []
for (const [locale, width, standIn] of [
  ['ru', 1440, false],
  ['ru', 390, false],
  ['ru', 1440, true],
  ['ru', 390, true],
  ['en', 1440, true],
]) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    hasTouch: width === 390,
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  if (standIn)
    await page.route('**/api-maps.yandex.ru/**', (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: `
    window.ymaps3={ready:Promise.resolve(),
      YMap:class {
        constructor(root){this.root=root;const a=document.createElement('a');a.href='/provider-proof';a.target='_blank';a.rel='noopener noreferrer';a.textContent='Provider attribution';a.className='qa-attribution';a.style.cssText='position:absolute;right:4px;bottom:4px;font-size:10px';root.append(a)}
        addChild(child){if(child.element)this.root.append(child.element);if(child.onUpdate)setTimeout(()=>child.onUpdate({location:{center:[37.508045,55.741265],zoom:11.65},mapInAction:false}),50);return this}
        removeChild(child){child.element?.remove();return this}setLocation(){}destroy(){this.root.replaceChildren()}
      },YMapDefaultSchemeLayer:class{},YMapDefaultFeaturesLayer:class{},
      YMapListener:class{constructor(options){this.onUpdate=options.onUpdate}},
      YMapMarker:class{constructor(options,element){this.element=element}update(){}}
    };
  `,
      }),
    )
  await page.goto(`http://127.0.0.1:3014/${locale === 'en' ? 'en' : ''}`)
  await page.waitForTimeout(1000)
  await page.locator('.home-map').scrollIntoViewIfNeeded()
  await page.waitForFunction(
    () =>
      document.querySelector('.home-map-preview__link--ready') ||
      /недоступен|unavailable/.test(
        document.querySelector('.home-map-preview').textContent,
      ),
    null,
    { timeout: 18000 },
  )
  const overlay = page.locator('.home-map-preview__link')
  const styles = (e) => {
    const c = getComputedStyle(e)
    return {
      outline: c.outlineWidth,
      outlineStyle: c.outlineStyle,
      decoration: c.textDecorationLine,
      color: c.color,
      height: e.getBoundingClientRect().height,
      fontSize: c.fontSize,
    }
  }
  await page.mouse.move(0, 0)
  const normal = await overlay.evaluate(styles)
  assert.equal(normal.outlineStyle, 'none')
  await overlay.hover()
  assert.equal((await overlay.evaluate(styles)).outlineStyle, 'none')
  await page.locator('.home-map').screenshot({
    path: `${directory}/${locale}-${width}-${standIn ? 'stand-in' : 'provider'}-hover.png`,
  })
  await overlay.focus()
  assert.equal(await overlay.evaluate((e) => e.matches(':focus-visible')), true)
  assert.equal((await overlay.evaluate(styles)).outline, '2px')
  await page.locator('.home-map').screenshot({
    path: `${directory}/${locale}-${width}-${standIn ? 'stand-in' : 'provider'}-focus.png`,
  })
  await overlay.evaluate((e) => e.blur())
  for (const link of await page.locator('.home-map__places a').all()) {
    await page.mouse.move(0, 0)
    const initial = await link.evaluate(styles)
    assert.equal(initial.decoration, 'none')
    assert.equal(initial.color, 'rgb(28, 27, 25)')
    assert.ok(initial.height >= 44)
    assert.equal(
      await link.evaluate(
        (e) => getComputedStyle(e.parentElement).borderTopWidth,
      ),
      '1px',
    )
    await link.hover()
    await page.waitForTimeout(220)
    const hovered = await link.evaluate(styles)
    assert.equal(hovered.decoration, 'none')
    assert.equal(hovered.color, 'rgb(112, 40, 55)')
    assert.equal(hovered.height, initial.height)
    assert.equal(hovered.fontSize, initial.fontSize)
    await link.focus()
    assert.equal(await link.evaluate((e) => e.matches(':focus-visible')), true)
    assert.equal((await link.evaluate(styles)).outline, '2px')
    await link.evaluate((e) => e.blur())
  }
  const ready =
    (await page.locator('.home-map-preview__link--ready').count()) === 1
  let attribution = 'provider unavailable'
  const links = page.locator(
    standIn ? '.qa-attribution' : '.home-preview-canvas a',
  )
  if (ready) {
    assert.ok((await links.count()) > 0)
    for (const link of await links.all())
      assert.equal(
        await link.evaluate((e) => {
          const r = e.getBoundingClientRect()
          return (
            document
              .elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
              ?.closest('a') === e
          )
        }),
        true,
      )
    if (standIn) {
      const popupPromise = context.waitForEvent('page')
      await links.first().click()
      const popup = await popupPromise
      await popup.waitForLoadState()
      assert.match(popup.url(), /provider-proof/)
      await popup.close()
    }
    attribution = standIn
      ? 'fixture visible and independently clickable'
      : 'actual provider links hit-test unobstructed'
  }
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  )
  assert.deepEqual(errors, [])
  results.push({
    locale,
    width,
    mode: standIn ? 'controlled provider fixture' : 'actual API attempt',
    ready,
    attribution,
    hoverOutline: 'none',
    focusOutline: '2px',
    placeUnderlines: 'none',
    status: 'PASS',
  })
  await context.close()
}
await browser.close()
writeFileSync(`${directory}/checks.json`, JSON.stringify(results, null, 2))
console.log(
  'PASS RU 1440/390 and EN: normal/hover/focus CSS, unchanged rows and attribution fixture; inspect results for actual API availability.',
)
