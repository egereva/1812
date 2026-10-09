import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

const { chromium } = await import(process.env.REFLOW_PLAYWRIGHT_MODULE)
const origin = process.env.REFLOW_BASE_URL || 'http://localhost:3042'
let browser
before(async () => {
  browser = await chromium.launch({
    executablePath: process.env.REFLOW_BROWSER_PATH,
  })
})
after(async () => {
  await browser?.close()
})

for (const locale of ['ru', 'en'])
  for (const route of ['/', '/map', '/timeline']) {
    test(`${locale} ${route}: Footer text 200% fits 320px without clipping navigation`, async () => {
      const context = await browser.newContext({
          viewport: { width: 320, height: 900 },
        }),
        page = await context.newPage()
      try {
        await page.goto(origin + (locale === 'en' ? '/en' : '') + route)
        await page.waitForFunction(
          () => !!document.querySelector('#__nuxt')?.__vue_app__,
        )
        await page.evaluate(
          () => (document.documentElement.style.fontSize = '200%'),
        )
        const overflow = await page
          .locator('.site-footer *')
          .evaluateAll((elements) =>
            elements
              .filter(
                (element) =>
                  element.getBoundingClientRect().right > 321 ||
                  element.scrollWidth > element.clientWidth + 1,
              )
              .map((element) => element.className),
          )
        assert.deepEqual(overflow, [])
        const links = page.locator('.site-footer a')
        assert.equal(await links.count(), 7)
        await links.first().focus()
        for (let index = 0; index < 7; index++) {
          assert.ok(
            await page.evaluate(
              () => !!document.activeElement.closest('footer'),
            ),
          )
          if (index < 6) await page.keyboard.press('Tab')
        }
        if (route !== '/map')
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth),
            320,
          )
      } finally {
        await context.close()
      }
    })
  }
