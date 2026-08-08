import type { SteamSearchRow } from '../types/api/steam.ts'

// biome-ignore lint/complexity/noStaticOnlyClass: yes
export default class SteamParser {
  static parse(html: string): SteamSearchRow[] {
    const rows: SteamSearchRow[] = []
    const row_reg =
      /<a href="https:\/\/store\.steampowered\.com\/app\/(\d+)[^"]*"([\s\S]*?)<\/a>/g
    for (const match of html.matchAll(row_reg)) {
      const appid = match[1]
      const row = match[2]
      if (appid === undefined || row === undefined) continue
      rows.push(SteamParser.parseRow(appid, row))
    }
    return rows
  }

  static parseRow(appid: string, row: string): SteamSearchRow {
    const title = row.match(/class="title">([^<]+)</)?.[1]
    const release_date = row.match(/class="search_released[^"]*">([^<]+)</)?.[1]
    const final_price = row.match(
      /class="search_price_discount_combined[^"]*" data-price-final="(\d+)"/,
    )?.[1]
    const discount = row.match(/data-discount="(\d+)"/)?.[1]
    const is_free = row.includes('discount_final_price free')

    return {
      appid,
      title: title?.trim() ?? '',
      release_date: release_date?.trim() ?? '',
      final_price: final_price !== undefined ? parseInt(final_price, 10) : null,
      discount_percent: discount !== undefined ? parseInt(discount, 10) : 0,
      is_free,
    }
  }
}
