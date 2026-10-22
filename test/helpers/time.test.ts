import assert from 'node:assert/strict'
import { suite, test } from 'node:test'
import { getEpochMillis } from '../../src/helpers/index.ts'

suite('Time', () => {
  test('should get the current epoch', () => {
    const r = getEpochMillis()
    assert.equal(r, Temporal.Now.instant().epochMilliseconds)
  })
  test('should return the correct epoch', () => {
    const r = getEpochMillis(Temporal.Instant.from('2026-08-24T07:21:24Z'))
    assert.equal(r, 1787556084000)
  })
})
