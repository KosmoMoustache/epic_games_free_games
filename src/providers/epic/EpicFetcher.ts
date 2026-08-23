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
    return this.getAndParse(this.#url, FreeGamesPromotionsSchema, this.#params)
  }
}
