import assert from 'node:assert/strict'
import { suite, test } from 'node:test'

import {
  SteamAppDetailsResponseSchema,
  SteamSearchResponseSchema,
} from '../../src/types/api/steam.ts'

const search_url =
  'https://store.steampowered.com/search/?sort_by=_ASC&hwtype=0&maxprice=free&supportedlang=french&category1=998&specials=1&infinite=1'
const appdetails_url =
  'https://store.steampowered.com/api/appdetails?appids=570&cc=fr&l=french'

suite("Has Steam's api changed", async () => {
  test('search response matches the reverse engineered schema', async () => {
    const response = await fetch(search_url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    assert.equal(
      response.ok,
      true,
      `search request failed with ${response.status}`,
    )

    const parsed = SteamSearchResponseSchema.safeParse(await response.json())
    assert.equal(
      parsed.success,
      true,
      'live Steam search response should match schema',
    )
  })

  test('app details response matches the reverse engineered schema', async () => {
    const response = await fetch(appdetails_url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    assert.equal(
      response.ok,
      true,
      `appdetails request failed with ${response.status}`,
    )

    const parsed = SteamAppDetailsResponseSchema.safeParse(
      await response.json(),
    )
    assert.equal(
      parsed.success,
      true,
      'live Steam appdetails response should match schema',
    )
  })
})
