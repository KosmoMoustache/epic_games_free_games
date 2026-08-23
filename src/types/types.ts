export * from './api/epic.ts'
export * from './api/steam.ts'
export * from './table.ts'

export const Provider = {
  EPIC: 'epic',
  STEAM: 'steam',
} as const
export type ProviderName = (typeof Provider)[keyof typeof Provider]

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
export interface SQLError extends Error {
  code: string
  errcode: number
  errstr: string
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

export const PublishedStateType = {
  PUBLISHED: 1,
  PUBLISHED_UPCOMING: 2,
  NONE: 0,
}
export type PublishedStateType =
  (typeof PublishedStateType)[keyof typeof PublishedStateType]
