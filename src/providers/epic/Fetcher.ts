import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import Logger from '../../services/logger.ts'
import type {
  FreeGamesPromotions,
  FreeGamesPromotionsSchema,
} from '../../types/api/freeGamesPromotions.ts'
import type APIClient from './APIClient.ts'

export default class Fetcher {
  #logger = Logger.getLogger('APIResult')
  #api: APIClient<typeof FreeGamesPromotionsSchema>
  #use_cache: boolean
  constructor(
    api: APIClient<typeof FreeGamesPromotionsSchema>,
    use_cache = true,
  ) {
    this.#api = api
    this.#use_cache = use_cache
  }

  async get(): Promise<FreeGamesPromotions> {
    if (this.#use_cache) {
      this.#logger.warn('Using cache')
      return await this.readCache()
    }
    return await this.fetchUsingAxios()
  }

  async readCache(): Promise<FreeGamesPromotions> {
    if (existsSync('./freeGamesPromotions.json')) {
      this.#logger.debug('Cache file found')
      return JSON.parse(
        readFileSync('./freeGamesPromotions.json', 'utf-8'),
      ) as FreeGamesPromotions
    }

    this.#logger.debug('Cache file not found')
    const data = await this.fetchUsingAxios()
    writeFileSync('./freeGamesPromotions.json', JSON.stringify(data))
    return data
  }

  async fetchUsingAxios(): Promise<FreeGamesPromotions> {
    return this.#api.fetch()
  }
}
