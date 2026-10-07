import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { chromium } from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
const browser = await chromium.launch({ executablePath: 'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe' })
const results = []
for (const [locale, width] of [['ru',1440],['ru',390],['ru',320],['en',1440]]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
  const yandex = [], errors = []
  page.on('request', request => { if (/yandex|yastatic/i.test(request.url())) yandex.push(request.url()) })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`http://localhost:3018/${locale === 'en' ? 'en' : ''}`, { waitUntil: 'domcontentloaded' })
  const section = page.locator('.home-map')
  await page.locator('.home-map__count').waitFor()
  await page.evaluate(() => document.fonts.ready)
  await section.scrollIntoViewIfNeeded()
  const link = section.locator('a')
  await link.hover()
  await page.waitForTimeout(700)
  await page.evaluate(() => document.activeElement?.blur())
  const metrics = await section.evaluate(el => {
    const bounds = selector => {const r = el.querySelector(selector).getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}}
    return { overflow: document.documentElement.scrollWidth > innerWidth, content: bounds('.home-map__content'), fragment: bounds('.home-map__fragment'), diagram: bounds('.home-map__diagram'), names: [...el.querySelectorAll('li')].map(e => ({text:e.textContent,width:e.scrollWidth,box:e.clientWidth})), link: bounds('a') }
  })
  assert.equal(await section.innerText().then(text => text.includes('04 / 04')), false)
  assert.equal(metrics.overflow, false)
  if (width <= 390) { assert.ok(Math.abs(metrics.fragment.y - metrics.link.y - metrics.link.height - 32) < 1); assert.equal(metrics.diagram.height, 160) }
  assert.ok(metrics.names.every(n => n.width <= n.box))
  assert.ok(metrics.link.height >= 44)
  if (width <= 768) assert.ok(metrics.content.y < metrics.fragment.y)
  else assert.ok(metrics.fragment.x < metrics.content.x)
  await section.screenshot({path:`.playwright-mcp/stage-6-3-4-final/${locale}-${width}-map-preview.png`})
  await page.evaluate(() => {const a=document.querySelector('.home-map a'); a.tabIndex=-1; a.focus(); a.removeAttribute('tabindex')})
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  assert.equal(await link.evaluate(e => e === document.activeElement), true)
  const focus = await link.evaluate(e => ({outline:getComputedStyle(e).outlineStyle, width:getComputedStyle(e).outlineWidth}))
  assert.notEqual(focus.outline,'none')
  assert.notEqual(focus.width,'0px')
  await page.evaluate(() => document.activeElement.blur())
  if (width === 1440 && locale === 'ru') {
    await page.evaluate(() => window.scrollTo(0,document.querySelector('.home-map').offsetTop-240))
    await page.screenshot({path:'.playwright-mcp/stage-6-3-4-final/ru-1440-timeline-map-transition.png'})
    await page.evaluate(() => window.scrollTo(0,document.body.scrollHeight))
    await page.screenshot({path:'.playwright-mcp/stage-6-3-4-final/ru-1440-map-footer-transition.png'})
  }
  assert.deepEqual(yandex,[])
  assert.deepEqual(errors,[])
  results.push({locale,width,...metrics,focus,yandexRequests:yandex.length,pageErrors:errors})
  await page.close()
}
writeFileSync('.playwright-mcp/stage-6-3-4-final/browser-checks.json', JSON.stringify(results,null,2))
await browser.close()
console.log('PASS: four viewports, keyboard focus, 44px CTA, no overflow or clipped names, zero Yandex requests/page exceptions')

