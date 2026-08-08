import axios from 'axios'
import SteamParser from '../controller/steamParser.ts'
import type {
  SteamAppData,
  SteamAppDetailsResponse,
  SteamSearchResponse,
  SteamSearchRow,
} from '../types/api/steam.ts'
import Logger from './logger.ts'

export type SteamSearchParams = {
  term?: string
  specials?: boolean
  free?: boolean
  category?: string
  sort_by?: string
  start?: number
  count?: number
}

export default class SteamFetcher {
  #logger = Logger.getLogger('SteamFetcher')
  #base_url = 'https://store.steampowered.com'
  #headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0',
  }

  async fetchSearch(params: SteamSearchParams): Promise<SteamSearchResponse> {
    const search_params: Record<string, string> = {
      term: params.term ?? '',
      infinite: '1',
      cc: 'us',
      l: 'en',
      start: String(params.start ?? 0),
      count: String(params.count ?? 25),
    }
    if (params.specials) search_params.specials = '1'
    if (params.free) search_params.category1 = '998'
    if (params.category) search_params.category2 = params.category
    if (params.sort_by) search_params.sort_by = params.sort_by

    const url = `${this.#base_url}/search/results/`
    this.#logger.debug('Fetching search', url, search_params)
    const { data } = await axios.get<SteamSearchResponse>(url, {
      params: search_params,
      headers: this.#headers,
    })
    return data
  }

  async fetchAppDetails(appid: string): Promise<SteamAppData | null> {
    this.#logger.debug('Fetching app details', appid)
    const { data } = await axios.get<SteamAppDetailsResponse>(
      `${this.#base_url}/api/appdetails`,
      {
        params: {
          appids: appid,
          cc: 'us',
          l: 'en',
        },
        headers: this.#headers,
      },
    )
    const entry = data[appid]
    return entry?.success ? entry.data : null
  }

  async fetchAllSearchPages(
    params: SteamSearchParams,
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
