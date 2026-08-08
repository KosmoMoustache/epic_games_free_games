import assert from 'node:assert/strict'
import { suite, test } from 'node:test'

import SteamParser from '../../src/controller/steamParser.ts'

const free_to_play_row = `<a href="https://store.steampowered.com/app/730/CounterStrike_2/?snr=1_7_7_230_150_1"
			data-ds-appid="730" class="search_result_row ds_collapse_flag" data-search-page="1">
			<div class="responsive_search_name_combined">
				<div class="search_name ellipsis"><span class="title">Counter-Strike 2</span></div>
				<div class="search_released responsive_secondrow">Aug 21, 2012</div>
				<div class="search_price_discount_combined responsive_secondrow" data-price-final="0">
					<div class="search_discount_and_price responsive_secondrow">
						<div class="discount_block no_discount search_discount_block">
							<div class="discount_prices"><div class="discount_final_price free">Free</div></div>
						</div>
					</div>
				</div>
			</div>
</a>`

const free_to_keep_row = `
<a href="https://store.steampowered.com/app/606150/Moonlighter/?snr=1_7_7_2300_150_1"
			data-ds-appid="606150" class="search_result_row ds_collapse_flag ">
			<div class="search_name ellipsis"><span class="title">Moonlighter</span></div>
			<div class="search_released responsive_secondrow">May 29, 2018</div>
			<div class="search_price_discount_combined responsive_secondrow" data-price-final="0">
				<div class="search_discount_and_price responsive_secondrow">
					<div class="discount_block search_discount_block" data-price-final="0" data-bundlediscount="0" data-discount="100" role="link">
						<div class="discount_pct">-100%</div>
						<div class="discount_prices"><div class="discount_original_price">$19.99</div><div class="discount_final_price">$0.00</div></div>
					</div>
				</div>
			</div>
</a>`

suite('SteamParser', () => {
  test('parse a permanent free to play row', () => {
    const rows = SteamParser.parse(free_to_play_row)
    assert.equal(rows.length, 1)
    const row = rows[0]
    assert.ok(row)
    assert.equal(row.appid, '730')
    assert.equal(row.title, 'Counter-Strike 2')
    assert.equal(row.final_price, 0)
    assert.equal(row.discount_percent, 0)
    assert.equal(row.is_free, true)
    assert.equal(row.release_date, 'Aug 21, 2012')
  })

  test('parse a free to keep (100% off) row', () => {
    const rows = SteamParser.parse(free_to_keep_row)
    assert.equal(rows.length, 1)
    const row = rows[0]
    assert.ok(row)
    assert.equal(row.appid, '606150')
    assert.equal(row.title, 'Moonlighter')
    assert.equal(row.final_price, 0)
    assert.equal(row.discount_percent, 100)
    assert.equal(row.is_free, false)
  })

  test('parse multiple rows', () => {
    const html = `${free_to_play_row}${free_to_keep_row}`
    const rows = SteamParser.parse(html)
    assert.equal(rows.length, 2)
    assert.deepEqual(
      rows.map(r => r.appid),
      ['730', '606150'],
    )
  })

  test('ignore rows without appid', () => {
    const rows = SteamParser.parse(
      '<a href="https://store.steampowered.com/page/no_app"></a>',
    )
    assert.equal(rows.length, 0)
  })
})
