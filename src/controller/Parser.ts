import type { AxiosResponse } from 'axios'
import { selectKeys } from '../helpers/index.ts'
import type { FreeGamesPromotions } from '../types/api/freeGamesPromotions.ts'
import GameElement from './GameElement.ts'

// biome-ignore lint/complexity/noStaticOnlyClass: yes
export default class Parser {
  static parseEpicGames(data: FreeGamesPromotions): GameElement[] {
    const returnData = data.data.Catalog.searchStore.elements
    return returnData.map(el => new GameElement(el))
  }
}
