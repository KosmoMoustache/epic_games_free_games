import axios from 'axios'
import Logger from '../../services/logger.ts'
import {
  type SteamAppData,
  SteamAppDetailsResponseSchema,
  type SteamSearchResponse,
  SteamSearchResponseSchema,
  type SteamSearchRow,
} from '../../types/api/steam.ts'
import SteamParser from './SteamParser.ts'

export type SteamSearchParams = {
  start?: number
  count?: number
}

export default class SteamFetcher {
  #logger = Logger.getLogger('SteamFetcher')
  #search_url = 'https://store.steampowered.com/search/'
  #search_params = {
    sort_by: '_ASC',
    hwtype: '0',
    maxprice: 'free',
    supportedlang: 'french',
    category1: '998',
    specials: '1',
    infinite: '1',
  } as const
  #headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0',
  }

  async fetchSearch(
    params: SteamSearchParams = {},
  ): Promise<SteamSearchResponse> {
    const search_params: Record<string, string> = {
      ...this.#search_params,
      start: String(params.start ?? 0),
      count: String(params.count ?? 25),
    }

    this.#logger.debug('Fetching search', this.#search_url, search_params)
    const { data } = await axios.get<unknown>(this.#search_url, {
      params: search_params,
      headers: this.#headers,
    })
    return SteamSearchResponseSchema.parse(data)
  }

  async fetchAppDetails(appid: string): Promise<SteamAppData | null> {
    this.#logger.debug('Fetching app details', appid)
    const { data } = await axios.get<unknown>(
      'https://store.steampowered.com/api/appdetails',
      {
        params: {
          appids: appid,
          cc: 'us',
          l: 'en',
        },
        headers: this.#headers,
      },
    )
    const entry = SteamAppDetailsResponseSchema.parse(data)[appid]
    return entry?.success ? entry.data : null
  }

  async fetchAllSearchPages(
    params: SteamSearchParams = {},
    max_pages = 3,
  ): Promise<SteamSearchRow[]> {
    const rows: SteamSearchRow[] = []
    for (let i = 0; i < max_pages; i++) {
      const page = await this.fetchSearch({ ...params, start: i * 25 })
      if (page.success !== 1) break
      rows.push(...SteamParser.parse(page.results_html))
      if (rows.length >= page.total_count) break
    }
    return rows
  }

  async fetchAppDetailsForRows(
    rows: SteamSearchRow[],
    concurrency = 3,
  ): Promise<Map<string, SteamAppData | null>> {
    const map = new Map<string, SteamAppData | null>()
    let index = 0
    const worker = async () => {
      while (index < rows.length) {
        const row = rows[index]
        index++
        if (row === undefined) continue
        try {
          map.set(row.appid, await this.fetchAppDetails(row.appid))
        } catch (err) {
          this.#logger.warn('Failed to fetch app details', row.appid, err)
        }
      }
    }
    await Promise.all(
      Array.from({ length: Math.min(concurrency, rows.length) }, worker),
    )
    return map
  }
}
