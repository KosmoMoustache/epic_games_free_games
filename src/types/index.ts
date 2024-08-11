import type {
  PromotionalOffer,
  element,
  keyImage,
} from './freeGamesPromotions.js'

export * from './freeGamesPromotions.js'
export * from './table.js'

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
export interface SQLError extends Error {
  errno: number
  code: string
}

export type TableEntry<Parsed = false> = Parsed extends false
  ? Entry<string>
  : Entry<ParsedElement>
export interface Entry<T extends string | ParsedElement> {
  id: number
  element_id: string
  element: T
  published: boolean
  inFuture: boolean
}

export type ParsedElement = Pick<element, 'title' | 'id' | 'offerType'> &
  ParsedElementData
export interface ParsedElementData {
  pageSlug: string
  price: element['price']['totalPrice']['fmtPrice']
  promotionalOffers: ParsedPromotionalOffer[] | undefined
  upcomingPromotionalOffers: ParsedPromotionalOffer[] | undefined
  keyImages: keyImage[]
}

export type PromotionalOfferDates = Pick<
  PromotionalOffer,
  'startDate' | 'endDate'
>

export interface ParsedPromotionalOffer {
  startDate: Date
  endDate: Date
  discountPercentage: number
  inFuture: boolean
}

export enum DiscordTimestampType {
  R = 'R', // Relative
  t = 't', // Short Time
  T = 'T', // Long Time
  d = 'd', // Short Date
  D = 'D', // Long Date
  f = 'f', //'Long Date with Short Time
  F = 'F', //'Long Date with Day of the week, Short Time
}

export enum DiscordTimestampType {
  R = 'R', // Relative
  t = 't', // Short Time
  T = 'T', // Long Time
  d = 'd', // Short Date
  D = 'D', // Long Date
  f = 'f', //'Long Date with Short Time
  F = 'F', //'Long Date with Day of the week, Short Time
}
