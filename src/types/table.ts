import type { GameElementJSON } from '../controller/GameElement.js'

/**
 * @deprecated
 */
export interface PromoEntry {
  id: number
  element_id: string
  element: GameElementJSON
  isPublished: boolean
  inFuture: boolean
}

interface PublishedEntryBase {
  id: number
  game_id: string
  game_name: string
}

export interface PublishedEntryInsert extends PublishedEntryBase {
  published: boolean
  inFuture: boolean
}

export interface PublishedEntrySelect extends PublishedEntryBase {
  published: 1 | 0
  inFuture: 1 | 0
}
