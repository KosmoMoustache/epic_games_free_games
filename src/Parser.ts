import { AxiosResponse } from 'axios';
import { freeGamesPromotions } from './types';
import GameElement from './GameElement';

export default class Parser {
  /***
   * @throws Error when data.status != 200
   */
  static AxiosResponse(
    data: AxiosResponse<freeGamesPromotions, any>
  ): GameElement[] {
    if (data.status != 200) {
      throw new Error('Error when fetching data');
    }

    const returnData = data.data.data.Catalog.searchStore.elements;

    return [new GameElement()];
  }
}
