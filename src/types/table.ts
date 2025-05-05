// Base interface for PublishedEntry database
interface PublishedEntryBase {
  id: number
  game_id: string
  game_name: string
  end_date: string | 0
}

// Interface for inserting a new PublishedEntry
export interface PublishedEntryInsert extends PublishedEntryBase {
  published: boolean
  in_future: boolean
}

// Interface for selecting a PublishedEntry
export interface PublishedEntrySelect extends PublishedEntryBase {
  published: 1 | 0
  in_future: 1 | 0
}
