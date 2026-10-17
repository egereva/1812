import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import test from 'node:test'
import {
  imageDeliveryAttributes,
  imageDeliveryCatalog,
} from '../app/utils/imageDelivery.ts'

test('delivery catalog preserves approved originals and provides bounded, smaller local variants', () => {
  assert.equal(Object.keys(imageDeliveryCatalog).length, 51)
  let count = 0
  for (const [src, image] of Object.entries(imageDeliveryCatalog)) {
    const original = readFileSync(`public${src}`)
    assert.equal(
      createHash('sha256').update(original).digest('hex'),
      image.sha256,
    )
    assert.equal(original.length, image.bytes)
    assert.ok(image.width > 0 && image.height > 0)
    for (const variant of image.variants) {
      count++
      assert.ok(variant.src.startsWith('/images/delivery/'))
      assert.equal(statSync(`public${variant.src}`).size, variant.bytes)
      assert.ok(variant.bytes < image.bytes * 0.8)
      assert.ok(variant.width <= image.width && variant.width <= 1920)
      assert.ok(
        Math.abs(
          variant.height - (variant.width * image.height) / image.width,
        ) <= 0.5,
      )
      assert.equal(readFileSync(`public${variant.src}`).readUInt16BE(0), 0xffd8)
    }
  }
  assert.equal(count, 56)
})

test('responsive attributes preserve original fallback and static hosting base paths', () => {
  const [src, image] = Object.entries(imageDeliveryCatalog).find(
    ([, image]) => image.variants.length,
  )!
  const result = imageDeliveryAttributes(src, '/1812/', '100vw')
  assert.equal(result.src, `/1812${src}`)
  assert.equal(result.width, image.width)
  assert.equal(result.height, image.height)
  assert.equal(result.sizes, '100vw')
  assert.equal(
    result.srcset,
    image.variants
      .map((variant) => `/1812${variant.src} ${variant.width}w`)
      .join(', '),
  )
  const unchanged = Object.keys(imageDeliveryCatalog).find(
    (src) => !imageDeliveryCatalog[src]!.variants.length,
  )!
  assert.equal(imageDeliveryAttributes(unchanged, '/').srcset, undefined)
  assert.deepEqual(imageDeliveryAttributes('/images/unknown.jpg', '/'), {
    src: '/images/unknown.jpg',
    width: undefined,
    height: undefined,
  })
})
