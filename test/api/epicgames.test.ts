import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { suite, test } from 'node:test'

import { FreeGamesPromotionsSchema } from '../../src/types/api/epic.ts'

const api_url =
  'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions'

suite("Has EpicGames' api changed", async () => {
  test('cached response matches the reverse engineered schema', () => {
    if (!existsSync('./freeGamesPromotions.json')) return
    const data = JSON.parse(readFileSync('./freeGamesPromotions.json', 'utf-8'))
    const parsed = FreeGamesPromotionsSchema.safeParse(data)
    assert.equal(
      parsed.success,
      true,
      'cached API response should match schema',
    )
  })

  test('live API response matches the reverse engineered schema', async () => {
    const response = await fetch(
      `${api_url}?locale=fr-FR&country=FR&allowCountries=FR`,
    )
    assert.equal(
      response.ok,
      true,
      `API request failed with ${response.status}`,
    )

    const parsed = FreeGamesPromotionsSchema.safeParse(await response.json())
    assert.equal(parsed.success, true, 'live API response should match schema')
  })
})
