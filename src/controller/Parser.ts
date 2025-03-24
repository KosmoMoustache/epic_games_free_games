import type { AxiosResponse } from 'axios'
import type {
  ParsedPromotionalOffer,
  PromotionalOffers,
  element,
  freeGamesPromotions,
} from '../types/index.ts'
import { selectKeys } from '../utils.ts'
import GameElement from './GameElement.ts'

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
    const test = (
      t: element['catalogNs']['mappings'] | element['offerMappings'],
    ) => {
      if (t != null && t.length >= 1 && t[0] && t[0].pageSlug) {
        return true
      }
    }

    if (el.productSlug) {
      return el.productSlug
    }
    if (test(el.catalogNs.mappings) && el.catalogNs.mappings[0]?.pageSlug) {
      return el.catalogNs.mappings[0].pageSlug
    }
    if (test(el.offerMappings) && el.offerMappings[0]?.pageSlug) {
      return el.offerMappings[0].pageSlug
    }
    return el.id
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
