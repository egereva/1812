import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'file:///C:/Users/infospice/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs'

const folder = '.playwright-mcp/place-comparison-expansion'
await mkdir(folder, { recursive: true })
const browser = await chromium.launch({
  executablePath:
    'C:/Users/infospice/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',
  headless: true,
})
try {
  for (const width of [1440, 390]) {
    for (const slug of [
      'kuntsevo-estate',
      'borodino-panorama-museum',
      'intercession-church-fili',
      'triumphal-arch',
    ]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        hasTouch: width === 390,
      })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(`http://127.0.0.1:3014/places/${slug}`, {
        waitUntil: 'networkidle',
      })
      await page.evaluate(async () => {
        await document.fonts.ready
        await Promise.all([...document.images].map((image) => image.decode()))
        document.querySelector('#nuxt-devtools-container')?.remove()
      })
      const frame = page.locator('.place-comparison__frame')
      const slider = page.getByRole('slider')
      const value = async () =>
        Number(await slider.getAttribute('aria-valuenow'))
      assert.equal(await value(), 50)
      assert.equal(await slider.getAttribute('aria-valuemin'), '0')
      assert.equal(await slider.getAttribute('aria-valuemax'), '100')
      assert.ok(
        (await slider.getAttribute('aria-label')).includes(
          {
            'kuntsevo-estate': '1910',
            'borodino-panorama-museum': '1962',
            'intercession-church-fili': '1888',
            'triumphal-arch': '1934',
          }[slug],
        ),
      )
      const metrics = await page.evaluate(() => {
        const section = document
          .querySelector('.place-detail__comparison')
          .getBoundingClientRect()
        const related = document
          .querySelector('.place-detail__related-section')
          .getBoundingClientRect()
        return {
          top: section.top + scrollY - 64,
          height: related.top - section.top + 164,
        }
      })
      await page.setViewportSize({ width, height: Math.ceil(metrics.height) })
      await page.evaluate((top) => scrollTo(0, top), metrics.top)
      await slider.focus()
      assert.equal(
        await slider.evaluate(
          (element) => getComputedStyle(element).outlineStyle,
        ),
        'solid',
      )
      for (const [key, expected] of [
        ['ArrowLeft', 45],
        ['ArrowRight', 50],
        ['Home', 0],
        ['ArrowLeft', 0],
        ['End', 100],
        ['ArrowRight', 100],
      ]) {
        await page.keyboard.press(key)
        assert.equal(await value(), expected)
      }
      assert.ok((await slider.getAttribute('aria-valuetext')).includes('100'))
      await page.keyboard.press('Home')
      const bounds = await frame.boundingBox()
      const point = (percent) => ({
        x: bounds.x + (bounds.width * percent) / 100,
        y: bounds.y + bounds.height / 2,
      })
      for (const percent of [5, 25, 50, 75, 95]) {
        const { x, y } = point(percent)
        await page.mouse.click(x, y)
        assert.equal(await value(), percent)
        for (const side of ['earlier', 'later']) {
          const layer = frame.locator('.place-comparison__layer--' + side)
          const clip = await layer.evaluate((e) => getComputedStyle(e).clipPath)
          assert.equal(
            clip,
            side === 'earlier'
              ? 'inset(0px ' + (100 - percent) + '% 0px 0px)'
              : 'inset(0px 0px 0px ' + percent + '%)',
          )
          assert.equal(
            await layer.locator('.place-comparison__date').count(),
            1,
          )
          const rect = await layer.boundingBox()
          assert.equal(rect.width, bounds.width)
          assert.equal(rect.height, bounds.height)
        }
        for (const link of await page
          .locator('.place-comparison__credits a')
          .all()) {
          assert.equal(await link.getAttribute('target'), '_blank')
          assert.equal(await link.getAttribute('rel'), 'noopener noreferrer')
        }
        await slider.evaluate((element) => element.blur())
        if (
          percent === 50 &&
          ['intercession-church-fili', 'triumphal-arch'].includes(slug)
        )
          await page.screenshot({
            path: `${folder}/ru-${width}-${slug}-${percent}.png`,
          })
      }
      const middle = point(50)
      await page.mouse.move(middle.x, middle.y)
      await page.mouse.down()
      const captured = await frame.evaluate((element) =>
        element.hasPointerCapture(1),
      )
      assert.equal(captured, true)
      await page.mouse.move(bounds.x - 20, middle.y)
      assert.equal(await value(), 0)
      await page.mouse.move(bounds.x + bounds.width + 20, middle.y)
      assert.equal(await value(), 100)
      await page.mouse.up()
      assert.equal(
        await frame.evaluate((element) => element.hasPointerCapture(1)),
        false,
      )
      await page.mouse.move(middle.x, middle.y)
      assert.equal(await value(), 100, 'No movement after pointer release')
      await page.mouse.down()
      await frame.dispatchEvent('pointercancel', { pointerId: 1 })
      assert.equal(
        await frame.evaluate((element) => element.hasPointerCapture(1)),
        false,
      )
      await page.mouse.move(point(25).x, middle.y)
      assert.equal(await value(), 50, 'No movement after pointer cancellation')
      await page.mouse.up()
      await slider.focus()
      await page.keyboard.press('End')
      // Secondary/right-click pointers must not control the comparison.
      await frame.dispatchEvent('pointerdown', {
        pointerId: 9,
        isPrimary: false,
        button: 0,
        clientX: middle.x,
      })
      await frame.dispatchEvent('pointermove', {
        pointerId: 9,
        clientX: middle.x,
      })
      assert.equal(await value(), 100)
      if (width === 390) {
        const cdp = await context.newCDPSession(page)
        const start = point(75)
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: start.x, y: start.y }],
        })
        for (const percent of [65, 50, 35]) {
          const p = point(percent)
          await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: p.x, y: p.y }],
          })
        }
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchEnd',
          touchPoints: [],
        })
        assert.equal(await value(), 35, 'Real touch drag')
        const tap = point(25)
        await page.touchscreen.tap(tap.x, tap.y)
        assert.equal(await value(), 25, 'Touch tap-to-position')
        assert.equal(
          await slider.evaluate(
            (element) => element.getBoundingClientRect().width,
          ),
          48,
        )
      }
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      )
      assert.equal(await frame.locator('img').count(), 2)
      for (const image of await frame.locator('img').all()) {
        assert.equal(
          await image.evaluate(
            (element) => getComputedStyle(element).objectFit,
          ),
          'cover',
        )
        assert.equal(
          await image.evaluate((element) => element.draggable),
          false,
        )
      }
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await slider.focus()
      await page.keyboard.press('Home')
      assert.equal(await value(), 0)
      await page.keyboard.press('End')
      assert.equal(await value(), 100)
      assert.ok(
        await slider.evaluate(
          (element) =>
            parseFloat(getComputedStyle(element).transitionDuration) < 0.001,
        ),
      )
      // Unmount while captured: native capture and component state are released.
      await page.mouse.move(middle.x, middle.y)
      await page.mouse.down()
      const oldFrame = await frame.elementHandle()
      await page
        .locator('header a[href="/dictionary"]')
        .first()
        .evaluate((element) => element.click())
      await page.waitForURL('**/dictionary')
      assert.equal(
        await oldFrame.evaluate((element) => element.hasPointerCapture(1)),
        false,
      )
      await page.mouse.up()
      assert.deepEqual(errors, [])
      console.log(
        `${width} ${slug}: keyboard, clamp, capture, touch, reduced motion, unmount and screenshots passed`,
      )
      if (width === 390) {
        await page.goto('http://127.0.0.1:3014/places/' + slug, {
          waitUntil: 'networkidle',
        })
        await page.setViewportSize({ width: 320, height: 900 })
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        )
      }
      await context.close()
    }
  }
} finally {
  await browser.close()
}
