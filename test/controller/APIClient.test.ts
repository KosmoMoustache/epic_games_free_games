import assert from 'node:assert/strict'
import { suite, test } from 'node:test'

import APIClient from '../../src/controller/APIClient.ts'

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
      true,
    )
    const response = await api.fetch()
    assert.ok(response)
    assert.strictEqual(response.status, 200)
    // TODO: test response against a schema
  })
})
