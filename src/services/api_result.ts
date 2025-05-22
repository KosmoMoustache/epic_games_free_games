import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import type { AxiosResponse } from 'axios'
import type APIClient from '../controller/API.ts'
import type { FreeGamesPromotions } from '../types/api/freeGamesPromotions.ts'
import Logger from './logger.ts'

export default class Fetcher {
  #logger = Logger.getLogger('APIResult')
  #api: APIClient
  #use_cache: boolean
  constructor(api: APIClient, use_cache = true) {
    this.#api = api
    this.#use_cache = use_cache
  }

  async get(): Promise<FreeGamesPromotions> {
    // Cache
    if (this.#use_cache) {
      this.#logger.warn('Using cache')

      return await this.readCache()
    }

    // Fetch data
    const result = await this.fetchUsingAxios()
    if (result.status !== 200) {
      this.#logger.error('Error when fetching data', result)
      throw new Error('Error when fetching data')
    }
    return result.data
  }

  async readCache(): Promise<FreeGamesPromotions> {
    if (existsSync('./freeGamesPromotions.json')) {
      this.#logger.debug('Cache file found')
      return JSON.parse(
        readFileSync('./freeGamesPromotions.json', 'utf-8'),
      ) as FreeGamesPromotions
    }

    this.#logger.debug('Cache file not found')
    const json = (await this.fetchUsingAxios()).data
    writeFileSync('./freeGamesPromotions.json', JSON.stringify(json))
    return json
  }

  fetchUsingAxios() {
    return this.#api.fetch<FreeGamesPromotions>()
  }
}
