import { GameElementJSON } from '../controller/GameElement';

/**
 * @deprecated
 */
export interface PromoEntry {
  id: number;
  element_id: string;
  element: GameElementJSON;
  isPublished: boolean;
  inFuture: boolean;
}

export interface PublishedEntry {
  id: number;
  game_id: string;
  game_name: string;
  published: boolean;
  inFuture: boolean;
}
