import assert from 'node:assert/strict'
import { chromium } from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'
const browser = await chromium.launch({ executablePath: 'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe' })
for (const locale of ['ru','en']) {
  const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:1000}})
  const page = await context.newPage()
  const yandex = []
  page.on('request', r => { if (/yandex|yastatic/i.test(r.url())) yandex.push(r.url()) })
  await page.goto(`http://localhost:3020/${locale === 'en' ? 'en/' : ''}`)
  assert.equal(await page.locator('.home-map li').count(),3)
  assert.equal(await page.locator('.home-map__count').textContent(),'13')
  const link = page.locator('.home-map a')
  await link.focus()
  await page.keyboard.press('Enter')
  await page.waitForURL(`**/${locale === 'en' ? 'en/' : ''}map`)
  assert.equal(context.pages().length,1)
  assert.equal(await page.locator('h1').textContent(),locale === 'ru' ? 'Карта' : 'Map')
  assert.deepEqual(yandex,[])
  await context.close()
}
// Hydrated static output must also retain native localized navigation.
const page = await browser.newPage()
const yandex = []
page.on('request', r => { if (/yandex|yastatic/i.test(r.url())) yandex.push(r.url()) })
await page.goto('http://localhost:3020/',{waitUntil:'networkidle'})
await page.locator('.home-map a').hover()
await page.waitForTimeout(500)
assert.deepEqual(yandex,[])
await browser.close()
console.log('PASS: RU/EN generated no-JS CTA keyboard navigation, same tab; static hydrated Homepage zero Yandex requests')
