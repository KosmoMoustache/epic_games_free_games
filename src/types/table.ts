
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
