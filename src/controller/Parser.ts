import { AxiosResponse } from 'axios';
import {
  PromotionalOffers,
  element,
  freeGamesPromotions,
  ParsedPromotionalOffer,
} from '../types';
import GameElement from './GameElement';
import { selectKeys } from '../utils';

export default class Parser {
  /***
   * @throws Error when data.status != 200
   */
  static response(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: AxiosResponse<freeGamesPromotions, any>
  ): GameElement[] {
    const returnData = data.data.data.Catalog.searchStore.elements;
    return returnData.map((el) => new GameElement(el));
  }

  static getProductSlug(el: element) {
    if (el.productSlug) return el.productSlug;
    return el.catalogNs.mappings[0].pageSlug;
  }

  static getPromotionalOffers(
    offers: PromotionalOffers[]
  ): ParsedPromotionalOffer[] {
    const arr: ParsedPromotionalOffer[] = [];
    if (offers) {
      offers.forEach((p) => {
        p.promotionalOffers.forEach((o) => {
          if (o.discountSetting.discountPercentage == 0) {
            const tmp = selectKeys(
              ['startDate', 'endDate', 'discountSetting'],
              o
            );
            arr.push({
              startDate: new Date(tmp.startDate),
              endDate: new Date(tmp.endDate),
              discountPercentage: tmp.discountSetting.discountPercentage,
              inFuture: new Date(tmp.startDate) > new Date(),
            });
          }
        });
      });
    }
    return arr;
  }
}
