import assert from 'node:assert/strict'
import test from 'node:test'
import { headerScrollState } from '../app/utils/headerScroll.ts'

test('header ignores jitter and changes visibility after 12px of directional travel', () => {
  let state = { y: 100, direction: 0, travel: 0, hidden: false }
  state = headerScrollState(state, 105, 92, false)
  assert.equal(state.hidden, false)
  state = headerScrollState(state, 112, 92, false)
  assert.equal(state.hidden, true)
  state = headerScrollState(state, 108, 92, false)
  assert.equal(state.hidden, true)
  state = headerScrollState(state, 100, 92, false)
  assert.equal(state.hidden, false)
})

test('page top, overscroll and navigation interaction keep the header visible', () => {
  const state = { y: 500, direction: 1, travel: 400, hidden: true }
  for (const y of [92, 0, -20])
    assert.equal(headerScrollState(state, y, 92, false).hidden, false)
  assert.equal(headerScrollState(state, 600, 92, true).hidden, false)
})
