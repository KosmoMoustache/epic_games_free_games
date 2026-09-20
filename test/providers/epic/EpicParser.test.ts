import assert from 'node:assert'
import { existsSync, readFileSync } from 'node:fs'
import { suite, test } from 'node:test'
import Parser from '../../../src/providers/epic/EpicParser.ts'
import { FreeGamesPromotionsSchema } from '../../../src/types/types.ts'

suite('EpicParser', () => {
  test('EpicParser against cached data', () => {
    const fixture = new URL('./epic_1.json', import.meta.url)
    assert.ok(existsSync(fixture), 'epic_1.json fixture exists')
    const data = JSON.parse(readFileSync(fixture, 'utf-8'))

    const parsed = FreeGamesPromotionsSchema.parse(data)
    const elements = Parser.parseEpicGames(parsed)

    assert.equal(elements.length, 12)
  })
})
