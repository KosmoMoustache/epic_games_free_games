import assert from 'node:assert/strict'
import { suite, test } from 'node:test'
import { getUnixTimestamp } from '../../src/helpers/index.ts'

suite('Time', () => {
  test('should return the correct unix timestamp', () => {
    const r = getUnixTimestamp(new Date(2026, 7, 24, 7, 21, 24))
    assert.equal(r, 1787548884)
  })
})
