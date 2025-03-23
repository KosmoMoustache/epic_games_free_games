import type { AxiosResponse } from 'axios'
import type {
  ParsedPromotionalOffer,
  PromotionalOffers,
  element,
  freeGamesPromotions,
} from '../types/index.js'
import { selectKeys } from '../utils.js'
import GameElement from './GameElement.js'

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class Parser {
  /***
   * @throws Error when data.status != 200
   */
  static response(data: AxiosResponse<freeGamesPromotions>): GameElement[] {
    const returnData = data.data.data.Catalog.searchStore.elements
    return returnData.map(el => new GameElement(el))
  }

  static getProductSlug(el: element) {
    if (el.productSlug) return el.productSlug
    return el.catalogNs.mappings[0].pageSlug
  }

  static getPromotionalOffers(
    offers: PromotionalOffers[],
  ): ParsedPromotionalOffer[] {
    const arr: ParsedPromotionalOffer[] = []
    if (offers) {
      for (const p of offers) {
        for (const o of p.promotionalOffers) {
          if (o.discountSetting.discountPercentage === 0) {
            const tmp = selectKeys(
              ['startDate', 'endDate', 'discountSetting'],
              o,
            )
            arr.push({
              startDate: new Date(tmp.startDate),
              endDate: new Date(tmp.endDate),
              discountPercentage: tmp.discountSetting.discountPercentage,
              inFuture: new Date(tmp.startDate) > new Date(),
            })
          }
        }
      }
    }
    return arr
  }
}
