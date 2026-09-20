import type { ProviderName } from './types.ts'

// Base interface for PublishedEntry database
// type PublishedEntryBase = {
//   id: number
//   provider: ProviderName
//   game_id: string
//   game_name: string
//   end_date: number
// }

// // Interface for inserting a new PublishedEntry
// export type PublishedEntryInsert = PublishedEntryBase & {
//   published: PublishedStateType
//   in_future: boolean
// }

// // Interface for selecting a PublishedEntry
// export type PublishedEntrySelect = PublishedEntryBase & {
//   published: PublishedStateType
//   in_future: 1 | 0
// }

export const PubStatus = {
  NONE: 0,
  DONE: 1,
  SOON: 2,
}

export type PubStatus = (typeof PubStatus)[keyof typeof PubStatus]

export type PubGame = {
  id: number
  provider: ProviderName
  game_id: string
  game_name: string
  end_date: number
  pub_status: PubStatus
  in_future: 1 | 0
}

export type PubGameInsert = Omit<PubGame, 'id' | 'in_future'> & {
  in_future: boolean
}

export type PubGameSelect = PubGame

export type Migrations = {
  id: number
  name: string
  applied_at: number
}
