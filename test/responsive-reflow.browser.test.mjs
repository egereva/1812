import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

// Optional live-browser regression suite; uses an existing Playwright install.
// Provide module/browser paths without adding runtime or project dependencies.
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

async function pageAt(locale, width, callback) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    hasTouch: true,
  })
  const page = await context.newPage()
  try {
    await page.goto(origin + (locale === 'en' ? '/en' : '') + '/timeline')
    await page.waitForFunction(
      () => !!document.querySelector('#__nuxt')?.__vue_app__,
    )
    await callback(page)
  } finally {
    await context.close()
  }
}

for (const locale of ['ru', 'en']) {
  test(`${locale}: long Timeline words cannot enlarge the narrow grid track`, async () => {
    await pageAt(locale, 320, async (page) => {
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth),
        320,
      )
      const overflow = await page
        .locator(
          '.timeline-event__title,.timeline-event__description,.timeline-event__date',
        )
        .evaluateAll((elements) =>
          elements
            .filter(
              (element) =>
                element.scrollWidth > element.clientWidth + 1 ||
                element.getBoundingClientRect().right > 321,
            )
            .map((element) => element.textContent),
        )
      assert.deepEqual(overflow, [])
    })
  })
  for (const width of [320, 390]) {
    test(`${locale} ${width}: text 200% retains a reachable menu and scrollable navigation`, async () => {
      await pageAt(locale, width, async (page) => {
        await page.evaluate(
          () => (document.documentElement.style.fontSize = '200%'),
        )
        const toggle = page.locator('.menu-toggle')
        assert.ok(
          (await toggle.boundingBox()).x + (await toggle.boundingBox()).width <=
            width + 1,
        )
        assert.ok(await toggle.getAttribute('aria-label'))
        await toggle.tap()
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true')
        const clipped = await page
          .locator('.mobile-menu__link')
          .evaluateAll((elements) =>
            elements
              .filter(
                (element) => element.scrollWidth > element.clientWidth + 1,
              )
              .map((element) => element.textContent),
          )
        assert.deepEqual(clipped, [])
        await page.locator('.mobile-menu__languages a').last().focus()
        assert.ok(
          await page
            .locator('.mobile-menu')
            .evaluate(
              (element) =>
                element.scrollTop > 0 ||
                element.scrollHeight <= element.clientHeight,
            ),
        )
        await toggle.tap()
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
        await toggle.focus()
        await page.keyboard.press('Space')
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true')
        await page.keyboard.press('Escape')
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
        assert.ok(
          await toggle.evaluate(
            (element) => document.activeElement === element,
          ),
        )
      })
    })
  }
}
