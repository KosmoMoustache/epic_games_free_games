import type { ProviderName, PublishedStateType } from './types.ts'

// Base interface for PublishedEntry database
type PublishedEntryBase = {
  id: number
  provider: ProviderName
  game_id: string
  game_name: string
  end_date: number
}

// Interface for inserting a new PublishedEntry
export type PublishedEntryInsert = PublishedEntryBase & {
  published: PublishedStateType
  in_future: boolean
}

// Interface for selecting a PublishedEntry
export type PublishedEntrySelect = PublishedEntryBase & {
  published: PublishedStateType
  in_future: 1 | 0
}
