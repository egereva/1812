import { chromium } from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'

const base = 'http://127.0.0.1:3014'
const directory = '.playwright-mcp/homepage-hover'
mkdirSync(directory, { recursive: true })
const browser = await chromium.launch({
  executablePath:
    'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
})
const results = []

for (const [locale, width, touch, reduced] of [
  ['ru', 1440, false, false],
  ['en', 1440, false, false],
  ['ru', 390, true, false],
  ['ru', 320, true, false],
  ['ru', 1440, false, true],
]) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    hasTouch: touch,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const errors = []
  let scripts = 0
  page.on('pageerror', (e) => errors.push(e.message))
  await page.route('**/api-maps.yandex.ru/**', (route) => {
    scripts++
    return route.fulfill({
      contentType: 'application/javascript',
      body: `
      window.__hoverAudit = { maps: [] };
      window.ymaps3 = {
        ready: Promise.resolve(),
        YMap: class {
          constructor(root, options) {
            this.root=root; this.listeners=[];
            this.record={ options, camera:{ center:[37.508045,55.741265], zoom:11.65 }, requests:[], destroyed:false, removed:0 };
            window.__hoverAudit.maps.push(this.record);
            if (options.behaviors) {
              const a=document.createElement('a'); a.href='/provider-proof'; a.textContent='Provider attribution'; a.className='qa-attribution';
              a.style.cssText='position:absolute;right:4px;bottom:4px;font-size:10px'; root.append(a);
            }
          }
          addChild(child) {
            if (child.element) this.root.append(child.element);
            if (child.onUpdate) { this.listeners.push(child); setTimeout(()=>{if(!this.record.destroyed)child.onUpdate({location:this.record.camera,mapInAction:false})},50); }
            return this;
          }
          removeChild(child) { this.listeners=this.listeners.filter(x=>x!==child); this.record.removed++; child.element?.remove(); return this; }
          setLocation(location) {
            this.record.requests.push(location);
            clearTimeout(this.animation);
            this.animation=setTimeout(()=>{ this.record.camera={center:location.center??this.record.camera.center,zoom:location.zoom??this.record.camera.zoom}; this.listeners.forEach(x=>x.onUpdate({location:this.record.camera,mapInAction:false})); },location.duration??0);
          }
          destroy() { clearTimeout(this.animation); this.record.destroyed=true; this.root.replaceChildren(); }
        },
        YMapListener: class { constructor(options){ this.onUpdate=options.onUpdate } },
        YMapDefaultSchemeLayer: class {}, YMapDefaultFeaturesLayer: class {},
        YMapMarker: class { constructor(options,element){this.element=element} update(){} }
      };
    `,
    })
  })
  await page.goto(`${base}/${locale === 'en' ? 'en' : ''}`)
  await page.waitForTimeout(1000)
  await page.locator('.home-map').scrollIntoViewIfNeeded()
  const link = page.locator('.home-map-preview__link')
  await page.locator('.home-map-preview__link--ready').waitFor()
  await page.waitForTimeout(100)
  await page.mouse.move(0, 0)
  await page.waitForTimeout(450)
  const original = await page.evaluate(() => window.__hoverAudit.maps[0].camera)
  const before = await page.evaluate(
    () => window.__hoverAudit.maps[0].requests.length,
  )
  await link.focus()
  assert.equal(await link.evaluate((e) => e.matches(':focus-visible')), true)
  assert.equal(
    await page.evaluate(() => window.__hoverAudit.maps[0].requests.length),
    before,
  )
  const rect = await link.boundingBox()
  const containerBefore = await page.locator('.home-map-preview').boundingBox()
  for (let i = 0; i < 10; i++) {
    await page.mouse.move(rect.x + rect.width / 2, rect.y + 100)
    await page.waitForTimeout(10)
    await page.mouse.move(0, 0)
    await page.waitForTimeout(10)
  }
  await page.waitForTimeout(450)
  const audit = await page.evaluate(() => window.__hoverAudit.maps[0])
  assert.deepEqual(audit.camera, original)
  if (touch || reduced) assert.equal(audit.requests.length, before)
  else {
    assert.equal(audit.requests.length - before, 20)
    for (const [index, request] of audit.requests.slice(before).entries()) {
      assert.deepEqual(request.center, original.center)
      assert.equal(request.zoom, original.zoom + (index % 2 === 0 ? 0.3 : 0))
      assert.equal(request.duration, 400)
      assert.equal(request.easing, 'ease-in-out')
      assert.equal(request.bounds, undefined)
    }
  }
  assert.deepEqual(
    await page.locator('.home-map-preview').boundingBox(),
    containerBefore,
  )
  assert.equal(await page.locator('.home-preview-marker').count(), 13)
  assert.deepEqual(audit.options.behaviors, [])
  assert.equal(
    await page.locator('.qa-attribution').evaluate((e) => {
      const r = e.getBoundingClientRect()
      return (
        document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === e
      )
    }),
    true,
  )
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  )
  if (touch) {
    const beforeScroll = await page.evaluate(() => scrollY)
    const session = await context.newCDPSession(page)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: rect.x + rect.width / 2, y: rect.y + 220 }],
    })
    for (let i = 1; i <= 5; i++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: rect.x + rect.width / 2, y: rect.y + 220 - i * 24 }],
      })
      await page.waitForTimeout(30)
    }
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    })
    await page.waitForTimeout(100)
    assert.notEqual(await page.evaluate(() => scrollY), beforeScroll)
    assert.equal(
      await page.evaluate(() => window.__hoverAudit.maps[0].requests.length),
      before,
    )
    await link.tap()
  } else if (reduced) {
    await link.focus()
    await page.keyboard.press('Enter')
  } else await link.click()
  await page.waitForURL(new RegExp(`/${locale === 'en' ? 'en/' : ''}map/?$`))
  const cleanup = await page.evaluate(() => window.__hoverAudit.maps[0])
  assert.equal(cleanup.destroyed, true)
  assert.equal(cleanup.removed, 1)
  assert.equal(scripts, 1)
  assert.equal(context.pages().length, 1)
  assert.deepEqual(errors, [])
  results.push({
    locale,
    width,
    touch,
    reduced,
    hoverRequests: audit.requests.length - before,
    original,
    cleanup: {
      destroyed: cleanup.destroyed,
      removedListeners: cleanup.removed,
    },
    scripts,
    status: 'PASS',
    mode: 'controlled API stand-in',
  })
  await context.close()
}

// Attempt the actual provider without modifying the key or faking geography.
const context = await browser.newContext()
const page = await context.newPage()
let providerStatus
page.on('response', (r) => {
  if (new URL(r.url()).hostname === 'api-maps.yandex.ru')
    providerStatus = r.status()
})
await page.goto(base)
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
results.push({
  mode: 'actual provider attempt',
  providerStatus,
  ready: (await page.locator('.home-map-preview__link--ready').count()) === 1,
  limitation:
    'Controlled API cases do not verify actual basemap/animation mechanics.',
})
await context.close()
await browser.close()
writeFileSync(`${directory}/checks.json`, JSON.stringify(results, null, 2))
console.log(
  'PASS five controlled browser cases; actual provider readiness:',
  results.at(-1).ready,
)
