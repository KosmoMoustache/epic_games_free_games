import {
  type SteamAppData,
  SteamAppDetailsResponseSchema,
  type SteamSearchResponse,
  SteamSearchResponseSchema,
  type SteamSearchRow,
} from '../../types/api/steam.ts'
import Fetcher from '../Fetcher.ts'
import SteamParser from './SteamParser.ts'

export type SteamSearchParams = {
  start?: number
  count?: number
}

export default class SteamFetcher extends Fetcher {
  #url = 'https://store.steampowered.com/search/'
  #params = {
    sort_by: '_ASC',
    hwtype: '0',
    maxprice: 'free',
    supportedlang: 'french',
    category1: '998',
    specials: '1',
    infinite: '1',
  } as const
  #appdetails_url = 'https://store.steampowered.com/api/appdetails'

  constructor() {
    super('SteamFetcher')
  }

  async fetchSearch(
    params: SteamSearchParams = {},
  ): Promise<SteamSearchResponse> {
    const search_params: Record<string, string> = {
      ...this.#params,
      start: String(params.start ?? 0),
      count: String(params.count ?? 25),
    }
    return this.getAndParse(this.#url, SteamSearchResponseSchema, search_params)
  }

  async fetchAppDetails(appid: string): Promise<SteamAppData | null> {
    this.logger.debug('Fetching app details', appid)
    const app = (
      await this.getAndParse(
        this.#appdetails_url,
        SteamAppDetailsResponseSchema,
        {
          appids: appid,
          cc: 'us',
          l: 'en',
        },
      )
    )[appid]
    return app?.success ? app.data : null
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
          this.logger.warn('Failed to fetch app details', row.appid, err)
        }
      }
    }
    await Promise.all(
      Array.from({ length: Math.min(concurrency, rows.length) }, worker),
    )
    return map
  }
}
