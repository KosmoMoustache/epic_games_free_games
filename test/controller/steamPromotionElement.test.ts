import assert from 'node:assert/strict'
import { suite, test } from 'node:test'

import SteamPromotionElement, {
  SteamPromotionType,
} from '../../src/providers/steam/SteamPromotionElement.ts'
import type { SteamAppData, SteamSearchRow } from '../../src/types/types.ts'

const row = (partial: Partial<SteamSearchRow>): SteamSearchRow => ({
  appid: '1',
  title: 'game',
  release_date: '',
  final_price: 0,
  discount_percent: 0,
  is_free: false,
  ...partial,
})

const permanent_free_app: SteamAppData = {
  steam_appid: 1,
  type: 'game',
  name: 'game',
  is_free: true,
  price_overview: null,
}

const free_to_keep_app: SteamAppData = {
  steam_appid: 2,
  type: 'game',
  name: 'game',
  is_free: true,
  price_overview: {
    currency: 'USD',
    initial: 1999,
    final: 0,
    discount_percent: 100,
    initial_formatted: '$19.99',
    final_formatted: 'Free',
  },
}

const paid_app: SteamAppData = {
  steam_appid: 3,
  type: 'game',
  name: 'game',
  is_free: false,
  price_overview: {
    currency: 'USD',
    initial: 999,
    final: 999,
    discount_percent: 0,
    initial_formatted: '',
    final_formatted: '$9.99',
  },
}

suite('SteamPromotionElement', () => {
  test('classifies permanent free to play', () => {
    const el = new SteamPromotionElement(
      row({ is_free: true }),
      permanent_free_app,
    )
    assert.equal(el.getType(), SteamPromotionType.FREE_TO_PLAY)
  })

  test('classifies free to keep (is_free + 100% discount)', () => {
    const el = new SteamPromotionElement(
      row({ discount_percent: 100 }),
      free_to_keep_app,
    )
    assert.equal(el.getType(), SteamPromotionType.FREE_TO_KEEP)
  })

  test('classifies free weekend (paid app shown as free in search)', () => {
    const el = new SteamPromotionElement(row({ is_free: true }), paid_app)
    assert.equal(el.getType(), SteamPromotionType.FREE_WEEKEND)
  })

  test('returns none for paid game', () => {
    const el = new SteamPromotionElement(
      row({ is_free: false, final_price: 999 }),
      paid_app,
    )
    assert.equal(el.getType(), SteamPromotionType.NONE)
  })

  test('falls back to row is_free when app details missing', () => {
    const el = new SteamPromotionElement(row({ is_free: true }), null)
    assert.equal(el.getType(), SteamPromotionType.FREE_TO_PLAY)

    const el_none = new SteamPromotionElement(row({ is_free: false }), null)
    assert.equal(el_none.getType(), SteamPromotionType.NONE)
  })

  test('uses app name when available', () => {
    const el = new SteamPromotionElement(
      row({ title: 'row title' }),
      permanent_free_app,
    )
    assert.equal(el.title, 'game')
  })
})
