import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import test from 'node:test'

const root = '.output/public'
const catalog = JSON.parse(readFileSync('app/data/imageDelivery.json', 'utf8'))
function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`
    return entry.isDirectory()
      ? htmlFiles(path)
      : entry.name.endsWith('.html')
        ? [path]
        : []
  })
}

test('generated local image sources and responsive candidates exist with intrinsic dimensions', () => {
  let images = 0
  for (const file of htmlFiles(root)) {
    for (const [tag] of readFileSync(file, 'utf8').matchAll(/<img\b[^>]*>/g)) {
      const src = tag.match(/\bsrc="([^"]+)"/)?.[1]
      assert.ok(src?.startsWith('/images/'), `${file}: nonlocal image`)
      assert.ok(existsSync(`${root}${src}`), `${file}: missing ${src}`)
      assert.match(tag, /\bwidth="[\d.]+"/)
      assert.match(tag, /\bheight="[\d.]+"/)
      assert.match(tag, /\balt="[^"]+"/)
      const candidates = tag.match(/\bsrcset="([^"]+)"/)?.[1]
      for (const candidate of candidates?.split(', ') ?? []) {
        const [path, width] = candidate.split(' ')
        assert.ok(existsSync(`${root}${path}`), `${file}: missing ${path}`)
        assert.match(width, /^\d+w$/)
      }
      images++
    }
  }
  assert.ok(images > 100)
})

test('generated output retains every original unchanged and every selected derivative', () => {
  for (const [src, image] of Object.entries(catalog)) {
    assert.equal(
      createHash('sha256')
        .update(readFileSync(`${root}${src}`))
        .digest('hex'),
      image.sha256,
    )
    for (const variant of image.variants)
      assert.ok(existsSync(`${root}${variant.src}`))
  }
})
