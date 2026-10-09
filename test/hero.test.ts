import assert from 'node:assert/strict'
import test from 'node:test'
import manifest from '../docs/research/media-manifest.json' with { type: 'json' }
import { getReadyHeroSlides, heroSlides } from '../app/data/heroSlides.ts'
import { getSiteContent } from '../shared/content/index.ts'

test('Homepage historical introduction has complete bilingual paragraph parity', () => {
  const ru = getSiteContent('ru').homeIntroduction
  const en = getSiteContent('en').homeIntroduction
  for (const introduction of [ru, en]) {
    assert.ok(introduction.eyebrow.trim())
    assert.ok(introduction.title.trim())
    assert.equal(introduction.paragraphs.length, 3)
    assert.ok(introduction.paragraphs.every((paragraph) => paragraph.trim()))
  }
  assert.equal(ru.paragraphs.length, en.paragraphs.length)
})

test('all three hero slides match approved media metadata', () => {
  assert.equal(heroSlides.length, 3)
  assert.equal(new Set(heroSlides.map((slide) => slide.id)).size, 3)

  for (const slide of heroSlides) {
    const approved = manifest.items.find((item) => item.id === slide.id)
    assert.ok(approved, `Missing approved media: ${slide.id}`)
    assert.equal(approved.licenseStatus, 'approved')
    assert.equal(
      slide.publicPath,
      `/${approved.target.slice('public/'.length)}`,
    )
    assert.equal(slide.kind, approved.kind)
    assert.equal(slide.alt.ru, approved.alt)
    assert.equal(slide.caption.ru, approved.caption)
    assert.equal(slide.license, approved.license)
    assert.equal(slide.sourcePage, approved.sourcePage)
    assert.equal(`${slide.width}×${slide.height}`, approved.originalDimensions)
    assert.ok(slide.alt.en.trim())
    assert.ok(slide.caption.en.trim())
  }
})

test('hero media stays hidden until all three binaries are available', () => {
  const ids = heroSlides.map((slide) => slide.id)
  assert.equal(getReadyHeroSlides([]).length, 0)
  assert.equal(getReadyHeroSlides(ids.slice(0, 2)).length, 0)
  assert.deepEqual(getReadyHeroSlides(ids), heroSlides)
})
