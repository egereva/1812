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
  for (const width of [320, 390]) {
    test(`${locale} map ${width}px: 200% text reflows filters, long links and card controls`, async () => {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        hasTouch: true,
      })
      const page = await context.newPage()
      try {
        await page.goto(origin + (locale === 'en' ? '/en' : '') + '/map')
        await page.waitForFunction(
          () => !!document.querySelector('#__nuxt')?.__vue_app__,
        )
        await page.waitForSelector('.map-marker', { timeout: 30000 })
        await page.evaluate(() => {
          document.documentElement.style.fontSize = '200%'
          document.querySelector('.map-page__index details').open = true
        })
        const fits = async () => {
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth),
            width,
          )
          const outside = await page
            .locator(
              '.map-page__layers button, .map-page__index a, .map-place-card__close, .map-place-card__link, .map-place-card__toggle',
            )
            .evaluateAll((elements) =>
              elements
                .filter((e) => {
                  const r = e.getBoundingClientRect()
                  return (
                    r.right > innerWidth + 1 ||
                    r.left < -1 ||
                    e.scrollWidth > e.clientWidth + 1
                  )
                })
                .map((e) => e.className || e.textContent),
            )
          assert.deepEqual(outside, [])
          const collisions = await page.evaluate(() => {
            const canvas = document.querySelector('.map-canvas')
            // Read provider geometry only; never alter the SDK's DOM or CSS.
            const provider = [
              ...canvas.querySelectorAll('a'),
              ...canvas.querySelectorAll('button:not(.map-marker)'),
            ].filter((element) => {
              const rect = element.getBoundingClientRect()
              return rect.width > 0 && rect.height > 0
            })
            const panels = [
              document.querySelector('.map-place-card'),
              document.querySelector('.map-member-chooser'),
            ].filter(Boolean)
            const overlap = (left, right) => {
              const a = left.getBoundingClientRect()
              const b = right.getBoundingClientRect()
              return (
                Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
                Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)
              )
            }
            return provider.some(
              (element, index) =>
                panels.some((panel) => overlap(element, panel)) ||
                provider
                  .slice(index + 1)
                  .some((other) => overlap(element, other)),
            )
          })
          assert.equal(
            collisions,
            false,
            'Provider links and application panels must not overlap',
          )
        }
        await fits()
        const layers = page.locator('.map-page__layers button')
        assert.ok(
          await layers.evaluateAll((elements) =>
            elements.every(
              (e) =>
                e.getBoundingClientRect().height <=
                4 *
                  parseFloat(
                    getComputedStyle(document.documentElement).fontSize,
                  ),
            ),
          ),
          'Filter labels must not stack into narrow columns of letters',
        )
        for (const n of [1, 2, 0]) {
          await layers.nth(n).focus()
          await page.keyboard.press('Enter')
          await page.waitForFunction((n) => {
            const buttons = document.querySelectorAll(
              '.map-page__layers button',
            )
            return buttons[n].getAttribute('aria-pressed') === 'true'
          }, n)
          assert.equal(
            await page.locator('.map-page__index li').count(),
            [13, 6, 7][n],
          )
          await fits()
        }
        await page.locator('.map-marker:not(.map-marker-group)').first().focus()
        await page.keyboard.press('Enter')
        await page.locator('.map-place-card').waitFor()
        await fits()
        await page.locator('.map-place-card__toggle').tap()
        await page.waitForFunction(
          () =>
            document
              .querySelector('.map-place-card__toggle')
              .getAttribute('aria-expanded') === 'true',
        )
        await page.waitForFunction(() =>
          document
            .querySelector('.map-place-card__toggle')
            .getAnimations({ subtree: true })
            .every((animation) => animation.playState !== 'running'),
        )
        await fits()
        await page.locator('.map-place-card__close').focus()
        await page.keyboard.press('Escape')
        await page.locator('.map-place-card').waitFor({ state: 'detached' })
        await fits()
      } finally {
        await context.close()
      }
    })
  }
