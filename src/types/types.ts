export * from './api/freeGamesPromotions.ts'
export * from './table.ts'

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
export interface SQLError extends Error {
  errno: number
  code: string
}

export const DiscordTimestampType = {
  R: 'R', // Relative
  t: 't', // Short Time
  T: 'T', // Long Time
  d: 'd', // Short Date
  D: 'D', // Long Date
  f: 'f', //'Long Date with Short Time
  F: 'F', //'Long Date with Day of the week, Short Time
} as const
export type DiscordTimestampType =
  (typeof DiscordTimestampType)[keyof typeof DiscordTimestampType]
