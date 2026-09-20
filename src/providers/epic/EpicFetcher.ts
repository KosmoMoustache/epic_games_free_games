import { existsSync, readFileSync } from 'node:fs'
import { get } from '../../services/env.ts'
import {
  type FreeGamesPromotions,
  FreeGamesPromotionsSchema,
} from '../../types/types.ts'
import Fetcher from '../Fetcher.ts'

export default class EpicFetcher extends Fetcher {
  #url =
    'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions'

  #params = {
    locale: 'fr-FR',
    country: 'FR',
    allowCountries: 'FR',
  } as const

  constructor() {
    super('EpicFetcher')
  }

  async fetch(): Promise<FreeGamesPromotions> {
    if (get('USE_CACHE')) {
      this.logger.info('Using local cached data')
      return this.getLocalData()
    }
    return this.getAndParse(this.#url, FreeGamesPromotionsSchema, this.#params)
  }

  async getLocalData(): Promise<FreeGamesPromotions> {
    if (!existsSync('./freeGamesPromotions.json'))
      throw new Error('freeGamesPromotions.json file is missing')
    const data = JSON.parse(readFileSync('./freeGamesPromotions.json', 'utf-8'))

    return FreeGamesPromotionsSchema.parse(data)
  }
}
