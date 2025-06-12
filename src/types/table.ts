import type { PublishedStateType } from './types.ts'

// Base interface for PublishedEntry database
type PublishedEntryBase = {
  id: number
  game_id: string
  game_name: string
  end_date: number
}

// Interface for inserting a new PublishedEntry
// export interface PublishedEntryInsert extends PublishedEntryBase {
export type PublishedEntryInsert = PublishedEntryBase & {
  published: PublishedStateType
  in_future: boolean
}

// Interface for selecting a PublishedEntry
export type PublishedEntrySelect = PublishedEntryBase & {
  // export interface PublishedEntrySelect extends PublishedEntryBase {
  published: PublishedStateType
  in_future: 1 | 0
}
