import assert from 'node:assert/strict'
import test from 'node:test'
import { externalLinkAttributes } from '../app/utils/linkAttributes.ts'

const site = 'https://museum.example/1812/'

test('external websites, including protocol-relative URLs, receive safe new-tab attributes', () => {
  for (const href of [
    'https://commons.wikimedia.org/wiki/File:1812.jpg',
    'https://archive.example/source',
    '//library.example/source',
    'http://museum.example/source',
    'https://museum.example:8443/source',
    'https://museum.example.evil.test/source',
  ])
    assert.deepEqual(externalLinkAttributes(href, site), {
      target: '_blank',
      rel: 'noopener noreferrer',
    })
})

test('internal navigation stays in the current tab regardless of absolute URL spelling', () => {
  for (const href of [
    '/dictionary/fili',
    '/timeline/council-fili',
    '/places/kutuzov-hut',
    '/map?event=council-fili',
    '/map?place=kutuzov-hut',
    '/en/map',
    '/sources',
    '/about',
    '#main-content',
    '../timeline',
    'https://museum.example/1812/map',
    'https://MUSEUM.example:443/1812/dictionary/fili',
    '//museum.example/1812/timeline',
  ])
    assert.deepEqual(externalLinkAttributes(href, site), {})
  assert.deepEqual(
    externalLinkAttributes('mailto:archive@example.com', site),
    {},
  )
})
