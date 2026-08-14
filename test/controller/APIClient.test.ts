import assert from 'node:assert/strict'
import { suite, test } from 'node:test'

import APIClient from '../../src/providers/epic/APIClient.ts'
import { FreeGamesPromotionsSchema } from '../../src/types/api/freeGamesPromotions.ts'

const endpoints = {
  epic: 'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions',
  test: 'http://localhost:3000/freeGamesPromotions',
}

suite('APIClient', () => {
  test('should create API instance', () => {
    const api = new APIClient(
      endpoints.epic,
      {
        locale: 'fr-FR',
        country: 'FR',
        allowCountries: 'FR',
      },
      FreeGamesPromotionsSchema,
      true,
    )

    assert.ok(api)
  })

  test('should fetch data from epic games', async () => {
    const api = new APIClient(
      endpoints.epic,
      {
        locale: 'fr-FR',
        country: 'FR',
        allowCountries: 'FR',
      },
      FreeGamesPromotionsSchema,
      true,
    )
    const data = await api.fetch()
    assert.ok(data)
    assert.ok(data.data.Catalog.searchStore.elements.length >= 0)
  })
})
