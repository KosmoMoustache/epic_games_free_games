import { element, keyImage, PromotionalOffer } from './freeGamesPromotions';

export * from './freeGamesPromotions';

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export interface SQLError extends Error {
  errno: number;
  code: string;
}

export type TableEntry<Parsed = false> = Parsed extends false
  ? Entry<string>
  : Entry<ParsedElement>;
export interface Entry<T extends string | ParsedElement> {
  id: number;
  element_id: string;
  element: T;
  published: boolean;
  inFuture: boolean;
}

export type ParsedElement = Pick<element, 'title' | 'id' | 'offerType'> &
  ParsedElementData;
export interface ParsedElementData {
  pageSlug: string;
  price: element['price']['totalPrice']['fmtPrice'];
  promotionalOffers: ParsedPromotionalOffer[] | undefined;
  upcomingPromotionalOffers: ParsedPromotionalOffer[] | undefined;
  keyImages: keyImage[];
}

export type PromotionalOfferDates = Pick<
  PromotionalOffer,
  'startDate' | 'endDate'
>;

export interface ParsedPromotionalOffer {
  startDate: string | Date;
  endDate: string | Date;
  discountPercentage: number;
  inFuture: boolean;
}
